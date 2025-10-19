import React, { useMemo, useState } from "react";
import Vector from "../../assets/Vector.png";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Search,
  Filter,
  Tag,
  MessageSquare,
  Calendar,
  User,
  AlertTriangle,
  Plus,
  Clock3,
} from "lucide-react";

/* ========== Helpers ========== */
const tagStyles = {
  Frontend: "bg-blue-100 text-blue-700",
  Backend: "bg-amber-100 text-amber-700",
  Bug: "bg-red-100 text-red-700",
  Design: "bg-purple-100 text-purple-700",
};
const priorityStyles = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-emerald-100 text-emerald-700",
};

function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

/* ========== Sortable Task Card ========== */
const TaskCard = ({ task, onOpen }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });
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
        <h4 className="font-semibold text-gray-900 leading-snug">{task.title}</h4>
        <span className={`text-xs px-2 py-1 rounded-full ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{task.description}</p>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {task.tags.map((t) => (
          <span key={t} className={`text-xs px-2 py-1 rounded-full ${tagStyles[t]}`}>
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
          {/* assignees */}
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

/* ========== Droppable Column ========== */
const Column = ({ id, title, tasks, onOpen }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`w-80 md:w-96 min-h-[560px] rounded-2xl p-5 border
      ${isOver ? "bg-[#EEF2FF] border-indigo-200" : "bg-[#F7F8FA] border-gray-200"}
      transition`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <span className="text-xs text-gray-500">{tasks.length}</span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onOpen={onOpen} />
        ))}
      </SortableContext>
    </div>
  );
};

/* ========== Task Modal (comments Agile) ========== */
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
              <span className={`text-xs px-2 py-1 rounded-full ${priorityStyles[task.priority]}`}>
                {task.priority}
              </span>
              {task.tags.map((t) => (
                <span key={t} className={`text-xs px-2 py-1 rounded-full ${tagStyles[t]}`}>
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
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
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

/* ========== Main Workspace ========== */
const Workspace = () => {
  // sample data với tag Frontend/Backend + comments
  const [columns, setColumns] = useState({
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
  });

  const [selectedTask, setSelectedTask] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("All");

  const sensors = useSensors(useSensor(PointerSensor));

  const allColumnIds = ["todo", "inprogress", "review", "done"];

  const findColumnOfTask = (taskId) =>
    allColumnIds.find((c) => columns[c].some((t) => t.id === taskId));

  const filteredColumns = useMemo(() => {
    const pass = (task) => {
      const matchText =
        !search ||
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase());
      const matchTag = filterTag === "All" || task.tags.includes(filterTag);
      return matchText && matchTag;
    };
    const clone = {};
    for (const c of allColumnIds) clone[c] = columns[c].filter(pass);
    return clone;
  }, [columns, search, filterTag]);

  const insertAt = (arr, index, item) => {
    const copy = arr.slice();
    copy.splice(index, 0, item);
    return copy;
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;

    const fromCol = findColumnOfTask(activeId);
    const toCol =
      findColumnOfTask(overId) ||
      (allColumnIds.includes(overId) ? overId : null);

    if (!fromCol || !toCol || fromCol === toCol) return;

    setColumns((prev) => {
      const fromList = [...prev[fromCol]];
      const toList = [...prev[toCol]];
      const movingIndex = fromList.findIndex((t) => t.id === activeId);
      const moving = fromList[movingIndex];
      if (!moving) return prev;

      fromList.splice(movingIndex, 1);

      const overIndexInTo =
        findColumnOfTask(overId) === toCol
          ? toList.findIndex((t) => t.id === overId)
          : toList.length;

      const newTo = insertAt(toList, overIndexInTo, moving);

      return { ...prev, [fromCol]: fromList, [toCol]: newTo };
    });
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const fromCol = findColumnOfTask(activeId);
    const toCol =
      findColumnOfTask(overId) ||
      (allColumnIds.includes(overId) ? overId : null);

    if (!fromCol || !toCol) return;

    if (fromCol === toCol) {
      const ids = columns[fromCol].map((t) => t.id);
      const oldIndex = ids.indexOf(activeId);
      const newIndex =
        ids.indexOf(findColumnOfTask(overId) === toCol ? overId : activeId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(columns[fromCol], oldIndex, newIndex);
        setColumns({ ...columns, [fromCol]: reordered });
      }
    }
  };

  const handleAddComment = (taskId, text) => {
    const colId = findColumnOfTask(taskId);
    if (!colId) return;
    setColumns((prev) => ({
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
    }));
  };

  return (
    <div className="relative">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={Vector} alt="Vector background" className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start pt-28 xl:pt-40 pb-20">
        {/* Title */}
        <h1 className="!font-sans !font-black text-[72px] md:text-[87px] leading-[96%] tracking-[-4%] text-[#3A3A3A] text-center">
          AI Healthcare Team
        </h1>
        <p className="mt-5 font-semibold text-center text-[20px] md:text-[21px] leading-[28px] text-black/70">
          Shared workspace for teams — manage tasks, share documents and track progress.
        </p>

        {/* Toolbar (Filters) */}
        <div className="mt-10 w-full max-w-7xl px-6">
          <div className=" backdrop-blur border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="flex items-center gap-2 flex-1 w-full">
                <div className="flex items-center bg-[#F5F5F5] rounded-xl w-full px-5 py-4 shadow-sm hover:shadow-md transition">
                  <Search className="w-5 h-5 text-gray-500 mr-3" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tasks by title or description..."
                    className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-500 text-[16px]"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-black" />
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option>All</option>
                  <option>Frontend</option>
                  <option>Backend</option>
                  <option>Design</option>
                  <option>Bug</option>
                </select>
              </div>
              <button
                className="ml-auto flex items-center gap-2 bg-gray-900 !text-white px-4 py-2 rounded-lg text-sm hover:bg-black"
                onClick={() =>
                  alert("Tuỳ bạn: mở modal tạo task mới (title, tag, priority, assignees...)")
                }
              >
                <Plus className="w-6 h-6 rounded-[12px]" />
                New Task
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="mt-8 flex gap-6 overflow-x-auto max-w-8xl mx-auto px-6 pb-2">
            <Column id="todo" title="To Do" tasks={filteredColumns.todo} onOpen={setSelectedTask} />
            <Column
              id="inprogress"
              title="In Progress"
              tasks={filteredColumns.inprogress}
              onOpen={setSelectedTask}
            />
            <Column id="review" title="Review" tasks={filteredColumns.review} onOpen={setSelectedTask} />
            <Column id="done" title="Done" tasks={filteredColumns.done} onOpen={setSelectedTask} />
          </div>
        </DndContext>
      </div>

      {/* Task Modal */}
      <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} onAddComment={handleAddComment} />
    </div>
  );
};

export default Workspace;
