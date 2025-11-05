import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "../../hook/useTranslation";

import HeaderBar from "../../components/common/my-group/HeaderBar";
import InfoCard from "../../components/common/my-group/InfoCard";
import DescriptionCard from "../../components/common/my-group/DescriptionCard";
import ProgressCard from "../../components/common/my-group/ProgressCard";
import MentorCard from "../../components/common/my-group/MentorCard";
import MembersList from "../../components/common/my-group/MembersList";
import AddMemberModal from "../../components/common/my-group/AddMemberModal";

const MyGroup = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // nếu route dạng /my-group/:id
  const { t } = useTranslation();

  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [groupMembers, setGroupMembers] = useState([
    { name: "Nguyen Van A", role: "Leader", email: "anva@fpt.edu.vn" },
    { name: "Tran Thi B", email: "btran@fpt.edu.vn" },
    { name: "Le Van C", email: "cle@fpt.edu.vn" },
  ]);

  const group = {
    id: id || "G001",
    title: "AI Healthcare Team",
    field: "Healthcare",
    description:
      "AI Healthcare Team focuses on developing ML models to assist doctors in diagnosing diseases and predicting outcomes.",
    start: "01/10/2025",
    end: "15/12/2025",
    progress: 65,
    mentor: "Nguyen Van A",
    statusText: t("onTrack") || "On Track",
  };

  const handleAddMember = async () => {
    if (!email.trim()) return alert(t("pleaseEnterEmail"));
    const user = { name: "User Found", email };
    if (groupMembers.some((m) => m.email === user.email)) {
      alert(t("userAlreadyInGroup"));
      return;
    }
    setGroupMembers((s) => [...s, user]);
    alert(`${user.email} ${t("userAddedSuccessfully")}`);
    setEmail("");
    setShowModal(false);
  };

  return (
    <div className="!relative !bg-[#f7fafc]">
      <div className="!relative !z-10 !min-h-screen !flex !flex-col !items-center !pt-20 xl:!pt-32 !pb-28">
        {/* Top bar back + actions */}
        <div className="!w-full !max-w-7xl !px-6 !flex !items-center !justify-between !mb-10">
          <button
            onClick={() => navigate(-1)}
            className="!flex !items-center !gap-2 !font-medium hover:!text-black !transition"
          >
            <ArrowLeft className="!w-5 !h-5" />
            {t("back")}
          </button>

          <HeaderBar onOpenAdd={() => setShowModal(true)} onOpenWorkspace={() => navigate("/workspace")} />
        </div>

        {/* 7-3 layout */}
        <div className="!w-full !max-w-7xl !px-6 !grid !grid-cols-1 lg:!grid-cols-10 !gap-8">
          <div className="!col-span-7 !flex !flex-col !gap-6">
            <InfoCard group={group} />
            <DescriptionCard description={group.description} />
            <ProgressCard value={group.progress} text={t("currentProgress")} />
          </div>

          <div className="!col-span-3 !flex !flex-col !gap-6">
            <MentorCard name={group.mentor} label={t("projectMentor")} />
            <MembersList members={groupMembers} totalLabel={t("totalMembers")} membersLabel={t("members")} />
          </div>
        </div>

        {/* Modal add member */}
        <AddMemberModal
          open={showModal}
          onClose={() => setShowModal(false)}
          email={email}
          setEmail={setEmail}
          onAdd={handleAddMember}
          t={t}
        />
      </div>
    </div>
  );
};

export default MyGroup;
