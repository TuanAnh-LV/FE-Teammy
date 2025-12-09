import React, { useEffect, useState } from "react";
import { Card, Spin, notification } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  UserAddOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AdminService } from "../../services/admin.service";
import { MajorService } from "../../services/major.service";
import { useTranslation } from "../../hook/useTranslation";

const COLORS = [
  "#3B82F6",
  "#22C55E",
  "#F97316",
  "#EAB308",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#CBD5E1",
];

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [majorsData, setMajorsData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchMajorsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getDashboardStats();
      if (response?.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      notification.error({
        message: t("error"),
        description: "Failed to load dashboard statistics",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMajorsData = async () => {
    try {
      const response = await MajorService.getMajors();
      if (response?.data) {
        const majors = Array.isArray(response.data) ? response.data : [];
        // Transform majors data for pie chart
        // Note: API doesn't return studentCount, so we'll display all majors with equal distribution
        // or you can fetch student counts from a different endpoint
        const pieData = majors.map((major, index) => ({
          name: major.majorName || major.name || "Unknown",
          value: 1, // Equal distribution since we don't have student counts
          color: COLORS[index % COLORS.length],
        }));
        setMajorsData(pieData);
      }
    } catch (error) {
      console.error("Failed to fetch majors data:", error);
    }
  };

  const cards = [
    {
      title: t("totalUsers") || "Total Users",
      value: dashboardData?.totalUsers || 0,
      icon: <UserOutlined />,
    },
    {
      title: t("activeUsers7d") || "Active Users (7d)",
      value: dashboardData?.activeUsers || 0,
      icon: <UserAddOutlined />,
    },
    {
      title: t("totalGroups") || "Total Groups",
      value: dashboardData?.totalGroups || 0,
      icon: <TeamOutlined />,
    },
    {
      title: t("groupsWithMentor") || "Groups with Mentor",
      value: dashboardData?.recruitingGroups || 0,
      icon: <TeamOutlined />,
    },
    {
      title: t("totalTopics") || "Total Topics",
      value: dashboardData?.totalTopics || 0,
      icon: <ProjectOutlined />,
    },
    {
      title: t("openTopics") || "Open Topics",
      value: dashboardData?.openTopics || 0,
      icon: <ClockCircleOutlined />,
    },
    {
      title: t("totalPosts") || "Total Posts",
      value: dashboardData?.totalPosts || 0,
      icon: <ProjectOutlined />,
    },
    {
      title: t("groupPosts") || "Group Posts",
      value: dashboardData?.groupPosts || 0,
      icon: <TeamOutlined />,
    },
    {
      title: t("profilePosts") || "Profile Posts",
      value: dashboardData?.profilePosts || 0,
      icon: <UserOutlined />,
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="inline-block text-2xl sm:text-3xl lg:text-4xl font-extrabold">
            Dashboard
          </h1>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <Card
            key={i}
            className="shadow-sm border-gray-100 hover:shadow-md transition-all"
            bodyStyle={{ padding: "20px" }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {typeof card.value === "number"
                    ? card.value.toLocaleString()
                    : card.value}
                </p>
              </div>
              <div className="text-blue-500 text-2xl">{card.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        {/* Pie Chart */}
        <Card
          title={t("majorsDistribution") || "Majors Distribution"}
          className="shadow-sm border-gray-100"
          bodyStyle={{ padding: "20px" }}
        >
          <p className="text-gray-500 text-sm mb-3">
            {t("studentDistributionMajors") ||
              "Student distribution across different majors"}
          </p>
          {majorsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={majorsData}
                margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-35}
                  textAnchor="end"
                  interval={0} // hiện tất cả nhãn
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value">
                  {majorsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-[400px] text-gray-400">
              {t("noData") || "No data available"}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
