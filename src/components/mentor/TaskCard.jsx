// src/components/mentor/TaskCard.jsx
import React from "react";
import { Progress, Avatar, Tooltip, Tag } from "antd";
import {
  FileTextOutlined,
  CalendarOutlined,
  MessageOutlined,
  PaperClipOutlined,
  EditOutlined,
} from "@ant-design/icons";

/**
 * TaskCard
 * Props:
 *  - task: {
 *      id, title, tag, startDate, endDate, progress,
 *      members: [{ name, avatar }], comments, attachments
 *    }
 *  - onClick?: (task) => void
 *  - onEdit?: (task) => void
 *  - compact?: boolean  // true: thu gọn padding
 */
export default function TaskCard({ task, onClick, onEdit, compact = false }) {
  if (!task) return null;

  const format = (d) =>
    d ? new Date(d).toLocaleString("vi-VN", { hour12: false }) : "--";

  const tagColor =
    task.tag === "BE"
      ? {
          bg: "bg-emerald-50",
          text: "text-emerald-600",
          border: "border-emerald-100",
        }
      : task.tag === "FE"
      ? { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" }
      : {
          bg: "bg-amber-50",
          text: "text-amber-600",
          border: "border-amber-100",
        };

  return (
    <div
      role="button"
      onClick={() => onClick && onClick(task)}
      className={`group relative select-none bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all ${
        compact ? "p-3" : "p-4"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileTextOutlined className="text-gray-500 shrink-0" />
          <h4 className="font-semibold text-gray-800 text-sm leading-5 truncate">
            {task.title}
          </h4>
        </div>

        <div
          className={`shrink-0 px-2 py-0.5 text-xs font-semibold rounded-md border ${tagColor.bg} ${tagColor.text} ${tagColor.border}`}
        >
          {task.tag || "TASK"}
        </div>
      </div>

      {/* Dates */}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-gray-600">
        <span className="flex items-center gap-1">
          <CalendarOutlined className="text-blue-400" />
          {format(task.startDate)}
        </span>
        <span className="flex items-center gap-1">
          <CalendarOutlined className="text-blue-400" />
          {format(task.endDate)}
        </span>
      </div>

      {/* Progress */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Tiến độ</span>
          <span className="font-semibold text-gray-700">
            {task.progress ?? 0}%
          </span>
        </div>
        <Progress
          percent={Number(task.progress) || 0}
          size="small"
          strokeColor="#43D08A"
          trailColor="#EEF2F7"
          showInfo={false}
        />
      </div>

      {/* Footer: members & stats */}
      <div className="mt-3 flex items-center justify-between">
        <Avatar.Group size="small" maxCount={3}>
          {(task.members || []).map((m, idx) => (
            <Tooltip title={m.name} key={`${task.id}-m-${idx}`}>
              <Avatar src={m.avatar}>{m.name?.[0]}</Avatar>
            </Tooltip>
          ))}
        </Avatar.Group>

        <div
          className="flex items-center gap-3 text-gray-500 text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="inline-flex items-center gap-1">
            <MessageOutlined /> {task.comments ?? 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <PaperClipOutlined /> {task.attachments ?? 0}
          </span>
          {onEdit && (
            <EditOutlined
              className="text-gray-400 hover:text-blue-600 transition-colors"
              onClick={() => onEdit(task)}
            />
          )}
        </div>
      </div>

      {/* Hover focus ring */}
      <span className="pointer-events-none absolute inset-0 rounded-xl ring-0 group-hover:ring-1 ring-blue-200 transition" />
    </div>
  );
}
