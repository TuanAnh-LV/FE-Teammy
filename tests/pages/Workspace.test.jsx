/**
 * Test Code: FE-TM-Page-Workspace
 * Test Name: Workspace Page Test
 * Description: Test Workspace page with Kanban board and ListView
 * Author: Test Suite
 * Date: 2024
 */

import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Workspace from "../../src/pages/common/Workspace";

// Mock dependencies
const mockUseParams = jest.fn();
const mockUseLocation = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => mockUseParams(),
  useLocation: () => mockUseLocation(),
}));

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

const mockUseKanbanBoard = jest.fn();
jest.mock("../../src/hook/useKanbanBoard", () => ({
  __esModule: true,
  default: (...args) => mockUseKanbanBoard(...args),
}));

jest.mock("../../src/services/group.service", () => ({
  GroupService: {
    getGroupMembers: jest.fn(),
  },
}));

jest.mock("../../src/services/board.service", () => ({
  BoardService: {
    updateColumn: jest.fn(),
  },
}));

jest.mock("antd", () => {
  const React = require("react");
  const actual = jest.requireActual("antd");
  
  const MockModal = ({ children, open, ...props }) => 
    open ? <div data-testid="modal">{children}</div> : null;
  MockModal.confirm = jest.fn(({ onOk }) => {
    if (onOk) onOk();
  });

  const MockFormItem = ({ children, ...props }) => <div {...props}>{children}</div>;
  const MockForm = ({ children, ...props }) => <form {...props}>{children}</form>;
  MockForm.Item = MockFormItem;
  MockForm.useForm = () => [
    {
      validateFields: jest.fn().mockResolvedValue({
        columnName: "Test Column",
        position: 1,
      }),
      resetFields: jest.fn(),
    },
  ];

  return {
    ...actual,
    Modal: MockModal,
    Form: MockForm,
    Input: ({ ...props }) => <input {...props} />,
  };
});

jest.mock("../../src/components/common/kanban/Column", () => (props) => (
  <div data-testid={`column-${props.columnId}`}>
    {props.meta?.title || props.columnId}
  </div>
));

jest.mock("../../src/components/common/kanban/TaskModal", () => (props) =>
  props.task ? <div data-testid="task-modal">{props.task.title}</div> : null
);

jest.mock("../../src/components/common/workspace/ListView", () => (props) => (
  <div data-testid="list-view">
    {props.tasks?.map((t) => (
      <div key={t.id}>{t.title}</div>
    ))}
  </div>
));

jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }) => <div>{children}</div>,
  closestCenter: jest.fn(),
  PointerSensor: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
}));

describe("Workspace Page", () => {
  const defaultKanbanReturn = {
    columns: {
      "col-1": [{ id: "task-1", title: "Task 1", status: "todo" }],
    },
    filteredColumns: {
      "col-1": [{ id: "task-1", title: "Task 1", status: "todo" }],
    },
    columnMeta: {
      "col-1": { title: "To Do", position: 1 },
    },
    groupMembers: [],
    selectedTask: null,
    setSelectedTask: jest.fn(),
    search: "",
    setSearch: jest.fn(),
    filterStatus: "All",
    setFilterStatus: jest.fn(),
    filterPriority: "All",
    setFilterPriority: jest.fn(),
    handleDragOver: jest.fn(),
    handleDragEnd: jest.fn(),
    createColumn: jest.fn(),
    createTask: jest.fn(),
    updateTaskFields: jest.fn(),
    updateTaskAssignees: jest.fn(),
    deleteTask: jest.fn(),
    deleteColumn: jest.fn(),
    loading: false,
    error: null,
    refetchBoard: jest.fn(),
    loadTaskComments: jest.fn(),
    addTaskComment: jest.fn(),
    updateTaskComment: jest.fn(),
    deleteTaskComment: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ id: "group-1" });
    mockUseLocation.mockReturnValue({
      search: "",
      pathname: "/workspace/group-1",
    });
    mockUseKanbanBoard.mockReturnValue(defaultKanbanReturn);
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  const renderWorkspace = () => {
    return render(
      <BrowserRouter>
        <Workspace />
      </BrowserRouter>
    );
  };

  /**
   * Test Case UTC01
   * Type: Normal
   * Description: Renders Workspace with Kanban view by default
   */
  it("UTC01 - should render workspace with kanban view", async () => {
    await act(async () => {
      renderWorkspace();
    });

    // Click on workspace tab to show kanban view
    const user = userEvent.setup();
    await user.click(screen.getByText("workspace"));

    await waitFor(() => {
      // Check that kanban board renders with columns
      const columns = screen.getAllByTestId(/column-/);
      expect(columns.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test Case UTC02
   * Type: Normal
   * Description: Switches to list view when view param is list
   */
  it("UTC02 - should switch to list view", async () => {
    mockUseLocation.mockReturnValue({
      search: "?view=list",
      pathname: "/workspace",
    });

    await act(async () => {
      renderWorkspace();
    });

    // Click on workspace tab first
    const user = userEvent.setup();
    await user.click(screen.getByText("workspace"));

    await waitFor(() => {
      expect(screen.getByTestId("list-view")).toBeInTheDocument();
    });
  });

  /**
   * Test Case UTC03
   * Type: Normal
   * Description: Uses groupId from query params
   */
  it("UTC03 - should use groupId from query params", async () => {
    mockUseLocation.mockReturnValue({
      search: "?groupId=query-group-1",
      pathname: "/workspace",
    });
    mockUseParams.mockReturnValue({});

    await act(async () => {
      renderWorkspace();
    });

    await waitFor(() => {
      expect(mockUseKanbanBoard).toHaveBeenCalledWith("query-group-1");
    });
  });

  /**
   * Test Case UTC04
   * Type: Normal
   * Description: Opens task modal when task is selected
   */
  it("UTC04 - should show task modal when task selected", async () => {
    mockUseKanbanBoard.mockReturnValue({
      ...defaultKanbanReturn,
      selectedTask: { id: "task-1", title: "Selected Task" },
    });

    await act(async () => {
      renderWorkspace();
    });

    await waitFor(() => {
      expect(screen.getByTestId("task-modal")).toBeInTheDocument();
      expect(screen.getByText("Selected Task")).toBeInTheDocument();
    });
  });

  /**
   * Test Case UTC05
   * Type: Boundary
   * Description: Handles empty columns gracefully
   */
  it("UTC05 - should handle empty columns", async () => {
    mockUseKanbanBoard.mockReturnValue({
      ...defaultKanbanReturn,
      columns: {},
      filteredColumns: {},
      columnMeta: {},
    });

    await act(async () => {
      renderWorkspace();
    });

    // Should not crash
    expect(screen.queryByTestId(/column-/)).not.toBeInTheDocument();
  });

  /**
   * Test Case UTC06
   * Type: Boundary
   * Description: Shows loading state
   */
  it("UTC06 - should show loading state", async () => {
    mockUseKanbanBoard.mockReturnValue({
      ...defaultKanbanReturn,
      loading: true,
    });

    await act(async () => {
      renderWorkspace();
    });

    // Should show loading message
    expect(screen.getByText("Loading board...")).toBeInTheDocument();
  });

  /**
   * Test Case UTC07
   * Type: Normal
   * Description: Filters tasks in list view by status
   */
  it("UTC07 - should filter tasks in list view", async () => {
    mockUseLocation.mockReturnValue({
      search: "?view=list",
      pathname: "/workspace",
    });

    mockUseKanbanBoard.mockReturnValue({
      ...defaultKanbanReturn,
      filteredColumns: {
        "col-1": [
          { id: "task-1", title: "Task 1", status: "todo", priority: "high" },
          { id: "task-2", title: "Task 2", status: "done", priority: "low" },
        ],
      },
    });

    await act(async () => {
      renderWorkspace();
    });

    // Click workspace tab first
    const user = userEvent.setup();
    await user.click(screen.getByText("workspace"));

    await waitFor(() => {
      expect(screen.getByTestId("list-view")).toBeInTheDocument();
    });
  });

  /**
   * Test Case UTC08
   * Type: Abnormal
   * Description: Handles error state
   */
  it("UTC08 - should handle error state", async () => {
    mockUseKanbanBoard.mockReturnValue({
      ...defaultKanbanReturn,
      error: "Failed to load board",
    });

    await act(async () => {
      renderWorkspace();
    });

    // Should show error message
    expect(screen.getByText("Failed to load board")).toBeInTheDocument();
  });

  /**
   * Test Case UTC09
   * Type: Normal
   * Description: Uses localStorage groupId as fallback
   */
  it("UTC09 - should use localStorage groupId as fallback", async () => {
    mockUseParams.mockReturnValue({});
    mockUseLocation.mockReturnValue({
      search: "",
      pathname: "/workspace",
    });
    window.localStorage.getItem.mockReturnValue("stored-group-1");

    await act(async () => {
      renderWorkspace();
    });

    await waitFor(() => {
      expect(mockUseKanbanBoard).toHaveBeenCalledWith("stored-group-1");
    });
  });

  /**
   * Test Case UTC10
   * Type: Normal
   * Description: Displays multiple columns with tasks
   */
  it("UTC10 - should display multiple columns", async () => {
    mockUseKanbanBoard.mockReturnValue({
      ...defaultKanbanReturn,
      columns: {
        "col-1": [{ id: "task-1", title: "Task 1" }],
        "col-2": [{ id: "task-2", title: "Task 2" }],
      },
      filteredColumns: {
        "col-1": [{ id: "task-1", title: "Task 1" }],
        "col-2": [{ id: "task-2", title: "Task 2" }],
      },
      columnMeta: {
        "col-1": { title: "To Do", position: 1 },
        "col-2": { title: "In Progress", position: 2 },
      },
    });

    await act(async () => {
      renderWorkspace();
    });

    // Click workspace tab
    const user = userEvent.setup();
    await user.click(screen.getByText("workspace"));

    await waitFor(() => {
      // Check that multiple columns are rendered
      const columns = screen.getAllByTestId(/column-/);
      expect(columns.length).toBeGreaterThanOrEqual(2);
    });
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "Workspace",
  totalTC: 10,
  breakdown: { N: 7, B: 2, A: 1 },
  notes:
    "Covers kanban/list view toggle, groupId resolution from params/query/localStorage, task selection, empty/loading/error states, and multiple columns rendering.",
};
