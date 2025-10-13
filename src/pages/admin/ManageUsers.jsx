import React, { useState } from "react";
import { Table, Input, Select, Button, Tag, Space, Card } from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  EllipsisOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const ManageUsers = () => {
  const [filters, setFilters] = useState({
    role: "All Roles",
    status: "All Status",
    faculty: "All Faculties",
    search: "",
  });

  const users = [
    {
      key: 1,
      name: "Tuan Anh",
      email: "anhlvtse172914@fpt.edu.vn",
      role: "Admin",
      faculty: "Engineering",
      status: "Active",
    },
    {
      key: 2,
      name: "Tuan Anh",
      email: "anhlvtse172914@fpt.edu.vn",
      role: "Mentor",
      faculty: "Business",
      status: "Suspended",
    },
    {
      key: 3,
      name: "Tuan Anh",
      email: "anhlvtse172914@fpt.edu.vn",
      role: "Student",
      faculty: "Engineering",
      status: "Inactive",
    },
    {
      key: 4,
      name: "Tuan Anh",
      email: "anhlvtse172914@fpt.edu.vn",
      role: "Admin",
      faculty: "Engineering",
      status: "Active",
    },
  ];

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <span className="text-gray-500">{text}</span>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag color="blue">{role}</Tag>,
    },
    { title: "Faculty", dataIndex: "faculty", key: "faculty" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          Active: "green",
          Suspended: "red",
          Inactive: "default",
        };
        return (
          <Tag
            color={colorMap[status]}
            className="px-3 py-0.5 rounded-full text-xs"
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
        <Button
          icon={<EllipsisOutlined />}
          shape="circle"
          className="border-gray-200 hover:border-gray-400"
        />
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
            Users & Roles
          </h1>
          <p className="text-gray-500 text-sm">
            Manage users, roles, and permissions across the platform
          </p>
        </div>
        <Space>
          <Button
            icon={<UploadOutlined />}
            className="!border-gray-300 hover:!border-blue-400 transition-all"
          >
            Import CSV
          </Button>
          <Button
            icon={<PlusOutlined />}
            type="default"
            className="!text-white !bg-gradient-to-r from-[#3182ED] to-[#43D08A]
             hover:!opacity-90 !shadow-sm !border-none !rounded-lg
             !px-6 !py-2 transition-all duration-200 font-medium"
          >
            Add User
          </Button>
        </Space>
      </div>

      <div className="flex flex-col gap-6">
        {/* Filters & Search */}
        <Card
          className="shadow-sm border-gray-100"
          bodyStyle={{ padding: "20px 24px" }}
        >
          <h3 className="font-semibold text-gray-800 mb-3">Filters & Search</h3>
          <p className="text-gray-500 text-sm mb-4">
            Filter users by role, status, or faculty
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="sm:col-span-1"
            />
            <Select
              value={filters.role}
              onChange={(v) => setFilters({ ...filters, role: v })}
              className="w-full"
            >
              <Option>All Roles</Option>
              <Option>Admin</Option>
              <Option>Mentor</Option>
              <Option>Student</Option>
            </Select>
            <Select
              value={filters.status}
              onChange={(v) => setFilters({ ...filters, status: v })}
              className="w-full"
            >
              <Option>All Status</Option>
              <Option>Active</Option>
              <Option>Inactive</Option>
              <Option>Suspended</Option>
            </Select>
            <Select
              value={filters.faculty}
              onChange={(v) => setFilters({ ...filters, faculty: v })}
              className="w-full"
            >
              <Option>All Faculties</Option>
              <Option>Engineering</Option>
              <Option>Business</Option>
              <Option>IT</Option>
            </Select>
          </div>
        </Card>

        {/* Users Table */}
        <Card
          className="shadow-sm border-gray-100"
          bodyStyle={{ padding: "20px 24px" }}
        >
          <h3 className="font-semibold text-gray-800 mb-3">Users (5)</h3>
          <p className="text-gray-500 text-sm mb-4">
            Complete list of all users in the system
          </p>
          <Table
            columns={columns}
            dataSource={users}
            pagination={{ pageSize: 5 }}
            bordered
            className="rounded-lg"
          />
        </Card>
      </div>
    </div>
  );
};

export default ManageUsers;
