import React, { useState } from "react";
import { Card, Input, Select, Tag, Button } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const Discover = () => {
  const [filters, setFilters] = useState({
    query: "",
    faculty: "",
    status: "",
  });

  const mockGroups = [
    {
      id: 1,
      name: "AI Research Group",
      shortDesc: "Machine Learning Applications",
      detail: "Exploring deep learning models for healthcare applications",
      members: 5,
      lastActive: "2 hours ago",
      faculty: "Computer Science",
      urgent: true,
    },
    {
      id: 2,
      name: "Web Innovation Lab",
      shortDesc: "Full-stack Web Solutions",
      detail: "Building scalable cloud-based web systems",
      members: 6,
      lastActive: "3 hours ago",
      faculty: "Information Systems",
      urgent: false,
    },
    {
      id: 3,
      name: "Blockchain Pioneers",
      shortDesc: "Decentralized Applications",
      detail: "Exploring blockchain frameworks for digital identity",
      members: 4,
      lastActive: "1 day ago",
      faculty: "Computer Science",
      urgent: true,
    },
  ];

  const filteredGroups = mockGroups.filter(
    (g) =>
      g.name.toLowerCase().includes(filters.query.toLowerCase()) &&
      (filters.faculty ? g.faculty === filters.faculty : true) &&
      (filters.status === "urgent" ? g.urgent : true)
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-1 mb-8">
        <h1
          className="inline-block text-4xl font-extrabold"
          style={{
            backgroundImage: "linear-gradient(90deg,#3182ED 0%,#43D08A 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
        >
          Discover
        </h1>
        <p className="text-gray-500 text-sm">
          Find student groups that need mentoring and make a difference
        </p>
        <p className="text-gray-400 text-xs">
          3 groups available • 2 need mentor
        </p>
      </div>

      {/* Filter Section */}
      <Card className="shadow-sm border-gray-100">
        <h3 className="text-gray-800 font-semibold mb-4">Smart Filters</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Input
            placeholder="Search groups, topics..."
            prefix={<SearchOutlined />}
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          />
          <Select
            placeholder="Faculty"
            allowClear
            onChange={(val) => setFilters({ ...filters, faculty: val })}
          >
            <Option value="Computer Science">Computer Science</Option>
            <Option value="Information Systems">Information Systems</Option>
          </Select>
          <Select
            placeholder="Status"
            allowClear
            onChange={(val) => setFilters({ ...filters, status: val })}
          >
            <Option value="urgent">Urgent</Option>
          </Select>
        </div>
      </Card>

      {/* Cards Section */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {filteredGroups.map((g) => (
          <Card
            key={g.id}
            className="shadow-md rounded-2xl border-gray-100 hover:shadow-lg transition-all"
            bodyStyle={{ padding: "20px" }}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-teal-500 inline-block"></span>
                <h3 className="font-semibold text-gray-800 text-lg">
                  {g.name}
                </h3>
              </div>
              {g.urgent && (
                <Tag color="red" className="font-semibold">
                  Urgent
                </Tag>
              )}
            </div>

            {/* Descriptions */}
            <p className="text-gray-500 text-sm font-medium">{g.shortDesc}</p>
            <p className="text-gray-400 text-sm mt-1">{g.detail}</p>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3 text-gray-500 text-sm">
              <div className="flex items-center gap-1">
                <UserOutlined />
                {g.members}
              </div>
              <div className="flex items-center gap-1">
                <ClockCircleOutlined />
                {g.lastActive}
              </div>
            </div>

            {/* Faculty tag */}
            <div className="mt-2">
              <Tag color="blue" className="rounded-md text-xs">
                {g.faculty}
              </Tag>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-4">
              <Button className="flex-1 bg-gray-100 hover:bg-gray-200">
                View Details
              </Button>
              <Button
                type="primary"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Mentor Now
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty state (nếu không có group nào) */}
      {filteredGroups.length === 0 && (
        <div className="text-center text-gray-400 mt-16">
          No groups found matching your filters.
        </div>
      )}
    </div>
  );
};

export default Discover;
