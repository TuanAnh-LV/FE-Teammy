import React from "react";
import {
  Card,
  Button,
  List,
  Progress,
  Tag,
  Tooltip,
  Rate,
  Space,
  Input,
  Select,
} from "antd";
import {
  SearchOutlined,
  TeamOutlined,
  FileTextOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useTranslation } from "../../hook/useTranslation";
const { Option } = Select;

export default function MentorDashboard() {
  const { t } = useTranslation();
  const discoverGroups = [
    {
      id: 1,
      name: "AI Campus Assistant",
      department: "Computer Science",
      topic: "AI for Education",
      members: 4,
      lookingForMentor: true,
      progress: 45,
    },
    {
      id: 2,
      name: "Smart IoT System",
      department: "Engineering",
      topic: "IoT Automation",
      members: 5,
      lookingForMentor: false,
      progress: 82,
    },
  ];

  const assignedGroups = [
    {
      id: 1,
      name: "Data Analytics Hub",
      topic: "Data Visualization Platform",
      progress: 78,
      lastUpdate: "2 days ago",
      contribution: 86,
      rating: 4,
    },
    {
      id: 2,
      name: "Campus Connect",
      topic: "Communication App for Students",
      progress: 52,
      lastUpdate: "1 day ago",
      contribution: 60,
      rating: 3,
    },
  ];

  return (
    <div className="space-y-8 bg-gray-50 min-h-screen">
      {/* HEADER + OVERVIEW */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent">
            Mentor Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your mentorships, monitor progress, and support your student
            teams.
          </p>
        </div>
        <Space className="flex-wrap">
          <Button icon={<MessageOutlined />}>
            <span className="hidden sm:inline">
              {t("sendAnnouncement") || "Send Announcement"}
            </span>
          </Button>
          <Button type="primary" icon={<FileTextOutlined />}>
            <span className="hidden sm:inline">Export Report</span>
          </Button>
        </Space>
      </div>

      {/* STATISTICS OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          bordered={false}
          className="rounded-xl shadow hover:shadow-md transition"
        >
          <p className="text-gray-400 text-sm">Active Groups</p>
          <h2 className="text-2xl font-semibold text-blue-600 mt-1">5</h2>
        </Card>
        <Card
          bordered={false}
          className="rounded-xl shadow hover:shadow-md transition"
        >
          <p className="text-gray-400 text-sm">Pending Reviews</p>
          <h2 className="text-2xl font-semibold text-amber-500 mt-1">3</h2>
        </Card>
        <Card
          bordered={false}
          className="rounded-xl shadow hover:shadow-md transition"
        >
          <p className="text-gray-400 text-sm">Average Progress</p>
          <h2 className="text-2xl font-semibold text-green-500 mt-1">72%</h2>
        </Card>
        <Card
          bordered={false}
          className="rounded-xl shadow hover:shadow-md transition"
        >
          <p className="text-gray-400 text-sm">Feedback Given</p>
          <h2 className="text-2xl font-semibold text-purple-500 mt-1">12</h2>
        </Card>
      </div>

      {/* GROUP DISCOVERY */}
      <Card
        title={
          <span className="font-semibold text-gray-800 text-lg">
            Discover Groups
          </span>
        }
        extra={<Button type="primary">View All</Button>}
        className="rounded-2xl shadow-sm"
        bodyStyle={{ padding: "24px" }}
      >
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-5">
          <Input
            prefix={<SearchOutlined />}
            placeholder={
              t("searchByKeyword") || "Search by topic or keyword..."
            }
            className="w-full sm:w-64"
          />
          <Select
            placeholder={t("filterByDepartment") || "Filter by Department"}
            className="w-full sm:w-52"
          >
            <Option>All Departments</Option>
            <Option>Computer Science</Option>
            <Option>Engineering</Option>
            <Option>Information Technology</Option>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {discoverGroups.map((g) => (
            <Card
              key={g.id}
              className="border border-gray-100 rounded-xl hover:shadow-md transition-all"
              title={
                <div className="flex items-center gap-2 font-semibold text-gray-800">
                  <TeamOutlined className="text-blue-500" /> {g.name}
                </div>
              }
              extra={
                g.lookingForMentor ? (
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    className="!bg-blue-600 hover:!bg-blue-700"
                  >
                    Mentor This Group
                  </Button>
                ) : (
                  <Tag color="green">Assigned</Tag>
                )
              }
            >
              <p className="text-sm text-gray-500 mb-2">
                {g.topic} — {g.department}
              </p>
              <Progress
                percent={g.progress}
                size="small"
                strokeColor={g.progress < 60 ? "#f59e0b" : "#43D08A"}
              />
            </Card>
          ))}
        </div>
      </Card>

      {/* ASSIGNED GROUPS */}
      <Card
        title={
          <span className="font-semibold text-gray-800 text-lg">
            Your Groups
          </span>
        }
        className="rounded-2xl shadow-sm"
        bodyStyle={{ padding: "24px" }}
      >
        {assignedGroups.map((group) => (
          <div
            key={group.id}
            className="flex flex-col md:flex-row justify-between items-center gap-3 border-b pb-4 last:border-none"
          >
            <div>
              <div className="font-semibold text-gray-800">{group.name}</div>
              <div className="text-gray-500 text-sm">{group.topic}</div>
              <div className="text-xs text-gray-400 mt-1">
                Last update: {group.lastUpdate}
              </div>
            </div>
            <Space>
              <Progress
                type="circle"
                percent={group.progress}
                size={50}
                strokeColor="#3b82f6"
              />
              <Tag color="blue">Contrib {group.contribution}%</Tag>
              <Rate value={group.rating} disabled />
              <Tooltip title={t("viewGroupDetails") || "View Group Details"}>
                <Button icon={<EyeOutlined />} shape="circle" />
              </Tooltip>
            </Space>
          </div>
        ))}
      </Card>
    </div>
  );
}
