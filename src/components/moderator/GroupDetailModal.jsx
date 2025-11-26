import React from "react";
import { Modal, Tag, Divider, Avatar, Tooltip } from "antd";
import {
  BookOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

export default function GroupDetailModal({ open, onClose, group }) {
  if (!group) return null;

  // ----- Extract fields -----
  const groupName = group.groupName || group.name || "";
  const groupStatus = (group.status || "active").toUpperCase();
  const statusColor =
    {
      ACTIVE: "green",
      PENDING: "orange",
      INACTIVE: "default",
    }[groupStatus] || "default";

  const topic = group.topic?.title || "Not Assigned";
  const majorName = group.major?.majorName || "";

  const mentor = group.mentor || null;
  const leader = group.leader || null;
  const members = group.members || [];

  const semester = group.semester || null;

  const currentMembers = group.currentMembers || members.length;
  const maxMembers = group.maxMembers || 5;

  const description = group.description || "No description available.";

  // ----- Deadline Calculation -----
  const deadline = semester ? dayjs(semester.endDate) : null;
  const daysLeft = deadline ? deadline.diff(dayjs(), "day") : null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
      title={null}
      bodyStyle={{ padding: 0, borderRadius: 14 }}
      className="rounded-xl"
    >
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{groupName}</h2>

            <div className="mt-2 flex items-center gap-2">
              <Tag color={statusColor} className="px-3 py-1 rounded-full">
                {groupStatus}
              </Tag>

              {daysLeft !== null && (
                <Tag color={daysLeft > 0 ? "blue" : "red"}>
                  {daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
                </Tag>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 p-4 border rounded-xl bg-gray-50">
          <h3 className="font-semibold text-gray-600 mb-1 flex items-center gap-2">
            <InfoCircleOutlined /> Description
          </h3>
          <p className="text-gray-700">{description}</p>
        </div>

        <Divider className="!my-6" />

        {/* Topic + Mentor + Major */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Topic */}
          <div className="border rounded-xl shadow-sm">
            <div className="flex items-center gap-3 px-4 py-3 border-b">
              <BookOutlined className="text-blue-500 text-lg" />
              <span className="font-medium">Topic</span>
            </div>
            <div className="px-4 py-3">
              <p className="font-medium">{topic}</p>
            </div>
          </div>

          {/* Mentor */}
          <div className="border rounded-xl shadow-sm">
            <div className="flex items-center gap-3 px-4 py-3 border-b">
              <UserOutlined className="text-blue-500 text-lg" />
              <span className="font-medium">Mentor</span>
            </div>
            <div className="px-4 py-3 flex items-center gap-3">
              <Avatar src={mentor?.avatarUrl} size={48} />
              <div>
                <p className="font-medium">
                  {mentor?.displayName || "Not Assigned"}
                </p>
                <p className="text-xs text-gray-500">{mentor?.email}</p>
              </div>
            </div>
          </div>

          {/* Major */}
          <div className="border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <SafetyCertificateOutlined className="text-blue-500 text-lg" />
              <span className="text-gray-500">Major</span>
            </div>
            <p className="font-medium">{majorName}</p>
          </div>

          {/* Semester */}
          <div className="border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <CalendarOutlined className="text-blue-500 text-lg" />
              <span className="text-gray-500">Semester</span>
            </div>
            {semester ? (
              <div>
                <p className="font-medium">
                  {semester.season} {semester.year}
                </p>
                <p className="text-xs text-gray-500">
                  {dayjs(semester.startDate).format("DD MMM YYYY")} →{" "}
                  {dayjs(semester.endDate).format("DD MMM YYYY")}
                </p>
              </div>
            ) : (
              <p className="italic text-gray-400">No semester info</p>
            )}
          </div>
        </div>

        <Divider className="!my-6" />

        {/* Members */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TeamOutlined className="text-blue-500" />
            <span className="font-semibold">
              Members ({currentMembers}/{maxMembers})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Leader */}
            {leader?.displayName && (
              <div className="border rounded-xl p-4 shadow-sm flex flex-col items-center bg-blue-50">
                <Avatar
                  size={56}
                  src={leader.avatarUrl ? leader.avatarUrl : <UserOutlined />}
                  className="mb-3"
                />
                <div className="text-center font-medium text-sm">
                  {leader.displayName}
                </div>
                <div className="text-xs text-gray-500">{leader.email}</div>
                <div className="text-xs text-gray-500 mt-1">Leader</div>
              </div>
            )}

            {/* Members List */}
            {members.map((m) => (
              <div
                key={m.userId}
                className="border rounded-xl p-4 shadow-sm flex flex-col items-center"
              >
                <Avatar
                  size={56}
                  src={m.avatarUrl}
                  icon={<UserOutlined />}
                  className="mb-3"
                />
                <div className="text-center font-medium text-sm">
                  {m.displayName}
                </div>
                <div className="text-xs text-gray-500">{m.email}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {m.role || "Member"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
