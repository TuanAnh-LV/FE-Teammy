// src/components/common/kanban/Column.jsx
import React, { useEffect, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MoreVertical } from "lucide-react";
import TaskCard from "./TaskCard";
import { useTranslation } from "../../../hook/useTranslation";

const Column = ({
  id,
  meta,
  tasks,
  onOpen,
  onCreate,
  onDelete,
  onMoveColumn,
  columnMeta = {},
}) => {
  const { t } = useTranslation();
  const [showQuickTask, setShowQuickTask] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { setNodeRef, isOver } = useDroppable({ id });
  const title = meta?.title || "Column";
  const dueLabel = meta?.dueDate
    ? new Date(meta.dueDate).toLocaleDateString()
    : null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={setNodeRef}
      className={`w-76 md:w-[23.2rem] min-h-[560px] rounded-2xl p-4
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
        <div className="flex items-center gap-2" ref={menuRef}>
          <span className="text-xs text-gray-500">{tasks.length}</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1 rounded-md hover:bg-gray-200 text-gray-700"
              aria-label="Column actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setShowQuickTask(true);
                  }}
                  disabled={!onCreate}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {t("createTask") || "Create Task"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (onMoveColumn) onMoveColumn(id, meta);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {t("moveColumn") || "Move Column"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (onDelete) onDelete();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  {t?.("deleteColumn") || "Delete Column"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpen={onOpen}
              columnMeta={columnMeta}
            />
          ))}
        </SortableContext>
      </div>

      {onCreate && showQuickTask && (
        <div className="mt-3">
          <div className="border border-gray-300 rounded-lg p-3 space-y-2 bg-white">
            <input
              autoFocus
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder={t("whatNeedsToBeDone") || "What needs to be done?"}
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
        </div>
      )}
    </div>
  );
};

export default Column;
