import React, { useState } from "react";
import { Sparkles, Users, Download, FileText } from "lucide-react";
import { GroupService } from "../../../services/group.service";
import { notification } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../../hook/useTranslation";
import { getStatusTagClasses } from "../../../utils/statusTag";

const ProjectCard = ({
  project,
  onSelectTopic,
  onViewDetail,
  hasGroupTopic = false,
  isAISuggestion = false,
  membership = {},
  myGroupDetails = null,
  allProjects = [],
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const formattedDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString()
    : "";
  const status = String(
    project.status || project.tags?.[0] || ""
  ).toLowerCase();
  const isOpen = status === "open";

  const myGroupId =
    membership?.groupId || myGroupDetails?.groupId || myGroupDetails?.id;
  const topicGroups = project.groups || project.detail?.groups || [];
  const myGroupInTopic = topicGroups.find((g) => g.groupId === myGroupId);
  const hasPendingInvitation = myGroupInTopic?.status === "pending_invitation";

  const groupHasAnyPending = allProjects.some((p) => {
    if (p.topicId === project.topicId) return false;
    const groups = p.groups || p.detail?.groups || [];
    return groups.some(
      (g) => g.groupId === myGroupId && g.status === "pending_invitation"
    );
  });

  const otherGroupsSelecting = topicGroups.filter(
    (g) => g.groupId !== myGroupId && g.status === "pending_invitation"
  );
  console.log("otherGroupsSelecting", otherGroupsSelecting);
  const canSelectTopic = isOpen && !hasPendingInvitation && !groupHasAnyPending;

  return (
    <div
      className={`rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 p-6 flex flex-row gap-6 cursor-pointer ${
        isAISuggestion
          ? "bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-300"
          : "bg-white border border-gray-100"
      }`}
      onClick={() => onViewDetail && onViewDetail(project)}
    >
      <div className="flex-1 flex flex-col gap-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg leading-snug">
            {project.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{project.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-1 rounded-md">
            {project.domain}
          </span>

          {(project.tags || []).map((tag) => {
            const tagClasses = getStatusTagClasses(tag);

            return (
              <span
                key={tag}
                className={`text-xs font-medium px-2 py-1 rounded-md ${tagClasses}`}
              >
                {tag}
              </span>
            );
          })}
        </div>

        {(project.topicSkills || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(project.topicSkills || []).slice(0, 10).map((skill, idx) => (
              <span
                key={idx}
                className="text-xs bg-purple-50 text-purple-700 font-medium px-2 py-1 rounded-md border border-purple-200"
              >
                {skill}
              </span>
            ))}
            {(project.topicSkills || []).length > 10 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{(project.topicSkills || []).length - 10} more
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {project.mentor && (
            <div className="text-sm text-gray-600">
              {t("mentor")}:{" "}
              <span className="font-medium text-gray-800">
                {project.mentor}
              </span>
            </div>
          )}
          {otherGroupsSelecting.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-600">
              <Users className="w-3.5 h-3.5" />
              <span>
                {otherGroupsSelecting.length === 1
                  ? `${otherGroupsSelecting[0].groupName} ${
                      t("isSelectingTopic") || "is selecting this topic"
                    }`
                  : `${otherGroupsSelecting.length} ${
                      t("groupsSelecting") || "groups are selecting this topic"
                    }`}
              </span>
            </div>
          )}
        </div>
        {((project.attachedFiles || []).length > 0 ||
          (project.referenceDocs || []).length > 0) && (
          <div className="text-sm text-gray-600 flex gap-6">
            {(project.attachedFiles || []).length > 0 && (
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-2">
                  {t("attachedFiles") || "Attached Files"}
                </div>
                <ul className="space-y-2">
                  {(project.attachedFiles || []).slice(0, 2).map((f, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2"
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{f.name}</span>
                      </div>
                      <Download className="w-4 h-4 text-gray-400" />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(project.referenceDocs || []).length > 0 && (
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-2">
                  {t("referenceDocuments") || "Reference Documents"}
                </div>
                <ul className="space-y-1">
                  {(project.referenceDocs || []).slice(0, 3).map((d, idx) => (
                    <li key={idx} className="text-sm text-blue-600 truncate">
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 w-40 flex flex-col justify-between">
        <div className="flex flex-col items-end gap-2">
          {isAISuggestion && (
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> {t("ai") || "AI"}
            </div>
          )}
          <div className="text-xs text-gray-500">{formattedDate}</div>
        </div>
        {!hasGroupTopic && membership?.status === "leader" && (
          <>
            {hasPendingInvitation ? (
              <button
                disabled
                className="w-full text-sm font-semibold py-3 rounded-lg transition-colors !bg-amber-100 !text-amber-700 !border !border-amber-300 cursor-not-allowed"
              >
                {t("pendingInvitation") || "Pending Invitation"}
              </button>
            ) : groupHasAnyPending ? (
              <button
                disabled
                className="w-full text-xs font-medium py-3 rounded-lg transition-colors !bg-gray-100 !text-gray-500 !border !border-gray-300 cursor-not-allowed"
                title={
                  t("alreadyHasPendingTopic") ||
                  "You have a pending invitation for another topic"
                }
              >
                {t("hasPendingInvitation") || "Pending for Another Topic"}
              </button>
            ) : canSelectTopic ? (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!project.topicId) return;
                  if (typeof onSelectTopic === "function") {
                    onSelectTopic(project);
                    return;
                  }

                  try {
                    setLoading(true);

                    const myGroupsRes = await GroupService.getMyGroups();
                    const myGroups = myGroupsRes?.data || [];

                    if (!myGroups.length) {
                      notification.error({
                        message: t("noGroupFound"),
                        description: t("pleaseCreateOrJoinGroup"),
                      });
                      navigate("/my-group");
                      return;
                    }

                    const group = myGroups[0];
                    const groupId = group.id || group.groupId;

                    await GroupService.assignTopic(groupId, project.topicId);

                    notification.success({
                      message: t("topicSelected"),
                      description: `${t("successfullySelected")} "${
                        project.title
                      }" ${t("forYourGroup")}`,
                    });

                    navigate(`/my-group`);
                  } catch (err) {
                    notification.error({
                      message: t("failedToSelectTopic"),
                      description:
                        err?.response?.data?.message || t("pleaseTryAgain"),
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full text-sm font-semibold py-3 rounded-lg transition-colors !bg-[#FF7A00] hover:!opacity-90 !text-white !border-none cursor-pointer"
              >
                {loading ? t("selecting") : t("selectTopic")}
              </button>
            ) : null}
          </>
        )}{" "}
      </div>
    </div>
  );
};

export default ProjectCard;



