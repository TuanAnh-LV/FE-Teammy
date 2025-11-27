import React, { useState, useEffect } from "react";
import { Button, Modal, Input, Select, Tag, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import TaskCard from "./TaskCard";
import TaskModal from "../common/kanban/TaskModal";
import { BoardService } from "../../services/board.service";
import { GroupService } from "../../services/group.service";

const { TextArea } = Input;

export default function GroupTimeline({ groupId, groupDetail }) {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);

  useEffect(() => {
    if (groupId) {
      fetchBoardData();
      fetchGroupMembers();
    }
  }, [groupId]);

  const fetchBoardData = async () => {
    try {
      setLoading(true);
      const response = await BoardService.getBoard(groupId);
      setBoard(response?.data || null);
    } catch (error) {
      console.error("Failed to fetch board data:", error);
      setBoard(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMembers = async () => {
    try {
      const response = await GroupService.getListMembers(groupId);
      const membersList = response?.data || [];
      
      // Add leader if exists
      const allMembers = [];
      if (groupDetail?.leader) {
        allMembers.push({
          userId: groupDetail.leader.userId,
          displayName: groupDetail.leader.displayName,
          email: groupDetail.leader.email,
          avatar: groupDetail.leader.avatarUrl,
        });
      }
      
      membersList.forEach(member => {
        allMembers.push({
          userId: member.userId,
          displayName: member.displayName,
          email: member.email,
          avatar: member.avatarUrl,
        });
      });
      
      setGroupMembers(allMembers);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      setGroupMembers([]);
    }
  };

  // Task comment handlers
  const loadTaskComments = async (taskId) => {
    try {
      const response = await BoardService.getTaskComments(groupId, taskId);
      // Update task with comments
      if (selectedTask?.id === taskId) {
        setSelectedTask({
          ...selectedTask,
          comments: response?.data || [],
        });
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    }
  };

  const addTaskComment = async (taskId, content) => {
    try {
      await BoardService.createTaskComment(groupId, taskId, { content });
      await loadTaskComments(taskId);
      await fetchBoardData(); // Refresh board
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const updateTaskComment = async (commentId, content) => {
    try {
      await BoardService.updateTaskComment(groupId, commentId, { content });
      await loadTaskComments(selectedTask?.id);
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  const deleteTaskComment = async (commentId) => {
    try {
      await BoardService.deleteTaskComment(groupId, commentId);
      await loadTaskComments(selectedTask?.id);
      await fetchBoardData(); // Refresh board
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  // Task update handlers
  const updateTaskFields = async (taskId, updates) => {
    try {
      await BoardService.updateTask(groupId, taskId, updates);
      await fetchBoardData(); // Refresh board
      
      // Update selected task if it's the one being edited
      if (selectedTask?.id === taskId) {
        setSelectedTask({
          ...selectedTask,
          ...updates,
        });
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const updateTaskAssignees = async (taskId, assigneeIds) => {
    try {
      await BoardService.replaceTaskAssignees(groupId, taskId, { assigneeIds });
      await fetchBoardData(); // Refresh board
      
      // Update selected task
      if (selectedTask?.id === taskId) {
        setSelectedTask({
          ...selectedTask,
          assignees: assigneeIds,
        });
      }
    } catch (error) {
      console.error("Failed to update assignees:", error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await BoardService.deleteTask(groupId, taskId);
      await fetchBoardData(); // Refresh board
      setSelectedTask(null); // Close modal
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  // Convert board data to columns format for display
  const getColumnsFromBoard = () => {
    if (!board || !board.columns) return {};
    
    const columnsData = {};
    const columnsArray = Array.isArray(board.columns) 
      ? board.columns 
      : Object.values(board.columns);

    columnsArray.forEach(column => {
      const tasksArray = column.tasks 
        ? (Array.isArray(column.tasks) ? column.tasks : Object.values(column.tasks))
        : [];
      
      const columnId = column.columnId || column.id;
      columnsData[columnId] = tasksArray.map(task => ({
        id: task.taskId || task.id,
        title: task.title || task.name || "Untitled Task",
        tag: task.tag || task.priority?.toUpperCase() || "TASK",
        startDate: task.startDate || task.createdAt,
        endDate: task.endDate || task.dueDate,
        progress: task.progress || 0,
        members: task.assignees || [],
        comments: task.commentCount || 0,
        attachments: task.attachmentCount || 0,
        description: task.description,
        status: task.status,
        priority: task.priority,
        columnId: columnId,
      }));
    });

    return columnsData;
  };

  // Drag & Drop logic
  const onDragEnd = (result) => {
    if (!result.destination) return;
    // Note: Mentor can view but drag-drop functionality would need API implementation
    console.log("Drag operation:", result);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" tip="Loading workspace..." />
      </div>
    );
  }

  const columns = getColumnsFromBoard();
  const columnsArray = board?.columns 
    ? (Array.isArray(board.columns) ? board.columns : Object.values(board.columns))
    : [];

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Task Management Board
          </h2>
          <p className="text-gray-500 text-sm">
            View and monitor project tasks organized in a Kanban layout.
          </p>
        </div>
      </div>

      {!board || columnsArray.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No workspace data available.
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${columnsArray.length}, minmax(300px, 1fr))` }}>
            {columnsArray.map((col) => {
              const columnId = col.columnId || col.id;
              const tasks = columns[columnId] || [];
              return (
                <Droppable droppableId={columnId} key={columnId}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-4 shadow-sm min-h-[500px] flex flex-col"
                    >
                      {/* Column Header */}
                      <div className="flex justify-between items-center mb-3 pb-1 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-700 text-base flex items-center gap-2">
                          {col.columnName || col.title || col.name || "Column"}
                          <Tag color="blue">{tasks.length}</Tag>
                        </h3>
                      </div>

                      {/* Task Cards */}
                      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-1">
                        {tasks.map((task, index) => (
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
                                  onClick={() => setSelectedTask(task)}
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
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Task Detail Modal */}
      <TaskModal
        task={selectedTask}
        groupId={groupId}
        members={groupMembers}
        onClose={() => setSelectedTask(null)}
        onFetchComments={loadTaskComments}
        onAddComment={addTaskComment}
        onUpdateComment={updateTaskComment}
        onDeleteComment={deleteTaskComment}
        onUpdateTask={updateTaskFields}
        onUpdateAssignees={updateTaskAssignees}
        onDeleteTask={deleteTask}
      />
    </div>
  );
}
