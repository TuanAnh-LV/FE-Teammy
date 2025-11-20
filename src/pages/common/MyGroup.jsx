import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "../../hook/useTranslation";
import { useAuth } from "../../context/AuthContext";
import { GroupService } from "../../services/group.service";
import { BoardService } from "../../services/board.service";
import InfoCard from "../../components/common/my-group/InfoCard";
import DescriptionCard from "../../components/common/my-group/DescriptionCard";
import MentorCard from "../../components/common/my-group/MentorCard";
import RecentActivityCard from "../../components/common/my-group/RecentActivityCard";
import MembersList from "../../components/common/my-group/MembersList";
import AddMemberModal from "../../components/common/my-group/AddMemberModal";
import EditGroupModal from "../../components/common/my-group/EditGroupModal";
import SelectTopicModal from "../../components/common/my-group/SelectTopicModal";
import LoadingState from "../../components/common/LoadingState";
import { notification, Modal } from "antd";
import { calculateProgressFromTasks } from "../../utils/group.utils";

export default function MyGroup() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userInfo } = useAuth();

  const [group, setGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectTopicOpen, setSelectTopicOpen] = useState(false);
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
        const [detailRes, membersRes, boardRes] = await Promise.allSettled([
          GroupService.getGroupDetail(id),
          GroupService.getListMembers(id),
          BoardService.getBoard(id),
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

          const memberId =
            m.id || m.memberId || m.userId || m.userID || m.accountId || "";

          return {
            id: memberId,
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

        const boardData = boardRes.status === "fulfilled" ? boardRes.value?.data : null;
        const calculatedProgress = calculateProgressFromTasks(boardData);

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
          progress: calculatedProgress,
          mentor: d.mentor,
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
        setBoard(boardData);
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

  const handleSelectTopic = async (topicId, topicData) => {
    if (!group || !topicId) return;
    console.log("Assigning topic:", { topicId, topicData });
    
    try {
      await GroupService.assignTopic(group.id, topicId);
      
      const topicName = topicData?.name || topicData?.title || "Selected Topic";
      console.log("Topic assigned successfully, updating UI with:", topicName);
      
      // Update local state immediately for instant feedback
      setGroup((prev) => {
        const updated = prev
          ? {
              ...prev,
              topicId: topicId,
              topicName: topicName,
            }
          : prev;
        console.log("Updated group state:", updated);
        return updated;
      });
      
      notification.success({
        message: t("topicAssignedSuccess") || "Topic assigned successfully.",
      });
      
      setSelectTopicOpen(false);
      
      // Reload group detail to get latest data from server
      setTimeout(async () => {
        try {
          const res = await GroupService.getGroupDetail(group.id);
          const d = res?.data || {};
          console.log("Reloaded group data:", d);
          
          setGroup((prev) =>
            prev
              ? {
                  ...prev,
                  topicId: d.topicId || d.topic?.id || prev.topicId,
                  topicName: d.topicName || d.topic?.title || d.topic?.name || prev.topicName,
                }
              : prev
          );
        } catch (reloadErr) {
          console.error("Failed to reload group data:", reloadErr);
        }
      }, 500);
    } catch (err) {
      console.error("Error assigning topic:", err);
      notification.error({
        message: t("error") || "Failed to assign topic.",
      });
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
              onSelectTopic={
                group.canEdit ? () => setSelectTopicOpen(true) : undefined
              }
              onEdit={group.canEdit ? () => setEditOpen(true) : null}
            />
          )}

          <div className="mx-auto flex w-full max-w-[79rem] flex-col gap-6 lg:flex-row">
            <div className="flex-1 space-y-6 pt-10">
              {group && (
                <>
                  <DescriptionCard description={group.description} />
                  <RecentActivityCard 
                    items={board?.columns?.flatMap(col => col.tasks || []) || []}
                  />
                </>
              )}
            </div>
            <div className="w-full max-w-sm space-y-6 relative pt-10">
              {group && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/workspace?groupId=${group.id || id}`)
                  }
                  className="absolute -top-3 right-0 inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-600 bg-white hover:bg-blue-50 shadow-sm"
                >
                  {t("openWorkspace") || "Open Workspace"}
                </button>
              )}
              <MembersList
                members={groupMembers}
                title={t("teamMembers") || "Team Members"}
                inviteLabel={t("inviteMembers") || "Invite Members"}
                emptyLabel={t("noMembersYet") || "No members yet"}
                onInvite={
                  group?.canEdit ? () => setShowModal(true) : undefined
                }
                canEdit={group?.canEdit}
                currentUserEmail={userInfo?.email}
                onKick={async (member) => {
                  if (!member || !member.id) {
                    notification.error({ message: t("error") || "Invalid member" });
                    return;
                  }
                  if (!group?.id) {
                    notification.error({ message: t("error") || "Group id missing" });
                    return;
                  }

                  Modal.confirm({
                    title: t("confirmKick") || "Remove Member",
                    content: t("confirmKickMessage") || `Are you sure you want to remove ${member.name || member.email} from this group?`,
                    okText: t("remove") || "Remove",
                    cancelText: t("cancel") || "Cancel",
                    okButtonProps: { danger: true },
                    onOk: async () => {
                      // Check if group is active before kicking member
                      if (group.statusText?.toLowerCase() === "active" || group.status?.toLowerCase() === "active") {
                        notification.error({
                          message: t("cannotKickFromActiveGroup") || "Cannot remove member from active group",
                          description: t("cannotKickFromActiveGroupDesc") || "You cannot remove members from a group that is currently active. Please wait until the group status changes or contact your mentor.",
                          duration: 5,
                        });
                        return;
                      }

                      try {
                        await GroupService.kickMember(group.id, member.id);
                        setGroupMembers((prev) => prev.filter((m) => m.id !== member.id));
                        notification.success({ message: t("removeSuccess") || "Member removed successfully" });
                      } catch (err) {
                        console.error(err);
                        notification.error({ message: t("error") || "Failed to remove member" });
                      }
                    },
                  });
                }}
              />
              {group && (
                <MentorCard 
                  name={group.mentor?.displayName || t("noMentorAssigned") || "No mentor assigned"}
                  email={group.mentor?.email || ""}
                  label={t("projectMentor")} 
                />
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
        <SelectTopicModal
          t={t}
          open={selectTopicOpen}
          currentTopicId={group?.topicId}
          onClose={() => setSelectTopicOpen(false)}
          onSelect={handleSelectTopic}
        />
      </div>
    </div>
  );
}




