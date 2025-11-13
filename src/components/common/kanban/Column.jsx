// src/components/kanban/Column.jsx
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";

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

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onOpen={onOpen} />
        ))}
      </SortableContext>
    </div>
  );
};

export default Column;
