import React from "react";
import { Modal, Button, Tag, Divider, Tooltip } from "antd";
import {
  BookOutlined,
  TeamOutlined,
  UserOutlined,
  ApartmentOutlined,
  CalendarOutlined,
  DownloadOutlined,
  GithubOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const InfoCard = ({ icon, label, value, muted }) => (
  <div className="border rounded-xl p-4 shadow-sm">
    <div className="flex items-center gap-3 mb-1">
      <span className="text-blue-500 text-lg">{icon}</span>
      <span className="text-gray-500 text-sm">{label}</span>
    </div>
    <div className={`font-medium ${muted ? "italic text-gray-400" : ""}`}>
      {value}
    </div>
  </div>
);

const formatDate = (d) => {
  if (!d) return "-";
  try {
    // giữ nguyên chuỗi nếu đã là yyyy-mm-dd
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return d;
  }
};

export default function TopicDetailModal({ open, onClose, topicDetails }) {
  if (!topicDetails) return null;

  const assigned = topicDetails.group && topicDetails.group !== "Not assigned";
  const statusTag = assigned ? (
    <Tag
      icon={<CheckCircleOutlined />}
      color="green"
      className="px-3 py-1 rounded-full"
    >
      Assigned
    </Tag>
  ) : (
    <Tag
      icon={<ClockCircleOutlined />}
      color="orange"
      className="px-3 py-1 rounded-full"
    >
      Available
    </Tag>
  );

  return (
    <Modal
      centered
      open={open}
      onCancel={onClose}
      title={null}
      destroyOnClose
      maskClosable
      width={720}
      bodyStyle={{ padding: 0, overflow: "hidden" }} // không cuộn
      className="rounded-2xl"
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide">
              <BookOutlined /> Topic
            </div>
            <h2 className="text-2xl font-bold leading-tight mt-1">
              {topicDetails.title || "-"}
            </h2>
            <div className="mt-2">{statusTag}</div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <InfoCard
            icon={<TeamOutlined />}
            label="Assigned Group"
            value={topicDetails.group || "Not assigned"}
            muted={!assigned}
          />
          <InfoCard
            icon={<UserOutlined />}
            label="Mentor"
            value={topicDetails.mentor || "-"}
            muted={!topicDetails.mentor}
          />
          <InfoCard
            icon={<ApartmentOutlined />}
            label="Major"
            value={topicDetails.major || "-"}
            muted={!topicDetails.major}
          />
          <InfoCard
            icon={<CalendarOutlined />}
            label="Created"
            value={formatDate(topicDetails.date)}
            muted={!topicDetails.date}
          />
        </div>

        <Divider className="!my-6" />

        {/* Resources */}
        <div>
          <div className="text-sm text-gray-500 font-medium mb-3">
            Resources
          </div>
          <div className="flex flex-wrap gap-3">
            {topicDetails.downloadLink ? (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                href={topicDetails.downloadLink}
                target="_blank"
                rel="noopener noreferrer"
                className="!bg-blue-600 hover:!bg-blue-700"
              >
                Download document
              </Button>
            ) : (
              <Tooltip title="No document provided">
                <Button type="primary" icon={<DownloadOutlined />} disabled>
                  Download document
                </Button>
              </Tooltip>
            )}

            {topicDetails.githubLink && (
              <Button
                icon={<GithubOutlined />}
                href={topicDetails.githubLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open GitHub
              </Button>
            )}

            {topicDetails.moreLink && (
              <Button
                icon={<LinkOutlined />}
                href={topicDetails.moreLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open link
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
