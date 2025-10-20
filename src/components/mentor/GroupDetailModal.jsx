import React from "react";
import {
  Modal,
  Tag,
  List,
  Avatar,
  Button,
  Divider,
  Space,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  TeamOutlined,
  CalendarOutlined,
  ProjectOutlined,
  BookOutlined,
} from "@ant-design/icons";

export default function GroupDetailModal({ group, open, onClose }) {
  if (!group) return null;

  const detail = {
    abbreviation: "TEAMMY",
    vietnameseTitle:
      "Teammy – Giải pháp số cho việc hình thành và quản lý nhóm đồ án sinh viên",
    profession: "Information Technology",
    specialty: "Software Engineering",
    createdAt: "8/30/2025 10:26:17 PM",
    description:
      "Students face team challenges and fragmented tools; a platform for team formation and project management improves coordination and visibility.",
    keywords: ["Education", "Project Management", "Group Formation"],
    maxMembers: 5,
    availableSlot: 1,
    members: [
      {
        name: "Nguyễn Phi Hùng",
        email: "hungnpse172907@fpt.edu.vn",
        role: "Owner | Leader",
        avatar: "https://i.pravatar.cc/150?img=12",
      },
      {
        name: "Anh Lê",
        email: "anhlvtse172914@fpt.edu.vn",
        role: "Member",
      },
      {
        name: "Hoàng Trần",
        email: "hoangtmse172926@fpt.edu.vn",
        role: "Member",
      },
      {
        name: "Sơn Thái",
        email: "sonthse172913@fpt.edu.vn",
        role: "Member",
      },
    ],
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      destroyOnClose
      title={
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{group.name}</h2>
          <p className="text-gray-400 text-xs mt-1">
            Created at: {detail.createdAt}
          </p>
        </div>
      }
    >
      {/* SECTION: INFO */}
      <section className="text-sm text-gray-700">
        <div className="grid grid-cols-2 gap-y-2 mb-4">
          <div>
            <span className="text-gray-500 font-medium">Abbreviation: </span>
            <span className="italic text-gray-800">{detail.abbreviation}</span>
          </div>
          <div>
            <span className="text-gray-500 font-medium">
              Vietnamese Title:{" "}
            </span>
            <span className="italic text-gray-800">
              {detail.vietnameseTitle}
            </span>
          </div>
          <div>
            <span className="text-gray-500 font-medium">Profession: </span>
            <span className="italic text-gray-800">{detail.profession}</span>
          </div>
          <div>
            <span className="text-gray-500 font-medium">Specialty: </span>
            <span className="italic text-gray-800">{detail.specialty}</span>
          </div>
        </div>

        <Divider className="my-3" />

        <div>
          <h4 className="font-semibold text-gray-700 mb-1">Description</h4>
          <p className="text-gray-600 text-sm leading-relaxed">
            {detail.description}
          </p>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold text-gray-700 mb-2">Keywords</h4>
          <Space wrap>
            {detail.keywords.map((kw) => (
              <Tag
                key={kw}
                color="blue"
                className="rounded-md text-xs font-medium px-3 py-1"
              >
                {kw}
              </Tag>
            ))}
          </Space>
        </div>
      </section>

      <Divider className="my-4" />

      {/* SECTION: MEMBERS */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <TeamOutlined /> Members
          </h3>
          <span className="text-sm text-gray-500">
            Max: {detail.maxMembers} | Available Slot:{" "}
            <strong>{detail.availableSlot}</strong>
          </span>
        </div>

        <List
          dataSource={detail.members}
          renderItem={(m, i) => (
            <List.Item
              className={`rounded-lg px-2 py-2 ${
                i % 2 === 0 ? "bg-gray-50" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={m.avatar}
                    icon={!m.avatar && <UserOutlined />}
                    size={40}
                    style={{
                      backgroundColor: !m.avatar ? "#b3d4fc" : undefined,
                      color: "#fff",
                    }}
                  />
                  <div>
                    <div className="font-medium text-gray-800 text-sm">
                      {m.email}
                    </div>
                    <div className="text-xs text-gray-500">{m.name}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span>{m.role}</span>
                  <Tooltip title="Send email">
                    <MailOutlined className="cursor-pointer text-blue-500" />
                  </Tooltip>
                </div>
              </div>
            </List.Item>
          )}
        />
      </section>

      <Divider className="my-4" />

      {/* SECTION: ACTIONS */}
      <div className="flex justify-end gap-3 mt-4">
        <Button onClick={onClose}>Close</Button>
        <Button
          type="primary"
          icon={<BookOutlined />}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Mentor This Group
        </Button>
      </div>
    </Modal>
  );
}
