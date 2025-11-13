// src/components/kanban/TaskModal.jsx
import React, { useState } from "react";
import { MessageSquare } from "lucide-react";
import { tagStyles, priorityStyles, initials } from "../../../utils/kanbanHelpers";

const TaskModal = ({ task, onClose, onAddComment }) => {
  const [text, setText] = useState("");

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-2xl p-6 overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${priorityStyles[task.priority]}`}
              >
                {task.priority}
              </span>
              {task.tags.map((t) => (
                <span
                  key={t}
                  className={`text-xs px-2 py-1 rounded-full ${tagStyles[t]}`}
                >
                  {t}
                </span>
              ))}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
            <p className="text-gray-600 mt-1">{task.description}</p>
          </div>
          <button
            className="px-3 py-1.5 rounded-lg border text-gray-600 hover:bg-gray-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-xs text-gray-500">Due date</div>
            <div className="font-medium text-gray-800">{task.due}</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-xs text-gray-500">Story points</div>
            <div className="font-medium text-gray-800">{task.points}</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 col-span-2">
            <div className="text-xs text-gray-500 mb-1">Assignees</div>
            <div className="flex flex-wrap gap-2">
              {task.assignees.map((a) => (
                <div
                  key={a}
                  className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-gray-200 bg-white"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-800 text-white text-[10px] flex items-center justify-center">
                    {initials(a)}
                  </div>
                  <span className="text-sm text-gray-800">{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-gray-700" />
            <h4 className="font-semibold text-gray-800">Comments</h4>
          </div>
          <div className="space-y-3">
            {task.comments.map((c, i) => (
              <div
                key={i}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3"
              >
                <div className="text-sm text-gray-800">{c.text}</div>
                <div className="text-xs text-gray-500 mt-1">
                  by {c.author} • {c.when}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
            />
            <button
              className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-black"
              onClick={() => {
                if (!text.trim()) return;
                onAddComment(task.id, text.trim());
                setText("");
              }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
