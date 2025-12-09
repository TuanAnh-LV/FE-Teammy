import React, { useEffect, useState } from "react";
import { useTranslation } from "../../hook/useTranslation";
import { Modal, Button, Tag, Divider, Tooltip, Spin, notification } from "antd";
import {
  BookOutlined,
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
  const { t } = useTranslation();
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
      } catch {
        notification.error({
          message:
            t("failedLoadTopicDetails") || "Failed to load topic details",
        });
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
  console.log("Detail Data:", detailData);
  // Support both old and new field names
  const title = detailData.topicName || detailData.title || "-";
  const mentor =
    Array.isArray(detailData.mentors) && detailData.mentors.length
      ? detailData.mentors
          .map((m) => m.mentorName || m.name || m.mentorEmail)
          .join(", ")
      : detailData.mentorName || "-";
  const major = detailData.majorName || detailData.major || "-";
  const created = detailData.createdAt || detailData.date || null;
  const description = detailData.description || detailData.desc || "-";
  const source = detailData.source || "-";

  // Determine assigned state: prefer explicit group, else status field
  // Status từ API: "open" | "closed"
  const rawStatus = detailData.status || "open";
  const normalizedStatus = String(rawStatus).toLowerCase();
  const isOpen = normalizedStatus === "open";

  const statusTag = (
    <Tag
      icon={isOpen ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
      color={isOpen ? "green" : "orange"}
      className="px-3 py-1 rounded-full"
    >
      {isOpen ? t("open") || "Open" : t("closed") || "Closed"}
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
      style={{ padding: 0, overflow: "hidden" }}
      className="rounded-2xl"
      footer={[
        <Button
          key="close"
          onClick={onClose}
          className="
          !border-gray-300 hover:!border-orange-400 hover:!text-orange-400 transition-all"
        >
          {t("close") || "Close"}
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide">
                <BookOutlined /> {t("topic") || "Topic"}
              </div>
              <h2 className="text-2xl font-bold leading-tight mt-1">{title}</h2>
              <div className="mt-2">{statusTag}</div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <InfoCard
              icon={<UserOutlined />}
              label={t("mentor") || "Mentor"}
              value={mentor}
              muted={!mentor || mentor === "-"}
            />
            <InfoCard
              icon={<ApartmentOutlined />}
              label={t("major") || "Major"}
              value={major}
              muted={!major || major === "-"}
            />
            <InfoCard
              icon={<CalendarOutlined />}
              label={t("created") || "Created"}
              value={formatDate(created)}
              muted={!created}
            />
          </div>

          {/* Description (hidden in table, visible here) */}
          <div className="mt-6">
            <div className="text-sm text-gray-500 font-medium mb-2">
              {t("description") || "Description"}
            </div>
            <div className="prose max-w-none text-gray-800">{description}</div>
          </div>

          <Divider className="!my-6" />

          {/* Resources */}
          <div>
            <div className="text-sm text-gray-500 font-medium mb-3">
              {t("resources") || "Resources"}
            </div>
            <div className="flex flex-wrap gap-3">
              {source && source !== "-" && (
                <Button
                  type="primary"
                  icon={<LinkOutlined />}
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="!bg-[#FF7A00] hover:!opacity-90"
                >
                  {t("openSource") || "Open Source"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Spin>
    </Modal>
  );
}
