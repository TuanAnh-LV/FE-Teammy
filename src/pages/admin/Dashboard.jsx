import React from "react";
import { Card } from "antd";
import { UserOutlined } from "@ant-design/icons";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

const lineData = [
  { name: "Mar 2", Active: 120, New: 35, Tasks: 60 },
  { name: "Mar 4", Active: 148, New: 28, Tasks: 72 },
  { name: "Mar 6", Active: 200, New: 45, Tasks: 88 },
  { name: "Mar 8", Active: 260, New: 50, Tasks: 120 },
  { name: "Mar 10", Active: 300, New: 60, Tasks: 140 },
];

const pieData = [
  { name: "Computer Science", value: 32, color: "#3B82F6" },
  { name: "Business", value: 21, color: "#22C55E" },
  { name: "Engineering", value: 16, color: "#F97316" },
  { name: "Psychology", value: 10, color: "#EAB308" },
  { name: "Biology", value: 8, color: "#8B5CF6" },
  { name: "Other", value: 12, color: "#CBD5E1" },
];

const AdminDashboard = () => {
  const cards = [
    {
      title: "Total Users",
      value: "12,847",
      change: "+8.2%",
      icon: <UserOutlined />,
    },
    {
      title: "Total Groups",
      value: "2,341",
      change: "+12.4%",
      icon: <UserOutlined />,
    },
    {
      title: "Groups with Mentor",
      value: "12,847",
      change: "+8.2%",
      icon: <UserOutlined />,
    },
    {
      title: "Open Recruitments",
      value: "156",
      change: "+8.2%",
      icon: <UserOutlined />,
    },
    {
      title: "Task Completion",
      value: "84.5%",
      change: "+8.2%",
      icon: <UserOutlined />,
    },
    {
      title: "Active Users (7d)",
      value: "3,247",
      change: "+8.2%",
      icon: <UserOutlined />,
    },
  ];

  return (
    <div className="space-y-3">
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
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                <p className="text-green-500 text-xs mt-1">
                  {card.change} from last month
                </p>
              </div>
              <div className="text-gray-400 text-lg">{card.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Line Chart */}
        <Card
          title="30-Day Activity"
          className="shadow-sm border-gray-100"
          bodyStyle={{ padding: "20px" }}
        >
          <p className="text-gray-500 text-sm mb-3">
            User engagement over the last 30 days
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Active"
                stroke="#3B82F6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="New"
                stroke="#22C55E"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Tasks"
                stroke="#F97316"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card
          title="Majors Distribution"
          className="shadow-sm border-gray-100"
          bodyStyle={{ padding: "20px" }}
        >
          <p className="text-gray-500 text-sm mb-3">
            Student distribution across different majors
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
