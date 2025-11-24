// src/components/kanban/Column.jsx
import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";

const Column = ({ id, meta, tasks, onOpen, onCreate, onDelete, columnMeta = {} }) => {
  const [showQuickTask, setShowQuickTask] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");
  const { setNodeRef, isOver } = useDroppable({ id });
  const title = meta?.title || "Column";
  const dueLabel = meta?.dueDate
    ? new Date(meta.dueDate).toLocaleDateString()
    : null;

  return (
    <div
      ref={setNodeRef}
      className={`w-80 md:w-96 min-h-[560px] rounded-2xl p-5
      ${isOver ? "bg-[#EEF2FF] border-indigo-200" : "bg-[#F7F8FA] border-gray-200"}
      transition`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col">
          <h3 className="font-bold text-gray-800">{title}</h3>
          {dueLabel && (
            <span className="text-xs text-gray-500">Due: {dueLabel}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{tasks.length}</span>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="text-xs text-red-500 hover:text-red-700 "
              title="Delete column"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onOpen={onOpen} columnMeta={columnMeta} />
        ))}
      </SortableContext>

      {onCreate && (
        <div className="mt-3">
          {showQuickTask ? (
            <div className="border border-gray-300 rounded-lg p-3 space-y-2 bg-white">
              <input
                autoFocus
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
              <div className="flex gap-2">
                <button
                  className="flex-1 bg-blue-600 text-white text-sm py-1 rounded-lg"
                  onClick={() => {
                    if (!quickTitle.trim()) return;
                    onCreate({
                      title: quickTitle.trim(),
                      priority: "medium",
                    });
                    setQuickTitle("");
                    setShowQuickTask(false);
                  }}
                >
                  Add
                </button>
                <button
                  className="flex-1 border border-gray-300 text-gray-600 text-sm py-1 rounded-lg"
                  onClick={() => {
                    setShowQuickTask(false);
                    setQuickTitle("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowQuickTask(true)}
              className="w-full rounded-lg border border-dashed border-gray-300 py-2 text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 transition"
            >
              + Create
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Column;
