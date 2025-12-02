// src/pages/moderator/GroupManagement.jsx
import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Tooltip,
  notification,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  StopOutlined,
  BellOutlined,
} from "@ant-design/icons";
import GroupDetailModal from "../../components/moderator/GroupDetailModal";
import { useTranslation } from "../../hook/useTranslation";
import { GroupService } from "../../services/group.service";
import { normalizeGroup } from "../../utils/group.utils";

const { Option } = Select;

export default function GroupManagement() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    status: "All Status",
    major: "All Major",
    search: "",
  });

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  // rows loaded from API
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchList = async () => {
      setLoading(true);
      try {
        const res = await GroupService.getListGroup();
        const arr = Array.isArray(res?.data) ? res.data : [];
        const normalized = arr.map((g, idx) => normalizeGroup(g, idx));
        const mapped = normalized.map((g) => ({
          key: g.id,
          groupName: g.title,
          topic: g.topicTitle || "Not Assigned",
          mentor: g.mentor || "Not Assigned",
          members: g.members || 0,
          capacity: g.maxMembers || 5,
          isFull: g.members >= (g.maxMembers || 5),
          major: g.field || "",
          status:
            g.status && typeof g.status === "string"
              ? g.status.charAt(0).toUpperCase() + g.status.slice(1)
              : "Active",
          membersDetail: Array.isArray(g.memberPreview) ? g.memberPreview : [],
          raw: g,
        }));
        if (mounted) setRows(mapped);
      } catch (err) {

        notification.error({
          message: t("failedLoadGroups") || "Failed to load groups",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchList();
    return () => (mounted = false);
  }, []);

  const toggleFull = (record) => {
    setRows((prev) =>
      prev.map((r) => (r.key === record.key ? { ...r, isFull: !r.isFull } : r))
    );
    notification.success({
      message: !record.isFull
        ? t("groupMarkedFull") || "Marked group as full"
        : t("groupReopened") || "Reopened recruiting",
    });
  };

  const remindTopic = (record) => {
    // TODO: call real API here
    notification.info({
      message:
        t("topicReminderSent") ||
        `Reminder sent for group "${record.groupName}".`,
    });
  };

  const columns = [
    {
      title: t("groupName") || "Group Name",
      dataIndex: "groupName",
      key: "groupName",
      render: (text) => (
        <span className="font-medium text-gray-800 hover:text-blue-600 transition">
          {text}
        </span>
      ),
    },
    {
      title: t("topics") || "Topic",
      dataIndex: "topic",
      key: "topic",
      render: (text) =>
        text === "Not Assigned" ? (
          <Tag color="orange">{t("notAssigned") || "Not Assigned"}</Tag>
        ) : (
          <span>{text}</span>
        ),
    },
    {
      title: t("mentor") || "Mentor",
      dataIndex: "mentor",
      key: "mentor",
      render: (text) =>
        text === "Not Assigned" ? (
          <Tag color="orange">{t("notAssigned") || "Not Assigned"}</Tag>
        ) : (
          <span>{text}</span>
        ),
    },
    {
      title: t("members") || "Members",
      key: "members",
      align: "center",
      render: (_, r) => {
        const full = r.isFull || (r.capacity ? r.members >= r.capacity : false);
        const text = r.capacity ? `${r.members}/${r.capacity}` : r.members;
        return <Tag color={full ? "green" : "blue"}>{text}</Tag>;
      },
    },
    { title: t("major") || "Major", dataIndex: "major", key: "major" },
    {
      title: t("status") || "Status",
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
      title: t("actions") || "Actions",
      key: "actions",
      render: (_, record) => {
        const noTopic = record.topic === "Not Assigned";
        return (
          <Space size="middle">
            <Tooltip title={t("viewDetails") || "View details"}>
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={async () => {
                  try {
                    const res = await GroupService.getGroupDetail(record.key);
                    if (res?.data) {
                      setCurrent(res.data);
                      setOpen(true);
                    }
                  } catch (err) {

                    notification.error({
                      message:
                        t("failedLoadGroupDetail") ||
                        "Failed to load group detail",
                    });
                  }
                }}
              />
            </Tooltip>

            <Tooltip
              title={
                record.isFull
                  ? t("reopenRecruiting") || "Reopen recruiting"
                  : t("markAsFull") || "Mark as Full"
              }
            >
              <Button
                type="text"
                icon={
                  record.isFull ? <StopOutlined /> : <CheckCircleOutlined />
                }
                onClick={() => toggleFull(record)}
              />
            </Tooltip>

            <Tooltip
              title={
                noTopic
                  ? t("sendTopicReminder") || "Send topic reminder"
                  : t("topicAlreadyAssigned") || "Topic already assigned"
              }
            >
              <Button
                type="text"
                icon={<BellOutlined />}
                disabled={!noTopic}
                onClick={() => remindTopic(record)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const filteredRows = rows.filter((item) => {
    const s = filters.search.toLowerCase();
    const searchMatch =
      item.groupName.toLowerCase().includes(s) ||
      item.mentor.toLowerCase().includes(s);
    const majorMatch =
      filters.major === "All Major" || item.major === filters.major;
    const statusMatch =
      filters.status === "All Status" || item.status === filters.status;
    return searchMatch && majorMatch && statusMatch;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="inline-block text-2xl sm:text-3xl lg:text-4xl font-extrabold">
          {t("groupManagement") || "Group Management"}
        </h1>
      </div>

      {/* Filters */}
      <Card
        className="shadow-sm border-gray-100 rounded-lg"
        bodyStyle={{ padding: "20px 24px" }}
      >
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder={
              t("searchByGroupOrMentor") || "Search by group name or mentor..."
            }
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="sm:w-1/2"
          />
          <div className="flex gap-2">
            <Select
              value={filters.major}
              onChange={(v) => setFilters({ ...filters, major: v })}
              className="w-40"
            >
              <Option value="All Major">{t("allMajor") || "All Major"}</Option>
              <Option value="Computer Science">
                {t("computerScience") || "Computer Science"}
              </Option>
              <Option value="Engineering">
                {t("engineering") || "Engineering"}
              </Option>
              <Option value="Information Technology">
                {t("informationTechnology") || "Information Technology"}
              </Option>
            </Select>
            <Select
              value={filters.status}
              onChange={(v) => setFilters({ ...filters, status: v })}
              className="w-36"
            >
              <Option value="All Status">
                {t("allStatus") || "All Status"}
              </Option>
              <Option value="Active">{t("active") || "Active"}</Option>
              <Option value="Pending">{t("pending") || "Pending"}</Option>
              <Option value="Inactive">{t("inactive") || "Inactive"}</Option>
            </Select>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={filteredRows}
          pagination={{ pageSize: 5 }}
          bordered
          loading={loading}
          scroll={{ x: "max-content" }}
          className="rounded-lg mt-5"
        />
      </Card>

      {/* Detail Modal (UI giống ảnh) */}
      <GroupDetailModal
        open={open}
        onClose={() => setOpen(false)}
        group={current}
      />
    </div>
  );
}

