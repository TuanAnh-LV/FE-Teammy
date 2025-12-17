import React from "react";
import { Modal } from "antd";
import {
  X,
  Users,
  Calendar,
  FileText,
  Download,
  Sparkles,
  Award,
} from "lucide-react";
import { useTranslation } from "../../../hook/useTranslation";

const TopicDetailModal = ({
  isOpen,
  onClose,
  topic,
  onSelectTopic,
  loading,
  detailLoading = false,
  hasGroupTopic = false,
  isAISuggestion = false,
  membership = {},
  myGroupDetails = null,
  allProjects = [],
}) => {
  const { t } = useTranslation();

  if (!topic) return null;

  // Check if user's group has pending invitation for this topic
  const myGroupId =
    membership?.groupId || myGroupDetails?.groupId || myGroupDetails?.id;
  const topicGroups = topic.groups || topic.detail?.groups || [];
  const myGroupInTopic = topicGroups.find((g) => g.groupId === myGroupId);
  const hasPendingInvitation = myGroupInTopic?.status === "pending_invitation";

  // Check if group has pending invitation for ANY other topic by scanning all projects
  const groupHasAnyPending = allProjects.some((p) => {
    if (p.topicId === topic.topicId) return false; // Skip current topic
    const groups = p.groups || p.detail?.groups || [];
    return groups.some(
      (g) => g.groupId === myGroupId && g.status === "pending_invitation"
    );
  });

  // Show other groups selecting this topic (exclude user's group)
  const otherGroupsSelecting = topicGroups.filter(
    (g) => g.groupId !== myGroupId && g.status === "pending_invitation"
  );

  const canSelectTopic = isOpen && !hasPendingInvitation && !groupHasAnyPending;

  const formattedDate = topic.createdAt
    ? new Date(topic.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const handleDownload = (url, fileName) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "download";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      centered
      open={isOpen}
      onCancel={onClose}
      footer={null}
      title={null}
      destroyOnClose
      maskClosable
      closeIcon={<X className="w-5 h-5" />}
      width="min(800px, 92vw)"
      styles={{
        content: { padding: 0, borderRadius: 14 },
        body: {
          padding: 0,
          maxHeight: "calc(100vh - 120px)",
          overflowY: "auto",
        },
      }}
      confirmLoading={loading}
      className="rounded-2xl topic-detail-modal"
    >
      {detailLoading ? (
        <div className="p-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {t("loadingDetails") || "Loading details..."}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {topic.title}
                </h2>
                {isAISuggestion && topic.score && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold rounded-full">
                      <Sparkles className="w-4 h-4 fill-white" />
                      AI Recommended
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full">
                      <Award className="w-4 h-4 fill-white" />
                      {topic.score}% Match
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Major and Status */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg">
                {topic.domain}
              </span>
              {(() => {
                const status = (topic.status || "").toLowerCase();

                const statusUI = {
                  open: {
                    label: t("open") || "Open",
                    cls: "bg-green-50 text-green-700 border border-green-200",
                    icon: null,
                  },
                  closed: {
                    label: t("closed") || "Closed",
                    cls: "bg-gray-100 text-gray-700 border border-gray-200",
                    icon: null,
                  },
                };

                const ui = statusUI[status] || statusUI.closed;

                return (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg ${ui.cls}`}
                  >
                    {ui.icon}
                    {ui.label}
                  </span>
                );
              })()}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {t("description") || "Description"}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {topic.description}
              </p>
            </div>

            {/* Skills */}
            {(topic.topicSkills || []).length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {t("requiredSkills") || "Required Skills"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(topic.topicSkills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-purple-50 text-purple-700 rounded-lg border border-purple-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Skills for AI suggestions */}
            {isAISuggestion && (topic.matchingSkills || []).length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {t("matchingSkills") || "Your Matching Skills"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(topic.matchingSkills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-green-50 text-green-700 rounded-lg border border-green-200"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mentors */}
            {topic.mentor && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {t("mentor") || "Mentor"}
                </h3>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-800 font-medium">
                    {topic.mentor}
                  </span>
                </div>
              </div>
            )}

            {/* Groups Selecting This Topic */}
            {otherGroupsSelecting.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {t("groupsSelectingTopic") || "Groups Selecting This Topic"}
                </h3>
                <div className="space-y-2">
                  {otherGroupsSelecting.map((group, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200"
                    >
                      <Users className="w-5 h-5 text-amber-600" />
                      <div className="flex-1">
                        <span className="text-gray-800 font-medium">
                          {group.groupName}
                        </span>
                        <span className="ml-2 text-xs text-amber-700 font-medium">
                          ({t("pendingInvitation") || "Pending Invitation"})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Created Date */}
            {formattedDate && (
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {t("createdOn") || "Created on"}: {formattedDate}
                  </span>
                </div>
              </div>
            )}

            {/* Registration File */}
            {topic.registrationFile && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {t("registrationFile") || "Registration File"}
                </h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {topic.registrationFile.fileName || "Document"}
                      </p>
                      {topic.registrationFile.fileSize && (
                        <p className="text-xs text-gray-500">
                          {(
                            topic.registrationFile.fileSize /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleDownload(
                        topic.registrationFile.fileUrl,
                        topic.registrationFile.fileName
                      )
                    }
                    className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            )}

            {/* Attached Files */}
            {(topic.attachedFiles || []).length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {t("attachedFiles") || "Attached Files"}
                </h3>
                <div className="space-y-2">
                  {(topic.attachedFiles || []).map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {file.name || file.fileName || `File ${idx + 1}`}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleDownload(file.url || file.fileUrl, file.name)
                        }
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reference Docs */}
            {(topic.referenceDocs || []).length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {t("referenceDocuments") || "Reference Documents"}
                </h3>
                <ul className="space-y-2">
                  {(topic.referenceDocs || []).map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 text-sm mt-0.5">•</span>
                      <a
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                      >
                        {doc}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-orange-600 border border-orange-400 hover:border-orange-500 hover:text-orange-700 rounded-lg transition-all"
            >
              {t("close") || "Close"}
            </button>
            {!hasGroupTopic && membership?.status === "leader" && (
              <>
                {hasPendingInvitation ? (
                  <button
                    disabled
                    className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all bg-amber-100 text-amber-700 border border-amber-300 cursor-not-allowed"
                  >
                    {t("pendingInvitation") || "Pending Invitation"}
                  </button>
                ) : groupHasAnyPending ? (
                  <button
                    disabled
                    className="flex-1 px-4 py-2.5 text-xs font-medium rounded-lg transition-all bg-gray-100 text-gray-500 border border-gray-300 cursor-not-allowed"
                    title={
                      t("alreadyHasPendingTopic") ||
                      "You have a pending invitation for another topic"
                    }
                  >
                    {t("hasPendingInvitation") || "Pending for Another Topic"}
                  </button>
                ) : canSelectTopic ? (
                  <button
                    onClick={() => {
                      onSelectTopic(topic);
                      onClose();
                    }}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all bg-[#FF7A00] hover:!opacity-90 text-white border-none"
                  >
                    {loading ? t("selecting") : t("selectTopic")}
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TopicDetailModal;
