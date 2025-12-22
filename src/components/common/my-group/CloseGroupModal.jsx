import React from "react";
import { Modal } from "antd";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "../../../hook/useTranslation";

export default function CloseGroupModal({
  open,
  onClose,
  onConfirm,
  onReject,
  role, // 'leader' or 'mentor'
  status, // 'active' or 'pending_close'
  loading = false,
}) {
  const { t } = useTranslation();

  // Leader requesting to close
  if (role === "leader" && status === "active") {
    return (
      <Modal
        open={open}
        onCancel={onClose}
        onOk={onConfirm}
        okText={t("requestClose") || "Request Close"}
        cancelText={t("cancel") || "Cancel"}
        okButtonProps={{
          className: "!bg-red-600 hover:!bg-red-700 !border-red-600",
          loading,
        }}
        title={
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span>{t("requestCloseGroup") || "Request to Close Group"}</span>
          </div>
        }
      >
        <div className="py-4">
          <p className="text-gray-700 mb-4">
            {t("requestCloseGroupDescription") ||
              "Are you sure you want to request closing this group? This action will send a notification to your mentor for approval."}
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <p className="font-semibold mb-1">
              {t("requirements") || "Requirements:"}
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t("groupMustBeActive") || "Group must be active"}</li>
              <li>{t("groupMustHaveMentor") || "Group must have a mentor"}</li>
              <li>{t("groupMustHaveTopic") || "Group must have a topic"}</li>
              <li>
                {t("groupMustHaveEnoughMembers") ||
                  "Group must have enough members"}
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    );
  }

  // Mentor confirming close
  if (role === "mentor" && status === "pending_close") {
    return (
      <Modal
        open={open}
        onCancel={onClose}
        footer={[
          <button
            key="reject"
            onClick={onReject}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors"
          >
            {t("reject") || "Reject"}
          </button>,
          <button
            key="confirm"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 transition-colors"
          >
            {loading ? t("processing") || "Processing..." : t("confirmClose") || "Confirm Close"}
          </button>,
        ]}
        title={
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span>{t("confirmCloseGroup") || "Confirm Close Group"}</span>
          </div>
        }
      >
        <div className="py-4">
          <p className="text-gray-700 mb-4">
            {t("confirmCloseGroupDescription") ||
              "The leader has requested to close this group. Do you want to confirm or reject this request?"}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 mb-3">
            <p className="font-semibold mb-1">
              {t("ifConfirmed") || "If confirmed:"}
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                {t("groupStatusWillChangeToClosed") ||
                  "Group status will change to 'closed'"}
              </li>
              <li>
                {t("membersWillBeUpdated") || "Members will be updated"}
              </li>
              <li>
                {t("leaderWillBeNotified") || "Leader will be notified via email"}
              </li>
            </ul>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800">
            <p className="font-semibold mb-1">
              {t("ifRejected") || "If rejected:"}
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                {t("groupStatusWillReturnToActive") ||
                  "Group status will return to 'active'"}
              </li>
              <li>
                {t("leaderWillBeNotified") || "Leader will be notified via email"}
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    );
  }

  return null;
}

