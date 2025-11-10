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

export default function MyGroup() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userInfo } = useAuth();

  const [group, setGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        setLoading(true);
        const [detailRes, membersRes, pendingRes] = await Promise.allSettled([
          GroupService.getGroupDetail(id),
          GroupService.getListMembers(id),
          GroupService.getPendingMembers ? GroupService.getPendingMembers(id) : Promise.reject("no pending api"),
        ]);

        const d = detailRes.status === "fulfilled" ? detailRes.value.data : {};
        setGroup({
          id: d.id || id,
          title: d.name || "",
          field: d.field || "",
          description: d.description || "",
          start: d.startDate?.slice(0, 10) || "",
          end: d.endDate?.slice(0, 10) || "",
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

        // pending members
        if (pendingRes.status === "fulfilled" && Array.isArray(pendingRes.value?.data)) {
          setPendingMembers(
            pendingRes.value.data.map((m) => {
              const email = m.email || "";
              const normalizedEmail = email.toLowerCase();
              const currentEmail = (userInfo?.email || "").toLowerCase();

              return {
                name: m.displayName || m.name || "",
                email,
                requestedAt: m.requestedAt,
                role: m.role || m.status || "pending",
                avatarUrl:
                  m.avatarUrl ||
                  m.photoURL ||
                  m.photoUrl ||
                  (currentEmail && normalizedEmail === currentEmail ? userInfo?.photoURL : ""),
              };
            })
          );
        } else {
          const fallback = members.filter((m) => {
            const status = (m.role || m.status || "").toLowerCase();
            return status === "pending" || status === "waiting" || status === "request";
          });
          setPendingMembers(
            fallback.map((m) => ({
              name: m.displayName || m.name || "",
              email: m.email || "",
              role: "pending",
              avatarUrl:
                m.avatarUrl ||
                m.photoURL ||
                m.photoUrl ||
                ((m.email || "").toLowerCase() === (userInfo?.email || "").toLowerCase()
                  ? userInfo?.photoURL
                  : ""),
            }))
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, userInfo]);

  const handleAddMember = (user) => {
    if (!user || !user.email) {
      alert(t("pleaseSelectUser") || "Please select a user first");
      return;
    }
    if (groupMembers.some((m) => m.email === user.email)) {
      alert(t("userAlreadyInGroup"));
      return;
    }
    setGroupMembers((prev) => [...prev, user]);
    setShowModal(false);
  };

  const handleApprove = async (user) => {
    try {
      // Nếu backend có API thì gọi ở đây, ví dụ:
      // await GroupService.approveMember(id, user.email);
      setPendingMembers((prev) => prev.filter((x) => x.email !== user.email));
      setGroupMembers((prev) => [
        ...prev,
        { name: user.name, email: user.email, role: "member", joinedAt: new Date().toISOString() },
      ]);
    } catch (err) {
      console.error(err);
      alert("Duyệt thất bại");
    }
  };

  const handleReject = async (user) => {
    try {
      // Nếu backend có API thì gọi ở đây
      // await GroupService.rejectMember(id, user.email);
      setPendingMembers((prev) => prev.filter((x) => x.email !== user.email));
    } catch (err) {
      console.error(err);
      alert("Từ chối thất bại");
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-gray-600">{t("loading")}...</div>;
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
              title="Danh sách chờ xét duyệt"
              onApprove={handleApprove}
              onReject={handleReject}
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
