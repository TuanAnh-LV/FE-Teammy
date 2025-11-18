import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "../../hook/useTranslation";
import { useAuth } from "../../context/AuthContext";
import { GroupService } from "../../services/group.service";
import InfoCard from "../../components/common/my-group/InfoCard";
import DescriptionCard from "../../components/common/my-group/DescriptionCard";
import MentorCard from "../../components/common/my-group/MentorCard";
import RecentActivityCard from "../../components/common/my-group/RecentActivityCard";
import MembersList from "../../components/common/my-group/MembersList";
import AddMemberModal from "../../components/common/my-group/AddMemberModal";
import EditGroupModal from "../../components/common/my-group/EditGroupModal";
import LoadingState from "../../components/common/LoadingState";
import { notification } from "antd";

export default function MyGroup() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userInfo } = useAuth();

  const [group, setGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    maxMembers: 5,
    majorId: "",
    topicId: "",
  });
  const [editErrors, setEditErrors] = useState({});
  const loadedGroupIdRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    if (loadedGroupIdRef.current === id) return;
    loadedGroupIdRef.current = id;
    const loadData = async () => {
      try {
        setLoading(true);
        const [detailRes, membersRes] = await Promise.allSettled([
          GroupService.getGroupDetail(id),
          GroupService.getListMembers(id),
        ]);

        const d = detailRes.status === "fulfilled" ? detailRes.value.data : {};
        const semesterInfo = d.semester || {};
        const rawStartDate = semesterInfo.startDate || d.startDate;
        const rawEndDate = semesterInfo.endDate || d.endDate;
        const season =
          typeof semesterInfo.season === "string"
            ? semesterInfo.season.trim()
            : semesterInfo.season
            ? String(semesterInfo.season)
            : "";
        const formattedSeason = season
          ? season.charAt(0).toUpperCase() + season.slice(1)
          : "";
        const semesterLabel = [formattedSeason, semesterInfo.year].filter(Boolean).join(" ");

        const members =
          membersRes.status === "fulfilled" && Array.isArray(membersRes.value?.data)
            ? membersRes.value.data
            : [];

        const normalizedMembers = members.map((m) => {
          const email = m.email || "";
          const normalizedEmail = email.toLowerCase();
          const currentEmail = (userInfo?.email || "").toLowerCase();

          return {
            name: m.displayName || m.name || "",
            email,
            role: m.role || m.status || "",
            joinedAt: m.joinedAt,
            avatarUrl:
              m.avatarUrl ||
              m.avatarURL ||
              m.photoURL ||
              m.photoUrl ||
              (currentEmail && normalizedEmail === currentEmail ? userInfo?.photoURL : ""),
          };
        });

        const currentEmail = (userInfo?.email || "").toLowerCase();
        const detailRole = (d.role || "").toLowerCase();
        const leaderFromMembers = normalizedMembers.some(
          (member) =>
            (member.email || "").toLowerCase() === currentEmail &&
            (member.role || "").toLowerCase() === "leader"
        );

        setGroup({
          id: d.id || id,
          title: d.name || "",
          field:
            d.field ||
            d.major?.name ||
            d.major?.majorName ||
            (typeof d.major === "string" ? d.major : "") ||
            "",
          description: d.description || "",
          start: rawStartDate ? rawStartDate.slice(0, 10) : "",
          end: rawEndDate ? rawEndDate.slice(0, 10) : "",
          semester: semesterLabel,
          progress: Math.min(100, Math.max(0, Number(d.progress) || 0)),
          mentor: d.mentorName || "",
          statusText: d.status || "",
          maxMembers: Number(d.maxMembers || d.capacity || 5),
          majorId:
            d.majorId ||
            d.major?.id ||
            d.major?.majorId ||
            d.majorID ||
            "",
          topicId: d.topicId || d.topic?.id || "",
          topicName:
            d.topicName ||
            d.topic?.title ||
            d.topic?.name ||
            "",
          canEdit: detailRole === "leader" || leaderFromMembers,
        });

        setGroupMembers(normalizedMembers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, userInfo]);

  useEffect(() => {
    if (group) {
      setEditForm({
        name: group.title || "",
        description: group.description || "",
        maxMembers: group.maxMembers || groupMembers.length || 5,
        majorId: group.majorId || "",
        topicId: group.topicId || "",
      });
    }
  }, [group, groupMembers.length]);

  const handleAddMember = (user) => {
    if (!user || !user.email) {
      notification.warning({
        message: t("pleaseSelectUser") || "Please select a user first",
      });
      return;
    }
    if (groupMembers.some((m) => m.email === user.email)) {
      notification.info({
        message: t("userAlreadyInGroup") || "This user is already in the group.",
      });
      return;
    }
    setGroupMembers((prev) => [...prev, user]);
    setShowModal(false);
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editForm.name.trim()) {
      errors.name = t("groupName") || "Group name is required";
    }
    const max = Number(editForm.maxMembers);
    if (!max || max < groupMembers.length) {
      errors.maxMembers =
        t("maxMembersValidation") ||
        "Max members must be at least current member count.";
    }
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitEdit = async (e) => {
    e?.preventDefault();
    if (!group || !validateEditForm()) return;
    try {
      setEditSubmitting(true);
      const payload = {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        maxMembers: Number(editForm.maxMembers),
      };
      if (editForm.majorId.trim()) payload.majorId = editForm.majorId.trim();
      if (editForm.topicId.trim()) payload.topicId = editForm.topicId.trim();
      await GroupService.updateGroup(group.id, payload);
      notification.success({
        message: t("updateSuccess") || "Group updated successfully.",
      });
      setGroup((prev) =>
        prev
          ? {
              ...prev,
              title: payload.name,
              description: payload.description,
              maxMembers: payload.maxMembers,
              majorId: payload.majorId ?? prev.majorId,
              topicId: payload.topicId ?? prev.topicId,
            }
          : prev
      );
      setEditOpen(false);
    } catch (err) {
      console.error(err);
      notification.error({
        message: t("error") || "Failed to update group.",
      });
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading) {
    return (
      <LoadingState
        message={t("loading") || "Loading..."}
        subtext={t("fetchingGroupData") || "Fetching your group workspace."}
      />
    );
  }

  return (
    <div className="relative bg-[#f7fafc]">
      <div className="relative z-10 min-h-screen flex flex-col items-center pt-4 xl:pt-8 pb-24">
        <div className="w-full flex flex-col gap-6">
          {group && (
            <InfoCard
              group={group}
              memberCount={groupMembers.length}
              onBack={() => navigate(-1)}
              onEdit={group.canEdit ? () => setEditOpen(true) : null}
            />
          )}

          <div className="mx-auto flex w-full max-w-[79rem] flex-col gap-6 lg:flex-row">
            <div className="flex-1 space-y-6">
              {group && (
                <>
                  <DescriptionCard description={group.description} />
                  <RecentActivityCard />
                </>
              )}
            </div>
            <div className="w-full max-w-sm space-y-6">
              <MembersList
                members={groupMembers}
                title={t("teamMembers") || "Team Members"}
                inviteLabel={t("inviteMembers") || "Invite Members"}
                emptyLabel={t("noMembersYet") || "No members yet"}
                onInvite={
                  group?.canEdit ? () => setShowModal(true) : undefined
                }
              />
              {group && (
                <button
                  type="button"
                  onClick={() => navigate(`/workspace?groupId=${group.id || id}`)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                >
                  M? Workspace
                </button>
              )}
              {group && (
                <MentorCard name={group.mentor} label={t("projectMentor")} />
              )}
            </div>
          </div>
        </div>

        <AddMemberModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onAdd={handleAddMember}
          t={t}
        />
        <EditGroupModal
          t={t}
          open={editOpen}
          submitting={editSubmitting}
          form={editForm}
          errors={editErrors}
          memberCount={groupMembers.length}
          onClose={() => {
            if (!editSubmitting) {
              setEditOpen(false);
              setEditErrors({});
            }
          }}
          onChange={handleEditChange}
          onSubmit={handleSubmitEdit}
        />
      </div>
    </div>
  );
}




