import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Tag,
  DatePicker,
  Tooltip,
  notification,
} from "antd";
import {
  SearchOutlined,
  UploadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "../../hook/useTranslation";
import { AdminService } from "../../services/admin.service";

const { RangePicker } = DatePicker;
const { Option } = Select;

const AuditLogs = () => {
  const { t } = useTranslation();

  const [filters, setFilters] = useState({
    search: "",
    action: "All Action",
    dateRange: null,
  });

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================== CALL API ==================
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await AdminService.getActivityLogs({ limit: 200 }, false);
        const data = Array.isArray(res?.data) ? res.data : [];

        const mapped = data.map((item, index) => ({
          key: item.activityId || index,
          timestamp: item.createdAt,
          actor:
            item.actorEmail ||
            item.actorDisplayName ||
            item.actorId ||
            "Unknown",
          action: item.action,
          entity: item.entityType || "-",
          entityId: item.entityId || "-",
          status: item.status || "",
          platform: item.platform || "Unknown",
          level: item.severity || "",
          description: item.message || "",
        }));

        setLogs(mapped);
      } catch (err) {
        notification.error({
          message: t("failedToFetchLogs") || "Failed to fetch logs",
          description:
            err?.response?.data?.message ||
            t("pleaseTryAgain") ||
            "Please try again",
        });
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // ================== COLOR CONFIG ==================
  const actionColors = {
    GROUP_CREATED: "green",
    USER_SUSPENDED: "red",
    POST_HIDDEN: "default",
    SETTINGS_UPDATED: "gold",
  };

  const statusColors = {
    success: "green",
    failed: "red",
    pending: "blue",
  };

  const levelColors = {
    info: "blue",
    warning: "orange",
    critical: "red",
  };

  // helper format
  const formatIsoToDisplay = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n) => (n < 10 ? `0${n}` : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const upperFirst = (s) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

  // ================== TABLE COLUMNS ==================
  const columns = [
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (text) => (
        <span className="text-gray-800 font-medium">
          {formatIsoToDisplay(text)}
        </span>
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
          {action?.replace(/_/g, " ") || "-"}
        </Tag>
      ),
    },
    {
      title: "Entity",
      dataIndex: "entity",
      key: "entity",
      render: (_, record) => (
        <span>
          {record.entity || "-"}{" "}
          {record.entityId && (
            <Tag color="geekblue" className="ml-1">
              {record.entityId}
            </Tag>
          )}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status?.toLowerCase()] || "default"}>
          {upperFirst(status)}
        </Tag>
      ),
    },
    {
      title: "Platform",
      dataIndex: "platform",
      key: "platform",
      render: (p) => <Tag color="purple">{p || "-"}</Tag>,
    },
    {
      title: "Severity",
      dataIndex: "level",
      key: "level",
      render: (level) => (
        <Tag color={levelColors[level?.toLowerCase()] || "blue"}>
          {upperFirst(level)}
        </Tag>
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

  // ================== FILTER CLIENT SIDE ==================
  const filteredLogs = logs.filter((log) => {
    const searchText = filters.search.toLowerCase();

    const searchMatch =
      log.actor.toLowerCase().includes(searchText) ||
      (log.action || "").toLowerCase().includes(searchText) ||
      (log.entity || "").toLowerCase().includes(searchText);

    const actionMatch =
      filters.action === "All Action" || log.action === filters.action;

    const dateMatch =
      !filters.dateRange ||
      (new Date(log.timestamp) >= filters.dateRange[0].toDate() &&
        new Date(log.timestamp) <= filters.dateRange[1].toDate());

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
      </div>

      {/* Filters */}
      <Card
        className="shadow-sm border-gray-100 rounded-lg"
        bodyStyle={{ padding: "20px 24px" }}
      >
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
            <Option value="GROUP_CREATED">GROUP_CREATED</Option>
            <Option value="USER_SUSPENDED">USER_SUSPENDED</Option>
            <Option value="POST_HIDDEN">POST_HIDDEN</Option>
            <Option value="SETTINGS_UPDATED">SETTINGS_UPDATED</Option>
          </Select>
          <RangePicker
            onChange={(range) => setFilters({ ...filters, dateRange: range })}
            className="w-full"
            placeholder={["From Date", "To Date"]}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredLogs}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          rowKey="key"
          bordered
          className="rounded-lg overflow-hidden mt-6"
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
};

export default AuditLogs;
