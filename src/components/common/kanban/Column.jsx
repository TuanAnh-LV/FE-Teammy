// src/components/common/kanban/Column.jsx
import React, { useEffect, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MoreVertical, Plus, Calendar, User } from "lucide-react";
import TaskCard from "./TaskCard";
import { useTranslation } from "../../../hook/useTranslation";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const Column = ({
  id,
  meta,
  tasks,
  onOpen,
  onCreate,
  onDelete,
  onMoveColumn,
  onMoveColumnLeft,
  onMoveColumnRight,
  columnMeta = {},
  onDeleteTask,
  members = [],
}) => {
  const { t } = useTranslation();
  const [showQuickTask, setShowQuickTask] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickDueDate, setQuickDueDate] = useState("");
  const [quickAssigneeId, setQuickAssigneeId] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef(null);
  const { setNodeRef, isOver } = useDroppable({ id });
  const title = meta?.title || "Column";
  const dueLabel = meta?.dueDate
    ? new Date(meta.dueDate).toLocaleDateString()
    : null;

  const getColorClasses = () => {
    const key = (title || "").toString().toLowerCase();

    if (meta?.isDone || key.includes("done") || key.includes("complete")) {
      return "bg-emerald-50 border-emerald-100";
    }

    if (key.includes("progress")) {
      return "bg-blue-50 border-blue-100";
    }

    if (key.includes("pending") || key.includes("review")) {
      return "bg-amber-50 border-amber-100";
    }

    if (key.includes("backlog")) {
      return "bg-violet-50 border-violet-100";
    }

    // Default / To do / New
    return "bg-slate-50 border-slate-200";
  };

  const baseColorClasses = getColorClasses();
  const hoverRing = isOver ? "ring-2 ring-indigo-300" : "";

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
      className={`w-76 md:w-[23.2rem] min-h-[560px] rounded-2xl p-4 border ${baseColorClasses} ${hoverRing} transition`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <span className="text-xs text-gray-400">{tasks.length}</span>
          </div>
          {dueLabel && (
            <span className="text-xs text-gray-500">Due: {dueLabel}</span>
          )}
        </div>
        <div className="flex items-center gap-1" ref={menuRef}>
          {onCreate && (
            <button
              type="button"
              onClick={() => setShowQuickTask(true)}
              className="p-1.5 rounded-md text-gray-500 hover:bg-white/80 hover:text-gray-900"
              aria-label="Create task"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-md text-gray-500 hover:bg-white/80 hover:text-gray-900"
              aria-label="Column actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {/* Tính toán có thể di chuyển trái/phải */}
                {(() => {
                  const sortedColumns = Object.entries(columnMeta || {})
                    .map(([colId, colMeta]) => ({
                      id: colId,
                      position: colMeta?.position ?? 0,
                    }))
                    .sort((a, b) => a.position - b.position);
                  
                  const currentIndex = sortedColumns.findIndex((col) => col.id === id);
                  const canMoveLeft = currentIndex > 0;
                  const canMoveRight = currentIndex >= 0 && currentIndex < sortedColumns.length - 1;

                  return (
                    <>
                      {canMoveLeft && onMoveColumnLeft && (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            onMoveColumnLeft();
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          ← {t("moveToLeft") || "Move to Left"}
                        </button>
                      )}
                      {canMoveRight && onMoveColumnRight && (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            onMoveColumnRight();
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {t("moveToRight") || "Move to Right"} →
                        </button>
                      )}
                      {onMoveColumn && (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            onMoveColumn(id, meta);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {t("moveColumn") || "Move Column"}
                        </button>
                      )}
                      <div className="border-t border-gray-200 my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setShowDeleteModal(true);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        {t?.("deleteColumn") || "Delete Column"}
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {onCreate && showQuickTask && (
        <div className="mb-3">
          <div className="border border-gray-300 rounded-lg p-3 space-y-3 bg-white">
            <input
              autoFocus
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder={t("whatNeedsToBeDone") || "What needs to be done?"}
              className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />

            <div className="flex items-center gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-2 flex-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={quickDueDate}
                  onChange={(e) => setQuickDueDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="flex items-center gap-2 flex-1">
                <User className="w-4 h-4 text-gray-400" />
                <select
                  value={quickAssigneeId}
                  onChange={(e) => setQuickAssigneeId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                >
                  <option value="">
                    {t("unassigned") || "Unassigned"}
                  </option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.email || m.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 bg-blue-600 text-white text-sm py-1 rounded-lg"
                onClick={() => {
                  if (!quickTitle.trim()) return;
                  const payload = {
                    title: quickTitle.trim(),
                    priority: "medium",
                  };
                  if (quickDueDate) {
                    payload.dueDate = quickDueDate;
                  }
                  if (quickAssigneeId) {
                    // Tìm member object đầy đủ từ members array
                    const selectedMember = members.find((m) => m.id === quickAssigneeId);
                    if (selectedMember) {
                      // Gửi object đầy đủ với id, name, email, avatarUrl
                      payload.assignees = [selectedMember];
                    } else {
                      // Fallback: nếu không tìm thấy, gửi ID
                      payload.assignees = [quickAssigneeId];
                    }
                  }
                  onCreate(payload);
                  setQuickTitle("");
                  setQuickDueDate("");
                  setQuickAssigneeId("");
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
                  setQuickDueDate("");
                  setQuickAssigneeId("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
              onDeleteTask={onDeleteTask}
            />
          ))}
        </SortableContext>
      </div>

      <ConfirmDeleteModal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          if (onDelete) onDelete();
        }}
        title={t("deleteColumn") || "Delete Column"}
        message={`Are you sure you want to delete the column "${title}"? This will also delete all tasks in this column. This action cannot be undone.`}
        type="column"
      />
    </div>
  );
};

export default Column;
