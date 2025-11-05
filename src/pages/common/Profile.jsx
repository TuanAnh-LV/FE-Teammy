import React from "react";
import {
  Edit,
  Mail,
  BookOpen,
  GraduationCap,
  Calendar,
  ArrowUp,
  LineChart,
  Users,
} from "lucide-react";

const Profile = () => {
  const profile = {
    name: "Nguyễn Văn A",
    headline:
      "Passionate about web development and UI/UX design. Always eager to learn new technologies and collaborate on exciting projects.",
    email: "nguyen.vana@example.com",
    major: "Computer Science",
    university: "FPT University",
    joined: "Jan 2024",
    activeProjects: 2,
    completedProjects: 5,
    skillCount: 6,
  };

  const activeProject = {
    title: "E-commerce Platform",
    category: "Web Development",
    tags: ["React", "TypeScript", "Tailwind"],
    mentor: "Dr. Smith",
    progress: 65,
    members: [
      { name: "A", color: "bg-yellow-200" },
      { name: "B", color: "bg-blue-200" },
      { name: "C", color: "bg-purple-200" },
      { name: "D", color: "bg-green-200" },
    ],
    memberCount: 5,
  };

  const skills = [
    { name: "React", level: "Advanced", percent: 90 },
    { name: "TypeScript", level: "Intermediate", percent: 75 },
    { name: "UI/UX Design", level: "Advanced", percent: 88 },
    { name: "Figma", level: "Advanced", percent: 86 },
    { name: "Tailwind CSS", level: "Advanced", percent: 85 },
    { name: "Node.js", level: "Intermediate", percent: 72 },
  ];

  return (
    <div className="mt-10 max-w-6xl mx-auto px-4 space-y-8">
      {/* Header */}
      <div className="bg-white shadow rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center bg-blue-100 text-blue-600 w-20 h-20 rounded-full font-bold text-2xl">
            {profile.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>

          <div>
            <h1 className="!text-3xl !font-extrabold !bg-gradient-to-r !from-blue-600 !to-green-500 !text-transparent !bg-clip-text">
              {profile.name}
            </h1>
            <p className="!text-gray-500 !text-sm !mt-1 !max-w-3xl">
              {profile.headline}
            </p>

            {/* Info line */}
            <div className="!flex !flex-wrap !gap-x-6 !gap-y-2 !text-sm !text-gray-600 !mt-3">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" /> {profile.email}
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" /> {profile.major}
              </div>
              <div className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4" /> {profile.university}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Joined {profile.joined}
              </div>
            </div>
          </div>
        </div>

        <button className="!flex !items-center !gap-2 !bg-blue-600 !text-white !px-5 !py-2 !rounded-md !hover:bg-blue-700 !transition">
          <Edit className="!w-4 !h-4" />
          Edit Profile
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-2xl p-5 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Active Projects</p>
            <h2 className="text-3xl font-bold">{profile.activeProjects}</h2>
          </div>
          <ArrowUp className="text-green-500 w-6 h-6" />
        </div>

        <div className="bg-white shadow rounded-2xl p-5 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Completed Projects</p>
            <h2 className="text-3xl font-bold">{profile.completedProjects}</h2>
          </div>
          <LineChart className="text-green-500 w-6 h-6" />
        </div>

        <div className="bg-white shadow rounded-2xl p-5 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Skills</p>
            <h2 className="text-3xl font-bold">{profile.skillCount}</h2>
          </div>
          <ArrowUp className="text-green-500 w-6 h-6" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="bg-white shadow rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Active Projects</h3>
            <button className="text-blue-600 text-sm hover:underline">
              View All
            </button>
          </div>

          <hr className="my-4 border-gray-100" />

          <div className="border border-gray-100 rounded-xl p-4">
            <div>
              <p className="font-medium text-gray-900">{activeProject.title}</p>
              <p className="text-xs text-gray-500">{activeProject.category}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {activeProject.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-sm text-gray-600 mt-4">
              Mentor:{" "}
              <span className="text-gray-800 font-medium">
                {activeProject.mentor}
              </span>
            </p>

            {/* Progress */}
            <div className="mt-3">
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${activeProject.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {activeProject.progress}% Progress
              </p>
            </div>

            {/* Members */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center -space-x-2">
                {activeProject.members.map((m, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 flex items-center justify-center text-sm font-medium ${m.color} rounded-full border-2 border-white`}
                  >
                    {m.name}
                  </div>
                ))}
                <span className="text-xs text-gray-500 ml-3">
                  {activeProject.memberCount} Members
                </span>
              </div>

              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                <Users className="w-4 h-4" />
                View Details
              </button>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white shadow rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Skills</h3>
            <button className="text-blue-600 text-sm hover:underline">
              + Add Skill
            </button>
          </div>

          <hr className="my-4 border-gray-100" />

          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">
                    {skill.name}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      skill.level === "Advanced"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {skill.level}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${skill.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
