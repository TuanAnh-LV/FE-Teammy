import React, { useState } from "react";
import { Card, Table, Input, Select, Button, Tag, Space } from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CopyOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const { Option } = Select;

const TopicManagement = () => {
  const [filters, setFilters] = useState({
    faculty: "All Faculties",
    field: "All Fields",
    search: "",
  });

  const data = [
    {
      key: 1,
      title: "AI-Powered Student Management System",
      field: "Artificial Intelligence",
      group: "Alpha Team",
      mentor: "Dr. Sarah Williams",
      faculty: "Computer Science",
      date: "2025-09-15",
    },
    {
      key: 2,
      title: "IoT Smart Campus Solutions",
      field: "Internet of Things",
      group: "Beta Squad",
      mentor: "Prof. Robert Davis",
      faculty: "Engineering",
      date: "2025-09-18",
    },
    {
      key: 3,
      title: "Blockchain in Education",
      field: "Blockchain",
      group: "Delta Group",
      mentor: "Dr. Sarah Williams",
      faculty: "Information Technology",
      date: "2025-09-20",
    },
    {
      key: 4,
      title: "Machine Learning for Academic Analytics",
      field: "Machine Learning",
      group: "Epsilon Team",
      mentor: "Prof. Michael Chen",
      faculty: "Computer Science",
      date: "2025-09-22",
    },
    {
      key: 5,
      title: "Cloud-Based Learning Platform",
      field: "Cloud Computing",
      group: "Not assigned",
      mentor: "Dr. Emily Johnson",
      faculty: "Computer Science",
      date: "2025-09-25",
    },
    {
      key: 6,
      title: "Mobile App for Campus Services",
      field: "Mobile Development",
      group: "Not assigned",
      mentor: "Prof. Robert Davis",
      faculty: "Engineering",
      date: "2025-09-28",
    },
  ];

  const summary = {
    total: 6,
    assigned: 4,
    available: 2,
  };

  const chartData = [
    { name: "Computer Science", value: 3, color: "#3B82F6" },
    { name: "Engineering", value: 2, color: "#22C55E" },
    { name: "Information Technology", value: 1, color: "#F59E0B" },
  ];

  const columns = [
    {
      title: "Topic Title",
      dataIndex: "title",
      key: "title",
      render: (text) => (
        <span className="font-medium text-gray-800 hover:text-blue-600 transition">
          {text}
        </span>
      ),
    },
    {
      title: "Field",
      dataIndex: "field",
      key: "field",
      render: (field) => (
        <Tag
          color="default"
          className="px-3 py-1 rounded-full text-gray-700 bg-gray-100 border-none"
        >
          {field}
        </Tag>
      ),
    },
    {
      title: "Assigned Group",
      dataIndex: "group",
      key: "group",
      render: (group) =>
        group === "Not assigned" ? (
          <span className="text-gray-400 italic">{group}</span>
        ) : (
          <span className="text-gray-800">{group}</span>
        ),
    },
    {
      title: "Mentor",
      dataIndex: "mentor",
      key: "mentor",
    },
    {
      title: "Faculty",
      dataIndex: "faculty",
      key: "faculty",
    },
    {
      title: "Created Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Space size="middle">
          <Button type="text" icon={<EyeOutlined />} />
          <Button type="text" icon={<CopyOutlined />} />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className="inline-block text-4xl font-extrabold"
          style={{
            backgroundImage: "linear-gradient(90deg,#3182ED 0%,#43D08A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Topic Management
        </h1>
        <p className="text-gray-500 text-sm">
          View and track all project topics and coverage across faculties
        </p>
      </div>

      {/* Layout: Table + Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Table */}
        <Card
          className="xl:col-span-3 shadow-sm border-gray-100 rounded-lg"
          bodyStyle={{ padding: "20px 24px" }}
        >
          <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Search by topic title or mentor..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="sm:w-1/2"
            />
            <div className="flex gap-2">
              <Select
                value={filters.faculty}
                onChange={(v) => setFilters({ ...filters, faculty: v })}
                className="w-40"
              >
                <Option>All Faculties</Option>
                <Option>Computer Science</Option>
                <Option>Engineering</Option>
                <Option>Information Technology</Option>
              </Select>
              <Select
                value={filters.field}
                onChange={(v) => setFilters({ ...filters, field: v })}
                className="w-36"
              >
                <Option>All Fields</Option>
                <Option>AI</Option>
                <Option>IoT</Option>
                <Option>Cloud</Option>
              </Select>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            bordered
            className="rounded-lg"
          />
        </Card>

        {/* Sidebar Summary */}
        <div className="flex flex-col gap-6">
          {/* Summary Card */}
          <Card className="shadow-sm border-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Summary</h3>
            <p className="text-sm text-gray-600">
              Total Topics:{" "}
              <span className="font-semibold text-gray-800">
                {summary.total}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Assigned:{" "}
              <span className="font-semibold text-green-600">
                {summary.assigned}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Available:{" "}
              <span className="font-semibold text-orange-500">
                {summary.available}
              </span>
            </p>
          </Card>

          {/* Chart Card */}
          <Card className="shadow-sm border-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">
              Topics by Faculty
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Reminder Button */}
          <Card className="shadow-sm border-gray-100 rounded-lg text-center">
            <Button
              type="primary"
              icon={<SendOutlined />}
              className="!bg-blue-600 hover:!bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Send Reminder
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              to groups without topics
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TopicManagement;
