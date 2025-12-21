import React, { useState } from "react";
import { Calendar, MessageSquare, Star, AlertTriangle, ArrowRight, CheckCircle, Clock } from "lucide-react";
import { Modal, Form, Input, Select, Button } from "antd";
import { useTranslation } from "../../../hook/useTranslation";

const { TextArea } = Input;

export default function FeedbackCard({ feedback, isLeader, onUpdateStatus, groupId }) {
  const { t } = useTranslation();
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [form] = Form.useForm();

  const getStatusConfig = (status) => {
    const statusLower = (status || "").toLowerCase();
    if (statusLower === "acknowledged" || statusLower === "đã xác nhận") {
      return {
        label: t("acknowledgedStatus") || "Acknowledged",
        color: "bg-yellow-500 text-white",
        icon: <CheckCircle className="w-3 h-3" />,
      };
    }
    if (statusLower === "resolved" || statusLower === "đã giải quyết") {
      return {
        label: t("resolvedStatus") || "Resolved",
        color: "bg-green-500 text-white",
        icon: <CheckCircle className="w-3 h-3" />,
      };
    }
    if (statusLower === "follow_up_requested" || statusLower === "chờ xử lý") {
      return {
        label: t("pendingStatus") || "Pending",
        color: "bg-yellow-500 text-white",
        icon: <Clock className="w-3 h-3" />,
      };
    }
    return {
      label: t("pendingStatus") || "Pending",
      color: "bg-yellow-500 text-white",
      icon: <Clock className="w-3 h-3" />,
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return t("today") || "Today";
      if (diffDays === 1) return `1 ${t("dayAgo") || "day ago"}`;
      return `${diffDays} ${t("daysAgo") || "days ago"}`;
    } catch {
      return dateString;
    }
  };

  const getInitials = (name = "") => {
    const trimmed = String(name || "").trim();
    if (!trimmed) return "?";
    const parts = trimmed.split(/\s+/).slice(0, 2);
    return parts
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const translateCategory = (category) => {
    if (!category) return "";
    const categoryLower = category.toLowerCase();
    const categoryMap = {
      "projectprogress": t("projectProgress") || "Project Progress",
      "tiến độ dự án": t("projectProgress") || "Project Progress",
      "codequality": t("codeQuality") || "Code Quality",
      "chất lượng code": t("codeQuality") || "Code Quality",
      "technicalskills": t("technicalSkills") || "Technical Skills",
      "kỹ năng kỹ thuật": t("technicalSkills") || "Technical Skills",
      "teamwork": t("teamwork") || "Teamwork",
      "làm việc nhóm": t("teamwork") || "Teamwork",
      "other": t("other") || "Other",
      "khác": t("other") || "Other",
    };
    return categoryMap[categoryLower] || category;
  };

  const statusConfig = getStatusConfig(feedback.status);
  const mentorName = feedback.mentor?.displayName || feedback.mentor?.name || feedback.mentor?.email || (t("mentor") || "Mentor");
  const mentorEmail = feedback.mentor?.email || "";
  const mentorInitials = getInitials(mentorName);

  const handleStatusUpdate = async (values) => {
    if (onUpdateStatus) {
      await onUpdateStatus(feedback.id, values);
      setStatusModalOpen(false);
      form.resetFields();
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        {/* Header: Mentor info and status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
              {mentorInitials}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{mentorName} - {t("mentor") || "Mentor"}</p>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(feedback.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
            {statusConfig.icon}
            <span>{statusConfig.label}</span>
          </div>
        </div>

        {/* Main feedback text */}
        <p className="text-gray-800">{feedback.summary}</p>

        {/* Category tag and Rating in same row */}
        {(feedback.category || feedback.rating) && (
          <div className="flex items-center gap-3 flex-wrap">
            {feedback.category && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                {translateCategory(feedback.category)}
              </div>
            )}
            {feedback.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm text-gray-700">{feedback.rating}/5</span>
              </div>
            )}
          </div>
        )}

        {/* Details */}
        {feedback.details && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MessageSquare className="w-4 h-4" />
              <span className="font-medium">{t("details") || "Details"}</span>
            </div>
            <p className="text-sm text-gray-700 pl-6">{feedback.details}</p>
          </div>
        )}

        {/* Blockers */}
        {feedback.blockers && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-semibold">{t("feedbackBlockers") || "Blockers"}</span>
            </div>
            <p className="text-sm text-red-600 pl-6">{feedback.blockers}</p>
          </div>
        )}

        {/* Next Steps */}
        {feedback.nextSteps && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ArrowRight className="w-4 h-4" />
              <span className="font-medium">{t("nextSteps") || "Next Steps"}</span>
            </div>
            <p className="text-sm text-gray-700 pl-6">{feedback.nextSteps}</p>
          </div>
        )}

        {/* Note from leader */}
        {feedback.note && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-1">{t("note") || "Note"}:</p>
            <p className="text-sm text-gray-700">{feedback.note}</p>
          </div>
        )}

        {/* Status update button (Leader only) */}
        {isLeader && (
          <div className="pt-2 border-t border-gray-200">
            <button
              onClick={() => setStatusModalOpen(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {t("updateStatus") || "Update Status"}
            </button>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <Modal
        title={t("updateFeedbackStatus") || "Update Feedback Status"}
        open={statusModalOpen}
        onCancel={() => {
          setStatusModalOpen(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleStatusUpdate}
          initialValues={{
            status: feedback.status || "acknowledged",
          }}
        >
          <Form.Item
            name="status"
            label={t("status") || "Status"}
            rules={[{ required: true, message: t("pleaseSelectStatus") || "Please select status" }]}
          >
            <Select>
              <Select.Option value="acknowledged">{t("acknowledgedStatus") || "Acknowledged"}</Select.Option>
              <Select.Option value="follow_up_requested">{t("pendingStatus") || "Pending"}</Select.Option>
              <Select.Option value="resolved">{t("resolvedStatus") || "Resolved"}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="note"
            label={t("note") || "Note"}
          >
            <TextArea rows={4} placeholder={t("notePlaceholder") || "Enter note (optional)"} />
          </Form.Item>
          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => {
                setStatusModalOpen(false);
                form.resetFields();
              }}>
                {t("cancel") || "Cancel"}
              </Button>
              <Button type="primary" htmlType="submit">
                {t("update") || "Update"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

