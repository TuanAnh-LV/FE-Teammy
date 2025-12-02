import React, { useState } from "react";
import { Sparkles, Users, Download, FileText } from "lucide-react";
import { GroupService } from "../../../services/group.service";
import { notification } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../../hook/useTranslation";

// Added optional onSelectTopic callback so parent can show invite mentor modal.
const ProjectCard = ({ project, onSelectTopic }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const formattedDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString()
    : "";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 p-6 flex flex-row gap-6">
      
      {/* Left section */}
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

          {(project.tags || []).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-700 font-medium px-2 py-1 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-6">
          {project.mentor && (
            <div className="text-sm text-gray-600">
              {t("mentor")}:{" "}
              <span className="font-medium text-gray-800">
                {project.mentor}
              </span>
            </div>
          )}

          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {(project.members || []).length} {t("members")}
          </div>
        </div>

        {/* Attached Files + Reference Docs */}
        {((project.attachedFiles || []).length > 0 ||
          (project.referenceDocs || []).length > 0) && (
          <div className="text-sm text-gray-600 flex gap-6">
            
            {/* Attached Files */}
            {(project.attachedFiles || []).length > 0 && (
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-2">{t("attachedFiles") || "Attached Files"}</div>
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

            {/* Reference Docs */}
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

      {/* Right section - Button */}
      <div className="flex-shrink-0 w-40 flex flex-col justify-between">
        
        {/* Date + AI Tag */}
        <div className="flex flex-col items-end gap-2">
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <Sparkles className="w-4 h-4" /> {t("ai") || "AI"}
          </div>
          <div className="text-xs text-gray-500">{formattedDate}</div>
        </div>
        
        {/* Select Topic Button */}
        <button
          onClick={async () => {
            if (project.status === "closed" || !project.topicId) return;

            // Nếu có callback từ parent (hiện dùng để bật modal invite mentor) thì gọi và dừng tại đây.
            if (typeof onSelectTopic === "function") {
              onSelectTopic(project);
              return;
            }

            // Fallback cũ: tự assign topic ngay.
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
              const currentMembers = group.currentMembers || 0;
              const maxMembers = group.maxMembers || 0;

              if (currentMembers < maxMembers) {
                notification.error({
                  message: t("groupNotFull"),
                  description: `${t("groupMustBeFull")} ${currentMembers}/${maxMembers} ${t("members")}.`,
                });
                return;
              }

              await GroupService.assignTopic(groupId, project.topicId);

              notification.success({
                message: t("topicSelected"),
                description: `${t("successfullySelected")} "${project.title}" ${t("forYourGroup")}`,
              });

              navigate(`/my-group`);
            } catch (err) {

              notification.error({
                message: t("failedToSelectTopic"),
                description: err?.response?.data?.message || t("pleaseTryAgain"),
              });
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading || project.status === "closed"}
          className={`w-full text-sm font-semibold py-3 rounded-lg transition-colors ${
            project.status === "closed"
              ? "bg-gray-400 cursor-not-allowed text-gray-200"
              : "bg-[#4264d7] hover:bg-[#3552b0] text-white"
          }`}
        >
          {loading
            ? t("selecting")
            : project.status === "closed"
            ? t("topicClosed")
            : t("selectTopic")}
        </button>

      </div>
    </div>
  );
};

export default ProjectCard;

