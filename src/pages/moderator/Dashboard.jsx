import React from "react";
import { Card, Badge, Button } from "antd";
import {
  ExclamationCircleOutlined,
  TeamOutlined,
  UserOutlined,
  BulbOutlined,
  AlertOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

const ModeratorDashboard = () => {
  const stats = [
    { title: "Total Groups", value: 48 },
    { title: "Groups Missing Topics", value: 10 },
    { title: "Groups Missing Mentor", value: 5 },
    { title: "Student Without Group", value: 20 },
  ];

  const alerts = [
    {
      icon: <BulbOutlined className="text-yellow-500 text-lg" />,
      title: "Groups without assigned topics",
      count: 8,
      time: "2 hours ago",
    },
    {
      icon: <UserOutlined className="text-pink-500 text-lg" />,
      title: "Groups missing mentors",
      count: 5,
      time: "5 hours ago",
    },
    {
      icon: <TeamOutlined className="text-purple-500 text-lg" />,
      title: "Students without groups",
      count: 12,
      time: "1 day ago",
    },
    {
      icon: <ExclamationCircleOutlined className="text-blue-500 text-lg" />,
      title: "Team Beta hasn’t chosen a topic",
      count: 1,
      time: "1 day ago",
    },
    {
      icon: <AlertOutlined className="text-blue-500 text-lg" />,
      title: "Weekly progress reports due soon",
      count: 1,
      time: "2 days ago",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className="inline-block text-4xl font-extrabold"
          style={{
            backgroundImage: "linear-gradient(90deg,#3182ED 0%,#43D08A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm">
          Overview of system performance and key metrics
        </p>
      </div>

      {/* Top Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, index) => (
          <Card
            key={index}
            className="shadow-sm border border-gray-100 rounded-lg hover:shadow-md transition-all"
            bodyStyle={{ padding: "16px 20px" }}
          >
            <h3 className="text-gray-500 text-sm font-medium">{item.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {item.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Recent System Alerts */}
      <Card
        className="shadow-sm border-gray-100 rounded-lg mt-2"
        bodyStyle={{ padding: "20px 24px" }}
      >
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <AlertOutlined className="text-blue-500" /> Recent System Alerts
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          Latest notifications and issues requiring attention
        </p>

        <div className="flex flex-col divide-y divide-gray-100">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                  {alert.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    {alert.title}
                    {alert.count > 1 && (
                      <Badge
                        count={alert.count}
                        style={{
                          backgroundColor: "#EAB308",
                          color: "#fff",
                          fontWeight: "600",
                        }}
                      />
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{alert.time}</p>
                </div>
              </div>
              <Button
                type="link"
                className="text-blue-500 font-medium flex items-center gap-1 hover:text-blue-600"
              >
                View <ArrowRightOutlined />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ModeratorDashboard;
