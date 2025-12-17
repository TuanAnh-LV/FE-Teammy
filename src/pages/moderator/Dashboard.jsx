import React, { useEffect, useState } from "react";
import { Card, Badge, Spin, notification, Table } from "antd";
import {
  ExclamationCircleOutlined,
  TeamOutlined,
  UserOutlined,
  BulbOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import { useTranslation } from "../../hook/useTranslation";
import { AdminService } from "../../services/admin.service";
import { GroupService } from "../../services/group.service";
import { TopicService } from "../../services/topic.service";

const ModeratorDashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [groups, setGroups] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchGroups();
    fetchTopics();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getDashboardStats();
      if (response?.data) setDashboardData(response.data);
    } catch {
      notification.error({
        message: t("error"),
        description: "Failed to load dashboard statistics",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const response = await GroupService.getListGroup();
      if (response?.data) setGroups(response.data.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchTopics = async () => {
    try {
      setLoadingTopics(true);
      const response = await TopicService.getTopics({ pageSize: 5 });
      if (response?.data) {
        const topicsData = Array.isArray(response.data)
          ? response.data
          : response.data.items || [];
        setTopics(topicsData.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    } finally {
      setLoadingTopics(false);
    }
  };

  // ✅ Card icon “màu mè”
  const stats = [
    {
      title: t("totalGroups"),
      value: dashboardData?.totalGroups || 0,
      icon: <TeamOutlined className="text-white text-xl" />,
      bg: "from-blue-500 to-cyan-400",
    },
    {
      title: t("groupsMissingTopics"),
      value: dashboardData?.openTopics || 0,
      icon: <BulbOutlined className="text-white text-xl" />,
      bg: "from-amber-500 to-orange-400",
    },
    {
      title: t("groupsMissingMentor"),
      value: dashboardData?.recruitingGroups || 0,
      icon: <UserOutlined className="text-white text-xl" />,
      bg: "from-violet-500 to-fuchsia-400",
    },
    {
      title: t("studentWithoutGroup"),
      value: 20,
      icon: <AlertOutlined className="text-white text-xl" />,
      bg: "from-rose-500 to-red-400",
    },
  ];

  const groupColumns = [
    {
      title: t("groupName") || "Group Name",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: t("topic") || "Topic",
      dataIndex: "topic",
      key: "topic",
      ellipsis: true,
      render: (topic) => topic?.title || t("noTopic") || "No Topic",
    },
    {
      title: t("mentor") || "Mentor",
      dataIndex: "mentor",
      key: "mentor",
      render: (m) => m?.displayName || "N/A",
    },
    {
      title: t("Members") || "Members",
      key: "members",
      render: (_, r) => `${r.currentMembers || 0}/${r.maxMembers || 0}`,
    },
    {
      title: t("status") || "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          status={status === "active" ? "success" : "default"}
          text={status || "N/A"}
        />
      ),
    },
  ];

  const topicColumns = [
    {
      title: t("topicName") || "Topic Name",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    { title: t("major") || "Major", dataIndex: "majorName", key: "majorName" },
    {
      title: t("mentors") || "Mentors",
      dataIndex: "mentors",
      key: "mentors",
      render: (mentors) =>
        !mentors || mentors.length === 0
          ? "N/A"
          : mentors.map((m) => m.mentorName).join(", "),
    },
    {
      title: t("status") || "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let statusType = "default";
        if (status === "open") statusType = "success";
        else if (status === "pending") statusType = "warning";
        else if (status === "closed") statusType = "error";
        return <Badge status={statusType} text={status || "N/A"} />;
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="inline-block text-2xl sm:text-3xl lg:text-4xl font-extrabold">
          Dashboard
        </h1>
      </div>

      {/* ✅ Top Statistics with colorful icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <Card
            key={index}
            className="shadow-lg border border-gray-100 rounded-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105"
            bodyStyle={{ padding: 24 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">
                  {item.title}
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {item.value}
                </p>
              </div>

              <div
                className={`shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${item.bg}
                            flex items-center justify-center shadow-md`}
              >
                {item.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card
          title={
            <div className="flex items-center gap-2">
              <TeamOutlined className="text-blue-500" />
              <span>{t("recentGroups") || "Recent Groups"}</span>
            </div>
          }
          className="shadow-lg border-gray-100 rounded-lg"
        >
          <Table
            columns={groupColumns}
            dataSource={groups}
            loading={loadingGroups}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>

        <Card
          title={
            <div className="flex items-center gap-2">
              <BulbOutlined className="text-orange-500" />
              <span>{t("recentTopics") || "Recent Topics"}</span>
            </div>
          }
          className="shadow-lg border-gray-100 rounded-lg"
        >
          <Table
            columns={topicColumns}
            dataSource={topics}
            loading={loadingTopics}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
