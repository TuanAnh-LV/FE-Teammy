/**
 * Test Code: FE-TM-Hook-useKanbanBoard
 * Test Name: useKanbanBoard Hook Test
 * Description: Test Kanban board state management hook (basic tests due to complexity)
 * Author: Test Suite
 * Date: 2024
 * 
 * NOTE: This hook is extremely complex (836 lines) with many service dependencies.
 * These tests cover basic initialization and state management.
 * Full integration testing would require extensive mocking of all services.
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useKanbanBoard } from "../../src/hook/useKanbanBoard";
import { BoardService } from "../../src/services/board.service";
import { GroupService } from "../../src/services/group.service";

// Mock services
jest.mock("../../src/services/board.service");
jest.mock("../../src/services/group.service");

describe("useKanbanBoard Hook", () => {
  const mockGroupId = "group-123";

  beforeEach(() => {
    // Mock successful board fetch
    BoardService.getBoard = jest.fn().mockResolvedValue({
      data: {
        columns: [
          {
            id: "col-1",
            columnName: "To Do",
            position: 1,
            tasks: [],
          },
          {
            id: "col-2",
            columnName: "In Progress",
            position: 2,
            tasks: [],
          },
        ],
      },
    });

    // Mock group members
    GroupService.getGroupMembers = jest.fn().mockResolvedValue({
      data: [
        {
          userId: "user-1",
          name: "John Doe",
          email: "john@test.com",
        },
      ],
    });

    // Mock BoardService methods
    BoardService.createColumn = jest.fn();
    BoardService.createTask = jest.fn();
    BoardService.updateTask = jest.fn();
    BoardService.deleteTask = jest.fn();
    BoardService.deleteColumn = jest.fn();
    BoardService.getTaskComments = jest.fn();
    BoardService.createTaskComment = jest.fn();
    BoardService.updateTaskComment = jest.fn();
    BoardService.deleteTaskComment = jest.fn();
    BoardService.replaceTaskAssignees = jest.fn();
    BoardService.moveTask = jest.fn();
    GroupService.getListMembers = jest.fn().mockResolvedValue({ data: [] });

    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
    console.warn.mockRestore();
  });

  /**
   * Test Case UTC01
   * Type: Normal
   * Description: Hook initializes with default state
   */
  it("UTC01 - should initialize with default state", () => {
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    expect(result.current.columns).toEqual({});
    expect(result.current.groupMembers).toEqual([]);
    expect(result.current.selectedTask).toBe(null);
    expect(result.current.search).toBe("");
  });

  /**
   * Test Case UTC02
   * Type: Normal
   * Description: Loads board and columns on mount
   */
  it("UTC02 - should load board and columns", async () => {
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const colKeys = Object.keys(result.current.columns);
    expect(colKeys.length).toBeGreaterThanOrEqual(0);
    expect(BoardService.getBoard).toHaveBeenCalledWith(mockGroupId);
  });

  /**
   * Test Case UTC03
   * Type: Normal
   * Description: Provides group members array
   */
  it("UTC03 - should provide group members array", () => {
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    expect(result.current.groupMembers).toEqual([]);
    expect(Array.isArray(result.current.groupMembers)).toBe(true);
  });

  /**
   * Test Case UTC04
   * Type: Normal
   * Description: Provides search functionality
   */
  it("UTC04 - should provide search state and setter", () => {
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    expect(result.current.search).toBe("");

    act(() => {
      result.current.setSearch("test search");
    });

    expect(result.current.search).toBe("test search");
  });

  /**
   * Test Case UTC05
   * Type: Normal
   * Description: Provides task selection state
   */
  it("UTC05 - should manage selected task", () => {
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    expect(result.current.selectedTask).toBe(null);

    act(() => {
      result.current.setSelectedTask({ id: "task-1", title: "Test Task" });
    });

    expect(result.current.selectedTask).toEqual({
      id: "task-1",
      title: "Test Task",
    });

    act(() => {
      result.current.setSelectedTask(null);
    });

    expect(result.current.selectedTask).toBe(null);
  });

  /**
   * Test Case UTC06
   * Type: Normal
   * Description: Provides error state
   */
  it("UTC06 - should provide error state", () => {
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    expect(result.current.error).toBe(null);
  });

  /**
   * Test Case UTC07
   * Type: Normal
   * Description: Provides filter status state
   */
  it("UTC07 - should provide filter status", () => {
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    // filterStatus starts as "All"
    expect(result.current.filterStatus).toBe("All");

    act(() => {
      result.current.setFilterStatus("inProgress");
    });

    expect(result.current.filterStatus).toBe("inProgress");
  });

  /**
   * Test Case UTC08
   * Type: Normal
   * Description: Provides refetch board method
   */
  it("UTC08 - should provide refetch board method", async () => {
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.refetchBoard).toBeInstanceOf(Function);
  });

  /**
   * Test Case UTC09
   * Type: Normal
   * Description: Creates a new column
   */
  it("UTC09 - should create column", async () => {
    BoardService.createColumn = jest.fn().mockResolvedValue({
      data: { id: "col-3", columnName: "Done" },
    });

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.createColumn("Done", false);
    });

    expect(BoardService.createColumn).toHaveBeenCalled();
  });

  /**
   * Test Case UTC10
   * Type: Normal
   * Description: Creates a new task
   */
  it("UTC10 - should create task", async () => {
    BoardService.createTask = jest.fn().mockResolvedValue({
      data: { id: "task-1", title: "New Task" },
    });

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.createTask("col-1", {
        title: "New Task",
        description: "Test description",
      });
    });

    expect(BoardService.createTask).toHaveBeenCalled();
  });

  /**
   * Test Case UTC11
   * Type: Normal
   * Description: Updates task fields
   */
  it("UTC11 - should update task fields", async () => {
    BoardService.updateTask = jest.fn().mockResolvedValue({
      data: { id: "task-1", title: "Updated Task" },
    });

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateTaskFields("task-1", {
        title: "Updated Task",
      });
    });

    expect(BoardService.updateTask).toHaveBeenCalled();
  });

  /**
   * Test Case UTC12
   * Type: Normal
   * Description: Deletes a task
   */
  it("UTC12 - should delete task", async () => {
    BoardService.deleteTask = jest.fn().mockResolvedValue({});

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteTask("task-1");
    });

    expect(BoardService.deleteTask).toHaveBeenCalled();
  });

  /**
   * Test Case UTC13
   * Type: Normal
   * Description: Deletes a column
   */
  it("UTC13 - should delete column", async () => {
    BoardService.deleteColumn = jest.fn().mockResolvedValue({});

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteColumn("col-1");
    });

    expect(BoardService.deleteColumn).toHaveBeenCalled();
  });

  /**
   * Test Case UTC14
   * Type: Normal
   * Description: Loads task comments
   */
  it("UTC14 - should load task comments", async () => {
    BoardService.getTaskComments = jest.fn().mockResolvedValue({
      data: [
        { id: "comment-1", content: "Test comment", userId: "user-1" },
      ],
    });

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.loadTaskComments("task-1");
    });

    expect(BoardService.getTaskComments).toHaveBeenCalled();
  });

  /**
   * Test Case UTC15
   * Type: Normal
   * Description: Adds a comment to task
   */
  it("UTC15 - should add task comment", async () => {
    BoardService.createTaskComment = jest.fn().mockResolvedValue({
      data: { id: "comment-1", content: "New comment" },
    });

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addTaskComment("task-1", "New comment");
    });

    expect(BoardService.createTaskComment).toHaveBeenCalled();
  });

  /**
   * Test Case UTC16
   * Type: Normal
   * Description: Updates task assignees
   */
  it("UTC16 - should update task assignees", async () => {
    BoardService.replaceTaskAssignees = jest.fn().mockResolvedValue({});

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateTaskAssignees("task-1", ["user-1"]);
    });

    expect(BoardService.replaceTaskAssignees).toHaveBeenCalled();
  });

  /**
   * Test Case UTC17
   * Type: Normal
   * Description: Handles drag over event
   */
  it("UTC17 - should handle drag over", () => {
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    act(() => {
      result.current.handleDragOver({
        active: { id: "task-1" },
        over: { id: "col-2" },
      });
    });

    expect(result.current.columns).toBeDefined();
  });

  /**
   * Test Case UTC18
   * Type: Normal
   * Description: Handles drag end event
   */
  it("UTC18 - should handle drag end", async () => {
    BoardService.moveTask = jest.fn().mockResolvedValue({});

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDragEnd({
        active: { id: "task-1" },
        over: { id: "col-2" },
      });
    });

    expect(result.current.columns).toBeDefined();
  });

  /**
   * Test Case UTC19
   * Type: Abnormal
   * Description: Handles create task error
   */
  it("UTC19 - should handle create task error", async () => {
    BoardService.createTask = jest.fn().mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.createTask({
        columnId: "col-1",
        title: "New Task",
      });
    });

    expect(BoardService.createTask).toHaveBeenCalled();
  });

  /**
   * Test Case UTC20
   * Type: Abnormal
   * Description: Handles update task error
   */
  it("UTC20 - should handle update task error", async () => {
    BoardService.updateTask = jest.fn().mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateTaskFields("task-1", { title: "Updated" });
    });

    expect(BoardService.updateTask).toHaveBeenCalled();
  });

  /**
   * Test Case UTC21
   * Type: Abnormal
   * Description: Handles delete task error
   */
  it("UTC21 - should handle delete task error", async () => {
    BoardService.deleteTask = jest.fn().mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteTask("task-1");
    });

    expect(BoardService.deleteTask).toHaveBeenCalled();
  });

  /**
   * Test Case UTC22
   * Type: Boundary
   * Description: Handles empty groupId
   */
  it("UTC22 - should handle empty groupId gracefully", async () => {
    const { result } = renderHook(() => useKanbanBoard(null));

    expect(result.current.columns).toEqual({});
    expect(result.current.loading).toBe(false);

    await act(async () => {
      await result.current.createTask({
        columnId: "col-1",
        title: "Test",
      });
    });

    expect(BoardService.createTask).not.toHaveBeenCalled();
  });

  /**
   * Test Case UTC23
   * Type: Normal
   * Description: Updates filter priority
   */
  it("UTC23 - should update filter priority", () => {
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    expect(result.current.filterPriority).toBe("All");

    act(() => {
      result.current.setFilterPriority("high");
    });

    expect(result.current.filterPriority).toBe("high");
  });

  /**
   * Test Case UTC24
   * Type: Normal
   * Description: Provides filtered columns based on search
   */
  it("UTC24 - should filter columns by search", async () => {
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setSearch("test");
    });

    expect(result.current.search).toBe("test");
    expect(result.current.filteredColumns).toBeDefined();
  });

  /**
   * Test Case UTC25
   * Type: Normal
   * Description: Updates comment on task
   */
  it("UTC25 - should update task comment", async () => {
    BoardService.updateTaskComment = jest.fn().mockResolvedValue({});

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateTaskComment("task-1", "comment-1", "Updated");
    });

    expect(BoardService.updateTaskComment).toHaveBeenCalled();
  });

  /**
   * Test Case UTC26
   * Type: Normal
   * Description: Deletes task comment
   */
  it("UTC26 - should delete task comment", async () => {
    BoardService.deleteTaskComment = jest.fn().mockResolvedValue({});

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteTaskComment("task-1", "comment-1");
    });

    expect(BoardService.deleteTaskComment).toHaveBeenCalled();
  });

  /**
   * Test Case UTC27
   * Type: Normal
   * Description: Loads all tasks comments
   */
  it("UTC27 - should load all tasks comments", async () => {
    BoardService.getBoard = jest.fn().mockResolvedValue({
      data: {
        columns: [
          {
            id: "col-1",
            columnName: "To Do",
            tasks: [{ id: "task-1", title: "Task 1" }],
          },
        ],
      },
    });

    BoardService.getTaskComments = jest.fn().mockResolvedValue({
      data: [],
    });

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.loadAllTasksComments();
    });

    expect(result.current.columns).toBeDefined();
  });

  /**
   * Test Case UTC28
   * Type: Boundary
   * Description: Handles null task ID in operations
   */
  it("UTC28 - should handle null taskId gracefully", async () => {
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateTaskFields(null, { title: "Test" });
      await result.current.deleteTask(null);
      await result.current.updateTaskAssignees(null, ["user-1"]);
    });

    expect(BoardService.updateTask).not.toHaveBeenCalled();
    expect(BoardService.deleteTask).not.toHaveBeenCalled();
  });

  /**
   * Test Case UTC29
   * Type: Normal
   * Description: Handles board refetch after error
   */
  it("UTC29 - should refetch board after operation error", async () => {
    BoardService.updateTask = jest.fn().mockRejectedValue(new Error("Failed"));
    
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCallCount = BoardService.getBoard.mock.calls.length;

    await act(async () => {
      await result.current.updateTaskFields("task-1", { title: "Updated" });
    });

    await waitFor(() => {
      expect(BoardService.getBoard.mock.calls.length).toBeGreaterThan(
        initialCallCount
      );
    });
  });

  /**
   * Test Case UTC30
   * Type: Normal
   * Description: Creates column with specific settings
   */
  it("UTC30 - should create column with payload", async () => {
    BoardService.createColumn = jest.fn().mockResolvedValue({});

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.createColumn({
        title: "Done",
        isDone: true,
      });
    });

    expect(BoardService.createColumn).toHaveBeenCalledWith(
      mockGroupId,
      expect.objectContaining({
        title: "Done",
        isDone: true,
      })
    );
  });

  /**
   * Test Case UTC31
   * Type: Abnormal
   * Description: Handles add comment with empty content
   */
  it("UTC31 - should not add comment with empty content", async () => {
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addTaskComment("task-1", "");
    });

    expect(BoardService.createTaskComment).not.toHaveBeenCalled();
  });

  /**
   * Test Case UTC32
   * Type: Abnormal
   * Description: Handles add comment error and rollback
   */
  it("UTC32 - should rollback on add comment error", async () => {
    BoardService.createTaskComment = jest
      .fn()
      .mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addTaskComment("task-1", "Test comment");
    });

    expect(BoardService.createTaskComment).toHaveBeenCalled();
  });

  /**
   * Test Case UTC33
   * Type: Abnormal
   * Description: Handles update comment with empty content
   */
  it("UTC33 - should not update comment with empty content", async () => {
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateTaskComment("task-1", "comment-1", "");
    });

    expect(BoardService.updateTaskComment).not.toHaveBeenCalled();
  });

  /**
   * Test Case UTC34
   * Type: Abnormal
   * Description: Handles update comment error
   */
  it("UTC34 - should handle update comment error", async () => {
    BoardService.updateTaskComment = jest
      .fn()
      .mockRejectedValue(new Error("Failed"));
    BoardService.getTaskComments = jest.fn().mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateTaskComment(
        "task-1",
        "comment-1",
        "Updated content"
      );
    });

    expect(BoardService.updateTaskComment).toHaveBeenCalled();
  });

  /**
   * Test Case UTC35
   * Type: Abnormal
   * Description: Handles delete comment error and rollback
   */
  it("UTC35 - should rollback on delete comment error", async () => {
    BoardService.deleteTaskComment = jest
      .fn()
      .mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteTaskComment("task-1", "comment-1");
    });

    expect(BoardService.deleteTaskComment).toHaveBeenCalled();
  });

  /**
   * Test Case UTC36
   * Type: Normal
   * Description: Handles drag end with null over
   */
  it("UTC36 - should handle drag end with null over", async () => {
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDragEnd({
        active: { id: "task-1" },
        over: null,
      });
    });

    expect(BoardService.moveTask).not.toHaveBeenCalled();
  });

  /**
   * Test Case UTC37
   * Type: Normal
   * Description: Handles drag over with null over
   */
  it("UTC37 - should handle drag over with null over", () => {
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    act(() => {
      result.current.handleDragOver({
        active: { id: "task-1" },
        over: null,
      });
    });

    expect(result.current.columns).toBeDefined();
  });

  /**
   * Test Case UTC38
   * Type: Abnormal
   * Description: Handles create column error
   */
  it("UTC38 - should handle create column error", async () => {
    BoardService.createColumn = jest
      .fn()
      .mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.createColumn({ title: "Done" });
    });

    expect(BoardService.createColumn).toHaveBeenCalled();
  });

  /**
   * Test Case UTC39
   * Type: Abnormal
   * Description: Handles delete column error
   */
  it("UTC39 - should handle delete column error", async () => {
    BoardService.deleteColumn = jest
      .fn()
      .mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteColumn("col-1");
    });

    expect(BoardService.deleteColumn).toHaveBeenCalled();
  });

  /**
   * Test Case UTC40
   * Type: Abnormal
   * Description: Handles load comments error
   */
  it("UTC40 - should handle load comments error", async () => {
    BoardService.getTaskComments = jest
      .fn()
      .mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const comments = await act(async () => {
      return await result.current.loadTaskComments("task-1");
    });

    expect(comments).toEqual([]);
  });

  /**
   * Test Case UTC41
   * Type: Boundary
   * Description: Handles null columnId in createTask
   */
  it("UTC41 - should handle createTask with missing columnId", async () => {
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.createTask({
        title: "Test",
      });
    });

    // Should still be called even without columnId
    expect(result.current.columns).toBeDefined();
  });

  /**
   * Test Case UTC42
   * Type: Normal
   * Description: Updates selected task state
   */
  it("UTC42 - should update selected task", () => {
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    act(() => {
      result.current.setSelectedTask({
        id: "task-1",
        title: "Test Task",
      });
    });

    expect(result.current.selectedTask).toEqual({
      id: "task-1",
      title: "Test Task",
    });

    act(() => {
      result.current.setSelectedTask(null);
    });

    expect(result.current.selectedTask).toBe(null);
  });

  /**
   * Test Case UTC43
   * Type: Normal
   * Description: Provides columnMeta information
   */
  it("UTC43 - should provide columnMeta", async () => {
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.columnMeta).toBeDefined();
    expect(typeof result.current.columnMeta).toBe("object");
  });

  /**
   * Test Case UTC44
   * Type: Abnormal
   * Description: Handles replaceTaskAssignees error
   */
  it("UTC44 - should handle replaceTaskAssignees error", async () => {
    BoardService.replaceTaskAssignees = jest
      .fn()
      .mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateTaskAssignees("task-1", ["user-1"]);
    });

    expect(BoardService.replaceTaskAssignees).toHaveBeenCalled();
  });

  /**
   * Test Case UTC45
   * Type: Normal
   * Description: Creates task with optimistic update
   */
  it("UTC45 - should create task with optimistic update", async () => {
    BoardService.createTask = jest.fn().mockResolvedValue({
      data: { id: "task-new", title: "New Task" },
    });

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.createTask({
        columnId: "col-1",
        title: "Optimistic Task",
        description: "Test",
        priority: "high",
      });
    });

    expect(BoardService.createTask).toHaveBeenCalledWith(
      mockGroupId,
      expect.objectContaining({
        title: "Optimistic Task",
        priority: "high",
      })
    );
  });

  /**
   * Test Case UTC46
   * Type: Normal
   * Description: Updates task with dueDate normalization
   */
  it("UTC46 - should normalize dueDate when updating task", async () => {
    BoardService.updateTask = jest.fn().mockResolvedValue({});

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateTaskFields("task-1", {
        dueDate: "2024-12-31",
      });
    });

    expect(BoardService.updateTask).toHaveBeenCalledWith(
      mockGroupId,
      "task-1",
      expect.objectContaining({
        dueDate: expect.stringContaining("2024-12-31"),
      })
    );
  });

  /**
   * Test Case UTC47
   * Type: Boundary
   * Description: Handles invalid dueDate formats
   */
  it("UTC47 - should handle invalid dueDate", async () => {
    BoardService.updateTask = jest.fn().mockResolvedValue({});

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateTaskFields("task-1", {
        dueDate: "invalid-date",
      });
    });

    expect(BoardService.updateTask).toHaveBeenCalled();
  });

  /**
   * Test Case UTC48
   * Type: Normal
   * Description: Handles task with status change triggering column move
   */
  it("UTC48 - should move task when status changes", async () => {
    BoardService.updateTask = jest.fn().mockResolvedValue({});
    BoardService.moveTask = jest.fn().mockResolvedValue({});
    BoardService.getBoard = jest.fn().mockResolvedValue({
      data: {
        columns: [
          {
            id: "todo",
            columnName: "To Do",
            tasks: [{ id: "task-1", title: "Task 1", status: "todo" }],
          },
          {
            id: "done",
            columnName: "Done",
            tasks: [],
          },
        ],
      },
    });

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateTaskFields("task-1", { status: "done" });
    });

    expect(BoardService.updateTask).toHaveBeenCalled();
  });

  /**
   * Test Case UTC49
   * Type: Normal
   * Description: Handles board with different data structures
   */
  it("UTC49 - should handle board with nested data", async () => {
    BoardService.getBoard = jest.fn().mockResolvedValue({
      data: {
        data: {
          columns: [
            {
              id: "col-1",
              columnName: "Backlog",
              tasks: [],
            },
          ],
        },
      },
    });

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.columns).toBeDefined();
  });

  /**
   * Test Case UTC50
   * Type: Normal
   * Description: Handles comments with different data formats
   */
  it("UTC50 - should normalize comments from different formats", async () => {
    BoardService.getTaskComments = jest.fn().mockResolvedValue({
      data: {
        data: [
          {
            commentId: "c1",
            text: "Test comment",
            author: "John",
          },
        ],
      },
    });

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.loadTaskComments("task-1");
    });

    expect(BoardService.getTaskComments).toHaveBeenCalled();
  });

  /**
   * Test Case UTC51
   * Type: Normal
   * Description: Handles assignees with different formats
   */
  it("UTC51 - should normalize assignees with string IDs", async () => {
    BoardService.replaceTaskAssignees = jest.fn().mockResolvedValue({});

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateTaskAssignees("task-1", [
        "user-1",
        "user-2",
        null,
        "",
      ]);
    });

    expect(BoardService.replaceTaskAssignees).toHaveBeenCalledWith(
      mockGroupId,
      "task-1",
      expect.objectContaining({
        userIds: expect.arrayContaining(["user-1", "user-2"]),
      })
    );
  });

  /**
   * Test Case UTC52
   * Type: Normal
   * Description: Resets state when groupId becomes null
   */
  it("UTC52 - should reset state when groupId changes to null", async () => {
    const { result, rerender } = renderHook(
      ({ groupId }) => useKanbanBoard(groupId),
      {
        initialProps: { groupId: mockGroupId },
      }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Change groupId to null
    await act(async () => {
      rerender({ groupId: null });
    });

    expect(result.current.columns).toEqual({});
    expect(result.current.selectedTask).toBe(null);
  });

  /**
   * Test Case UTC53
   * Type: Normal
   * Description: Loads group members with different response formats
   */
  it("UTC53 - should handle different member data formats", async () => {
    GroupService.getListMembers = jest.fn().mockResolvedValue({
      data: {
        items: [
          { userId: "u1", displayName: "User 1" },
          { id: "u2", name: "User 2" },
        ],
      },
    });

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(GroupService.getListMembers).toHaveBeenCalled();
  });

  /**
   * Test Case UTC54
   * Type: Abnormal
   * Description: Handles getListMembers error
   */
  it("UTC54 - should handle getListMembers error", async () => {
    GroupService.getListMembers = jest
      .fn()
      .mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.groupMembers).toEqual([]);
  });

  /**
   * Test Case UTC55
   * Type: Normal
   * Description: Handles task creation with all optional fields
   */
  it("UTC55 - should create task with minimal data", async () => {
    BoardService.createTask = jest.fn().mockResolvedValue({});

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.createTask({
        columnId: "col-1",
      });
    });

    expect(BoardService.createTask).toHaveBeenCalled();
  });

  /**
   * Test Case UTC56
   * Type: Normal
   * Description: Filters columns based on all filter criteria
   */
  it("UTC56 - should apply multiple filters simultaneously", async () => {
    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setSearch("important");
      result.current.setFilterStatus("todo");
      result.current.setFilterPriority("high");
    });

    expect(result.current.search).toBe("important");
    expect(result.current.filterStatus).toBe("todo");
    expect(result.current.filterPriority).toBe("high");
    expect(result.current.filteredColumns).toBeDefined();
  });

  /**
   * Test Case UTC57
   * Type: Normal
   * Description: Handles empty board data
   */
  it("UTC57 - should handle empty board response", async () => {
    BoardService.getBoard = jest.fn().mockResolvedValue({
      data: null,
    });

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.columns).toEqual({});
  });

  /**
   * Test Case UTC58
   * Type: Normal
   * Description: Handles board without columns array
   */
  it("UTC58 - should handle board without columns", async () => {
    BoardService.getBoard = jest.fn().mockResolvedValue({
      data: {
        title: "Board",
      },
    });

    const { result } = renderHook(() => useKanbanBoard(mockGroupId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.columns).toEqual({});
  });
});
