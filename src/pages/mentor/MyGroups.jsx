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
  Space,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  TeamOutlined,
  FireOutlined,
  AlertOutlined,
  RiseOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const MyGroups = () => {
  const navigate = useNavigate();

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
  ];

  const [filter, setFilter] = useState("All Groups");

  const columns = [
    {
      title: "Group Name",
      dataIndex: "name",
      render: (_, record) => (
        <div>
          <p className="font-semibold text-gray-800">{record.name}</p>
          <p className="text-gray-500 text-xs">
            👥 {record.members} members • Since {record.startDate}
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
            strokeColor={record.status === "At risk" ? "#fa541c" : "#43D08A"}
          />
          <Tag
            color={record.status === "At risk" ? "volcano" : "green"}
            className="mt-1 rounded-md"
          >
            {record.status}
          </Tag>
        </div>
      ),
    },
    {
      title: "Activity (7d)",
      dataIndex: "activity",
      render: (val) => <Text className="text-gray-700">{val} logs</Text>,
    },
    {
      title: "Tasks",
      dataIndex: "tasks",
      render: (val) => (
        <Tag color="blue" className="rounded-md">
          {val}
        </Tag>
      ),
    },
    {
      title: "Next Milestone",
      dataIndex: "nextMilestone",
      render: (_, record) => (
        <div>
          <p className="font-medium text-gray-700">{record.nextMilestone}</p>
          <p className="text-gray-400 text-xs">{record.due}</p>
        </div>
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button
            icon={<EyeOutlined />}
            type="primary"
            size="small"
            className="!bg-blue-600 hover:!bg-blue-700"
            onClick={() => navigate(`/mentor/my-groups/${record.id}`)}
          >
            View
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="space-y-8 bg-gray-50 min-h-screen">
      <div>
        <h1
          className="inline-block text-4xl font-extrabold"
          style={{
            backgroundImage: "linear-gradient(90deg,#3182ED 0%,#43D08A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          My Groups
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Monitor and manage your assigned groups effectively
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all">
          <TeamOutlined className="text-blue-500 text-xl mb-2" />
          <p className="text-sm text-gray-500">Total Groups</p>
          <p className="text-3xl font-bold">{mockStats.totalGroups}</p>
        </Card>
        <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all bg-green-50 border border-green-100">
          <RiseOutlined className="text-green-500 text-xl mb-2" />
          <p className="text-sm text-gray-500">Avg Progress</p>
          <p className="text-3xl font-bold text-green-600">
            {mockStats.avgProgress}%
          </p>
        </Card>
        <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all bg-yellow-50 border border-yellow-100">
          <AlertOutlined className="text-yellow-500 text-xl mb-2" />
          <p className="text-sm text-gray-500">Need Attention</p>
          <p className="text-3xl font-bold text-yellow-600">
            {mockStats.needAttention}
          </p>
        </Card>
        <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all bg-red-50 border border-red-100">
          <FireOutlined className="text-red-500 text-xl mb-2" />
          <p className="text-sm text-gray-500">High Priority</p>
          <p className="text-3xl font-bold text-red-600">
            {mockStats.highPriority}
          </p>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-3">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search groups..."
          className="w-full md:w-1/3 border-gray-200 rounded-lg hover:border-blue-400"
        />
        <Segmented
          options={["All Groups", "Active", "Archived"]}
          onChange={(val) => setFilter(val)}
          value={filter}
          className="bg-white shadow-sm rounded-lg"
        />
      </div>

      <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-100">
        <Table
          columns={columns}
          dataSource={mockGroups}
          pagination={false}
          rowKey="id"
          rowClassName={(_, i) =>
            i % 2 === 0 ? "bg-gray-50 hover:bg-blue-50" : "hover:bg-blue-50"
          }
        />
      </Card>
    </div>
  );
};

export default MyGroups;
