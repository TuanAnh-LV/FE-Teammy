import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import FilterSidebar from "../../components/common/discover/FilterSidebar";
import ProjectCard from "../../components/common/discover/ProjectCard";
import TopicDetailModal from "../../components/common/discover/TopicDetailModal";
import { useTranslation } from "../../hook/useTranslation";
import { TopicService } from "../../services/topic.service";
import { GroupService } from "../../services/group.service";
import { AuthService } from "../../services/auth.service";
import { AiService } from "../../services/ai.service";
import { Modal, Input, notification } from "antd";
import { Sparkles } from "lucide-react";

const Discover = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [aiSuggestedTopics, setAiSuggestedTopics] = useState([]);
  const [membership, setMembership] = useState({
    hasGroup: false,
    groupId: null,
    status: null,
  });
  const [myGroupDetails, setMyGroupDetails] = useState(null);
  const [inviteState, setInviteState] = useState({
    open: false,
    topic: null,
    loading: false,
    message: "",
  });
  const [detailModalState, setDetailModalState] = useState({
    open: false,
    topic: null,
    loading: false,
  });
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filters, setFilters] = useState({
    major: "all",
    aiRecommended: false,
  });

  const aiSuggestionsFetchedRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const fetchMembership = async () => {
      try {
        const res = await AuthService.getMembership();
        if (mounted) {
          const groupId = res?.data?.groupId || null;
          const hasGroup = !!res?.data?.hasGroup;
          const status = res?.data?.status || null;
          setMembership({
            hasGroup,
            groupId,
            status,
          });

          if (groupId) {
            try {
              const groupRes = await GroupService.getGroupDetail(groupId);
              setMyGroupDetails(groupRes?.data || null);
            } catch {
              setMyGroupDetails(null);
            }
          }
        }
      } catch (err) {
        notification.error({
          message: t("failedToFetchMembership") || "Failed to fetch membership",
          description:
            err?.response?.data?.message ||
            t("pleaseTryAgain") ||
            "Please try again",
        });
      }
    };
    fetchMembership();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!membership.groupId) {
      setAiSuggestedTopics([]);
      aiSuggestionsFetchedRef.current = null;
      return;
    }

    const hasTopicId =
      myGroupDetails?.topicId && myGroupDetails.topicId.trim() !== "";
    const hasTopicObject =
      myGroupDetails?.topic?.topicId &&
      myGroupDetails.topic.topicId.trim() !== "";

    if (hasTopicId || hasTopicObject) {
      setAiSuggestedTopics([]);
      aiSuggestionsFetchedRef.current = null;
      return;
    }

    if (aiSuggestionsFetchedRef.current === membership.groupId) {
      return;
    }

    let mounted = true;
    const fetchAISuggestions = async () => {
      try {
        const aiResponse = await AiService.getTopicSuggestions({
          groupId: membership.groupId,
          limit: 5,
        });

        if (
          !aiResponse ||
          aiResponse.success === false ||
          !aiResponse.data.data
        ) {
          if (mounted) setAiSuggestedTopics([]);
          return;
        }

        let suggestions = Array.isArray(aiResponse.data.data)
          ? aiResponse.data.data
          : [];

        if (mounted && suggestions.length > 0) {
          const mapped = suggestions.map((item) => {
            const detail = item.detail || {};
            const mentors = Array.isArray(detail.mentors) ? detail.mentors : [];

            return {
              topicId: item.topicId || detail.topicId,
              title: item.title || detail.title || "Untitled",
              description: item.description || detail.description || "",
              domain: detail.majorName || "General",
              majorId: detail.majorId,
              status: detail.status || "open",
              tags: [detail.status || "open"],
              mentor:
                mentors.length > 0
                  ? mentors
                      .map((m) => m.mentorName || m.name || m.mentorEmail)
                      .join(", ")
                  : detail.createdByName || "",

              mentorsRaw: mentors,

              progress: 0,
              members: mentors.map((m) =>
                (m.mentorName || m.name || "M")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              ),
              createdAt: detail.createdAt,
              attachedFiles: detail.attachedFiles || [],
              referenceDocs: detail.referenceDocs || [],
              registrationFile:
                detail.registrationFile || item.registrationFile || null,
              score: item.score || 0,
              canTakeMore: item.canTakeMore,
              matchingSkills: item.matchingSkills || [],
              topicSkills: item.topicSkills || detail.skills || [],
              isAISuggestion: true,
            };
          });
          setAiSuggestedTopics(mapped);
          aiSuggestionsFetchedRef.current = membership.groupId;
          notification.info({
            message: t("aiSuggestionsAvailable") || "AI Suggestions Available",
            description: `Found ${mapped.length} recommended topics for your group`,
            placement: "topRight",
            duration: 3,
          });
        } else {
          if (mounted) setAiSuggestedTopics([]);
        }
      } catch (err) {
        if (mounted) setAiSuggestedTopics([]);
      }
    };

    fetchAISuggestions();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membership.groupId, myGroupDetails]);

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
            (t.mentors &&
              t.mentors[0] &&
              (t.mentors[0].mentorName || t.mentors[0].name)) ||
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
          registrationFile: t.registrationFile || null,
          topicSkills: t.skills || [],
        }));
        if (mounted) {
          setProjects(mapped);
          setFilteredProjects(mapped);
        }
      } catch {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aiTopicIds = useMemo(() => {
    return new Set(aiSuggestedTopics.map((t) => t.topicId));
  }, [aiSuggestedTopics]);

  useEffect(() => {
    let filtered = [...projects];

    filtered = filtered.filter((p) => !aiTopicIds.has(p.topicId));

    if (filters.major !== "all") {
      filtered = filtered.filter(
        (p) => String(p.majorId) === String(filters.major)
      );
    }

    setFilteredProjects(filtered);
  }, [filters, projects, aiTopicIds]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleViewTopicDetail = useCallback(async (topic) => {
    if (!topic?.topicId) return;

    setDetailModalState({ open: true, topic, loading: true });

    try {
      // Fetch full topic details from API
      const res = await TopicService.getTopicDetail(topic.topicId);
      const fullTopic = res?.data || res;

      if (fullTopic) {
        // Merge with existing topic data to preserve AI-specific fields
        const mergedTopic = {
          ...topic,
          ...fullTopic,
          registrationFile:
            fullTopic.registrationFile || topic.registrationFile,
          topicSkills: fullTopic.skills || topic.topicSkills,
          isAISuggestion: topic.isAISuggestion,
          score: topic.score,
          matchingSkills: topic.matchingSkills,
        };

        setDetailModalState({ open: true, topic: mergedTopic, loading: false });
      } else {
        setDetailModalState({ open: true, topic, loading: false });
      }
    } catch (err) {
      setDetailModalState({ open: true, topic, loading: false });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f7fafc] pt-20 md:pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a1a1a] mb-2">
          {t("findProjects")}
        </h1>
        <p className="text-gray-500 text-base md:text-lg">
          {t("discoverProjects")}
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[340px_1fr] gap-6 md:gap-8 px-4 sm:px-6 md:px-8">
        <div className="hidden lg:block flex-shrink-0">
          <FilterSidebar onFilterChange={handleFilterChange} />
        </div>

        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex flex-col gap-4">
            {membership.hasGroup && aiSuggestedTopics.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">
                    {t("aiRecommendedTopics") || "AI Recommended Topics"}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-600 text-white">
                    {aiSuggestedTopics.length}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {t("aiTopicSuggestionsDesc") ||
                    "Topics matched to your group's interests and skills"}
                </p>
                <div className="flex flex-col gap-4">
                  {aiSuggestedTopics.map((project, i) => (
                    <div key={`ai-${i}`} className="relative">
                      <div className="absolute -top-3 -left-3 flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-lg z-10">
                        <Sparkles className="w-3.5 h-3.5 fill-white" />
                        AI Recommended
                      </div>

                      <div className="absolute -top-3 -right-3 flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg z-10">
                        <svg
                          className="w-3.5 h-3.5 fill-white"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {project.score}% Match
                      </div>

                      <ProjectCard
                        project={project}
                        onSelectTopic={(p) =>
                          setInviteState({
                            open: true,
                            topic: p,
                            loading: false,
                            message: "",
                          })
                        }
                        onViewDetail={handleViewTopicDetail}
                        hasGroupTopic={
                          !!(
                            myGroupDetails?.topicId ||
                            myGroupDetails?.topic?.topicId
                          )
                        }
                        isAISuggestion={true}
                        membership={membership}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredProjects.length > 0 ? (
              <>
                {membership.hasGroup && aiSuggestedTopics.length > 0 && (
                  <div className="mt-8 mb-4">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">
                      {t("allTopics") || "All Available Topics"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {t("browseAllTopics") ||
                        "Browse all topics from the catalog"}
                    </p>
                  </div>
                )}

                {filteredProjects.map((project, i) => (
                  <ProjectCard
                    key={i}
                    project={project}
                    onSelectTopic={(p) =>
                      setInviteState({
                        open: true,
                        topic: p,
                        loading: false,
                        message: "",
                      })
                    }
                    onViewDetail={handleViewTopicDetail}
                    hasGroupTopic={
                      !!(
                        myGroupDetails?.topicId ||
                        myGroupDetails?.topic?.topicId
                      )
                    }
                    membership={membership}
                  />
                ))}
              </>
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
      <TopicDetailModal
        isOpen={detailModalState.open}
        onClose={() =>
          setDetailModalState({ open: false, topic: null, loading: false })
        }
        topic={detailModalState.topic}
        onSelectTopic={(p) => {
          setDetailModalState({ open: false, topic: null, loading: false });
          setInviteState({
            open: true,
            topic: p,
            loading: false,
            message: "",
          });
        }}
        loading={inviteState.loading}
        detailLoading={detailModalState.loading}
        hasGroupTopic={
          !!(myGroupDetails?.topicId || myGroupDetails?.topic?.topicId)
        }
        isAISuggestion={detailModalState.topic?.isAISuggestion}
        membership={membership}
      />
      <Modal
        open={inviteState.open}
        title={t("inviteMentor") || "Mời mentor"}
        onCancel={() =>
          setInviteState({
            open: false,
            topic: null,
            loading: false,
            message: "",
          })
        }
        onOk={async () => {
          const { topic } = inviteState;
          if (!topic) return;

          // Check if user is leader
          const membershipRes = await AuthService.getMembership();
          const userRole = membershipRes?.data?.status;

          if (userRole !== "leader") {
            notification.error({
              message: t("notAuthorized") || "Not Authorized",
              description:
                t("onlyLeaderCanSelectTopic") ||
                "Only group leader can select a topic for the group.",
            });
            setInviteState({
              open: false,
              topic: null,
              loading: false,
              message: "",
            });
            return;
          }

          try {
            setInviteState((s) => ({ ...s, loading: true }));
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

            await GroupService.assignTopic(groupId, topic.topicId);
            const mentorCandidate = (topic.mentorsRaw || [])[0];
            if (!mentorCandidate) {
              notification.warning({
                message: t("noMentorFound") || "Không tìm thấy mentor",
                description:
                  t("topicHasNoMentor") || "Topic này không có mentor gắn kèm",
              });
              setInviteState({
                open: false,
                topic: null,
                loading: false,
                message: "",
              });
              return;
            }

            const mentorUserId = mentorCandidate.mentorId;
            await GroupService.inviteMentor(groupId, {
              mentorUserId,
              topicId: topic.topicId || topic.id,
              message: inviteState.message,
            });

            notification.success({
              message: t("topicSelected") || "Đã chọn topic",
              description:
                (t("successfullySelected") || "Đã chọn") +
                ` "${topic.title}" ` +
                (t("andSentMentorInvite") || "và đã gửi thư mời cho mentor"),
            });
            setInviteState({
              open: false,
              topic: null,
              loading: false,
              message: "",
            });
          } catch (err) {
            const statusCode = err?.response?.status;
            const errorMessage = err?.response?.data?.message || "";

            let errorTitle = t("failedToSelectTopic") || "Thất bại";
            let errorDesc = errorMessage || t("pleaseTryAgain");

            if (statusCode === 403) {
              errorTitle = t("notAuthorized") || "Không có quyền";
              errorDesc =
                t("onlyLeaderCanSelectTopic") ||
                "Chỉ trưởng nhóm mới có thể chọn topic cho nhóm.";
            } else if (statusCode === 409) {
              errorTitle =
                t("groupIsActive") ||
                "Cannot change topic when group is active";
              errorDesc =
                t("groupActiveDescription") ||
                "The group is currently active and cannot change topics. Please contact the mentor or administrator for assistance.";
            }

            notification.error({
              message: errorTitle,
              description: errorDesc,
            });
            setInviteState({
              open: false,
              topic: null,
              loading: false,
              message: "",
            });
          } finally {
            setInviteState((s) => ({ ...s, loading: false }));
          }
        }}
        okButtonProps={{
          className: "!bg-[#FF7A00] hover:!opacity-90 !text-white !border-none",
        }}
        cancelButtonProps={{
          className:
            "!border-gray-300 hover:!border-orange-400 hover:!text-orange-400 transition-all",
        }}
        confirmLoading={inviteState.loading}
      >
        <p className="text-sm mb-2">
          {t("sendingInviteForTopic") || "Gửi lời mời mentor cho topic"}:{" "}
          <strong>{inviteState.topic?.title}</strong>
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
