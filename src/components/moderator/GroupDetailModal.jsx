import React from "react";
import { Modal, Tag, Divider, Avatar } from "antd";
import {
  BookOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

export default function GroupDetailModal({ open, onClose, group }) {
  if (!group) return null;

  const statusColor =
    {
      Active: "green",
      Pending: "orange",
      Inactive: "default",
    }[group.status] || "default";

  const members = group.membersDetail || [];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={760}
      centered
      title={null}
      bodyStyle={{ padding: 0, borderRadius: 14 }}
      className="rounded-xl"
    >
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{group.groupName}</h2>
            <div className="mt-2">
              <Tag color={statusColor} className="px-3 py-1 rounded-full">
                {group.status?.toUpperCase()}
              </Tag>
            </div>
          </div>
        </div>

        {/* Topic */}
        <div className="mt-5">
          <div className="border rounded-xl shadow-sm">
            <div className="flex items-center gap-3 px-4 py-3 border-b">
              <BookOutlined className="text-blue-500 text-lg" />
              <span className="font-medium">Topic</span>
            </div>
            <div className="px-4 py-4 border-l-4 border-blue-500 rounded-bl-xl rounded-br-xl">
              <p className="text-gray-700">
                {group.topic === "Not Assigned" ? (
                  <span className="italic text-gray-400">{group.topic}</span>
                ) : (
                  group.topic
                )}
              </p>
            </div>
          </div>
        </div>

        <Divider className="!my-6" />

        {/* Mentor & Major */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <UserOutlined className="text-blue-500 text-lg" />
              <span className="text-gray-500">Mentor</span>
            </div>
            <p className="font-medium">
              {group.mentor === "Not Assigned" ? (
                <span className="italic text-gray-400">{group.mentor}</span>
              ) : (
                group.mentor
              )}
            </p>
          </div>

          <div className="border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <SafetyCertificateOutlined className="text-blue-500 text-lg" />
              <span className="text-gray-500">Major</span>
            </div>
            <p className="font-medium">{group.major}</p>
          </div>
        </div>

        <Divider className="!my-6" />

        {/* Members */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TeamOutlined className="text-blue-500" />
            <span className="font-semibold">
              Members ({members.length || group.members || 0})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {members.map((m) => (
              <div
                key={m.id}
                className="border rounded-xl p-4 shadow-sm flex flex-col items-center"
              >
                <Avatar
                  size={56}
                  src={m.avatar}
                  icon={<UserOutlined />}
                  className="mb-3"
                />
                <div className="text-center font-medium">{m.name}</div>
              </div>
            ))}

            {/* Nếu chưa có danh sách chi tiết */}
            {members.length === 0 && (
              <div className="text-gray-400 italic">No member details.</div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
