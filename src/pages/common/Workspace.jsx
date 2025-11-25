// src/pages/Workspace.jsx
import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Search, Filter, Plus } from "lucide-react";
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

  const {
    filteredColumns,
    columnMeta,
    groupMembers,
    selectedTask,
    setSelectedTask,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
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

  return (
    <div className="relative">
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-between pt-20 md:pt-28 xl:pt-20 pb-12 md:pb-20">
        {/* Title */}
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-[#1a1a1a] mb-2">
            Team Workspace
          </h1>
          <p className="text-sm md:text-base text-gray-400 text-muted-foreground">
            Manage tasks, share documents and track progress.
          </p>
        </div>

        {/* Toolbar */}
        <div className="mt-6 md:mt-10 w-full max-w-7xl px-4 sm:px-6">
          <div className="">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-1 w-full">
                <div className="flex items-center border border-gray-400 rounded-xl w-full px-3 md:px-4 py-2.5 md:py-3">
                  <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-500 mr-2 md:mr-3 shrink-0" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={
                      t("searchTasksPlaceholder") ||
                      "Search tasks by title or description..."
                    }
                    className="bg-transparent outline-none w-full text-gray-700 text-sm md:text-[16px]"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-3 h-3 md:w-4 md:h-4 text-black" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm"
                  >
                    <option value="All">
                      {t("allStatus") || "All status"}
                    </option>
                    <option value="todo">{t("toDo") || "To do"}</option>
                    <option value="in_progress">
                      {t("inProgress") || "In progress"}
                    </option>
                    <option value="review">{t("review") || "Review"}</option>
                    <option value="blocked">{t("blocked") || "Blocked"}</option>
                    <option value="done">{t("done") || "Done"}</option>
                  </select>
                </div>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm"
                >
                  <option value="All">
                    {t("allPriority") || "All priority"}
                  </option>
                  <option value="high">{t("high") || "High"}</option>
                  <option value="medium">{t("medium") || "Medium"}</option>
                  <option value="low">{t("low") || "Low"}</option>
                </select>
                <button
                  className="flex items-center gap-1 md:gap-2 border border-gray-300 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm hover:bg-gray-50 whitespace-nowrap"
                  onClick={() => setIsColumnModalOpen(true)}
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">
                    {t("newColumn") || "New Column"}
                  </span>
                  <span className="sm:hidden">Column</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {hasData ? (
            <div className="mt-6 md:mt-8 flex gap-4 md:gap-6 overflow-x-auto max-w-7xl mx-auto px-4 sm:px-6 pb-2">
              {Object.entries(columnMeta)
                .sort((a, b) => (a[1]?.position || 0) - (b[1]?.position || 0))
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
            <div className="mt-10 text-gray-500">No board data available.</div>
          )}
        </DndContext>
      </div>

      {/* Task Modal */}
      <TaskModal
        task={selectedTask}
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
