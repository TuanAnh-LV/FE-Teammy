import React, { useState, useEffect } from "react";
import { Modal, Descriptions, Tag, Spin, notification, Divider } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { SemesterService } from "../../services/semester.service";
import { useTranslation } from "../../hook/useTranslation";
import dayjs from "dayjs";

const SemesterDetailModal = ({ open, semesterId, onClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [semesterData, setSemesterData] = useState(null);

  useEffect(() => {
    if (open && semesterId) {
      fetchSemesterDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, semesterId]);

  const fetchSemesterDetail = async () => {
    setLoading(true);
    try {
      const response = await SemesterService.detail(semesterId);
      setSemesterData(response?.data || null);
    } catch {
      notification.error({
        message: t("error") || "Error",
        description:
          t("failedToFetchSemesterDetails") ||
          "Failed to fetch semester details",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date ? dayjs(date).format("DD/MM/YYYY") : "-";
  };

  const getStatusTag = (isActive) => {
    return isActive ? (
      <Tag icon={<CheckCircleOutlined />} color="success">
        {t("active") || "Active"}
      </Tag>
    ) : (
      <Tag icon={<CloseCircleOutlined />} color="error">
        {t("inactive") || "Inactive"}
      </Tag>
    );
  };

  const getPhaseTag = (phase) => {
    const phaseMap = {
      1: { color: "blue", text: "Phase 1" },
      2: { color: "cyan", text: "Phase 2" },
      3: { color: "purple", text: "Phase 3" },
    };
    const phaseInfo = phaseMap[phase] || { color: "default", text: "Unknown" };
    return <Tag color={phaseInfo.color}>{phaseInfo.text}</Tag>;
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <CalendarOutlined />
          <span>{t("semesterDetails") || "Semester Details"}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Spin size="large" />
        </div>
      ) : semesterData ? (
        <div className="space-y-4">
          {/* Basic Information */}
          <Descriptions
            bordered
            column={2}
            size="small"
            labelStyle={{ fontWeight: 600, width: "40%" }}
          >
            <Descriptions.Item label={t("season") || "Season"} span={1}>
              <Tag color="orange">{semesterData.season}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("year") || "Year"} span={1}>
              <Tag color="blue">{semesterData.year}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("startDate") || "Start Date"} span={1}>
              {formatDate(semesterData.startDate)}
            </Descriptions.Item>
            <Descriptions.Item label={t("endDate") || "End Date"} span={1}>
              {formatDate(semesterData.endDate)}
            </Descriptions.Item>
            <Descriptions.Item label={t("status") || "Status"} span={1}>
              {getStatusTag(semesterData.isActive)}
            </Descriptions.Item>
            <Descriptions.Item label={t("phase") || "Phase"} span={1}>
              {getPhaseTag(semesterData.phase)}
            </Descriptions.Item>
          </Descriptions>

          {/* Policy Information */}
          {semesterData.policy && (
            <>
              <Divider orientation="left" className="!my-4">
                <span className="flex items-center gap-2">
                  <ClockCircleOutlined />
                  <span className="font-semibold">
                    {t("semesterPolicy") || "Semester Policy"}
                  </span>
                </span>
              </Divider>

              <Descriptions
                bordered
                column={1}
                size="small"
                labelStyle={{ fontWeight: 600, width: "50%" }}
              >
                <Descriptions.Item
                  label={t("teamSelfSelectStart") || "Team Self-Select Start"}
                >
                  {formatDate(semesterData.policy.teamSelfSelectStart)}
                </Descriptions.Item>
                <Descriptions.Item
                  label={t("teamSelfSelectEnd") || "Team Self-Select End"}
                >
                  {formatDate(semesterData.policy.teamSelfSelectEnd)}
                </Descriptions.Item>
                <Descriptions.Item
                  label={t("teamSuggestStart") || "Team Suggest Start"}
                >
                  {formatDate(semesterData.policy.teamSuggestStart)}
                </Descriptions.Item>
                <Descriptions.Item
                  label={t("topicSelfSelectStart") || "Topic Self-Select Start"}
                >
                  {formatDate(semesterData.policy.topicSelfSelectStart)}
                </Descriptions.Item>
                <Descriptions.Item
                  label={t("topicSelfSelectEnd") || "Topic Self-Select End"}
                >
                  {formatDate(semesterData.policy.topicSelfSelectEnd)}
                </Descriptions.Item>
                <Descriptions.Item
                  label={t("topicSuggestStart") || "Topic Suggest Start"}
                >
                  {formatDate(semesterData.policy.topicSuggestStart)}
                </Descriptions.Item>
              </Descriptions>

              <Divider orientation="left" className="!my-4">
                <span className="flex items-center gap-2">
                  <TeamOutlined />
                  <span className="font-semibold">
                    {t("groupSizeConfiguration") || "Group Size Configuration"}
                  </span>
                </span>
              </Divider>

              <Descriptions
                bordered
                column={2}
                size="small"
                labelStyle={{ fontWeight: 600, width: "50%" }}
              >
                <Descriptions.Item
                  label={t("desiredGroupSizeMin") || "Minimum Group Size"}
                  span={1}
                >
                  <Tag color="green">
                    {semesterData.policy.desiredGroupSizeMin}{" "}
                    {t("members") || "members"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item
                  label={t("desiredGroupSizeMax") || "Maximum Group Size"}
                  span={1}
                >
                  <Tag color="red">
                    {semesterData.policy.desiredGroupSizeMax}{" "}
                    {t("members") || "members"}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          {t("noData") || "No data available"}
        </div>
      )}
    </Modal>
  );
};

export default SemesterDetailModal;
