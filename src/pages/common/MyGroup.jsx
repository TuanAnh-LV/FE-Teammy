import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "../../hook/useTranslation";
import { useAuth } from "../../context/AuthContext";
import { GroupService } from "../../services/group.service";
import InfoCard from "../../components/common/my-group/InfoCard";
import DescriptionCard from "../../components/common/my-group/DescriptionCard";
import ProgressCard from "../../components/common/my-group/ProgressCard";
import MentorCard from "../../components/common/my-group/MentorCard";
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
          field: d.field || "",
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
      <div className="relative z-10 min-h-screen flex flex-col items-center pt-20 xl:pt-32 pb-28">
        {/* Header */}
        <div className="w-full max-w-7xl px-6 flex items-center justify-between mb-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            {t("back")}
          </button>
          <div className="flex gap-3">
            {group?.canEdit && (
              <button
                onClick={() => setEditOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                {t("editGroup") || "Edit group"}
              </button>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#FF7A00] text-white px-4 py-2 rounded-lg transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-orange-100"
            >
              {t("addMember")}
            </button>
          </div>
        </div>

        {/* Layout */}
        <div className="w-full max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-10 gap-8">
          <div className="col-span-7 flex flex-col gap-6">
            {group && (
              <>
                <InfoCard group={group} />
                <DescriptionCard description={group.description} />
                <ProgressCard value={group.progress} text={t("currentProgress")} />
              </>
            )}
          </div>

          <div className="col-span-3 flex flex-col gap-6">
            {group && <MentorCard name={group.mentor} label={t("projectMentor")} />}
            <MembersList members={groupMembers} totalLabel="Tổng thành viên" membersLabel="Thành viên" />
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




