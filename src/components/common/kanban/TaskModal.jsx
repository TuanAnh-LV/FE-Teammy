// src/components/kanban/TaskModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { priorityStyles, statusStyles, initials } from "../../../utils/kanbanHelpers";

const getAssigneeId = (assignee) => {
  if (!assignee) return "";
  if (typeof assignee === "string") return assignee;
  return (
    assignee.id ||
    assignee.userId ||
    assignee.memberId ||
    assignee.email ||
    ""
  );
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

const TaskModal = ({
  task,
  members = [],
  onClose,
  onFetchComments = null,
  onAddComment = () => {},
  onUpdateComment = () => {},
  onDeleteComment = () => {},
  onUpdateTask = () => {},
  onUpdateAssignees = () => {},
  onDeleteTask = () => {},
}) => {
  const [text, setText] = useState("");
  const [detailForm, setDetailForm] = useState({
    assignees: [],
    dueDate: "",
    status: "",
    priority: "",
    description: "",
  });
  const [commentLoading, setCommentLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState(false);
  const assigneeMenuRef = useRef(null);
  const fetchCommentsRef = useRef(onFetchComments);

  useEffect(() => {
    if (task) {
      let normalizedDueDate = "";
      if (task.dueDate) {
        const match = String(task.dueDate).match(/^(\d{4}-\d{2}-\d{2})/);
        normalizedDueDate = match ? match[1] : "";
      }
      
      setDetailForm({
        assignees: task.assignees || [],
        dueDate: normalizedDueDate,
        status: task.status || "",
        priority: task.priority || "",
        description: task.description || "",
      });
      setText("");
      setEditingCommentId(null);
      setEditingContent("");
    }
  }, [task]);

  useEffect(() => {
    fetchCommentsRef.current = onFetchComments;
  }, [onFetchComments]);

  useEffect(() => {
    if (!task?.id || typeof fetchCommentsRef.current !== "function") return;
    let cancelled = false;
    const fetchComments = async () => {
      try {
        setCommentLoading(true);
        await fetchCommentsRef.current(task.id);
      } finally {
        if (!cancelled) {
          setCommentLoading(false);
        }
      }
    };
    fetchComments();
    return () => {
      cancelled = true;
    };
  }, [task?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!assigneeMenuRef.current) return;
      if (!assigneeMenuRef.current.contains(event.target)) {
        setAssigneeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!task) return null;

  const priorityClass = priorityStyles[task.priority] || "bg-gray-100 text-gray-700";
  const statusClass = statusStyles[task.status] || "bg-gray-100 text-gray-700";
  const comments = task.comments || [];
  const handleFieldBlur = (field) => {
    if (!task) return;
    onUpdateTask(task.id, { [field]: detailForm[field] || "" });
  };
  const activeAssignee = detailForm.assignees?.[0] || null;
  const activeAssigneeId = getAssigneeId(activeAssignee);
  const activeAssigneeLabel = getAssigneeLabel(activeAssignee) || "Unassigned";
  const availableMembers = Array.isArray(members) ? members : [];
  const activeMember =
    availableMembers.find((member) => getAssigneeId(member) === activeAssigneeId) ||
    null;
  const handleAddComment = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddComment(task.id, trimmed);
    setText("");
  };
  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content || "");
  };
  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };
  const saveEditComment = () => {
    const trimmed = editingContent.trim();
    if (!trimmed || !editingCommentId) return;
    onUpdateComment(task.id, editingCommentId, trimmed);
    setEditingCommentId(null);
    setEditingContent("");
  };
  const handleDeleteComment = (commentId) => {
    if (!commentId) return;
    if (!window.confirm("Delete this comment?")) return;
    onDeleteComment(task.id, commentId);
    if (editingCommentId === commentId) {
      cancelEditComment();
    }
  };
  const formatTimestamp = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };
  const renderMemberAvatar = (member, size = "w-8 h-8") => {
    const label =
      member?.name ||
      member?.displayName ||
      member?.fullName ||
      member?.email ||
      "U";
    if (member?.avatarUrl) {
      return (
        <img
          src={member.avatarUrl}
          alt={label}
          className={`${size} rounded-full object-cover`}
        />
      );
    }
    return (
      <div
        className={`${size} rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-semibold`}
      >
        {initials(label || "U") || "U"}
      </div>
    );
  };
  const renderCommentAvatar = (comment) => {
    const label = comment.createdBy || comment.userId || "User";
    if (comment.authorAvatar) {
      return (
        <img
          src={comment.authorAvatar}
          alt={label}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-semibold">
        {initials(label || "U") || "U"}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center overflow-y-auto">
        <div className="my-10 w-[95%] max-w-6xl rounded-xl bg-white shadow-2xl p-6">
          <div className="flex items-start justify-between pb-4 gap-3">
            <div className="space-y-2 w-full">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-1 rounded-full ${priorityClass}`}>
                  {task.priority}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${statusClass}`}>
                  {task.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              {onDeleteTask && (
                <button
                  className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    if (window.confirm("Delete this task?")) {
                      onDeleteTask(task.id);
                      onClose();
                    }
                  }}
                >
                  Delete
                </button>
              )}
              <button
                className="px-3 py-1.5 rounded-lg border text-gray-600 hover:bg-gray-50"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col lg:flex-row gap-6 max-h-[75vh]">
            {/* Left pane */}
            <div className="flex-1 space-y-6 overflow-y-auto pr-2">
              <div className="border-b" />
              <div className="space-y-5">
                <h4 className="text-sm font-semibold text-gray-800">Description</h4>
                <textarea
                  value={detailForm.description}
                  onChange={(e) =>
                    setDetailForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  onBlur={() => handleFieldBlur("description")}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-gray-200"
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <h4 className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                  Assignees
                </h4>

                <div className="flex flex-wrap gap-2">
                  {(task.assignees || []).length === 0 && (
                    <span className="text-sm text-gray-500">No assignees yet</span>
                  )}
                  {(task.assignees || []).map((assignee, index) => {
                    const label = getAssigneeLabel(assignee) || "Unassigned";
                    const id = getAssigneeId(assignee) || `${label}-${index}`;
                    return (
                      <div
                        key={id}
                        className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-gray-200 bg-white"
                      >
                        {renderMemberAvatar(assignee, "w-6 h-6 text-[10px]")}
                        <span className="text-sm text-gray-800">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>


              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gray-700" />
                  Activity
                </h4>
                <div className="space-y-5">
                  {commentLoading ? (
                    <div className="text-xs text-gray-500">Loading comments...</div>
                  ) : comments.length > 0 ? (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">{renderCommentAvatar(comment)}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{comment.createdBy || "Unknown"}</span>
                              <div className="flex items-center gap-2">
                                {comment.createdAt && (
                                  <span>{formatTimestamp(comment.createdAt)}</span>
                                )}
                                <button
                                  type="button"
                                  className="text-blue-600 hover:underline"
                                  onClick={() => startEditComment(comment)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="text-red-500 hover:underline"
                                  onClick={() => handleDeleteComment(comment.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            {editingCommentId === comment.id ? (
                              <div className="mt-3 space-y-2">
                                <textarea
                                  value={editingContent}
                                  onChange={(e) => setEditingContent(e.target.value)}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                                  rows={2}
                                />
                                <div className="flex items-center justify-end gap-2 text-sm">
                                  <button
                                    type="button"
                                    className="px-3 py-1 rounded-lg border text-gray-600 hover:bg-gray-100"
                                    onClick={cancelEditComment}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    className="px-3 py-1 rounded-lg bg-gray-900 text-white hover:bg-black"
                                    onClick={saveEditComment}
                                    disabled={!editingContent.trim()}
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">
                                {comment.content || comment.text}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500">No comments yet</div>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
                  />
                  <button
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleAddComment}
                    disabled={!text.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Right pane: details editable */}
            <div className="w-full lg:w-[380px] flex-shrink-0 space-y-4 lg:self-start">
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-800 mb-4">Details</h4>
                <div className="space-y-5">
                  {/* Assignee */}
                  <div className="flex items-start gap-5 relative" ref={assigneeMenuRef}>
                    <label className="text-sm text-[#292A2E] font-semibold w-24 mt-2">
                      Assignee
                    </label>
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={() => setAssigneeMenuOpen((prev) => !prev)}
                        className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                      >
                        <div className="flex items-center gap-2">
                          {renderMemberAvatar(
                            activeMember || { name: activeAssigneeLabel || "U" }
                          )}
                          <span className="text-gray-900">
                            {activeAssigneeLabel || "Unassigned"}
                          </span>
                        </div>
                        <span className="text-gray-500 text-xs">▼</span>
                      </button>
                      {assigneeMenuOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setDetailForm((prev) => ({ ...prev, assignees: [] }));
                              onUpdateAssignees(task.id, []);
                              setAssigneeMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 text-left"
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-semibold">
                              U
                            </div>
                            <span>Unassigned</span>
                          </button>
                          {availableMembers.map((member) => {
                            const optionId = getAssigneeId(member);
                            const label = getAssigneeLabel(member) || optionId;
                            return (
                              <button
                                type="button"
                                key={optionId}
                                onClick={() => {
                                  const nextList = optionId ? [member] : [];
                                  setDetailForm((prev) => ({
                                    ...prev,
                                    assignees: nextList,
                                  }));
                                  onUpdateAssignees(task.id, optionId ? [optionId] : []);
                                  setAssigneeMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 text-left"
                              >
                                {renderMemberAvatar(member)}
                                <span className="text-gray-900">{label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center gap-5">
                    <label className="text-sm font-medium text-[#292A2E] w-24">Due date</label>
                    <div className="relative flex items-center gap-2 flex-1">
                      <input
                        type="date"
                        value={detailForm.dueDate ? String(detailForm.dueDate).slice(0, 10) : ""}
                        onChange={(e) => {
                          const newDate = e.target.value;
                          setDetailForm((prev) => ({ ...prev, dueDate: newDate }));
                        }}
                        onBlur={(e) => {
                          const dateValue = e.target.value;
                          if (dateValue && dateValue !== String(task.dueDate || "").slice(0, 10)) {
                            onUpdateTask(task.id, { dueDate: dateValue });
                          }
                        }}
                        className="w-full px-3 py-2 text-sm outline-none pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-10">
                    <label className="text-sm font-medium text-[#292A2E] w-24">Status</label>
                    <select
                      value={detailForm.status}
                      onChange={(e) =>
                        setDetailForm((prev) => {
                          const value = e.target.value;
                          onUpdateTask(task.id, { status: value });
                          return { ...prev, status: value };
                        })
                      }
                      className="w-full  px-3 py-2 text-sm  bg-white"
                    >
                      <option value="todo">To do</option>
                      <option value="in_progress">In progress</option>
                      <option value="review">Review</option>
                      <option value="blocked">Blocked</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="flex items-center gap-10    ">
                    <label className="text-sm font-medium text-[#292A2E] w-24">Priority</label>
                    <select
                      value={detailForm.priority}
                      onChange={(e) =>
                        setDetailForm((prev) => {
                          const value = e.target.value;
                          onUpdateTask(task.id, { priority: value });
                          return { ...prev, priority: value };
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-white"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
