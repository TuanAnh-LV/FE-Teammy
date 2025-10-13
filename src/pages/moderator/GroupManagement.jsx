import React, { useState } from "react";
import { Card, Table, Input, Select, Button, Tag, Space } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const GroupManagement = () => {
  const [filters, setFilters] = useState({
    status: "All",
    faculty: "All Faculties",
    search: "",
  });

  const data = [
    {
      key: 1,
      groupName: "Alpha Team",
      topic: "AI-Powered Student Management",
      mentor: "Dr. Sarah Williams",
      members: 5,
      faculty: "Computer Science",
      status: "Active",
    },
    {
      key: 2,
      groupName: "Beta Squad",
      topic: "IoT Smart Campus Solutions",
      mentor: "Prof. Robert Davis",
      members: 4,
      faculty: "Engineering",
      status: "Active",
    },
    {
      key: 3,
      groupName: "Gamma Group",
      topic: "Not Assigned",
      mentor: "Not Assigned",
      members: 3,
      faculty: "Information Technology",
      status: "Pending",
    },
    {
      key: 4,
      groupName: "Delta Group",
      topic: "Blockchain in Education",
      mentor: "Dr. Sarah Williams",
      members: 6,
      faculty: "Information Technology",
      status: "Active",
    },
    {
      key: 5,
      groupName: "Epsilon Team",
      topic: "Machine Learning for Analytics",
      mentor: "Prof. Michael Chen",
      members: 5,
      faculty: "Computer Science",
      status: "Inactive",
    },
  ];

  const columns = [
    {
      title: "Group Name",
      dataIndex: "groupName",
      key: "groupName",
      render: (text) => (
        <span className="font-medium text-gray-800 hover:text-blue-600 transition">
          {text}
        </span>
      ),
    },
    {
      title: "Topic",
      dataIndex: "topic",
      key: "topic",
      render: (text) =>
        text === "Not Assigned" ? (
          <span className="text-gray-400 italic">{text}</span>
        ) : (
          text
        ),
    },
    {
      title: "Mentor",
      dataIndex: "mentor",
      key: "mentor",
      render: (text) =>
        text === "Not Assigned" ? (
          <span className="text-gray-400 italic">{text}</span>
        ) : (
          text
        ),
    },
    {
      title: "Members",
      dataIndex: "members",
      key: "members",
      align: "center",
    },
    {
      title: "Faculty",
      dataIndex: "faculty",
      key: "faculty",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          Active: "green",
          Pending: "orange",
          Inactive: "gray",
        };
        return (
          <Tag
            color={colorMap[status]}
            className="px-3 py-1 rounded-full font-medium"
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Space size="middle">
          <Button type="text" icon={<EyeOutlined />} />
          <Button type="text" icon={<EditOutlined />} />
          <Button type="text" icon={<DeleteOutlined />} danger />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="inline-block text-4xl font-extrabold"
            style={{
              backgroundImage: "linear-gradient(90deg,#3182ED 0%,#43D08A 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Group Management
          </h1>
          <p className="text-gray-500 text-sm">
            Full CRUD management for all project groups, members, mentors, and
            topics
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="!bg-blue-600 hover:!bg-blue-700 text-white px-6 py-2 rounded-lg shadow-sm"
        >
          Add Group
        </Button>
      </div>

      {/* Filters */}
      <Card
        className="shadow-sm border-gray-100 rounded-lg"
        bodyStyle={{ padding: "20px 24px" }}
      >
        <h3 className="font-semibold text-gray-800 mb-3">Filters & Search</h3>
        <p className="text-gray-500 text-sm mb-4">
          Filter groups by faculty, mentor, or project status
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Search by group name or mentor..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
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
              value={filters.status}
              onChange={(v) => setFilters({ ...filters, status: v })}
              className="w-36"
            >
              <Option>All</Option>
              <Option>Active</Option>
              <Option>Pending</Option>
              <Option>Inactive</Option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card
        className="shadow-sm border-gray-100 rounded-lg"
        bodyStyle={{ padding: "20px 24px" }}
      >
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 5 }}
          bordered
          className="rounded-lg"
        />
      </Card>
    </div>
  );
};

export default GroupManagement;
