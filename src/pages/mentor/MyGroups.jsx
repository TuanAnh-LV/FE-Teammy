import React, { useState } from "react";
import {
  Card,
  Progress,
  Tag,
  Table,
  Input,
  Segmented,
  Button,
  Typography,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";

const MyGroups = () => {
  // 🧠 Mock dữ liệu
  const mockStats = {
    totalGroups: 4,
    avgProgress: 68,
    needAttention: 2,
    highPriority: 1,
  };

  const mockGroups = [
    {
      id: 1,
      name: "AI Research Team",
      members: 5,
      startDate: "15/01/2024",
      progress: 78,
      activity: 24,
      tasks: 5,
      nextMilestone: "Mid-term presentation",
      due: "Due in 5 days",
      status: "At risk",
    },
    {
      id: 2,
      name: "Web Innovation Lab",
      members: 6,
      startDate: "20/02/2024",
      progress: 85,
      activity: 32,
      tasks: 6,
      nextMilestone: "Final Demo",
      due: "Due in 12 days",
      status: "On track",
    },
    {
      id: 3,
      name: "Business Analytics Team",
      members: 4,
      startDate: "10/03/2024",
      progress: 58,
      activity: 12,
      tasks: 3,
      nextMilestone: "Progress Check",
      due: "Due in 7 days",
      status: "At risk",
    },
  ];

  const [filter, setFilter] = useState("All Groups");

  const columns = [
    {
      title: "Group Name",
      dataIndex: "name",
      render: (_, record) => (
        <div>
          <p className="font-semibold">{record.name}</p>
          <p className="text-gray-500 text-xs">
            {record.members} members • Since {record.startDate}
          </p>
        </div>
      ),
    },
    {
      title: "Progress",
      dataIndex: "progress",
      render: (_, record) => (
        <div>
          <Progress
            percent={record.progress}
            size="small"
            status={record.status === "At risk" ? "exception" : "active"}
          />
          <Tag
            color={record.status === "At risk" ? "volcano" : "green"}
            className="mt-1"
          >
            {record.status}
          </Tag>
        </div>
      ),
    },
    {
      title: "Activity (7d)",
      dataIndex: "activity",
    },
    {
      title: "Tasks",
      dataIndex: "tasks",
    },
    {
      title: "Next Milestone",
      dataIndex: "nextMilestone",
      render: (_, record) => (
        <div>
          <p className="font-medium">{record.nextMilestone}</p>
          <p className="text-gray-400 text-xs">{record.due}</p>
        </div>
      ),
    },
    {
      title: "Actions",
      render: () => (
        <Button type="link" className="text-blue-600">
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
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
          My Groups
        </h1>

        <p className="text-gray-500">
          Manage and track your assigned student groups
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <p className="text-sm text-gray-500">Total Groups</p>
          <p className="text-2xl font-bold">{mockStats.totalGroups}</p>
          <p className="text-xs text-gray-400 mt-1">Active projects</p>
        </Card>

        <Card className="shadow-sm bg-green-50">
          <p className="text-sm text-gray-500">Avg Progress</p>
          <p className="text-2xl font-bold text-green-600">
            {mockStats.avgProgress}%
          </p>
          <p className="text-xs text-gray-400 mt-1">Across all active groups</p>
        </Card>

        <Card className="shadow-sm bg-yellow-50">
          <p className="text-sm text-gray-500">Need Attention</p>
          <p className="text-2xl font-bold text-yellow-600">
            {mockStats.needAttention}
          </p>
          <p className="text-xs text-gray-400 mt-1">Groups at risk</p>
        </Card>

        <Card className="shadow-sm bg-red-50">
          <p className="text-sm text-gray-500">High Priority</p>
          <p className="text-2xl font-bold text-red-600">
            {mockStats.highPriority}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Require immediate follow-up
          </p>
        </Card>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col md:flex-row justify-between gap-3">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search groups or milestones..."
          className="w-full md:w-1/3"
        />
        <Segmented
          options={["All Groups", "Active", "Archived"]}
          onChange={(val) => setFilter(val)}
          value={filter}
        />
      </div>

      {/* Table */}
      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={mockGroups}
          pagination={false}
          rowKey="id"
        />
      </Card>
    </div>
  );
};

export default MyGroups;
