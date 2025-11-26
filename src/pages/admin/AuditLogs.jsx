import React, { useState } from "react";
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Tag,
  DatePicker,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  UploadOutlined,
  EllipsisOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "../../hook/useTranslation";
const { RangePicker } = DatePicker;
const { Option } = Select;

const AuditLogs = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    search: "",
    action: "All Action",
    dateRange: null,
  });

  const logs = [
    {
      key: 1,
      timestamp: "2025-10-22 09:15:45",
      actor: "truonglv11@fe.edu.vn",
      action: "USER SUSPENDED",
      entity: "User",
      entityId: "U1023",
      status: "Success",
      ipAddress: "192.168.10.12",
      platform: "Web",
      level: "Critical",
      description: "Suspended user due to policy violation",
    },
    {
      key: 2,
      timestamp: "2025-10-22 09:18:22",
      actor: "admin@teammy.edu.vn",
      action: "POST HIDDEN",
      entity: "Post",
      entityId: "P552",
      status: "Success",
      ipAddress: "10.0.2.15",
      platform: "API",
      level: "Warning",
      description: "Hidden a report-flagged post",
    },
    {
      key: 3,
      timestamp: "2025-10-22 09:25:19",
      actor: "mentor01@fpt.edu.vn",
      action: "GROUP CREATED",
      entity: "Group",
      entityId: "G87",
      status: "Success",
      ipAddress: "192.168.0.54",
      platform: "Mobile",
      level: "Info",
      description: "Created new project group: AI Tutor System",
    },
    {
      key: 4,
      timestamp: "2025-10-22 10:01:02",
      actor: "sysadmin@teammy.edu.vn",
      action: "SETTINGS UPDATED",
      entity: "SystemSettings",
      entityId: "CFG001",
      status: "Failed",
      ipAddress: "172.16.1.3",
      platform: "Web",
      level: "Warning",
      description: "Attempted to update SMTP configuration",
    },
  ];

  const actionColors = {
    "USER SUSPENDED": "red",
    "POST HIDDEN": "default",
    "GROUP CREATED": "green",
    "SETTINGS UPDATED": "gold",
  };

  const statusColors = {
    Success: "green",
    Failed: "red",
    Pending: "blue",
  };

  const levelColors = {
    Info: "blue",
    Warning: "orange",
    Critical: "red",
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
          className="px-3 py-0.5 rounded-full font-medium"
        >
          {action}
        </Tag>
      ),
    },
    {
      title: "Entity",
      dataIndex: "entity",
      key: "entity",
      render: (_, record) => (
        <span>
          {record.entity}{" "}
          <Tag color="geekblue" className="ml-1">
            {record.entityId}
          </Tag>
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status] || "default"}>{status}</Tag>
      ),
    },
    {
      title: "IP",
      dataIndex: "ipAddress",
      key: "ipAddress",
      render: (ip) => <span className="text-gray-500">{ip}</span>,
    },
    {
      title: "Platform",
      dataIndex: "platform",
      key: "platform",
      render: (p) => <Tag color="purple">{p}</Tag>,
    },
    {
      title: "Severity",
      dataIndex: "level",
      key: "level",
      render: (level) => (
        <Tag color={levelColors[level] || "blue"}>{level}</Tag>
      ),
    },
    {
      title: "Details",
      key: "details",
      render: (_, record) => (
        <Tooltip title={record.description}>
          <Button
            icon={<InfoCircleOutlined />}
            shape="circle"
            className="border-gray-200 hover:border-gray-400"
          />
        </Tooltip>
      ),
    },
  ];
  // Thêm ngay trước return
  const filteredLogs = logs.filter((log) => {
    const searchText = filters.search.toLowerCase();

    const searchMatch =
      log.actor.toLowerCase().includes(searchText) ||
      log.action.toLowerCase().includes(searchText) ||
      log.entity.toLowerCase().includes(searchText);

    const actionMatch =
      filters.action === "All Action" || log.action === filters.action;

    const dateMatch =
      !filters.dateRange ||
      (new Date(log.timestamp) >= filters.dateRange[0]._d &&
        new Date(log.timestamp) <= filters.dateRange[1]._d);

    return searchMatch && actionMatch && dateMatch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="inline-block text-2xl sm:text-3xl lg:text-4xl font-extrabold">
            System Logs
          </h1>
        </div>

        <Button
          icon={<UploadOutlined />}
          className="!border-gray-300 hover:!border-orange-400  hover:!text-orange-400 transition-all !py-5"
        >
          <span className="hidden sm:inline">Export CSV</span>
        </Button>
      </div>

      {/* Filters */}
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
            placeholder={
              t("searchByEmailAction") || "Search by email, action..."
            }
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Select
            value={filters.action}
            onChange={(v) => setFilters({ ...filters, action: v })}
            className="w-full"
          >
            <Option value="All Action">All Action</Option>
            <Option value="USER SUSPENDED">USER SUSPENDED</Option>
            <Option value="POST HIDDEN">POST HIDDEN</Option>
            <Option value="GROUP CREATED">GROUP CREATED</Option>
            <Option value="SETTINGS UPDATED">SETTINGS UPDATED</Option>
          </Select>
          <RangePicker
            onChange={(range) => setFilters({ ...filters, dateRange: range })}
            className="w-full"
            placeholder={["From Date", "To Date"]}
          />
        </div>
      </Card>

      {/* Table */}
      <Card
        className="shadow-sm border-gray-100 rounded-lg"
        bodyStyle={{ padding: "20px 24px" }}
      >
        <h3 className="font-semibold text-gray-800 mb-3">Audit Trail</h3>
        <p className="text-gray-500 text-sm mb-4">
          Chronological record of all system actions
        </p>

        <Table
          columns={columns}
          dataSource={filteredLogs}
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
          }}
          bordered
          className="rounded-lg overflow-hidden"
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
};

export default AuditLogs;
