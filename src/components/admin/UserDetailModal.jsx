import React from "react";
import { Modal, Tag, Avatar, Divider } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  BookOutlined,
  IdcardOutlined,
  UserOutlined,
} from "@ant-design/icons";

export default function UserDetailModal({ open, onClose, user }) {
  if (!user) return null;

  const colorMap = {
    Active: "green",
    Suspended: "red",
    Inactive: "default",
  };

  const infoRow = (icon, label, value) => (
    <div className="flex items-start gap-3 py-2">
      <div className="text-blue-500 mt-1 text-lg">{icon}</div>
      <div>
        <div className="text-gray-600 text-sm font-medium">{label}</div>
        <div className="text-gray-800 font-semibold">{value || "—"}</div>
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
      bodyStyle={{
        padding: "28px 36px",
        borderRadius: "1rem",
        backgroundColor: "#f9fafb",
      }}
      title={
        <div className="flex items-center gap-4">
          <Avatar
            size={64}
            icon={<UserOutlined />}
            style={{
              background: "linear-gradient(135deg, #3182ED 0%, #43D08A 100%)",
              color: "#fff",
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            {user.name?.[0]}
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Tag color="blue" className="text-sm px-2 rounded-md">
                {user.role}
              </Tag>
              <Tag
                color={colorMap[user.status]}
                className="text-sm px-2 rounded-md"
              >
                {user.status}
              </Tag>
            </div>
          </div>
        </div>
      }
    >
      <div className="bg-white p-5 rounded-xl shadow-sm space-y-2">
        {infoRow(<MailOutlined />, "Email", user.email)}
        {infoRow(<PhoneOutlined />, "Phone", user.phone)}
        {infoRow(<BookOutlined />, "Major", user.major)}

        {user.role === "Student" &&
          infoRow(<IdcardOutlined />, "Student Code", user.studentCode)}

        <Divider className="my-4" />

        <div>
          <div className="text-gray-600 text-sm font-medium mb-1">
            Notes / Description
          </div>
          <div className="text-gray-700 leading-relaxed bg-gray-50 border rounded-lg p-3">
            {user.note || "No additional information provided."}
          </div>
        </div>
      </div>
    </Modal>
  );
}
