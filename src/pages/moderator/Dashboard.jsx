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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="inline-block text-2xl sm:text-3xl lg:text-4xl font-extrabold">
          Dashboard
        </h1>
      </div>

      {/* Top Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <Card
            key={index}
            className="shadow-lg border border-gray-100 rounded-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105"
            bodyStyle={{ padding: "24px" }}
          >
            <h3 className="text-gray-500 text-sm font-medium">{item.title}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {item.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Recent System Alerts */}
      <Card
        className="shadow-lg border-gray-100 rounded-lg mt-6"
        bodyStyle={{ padding: "24px" }}
      >
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <AlertOutlined className="text-blue-500" /> Recent System Alerts
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          Latest notifications and issues requiring attention
        </p>

        <div className="space-y-4">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-4 px-3 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 flex justify-center items-center rounded-full">
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
