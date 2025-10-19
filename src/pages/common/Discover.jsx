import React from "react";
import { Search, Sparkles, Users, Clock } from "lucide-react"; 
import Vector from "../../assets/Vector.png";

const Discover = () => {
  const projects = [
    {
      title: "AI-Powered Healthcare App",
      description: "Building a diagnostic assistant using machine learning",
      members: "3/5 members",
      time: "15–20h/week",
      skills: ["Python", "React", "Figma"],
    },
    {
      title: "AI-Powered Healthcare App",
      description: "Building a diagnostic assistant using machine learning",
      members: "3/5 members",
      time: "15–20h/week",
      skills: ["Python", "React", "Figma"],
    },
    {
      title: "AI-Powered Healthcare App",
      description: "Building a diagnostic assistant using machine learning",
      members: "3/5 members",
      time: "15–20h/week",
      skills: ["Python", "React", "Figma"],
    },
     {
      title: "AI-Powered Healthcare App",
      description: "Building a diagnostic assistant using machine learning",
      members: "3/5 members",
      time: "15–20h/week",
      skills: ["Python", "React", "Figma"],
    },
     {
      title: "AI-Powered Healthcare App",
      description: "Building a diagnostic assistant using machine learning",
      members: "3/5 members",
      time: "15–20h/week",
      skills: ["Python", "React", "Figma"],
    },
     {
      title: "AI-Powered Healthcare App",
      description: "Building a diagnostic assistant using machine learning",
      members: "3/5 members",
      time: "15–20h/week",
      skills: ["Python", "React", "Figma"],
    },
  ];

  return (
    <div className="relative">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={Vector}
          alt="Vector background"
          className="w-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start pt-28 xl:pt-40 pb-28">
        {/* Title */}
        <h1 className="!font-sans !font-black text-[72px] md:text-[87px] leading-[96%] tracking-[-4%] text-[#3A3A3A] text-center">
          Discover Projects & Teams
        </h1>

        {/* Subtitle */}
        <p className="mt-5 font-semibold text-center text-[20px] md:text-[21px] leading-[28px] text-black/70">
          Find a capstone group that matches your skills and interests. AI will
          suggest <br className="hidden md:block" /> the most compatible
          projects and members.
        </p>

        {/* Search bar */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-7xl px-6">
          {/* Input area */}
          <div className="flex items-center bg-[#F5F5F5] rounded-xl w-full px-5 py-4 shadow-sm hover:shadow-md transition">
            <Search className="w-5 h-5 text-gray-500 mr-3" />
            <input
              type="text"
              placeholder="Search for a project, skill, or topic..."
              className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-500 text-[16px]"
            />
          </div>

          {/* AI Suggestions button */}
          <button className="flex items-center justify-center gap-2 bg-[#F5F5F5] hover:bg-[#ECECEC] px-6 py-4 rounded-xl shadow-sm font-semibold text-gray-800 transition whitespace-nowrap">
            <Sparkles className="w-5 h-5 text-gray-700" />
            AI Suggestions
          </button>
        </div>

        {/* Project Cards */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-7xl px-6">
          {projects.map((project, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div>
                <h3 className="!font-bold !text-[21px] !leading-[32px] !tracking-[-4%] text-black">
                  {project.title}
                </h3>
                <p className="text-[15px] leading-[26px] tracking-[-1%] text-[#627084] !mb-6">
                  {project.description}
                </p>

                <div className="flex items-center text-[15px] font-medium leading-[26px] tracking-[1%] text-black mb-2">
                  <Users className="w-4 h-4 mr-2" /> {project.members}
                </div>
                <div className="flex items-center text-[15px] font-medium leading-[26px] tracking-[1%] text-black mb-6">
                  <Clock className="w-4 h-4 mr-2" /> {project.time}
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {project.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-[#999999] text-white text-[14px] px-3 py-1.5 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <button className="bg-[#404040] !text-white py-3 rounded-lg font-semibold hover:bg-black transition text-[15px]">
                Join Team
              </button>
            </div>
          ))}
        </div>

        {/* AI Suggest Section */}
        <div className="mt-28 w-full max-w-7xl bg-white border border-gray-200 rounded-2xl text-center p-16 shadow-sm">
          <h2 className="!font-bold text-[56px] !tracking-[2%] text-[#3A3A3A] mb-5">
            Let AI Find Groups For You
          </h2>
          <p className="text-black/70 font-normal mb-10 mx-auto text-[18px] leading-[34px] ">
            Complete your profile to get the best group suggestions based on
            your skills, available time, and learning goals.
          </p>
          <button className="bg-[#404040] !text-white px-10 py-3.5 rounded-lg font-semibold hover:bg-black transition">
            Complete Your Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Discover;
