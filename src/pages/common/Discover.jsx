import React, { useEffect, useState, useCallback } from "react";
import FilterSidebar from "../../components/common/discover/FilterSidebar";
import ProjectCard from "../../components/common/discover/ProjectCard";
import { useTranslation } from "../../hook/useTranslation";
import { TopicService } from "../../services/topic.service";
import { GroupService } from "../../services/group.service";
import { Modal, Input, notification } from "antd";

const Discover = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [inviteState, setInviteState] = useState({ open: false, topic: null, loading: false, message: "" });
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filters, setFilters] = useState({
    major: "all",
    difficulty: "all",
    teamSize: "all",
    aiRecommended: false,
  });

  useEffect(() => {
    let mounted = true;
    const fetchTopics = async () => {
      try {
        const res = await TopicService.getTopics();
        const payload = res?.data ?? res;
        const list = Array.isArray(payload) ? payload : payload?.data ?? [];
        const mapped = (list || []).map((t) => ({
          topicId: t.topicId || t.id,
          title: t.title || t.topicName || "Untitled",
          description: t.description || "",
          domain: t.majorName || "General",
          majorId: t.majorId,
          status: t.status || "open",
            tags: [t.status || "open"],
          mentor:
            (t.mentors && t.mentors[0] && (t.mentors[0].mentorName || t.mentors[0].name)) ||
            t.createdByName ||
            "",
          mentorsRaw: t.mentors || [],
          progress: 0,
          members: (t.mentors || []).map((m) =>
            (m.mentorName || m.name || "M")
              .split(" ")
              .map((n) => n[0])
              .join("")
          ),
          createdAt: t.createdAt,
          attachedFiles: t.attachedFiles || [],
          referenceDocs: t.referenceDocs || [],
        }));
        if (mounted) {
          setProjects(mapped);
          setFilteredProjects(mapped);
        }
      } catch (err) {
        console.error(err);
        notification.error({
          message: t("failedLoadTopics") || "Failed to load topics",
        });
      } finally {
        // no-op
      }
    };
    fetchTopics();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let filtered = [...projects];

    // Filter by major
    if (filters.major !== "all") {
      filtered = filtered.filter(
        (p) => String(p.majorId) === String(filters.major)
      );
    }

    // Filter by AI recommended (placeholder logic - adjust based on your API)
    if (filters.aiRecommended) {
      // You can add your AI recommendation logic here
      // For now, just showing all when AI is enabled
    }

    setFilteredProjects(filtered);
  }, [filters, projects]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="min-h-screen bg-[#f7fafc] pt-20 md:pt-24 pb-12">
      {/*  Header section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a1a1a] mb-2">
          {t("findProjects")}
        </h1>
        <p className="text-gray-500 text-base md:text-lg">
          {t("discoverProjects")}
        </p>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[340px_1fr] gap-6 md:gap-8 px-4 sm:px-6 md:px-8">
        {/* Sidebar - Hidden on mobile, shown on large screens */}
        <div className="hidden lg:block flex-shrink-0">
          <FilterSidebar onFilterChange={handleFilterChange} />
        </div>

        {/* Main content */}
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Search */}
          <div className="flex items-center">
            <input
              type="text"
              placeholder={t("searchProjects")}
              className="w-full px-4 py-2.5 md:py-2 text-sm md:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Projects */}
          <div className="flex flex-col gap-4">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project, i) => (
                <ProjectCard
                key={i}
                project={project}
                onSelectTopic={(p) =>
                  setInviteState({ open: true, topic: p, loading: false, message: "" })
                }
              />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-24 h-24 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {t("noProjectsFound") || "No Projects Found"}
                </h3>
                <p className="text-gray-500 text-center max-w-md">
                  {t("noProjectsDescription") ||
                    "No projects match your current filters. Try adjusting your filter criteria."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal
        open={inviteState.open}
        title={t("inviteMentor") || "Mời mentor"}
        onCancel={() => setInviteState({ open: false, topic: null, loading: false, message: "" })}
        onOk={async () => {
          const { topic } = inviteState;
          if (!topic) return;
          try {
            setInviteState((s) => ({ ...s, loading: true }));
            // Get user's groups
            const myGroupsRes = await GroupService.getMyGroups();
            const myGroups = myGroupsRes?.data || [];
            if (!myGroups.length) {
              notification.error({
                message: t("noGroupFound"),
                description: t("pleaseCreateOrJoinGroup"),
              });
              return;
            }
            const group = myGroups[0];
            const groupId = group.id || group.groupId;

            // Step 1: Assign topic to group
            await GroupService.assignTopic(groupId, topic.topicId);

            // Step 2: Get mentor ID from topic's mentors list (use first mentor)
            const mentorCandidate = (topic.mentorsRaw || [])[0];
            if (!mentorCandidate) {
              notification.warning({
                message: t("noMentorFound") || "Không tìm thấy mentor",
                description: t("topicHasNoMentor") || "Topic này không có mentor gắn kèm",
              });
              setInviteState({ open: false, topic: null, loading: false, message: "" });
              return;
            }

            const mentorUserId = mentorCandidate.mentorId;

            // Step 3: Send invite to mentor with message
            await GroupService.inviteMentor(groupId, {
              mentorUserId,
              message: inviteState.message,
            });

            notification.success({
              message: t("topicSelected") || "Đã chọn topic",
              description:
                (t("successfullySelected") || "Đã chọn") +
                ` "${topic.title}" ` +
                (t("andSentMentorInvite") || "và đã gửi thư mời cho mentor"),
            });
            setInviteState({ open: false, topic: null, loading: false, message: "" });
          } catch (err) {
            console.error("Failed to select topic and invite mentor:", err);
            notification.error({
              message: t("failedToSelectTopic") || "Thất bại",
              description: err?.response?.data?.message || t("pleaseTryAgain"),
            });
            setInviteState({ open: false, topic: null, loading: false, message: "" });
          } finally {
            setInviteState((s) => ({ ...s, loading: false }));
          }
        }}
        confirmLoading={inviteState.loading}
      >
        <p className="text-sm mb-2">
          {t("sendingInviteForTopic") || "Gửi lời mời mentor cho topic"}: <strong>{inviteState.topic?.title}</strong>
        </p>
        <Input.TextArea
          rows={4}
          placeholder={t("enterMessage") || "Nhập lời nhắn đến mentor"}
          value={inviteState.message}
          onChange={(e) =>
            setInviteState((s) => ({ ...s, message: e.target.value }))
          }
        />
      </Modal>
    </div>
  );
};

export default Discover;
