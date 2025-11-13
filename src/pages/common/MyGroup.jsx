import React, { useEffect, useState } from "react";
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
import PendingList from "../../components/common/my-group/PendingList";
import LoadingState from "../../components/common/LoadingState";
import { notification } from "antd";

export default function MyGroup() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userInfo } = useAuth();

  const [group, setGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        setLoading(true);
        setPendingLoading(true);
        const [detailRes, membersRes, pendingRes] = await Promise.allSettled([
          GroupService.getGroupDetail(id),
          GroupService.getListMembers(id),
          GroupService.getJoinRequests(id),
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
        });

        const members =
          membersRes.status === "fulfilled" && Array.isArray(membersRes.value?.data)
            ? membersRes.value.data
            : [];

        setGroupMembers(
          members.map((m) => {
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
          })
        );

        if (pendingRes.status === "fulfilled" && Array.isArray(pendingRes.value?.data)) {
          setPendingMembers(
            pendingRes.value.data.map((req) => {
              const email = req.email || req.requesterEmail || "";
              const normalizedEmail = email.toLowerCase();
              const currentEmail = (userInfo?.email || "").toLowerCase();
              const seasonType =
                typeof req.type === "string"
                  ? req.type
                  : req.type
                  ? String(req.type)
                  : "";

              return {
                requestId: req.requestId || req.id,
                name: req.displayName || req.name || req.requesterName || "",
                email,
                requestedAt: req.requestedAt || req.createdAt,
                role: req.role || req.status || "pending",
                type: seasonType || "application",
                postId: req.postId || req.postID || req.post?.id || "",
                avatarUrl:
                  req.avatarUrl ||
                  req.avatarURL ||
                  req.photoURL ||
                  req.photoUrl ||
                  (currentEmail && normalizedEmail === currentEmail ? userInfo?.photoURL : ""),
              };
            })
          );
        } else {
          setPendingMembers([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setPendingLoading(false);
      }
    };
    loadData();
  }, [id, userInfo]);

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

  const handleApprove = async (user) => {
    try {
      const requestId = user.requestId || user.id;
      const payload = {
        type: user.type || "application",
        postId: user.postId || user.postID || "",
      };
      await GroupService.acceptJoinRequest(id, requestId, payload);
      setPendingMembers((prev) =>
        prev.filter((x) =>
          requestId ? x.requestId !== requestId : x.email !== user.email
        )
      );
      setGroupMembers((prev) => [
        ...prev,
        {
          name: user.name,
          email: user.email,
          role: "member",
          joinedAt: new Date().toISOString(),
          avatarUrl: user.avatarUrl,
        },
      ]);
    } catch (err) {
      console.error(err);
      notification.error({
        message: t("approveFailed") || "Approve failed",
      });
    }
  };

  const handleReject = async (user) => {
    try {
      const requestId = user.requestId || user.id;
      const payload = {
        type: user.type || "application",
        postId: user.postId || user.postID || "",
      };
      await GroupService.rejectJoinRequest(id, requestId, payload);
      setPendingMembers((prev) =>
        prev.filter((x) =>
          requestId ? x.requestId !== requestId : x.email !== user.email
        )
      );
    } catch (err) {
      console.error(err);
      notification.error({
        message: t("rejectFailed") || "Reject failed",
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
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#FF7A00] text-white px-4 py-2 rounded-lg transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-orange-100"
          >
            {t("addMember")}
          </button>
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
            <PendingList
              items={pendingMembers}
              title={t("pendingListTitle") || "Danh sách chờ xét duyệt"}
              onApprove={handleApprove}
              onReject={handleReject}
              loading={pendingLoading}
              t={t}
            />
          </div>
        </div>

        <AddMemberModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onAdd={handleAddMember}
          t={t}
        />
      </div>
    </div>
  );
}





