import { useMemo, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import {
  ALL_COLUMN_IDS,
  filterColumns,
  findColumnOfTask,
  moveTaskAcrossColumns,
} from "../utils/kanbanUtils";

const INITIAL_COLUMNS = {
  todo: [
    {
      id: "t1",
      title: "FE: Login page (Google OAuth)",
      description: "Implement login UI + call /api/auth/google",
      tags: ["Frontend"],
      priority: "High",
      due: "24/10/2025",
      points: 3,
      assignees: ["Tran Thi B", "Nguyen Van A"],
      comments: [{ text: "Nhớ check responsive", author: "Quang", when: "today" }],
    },
    {
      id: "t2",
      title: "BE: AuthController + JWT",
      description: "Create endpoint /api/auth/login, return token + user",
      tags: ["Backend"],
      priority: "High",
      due: "25/10/2025",
      points: 5,
      assignees: ["Le Van C"],
      comments: [],
    },
    {
      id: "t3",
      title: "Design: Project card",
      description: "Figma component for Discover grid",
      tags: ["Design", "Frontend"],
      priority: "Medium",
      due: "26/10/2025",
      points: 2,
      assignees: ["Pham Thi D"],
      comments: [{ text: "Dùng radius 16px", author: "Binh", when: "yesterday" }],
    },
  ],
  inprogress: [
    {
      id: "t4",
      title: "FE: Kanban board UI",
      description: "Columns, drag & drop with dnd-kit",
      tags: ["Frontend"],
      priority: "Medium",
      due: "27/10/2025",
      points: 5,
      assignees: ["Tran Thi B"],
      comments: [{ text: "Thêm tag Backend/Frontend", author: "A", when: "2d ago" }],
    },
  ],
  review: [
    {
      id: "t5",
      title: "BE: Groups API",
      description: "Endpoints /api/groups (list/create), /api/groups/:id",
      tags: ["Backend"],
      priority: "Medium",
      due: "29/10/2025",
      points: 5,
      assignees: ["Le Van C", "Doan Van E"],
      comments: [{ text: "Bổ sung pagination", author: "Mentor", when: "1d ago" }],
    },
  ],
  done: [
    {
      id: "t6",
      title: "DB: Schemas & migrations",
      description: "roles, users, groups, invitations...",
      tags: ["Backend"],
      priority: "Low",
      due: "18/10/2025",
      points: 8,
      assignees: ["Doan Van E"],
      comments: [{ text: "Đã chạy CI", author: "E", when: "3d ago" }],
    },
  ],
};

export function useKanbanBoard() {
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [selectedTask, setSelectedTask] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("All");

  const loading = false;
  const error = null;

  const filteredColumns = useMemo(
    () => filterColumns(columns, search, filterTag),
    [columns, search, filterTag]
  );

  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    setColumns((prev) => moveTaskAcrossColumns(prev, active.id, over.id));
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    setColumns((prev) => {
      const fromCol = findColumnOfTask(prev, activeId);
      const toCol =
        findColumnOfTask(prev, overId) ||
        (ALL_COLUMN_IDS.includes(overId) ? overId : null);

      if (!fromCol || !toCol || fromCol !== toCol) return prev;

      const ids = prev[fromCol].map((t) => t.id);
      const oldIndex = ids.indexOf(activeId);

      const targetId =
        findColumnOfTask(prev, overId) === toCol ? overId : activeId;
      const newIndex = ids.indexOf(targetId);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return prev;
      }

      const reordered = arrayMove(prev[fromCol], oldIndex, newIndex);

      return {
        ...prev,
        [fromCol]: reordered,
      };
    });
  };

  const handleAddComment = (taskId, text) => {
    setColumns((prev) => {
      const colId = findColumnOfTask(prev, taskId);
      if (!colId) return prev;

      return {
        ...prev,
        [colId]: prev[colId].map((t) =>
          t.id === taskId
            ? {
                ...t,
                comments: [
                  ...t.comments,
                  { text, author: "You", when: "now" },
                ],
              }
            : t
        ),
      };
    });
  };

  return {
    columns,
    filteredColumns,
    loading,
    error,
    selectedTask,
    setSelectedTask,
    search,
    setSearch,
    filterTag,
    setFilterTag,
    handleDragOver,
    handleDragEnd,
    handleAddComment,
  };
}

export default useKanbanBoard;
