import React from "react";

const FilterSidebar = () => {
  return (
    <div className="!bg-white !rounded-2xl !shadow-md !border !border-gray-100 !p-7 !w-full !max-w-[340px] !mx-auto">
      {/* Title */}
      <h3 className="!text-lg !font-bold !text-gray-900 !mb-5">Filters</h3>

      {/* AI Recommended */}
      <div className="!flex !items-center !justify-between !mb-5">
        <span className="!text-sm !text-gray-700 !font-medium">AI Recommended</span>
        <label className="!relative !inline-flex !items-center !cursor-pointer">
          <input type="checkbox" className="!sr-only peer" />
          <div className="!w-10 !h-5 !bg-gray-200 !rounded-full peer-checked:!bg-blue-500 !transition-all"></div>
          <div className="!absolute !left-1 !top-[3px] !bg-white !w-4 !h-4 !rounded-full !transition-all peer-checked:!translate-x-5"></div>
        </label>
      </div>

      <hr className="!border-gray-200 !my-5" />

      {/* Domain */}
      <div className="!mb-6">
        <h4 className="!font-semibold !text-sm !text-gray-800 !mb-3">Domain</h4>
        <div className="!space-y-2">
          {[
            "All Domains",
            "Web Development",
            "Graphic Design",
            "Marketing & Communications",
            "UI/UX Design",
            "Data Science",
            "Game Development",
            "Mobile Development",
          ].map((opt) => (
            <label
              key={opt}
              className="!flex !items-center !space-x-2 !text-gray-700 !text-sm"
            >
              <input
                type="radio"
                name="domain"
                defaultChecked={opt === "All Domains"}
                className="!text-blue-600 focus:!ring-blue-500"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="!border-gray-200 !my-5" />

      {/* Difficulty */}
      <div className="!mb-6">
        <h4 className="!font-semibold !text-sm !text-gray-800 !mb-3">Difficulty</h4>
        <div className="!space-y-2">
          {["All Levels", "Beginner", "Intermediate", "Advanced"].map((opt) => (
            <label
              key={opt}
              className="!flex !items-center !space-x-2 !text-gray-700 !text-sm"
            >
              <input
                type="radio"
                name="difficulty"
                defaultChecked={opt === "All Levels"}
                className="!text-blue-600 focus:!ring-blue-500"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="!border-gray-200 !my-5" />

      {/* Team Size */}
      <div>
        <h4 className="!font-semibold !text-sm !text-gray-800 !mb-3">Team Size</h4>
        <div className="!space-y-2">
          {["Any Size", "2-4 members", "5-8 members", "9+ members"].map((opt) => (
            <label
              key={opt}
              className="!flex !items-center !space-x-2 !text-gray-700 !text-sm"
            >
              <input
                type="radio"
                name="team"
                defaultChecked={opt === "Any Size"}
                className="!text-blue-600 focus:!ring-blue-500"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
