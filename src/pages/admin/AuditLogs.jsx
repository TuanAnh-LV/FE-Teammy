import React, { useState } from "react";
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Tag,
  Space,
  DatePicker,
} from "antd";
import {
  SearchOutlined,
  UploadOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { Option } = Select;

const AuditLogs = () => {
  const [filters, setFilters] = useState({
    search: "",
    action: "All Action",
    dateRange: null,
  });

  const logs = [
    {
      key: 1,
      timestamp: "2024-01-15 14:30:25",
      actor: "anhlvtse172914@fpt.edu.vn",
      action: "USER SUSPENDED",
      entity: "User",
    },
    {
      key: 2,
      timestamp: "2024-01-15 14:30:25",
      actor: "anhlvtse172914@fpt.edu.vn",
      action: "POST HIDDEN",
      entity: "Post",
    },
    {
      key: 3,
      timestamp: "2024-01-15 14:30:25",
      actor: "anhlvtse172914@fpt.edu.vn",
      action: "GROUP CREATED",
      entity: "Group",
    },
    {
      key: 4,
      timestamp: "2024-01-15 14:30:25",
      actor: "anhlvtse172914@fpt.edu.vn",
      action: "SETTINGS UPDATED",
      entity: "SystemSettings",
    },
  ];

  const actionColors = {
    "USER SUSPENDED": "red",
    "POST HIDDEN": "default",
    "GROUP CREATED": "green",
    "SETTINGS UPDATED": "gold",
  };

  const columns = [
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (text) => (
        <span className="text-gray-800 font-medium">{text}</span>
      ),
    },
    {
      title: "Actor",
      dataIndex: "actor",
      key: "actor",
      render: (text) => <span className="text-gray-500">{text}</span>,
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action) => (
        <Tag
          color={actionColors[action] || "blue"}
          className="px-3 py-0.5 text-xs rounded-full font-medium"
        >
          {action}
        </Tag>
      ),
    },
    {
      title: "Details",
      key: "details",
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
            System Logs
          </h1>
          <p className="text-gray-500 text-sm">
            Monitor system activities and user actions
          </p>
        </div>

        <Button
          icon={<UploadOutlined />}
          className="!border-gray-300 hover:!border-blue-400 transition-all"
        >
          Export CSV
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-6">
        <Card
          className="shadow-sm border-gray-100 rounded-lg"
          bodyStyle={{ padding: "20px 24px" }}
        >
          <h3 className="font-semibold text-gray-800 mb-3">Filters & Search</h3>
          <p className="text-gray-500 text-sm mb-4">
            Filter audit logs by actor, action, or entity
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Search by email, action..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
            <Select
              value={filters.action}
              onChange={(v) => setFilters({ ...filters, action: v })}
              className="w-full"
            >
              <Option>All Action</Option>
              <Option>USER SUSPENDED</Option>
              <Option>POST HIDDEN</Option>
              <Option>GROUP CREATED</Option>
              <Option>SETTINGS UPDATED</Option>
            </Select>
            <RangePicker
              onChange={(range) => setFilters({ ...filters, dateRange: range })}
              className="w-full"
              placeholder={["From Date", "To Date"]}
            />
          </div>
        </Card>

        {/* Audit Table */}
        <Card
          className="shadow-sm border-gray-100 rounded-lg mt-2"
          bodyStyle={{ padding: "20px 24px" }}
        >
          <h3 className="font-semibold text-gray-800 mb-3">Audit Trail</h3>
          <p className="text-gray-500 text-sm mb-4">
            Chronological record of all system actions
          </p>

          <Table
            columns={columns}
            dataSource={logs}
            pagination={false}
            bordered
            className="rounded-lg"
            style={{ backgroundColor: "white" }}
          />
        </Card>
      </div>
    </div>
  );
};

export default AuditLogs;
