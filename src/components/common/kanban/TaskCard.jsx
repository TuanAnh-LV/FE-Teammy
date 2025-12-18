// src/components/kanban/TaskCard.jsx
import React, { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, MessageSquare, MoreVertical } from "lucide-react";
import { priorityStyles, initials } from "../../../utils/kanbanHelpers";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const getAssigneeId = (assignee) => {
  if (!assignee) return "";
  if (typeof assignee === "string") return assignee;
  return assignee.id || assignee.userId || assignee.email || "";
};

const getAssigneeLabel = (assignee) => {
  if (!assignee) return "";
  if (typeof assignee === "string") return assignee;
  return (
    assignee.name ||
    assignee.displayName ||
    assignee.fullName ||
    assignee.email ||
    assignee.id ||
    ""
  );
};

const getAssigneeAvatar = (assignee) => {
  if (!assignee) return "";
  if (typeof assignee === "string") return "";
  return (
    assignee.avatarUrl ||
    assignee.avatarURL ||
    assignee.photoUrl ||
    assignee.photoURL ||
    assignee.user?.avatarUrl ||
    assignee.user?.avatarURL ||
    ""
  );
};

const TaskCard = ({ task, onOpen, onDeleteTask, columnMeta = {} }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const priorityClass = priorityStyles[task.priority] || "bg-gray-100 text-gray-700";

  const dueLabel = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString()
    : "--";
  const commentsCount = Array.isArray(task.comments) ? task.comments.length : 0;

  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef(null);

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
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition"
      onClick={(e) => {
        // Don't open task detail if delete modal is open
        if (!showDeleteModal) {
          onOpen(task);
        }
      }}
    >
      {/* Top row: priority + kebab menu */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${priorityClass}`}
        >
          {task.priority || "medium"}
        </span>
        {onDeleteTask && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
              aria-label="Task actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 rounded-md border border-gray-200 bg-white shadow-lg z-20">
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    setShowDeleteModal(true);
                  }}
                >
                  Delete task
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <h4 className="font-semibold text-gray-900 leading-snug line-clamp-2">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{dueLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {(task.assignees || []).slice(0, 3).map((assignee, index) => {
              const label = getAssigneeLabel(assignee) || "Unassigned";
              const key = getAssigneeId(assignee) || `${label}-${index}`;
              const avatarUrl = getAssigneeAvatar(assignee);
              return (
                <div
                  key={key}
                  className="w-6 h-6 rounded-full bg-gray-800 text-white text-[10px] flex items-center justify-center ring-2 ring-white overflow-hidden"
                  title={label}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={label}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials(label || "U")
                  )}
                </div>
              );
            })}
            {(task.assignees || []).length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-[10px] flex items-center justify-center ring-2 ring-white">
                +{(task.assignees || []).length - 3}
              </div>
            )}
          </div>
          <div className="flex items-center text-gray-600 text-xs ml-2">
            <MessageSquare className="w-4 h-4 mr-1" />
            {commentsCount}
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          if (onDeleteTask) onDeleteTask(task.id);
        }}
        title="Delete Task"
        message={`Are you sure you want to delete the task "${task.title}"? This action cannot be undone.`}
        type="task"
      />
    </div>
  );
};

export default TaskCard;
