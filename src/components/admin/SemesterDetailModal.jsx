import React from "react";
import { Modal, Descriptions, Tag, Spin, Divider } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "../../hook/useTranslation";
import dayjs from "dayjs";

const SemesterDetailModal = ({ open, semester, onClose, loading = false }) => {
  const { t } = useTranslation();
  const semesterData = semester;

  const formatDate = (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-");

  const getStatusTag = (isActive) =>
    isActive ? (
      <Tag icon={<CheckCircleOutlined />} color="success">
        {t("active") || "Active"}
      </Tag>
    ) : (
      <Tag icon={<CloseCircleOutlined />} color="error">
        {t("inactive") || "Inactive"}
      </Tag>
    );

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
      width={1200}
      destroyOnClose
    >
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Spin size="large" />
        </div>
      ) : semesterData ? (
        <div className="space-y-4">
          <Descriptions
            bordered
            column={2}
            size="small"
            labelStyle={{ fontWeight: 600, width: "40%" }}
          >
            <Descriptions.Item label={t("season") || "Season"}>
              <Tag color="orange">{semesterData.season}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("year") || "Year"}>
              <Tag color="blue">{semesterData.year}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("startDate") || "Start Date"}>
              {formatDate(semesterData.startDate)}
            </Descriptions.Item>
            <Descriptions.Item label={t("endDate") || "End Date"}>
              {formatDate(semesterData.endDate)}
            </Descriptions.Item>
            <Descriptions.Item label={t("status") || "Status"}>
              {getStatusTag(semesterData.isActive)}
            </Descriptions.Item>
            <Descriptions.Item label={t("phase") || "Phase"}>
              {getPhaseTag(semesterData.phase)}
            </Descriptions.Item>
          </Descriptions>

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
              {formatDate(semesterData?.policy?.teamSelfSelectStart)}
            </Descriptions.Item>
            <Descriptions.Item
              label={t("teamSelfSelectEnd") || "Team Self-Select End"}
            >
              {formatDate(semesterData?.policy?.teamSelfSelectEnd)}
            </Descriptions.Item>
            <Descriptions.Item
              label={t("teamSuggestStart") || "Team Suggest Start"}
            >
              {formatDate(semesterData?.policy?.teamSuggestStart)}
            </Descriptions.Item>
            <Descriptions.Item
              label={t("topicSelfSelectStart") || "Topic Self-Select Start"}
            >
              {formatDate(semesterData?.policy?.topicSelfSelectStart)}
            </Descriptions.Item>
            <Descriptions.Item
              label={t("topicSelfSelectEnd") || "Topic Self-Select End"}
            >
              {formatDate(semesterData?.policy?.topicSelfSelectEnd)}
            </Descriptions.Item>
            <Descriptions.Item
              label={t("topicSuggestStart") || "Topic Suggest Start"}
            >
              {formatDate(semesterData?.policy?.topicSuggestStart)}
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
            >
              <Tag color="green">
                {semesterData?.policy?.desiredGroupSizeMin ?? "-"}{" "}
                {t("members") || "members"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item
              label={t("desiredGroupSizeMax") || "Maximum Group Size"}
            >
              <Tag color="red">
                {semesterData?.policy?.desiredGroupSizeMax ?? "-"}{" "}
                {t("members") || "members"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
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
