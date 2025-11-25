import React, { useState, useEffect } from "react";
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
  Spin,
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
import { GroupService } from "../../services/group.service";
import { calculateProgressFromTasks } from "../../utils/group.utils";
import { BoardService } from "../../services/board.service";
import { useTranslation } from "../../hook/useTranslation";
const { Text } = Typography;

const MyGroups = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState(t("allGroups") || "All Groups");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      const response = await GroupService.getMyGroups();
      const groupsList = Array.isArray(response?.data) ? response.data : [];

      // Fetch board for each group to calculate progress
      const groupsWithProgress = await Promise.all(
        groupsList.map(async (group) => {
          try {
            const boardRes = await BoardService.getBoard(group.id);
            const progress = calculateProgressFromTasks(boardRes?.data);
            return {
              ...group,
              calculatedProgress: progress,
            };
          } catch (err) {
            console.error(`Failed to fetch board for group ${group.id}:`, err);
            return {
              ...group,
              calculatedProgress: 0,
            };
          }
        })
      );

      setGroups(groupsWithProgress);
    } catch (error) {
      console.error("Failed to fetch my groups:", error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const normalizeGroup = (group) => {
    const memberCount = group.currentMembers || group.members || 0;
    const maxMembers = group.maxMembers || 5;
    const progress = group.calculatedProgress || 0;
    const createdDate = group.createdAt
      ? new Date(group.createdAt).toLocaleDateString()
      : "N/A";

    // Calculate due date and days left
    let dueDate = null;
    let daysLeft = null;

    if (group.semester?.endDate || group.endDate) {
      const endDateStr = group.semester?.endDate || group.endDate;
      const dueDateObj = new Date(endDateStr);
      dueDate = dueDateObj.toLocaleDateString();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDateObj.setHours(0, 0, 0, 0);

      const diffTime = dueDateObj - today;
      daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Determine status based on progress
    let status = "On track";
    if (progress < 30) status = "At risk";
    else if (progress < 60) status = "Behind";

    return {
      id: group.id,
      name: group.name || "Unnamed Group",
      members: memberCount,
      maxMembers: maxMembers,
      startDate: createdDate,
      progress: progress,
      status: status,
      topic: group.topic?.title || group.topicName || "No topic",
      majorName: group.major?.name || group.field || "No major",
      dueDate: dueDate,
      daysLeft: daysLeft,
    };
  };

  const normalizedGroups = groups.map(normalizeGroup);

  const filteredGroups = normalizedGroups.filter((g) => {
    const matchesSearch = g.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === "All Groups" ||
      (filter === "Active" && g.status !== "Archived") ||
      (filter === "Archived" && g.status === "Archived");
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalGroups: normalizedGroups.length,
    avgProgress:
      normalizedGroups.length > 0
        ? Math.round(
            normalizedGroups.reduce((sum, g) => sum + g.progress, 0) /
              normalizedGroups.length
          )
        : 0,
    needAttention: normalizedGroups.filter(
      (g) => g.status === "Behind" || g.status === "At risk"
    ).length,
    highPriority: normalizedGroups.filter((g) => g.status === "At risk").length,
  };

  const columns = [
    {
      title: "Group Name",
      dataIndex: "name",
      render: (_, record) => (
        <div>
          <p className="font-semibold text-gray-800">{record.name}</p>
          <p className="text-gray-500 text-xs">Since {record.startDate}</p>
          <p className="text-gray-400 text-xs mt-1">
            {record.majorName} • {record.topic}
          </p>
        </div>
      ),
    },
    {
      title: "Members",
      dataIndex: "members",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <TeamOutlined className="text-blue-500" />
          <span className="font-semibold text-gray-700">
            {record.members}/{record.maxMembers}
          </span>
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
            color={
              record.status === "At risk"
                ? "volcano"
                : record.status === "Behind"
                ? "orange"
                : "green"
            }
            className="mt-1 rounded-md"
          >
            {record.status}
          </Tag>
        </div>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      render: (_, record) => (
        <div>
          <p className="text-gray-700 font-medium">
            {record.dueDate || "No due date"}
          </p>
          {record.daysLeft !== null && (
            <p
              className={`text-xs ${
                record.daysLeft < 7 ? "text-red-500" : "text-gray-400"
              }`}
            >
              {record.daysLeft > 0
                ? `${record.daysLeft} days left`
                : record.daysLeft === 0
                ? "Due today"
                : "Overdue"}
            </p>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Tooltip title={t("viewDetails") || "View Details"}>
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

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" tip="Loading your groups..." />
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all">
              <TeamOutlined className="text-blue-500 text-xl mb-2" />
              <p className="text-sm text-gray-500">Total Groups</p>
              <p className="text-3xl font-bold">{stats.totalGroups}</p>
            </Card>
            <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all bg-green-50 border border-green-100">
              <RiseOutlined className="text-green-500 text-xl mb-2" />
              <p className="text-sm text-gray-500">Avg Progress</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.avgProgress}%
              </p>
            </Card>
            <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all bg-yellow-50 border border-yellow-100">
              <AlertOutlined className="text-yellow-500 text-xl mb-2" />
              <p className="text-sm text-gray-500">Need Attention</p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.needAttention}
              </p>
            </Card>
            <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all bg-red-50 border border-red-100">
              <FireOutlined className="text-red-500 text-xl mb-2" />
              <p className="text-sm text-gray-500">High Priority</p>
              <p className="text-3xl font-bold text-red-600">
                {stats.highPriority}
              </p>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-3">
            <Input
              prefix={<SearchOutlined />}
              placeholder={t("searchGroups") || "Search groups..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              dataSource={filteredGroups}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} groups`,
              }}
              rowKey="id"
              rowClassName={(_, i) =>
                i % 2 === 0 ? "bg-gray-50 hover:bg-blue-50" : "hover:bg-blue-50"
              }
              locale={{
                emptyText: "No groups found",
              }}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default MyGroups;
