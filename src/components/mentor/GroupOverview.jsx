import React from "react";
import { Tag, Progress } from "antd";
import {
  TeamOutlined,
  CalendarOutlined,
  PieChartOutlined,
} from "@ant-design/icons";

export default function GroupOverview() {
  const group = {
    description: "Exploring deep learning models for healthcare applications.",
    tags: ["AI", "Deep Learning", "Healthcare"],
    faculty: "Computer Science",
    mentor: "Dr. Sarah Williams",
    members: 5,
    progress: 78,
    activeWeeks: 9,
    status: "On Track",
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-50 p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">
            Project Overview
          </h2>
          <p className="text-gray-500 text-sm max-w-xl">{group.description}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          {group.tags.map((t) => (
            <Tag
              key={t}
              color="blue"
              className="rounded-md text-xs font-medium px-3 py-1 border border-blue-100 bg-blue-50 text-blue-600"
            >
              {t}
            </Tag>
          ))}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left column */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TeamOutlined className="text-blue-500" /> Group Information
          </h3>
          <div className="space-y-2 text-gray-600 text-sm">
            <p>
              <span className="font-medium text-gray-700">Members:</span>{" "}
              {group.members}
            </p>
            <p>
              <span className="font-medium text-gray-700">Faculty:</span>{" "}
              {group.faculty}
            </p>
            <p>
              <span className="font-medium text-gray-700">Mentor:</span>{" "}
              <span className="font-semibold text-gray-800">
                {group.mentor}
              </span>
            </p>
          </div>
          <div className="mt-6">
            <Progress
              percent={group.progress}
              strokeColor="#43D08A"
              trailColor="#e5e7eb"
              strokeWidth={10}
              showInfo={false}
            />
            <div className="flex justify-between items-center mt-2">
              <Tag
                color="success"
                className="rounded-full text-xs font-medium px-2 py-0.5"
              >
                {group.status}
              </Tag>
              <span className="text-gray-600 text-sm font-medium">
                {group.progress}%
              </span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col items-start justify-between">
            <div className="flex items-center gap-2">
              <PieChartOutlined className="text-blue-500 text-xl" />
              <h4 className="text-sm font-medium text-gray-600">
                Task Completion
              </h4>
            </div>
            <p className="text-3xl font-bold text-blue-600 mt-3">
              {group.progress}%
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col items-start justify-between">
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-green-500 text-xl" />
              <h4 className="text-sm font-medium text-gray-600">
                Active Weeks
              </h4>
            </div>
            <p className="text-3xl font-bold text-green-500 mt-3">
              {group.activeWeeks}w
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
