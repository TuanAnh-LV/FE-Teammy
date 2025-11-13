// src/components/kanban/TaskCard.jsx
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Clock3, MessageSquare } from "lucide-react";
import { tagStyles, priorityStyles, initials } from "../../../utils/kanbanHelpers";

const TaskCard = ({ task, onOpen }) => {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition"
      onClick={() => onOpen(task)}
    >
      <div className="flex items-start justify-between gap-4">
        <h4 className="font-semibold text-gray-900 leading-snug">
          {task.title}
        </h4>
        <span
          className={`text-xs px-2 py-1 rounded-full ${priorityStyles[task.priority]}`}
        >
          {task.priority}
        </span>
      </div>

      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
        {task.description}
      </p>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {task.tags.map((t) => (
          <span
            key={t}
            className={`text-xs px-2 py-1 rounded-full ${tagStyles[t]}`}
          >
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{task.due}</span>
          <Clock3 className="w-4 h-4 ml-2" />
          <span>{task.points}pts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {task.assignees.slice(0, 3).map((a) => (
              <div
                key={a}
                className="w-6 h-6 rounded-full bg-gray-800 text-white text-[10px] flex items-center justify-center ring-2 ring-white"
                title={a}
              >
                {initials(a)}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-[10px] flex items-center justify-center ring-2 ring-white">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
          <div className="flex items-center text-gray-600 text-xs ml-2">
            <MessageSquare className="w-4 h-4 mr-1" />
            {task.comments.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
