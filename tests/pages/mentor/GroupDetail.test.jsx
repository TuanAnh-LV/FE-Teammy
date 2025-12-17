/**
 * MODULE: Mentor Group Detail View
 * FEATURE: View and monitor group progress in read-only mode
 * 
 * TEST REQUIREMENTS:
 * TR-GDTL-001: System shall display group details and information
 * TR-GDTL-002: System shall provide tabbed navigation (Overview, Workspace)
 * TR-GDTL-003: System shall display workspace with Kanban, Backlog, Milestones, Reports
 * TR-GDTL-004: System shall enforce read-only mode for mentors
 * TR-GDTL-005: System shall handle loading and error states
 * 
 * TEST CASES:
 * 
 * TC-GDTL-001: Render group detail page with basic information
 *   Description: Verify group detail page loads and displays group information
 *   Pre-conditions:
 *     - GroupService.getGroupDetail returns valid group data
 *     - useKanbanBoard hook provides board data
 *   Test Procedure:
 *     1. Render GroupDetail component with group ID
 *     2. Wait for data to load
 *   Expected Results:
 *     - Group name is displayed in header
 *     - Breadcrumb shows navigation path
 *     - GroupService called with correct ID
 * 
 * TC-GDTL-002: Switch to workspace tab
 *   Description: Verify workspace tab displays correctly
 *   Pre-conditions:
 *     - Component rendered with overview tab active
 *   Test Procedure:
 *     1. Render component
 *     2. Click workspace tab
 *     3. Verify content
 *   Expected Results:
 *     - Workspace tab content is visible
 *     - Kanban view displayed by default
 * 
 * TC-GDTL-003: Navigate workspace sub-tabs
 *   Description: Verify all workspace sub-tabs are accessible
 *   Pre-conditions:
 *     - Workspace tab is active
 *   Test Procedure:
 *     1. Click Kanban tab
 *     2. Click Backlog tab
 *     3. Click Milestones tab
 *     4. Click Reports tab
 *   Expected Results:
 *     - Each tab displays corresponding content
 *     - Tab switching works smoothly
 * 
 * TC-GDTL-004: Verify read-only mode enforcement
 *   Description: Ensure mentors cannot edit workspace
 *   Pre-conditions:
 *     - readOnlyWorkspace flag is true
 *   Test Procedure:
 *     1. Render component
 *     2. Navigate to workspace
 *     3. Verify read-only props
 *   Expected Results:
 *     - All workspace tabs show read-only content
 *     - Edit functions are disabled
 * 
 * TC-GDTL-005: Handle loading state during data fetch
 *   Description: Verify loading spinner displays during fetch
 *   Pre-conditions:
 *     - GroupService has delayed response
 *   Test Procedure:
 *     1. Mock service with delay
 *     2. Render component
 *     3. Check for loading indicator
 *   Expected Results:
 *     - Loading spinner visible initially
 *     - Spinner removed after data loads
 * 
 * TC-GDTL-006: Handle missing group data
 *   Description: Verify fallback when group data is null
 *   Pre-conditions:
 *     - GroupService returns null
 *   Test Procedure:
 *     1. Mock service to return null
 *     2. Render component
 *   Expected Results:
 *     - Fallback group name displayed (Group #ID)
 *     - No crash occurs
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import GroupDetail from "../../../src/pages/mentor/GroupDetail";

jest.mock("react-router-dom", () => ({
  useParams: () => ({ id: "group123" }),
  useNavigate: () => jest.fn(),
}));

jest.mock("../../../src/context/AuthContext", () => ({
  useAuth: () => ({ userInfo: { userId: "user1" } }),
}));

const mockGroupService = {
  getGroupDetail: jest.fn(),
};

jest.mock("../../../src/services/group.service", () => ({
  GroupService: {
    getGroupDetail: (...args) => mockGroupService.getGroupDetail(...args),
  },
}));

const mockUseKanbanBoard = jest.fn();
jest.mock("../../../src/hook/useKanbanBoard", () => ({
  __esModule: true,
  default: (...args) => mockUseKanbanBoard(...args),
}));

jest.mock("../../../src/components/mentor/GroupOverview", () => (props) => (
  <div data-testid="group-overview">Overview {props.groupId}</div>
));

jest.mock("../../../src/components/common/workspace/KanbanTab", () => (props) => (
  <div data-testid="kanban-tab">Kanban {props.readOnly ? "ReadOnly" : "Editable"}</div>
));

jest.mock("../../../src/components/common/workspace/BacklogTab", () => (props) => (
  <div data-testid="backlog-tab">Backlog {props.readOnly ? "ReadOnly" : "Editable"}</div>
));

jest.mock("../../../src/components/common/workspace/MilestonesTab", () => (props) => (
  <div data-testid="milestones-tab">Milestones {props.readOnly ? "ReadOnly" : "Editable"}</div>
));

jest.mock("../../../src/components/common/workspace/ReportsTab", () => (props) => (
  <div data-testid="reports-tab">Reports {props.groupId}</div>
));

jest.mock("../../../src/components/common/kanban/TaskModal", () => (props) => (
  props.task ? <div data-testid="task-modal">Task Modal</div> : null
));

describe("GroupDetail Mentor Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGroupService.getGroupDetail.mockResolvedValue({
      data: {
        id: "group123",
        name: "Test Group",
        description: "Test description",
      },
    });

    mockUseKanbanBoard.mockReturnValue({
      filteredColumns: {
        col1: {
          id: "col1",
          title: "To Do",
          tasks: [],
        },
      },
      columnMeta: {},
      groupMembers: [],
      selectedTask: null,
      setSelectedTask: jest.fn(),
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
    });
  });

  test("TC-GDTL-001 [N] Render group detail page with basic information", async () => {
    // Test Requirement: TR-GDTL-001
    // Procedure: Render component with group ID
    render(<GroupDetail />);

    // Expected: Group name displayed, service called
    await waitFor(() => {
      expect(screen.getByText(/Test Group/i)).toBeInTheDocument();
    });

    expect(mockGroupService.getGroupDetail).toHaveBeenCalledWith("group123");
  });

  test("TC-GDTL-002 [N] Switch to workspace tab", async () => {
    // Test Requirement: TR-GDTL-002
    // Pre-condition: Component rendered with overview tab
    const user = userEvent.setup();

    render(<GroupDetail />);

    await waitFor(() => {
      expect(screen.getByText(/Test Group/i)).toBeInTheDocument();
    });

    // Procedure: Click workspace tab
    const workspaceTab = screen.getByRole("tab", { name: /workspace/i });
    await user.click(workspaceTab);

    // Expected: Workspace content visible
    await waitFor(() => {
      expect(screen.getByTestId("kanban-tab")).toBeInTheDocument();
    });
  });

  test("TC-GDTL-003 [N] Navigate workspace sub-tabs", async () => {
    // Test Requirement: TR-GDTL-003
    // Pre-condition: Workspace tab is active
    const user = userEvent.setup();

    render(<GroupDetail />);

    await waitFor(() => {
      expect(screen.getByText(/Test Group/i)).toBeInTheDocument();
    });

    const workspaceTab = screen.getByRole("tab", { name: /workspace/i });
    await user.click(workspaceTab);

    await waitFor(() => {
      expect(screen.getByTestId("kanban-tab")).toBeInTheDocument();
    });

    // Procedure: Navigate through all sub-tabs
    const backlogButton = screen.getByRole("button", { name: /backlog/i });
    await user.click(backlogButton);

    // Expected: Backlog tab content displayed
    expect(screen.getByTestId("backlog-tab")).toBeInTheDocument();

    const milestonesButton = screen.getByRole("button", { name: /milestones/i });
    await user.click(milestonesButton);

    // Expected: Milestones tab content displayed
    expect(screen.getByTestId("milestones-tab")).toBeInTheDocument();

    const reportsButton = screen.getByRole("button", { name: /reports/i });
    await user.click(reportsButton);

    // Expected: Reports tab content displayed
    expect(screen.getByTestId("reports-tab")).toBeInTheDocument();
  });

  test("TC-GDTL-004 [N] Verify read-only mode enforcement", async () => {
    // Test Requirement: TR-GDTL-004
    // Pre-condition: readOnlyWorkspace flag is true
    render(<GroupDetail />);

    await waitFor(() => {
      expect(screen.getByText(/Test Group/i)).toBeInTheDocument();
    });

    // Procedure: Navigate to workspace tab
    const workspaceTab = screen.getByRole("tab", { name: /workspace/i });
    await userEvent.click(workspaceTab);

    // Expected: Read-only mode is enforced
    await waitFor(() => {
      const kanbanTab = screen.getByTestId("kanban-tab");
      expect(kanbanTab).toHaveTextContent("ReadOnly");
    });
  });

  test("TC-GDTL-005 [B] Handle loading state during data fetch", async () => {
    // Test Requirement: TR-GDTL-005
    // Pre-condition: GroupService has delayed response
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockGroupService.getGroupDetail.mockReturnValue(promise);

    render(<GroupDetail />);

    // Expected: Loading spinner visible
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    resolvePromise({
      data: {
        id: "group123",
        name: "Test Group",
        description: "Test description",
      },
    });

    // Expected: Spinner removed after load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  test("TC-GDTL-006 [B] Handle missing group data", async () => {
    // Test Requirement: TR-GDTL-005
    // Pre-condition: GroupService returns null
    mockGroupService.getGroupDetail.mockResolvedValue({ data: null });

    render(<GroupDetail />);

    await waitFor(() => {
      expect(mockGroupService.getGroupDetail).toHaveBeenCalled();
    });

    // Expected: Fallback name displayed
    expect(screen.getByText(/Group #group123/i)).toBeInTheDocument();
  });

  test("TC-GDTL-007 [N] Display overview tab by default", async () => {
    // Test Requirement: TR-GDTL-002
    // Pre-condition: Component just rendered
    render(<GroupDetail />);

    // Expected: Overview tab visible by default
    await waitFor(() => {
      expect(screen.getByTestId("group-overview")).toBeInTheDocument();
    });
  });

  test("TC-GDTL-008 [N] Kanban board integration", async () => {
    // Test Requirement: TR-GDTL-003
    // Pre-condition: Component rendered
    render(<GroupDetail />);

    // Expected: useKanbanBoard hook called with correct ID
    await waitFor(() => {
      expect(mockUseKanbanBoard).toHaveBeenCalledWith("group123");
    });
  });

  test("TC-GDTL-009 [N] Handle breadcrumb navigation", async () => {
    // Test Requirement: TR-GDTL-001
    // Pre-condition: Component rendered
    const mockNavigate = jest.fn();
    jest.spyOn(require("react-router-dom"), "useNavigate").mockReturnValue(mockNavigate);

    render(<GroupDetail />);

    // Expected: Breadcrumb contains navigation links
    await waitFor(() => {
      expect(screen.getByText(/My Groups/i)).toBeInTheDocument();
    });
  });
});
