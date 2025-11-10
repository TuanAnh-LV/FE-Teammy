import React from "react";
import FilterSidebar from "../../components/common/discover/FilterSidebar";
import ProjectCard from "../../components/common/discover/ProjectCard";
import { useTranslation } from "../../hook/useTranslation";

const Discover = () => {
  const { t } = useTranslation();
  const projects = [
    {
      title: "Modern Portfolio Website Builder",
      domain: "Web Development",
      tags: ["React", "TypeScript", "Tailwind"],
      mentor: "Dr. Smith",
      progress: 30,
      members: ["A", "B"],
    },
    {
      title: "Coffee Brand Visual Identity",
      domain: "Graphic Design",
      tags: ["Illustrator", "Branding", "Print Design"],
      mentor: "Prof. Johnson",
      progress: 55,
      members: ["C", "D", "E"],
    },
    {
      title: "Instagram Marketing Campaign",
      domain: "Marketing & Communications",
      tags: ["Social Media", "Content Strategy", "Analytics"],
      progress: 20,
      members: ["F", "G"],
    },
    {
      title: "Mobile Banking App Redesign",
      domain: "UI/UX Design",
      tags: ["Figma", "User Research", "Prototyping"],
      mentor: "Dr. Lee",
      progress: 45,
      members: ["H", "I", "J"],
    },
    {
      title: "Customer Behavior Analysis Dashboard",
      domain: "Data Science",
      tags: ["Python", "Pandas", "Tableau", "SQL"],
      mentor: "Prof. Chen",
      progress: 60,
      members: ["K", "L"],
    },
    {
      title: "2D Puzzle Game Development",
      domain: "Game Development",
      tags: ["Unity", "C#", "Game Design"],
      progress: 75,
      members: ["M", "N", "O", "P"],
    },
  ];

  return (
    <div className="!min-h-screen !bg-[#f7fafc] !pt-24 !pb-12">
      {/*  Header section */}
      <div className="!max-w-[1600px] !mx-auto !ml-48 !mb-8">
        <h1 className="!text-4xl !font-extrabold !text-[#1a1a1a] !mb-2">
          {t("findProjects")}
        </h1>
        <p className="!text-gray-500 !text-lg">
          {t("discoverProjects")}
        </p>
      </div>

      {/* Main Layout */}
      <div className="!max-w-[1600px] !mx-auto !grid !grid-cols-1 lg:!grid-cols-[340px_1fr] !gap-8 !px-8">
        {/* Sidebar */}
        <div className="!flex-shrink-0">
          <FilterSidebar />
        </div>

        {/* Main content */}
        <div className="!flex !flex-col !gap-6">
          {/* Search */}
          <div className="!flex !items-center">
            <input
              type="text"
              placeholder={t("searchProjects")}
              className="!w-full !px-4 !py-2 !rounded-lg !border !border-gray-300 focus:!ring-2 focus:!ring-blue-500 focus:!outline-none"
            />
          </div>

          {/* Projects */}
          <div className="!grid !grid-cols-1 sm:!grid-cols-2 xl:!grid-cols-3 2xl:!grid-cols-3 !gap-6">
            {projects.map((project, i) => (
              <ProjectCard key={i} project={project} />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Discover;
