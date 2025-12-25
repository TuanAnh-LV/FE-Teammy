import React, { useEffect, useRef, useState } from "react";
import { MessageSquare, Upload, X, FileIcon, MoreVertical, Edit, Trash2 } from "lucide-react";
import { priorityStyles, statusStyles, initials } from "../../../utils/kanbanHelpers";
import { useNavigate } from "react-router-dom";
import { BoardService } from "../../../services/board.service";
import { notification, Modal, Input } from "antd";
import { useTranslation } from "../../../hook/useTranslation";
import { useAuth } from "../../../context/AuthContext";

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

const formatColumnName = (name) => {
  if (!name) return "";
  return name
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatStatus = (status) => {
  if (!status) return "";
  return status
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const formatPriority = (priority) => {
  if (!priority) return "";
  return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
};

const normalizeStatusKey = (value = "") =>
  value.toLowerCase().replace(/[\s_]+/g, "");

const TaskModal = ({
  task,
  members = [],
  groupDetail = null,
  columnMeta = {},
  groupId = null,
  onClose,
  onFetchComments = null,
  onAddComment = () => {},
  onUpdateComment = () => {},
  onDeleteComment = () => {},
  onUpdateTask = () => {},
  onUpdateAssignees = () => {},
    onDeleteTask = () => {},
  readOnly = false,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userInfo } = useAuth();
  const [text, setText] = useState("");
  const [detailForm, setDetailForm] = useState({
    title: "",
    assignees: [],
    dueDate: "",
    status: "",
    priority: "",
    description: "",
  });
  const [activeTab, setActiveTab] = useState("files");
  const [commentLoading, setCommentLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [assigneeMenuOpenMain, setAssigneeMenuOpenMain] = useState(false);
  const [assigneeMenuOpenDetails, setAssigneeMenuOpenDetails] = useState(false);
  const [openKebabMenuId, setOpenKebabMenuId] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const fileInputRef = useRef(null);
  const assigneeMenuMainRef = useRef(null);
  const assigneeMenuDetailsRef = useRef(null);
  const fetchCommentsRef = useRef(onFetchComments);
  const getColumnIdByStatus = (statusValue) => {
    const target = normalizeStatusKey(statusValue);
    const entry = Object.entries(columnMeta || {}).find(([colId, meta]) => {
      const title = normalizeStatusKey(meta?.title || colId);
      return title === target;
    });
    return entry?.[0] || "";
  };

  useEffect(() => {
    if (task) {
      let normalizedDueDate = "";
      if (task.dueDate) {
        const match = String(task.dueDate).match(/^(\d{4}-\d{2}-\d{2})/);
        normalizedDueDate = match ? match[1] : "";
      }
      const matchedStatusColumn =
        task.columnId || getColumnIdByStatus(task.status || "");
      const fallbackColumn = Object.keys(columnMeta || {})[0] || "";

      setDetailForm({
        title: task.title || "",
        assignees: task.assignees || [],
        dueDate: normalizedDueDate,
        status: matchedStatusColumn || fallbackColumn,
        priority: task.priority || "",
        description: task.description || "",
      });
      setFiles(task.files || []);
      setText("");
      setEditingCommentId(null);
      setEditingContent("");
    }
  }, [task, columnMeta]);

  useEffect(() => {
    fetchCommentsRef.current = onFetchComments;
  }, [onFetchComments]);

  useEffect(() => {
    if (groupId && task?.id) {
      fetchTaskFiles();
    }
  }, [task?.id, groupId]);

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
      const clickedInsideMain =
        assigneeMenuMainRef.current &&
        assigneeMenuMainRef.current.contains(event.target);
      const clickedInsideDetails =
        assigneeMenuDetailsRef.current &&
        assigneeMenuDetailsRef.current.contains(event.target);
      if (clickedInsideMain || clickedInsideDetails) return;
      setAssigneeMenuOpenMain(false);
      setAssigneeMenuOpenDetails(false);
      
      // Close kebab menu if clicking outside
      if (!event.target.closest('.kebab-menu-container')) {
        setOpenKebabMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const allMembers = React.useMemo(() => {
    const peopleList = [...members];
    
    // Only add leader, NOT mentor (mentor should not be assignable)
    if (groupDetail) {
      if (groupDetail.leader) {
        peopleList.push({
          id: groupDetail.leader.userId,
          userId: groupDetail.leader.userId,
          displayName: groupDetail.leader.displayName,
          email: groupDetail.leader.email,
          avatarUrl: groupDetail.leader.avatarUrl,
          role: groupDetail.leader.role || 'leader'
        });
      }
    }
    
    return peopleList;
  }, [members, groupDetail]);

  if (!task) return null;

  const priorityClass = priorityStyles[task.priority] || "bg-gray-100 text-gray-700";
  const statusClass = statusStyles[task.status] || "bg-gray-100 text-gray-700";
  const comments = task.comments || [];
  const handleFieldBlur = (field) => {
    if (!task) return;
    if (readOnly) return;
    onUpdateTask(task.id, { [field]: detailForm[field] || "" });
  };
  const availableMembers = Array.isArray(allMembers) ? allMembers : [];
  const selectedAssignees = detailForm.assignees || [];
  const primaryAssignee = selectedAssignees[0] || null;
  const primaryAssigneeLabel =
    getAssigneeLabel(primaryAssignee) || t("unassigned") || "Unassigned";
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
    Modal.confirm({
      title: t("confirmDeleteComment") || "Delete this comment?",
      content: t("deleteCommentWarning") || "Are you sure you want to delete this comment? This action cannot be undone.",
      okText: t("delete") || "Delete",
      okButtonProps: { danger: true },
      cancelText: t("cancel") || "Cancel",
      onOk: () => {
        onDeleteComment(task.id, commentId);
        if (editingCommentId === commentId) {
          cancelEditComment();
        }
        setOpenKebabMenuId(null);
      },
    });
  };
  
  const fetchTaskFiles = async () => {
    if (!groupId || !task?.id) return;
    try {
      setLoadingFiles(true);
      const res = await BoardService.getTaskFiles(groupId, task.id);
      const filesList = Array.isArray(res?.data) ? res.data : [];
      
      // Map API response to file object
      const mappedFiles = filesList.map(file => ({
        id: file.fileId || file.id,
        name: file.fileName || file.name || t("unknown") || "Unknown",
        size: file.fileSize || file.size || 0,
        type: file.fileType || file.type,
        url: file.fileURI || file.url || file.fileUrl,
        taskId: file.taskId || task.id,
      }));
      
      setFiles(mappedFiles);
    } catch (error) {

      setFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };
  const openProfile = (userId) => {
    if (!userId) return;
    navigate(`/profile/${userId}`);
  };
  
  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0 || !groupId || !task?.id) return;
    
    try {
      setUploadingFile(true);
      
      // Upload each file to server
      const uploadPromises = selectedFiles.map(file => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('taskId', task.id);
        
        return BoardService.uploadTaskFile(groupId, task.id, formData)
          .then(res => {
            const uploadedFile = res?.data || {};
            return {
              id: uploadedFile.fileId || uploadedFile.id,
              name: uploadedFile.fileName || uploadedFile.name || file.name,
              size: uploadedFile.fileSize || uploadedFile.size || file.size,
              type: uploadedFile.fileType || uploadedFile.type || file.type,
              url: uploadedFile.fileURI || uploadedFile.url || uploadedFile.fileUrl,
              taskId: task.id,
              isNew: false,
            };
          });
      });
      
      const uploadedFiles = await Promise.all(uploadPromises);
      
      notification.success({
        message: t("filesUploadedSuccess") || "Files uploaded successfully",
        duration: 2,
      });
      
      // Refetch files from server to ensure we have the latest data
      await fetchTaskFiles();
    } catch (error) {

      notification.info({
        message: t("failedUploadFiles") || "Failed to upload files",
        description: error?.response?.data?.message || t("pleaseTryAgain") || "Please try again",
        duration: 2,
      });
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleDeleteFile = async (fileId) => {
    if (!window.confirm(t("confirmDeleteFile") || "Delete this file?")) return;
    
    try {
      const fileToDelete = files.find(f => f.id === fileId);
      
      if (fileToDelete && fileToDelete.taskId && groupId && task?.id) {
        await BoardService.deleteTaskFile(groupId, task.id, fileId);
        notification.success({
          message: t("fileDeletedSuccess") || "File deleted successfully",
          duration: 2,
        });
      }
      
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {

      notification.info({
        message: t("failedDeleteFile") || "Failed to delete file",
        description: error?.response?.data?.message || t("pleaseTryAgain") || "Please try again",
        duration: 2,
      });
      setFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };
  
  const getFileIcon = (fileName) => {
    if (!fileName) return <FileIcon className="w-4 h-4 text-gray-500" />;
    const ext = String(fileName).split('.').pop()?.toLowerCase() || '';
    const iconProps = "w-4 h-4";
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <img src="/icons/image.svg" alt="img" className={iconProps} />;
    } else if (['pdf'].includes(ext)) {
      return <FileIcon className={iconProps + " text-red-500"} />;
    } else if (['doc', 'docx'].includes(ext)) {
      return <FileIcon className={iconProps + " text-blue-500"} />;
    } else if (['xls', 'xlsx'].includes(ext)) {
      return <FileIcon className={iconProps + " text-green-500"} />;
    }
    return <FileIcon className={iconProps + " text-gray-500"} />;
  };
  
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
    const userId = comment.userId || comment.authorId || comment.createdById || "";
    
    // Find member by userId from allMembers list (includes mentor, leader, members)
    const member = allMembers?.find(m => 
      m.id === userId || 
      m.userId === userId || 
      m.accountId === userId
    );
    
    // Prioritize displayName and avatarUrl from comment data
    const avatarUrl = comment.avatarUrl || member?.avatarUrl || member?.avatar || member?.photoURL || comment.authorAvatar;
    const displayName = comment.displayName || member?.displayName || member?.name || comment.createdBy || t("user") || "User";
    
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-semibold">
        {initials(displayName || "U") || "U"}
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
                  {formatPriority(task.priority)}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${statusClass}`}>
                  {formatStatus(task.status)}
                </span>
              </div>
              <input
                className="w-full text-xl font-bold text-gray-900 border-b border-transparent focus:border-gray-300 outline-none"
                value={detailForm.title || ""}
                onChange={(e) =>
                  setDetailForm((prev) => ({ ...prev, title: e.target.value }))
                }
                onBlur={() => handleFieldBlur("title")}
                readOnly={readOnly}
                disabled={readOnly}
              />
            </div>
            <div className="flex items-center gap-2">
              {!readOnly && onDeleteTask && (
                <button
                  className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    let inputValue = "";
                    Modal.confirm({
                      title: t("deleteTaskTitle") || "Delete task",
                      content: (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            {t("typeDeleteToConfirm") || "Type 'delete' to confirm."}
                          </p>
                          <Input
                            placeholder={t("deletePlaceholder") || "delete"}
                            onChange={(ev) => {
                              inputValue = ev.target.value;
                            }}
                          />
                        </div>
                      ),
                      okText: t("delete") || "Delete",
                      okButtonProps: { danger: true },
                      cancelText: t("cancel") || "Cancel",
                      onOk: () => {
                        if (inputValue.toLowerCase() !== "delete") {
                          notification.info({
                            message: t("validationError") || "Validation Error",
                            description: t("mustTypeDelete") || "You must type 'delete' to confirm.",
                          });
                          return Promise.reject();
                        }
                        onDeleteTask(task.id);
                        onClose();
                        return Promise.resolve();
                      },
                    });
                  }}
                >
                  {t("delete") || "Delete"}
                </button>
              )}
              <button
                className="px-3 py-1.5 rounded-lg border text-gray-600 hover:bg-gray-50"
                onClick={onClose}
              >
                {t("close") || "Close"}
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col lg:flex-row gap-6 max-h-[75vh]">
            <div className="flex-1 space-y-6 overflow-y-auto pr-2">
              <div className="border-b" />
              <div className="space-y-5">
                <h4 className="text-sm font-semibold text-gray-800">{t("description") || "Description"}</h4>
                <textarea
                  value={detailForm.description}
                  onChange={(e) =>
                    setDetailForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  onBlur={() => handleFieldBlur("description")}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-gray-200"
                  rows={4}
                  readOnly={readOnly}
                  disabled={readOnly}
                />
              </div>

            <div className="space-y-5">
              {/* Assignees preview only (selection moved to Details) */}
              <div className="flex items-start gap-5" ref={assigneeMenuMainRef}>
                <label className="text-sm font-medium text-[#292A2E] w-24 mt-2">
                  {t("assignees") || "Assignees"}
                </label>
                <div className="flex-1 border border-gray-200 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(detailForm.assignees || []).length === 0 ? (
                      <span className="text-gray-500">
                        {t("unassigned") || "Unassigned"}
                      </span>
                    ) : (
                      (detailForm.assignees || []).map((a, idx) => (
                        <div key={`${getAssigneeId(a)}-${idx}`} className="flex items-center gap-1">
                          {renderMemberAvatar(a, "w-6 h-6")}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
                <div className="flex items-center gap-2 border-b pb-2">
                  <button
                    className={`text-sm font-semibold px-3 py-1 rounded-lg ${activeTab === "files" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                    onClick={() => setActiveTab("files")}
                  >
                    {t("files") || "Files"}
                  </button>
                  <button
                    className={`text-sm font-semibold px-3 py-1 rounded-lg ${activeTab === "comments" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                    onClick={() => setActiveTab("comments")}
                  >
                    {t("comments") || "Comments"}
                  </button>
                </div>

                {activeTab === "files" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-800">{t("files") || "Files"}</h4>
                      {!readOnly && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingFile}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Upload className="w-4 h-4" />
                          {uploadingFile ? t("uploading") || "Uploading..." : t("upload") || "Upload"}
                        </button>
                      )}
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={readOnly}
                    />

                    {loadingFiles ? (
                      <p className="text-xs text-gray-500">{t("loadingFiles") || "Loading files..."}</p>
                    ) : files.length === 0 ? (
                      <p className="text-xs text-gray-500">{t("noFilesAttached") || "No files attached"}</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                          >
                            <div className="flex-shrink-0">
                              {getFileIcon(file.name)}
                            </div>
                            <a
                              href={file.url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 min-w-0"
                            >
                              <p className="text-xs font-medium text-blue-600 hover:underline truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </a>
                            {!readOnly && (
                              <button
                                onClick={() => handleDeleteFile(file.id)}
                                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                                title={t("deleteFile") || "Delete file"}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "comments" && (
                  <div className="space-y-5">
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-gray-700" />
                      {t("comments") || "Comments"}
                    </h4>
                    <div className="space-y-3">
                      {commentLoading ? (
                        <div className="text-xs text-gray-500">{t("loadingComments") || "Loading comments..."}</div>
                      ) : comments.length > 0 ? (
                        comments.map((comment) => (
                          <div key={comment.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                            <div className="flex items-start gap-2">
                              <div
                                className="flex-shrink-0 cursor-pointer"
                                onClick={() =>
                                  openProfile(
                                    comment.userId ||
                                      comment.authorId ||
                                      comment.createdById ||
                                      ""
                                  )
                                }
                              >
                                {renderCommentAvatar(comment)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span
                                    className="cursor-pointer font-semibold text-gray-700"
                                    onClick={() =>
                                      openProfile(
                                        comment.userId ||
                                          comment.authorId ||
                                          comment.createdById ||
                                          ""
                                      )
                                    }
                                  >
                                    {(() => {
                                      // Prioritize displayName from comment data
                                      const userId = comment.userId || comment.authorId || comment.createdById || "";
                                      const member = allMembers?.find(m => 
                                        m.id === userId || 
                                        m.userId === userId || 
                                        m.accountId === userId
                                      );
                                      return comment.displayName || member?.displayName || member?.name || comment.createdBy || t("unknown") || "Unknown";
                                    })()}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {comment.createdAt && (
                                      <span>{formatTimestamp(comment.createdAt)}</span>
                                    )}
                                    {(() => {
                                      // Check if current user is the author of the comment
                                      const commentUserId = comment.userId || comment.authorId || comment.createdById || "";
                                      const currentUserId = userInfo?.userId || userInfo?.id || userInfo?.accountId || "";
                                      const isCommentOwner = commentUserId && currentUserId && (
                                        commentUserId === currentUserId ||
                                        String(commentUserId).toLowerCase() === String(currentUserId).toLowerCase()
                                      );
                                      
                                      // Only show kebab menu if user owns the comment
                                      if (!isCommentOwner) return null;
                                      
                                      const isMenuOpen = openKebabMenuId === comment.id;
                                      
                                      return (
                                        <div className="relative kebab-menu-container">
                                          <button
                                            type="button"
                                            className="p-1 rounded hover:bg-gray-200 transition-colors"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setOpenKebabMenuId(isMenuOpen ? null : comment.id);
                                            }}
                                          >
                                            <MoreVertical className="w-4 h-4 text-gray-600" />
                                          </button>
                                          {isMenuOpen && (
                                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
                                              <button
                                                type="button"
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  startEditComment(comment);
                                                  setOpenKebabMenuId(null);
                                                }}
                                              >
                                                <Edit className="w-4 h-4" />
                                                {t("edit") || "Edit"}
                                              </button>
                                              <button
                                                type="button"
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteComment(comment.id);
                                                }}
                                              >
                                                <Trash2 className="w-4 h-4" />
                                                {t("delete") || "Delete"}
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })()}
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
                                        {t("cancel") || "Cancel"}
                                      </button>
                                      <button
                                        type="button"
                                        className="px-3 py-1 rounded-lg bg-gray-900 text-white hover:bg-black"
                                        onClick={saveEditComment}
                                        disabled={!editingContent.trim()}
                                      >
                                        {t("save") || "Save"}
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
                        <div className="text-xs text-gray-500">{t("noCommentsYet") || "No comments yet"}</div>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={t("writeComment") || "Write a comment..."}
                        className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
                      />
                      <button
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleAddComment}
                        disabled={!text.trim()}
                      >
                        {t("post") || "Post"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            <div className="w-full lg:w-[380px] flex-shrink-0 space-y-4 lg:self-start">
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-800 mb-4">{t("details") || "Details"}</h4>
                <div className="space-y-5">
                  <div className="flex items-start gap-5 relative" ref={assigneeMenuDetailsRef}>
                    <label className="text-sm text-[#292A2E] font-semibold w-24 mt-2">
                      {t("assignees") || "Assignees"}
                    </label>
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={() => setAssigneeMenuOpenDetails((prev) => !prev)}
                        className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        disabled={readOnly}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          {(detailForm.assignees || []).length === 0 ? (
                            <span className="text-gray-500">
                              {t("selectAssignees") || "Select assignees"}
                            </span>
                          ) : (
                            (detailForm.assignees || []).map((a, idx) => (
                              <div key={`${getAssigneeId(a)}-${idx}`} className="flex items-center gap-1">
                                {renderMemberAvatar(a, "w-6 h-6")}
                              </div>
                            ))
                          )}
                        </div>
                        <span className="text-gray-500 text-xs">▼</span>
                      </button>
                      {assigneeMenuOpenDetails && !readOnly && (
                        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                          <div className="px-3 py-2 text-xs text-gray-500">
                            {t("selectMultiple") || "Select one or more assignees"}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setDetailForm((prev) => ({ ...prev, assignees: [] }));
                              onUpdateAssignees(task.id, []);
                              setAssigneeMenuOpenDetails(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 text-left"
                          >
                            <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-[10px] flex items-center justify-center ring-2 ring-white">
                              U
                            </div>
                            <span className="text-gray-900">{t("unassigned") || "Unassigned"}</span>
                          </button>
                          {availableMembers.map((member) => {
                            const optionId = getAssigneeId(member);
                            const label = getAssigneeLabel(member) || optionId;
                            const isSelected = (detailForm.assignees || []).some(
                              (a) => getAssigneeId(a) === optionId
                            );
                            return (
                              <button
                                type="button"
                                key={optionId}
                                onClick={() => {
                                  setDetailForm((prev) => {
                                    const current = prev.assignees || [];
                                    const next = isSelected
                                      ? current.filter((a) => getAssigneeId(a) !== optionId)
                                      : [...current, member];
                                    return { ...prev, assignees: next };
                                  });
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 text-left ${
                                  isSelected ? "bg-blue-50" : ""
                                }`}
                              >
                                {renderMemberAvatar(member)}
                                <span className="text-gray-900">{label}</span>
                                {isSelected && <span className="ml-auto text-blue-600">✓</span>}
                              </button>
                            );
                          })}
                          <div className="px-3 py-2 flex items-center justify-end gap-2 border-t">
                            <button
                              type="button"
                              className="px-3 py-1 text-sm rounded-lg border text-gray-600 hover:bg-gray-100"
                              onClick={() => {
                                setAssigneeMenuOpenDetails(false);
                              }}
                            >
                              {t("cancel") || "Cancel"}
                            </button>
                            <button
                              type="button"
                              className="px-3 py-1 text-sm rounded-lg bg-gray-900 text-white hover:bg-black"
                              onClick={() => {
                                const ids = (detailForm.assignees || []).map((a) => getAssigneeId(a)).filter(Boolean);
                                onUpdateAssignees(task.id, ids);
                                setAssigneeMenuOpenDetails(false);
                              }}
                            >
                              {t("save") || "Save"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <label className="text-sm font-medium text-[#292A2E] w-24">{t("dueDate") || "Due date"}</label>
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
                          if (readOnly) return;
                          if (dateValue && dateValue !== String(task.dueDate || "").slice(0, 10)) {
                            onUpdateTask(task.id, { dueDate: dateValue });
                          }
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 text-sm outline-none pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
                        disabled={readOnly}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-10">
                    <label className="text-sm font-medium text-[#292A2E] w-24">{t("status") || "Status"}</label>
                    <select
                      value={detailForm.status}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!readOnly && task?.id) {
                          // Update form state immediately
                          setDetailForm((prev) => ({ ...prev, status: value }));
                          // Update task via API
                          onUpdateTask(task.id, { status: value });
                        }
                      }}
                      className="w-full  px-3 py-2 text-sm  bg-white"
                      disabled={readOnly}
                    >
                      {(Object.entries(columnMeta).length === 0 ? [["", { title: t("selectStatus") || "Select status" }]] : Object.entries(columnMeta)).map(([columnId, meta]) => (
                        <option key={columnId} value={columnId}>
                          {formatColumnName(meta?.title || columnId)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-10    ">
                    <label className="text-sm font-medium text-[#292A2E] w-24">{t("priority") || "Priority"}</label>
                    <select
                      value={detailForm.priority}
                      onChange={(e) =>
                        setDetailForm((prev) => {
                          const value = e.target.value;
                          if (!readOnly) {
                            onUpdateTask(task.id, { priority: value });
                          }
                          return { ...prev, priority: value };
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-white"
                      disabled={readOnly}
                    >
                      <option value="high">{formatPriority(t("high") || "High")}</option>
                      <option value="medium">{formatPriority(t("medium") || "Medium")}</option>
                      <option value="low">{formatPriority(t("low") || "Low")}</option>
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

