import React from "react";
import Vector from "../../assets/Vector.png";
import { Users, Calendar, BarChart } from "lucide-react";

const MyGroup = () => {
  const members = [
    { name: "Nguyen Van A", role: "Leader" },
    { name: "Tran Thi B", role: "Frontend Dev" },
    { name: "Le Van C", role: "Backend Dev" },
    { name: "Pham Thi D", role: "UI/UX Designer" },
    { name: "Doan Van E", role: "Data Analyst" },
    { name: "Hoang Thi F", role: "QA Tester" },
  ];

  return (
    <div className="relative">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={Vector}
          alt="Vector background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start pt-28 xl:pt-40 pb-28">
        {/* Title */}
        <h1 className="!font-sans !font-black text-[72px] md:text-[87px] leading-[96%] tracking-[-4%] text-[#3A3A3A] text-center">
          My Group
        </h1>

        {/* Subtitle */}
        <p className="mt-5 font-semibold text-center text-[20px] md:text-[21px] leading-[28px] text-black/70">
          Your capstone team information, track progress, and manage members.
        </p>

        {/* Group Info Card */}
        <div className="mt-16 bg-gradient-to-br from-[#ffffff] to-[#f7f9ff] border border-gray-200 rounded-2xl shadow-md w-full max-w-[76rem] mxau p-10 backdrop-blur-md">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-[64px] !font-bold text-black !tracking-[2%]">
                AI Healthcare Team
              </h2>
              <p className="text-[#999999] font-bold text-[21px] tracking-[-4%] mt-1">
                AI applications support medical diagnosis
              </p>
            </div>
            <button className="bg-gradient-to-r from-[#FF5858] to-[#FF3E3E] hover:opacity-90 !text-white text-[24px] !tracking-[-4%] !font-bold px-6 py-3.5 rounded-[12px] !mt-3.5 transition">
              Leave Group
            </button>
          </div>

          {/* Status Tags */}
          <div className="flex gap-2 mb-6">
            <span className="bg-gray-200 text-gray-800 text-[14px] font-semibold px-4 py-1 rounded-full">
              Team Leader
            </span>
            <span className="bg-green-100 text-green-700 text-[14px] font-semibold px-4 py-1 rounded-full">
              On Track
            </span>
          </div>

          {/* Grid Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Project Progress */}
            <div>
              <h3 className="text-[16px] font-semibold text-gray-800 mb-4">
                Project Progress
              </h3>
              <div className="bg-white/90 border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[15px] text-gray-700 font-medium">
                    Overall Progress
                  </span>
                  <span className="text-[15px] font-semibold text-[#3A3A3A]">
                    65%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-5">
                  <div
                    className="h-full bg-gradient-to-r from-[#6C63FF] to-[#3A3A3A] rounded-full"
                    style={{ width: "65%" }}
                  ></div>
                </div>

                <div>
                  <h4 className="text-[14px] font-semibold text-gray-700 mb-1">
                    Next Milestone
                  </h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-gray-600 text-[14px] font-medium">
                      MVP Demo
                    </span>
                    <span className="text-gray-800 font-semibold text-[14px]">
                      15/11/2025
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* General Info */}
            <div>
              <h3 className="text-[16px] font-semibold text-gray-800 mb-4">
                General Information
              </h3>
              <div className="bg-white/90 border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                <div>
                  <p className="text-[14px] text-gray-600">Subject Area</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-medium text-gray-800">
                    Healthcare
                  </div>
                </div>
                <div>
                  <p className="text-[14px] text-gray-600">Mentor</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-medium text-gray-800">
                    Nguyen Van A
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Group Members */}
          <div className="mt-10">
            <h3 className="text-[16px] font-semibold text-gray-800 mb-4">
              Group Members
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {members.map((m, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-[#f4f4f4] to-[#fdfdfd] border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition"
                >
                  <div className="w-12 h-12 bg-gray-300 rounded-full mb-3"></div>
                  <p className="text-[15px] font-semibold text-gray-800">
                    {m.name}
                  </p>
                  <p className="text-[13px] text-gray-600">{m.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col md:flex-row justify-center gap-6">
            <button className="bg-[#404040] hover:bg-black !text-white text-[21px] !font-bold px-26 py-4 rounded-[12px] !tracking-[-4%] transition">
              Open Workspace
            </button>
            <button className="bg-[#8C8C8C] hover:bg-gray-300 !text-white  text-[21px] !font-bold px-26 py-4 rounded-[12px] !tracking-[-4%] transition">
              View Full Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyGroup;
