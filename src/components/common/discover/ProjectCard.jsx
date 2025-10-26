import React from "react";
import { Sparkles, Users } from "lucide-react";

const ProjectCard = ({ project }) => {
  return (
    <div className="!bg-white !border !border-gray-100 !rounded-2xl !shadow-sm hover:!shadow-lg hover:!scale-[1.02] !transition-all !duration-200 !p-6 !flex !flex-col !justify-between">
      {/* Header */}
      <div className="!flex !items-start !justify-between !mb-4">
        <h3 className="!font-semibold !text-gray-900 !text-base !leading-snug">
          {project.title}
        </h3>
        <div className="!flex !items-center !text-gray-400 !text-xs">
          <Sparkles className="!w-4 !h-4 !mr-1" /> AI
        </div>
      </div>

      {/* Tags */}
      <div className="!flex !flex-wrap !gap-2 !mb-4">
        <span className="!text-xs !bg-blue-50 !text-blue-700 !font-medium !px-2 !py-1 !rounded-md">
          {project.domain}
        </span>
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="!text-xs !bg-gray-100 !text-gray-700 !font-medium !px-2 !py-1 !rounded-md"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Mentor */}
      {project.mentor && (
        <p className="!text-sm !text-gray-600 !mb-3">
          Mentor: {project.mentor}
        </p>
      )}

      {/* Progress */}
      <div className="!mb-4">
        <div className="!flex !justify-between !text-xs !text-gray-500 !mb-1">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="!w-full !bg-gray-200 !rounded-full !h-1.5">
          <div
            className="!bg-blue-600 !h-1.5 !rounded-full"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Members */}
      <div className="!flex !items-center !justify-between !mt-auto">
        <div className="!flex !items-center !space-x-2">
          <Users className="!w-4 !h-4 !text-gray-600" />
          <div className="!flex -!space-x-2">
            {project.members.map((m, i) => (
              <span
                key={i}
                className="!w-6 !h-6 !rounded-full !bg-gray-200 !flex !items-center !justify-center !text-xs !font-medium !text-gray-700 !border !border-white"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
        <p className="!text-sm !text-gray-600">
          {project.members.length} Members
        </p>
      </div>

      {/* Button */}
      <button className="!mt-5 !bg-[#4264d7] hover:!bg-[#1c355c] !text-white !text-sm !font-semibold !py-2 !rounded-lg !transition-colors">
        View Details
      </button>
    </div>
  );
};

export default ProjectCard;
