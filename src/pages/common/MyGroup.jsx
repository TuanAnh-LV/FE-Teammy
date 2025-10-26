import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Vector from "../../assets/Vector.png";
import {
  Users,
  Calendar,
  UserRound,
  Info,
  ClipboardList,
  ArrowLeft,
  UserPlus2,
  FolderKanban,
  Search,
  X,
  Mail,
  Plus,
} from "lucide-react";

const MyGroup = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [groupMembers, setGroupMembers] = useState([
    { name: "Nguyen Van A", role: "Leader", email: "anva@fpt.edu.vn" },
    { name: "Tran Thi B", email: "btran@fpt.edu.vn" },
    { name: "Le Van C", email: "cle@fpt.edu.vn" },
  ]);

  // Hàm xử lý khi bấm Add (sẽ gọi API thật sau)
  const handleAddMember = async () => {
    if (!email.trim()) return alert("Please enter an email address.");
    try {
      // TODO: Gọi API backend tìm user theo email, ví dụ:
      // const res = await fetch(`/api/users/search?email=${email}`);
      // const user = await res.json();

      // Giả sử API trả về user như dưới (chỉ demo)
      const user = { name: "User Found", email };

      // Kiểm tra trùng email
      if (groupMembers.some((m) => m.email === user.email)) {
        alert("This user is already in the group.");
        return;
      }

      setGroupMembers([...groupMembers, user]);
      alert(`${user.email} has been added.`);
      setEmail("");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add member. Please try again.");
    }
  };

  const group = {
    id: "G001",
    title: "AI Healthcare Team",
    field: "Healthcare",
    description:
      "AI Healthcare Team focuses on developing ML models to assist doctors in diagnosing diseases and predicting outcomes.",
    start: "01/10/2025",
    end: "15/12/2025",
    progress: 65,
    mentor: "Nguyen Van A",
  };

  return (
    <div className="relative bg-[#fafafa]">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={Vector} alt="Vector background" className="w-full object-cover" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center pt-20 xl:pt-32 pb-28">
        {/* Top bar */}
        <div className="w-full max-w-7xl px-6 flex items-center justify-between mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 font-medium hover:text-black transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#404040] !text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:bg-black hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              <UserPlus2 className="w-4 h-4" />
              Add Member
            </button>

            <button
              onClick={() => navigate("/workspace")}
              className="bg-[#404040] !text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:bg-black hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              <FolderKanban className="w-4 h-4" />
              Open Workspace
            </button>
          </div>
        </div>

        {/* Layout 7-3 */}
        <div className="w-full max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* LEFT SIDE */}
          <div className="col-span-7 flex flex-col gap-6">
            {/* Info */}
            <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md p-8">
              <div className="flex items-center gap-2 mb-5">
                <span className="bg-blue-100 p-2 rounded-lg">
                  <Info className="text-blue-600 w-5 h-5" />
                </span>
                <h2 className="font-bold text-xl text-gray-800">Group Information</h2>
              </div>

              <h3 className="font-bold text-[26px] text-[#333] mb-3">{group.title}</h3>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                  {group.field}
                </span>
                <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                  On Track
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 text-[15px] text-gray-700">
                <p>
                  <b>ID:</b> {group.id}
                </p>
                <p>
                  <b>Mentor:</b> {group.mentor}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar size={15} /> <b>Start:</b> {group.start}
                </p>
                <p>
                  <b>End:</b> {group.end}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/90 border border-gray-200 rounded-2xl shadow-md p-8">
              <div className="flex items-center gap-2 mb-5">
                <span className="bg-purple-100 p-2 rounded-lg">
                  <ClipboardList className="text-purple-600 w-5 h-5" />
                </span>
                <h2 className="font-bold text-xl text-gray-800">Description</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-[15px]">
                {group.description}
              </p>
            </div>

            {/* Progress */}
            <div className="bg-white/90 border border-gray-200 rounded-2xl shadow-md p-8">
              <div className="flex items-center gap-2 mb-5">
                <span className="bg-green-100 p-2 rounded-lg">
                  <Users className="text-green-600 w-5 h-5" />
                </span>
                <h2 className="font-bold text-xl text-gray-800">Progress</h2>
              </div>
              <div className="bg-gray-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{ width: `${group.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Current progress: <b>{group.progress}%</b>
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="col-span-3 flex flex-col gap-6">
            {/* Mentor */}
            <div className="bg-white/90 border border-gray-200 rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-amber-100 p-2 rounded-lg">
                  <Users className="text-amber-600 w-5 h-5" />
                </span>
                Mentor
              </h3>
              <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 flex items-center gap-4">
                <img
                  src="https://i.pravatar.cc/80?img=12"
                  alt="mentor"
                  className="w-12 h-12 rounded-full object-cover border border-white shadow"
                />
                <div>
                  <p className="font-semibold text-gray-800">{group.mentor}</p>
                  <p className="text-sm text-amber-700 font-medium">Project Mentor</p>
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="bg-white/90 border border-gray-200 rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-green-100 p-2 rounded-lg">
                  <UserRound className="text-green-600 w-5 h-5" />
                </span>
                Members
              </h3>
              {groupMembers.map((member, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 border rounded-xl p-4 mb-3 bg-gray-50 hover:bg-gray-100 transition"
                >
                  <img
                    src={`https://i.pravatar.cc/80?img=${i + 3}`}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover shadow"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>
              ))}
              <p className="text-right text-sm text-gray-500 mt-2">
                Total: {groupMembers.length} members
              </p>
            </div>
          </div>
        </div>

        {/* === Popup: Search by email === */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/95 border border-gray-200 shadow-xl rounded-2xl p-8 w-[90%] max-w-md relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-600" />
                Add Member by Email
              </h2>

              <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 mb-6">
                <Search className="w-4 h-4 text-gray-500 mr-2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter member email..."
                  className="bg-transparent outline-none w-full text-gray-700"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  className="flex items-center gap-2 !bg-[#404040] !text-white px-5 py-2 rounded-lg font-semibold !hover:bg-black transition"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGroup;
