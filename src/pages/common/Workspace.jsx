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

import Column from "../../components/common/kanban/Column";
import TaskModal from "../../components/common/kanban/TaskModal";
import useKanbanBoard from "../../hook/useKanbanBoard";
import { useLocation, useParams } from "react-router-dom";
import { GroupService } from "../../services/group.service";

const Workspace = () => {
  const { id: routeGroupId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryGroupId = searchParams.get("groupId");
  const storedGroupId = typeof localStorage !== "undefined" ? localStorage.getItem("last_group_id") || "" : "";
  const [resolvedGroupId, setResolvedGroupId] = useState(queryGroupId || routeGroupId || storedGroupId);
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
  const normalizeTitle = (value = "") => value.toLowerCase().replace(/\s+/g, "_");

  return (
    <div className="relative">
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start pt-28 xl:pt-40 pb-20">
        {/* Title */}
        <div className="mx-auto ml-48 mb-8">
          <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-2">
            Team Workspace
          </h1>
          <p className="!text-gray-500 !text-lg">
            Manage tasks, share documents and track progress.
          </p>
        </div>

        {/* Toolbar */}
        <div className="mt-10 w-full max-w-7xl px-6">
          <div className="backdrop-blur border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="flex items-center gap-2 flex-1 w-full">
                <div className="flex items-center bg-[#F5F5F5] rounded-xl w-full px-5 py-4 shadow-sm hover:shadow-md transition">
                  <Search className="w-5 h-5 text-gray-500 mr-3" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tasks by title or description..."
                    className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-500 text-[16px]"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-black" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="All">All status</option>
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="review">Review</option>
                    <option value="blocked">Blocked</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="All">All priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <button
                className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"
                onClick={() => {
                  const name = window.prompt("Column name?");
                  if (!name) return;
                  const positionInput = window.prompt("Position?", "1");
                  const position = Number(positionInput) || 0;
                  const payload = { columnName: name, position };
                  createColumn(payload);
                }}
              >
                <Plus className="w-5 h-5" />
                New Column
              </button>
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
            <div className="mt-8 flex gap-6 overflow-x-auto max-w-8xl mx-auto px-6 pb-2">
              {Object.entries(columnMeta)
                .sort((a, b) => (a[1]?.position || 0) - (b[1]?.position || 0))
                .map(([colId, meta]) => {
                  const normalizedTitleValue = normalizeTitle(meta?.title || colId);
                  const statusForColumn =
                    normalizedTitleValue === "to_do" ? "todo" : normalizedTitleValue;
                  const allowQuickCreate = statusForColumn === "todo";
                  return (
                    <Column
                      key={colId}
                      id={colId}
                      meta={meta}
                      tasks={filteredColumns[colId] || []}
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
                        const confirmDelete = window.confirm(
                          `Delete column "${columnMeta[colId]?.title || colId}"?`
                        );
                        if (confirmDelete) deleteColumn(colId);
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
    </div>
  );
};

export default Workspace;
