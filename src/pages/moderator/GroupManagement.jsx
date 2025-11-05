// src/pages/moderator/GroupManagement.jsx
import React, { useState } from "react";
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Tooltip,
  message,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  StopOutlined,
  BellOutlined,
} from "@ant-design/icons";
import GroupDetailModal from "../../components/moderator/GroupDetailModal";

const { Option } = Select;

export default function GroupManagement() {
  const [filters, setFilters] = useState({
    status: "All Status",
    major: "All Major",
    search: "",
  });

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  // Dữ liệu mẫu đã thêm capacity + isFull + membersDetail để modal hiển thị như ảnh
  const [rows, setRows] = useState([
    {
      key: 1,
      groupName: "AI Research Group",
      topic: "Machine Learning Applications in Healthcare",
      mentor: "Dr. Nguyễn Văn A",
      members: 5,
      capacity: 5,
      isFull: true,
      major: "Computer Science",
      status: "Active",
      membersDetail: [
        { id: 1, name: "Trần Thị B" },
        { id: 2, name: "Lê Văn C" },
        { id: 3, name: "Phạm Thị D" },
        { id: 4, name: "Hoàng Văn E" },
        { id: 5, name: "Đỗ Thị F" },
      ],
    },
    {
      key: 2,
      groupName: "Beta Squad",
      topic: "IoT Smart Campus Solutions",
      mentor: "Prof. Robert Davis",
      members: 4,
      capacity: 5,
      isFull: false,
      major: "Engineering",
      status: "Active",
      membersDetail: [
        { id: 1, name: "Alex P." },
        { id: 2, name: "Brian Q." },
        { id: 3, name: "Chloe R." },
        { id: 4, name: "Dana S." },
      ],
    },
    {
      key: 3,
      groupName: "Gamma Group",
      topic: "Not Assigned",
      mentor: "Not Assigned",
      members: 3,
      capacity: 5,
      isFull: false,
      major: "Information Technology",
      status: "Pending",
      membersDetail: [],
    },
  ]);

  const toggleFull = (record) => {
    setRows((prev) =>
      prev.map((r) => (r.key === record.key ? { ...r, isFull: !r.isFull } : r))
    );
    message.success(
      !record.isFull ? "Đã đánh dấu nhóm: Full" : "Đã mở lại tuyển thành viên"
    );
  };

  const remindTopic = (record) => {
    // TODO: gọi API thật ở đây
    message.info(
      `Đã gửi nhắc nhở nộp/chọn Topic cho nhóm "${record.groupName}".`
    );
  };

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
          <Tag color="orange">Not Assigned</Tag>
        ) : (
          <span>{text}</span>
        ),
    },
    {
      title: "Mentor",
      dataIndex: "mentor",
      key: "mentor",
      render: (text) =>
        text === "Not Assigned" ? (
          <Tag color="orange">Not Assigned</Tag>
        ) : (
          <span>{text}</span>
        ),
    },
    {
      title: "Members",
      key: "members",
      align: "center",
      render: (_, r) => {
        const full = r.isFull || (r.capacity ? r.members >= r.capacity : false);
        const text = r.capacity ? `${r.members}/${r.capacity}` : r.members;
        return <Tag color={full ? "green" : "blue"}>{text}</Tag>;
      },
    },
    { title: "Major", dataIndex: "major", key: "major" },
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
      render: (_, record) => {
        const noTopic = record.topic === "Not Assigned";
        return (
          <Space size="middle">
            <Tooltip title="View details">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => {
                  setCurrent(record);
                  setOpen(true);
                }}
              />
            </Tooltip>

            <Tooltip
              title={record.isFull ? "Reopen recruiting" : "Mark as Full"}
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
              title={noTopic ? "Send topic reminder" : "Topic already assigned"}
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
        <h1 className="inline-block text-4xl font-extrabold">
          Group Management
        </h1>
        {/* Moderator không tạo nhóm: bỏ nút Add Group */}
      </div>

      {/* Filters */}
      <Card
        className="shadow-sm border-gray-100 rounded-lg"
        bodyStyle={{ padding: "20px 24px" }}
      >
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
              value={filters.major}
              onChange={(v) => setFilters({ ...filters, major: v })}
              className="w-40"
            >
              <Option value="All Major">All Major</Option>
              <Option value="Computer Science">Computer Science</Option>
              <Option value="Engineering">Engineering</Option>
              <Option value="Information Technology">
                Information Technology
              </Option>
            </Select>
            <Select
              value={filters.status}
              onChange={(v) => setFilters({ ...filters, status: v })}
              className="w-36"
            >
              <Option value="All Status">All Status</Option>
              <Option value="Active">Active</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredRows}
        pagination={{ pageSize: 5 }}
        bordered
        className="rounded-lg mt-5"
      />

      {/* Detail Modal (UI giống ảnh) */}
      <GroupDetailModal
        open={open}
        onClose={() => setOpen(false)}
        group={current}
      />
    </div>
  );
}
