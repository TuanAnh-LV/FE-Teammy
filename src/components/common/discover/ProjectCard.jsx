import React, { useState } from "react";
import { Sparkles, Users, Download, FileText } from "lucide-react";
import { GroupService } from "../../../services/group.service";
import { notification } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../../hook/useTranslation";

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const formattedDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString()
    : "";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 p-6 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg leading-snug">
            {project.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{project.description}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <Sparkles className="w-4 h-4" /> AI
          </div>
          <div className="text-xs text-gray-500">{formattedDate}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
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

      <div className="flex items-center justify-between mb-4">
        <div>
          {project.mentor && (
            <div className="text-sm text-gray-600">
              Mentor:{" "}
              <span className="font-medium text-gray-800">
                {project.mentor}
              </span>
            </div>
          )}
          <div className="text-sm text-gray-500 mt-2">
            {(project.members || []).length} Members
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {(project.members || []).slice(0, 3).map((m, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 border border-white"
              >
                {m}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attached files / reference */}
      <div className="mb-4 text-sm text-gray-600">
        {(project.attachedFiles || []).length > 0 && (
          <div className="mb-2">
            <div className="text-xs text-gray-500 mb-2">Attached Files</div>
            <ul className="space-y-2">
              {(project.attachedFiles || []).map((f, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FileText className="w-4 h-4 text-gray-400" />
                    {f.name}
                  </div>
                  <Download className="w-4 h-4 text-gray-400" />
                </li>
              ))}
            </ul>
          </div>
        )}

        {(project.referenceDocs || []).length > 0 && (
          <div className="mb-2">
            <div className="text-xs text-gray-500 mb-2">
              Reference Documents
            </div>
            <ul className="space-y-1">
              {(project.referenceDocs || []).map((d, idx) => (
                <li key={idx} className="text-sm text-blue-600">
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-auto">
        <button
          onClick={async () => {
            if (project.status === 'closed' || !project.topicId) return;
            
            try {
              setLoading(true);
              
              // Check if user has a group
              const myGroupsRes = await GroupService.getMyGroups();
              const myGroups = myGroupsRes?.data || [];
              
              if (!myGroups || myGroups.length === 0) {
                notification.error({
                  message: t('noGroupFound'),
                  description: t('pleaseCreateOrJoinGroup'),
                });
                navigate('/my-group');
                return;
              }

              // Get the first group (or you can let user select)
              const group = myGroups[0];
              const groupId = group.id || group.groupId;

              // Check if group is full
              const currentMembers = group.currentMembers || 0;
              const maxMembers = group.maxMembers || 0;
              
              if (currentMembers < maxMembers) {
                notification.error({
                  message: t('groupNotFull'),
                  description: `${t('groupMustBeFull')} ${currentMembers}/${maxMembers} ${t('members')}.`,
                });
                return;
              }

              await GroupService.assignTopic(groupId, project.topicId);
              
              notification.success({
                message: t('topicSelected'),
                description: `${t('successfullySelected')} "${project.title}" ${t('forYourGroup')}`,
              });
              
              navigate(`/my-group`);
            } catch (err) {
              console.error('Failed to select topic:', err);
              notification.error({
                message: t('failedToSelectTopic'),
                description: err?.response?.data?.message || t('pleaseTryAgain'),
              });
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading || project.status === 'closed'}
          className={`w-full text-sm font-semibold py-3 rounded-lg transition-colors ${
            project.status === 'closed'
              ? 'bg-gray-400 cursor-not-allowed text-gray-200'
              : 'bg-[#4264d7] hover:bg-[#3552b0] text-white'
          }`}
        >
          {loading ? t('selecting') : project.status === 'closed' ? t('topicClosed') : t('selectTopic')}
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
