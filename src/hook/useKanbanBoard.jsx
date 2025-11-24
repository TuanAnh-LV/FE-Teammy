import { useEffect, useMemo, useState, useRef } from "react";
import {
  filterColumns,
  findColumnOfTask,
  moveTaskAcrossColumns,
} from "../utils/kanbanUtils";
import { BoardService } from "../services/board.service";
import { GroupService } from "../services/group.service";

const extractPersonId = (entity) => {
  if (!entity) return "";
  if (typeof entity === "string") return entity;
  return (
    entity.id ||
    entity.userId ||
    entity.userID ||
    entity.memberId ||
    entity.memberID ||
    entity.user?.id ||
    entity.user?.userId ||
    entity.accountId ||
    entity.email ||
    ""
  );
};

const extractPersonName = (entity) => {
  if (!entity) return "";
  if (typeof entity === "string") return entity;
  return (
    entity.displayName ||
    entity.name ||
    entity.fullName ||
    entity.user?.displayName ||
    entity.user?.name ||
    entity.email ||
    entity.username ||
    entity.id ||
    ""
  );
};

const normalizePersonEntity = (entity) => {
  const id = extractPersonId(entity);
  if (!id) return null;
  if (typeof entity === "string") {
    return {
      id,
      name: entity,
      email: "",
      avatarUrl: "",
    };
  }
  return {
    id,
    name: extractPersonName(entity),
    email: entity.email || entity.user?.email || "",
    avatarUrl:
      entity.avatarUrl ||
      entity.avatarURL ||
      entity.photoUrl ||
      entity.photoURL ||
      entity.user?.avatarUrl ||
      entity.user?.avatarURL ||
      "",
  };
};

const normalizePersonList = (list) => {
  if (!list) return [];
  const source = Array.isArray(list) ? list : [list];
  return source.map(normalizePersonEntity).filter(Boolean);
};

const normalizeCommentsList = (data) => {
  if (!data) return [];
  let list = [];
  if (Array.isArray(data)) {
    list = data;
  } else if (Array.isArray(data?.data)) {
    list = data.data;
  } else if (Array.isArray(data?.items)) {
    list = data.items;
  } else if (Array.isArray(data?.results)) {
    list = data.results;
  }
  return list.map((comment, index) => ({
    id:
      comment.id ||
      comment.commentId ||
      comment._id ||
      `comment-${index}`,
    userId:
      comment.userId ||
      comment.ownerId ||
      comment.memberId ||
      comment.authorId ||
      comment.user?.id ||
      comment.user?.userId ||
      comment.user?.userID ||
      comment.createdById ||
      comment.createdBy ||
      "",
    content: comment.content || comment.text || "",
    createdBy:
      comment.createdBy ||
      comment.author ||
      comment.user?.displayName ||
      comment.user?.name ||
      comment.userName ||
      "",
    createdAt:
      comment.createdAt ||
      comment.created_at ||
      comment.when ||
      comment.updatedAt ||
      "",
    authorAvatar:
      comment.avatarUrl ||
      comment.avatarURL ||
      comment.authorAvatar ||
      comment.user?.avatarUrl ||
      comment.user?.avatarURL ||
      "",
  }));
};

const normalizeKey = (value) =>
  (value || "").toString().trim().toLowerCase();

const findMemberByUserId = (members = [], userId = "") => {
  if (!userId) return null;
  const key = normalizeKey(userId);
  return members.find((member) => {
    const candidates = [
      member.id,
      member.userId,
      member.userID,
      member.memberId,
      member.email,
    ];
    return candidates.some((candidate) => normalizeKey(candidate) === key);
  });
};

const enrichCommentsWithMembers = (comments = [], members = []) => {
  if (!Array.isArray(comments)) return [];
  return comments.map((comment) => {
    const member = findMemberByUserId(members, comment.userId);
    if (!member) {
      return {
        ...comment,
        createdBy: comment.createdBy || comment.userId || "Unknown",
        authorAvatar: comment.authorAvatar || "",
      };
    }
    return {
      ...comment,
      createdBy:
        member.name ||
        member.displayName ||
        member.fullName ||
        member.email ||
        comment.createdBy ||
        comment.userId ||
        "Unknown",
      authorAvatar: member.avatarUrl || comment.authorAvatar || "",
      authorEmail: member.email || "",
    };
  });
};

const commentsMetaEqual = (a = [], b = []) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (
      a[i].createdBy !== b[i].createdBy ||
      (a[i].authorAvatar || "") !== (b[i].authorAvatar || "") ||
      (a[i].authorEmail || "") !== (b[i].authorEmail || "")
    ) {
      return false;
    }
  }
  return true;
};

export function useKanbanBoard(groupId) {
  const [columns, setColumns] = useState({});
  const [columnMeta, setColumnMeta] = useState({});
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const commentsLoadedRef = useRef(false);
  const dragProcessingRef = useRef(false);

  const buildStateFromApi = (data) => {
    const colState = {};
    const metaState = {};
    if (data?.columns && Array.isArray(data.columns)) {
      data.columns.forEach((col) => {
        const key = col.id || col.columnId || col.name || col.columnName;
        if (!key) return;
        const tasks = col.tasks || col.taskResponses || [];
        colState[key] = tasks.map((t) => ({
          id: t.id || t.taskId,
          columnId: key,
          title: t.title || "",
          description: t.description || "",
          priority: (t.priority || "").toLowerCase(),
          status: t.status || "",
          dueDate: t.dueDate || "",
          assignees: normalizePersonList(t.assignees),
          comments: enrichCommentsWithMembers(
            normalizeCommentsList(t.comments),
            groupMembers
          ),
        }));
        metaState[key] = {
          title: col.columnName || col.name || key,
          isDone: !!col.isDone,
          dueDate: col.dueDate || null,
          position: col.position || 0,
        };
      });
    }
    return { colState, metaState };
  };

  const fetchBoard = async ({ showLoading = true } = {}) => {
    if (!groupId) return;
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const res = await BoardService.getBoard(groupId);
      const { colState, metaState } = buildStateFromApi(res?.data || {});
      setColumns(colState);
      setColumnMeta(metaState);
    } catch (err) {
      console.error(err);
      setError("Failed to load board");
      setColumns({});
      setColumnMeta({});
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchGroupMembers = async () => {
    if (!groupId) {
      setGroupMembers([]);
      return;
    }
    try {
      const res = await GroupService.getListMembers(groupId);
      const payload = res?.data;
      let rawList = [];
      if (Array.isArray(payload)) {
        rawList = payload;
      } else if (Array.isArray(payload?.data)) {
        rawList = payload.data;
      } else if (Array.isArray(payload?.items)) {
        rawList = payload.items;
      } else if (Array.isArray(payload?.results)) {
        rawList = payload.results;
      }
      setGroupMembers(normalizePersonList(rawList));
    } catch (err) {
      console.error(err);
      setGroupMembers([]);
    }
  };

  useEffect(() => {
    commentsLoadedRef.current = false;
    fetchBoard();
    fetchGroupMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  // Auto-load comments for all tasks when board data is available (only once)
  useEffect(() => {
    const hasColumns = columns && typeof columns === "object" && Object.keys(columns).length > 0;
    const hasMembers = groupMembers && groupMembers.length > 0;
    
    if (hasColumns && hasMembers && !commentsLoadedRef.current) {
      commentsLoadedRef.current = true;
      loadAllTasksComments(columns);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, groupMembers]);

  useEffect(() => {
    if (!groupMembers || groupMembers.length === 0) return;
    setColumns((prev) => {
      if (!prev || typeof prev !== "object") return prev;
      let changed = false;
      const next = {};
      Object.entries(prev).forEach(([colId, tasks]) => {
        const updatedTasks = (tasks || []).map((task) => {
          const updatedComments = enrichCommentsWithMembers(
            task.comments || [],
            groupMembers
          );
          if (commentsMetaEqual(task.comments || [], updatedComments)) {
            return task;
          }
          changed = true;
          return { ...task, comments: updatedComments };
        });
        next[colId] = updatedTasks;
      });
      return changed ? next : prev;
    });
    setSelectedTask((prev) => {
      if (!prev) return prev;
      const updatedComments = enrichCommentsWithMembers(
        prev.comments || [],
        groupMembers
      );
      if (commentsMetaEqual(prev.comments || [], updatedComments)) {
        return prev;
      }
      return {
        ...prev,
        comments: updatedComments,
      };
    });
  }, [groupMembers]);

  const filteredColumns = useMemo(() => {
    if (!columns || typeof columns !== "object") return {};
    const ids = Object.keys(columns || {});
    return filterColumns(columns, search, filterStatus, filterPriority, ids);
  }, [columns, search, filterStatus, filterPriority]);

  const normalizeStatus = (value = "") =>
    value.toLowerCase().replace(/\s+/g, "_");

  const getColumnIdByStatus = (status) => {
    const target = normalizeStatus(status);
    const entry = Object.entries(columnMeta || {}).find(([id, meta]) => {
      const title = normalizeStatus(meta?.title || id);
      return title === target;
    });
    return entry?.[0] || null;
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    setColumns((prev) => {
      const ids = Object.keys(prev || {});
      return moveTaskAcrossColumns(prev, active.id, over.id, ids);
    });
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over) return;
    
    // Prevent multiple simultaneous drag operations
    if (dragProcessingRef.current) {
      console.log('Drag already in progress, skipping...');
      return;
    }
    
    dragProcessingRef.current = true;
    
    let newState = columns;
    const activeId = active.id;
    const overId = over.id;

    setColumns((prev) => {
      const ids = Object.keys(prev || {});
      newState = moveTaskAcrossColumns(prev, activeId, overId, ids);
      return newState;
    });

    const dynamicIds = Object.keys(newState || {});
    const toCol =
      findColumnOfTask(newState, overId, dynamicIds) ||
      (dynamicIds.includes(overId)
        ? overId
        : findColumnOfTask(newState, activeId, dynamicIds));

    if (!groupId || !toCol || !newState?.[toCol]) {
      dragProcessingRef.current = false;
      return;
    }

    try {
      const ids = newState[toCol].map((t) => t.id);
      const index = ids.indexOf(activeId);
      const prevTaskId = index > 0 ? ids[index - 1] : null;
      const nextTaskId = index >= 0 && index < ids.length - 1 ? ids[index + 1] : null;
      
      // Get target column status from column name
      const targetColumnName = columnMeta?.[toCol]?.title || toCol;
      const targetStatus = normalizeStatus(targetColumnName);
      
      // Move task to new column
      await BoardService.moveTask(groupId, activeId, {
        columnId: toCol,
        prevTaskId,
        nextTaskId,
      });
      
      // Update task status to match the new column (without triggering moveTaskToColumn again)
      if (targetStatus) {
        await updateTaskFields(activeId, { status: targetStatus }, { skipMove: true });
      }
    } catch (err) {
      console.error(err);
      fetchBoard();
    } finally {
      setTimeout(() => {
        dragProcessingRef.current = false;
      }, 300);
    }
  };

  const createColumn = async (payload) => {
    if (!groupId) return;
    try {
      await BoardService.createColumn(groupId, payload);
      fetchBoard({ showLoading: false });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteColumn = async (columnId) => {
    if (!groupId || !columnId) return;
    try {
      await BoardService.deleteColumn(groupId, columnId);
      fetchBoard({ showLoading: false });
    } catch (err) {
      console.error(err);
    }
  };

  const createTask = async (payload) => {
    if (!groupId) return;
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = {
      id: tempId,
      columnId: payload.columnId,
      title: payload.title || "New Task",
      description: payload.description || "",
      priority: (payload.priority || "medium").toLowerCase(),
      status: payload.status || "todo",
      dueDate: payload.dueDate || null,
      assignees: normalizePersonList(payload.assignees),
      comments: [],
    };
    setColumns((prev) => ({
      ...prev,
      [payload.columnId]: [...(prev[payload.columnId] || []), optimisticTask],
    }));
    try {
      await BoardService.createTask(groupId, payload);
      fetchBoard({ showLoading: false });
    } catch (err) {
      console.error(err);
    }
  };

  const patchTaskState = (taskId, updater) => {
    setColumns((prev) => {
      const ids = Object.keys(prev || {});
      const colId = findColumnOfTask(prev, taskId, ids);
      if (!colId) return prev;
      return {
        ...prev,
        [colId]: prev[colId].map((t) =>
          t.id === taskId ? { ...t, ...updater(t) } : t
        ),
      };
    });
    setSelectedTask((prev) => {
      if (!prev || prev.id !== taskId) return prev;
      return { ...prev, ...updater(prev) };
    });
  };

  const getTaskSnapshot = (taskId) => {
    const ids = Object.keys(columns || {});
    const colId = findColumnOfTask(columns, taskId, ids);
    if (!colId) return null;
    return columns[colId]?.find((t) => t.id === taskId) || null;
  };

  const normalizeDueDate = (value) => {
    if (!value) return null;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return null;
      // If already ISO format, return as is
      if (trimmed.includes('T') || trimmed.includes('Z')) {
        return trimmed;
      }
      // Convert YYYY-MM-DD to ISO string
      const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) {
        return `${match[1]}T00:00:00.000Z`;
      }
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  };

  const updateTaskFields = async (taskId, changes, options = {}) => {
    if (!groupId || !taskId) return;
    const { skipMove = false } = options;
    const normalizedChanges = { ...changes };
    if ("dueDate" in normalizedChanges) {
      normalizedChanges.dueDate = normalizeDueDate(normalizedChanges.dueDate);
    }
    const snapshot = getTaskSnapshot(taskId) || {};
    patchTaskState(taskId, () => normalizedChanges);
    try {
      await BoardService.updateTask(groupId, taskId, {
        title: snapshot.title || "Untitled task",
        description: snapshot.description || "",
        priority: snapshot.priority || "medium",
        status: snapshot.status || "todo",
        dueDate: snapshot.dueDate || null,
        ...normalizedChanges,
      });
      // Only trigger moveTaskToColumn if status changed and skipMove is false
      if (
        !skipMove &&
        normalizedChanges.status &&
        normalizedChanges.status !== snapshot.status
      ) {
        // status is now the columnId directly
        const targetColumnId = normalizedChanges.status;
        if (targetColumnId && columns[targetColumnId] !== undefined) {
          moveTaskToColumn(taskId, targetColumnId);
        }
      }
    } catch (err) {
      console.error(err);
      fetchBoard({ showLoading: false });
    }
  };

  const updateTaskAssignees = async (taskId, userIds) => {
    if (!groupId || !taskId) return;
    const normalizedAssignees = (userIds || [])
      .map((id) => {
        if (!id) return null;
        const member = groupMembers.find((m) => m.id === id);
        if (member) return member;
        return {
          id,
          name: id,
          email: "",
          avatarUrl: "",
        };
      })
      .filter(Boolean);
    patchTaskState(taskId, () => ({ assignees: normalizedAssignees }));
    try {
      await BoardService.replaceTaskAssignees(groupId, taskId, {
        userIds,
      });
    } catch (err) {
      console.error(err);
      fetchBoard({ showLoading: false });
    }
  };

  const moveTaskToColumn = async (taskId, targetColumnId) => {
    if (!groupId || !taskId || !targetColumnId) return;
    let newState = columns;
    setColumns((prev) => {
      const ids = Object.keys(prev || {});
      const fromCol = findColumnOfTask(prev, taskId, ids);
      if (!fromCol || fromCol === targetColumnId) return prev;
      const task = prev[fromCol]?.find((t) => t.id === taskId);
      if (!task) return prev;
      const updatedFrom = prev[fromCol].filter((t) => t.id !== taskId);
      const updatedTo = [...(prev[targetColumnId] || []), { ...task, columnId: targetColumnId }];
      newState = {
        ...prev,
        [fromCol]: updatedFrom,
        [targetColumnId]: updatedTo,
      };
      return newState;
    });
    const targetList = newState?.[targetColumnId] || [];
    const prevTaskId =
      targetList.length > 1 ? targetList[targetList.length - 2].id : null;
    
    try {
      // API moveTask already handles status update based on column, no need to call updateTaskFields
      await BoardService.moveTask(groupId, taskId, {
        columnId: targetColumnId,
        prevTaskId,
        nextTaskId: null,
      });
    } catch (err) {
      console.error(err);
      fetchBoard({ showLoading: false });
    }
  };

  const deleteTask = async (taskId) => {
    if (!groupId || !taskId) return;
    setColumns((prev) => {
      const ids = Object.keys(prev || {});
      const colId = findColumnOfTask(prev, taskId, ids);
      if (!colId) return prev;
      return {
        ...prev,
        [colId]: prev[colId].filter((t) => t.id !== taskId),
      };
    });
    try {
      await BoardService.deleteTask(groupId, taskId);
    } catch (err) {
      console.error(err);
      fetchBoard({ showLoading: false });
    }
  };

  const loadTaskComments = async (taskId) => {
    if (!groupId || !taskId) return [];
    try {
      const res = await BoardService.getTaskComments(groupId, taskId);
      const comments = enrichCommentsWithMembers(
        normalizeCommentsList(res?.data),
        groupMembers
      );
      patchTaskState(taskId, () => ({ comments }));
      return comments;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const loadAllTasksComments = async (columnsData) => {
    if (!groupId) return;
    const data = columnsData || columns;
    if (!data || typeof data !== "object") return;
    
    const taskIds = [];
    Object.values(data).forEach((tasks) => {
      if (Array.isArray(tasks)) {
        tasks.forEach((task) => {
          if (task?.id) {
            taskIds.push(task.id);
          }
        });
      }
    });
    
    // Load comments for all tasks in parallel
    if (taskIds.length > 0) {
      const promises = taskIds.map((taskId) =>
        loadTaskComments(taskId).catch((err) => {
          console.error(`Failed to load comments for task ${taskId}:`, err);
          return [];
        })
      );
      
      try {
        await Promise.all(promises);
      } catch (err) {
        console.error("Error loading all task comments:", err);
      }
    }
  };

  const addTaskComment = async (taskId, content) => {
    if (!groupId || !taskId) return;
    const trimmed = (content || "").trim();
    if (!trimmed) return;
    const tempComment = {
      id: `temp-comment-${Date.now()}`,
      content: trimmed,
      createdAt: new Date().toISOString(),
      createdBy: "You",
    };
    patchTaskState(taskId, (task) => ({
      comments: [...(task.comments || []), tempComment],
    }));
    try {
      await BoardService.createTaskComment(groupId, taskId, {
        content: trimmed,
      });
      await loadTaskComments(taskId);
    } catch (err) {
      console.error(err);
      patchTaskState(taskId, (task) => ({
        comments: (task.comments || []).filter(
          (comment) => comment.id !== tempComment.id
        ),
      }));
    }
  };

  const updateTaskComment = async (taskId, commentId, content) => {
    if (!groupId || !taskId || !commentId) return;
    const trimmed = (content || "").trim();
    if (!trimmed) return;
    patchTaskState(taskId, (task) => ({
      comments: (task.comments || []).map((comment) =>
        comment.id === commentId ? { ...comment, content: trimmed } : comment
      ),
    }));
    try {
      await BoardService.updateTaskComment(groupId, commentId, {
        content: trimmed,
      });
    } catch (err) {
      console.error(err);
      await loadTaskComments(taskId);
    }
  };

  const deleteTaskComment = async (taskId, commentId) => {
    if (!groupId || !taskId || !commentId) return;
    const snapshot = getTaskSnapshot(taskId);
    patchTaskState(taskId, (task) => ({
      comments: (task.comments || []).filter(
        (comment) => comment.id !== commentId
      ),
    }));
    try {
      await BoardService.deleteTaskComment(groupId, commentId);
    } catch (err) {
      console.error(err);
      patchTaskState(taskId, () => ({
        comments: snapshot?.comments || [],
      }));
    }
  };

  return {
    columns,
    columnMeta,
    filteredColumns,
    loading,
    error,
    selectedTask,
    setSelectedTask,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    handleDragOver,
    handleDragEnd,
    createColumn,
    createTask,
    updateTaskFields,
    updateTaskAssignees,
    deleteTask,
    deleteColumn,
    refetchBoard: fetchBoard,
    groupMembers,
    loadTaskComments,
    loadAllTasksComments,
    addTaskComment,
    updateTaskComment,
    deleteTaskComment,
  };
}

export default useKanbanBoard;
