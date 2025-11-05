import React, { useMemo, useState } from "react";
import { Card, Table, Input, Select, Button, Space, Tooltip } from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CopyOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import TopicDetailModal from "../../components/moderator/TopicDetailModal";
const { Option } = Select;

const TopicManagement = () => {
  const [filters, setFilters] = useState({
    status: "All Status", // <-- dùng status thay vì major
    search: "",
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(null);

  const data = [
    {
      key: 1,
      title: "AI-Powered Student Management System",
      group: "Alpha Team",
      mentor: "Dr. Sarah Williams",
      major: "Computer Science",
      date: "2025-09-15",
      downloadLink: "https://example.com/ai-student-management.pdf", // Example download link
      githubLink: "https://github.com/username/repository",
    },
    {
      key: 2,
      title: "IoT Smart Campus Solutions",
      group: "Beta Squad",
      mentor: "Prof. Robert Davis",
      major: "Engineering",
      date: "2025-09-18",
      downloadLink: "https://example.com/ai-student-management.pdf", // Example download link
      githubLink: "https://github.com/username/repository",
    },
    {
      key: 3,
      title: "Blockchain in Education",
      group: "Delta Group",
      mentor: "Dr. Sarah Williams",
      major: "Information Technology",
      date: "2025-09-20",
      downloadLink: "https://example.com/ai-student-management.pdf", // Example download link
      githubLink: "https://github.com/username/repository",
    },
    {
      key: 4,
      title: "Machine Learning for Academic Analytics",
      group: "Epsilon Team",
      mentor: "Prof. Michael Chen",
      major: "Computer Science",
      date: "2025-09-22",
      downloadLink: "https://example.com/ai-student-management.pdf", // Example download link
      githubLink: "https://github.com/username/repository",
    },
    {
      key: 5,
      title: "Cloud-Based Learning Platform",
      group: "Not assigned",
      mentor: "Dr. Emily Johnson",
      major: "Computer Science",
      date: "2025-09-25",
    },
    {
      key: 6,
      title: "Mobile App for Campus Services",
      group: "Not assigned",
      mentor: "Prof. Robert Davis",
      major: "Engineering",
      date: "2025-09-28",
    },
  ];

  // Suy ra status ẩn: "Available" nếu chưa gán group, ngược lại "Not Available"
  const getStatus = (row) =>
    row.group === "Not assigned" ? "Available" : "Not Available";

  // Lọc theo search + status (status không cần hiển thị trong table)
  const filteredData = useMemo(() => {
    const s = filters.search.toLowerCase().trim();

    return data.filter((item) => {
      const searchMatch =
        item.title.toLowerCase().includes(s) ||
        item.mentor.toLowerCase().includes(s);

      const statusStr = getStatus(item);
      const statusMatch =
        filters.status === "All Status" || statusStr === filters.status;

      return searchMatch && statusMatch;
    });
  }, [data, filters]);

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
    { title: "Mentor", dataIndex: "mentor", key: "mentor" },
    { title: "Major", dataIndex: "major", key: "major" },
    { title: "Created Date", dataIndex: "date", key: "date" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setCurrentTopic(record); // Set the selected topic
                setIsModalVisible(true); // Open modal
              }}
            />
          </Tooltip>
          <Tooltip title="Copy topic">
            <Button type="text" icon={<CopyOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="inline-block text-4xl font-extrabold">
          Topic Management
        </h1>
        <Space>
          <Button
            icon={<UploadOutlined />}
            className="!border-gray-300 hover:!border-orange-400 hover:!text-orange-400 transition-all !py-5"
          >
            Import topic
          </Button>
        </Space>
      </div>

      {/* Layout: Table */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
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
                value={filters.status}
                onChange={(v) => setFilters({ ...filters, status: v })}
                className="w-40"
              >
                <Option value="All Status">All Status</Option>
                <Option value="Available">Available</Option>
                <Option value="Not Available">Not Available</Option>
              </Select>
            </div>
          </div>

          <Table
            rowKey="key"
            columns={columns}
            dataSource={filteredData}
            pagination={false}
            bordered
            className="rounded-lg"
          />
        </Card>

        {/* Sidebar Summary (tuỳ chọn) */}
        <div className="flex flex-col gap-6">
          <Card className="shadow-sm border-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Summary</h3>
            {/* Có thể tính lại theo filteredData nếu muốn thống kê theo filter hiện tại */}
            <p className="text-sm text-gray-600">
              Total Topics:{" "}
              <span className="font-semibold text-gray-800">{data.length}</span>
            </p>
            <p className="text-sm text-gray-600">
              Assigned:{" "}
              <span className="font-semibold text-green-600">
                {data.filter((d) => getStatus(d) === "Not Available").length}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Available:{" "}
              <span className="font-semibold text-orange-500">
                {data.filter((d) => getStatus(d) === "Available").length}
              </span>
            </p>
          </Card>
        </div>
      </div>
      <TopicDetailModal
        open={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        topicDetails={currentTopic}
      />
    </div>
  );
};

export default TopicManagement;
