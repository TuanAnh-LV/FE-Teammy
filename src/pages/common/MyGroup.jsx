import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "../../hook/useTranslation";
import { useAuth } from "../../context/AuthContext";
import { BoardService } from "../../services/board.service";
import InfoCard from "../../components/common/my-group/InfoCard";
import AddMemberModal from "../../components/common/my-group/AddMemberModal";
import EditGroupModal from "../../components/common/my-group/EditGroupModal";
import LoadingState from "../../components/common/LoadingState";
import { Plus, FolderKanban, ListTodo, Flag, BarChart3, FileText } from "lucide-react";
import { Modal, Form, Input } from "antd";
import TaskModal from "../../components/common/kanban/TaskModal";
import useKanbanBoard from "../../hook/useKanbanBoard";
import { filterColumns } from "../../utils/kanbanUtils";
import TabSwitcher from "../../components/common/my-group/TabSwitcher";
import OverviewSection from "../../components/common/my-group/OverviewSection";
import MembersPanel from "../../components/common/my-group/MembersPanel";
import FilesPanel from "../../components/common/my-group/FilesPanel";
import GroupPostsTab from "../../components/common/my-group/GroupPostsTab";
import KanbanTab from "../../components/common/workspace/KanbanTab";
import BacklogTab from "../../components/common/workspace/BacklogTab";
import MilestonesTab from "../../components/common/workspace/MilestonesTab";
import ReportsTab from "../../components/common/workspace/ReportsTab";
import ListView from "../../components/common/workspace/ListView";
import { useGroupActivation } from "../../hook/useGroupActivation";
import { useGroupDetail } from "../../hook/useGroupDetail";
import { useGroupEditForm } from "../../hook/useGroupEditForm";

export default function MyGroup() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userInfo } = useAuth();

  const {
    group,
    setGroup,
    groupMembers,
    setGroupMembers,
    groupSkillsWithRole,
    groupFiles,
    loading,
    loadGroupFiles,
    fetchCompletionPercent,
    handleKickMember,
    handleAssignRole,
    handleTransferLeader,
  } = useGroupDetail({ groupId: id, t, userInfo });

  const [board, setBoard] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState("kanban");
  const [listFilterStatus, setListFilterStatus] = useState("All");

  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [columnForm] = Form.useForm();

  const {
    editOpen,
    setEditOpen,
    editForm,
    editErrors,
    editSubmitting,
    availableSkills,
    skillsLoading,
    handleEditChange,
    handleSubmitEdit,
  } = useGroupEditForm({ group, groupMembers, userInfo, t, setGroup });

  useEffect(() => {
    if (activeTab === "files") {
      loadGroupFiles();
    }
  }, [id, activeTab]);

  const handleAddMember = (user) => {
    setShowModal(false);
  };


  const {
    columns,
    filteredColumns,
    columnMeta,
    groupMembers: kanbanMembers,
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
    if (filteredColumns) {
      const boardData = {
        columns: Object.entries(filteredColumns).map(([columnId, tasks]) => ({
          id: columnId,
          tasks: tasks || [],
        })),
      };
      setBoard(boardData);

      fetchCompletionPercent();
    }
  }, [filteredColumns]);

  const normalizeTitle = (value = "") =>
    value.toLowerCase().replace(/\s+/g, "_");
  const tasks =
    board?.columns?.flatMap((col) => col.tasks || [])?.filter(Boolean) || [];
  const sortedColumns = useMemo(
    () =>
      Object.entries(columnMeta || {}).sort(
        (a, b) => (a[1]?.position || 0) - (b[1]?.position || 0)
      ),
    [columnMeta]
  );
  const firstColumnId = useMemo(
    () => sortedColumns?.[0]?.[0] || Object.keys(columnMeta || {})[0] || null,
    [sortedColumns, columnMeta]
  );
  const listFilteredColumns = useMemo(() => {
    const ids = Object.keys(columns || {});
    return filterColumns(columns || {}, "", listFilterStatus, "All", ids);
  }, [columns, listFilterStatus]);
  const flattenedTasks = useMemo(() => {
    return Object.entries(listFilteredColumns || {}).flatMap(
      ([colId, tasksInCol]) =>
        (tasksInCol || []).map((task) => ({
          ...task,
          columnId: colId,
          columnTitle: columnMeta?.[colId]?.title || colId,
        }))
    );
  }, [listFilteredColumns, columnMeta]);
  const statusOptions = useMemo(() => {
    const map = new Map();
    const addStatus = (raw) => {
      if (!raw) return;
      const key = normalizeTitle(raw);
      const canonical = key === "to_do" ? "todo" : key;
      if (!canonical) return;
      if (!map.has(canonical)) {
        map.set(canonical, canonical);
      }
    };
    Object.entries(columnMeta || {}).forEach(([colId, meta]) => {
      addStatus(meta?.title || colId);
    });
    Object.values(columns || {}).forEach((list) => {
      (list || []).forEach((task) => addStatus(task.status));
    });
    return Array.from(map.values());
  }, [columns, columnMeta]);

  const recentActivity = tasks
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0)
    )
    .slice(0, 4);

  const descriptionText = (group?.description || "").trim();
  const mentor = group?.mentor || null;

  const { canActivateGroup, handleActivateGroup } = useGroupActivation({
    group,
    groupMembers,
    t,
    id,
    setGroup,
  });

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "N/A";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const getFileExtension = (fileType) => {
    if (!fileType) return "";
    const parts = fileType.split("/");
    return parts.length > 1 ? parts[1].toUpperCase() : "";
  };

  const fileItems = (groupFiles || []).map((f, idx) => ({
    id: f.fileId || f.id || idx,
    name: f.fileName || f.name || `File ${idx + 1}`,
    description: f.description || f.fileName || f.name || `File ${idx + 1}`,
    owner: f.uploadedBy || f.owner || "Team",
    size: formatFileSize(f.fileSize || f.size),
    fileType: getFileExtension(f.fileType || f.type),
    url: f.fileUrl || f.downloadUrl || f.url || "#",
    date: f.createdAt ? new Date(f.createdAt) : null,
  }));

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
        assignee) ??
      "";
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

  // Contribution statistics
  const contributionStats = (() => {
    const total = tasks.length || 1;
    return groupMembers.map((m) => {
      const emailLower = (m.email || "").toLowerCase();
      const matches = tasks.filter((task) =>
        findAssignees(task).some((assignee) => {
          const rendered = renderAssignee(assignee);
          return (rendered.name || "").toLowerCase() === emailLower;
        })
      );
      const completed = matches.filter((task) => {
        const status = (task.status || "").toLowerCase();
        return status === "done" || status === "completed";
      }).length;

      const percent = Math.round((matches.length / total) * 100);

      return {
        ...m,
        taskCount: matches.length,
        completed,
        contribution: percent,
      };
    });
  })();

  const handleCreateColumn = () => {
    columnForm.validateFields().then((values) => {
      const payload = {
        columnName: values.columnName,
        position: Number(values.position) || 0,
      };
      createColumn(payload);
      setIsColumnModalOpen(false);
      columnForm.resetFields();
    });
  };

  const hasKanbanData =
    filteredColumns && Object.keys(filteredColumns).length > 0;

  const handleQuickCreateTask = () => {
    if (!firstColumnId) return;
    createTask({
      columnId: firstColumnId,
      title: "New Task",
      description: "",
      priority: "medium",
      status: normalizeTitle(columnMeta?.[firstColumnId]?.title || "todo"),
      dueDate: null,
    });
  };
  const formatStatusLabel = (value = "") =>
    value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  const handleMoveColumn = (columnId, columnMetaData = {}) => {
    let nextPosition = columnMetaData?.position ?? 0;
    Modal.confirm({
      title: t("moveColumn") || "Move column",
      content: (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {t("enterNewPosition") || "Enter new position (0 = first)."}
          </p>
          <input
            type="number"
            defaultValue={nextPosition}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            onChange={(e) => {
              nextPosition = Number(e.target.value) || 0;
            }}
          />
        </div>
      ),
      okText: t("ok") || "OK",
      cancelText: t("cancel") || "Cancel",
      onOk: async () => {
        try {
          await BoardService.updateColumn(id, columnId, {
            position: nextPosition,
          });
          refetchBoard({ showLoading: false });
        } catch (err) {

        }
      },
    });
  };

  if (loading) {
    return (
      <LoadingState
        message={t("loading") || "Loading..."}
        subtext={t("fetchingGroupData") || "Fetching your group workspace."}
      />
    );
  }

  return (
    <div className="relative bg-[#f7fafc]">
      <div className="relative z-10 min-h-screen flex flex-col items-center pt-4 xl:pt-8 pb-24">
        <div className="w-full flex flex-col gap-6">
          {group && (
            <InfoCard
              group={group}
              memberCount={groupMembers.length}
              onBack={() => navigate(-1)}
              onSelectTopic={
                group.canEdit ? () => navigate("/discover") : undefined
              }
              onEdit={group.canEdit ? () => setEditOpen(true) : null}
              onActivate={canActivateGroup ? handleActivateGroup : null}
            />
          )}

          <div className="mx-auto w-full max-w-7xl px-2 sm:px-8">
            <TabSwitcher
              activeTab={activeTab}
              onChange={setActiveTab}
              tabs={[
                { key: "overview", label: t("overview") || "Overview" },
                { key: "members", label: t("teamMembers") || "Members" },
                { key: "workspace", label: t("workspace") || "Workspace" },
                { key: "posts", label: t("posts") || "Posts" },
                { key: "files", label: t("files") || "Files" },
              ]}
            />

            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <OverviewSection
                  descriptionText={descriptionText}
                  recentActivity={recentActivity}
                  statusMeta={statusMeta}
                  findAssignees={findAssignees}
                  renderAssignee={renderAssignee}
                  groupSkills={groupSkillsWithRole}
                  t={t}
                />
                <MembersPanel
                  groupMembers={groupMembers}
                  mentor={mentor}
                  group={group}
                  onInvite={() => setShowModal(true)}
                  onAssignRole={handleAssignRole}
                  onKickMember={handleKickMember}
                  onTransferLeader={handleTransferLeader}
                  currentUserEmail={userInfo?.email}
                  t={t}
                  showStats={false}
                />
              </div>
            )}

            {/* MEMBERS */}
            {activeTab === "members" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                  <MembersPanel
                    groupMembers={groupMembers}
                    mentor={mentor}
                    group={group}
                    onInvite={() => setShowModal(true)}
                    onAssignRole={handleAssignRole}
                    onKickMember={handleKickMember}
                    onTransferLeader={handleTransferLeader}
                    currentUserEmail={userInfo?.email}
                    t={t}
                    showStats
                    contributionStats={contributionStats}
                    board={board}
                  />
                </div>
              </div>
            )}

            {/* WORKSPACE */}
            {activeTab === "workspace" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {t("workspace") || "Workspace"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t("workspaceIntro") ||
                        "Drag tasks across columns, assign owners, and keep momentum."}
                    </p>
                  </div>
                  {activeWorkspaceTab === "kanban" && (
                    <button
                      className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"
                      onClick={() => setIsColumnModalOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                      {t("newColumn") || "New Column"}
                    </button>
                  )}
                </div>

                {/* Sub-tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                  <button
                    onClick={() => setActiveWorkspaceTab("kanban")}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeWorkspaceTab === "kanban"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <FolderKanban className="w-4 h-4" />
                    {(t("kanban") || "Kanban").charAt(0).toUpperCase() +
                      (t("kanban") || "Kanban").slice(1)}
                  </button>
                  <button
                    onClick={() => setActiveWorkspaceTab("list")}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeWorkspaceTab === "list"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <ListTodo className="w-4 h-4" />
                    {(t("list") || "List").charAt(0).toUpperCase() +
                      (t("list") || "List").slice(1)}
                  </button>
                  <button
                    onClick={() => setActiveWorkspaceTab("backlog")}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeWorkspaceTab === "backlog"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <ListTodo className="w-4 h-4" />
                    {(t("backlog") || "Backlog").charAt(0).toUpperCase() +
                      (t("backlog") || "Backlog").slice(1)}
                  </button>
                  <button
                    onClick={() => setActiveWorkspaceTab("milestones")}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeWorkspaceTab === "milestones"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Flag className="w-4 h-4" />
                    {(t("milestones") || "Milestones").charAt(0).toUpperCase() +
                      (t("milestones") || "Milestones").slice(1)}
                  </button>
                  <button
                    onClick={() => setActiveWorkspaceTab("reports")}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeWorkspaceTab === "reports"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    {(t("reports") || "Reports").charAt(0).toUpperCase() +
                      (t("reports") || "Reports").slice(1)}
                  </button>
                </div>

                {/* KANBAN SUB-TAB */}
                  {activeWorkspaceTab === "kanban" && (
                    <KanbanTab
                      kanbanLoading={kanbanLoading}
                      kanbanError={kanbanError}
                      hasKanbanData={hasKanbanData}
                      filteredColumns={filteredColumns}
                    columnMeta={columnMeta}
                    setSelectedTask={setSelectedTask}
                    createTask={createTask}
                    deleteColumn={deleteColumn}
                    moveColumn={handleMoveColumn}
                    handleDragOver={handleDragOver}
                    handleDragEnd={handleDragEnd}
                    isColumnModalOpen={isColumnModalOpen}
                    setIsColumnModalOpen={setIsColumnModalOpen}
                      handleCreateColumn={handleCreateColumn}
                      t={t}
                      normalizeTitle={normalizeTitle}
                    />
                  )}

                  {activeWorkspaceTab === "list" && (
                    <div className="mt-2 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="text-sm text-gray-600">
                          {t("status") || "Status"}
                        </label>
                        <select
                          value={listFilterStatus}
                          onChange={(e) => setListFilterStatus(e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
                        >
                          <option value="All">
                            {t("allStatuses") || "All statuses"}
                          </option>
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {formatStatusLabel(status)}
                            </option>
                          ))}
                        </select>
                        <div className="text-sm text-gray-500">
                          {flattenedTasks.length} tasks
                        </div>
                      </div>
                      <ListView
                        tasks={flattenedTasks}
                        columnMeta={columnMeta}
                        onOpenTask={setSelectedTask}
                        onCreateTask={handleQuickCreateTask}
                        t={t}
                      />
                    </div>
                  )}

                {/* BACKLOG SUB-TAB */}
                {activeWorkspaceTab === "backlog" && (
                  <BacklogTab
                    groupId={id}
                    columnMeta={columnMeta}
                    groupMembers={groupMembers}
                    onPromoteSuccess={() =>
                      refetchBoard({ showLoading: false })
                    }
                  />
                )}

                {/* MILESTONES SUB-TAB */}
                {activeWorkspaceTab === "milestones" && (
                  <MilestonesTab groupId={id} />
                )}

                {/* REPORTS SUB-TAB */}
                {activeWorkspaceTab === "reports" && (
                  <ReportsTab groupId={id} />
                )}
              </div>
            )}

            {/* FILES */}
            {activeTab === "files" && (
              <FilesPanel
                fileItems={fileItems}
                t={t}
                groupId={id}
                onUploadSuccess={loadGroupFiles}
              />
            )}

            {/* POSTS */}
            {activeTab === "posts" && (
              <GroupPostsTab groupId={id} groupData={group} />
            )}
          </div>
        </div>
      </div>

      {/* ---------------------
           MODALS
      ---------------------- */}
      <AddMemberModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAddMember}
        t={t}
      />

      <EditGroupModal
        open={editOpen}
        submitting={editSubmitting}
        form={editForm}
        errors={editErrors}
        memberCount={groupMembers.length}
        skills={availableSkills}
        skillsLoading={skillsLoading}
        onChange={handleEditChange}
        onSubmit={handleSubmitEdit}
        onClose={() => setEditOpen(false)}
        t={t}
      />

      <TaskModal
        task={selectedTask}
        groupId={id}
        columnMeta={columnMeta}
        members={kanbanMembers}
        groupDetail={group}
        onUpdateTask={updateTaskFields}
        onUpdateAssignees={updateTaskAssignees}
        onDeleteTask={deleteTask}
        onFetchComments={loadTaskComments}
        onAddComment={addTaskComment}
        onUpdateComment={updateTaskComment}
        onDeleteComment={deleteTaskComment}
        onClose={() => setSelectedTask(null)}
      />

      {/* New Column Modal */}
      <Modal
        title={t("newColumn") || "New Column"}
        open={isColumnModalOpen}
        onOk={handleCreateColumn}
        onCancel={() => {
          setIsColumnModalOpen(false);
          columnForm.resetFields();
        }}
        okText={t("create") || "Create"}
        cancelText={t("cancel") || "Cancel"}
      >
        <Form form={columnForm} layout="vertical">
          <Form.Item
            name="columnName"
            label={t("columnName") || "Column Name"}
            rules={[
              {
                required: true,
                message:
                  t("pleaseEnterColumnName") || "Please enter column name",
              },
            ]}
          >
            <Input placeholder={t("enterColumnName") || "Enter column name"} />
          </Form.Item>
          <Form.Item
            name="position"
            label={t("position") || "Position"}
            initialValue={0}
          >
            <Input type="number" placeholder="0" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
