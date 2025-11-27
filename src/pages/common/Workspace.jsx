// src/pages/Workspace.jsx
import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { Modal, Input, Form } from "antd";

import Column from "../../components/common/kanban/Column";
import TaskModal from "../../components/common/kanban/TaskModal";
import useKanbanBoard from "../../hook/useKanbanBoard";
import { useTranslation } from "../../hook/useTranslation";
import { useLocation, useParams } from "react-router-dom";
import { GroupService } from "../../services/group.service";

const Workspace = () => {
  const { id: routeGroupId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryGroupId = searchParams.get("groupId");
  const storedGroupId =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("last_group_id") || ""
      : "";
  const [resolvedGroupId, setResolvedGroupId] = useState(
    queryGroupId || routeGroupId || storedGroupId
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  const [activeTab, setActiveTab] = useState("overview");

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
    loading,
    error,
    refetchBoard,
    loadTaskComments,
    addTaskComment,
    updateTaskComment,
    deleteTaskComment,
  } = useKanbanBoard(resolvedGroupId);
  const { t } = useTranslation();

  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [columnForm] = Form.useForm();

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

  // Fallback: if groupId missing, pick the first of my groups
  useEffect(() => {
    if (resolvedGroupId) {
      localStorage.setItem("last_group_id", resolvedGroupId);
      return;
    }
    const fetchDefaultGroup = async () => {
      try {
        const res = await GroupService.getMyGroups();
        const list = res?.data || [];
        if (list.length > 0) {
          const fallback = list[0].id || list[0]._id || "";
          setResolvedGroupId(fallback);
          localStorage.setItem("last_group_id", fallback);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDefaultGroup();
  }, [resolvedGroupId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-500">Loading board...</span>
      </div>
    );
  }

  if (error || !filteredColumns) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-red-500">{error || "Something went wrong"}</span>
      </div>
    );
  }

  const hasData = filteredColumns && Object.keys(filteredColumns).length > 0;
  const normalizeTitle = (value = "") =>
    value.toLowerCase().replace(/\s+/g, "_");
  const flattenedTasks = Object.values(filteredColumns || {}).flat();
  const recentActivity = flattenedTasks
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0)
    )
    .slice(0, 4);
  const mentor =
    groupMembers?.find(
      (member) =>
        (member.role || "").toLowerCase().includes("mentor") ||
        (member.position || "").toLowerCase().includes("mentor")
    ) || null;
  const fallbackFiles = [
    { name: "Project brief.pdf", owner: "Team", size: "1.2 MB" },
    { name: "Requirements.docx", owner: "Leader", size: "650 KB" },
    { name: "Architecture.drawio", owner: "Team", size: "430 KB" },
  ];

  return (
    <div className="relative">
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-between pt-28 xl:pt-20 pb-20 bg-[#f7f9fb]">
        <div className="w-full max-w-7xl px-6">
          {/* Tabs */}
          <div className="inline-flex gap-0 bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
            {["overview", "workspace", "files"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-sm font-semibold capitalize transition border-r last:border-r-0 ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-sm border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Align the team on goals, milestones, and deliverables. Use
                    this space to document the project scope, acceptance
                    criteria, and communication rules so every member knows what
                    success looks like.
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Activity
                    </h3>
                    <span className="text-sm text-gray-400">
                      {recentActivity.length}{" "}
                      {recentActivity.length === 1 ? "update" : "updates"}
                    </span>
                  </div>
                  {recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {task.title || "Untitled task"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {task.status || "updated"} -{" "}
                              {new Date(
                                task.updatedAt || task.createdAt || Date.now()
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                            {task.priority || "medium"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No activity yet. Start by creating a task.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Team Members
                    </h3>
                    <span className="text-sm text-gray-400">
                      {groupMembers?.length || 0}{" "}
                      {groupMembers?.length === 1 ? "person" : "people"}
                    </span>
                  </div>
                  {groupMembers?.length ? (
                    <div className="space-y-3">
                      {groupMembers.map((member) => (
                        <div
                          key={member.id || member._id || member.email}
                          className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center font-semibold">
                            {(member.name || member.displayName || "U")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {member.name || member.displayName || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {member.role || "Member"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Invite teammates to collaborate on this workspace.
                    </p>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Mentor
                  </h3>
                  {mentor ? (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold">
                        {(mentor.name || mentor.displayName || "M")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {mentor.name || mentor.displayName}
                        </p>
                        <p className="text-sm text-gray-500">Assigned mentor</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No mentor assigned. Add a mentor to keep guidance aligned.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Workspace (Kanban) */}
          {activeTab === "workspace" && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Kanban Board
                </h3>
                <button
                  className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"
                  onClick={() => setIsColumnModalOpen(true)}
                >
                  <Plus className="w-5 h-5" />
                  New Column
                </button>
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                {hasData ? (
                  <div className="mt-4 flex gap-6 overflow-x-auto pb-2">
                    {Object.entries(columnMeta)
                      .sort(
                        (a, b) => (a[1]?.position || 0) - (b[1]?.position || 0)
                      )
                      .map(([colId, meta]) => {
                        const normalizedTitleValue = normalizeTitle(
                          meta?.title || colId
                        );
                        const statusForColumn =
                          normalizedTitleValue === "to_do"
                            ? "todo"
                            : normalizedTitleValue;
                        const allowQuickCreate = statusForColumn === "todo";
                        return (
                          <Column
                            key={colId}
                            id={colId}
                            meta={meta}
                            tasks={filteredColumns[colId] || []}
                            columnMeta={columnMeta}
                            onOpen={setSelectedTask}
                            onCreate={
                              allowQuickCreate
                                ? (quickPayload) => {
                                    createTask({
                                      columnId: colId,
                                      title: quickPayload?.title || "New Task",
                                      description: "",
                                      priority: "medium",
                                      status: statusForColumn,
                                      dueDate: null,
                                    });
                                  }
                                : undefined
                            }
                            onDelete={() => {
                              Modal.confirm({
                                title: "Delete Column",
                                content: `Delete column "${
                                  columnMeta[colId]?.title || colId
                                }"?`,
                                okText: "OK",
                                cancelText: "Cancel",
                                onOk: () => deleteColumn(colId),
                              });
                            }}
                          />
                        );
                      })}
                  </div>
                ) : (
                  <div className="mt-10 text-gray-500">
                    No board data available.
                  </div>
                )}
              </DndContext>
            </>
          )}

          {/* Files */}
          {activeTab === "files" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Team Files
                  </h3>
                  <p className="text-sm text-gray-500">
                    Quick access to shared documents and assets.
                  </p>
                </div>
                <button className="text-blue-600 text-sm font-medium hover:underline">
                  Upload
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {fallbackFiles.map((file) => (
                  <div
                    key={file.name}
                    className="border border-gray-100 rounded-xl p-4 bg-gray-50"
                  >
                    <p className="font-semibold text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {file.owner} - {file.size}
                    </p>
                    <button className="text-xs text-blue-600 mt-3 hover:underline">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        task={selectedTask}
        groupId={resolvedGroupId}
        members={groupMembers}
        columnMeta={columnMeta}
        onFetchComments={loadTaskComments}
        onClose={() => setSelectedTask(null)}
        onAddComment={addTaskComment}
        onUpdateComment={updateTaskComment}
        onDeleteComment={deleteTaskComment}
        onUpdateTask={updateTaskFields}
        onUpdateAssignees={updateTaskAssignees}
        onDeleteTask={(taskId) => {
          deleteTask(taskId);
          setSelectedTask(null);
        }}
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
        destroyOnClose
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
};

export default Workspace;





