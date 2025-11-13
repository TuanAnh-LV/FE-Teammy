// src/pages/Workspace.jsx
import React from "react";
import { notification } from "antd";
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

const Workspace = () => {
  const sensors = useSensors(useSensor(PointerSensor));

  const {
    filteredColumns,
    selectedTask,
    setSelectedTask,
    search,
    setSearch,
    filterTag,
    setFilterTag,
    handleDragOver,
    handleDragEnd,
    handleAddComment,
    loading,
    error,
  } = useKanbanBoard();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-500">Đang tải board...</span>
      </div>
    );
  }

  if (error || !filteredColumns) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-red-500">{error || "Có lỗi xảy ra"}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start pt-28 xl:pt-40 pb-20">
        {/* Title */}
        <div className="!max-w-[1600px] !mx-auto !ml-48 !mb-8">
          <h1 className="!text-4xl !font-extrabold !text-[#1a1a1a] !mb-2">
            AI Healthcare Team
          </h1>
          <p className="!text-gray-500 !text-lg">
            Shared workspace for teams — manage tasks, share documents and track
            progress.
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
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-black" />
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option>All</option>
                  <option>Frontend</option>
                  <option>Backend</option>
                  <option>Design</option>
                  <option>Bug</option>
                </select>
              </div>
              <button
                className="ml-auto flex items-center gap-2 !bg-[#4264d7] !text-white px-4 py-2 rounded-lg text-sm hover:bg-black"
                onClick={() =>
                  notification.info({
                    message:
                      "Tuỳ bạn: mở modal tạo task mới (title, tag, priority, assignees...)",
                  })
                }
              >
                <Plus className="w-6 h-6 rounded-[12px]" />
                New Task
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
          <div className="mt-8 flex gap-6 overflow-x-auto max-w-8xl mx-auto px-6 pb-2">
            <Column
              id="todo"
              title="To Do"
              tasks={filteredColumns.todo}
              onOpen={setSelectedTask}
            />
            <Column
              id="inprogress"
              title="In Progress"
              tasks={filteredColumns.inprogress}
              onOpen={setSelectedTask}
            />
            <Column
              id="review"
              title="Review"
              tasks={filteredColumns.review}
              onOpen={setSelectedTask}
            />
            <Column
              id="done"
              title="Done"
              tasks={filteredColumns.done}
              onOpen={setSelectedTask}
            />
          </div>
        </DndContext>
      </div>

      {/* Task Modal */}
      <TaskModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onAddComment={handleAddComment}
      />
    </div>
  );
};

export default Workspace;
