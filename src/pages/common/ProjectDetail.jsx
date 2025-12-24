import React from "react";
import { useNavigate } from "react-router-dom";
import Vector from "../../assets/Vector.png";
import {
  Users,
  Calendar,
  UserRound,
  Info,
  ClipboardList,
  ArrowLeft,
  Send,
} from "lucide-react";

const ProjectDetail = () => {
  const navigate = useNavigate();
  return (
    <div className="!relative !bg-[#fafafa]">
      {/* Background */}
      <div className="!absolute !inset-0">
        <img src={Vector} alt="Vector background" className="!w-full !object-cover" />
      </div>

      {/* Content */}
      <div className="!relative !z-10 !min-h-screen !flex !flex-col !items-center !justify-start !pt-20 xl:!pt-32 !pb-28">
        {/* Top bar: Back + Apply */}
        <div className="!w-full !max-w-7xl !px-6 !flex !items-center !justify-between !mb-10">
          <button
            onClick={() => navigate(-1)}
            className="!flex !items-center !gap-2 !text-gray-700 !font-medium !hover:text-black !transition"
          >
            <ArrowLeft className="!w-5 !h-5" />
            Back
          </button>

          <button className="!bg-[#404040] !text-white !px-6 !py-2.5 !rounded-lg !font-semibold !shadow-md hover:!bg-black hover:!scale-[1.02] !transition-all !flex !items-center !gap-2">
            <Send className="!w-4 !h-4" />
            Apply to Join Project
          </button>
        </div>

        {/* Main Layout 7-3 */}
        <div className="!w-full !max-w-7xl !px-6 !grid !grid-cols-1 lg:!grid-cols-10 !gap-8">
          {/* ================= LEFT SIDE ================= */}
          <div className="!col-span-7 !flex !flex-col !gap-6">
            {/* --- Project Info --- */}
            <div className="!bg-white/90 !backdrop-blur-md !border !border-gray-200 !rounded-2xl !shadow-md !p-8 !relative overflow-hidden">
              <div className="!flex !items-center !gap-2 !mb-5">
                <span className="!bg-blue-100 !p-2 !rounded-lg">
                  <Info className="!text-blue-600 !w-5 !h-5" />
                </span>
                <h2 className="!font-bold !text-xl !text-gray-800">Project Information</h2>
              </div>

              <h3 className="!font-bold !text-[26px] !text-[#333] !mb-3">
                {project.title}
              </h3>

              <div className="!flex !flex-wrap !gap-2 !mb-6">
                {project.fields.map((f, i) => (
                  <span
                    key={i}
                    className="!bg-blue-100 !text-blue-700 !text-sm !font-semibold !px-3 !py-1 !rounded-full"
                  >
                    {f}
                  </span>
                ))}
              </div>

              <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-y-3 !text-[15px] !text-gray-700">
                <p>
                  <b>ID:</b> {project.id}
                </p>
                <p>
                  <b>Leader:</b> {project.leader}
                </p>
                <p className="!flex !items-center !gap-2">
                  <Calendar size={15} /> <b>Start:</b> {project.startDate}
                </p>
                <p>
                  <b>End:</b> {project.endDate}
                </p>
                <p>
                  <b>Mentor:</b>{" "}
                  {Array.isArray(project.mentors) && project.mentors.length > 0
                    ? project.mentors.map((m, idx) => m.displayName || m.name || m.mentorName || m.email).join(", ")
                    : project.mentor || "N/A"}
                </p>
              </div>
            </div>

            {/* --- Description --- */}
            <div className="!bg-white/90 !backdrop-blur-md !border !border-gray-200 !rounded-2xl !shadow-md !p-8 !relative overflow-hidden">
              <div className="!flex !items-center !gap-2 !mb-5">
                <span className="!bg-purple-100 !p-2 !rounded-lg">
                  <ClipboardList className="!text-purple-600 !w-5 !h-5" />
                </span>
                <h2 className="!font-bold !text-xl !text-gray-800">Description</h2>
              </div>
              <p className="!text-gray-700 !leading-relaxed !text-[15px]">
                {project.description}
              </p>
            </div>

            {/* --- Progress --- */}
            <div className="!bg-white/90 !backdrop-blur-md !border !border-gray-200 !rounded-2xl !shadow-md !p-8 !relative overflow-hidden">
              <div className="!flex !items-center !gap-2 !mb-5">
                <span className="!bg-green-100 !p-2 !rounded-lg">
                  <Users className="!text-green-600 !w-5 !h-5" />
                </span>
                <h2 className="!font-bold !text-xl !text-gray-800">Progress</h2>
              </div>
              <div className="!bg-gray-200 !h-3 !rounded-full !overflow-hidden">
                <div
                  className="!bg-green-500 !h-3 !rounded-full !transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <p className="!text-sm !text-gray-600 !mt-2">
                Current progress: <b>{project.progress}%</b>
              </p>
            </div>
          </div>

          {/* ================= RIGHT SIDE ================= */}
          <div className="!col-span-3 !flex !flex-col !gap-6">
            {/* --- Mentor --- */}
            <div className="!bg-white/90 !backdrop-blur-md !border !border-gray-200 !rounded-2xl !shadow-md !p-6 !relative overflow-hidden">
              <h3 className="!font-bold !text-lg !text-gray-800 !mb-4 flex items-center gap-2">
                <span className="!bg-amber-100 !p-2 !rounded-lg">
                  <Users className="!text-amber-600 !w-5 !h-5" />
                </span>
                Mentor
                {Array.isArray(project.mentors) && project.mentors.length > 1 && (
                  <span className="!text-sm !font-normal !text-gray-500">
                    ({project.mentors.length})
                  </span>
                )}
              </h3>

              {Array.isArray(project.mentors) && project.mentors.length > 0 ? (
                <div className="space-y-3">
                  {project.mentors.map((mentor, idx) => (
                    <div key={mentor.userId || mentor.id || idx} className="!bg-amber-50 !rounded-xl !border !border-amber-100 !p-4 !flex !items-center !gap-4">
                      <img
                        src={mentor.avatarUrl || "https://i.pravatar.cc/80?img=12"}
                        alt={mentor.displayName || mentor.name || "mentor"}
                        className="!w-12 !h-12 !rounded-full !object-cover !border !border-white !shadow"
                      />
                      <div>
                        <p className="!font-semibold !text-gray-800">
                          {mentor.displayName || mentor.name || mentor.mentorName || mentor.email}
                        </p>
                        <p className="!text-sm !text-amber-700 !font-medium">Project Mentor</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : project.mentor ? (
                <div className="!bg-amber-50 !rounded-xl !border !border-amber-100 !p-4 !flex !items-center !gap-4">
                  <img
                    src="https://i.pravatar.cc/80?img=12"
                    alt="mentor"
                    className="!w-12 !h-12 !rounded-full !object-cover !border !border-white !shadow"
                  />
                  <div>
                    <p className="!font-semibold !text-gray-800">{project.mentor}</p>
                    <p className="!text-sm !text-amber-700 !font-medium">Project Mentor</p>
                  </div>
                </div>
              ) : (
                <div className="!bg-gray-50 !rounded-xl !border !border-gray-100 !p-4 !text-center">
                  <p className="!text-gray-500">No mentor assigned</p>
                </div>
              )}
            </div>

            {/* --- Members --- */}
            <div className="!bg-white/90 !backdrop-blur-md !border !border-gray-200 !rounded-2xl !shadow-md !p-6 !relative overflow-hidden">
              <h3 className="!font-bold !text-lg !text-gray-800 !mb-4 flex items-center gap-2">
                <span className="!bg-green-100 !p-2 !rounded-lg">
                  <UserRound className="!text-green-600 !w-5 !h-5" />
                </span>
                Members
              </h3>

              {project.members.map((member, i) => (
                <div
                  key={i}
                  className={`!flex !items-center !gap-4 !border !rounded-xl !p-4 !mb-3 ${
                    member.role
                      ? "!bg-green-50 !border-green-100"
                      : "!bg-gray-50 !border-gray-100"
                  }`}
                >
                  <img
                    src={`https://i.pravatar.cc/80?img=${i + 3}`}
                    alt={member.name}
                    className="!w-12 !h-12 !rounded-full !object-cover !border !border-white !shadow"
                  />
                  <div className="!flex-1">
                    <p className="!font-semibold !text-gray-800">{member.name}</p>
                    {member.role && (
                      <p className="!text-sm !text-green-700 !font-medium flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="!w-4 !h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2l4-4"
                          />
                        </svg>
                        {member.role}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <p className="!text-right !text-sm !text-gray-500 !mt-2">
                Total members: {project.members.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
