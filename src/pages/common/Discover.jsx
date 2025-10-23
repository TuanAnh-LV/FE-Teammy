import React, { useState } from "react";
import { Search, Sparkles, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Vector from "../../assets/Vector.png";

const Discover = () => {
  const navigate = useNavigate();
  const [selectedFields, setSelectedFields] = useState([]);

  const fields = [
    "Logistics",
    "Cybersecurity",
    "Others",
    "Healthcare",
    "FinTech",
    "Sharing Economy",
    "Ed Tech",
    "E-commerce",
    "SaaS",
    "GreenTech",
    "AI & Machine Learning",
    "Prop Tech",
    "Ag Tech",
    "Entertainment & Media",
    "Mobility",
  ];

  const handleFieldChange = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const projects = [
    {
      id: "SEP490",
      title: "GreenLink",
      fields: ["GreenTech", "IoT"],
      members: "4 members",
      start: "01/11/2025",
      end: "20/12/2025",
      leader: "Tran Minh Khoa",
      mentor: "Le Phuong Anh",
      lecturer: "Dr. Nguyen Thanh Binh",
      description:
        "An IoT-based platform that monitors energy consumption and provides real-time recommendations to reduce carbon footprint for households and small businesses.",
      image: "",
    },
    {
      id: "SEP490",
      title: "SkillSync",
      fields: ["Ed Tech", "AI & Machine Learning"],
      members: "3 members",
      start: "05/11/2025",
      end: "10/12/2025",
      leader: "Nguyen Thanh Minh Nhat",
      mentor: "N/A",
      lecturer: "N/A",
      description:
        "A personalized learning assistant that analyzes user strengths and learning patterns using AI, helping students create adaptive study plans and improve skills effectively.",
      image: "",
    },
  ];

  const filteredProjects =
    selectedFields.length === 0
      ? projects
      : projects.filter((p) => p.fields.some((f) => selectedFields.includes(f)));

  return (
    <div className="!relative !bg-[#fafafa]">
      {/* Background */}
      <div className="!absolute !inset-0">
        <img src={Vector} alt="Vector background" className="!w-full !object-cover" />
      </div>

      {/* Content */}
      <div className="!relative !z-10 !min-h-screen !flex !flex-col !items-center !justify-start !pt-28 xl:!pt-40 !pb-28">
        <h1 className="!font-sans !font-black !text-[72px] md:!text-[87px] !leading-[96%] !tracking-[-4%] !text-[#3A3A3A] !text-center">
          Discover Projects & Teams
        </h1>

        <p className="!mt-5 !font-semibold !text-center !text-[20px] md:!text-[21px] !leading-[28px] !text-black/70">
          Find a capstone group that matches your skills and interests. AI will
          suggest <br className="!hidden md:!block" /> the most compatible
          projects and members.
        </p>

        {/* Search bar */}
        <div className="!mt-12 !flex !flex-col md:!flex-row !items-center !justify-center !gap-4 !w-full !max-w-7xl !px-6">
          <div className="!flex !items-center !bg-[#F5F5F5] !rounded-xl !w-full !px-5 !py-4 !shadow-sm hover:!shadow-md !transition">
            <Search className="!w-5 !h-5 !text-gray-500 !mr-3" />
            <input
              type="text"
              placeholder="Search for a project, skill, or topic..."
              className="!bg-transparent !outline-none !w-full !text-gray-700 placeholder:!text-gray-500 !text-[16px]"
            />
          </div>

          <button className="!flex !items-center !justify-center !gap-2 !bg-[#F5F5F5] hover:!bg-[#ECECEC] !px-6 !py-4 !rounded-xl !shadow-sm !font-semibold !text-gray-800 !transition !whitespace-nowrap">
            <Sparkles className="!w-5 !h-5 !text-gray-700" />
            AI Suggestions
          </button>
        </div>

{/* Layout: Sidebar + Projects */}
<div className="!mt-20 !w-full !max-w-7xl !px-6 !grid !grid-cols-1 lg:!grid-cols-[280px_minmax(0,1fr)] !gap-10">
  {/* Sidebar */}
  <div className="!bg-white !border !border-gray-200 !rounded-2xl !shadow-md !p-6 !h-fit">
    <h3 className="!font-bold !text-lg !mb-5 !text-gray-800">Field</h3>

    <div className="!grid !grid-cols-2 sm:!grid-cols-1 !gap-3">
      {fields.map((field) => (
        <label
          key={field}
          className="!flex !items-center !gap-2 !bg-[#f9f9f9] hover:!bg-[#f1f1f1] !rounded-lg !p-2 !border !border-gray-100 !cursor-pointer !transition"
        >
          <input
            type="checkbox"
            checked={selectedFields.includes(field)}
            onChange={() => handleFieldChange(field)}
            className="!w-4 !h-4 accent-[#3A3A3A]"
          />
          <span className="!text-[15px] !text-gray-700 !font-medium">{field}</span>
        </label>
      ))}
    </div>
  </div>

  {/* Projects Section */}
  <div className="!flex !flex-col !gap-8">
    {filteredProjects.map((project, index) => (
      <div
        key={index}
        className="!flex !flex-col md:!flex-row !bg-white !border !border-gray-200 !rounded-2xl !shadow-md hover:!shadow-lg hover:!-translate-y-[2px] !transition-all !overflow-hidden"
      >
        {/* Image */}
        <div className="md:!w-[35%] !bg-gray-100 !flex !items-center !justify-center">
          {project.image ? (
            <img
              src={project.image}
              alt={project.title}
              className="!object-cover !w-full !h-full"
            />
          ) : (
            <span className="!text-gray-400 !text-sm">No image available</span>
          )}
        </div>

        {/* Content */}
        <div className="!flex-1 !p-8 !flex !flex-col !justify-between">
          <div>
            {/* Header */}
            <div className="!flex !items-center !justify-between !mb-3">
              <h3 className="!font-bold !text-[22px] !text-[#3A3A3A]">{project.title}</h3>
              <span className="!bg-[#f4f4f4] !text-gray-700 !text-xs !font-semibold !px-2.5 !py-1 !rounded-md">
                {project.id}
              </span>
            </div>

            {/* Fields */}
            <div className="!flex !flex-wrap !gap-2 !mb-4">
              {project.fields.map((f, i) => (
                <span
                  key={i}
                  className="!bg-green-100 !text-green-700 !text-xs !font-semibold !px-2.5 !py-0.5 !rounded-md"
                >
                  {f}
                </span>
              ))}
            </div>

            {/* Basic Info */}
            <div className="!flex !flex-col sm:!flex-row !gap-x-10 !text-[15px] !text-gray-700 !mb-2">
              <span className="!flex !items-center !gap-2">
                <Users size={16} /> {project.members}
              </span>
              <span className="!flex !items-center !gap-2">
                <Calendar size={14} /> {project.start} → {project.end}
              </span>
            </div>

            {/* Avatars Section */}
            <div className="!flex !items-center !gap-5 !mt-4 !mb-3">
              {/* Leader */}
              <div className="!flex !items-center !gap-2">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    project.leader
                  )}&background=6366f1&color=fff&size=48`}
                  alt={project.leader}
                  className="!w-8 !h-8 !rounded-full !shadow"
                />
                <div className="!text-[14px]">
                  <span className="!block !font-semibold !text-gray-800">{project.leader}</span>
                  <span className="!text-gray-500 !text-xs">Leader</span>
                </div>
              </div>

              {/* Mentor */}
              {project.mentor && project.mentor !== "N/A" && (
                <div className="!flex !items-center !gap-2">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      project.mentor
                    )}&background=22c55e&color=fff&size=48`}
                    alt={project.mentor}
                    className="!w-8 !h-8 !rounded-full !shadow"
                  />
                  <div className="!text-[14px]">
                    <span className="!block !font-semibold !text-gray-800">{project.mentor}</span>
                    <span className="!text-gray-500 !text-xs">Mentor</span>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="!text-gray-600 !text-[15px] !leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Button */}
          <div className="!flex !justify-end !mt-6">
            <button
              onClick={() => navigate("/project-detail")}
              className="!text-white !bg-[#404040] hover:!bg-black !font-semibold !px-5 !py-2.5 !rounded-lg !shadow !transition"
            >
              View Details →
            </button>
          </div>
        </div>
      </div>
    ))}

    {filteredProjects.length === 0 && (
      <p className="!text-gray-500 !italic !text-center">
        No projects found for selected fields.
      </p>
    )}
  </div>
</div>

      </div>
    </div>
  );
};

export default Discover;
