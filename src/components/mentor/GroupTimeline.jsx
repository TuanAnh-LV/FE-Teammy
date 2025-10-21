import React, { useState } from "react";
import { Button, Modal, Input, Select, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import TaskCard from "./TaskCard";
import TaskDetailModal from "./TaskDetailModal";

const { TextArea } = Input;

const initialColumns = {
  todo: [
    {
      id: "1",
      title: "[BE] Auth API",
      tag: "BE",
      startDate: "2025-05-17",
      endDate: "2025-05-26",
      progress: 100,
      members: [
        { name: "L", avatar: "https://i.pravatar.cc/150?img=11" },
        { name: "DT", avatar: "https://i.pravatar.cc/150?img=12" },
      ],
      comments: 8,
      attachments: 0,
    },
  ],
  progress: [
    {
      id: "2",
      title: "[FE] UI Layout",
      tag: "FE",
      startDate: "2025-05-18",
      endDate: "2025-05-28",
      progress: 65,
      members: [{ name: "T", avatar: "https://i.pravatar.cc/150?img=13" }],
      comments: 3,
      attachments: 2,
    },
  ],
  done: [
    {
      id: "3",
      title: "Project Setup",
      tag: "MKT",
      startDate: "2025-05-10",
      endDate: "2025-05-12",
      progress: 100,
      members: [{ name: "L", avatar: "https://i.pravatar.cc/150?img=14" }],
      comments: 5,
      attachments: 1,
    },
  ],
};

export default function GroupTimeline() {
  const [columns, setColumns] = useState(initialColumns);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Drag & Drop logic
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      const updated = Array.from(columns[source.droppableId]);
      const [moved] = updated.splice(source.index, 1);
      updated.splice(destination.index, 0, moved);
      setColumns({ ...columns, [source.droppableId]: updated });
    } else {
      const start = Array.from(columns[source.droppableId]);
      const finish = Array.from(columns[destination.droppableId]);
      const [moved] = start.splice(source.index, 1);
      finish.splice(destination.index, 0, moved);
      setColumns({
        ...columns,
        [source.droppableId]: start,
        [destination.droppableId]: finish,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Task Management Board
          </h2>
          <p className="text-gray-500 text-sm">
            Organize your project tasks with a clean Kanban layout.
          </p>
        </div>
      </div>

      {/* Kanban Columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              key: "todo",
              title: "To Do",
              color: "gray",
              gradient: "from-gray-50 to-gray-100",
            },
            {
              key: "progress",
              title: "In Progress",
              color: "blue",
              gradient: "from-blue-50 to-blue-100",
            },
            {
              key: "done",
              title: "Done",
              color: "green",
              gradient: "from-green-50 to-green-100",
            },
          ].map((col) => (
            <Droppable droppableId={col.key} key={col.key}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-gradient-to-b ${col.gradient} rounded-2xl border border-gray-200 p-4 shadow-sm min-h-[500px] flex flex-col`}
                >
                  {/* Column Header */}
                  <div className="flex justify-between items-center mb-3 pb-1 border-b border-gray-200">
                    <h3
                      className={`font-semibold text-${col.color}-600 text-base flex items-center gap-2`}
                    >
                      {col.title}
                      <Tag color={col.color}>{columns[col.key].length}</Tag>
                    </h3>
                  </div>

                  {/* Task Cards */}
                  <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-1">
                    {columns[col.key].map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <div
                              onClick={() => {
                                setSelectedTask(task);
                                setIsTaskModalOpen(true);
                              }}
                            >
                              <TaskCard task={task} />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Task Detail Modal */}
      <TaskDetailModal
        open={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
      />
    </div>
  );
}
