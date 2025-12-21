import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, Breadcrumb, Spin } from "antd";
import { BarChartOutlined, HomeOutlined, FileTextOutlined } from "@ant-design/icons";
import InfoCard from "../../components/common/my-group/InfoCard";
import OverviewSection from "../../components/common/my-group/OverviewSection";
import MembersPanel from "../../components/common/my-group/MembersPanel";
import FeedbackTab from "../../components/common/my-group/FeedbackTab";
import { GroupService } from "../../services/group.service";
import useKanbanBoard from "../../hook/useKanbanBoard";
import KanbanTab from "../../components/common/workspace/KanbanTab";
import BacklogTab from "../../components/common/workspace/BacklogTab";
import MilestonesTab from "../../components/common/workspace/MilestonesTab";
import ReportsTab from "../../components/common/workspace/ReportsTab";
import TaskModal from "../../components/common/kanban/TaskModal";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../hook/useTranslation";

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [groupDetail, setGroupDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState("kanban");
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const readOnlyWorkspace = true;

  const {
    filteredColumns,
    columnMeta,
    groupMembers,
    selectedTask,
    setSelectedTask,
    handleDragOver,
    handleDragEnd,
    createColumn,
    createTask,
    updateTaskFields,
    updateTaskAssignees,
    deleteTask,
    deleteColumn,
    loading: kanbanLoading,
    error: kanbanError,
    refetchBoard,
    loadTaskComments,
    addTaskComment,
    updateTaskComment,
    deleteTaskComment,
  } = useKanbanBoard(id);

  useEffect(() => {
    if (id) {
      fetchGroupDetail();
    }
  }, [id]);

  const fetchGroupDetail = async () => {
    try {
      setLoading(true);
      const response = await GroupService.getGroupDetail(id);
      setGroupDetail(response?.data || null);
    } catch (error) {

      setGroupDetail(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Loading group details..." />
      </div>
    );
  }

  const groupName = groupDetail?.name || `Group #${id}`;
  const groupDescription =
    groupDetail?.description ||
    t("groupOverviewSubtitle") ||
    "View project overview, timeline, and member contributions.";

  const hasKanbanData =
    filteredColumns && Object.keys(filteredColumns || {}).length > 0;

  const normalizeTitle = (value = "") =>
    value.toLowerCase().replace(/\s+/g, "_");

  // Build recent activity directly from kanban columns
  const tasks =
    filteredColumns && typeof filteredColumns === "object"
      ? Object.values(filteredColumns)
          .flatMap((col) => col || [])
          .filter(Boolean)
      : [];

  const recentActivity = tasks
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0)
    )
    .slice(0, 4);

  const descriptionText = (groupDetail?.description || "").trim();
  const mentor =
    groupDetail?.mentor ||
    (Array.isArray(groupDetail?.mentors) ? groupDetail.mentors[0] : null);

  const statusMeta = {
    todo: { label: "To Do", dot: "bg-gray-300" },
    to_do: { label: "To Do", dot: "bg-gray-300" },
    inprogress: { label: "In Progress", dot: "bg-amber-400" },
    in_progress: { label: "In Progress", dot: "bg-amber-400" },
    doing: { label: "Doing", dot: "bg-amber-400" },
    done: { label: "Done", dot: "bg-green-500" },
    completed: { label: "Done", dot: "bg-green-500" },
    review: { label: "Review", dot: "bg-blue-400" },
  };

  const findAssignees = (task) => {
    const list = task?.assignees || task?.assignee || [];
    if (Array.isArray(list)) return list;
    if (typeof list === "string" || typeof list === "object") return [list];
    return [];
  };

  const renderAssignee = (assignee) => {
    const name =
      (assignee?.displayName ||
        assignee?.name ||
        assignee?.email ||
        assignee) ?? "";
    const initials = String(name || "U")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return { name, initials };
  };

  const overviewGroup = groupDetail
    ? {
        title: groupDetail.name || groupName,
        statusText: groupDetail.status,
        topicName:
          groupDetail.topic?.title ||
          groupDetail.topicTitle ||
          groupDetail.topicName,
        field: groupDetail.major?.majorName,
        maxMembers: groupDetail.maxMembers || 5,
        progress:
          typeof groupDetail.projectProgress === "number"
            ? groupDetail.projectProgress
            : 0,
        semester:
          groupDetail.semester &&
          `${groupDetail.semester.season || ""} ${
            groupDetail.semester.year || ""
          }`.trim(),
        end: groupDetail.semester?.endDate,
      }
    : null;

  const groupSkills = Array.isArray(groupDetail?.skills)
    ? groupDetail.skills
    : [];

  const boardForStats =
    filteredColumns && typeof filteredColumns === "object"
      ? {
          columns: Object.entries(filteredColumns).map(
            ([columnId, colTasks]) => ({
              id: columnId,
              tasks: colTasks || [],
            })
          ),
        }
      : null;

  const items = [
    {
      key: "overview",
      label: (
        <span>
          <BarChartOutlined /> {t("overview") || "Overview"}
        </span>
      ),
      children: (
        <div className="space-y-6">
          {overviewGroup && (
            <InfoCard
              group={overviewGroup}
              memberCount={groupDetail?.currentMembers || groupMembers.length}
              onBack={undefined}
              onEdit={null}
              onSelectTopic={null}
              onActivate={null}
            />
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <OverviewSection
              descriptionText={descriptionText}
              recentActivity={recentActivity}
              statusMeta={statusMeta}
              findAssignees={findAssignees}
              renderAssignee={renderAssignee}
              groupSkills={groupSkills}
              t={t}
            />
            <MembersPanel
              groupMembers={groupMembers}
              mentor={mentor}
              group={groupDetail}
              onInvite={null}
              onAssignRole={null}
              onKickMember={null}
              onTransferLeader={null}
              currentUserEmail={userInfo?.email}
              t={t}
              showStats={false}
            />
          </div>
        </div>
      ),
    },
    {
      key: "contributions",
      label: (
        <span>
          <BarChartOutlined /> {t("contributions") || "Contributions"}
        </span>
      ),
      children: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
              <MembersPanel
                groupMembers={groupMembers}
                mentor={mentor}
                group={groupDetail}
                onInvite={null}
                onAssignRole={null}
                onKickMember={null}
                onTransferLeader={null}
                currentUserEmail={userInfo?.email}
                t={t}
                showStats
                board={boardForStats}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "workspace",
      label: (
        <span>
          <BarChartOutlined /> {t("workspace") || "Workspace"}
        </span>
      ),
      children: (
        <div className="space-y-4 px-2 sm:px-4 lg:px-6">
          <div className="flex gap-2 border-b border-gray-200">
            {[
              { key: "kanban", label: "Kanban" },
              { key: "backlog", label: "Backlog" },
              { key: "milestones", label: "Milestones" },
              { key: "reports", label: "Reports" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveWorkspaceTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeWorkspaceTab === tab.key
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeWorkspaceTab === "kanban" && (
            <KanbanTab
              kanbanLoading={kanbanLoading}
              kanbanError={kanbanError}
              hasKanbanData={hasKanbanData}
              filteredColumns={filteredColumns}
              columnMeta={columnMeta}
              setSelectedTask={setSelectedTask}
              createTask={readOnlyWorkspace ? undefined : createTask}
              deleteColumn={readOnlyWorkspace ? undefined : deleteColumn}
              handleDragOver={readOnlyWorkspace ? () => {} : handleDragOver}
              handleDragEnd={readOnlyWorkspace ? () => {} : handleDragEnd}
              isColumnModalOpen={isColumnModalOpen}
              setIsColumnModalOpen={setIsColumnModalOpen}
              handleCreateColumn={(payload) =>
                readOnlyWorkspace ? null : createColumn(payload)
              }
              t={(key) => key}
              normalizeTitle={normalizeTitle}
              readOnly={readOnlyWorkspace}
            />
          )}

          {activeWorkspaceTab === "backlog" && (
            <BacklogTab
              groupId={id}
              columnMeta={columnMeta}
              groupMembers={groupMembers}
              onPromoteSuccess={() => refetchBoard({ showLoading: false })}
              readOnly={readOnlyWorkspace}
            />
          )}

          {activeWorkspaceTab === "milestones" && (
            <MilestonesTab groupId={id} readOnly={readOnlyWorkspace} />
          )}

          {activeWorkspaceTab === "reports" && (
            <ReportsTab groupId={id} />
          )}
        </div>
      ),
    },
    {
      key: "feedback",
      label: (
        <span>
          <FileTextOutlined /> {t("feedback") || "Feedback"}
        </span>
      ),
      children: (
        <div className="space-y-4">
          <FeedbackTab
            groupId={id}
            isMentor={true}
            isLeader={false}
            groupName={groupName}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen space-y-6 animate-fadeIn">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          {
            title: (
              <span
                className="cursor-pointer text-gray-500 hover:text-blue-600"
                onClick={() => navigate("/mentor/my-groups")}
              >
                <HomeOutlined /> My Groups
              </span>
            ),
          },
          {
            title: (
              <span className="font-semibold text-gray-700">{groupName}</span>
            ),
          },
        ]}
      />

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-extrabold text-blue-600">
            {groupName} – Progress Monitoring
          </h1>
          <p className="text-gray-500 text-sm">
            {groupDescription}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        type="line"
        className="!bg-white !rounded-2xl !shadow-sm !p-6 !mt-4 !mb-0 custom-tabs"
        tabBarStyle={{ marginBottom: 24, paddingInline: 16 }}
      />

      <TaskModal
        task={selectedTask}
        groupId={id}
        members={groupMembers}
        groupDetail={groupDetail}
        columnMeta={columnMeta}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={readOnlyWorkspace ? () => {} : updateTaskFields}
        onUpdateAssignees={
          readOnlyWorkspace
            ? () => {}
            : (taskId, assignees) => updateTaskAssignees(taskId, assignees)
        }
        onDeleteTask={readOnlyWorkspace ? undefined : deleteTask}
        onFetchComments={loadTaskComments}
        onAddComment={addTaskComment}
        onUpdateComment={updateTaskComment}
        onDeleteComment={deleteTaskComment}
        readOnly={readOnlyWorkspace}
      />
    </div>
  );
}

