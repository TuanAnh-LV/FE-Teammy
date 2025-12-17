import React, { useEffect, useState } from "react";
import { useTranslation } from "../../hook/useTranslation";
import { Modal, Button, Tag, Divider, Tooltip, Spin, notification } from "antd";
import {
  BookOutlined,
  UserOutlined,
  ApartmentOutlined,
  CalendarOutlined,
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
  const formatSeason = (s) => {
    if (!s) return "";
    const map = { SPRING: "Spring", SUMMER: "Summer", FALL: "Fall" };
    const key = String(s).toUpperCase();
    return (
      map[key] ||
      String(s).charAt(0).toUpperCase() + String(s).slice(1).toLowerCase()
    );
  };

  const semesterLabel =
    detailData.semesterSeason && detailData.semesterYear
      ? `${formatSeason(detailData.semesterSeason)} ${detailData.semesterYear}`
      : null;

  const semesterTag = semesterLabel ? (
    <Tag
      icon={<CalendarOutlined />}
      color="geekblue"
      className="px-3 py-1 rounded-full"
    >
      {semesterLabel}
    </Tag>
  ) : null;

  const groupLabel =
    Array.isArray(detailData.groups) && detailData.groups.length
      ? detailData.groups
          .map((g) => g.groupName || g.name || g.groupId)
          .join(", ")
      : "-";
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
      footer={null}
      title={null}
      destroyOnClose
      maskClosable
      width="min(1000px, 92vw)"
      styles={{
        content: { padding: 0, borderRadius: 14 },
        body: {
          padding: 0,
          maxHeight: "calc(100vh - 120px)",
          overflowY: "auto",
        },
      }}
      className="rounded-2xl"
    >
      <Spin spinning={loading}>
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide">
                <BookOutlined /> {t("topic") || "Topic"}
              </div>
              <h2 className="text-2xl font-bold leading-tight mt-1">{title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {statusTag}
                {semesterTag}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
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
            <InfoCard
              icon={<ApartmentOutlined />}
              label={t("group") || "Group"}
              value={groupLabel}
              muted={groupLabel === "-"}
            />
          </div>

          <div className="mt-6">
            <div className="text-sm text-gray-500 font-medium mb-2">
              {t("description") || "Description"}
            </div>
            <div className="prose max-w-none text-gray-800">{description}</div>
          </div>

          <Divider className="!my-6" />

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
