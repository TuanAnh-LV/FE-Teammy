import React, { useEffect, useState } from "react";
import { Modal, Button, Tag, Divider, Tooltip, Spin, message } from "antd";
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
import { TopicService } from "../../services/topic.service";

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

export default function TopicDetailModal({
  open,
  onClose,
  topicDetails,
  topicId,
}) {
  const [detailData, setDetailData] = useState(topicDetails);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !topicId) {
      setDetailData(topicDetails);
      return;
    }

    let mounted = true;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await TopicService.getTopicDetail(topicId);
        const payload = res?.data ?? res;
        if (mounted) {
          setDetailData(payload);
        }
      } catch (err) {
        console.error(err);
        message.error("Failed to load topic details");
        // Fallback to passed data on error
        if (mounted) setDetailData(topicDetails);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDetails();
    return () => {
      mounted = false;
    };
  }, [open, topicId, topicDetails]);

  if (!detailData) return null;

  // Support both old and new field names
  const title = detailData.topicName || detailData.title || "-";
  const mentor = detailData.createdByName || detailData.mentor || "-";
  const major = detailData.majorName || detailData.major || "-";
  const created = detailData.createdAt || detailData.date || null;
  const description = detailData.description || detailData.desc || "-";

  // Determine assigned state: prefer explicit group, else status field
  const assigned =
    (detailData.group && detailData.group !== "Not assigned") ||
    (detailData.status && detailData.status !== "Available");

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
      width={760}
      bodyStyle={{ padding: 0, overflow: "hidden" }}
      className="rounded-2xl"
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide">
                <BookOutlined /> Topic
              </div>
              <h2 className="text-2xl font-bold leading-tight mt-1">{title}</h2>
              <div className="mt-2">{statusTag}</div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <InfoCard
              icon={<UserOutlined />}
              label="Mentor"
              value={mentor}
              muted={!mentor || mentor === "-"}
            />
            <InfoCard
              icon={<ApartmentOutlined />}
              label="Major"
              value={major}
              muted={!major || major === "-"}
            />
            <InfoCard
              icon={<CalendarOutlined />}
              label="Created"
              value={formatDate(created)}
              muted={!created}
            />
          </div>

          {/* Description (hidden in table, visible here) */}
          <div className="mt-6">
            <div className="text-sm text-gray-500 font-medium mb-2">
              Description
            </div>
            <div className="prose max-w-none text-gray-800">{description}</div>
          </div>

          <Divider className="!my-6" />

          {/* Resources */}
          <div>
            <div className="text-sm text-gray-500 font-medium mb-3">
              Resources
            </div>
            <div className="flex flex-wrap gap-3">
              {detailData.downloadLink ? (
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  href={detailData.downloadLink}
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

              {detailData.githubLink && (
                <Button
                  icon={<GithubOutlined />}
                  href={detailData.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open GitHub
                </Button>
              )}

              {detailData.moreLink && (
                <Button
                  icon={<LinkOutlined />}
                  href={detailData.moreLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open link
                </Button>
              )}
            </div>
          </div>
        </div>
      </Spin>
    </Modal>
  );
}
