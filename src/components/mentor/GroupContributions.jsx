import React from "react";
import { Card, List, Avatar, Progress, Button, Tag } from "antd";
import { UserOutlined, MessageOutlined, FireOutlined } from "@ant-design/icons";

export default function GroupContributions() {
  const members = [
    { name: "Nguyễn Văn A", contribution: 35, status: "Active" },
    { name: "Lê Thị B", contribution: 25, status: "Active" },
    { name: "Trần C", contribution: 20, status: "Idle" },
    { name: "Phạm D", contribution: 20, status: "Idle" },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-5">
      {/* Contribution Summary */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-gray-800 font-semibold mb-3">
          Contribution Summary
        </h3>
        <List
          dataSource={members}
          renderItem={(m) => (
            <List.Item>
              <Avatar icon={<UserOutlined />} />
              <div className="ml-3 flex-1">
                <p className="font-medium text-gray-700">{m.name}</p>
                <Progress
                  percent={m.contribution}
                  strokeColor={m.status === "Active" ? "#3182ED" : "#D1D5DB"}
                  size="small"
                  className="w-40"
                />
              </div>
              <Tag
                color={m.status === "Active" ? "blue" : "default"}
                className="rounded-md"
              >
                {m.status}
              </Tag>
            </List.Item>
          )}
        />
      </Card>

      {/* Group Chat */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-gray-800 font-semibold mb-3">Group Chat</h3>
        <div className="h-64 bg-gray-50 rounded-lg p-3 overflow-y-auto text-gray-600 text-sm border border-gray-100 animate-fadeIn">
          <p>
            <strong>A:</strong> Hi team, please update your task progress.
          </p>
          <p>
            <strong>B:</strong> Just deployed the model on staging.
          </p>
          <p>
            <strong>C:</strong> UI almost ready for review!
          </p>
        </div>
        <Button
          icon={<MessageOutlined />}
          type="primary"
          className="!bg-blue-600 hover:!bg-blue-700 mt-3"
        >
          Join Group Chat
        </Button>
      </Card>
    </div>
  );
}
