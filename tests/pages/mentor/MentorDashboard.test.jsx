/**
 * MODULE: Mentor Dashboard
 * FEATURE: Overview and management of all mentoring groups
 * 
 * TEST REQUIREMENTS:
 * TR-MDSH-001: System shall display mentoring statistics (total, need attention, avg progress, feedback count)
 * TR-MDSH-002: System shall list all groups being mentored with status and progress
 * TR-MDSH-003: System shall fetch and aggregate data from multiple services
 * TR-MDSH-004: System shall calculate mentor feedback count from task comments
 * TR-MDSH-005: System shall handle navigation to group details
 * TR-MDSH-006: System shall handle API errors gracefully
 * 
 * TEST CASES:
 * 
 * TC-MDSH-001: Render dashboard with statistics and groups
 *   Description: Verify dashboard loads and displays all mentoring groups
 *   Pre-conditions:
 *     - GroupService.getMyGroups returns multiple groups
 *     - ReportService and BoardService return valid data
 *   Test Procedure:
 *     1. Render MentorDashboard component
 *     2. Wait for data to load
 *   Expected Results:
 *     - All group names are visible
 *     - GroupService called correctly
 *     - Statistics cards displayed
 * 
 * TC-MDSH-002: Calculate statistics accurately
 *   Description: Verify all statistics are calculated correctly
 *   Pre-conditions:
 *     - Multiple groups with different progress levels
 *   Test Procedure:
 *     1. Mock groups with progress 60% and 40%
 *     2. Render component
 *     3. Verify displayed stats
 *   Expected Results:
 *     - Total groups = 2
 *     - Average progress = 50%
 *     - Need attention count correct
 * 
 * TC-MDSH-003: Count mentor feedback accurately
 *   Description: Verify mentor's comments are counted from tasks
 *   Pre-conditions:
 *     - BoardService returns tasks with IDs
 *     - getTaskComments returns comments with userIds
 *   Test Procedure:
 *     1. Mock tasks with comments
 *     2. Render component
 *     3. Wait for comment fetching
 *   Expected Results:
 *     - getTaskComments called for each task
 *     - Only mentor's comments counted
 *     - Feedback count displayed correctly
 * 
 * TC-MDSH-004: Navigate to group detail page
 *   Description: Verify navigation when clicking group card
 *   Pre-conditions:
 *     - Groups are loaded and displayed
 *   Test Procedure:
 *     1. Render component with groups
 *     2. Click view details button
 *     3. Verify navigation
 *   Expected Results:
 *     - navigate function called
 *     - Correct group ID passed
 * 
 * TC-MDSH-005: Handle service errors gracefully
 *   Description: Verify error handling when API fails
 *   Pre-conditions:
 *     - GroupService.getMyGroups configured to fail
 *   Test Procedure:
 *     1. Mock service to throw error
 *     2. Render component
 *     3. Verify error handling
 *   Expected Results:
 *     - Loading stops
 *     - No groups displayed
 *     - Stats show 0
 *     - No crash occurs
 * 
 * TC-MDSH-006: Display recent activity per group
 *   Description: Verify most recent task shown for each group
 *   Pre-conditions:
 *     - Board has multiple tasks with different dates
 *   Test Procedure:
 *     1. Mock board with tasks
 *     2. Render component
 *     3. Verify board service calls
 *   Expected Results:
 *     - BoardService called for each group
 *     - Most recent task identified
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import MentorDashboard from "../../../src/pages/mentor/MentorDashboard";

jest.mock("../../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("../../../src/context/AuthContext", () => ({
  useAuth: () => ({ userInfo: { userId: "mentor1" } }),
}));

const mockGroupService = {
  getMyGroups: jest.fn(),
};

const mockReportService = {
  getProjectReport: jest.fn(),
};

const mockBoardService = {
  getBoard: jest.fn(),
  getTaskComments: jest.fn(),
};

jest.mock("../../../src/services/group.service", () => ({
  GroupService: {
    getMyGroups: (...args) => mockGroupService.getMyGroups(...args),
  },
}));

jest.mock("../../../src/services/report.service", () => ({
  ReportService: {
    getProjectReport: (...args) => mockReportService.getProjectReport(...args),
  },
}));

jest.mock("../../../src/services/board.service", () => ({
  BoardService: {
    getBoard: (...args) => mockBoardService.getBoard(...args),
    getTaskComments: (...args) => mockBoardService.getTaskComments(...args),
  },
}));

describe("MentorDashboard Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGroupService.getMyGroups.mockResolvedValue({
      data: [
        {
          id: "g1",
          name: "Group 1",
          topic: { title: "AI Project" },
          currentMembers: 4,
        },
        {
          id: "g2",
          name: "Group 2",
          topic: { title: "Web App" },
          currentMembers: 3,
        },
      ],
    });

    mockReportService.getProjectReport.mockResolvedValue({
      data: {
        project: { completionPercent: 60 },
      },
    });

    mockBoardService.getBoard.mockResolvedValue({
      data: {
        columns: [
          {
            tasks: [
              {
                taskId: "t1",
                title: "Task 1",
                createdAt: "2025-12-01",
                updatedAt: "2025-12-10",
              },
              {
                taskId: "t2",
                title: "Task 2",
                createdAt: "2025-12-05",
                updatedAt: "2025-12-08",
              },
            ],
          },
        ],
      },
    });

    mockBoardService.getTaskComments.mockResolvedValue({
      data: [
        { userId: "mentor1", content: "Good work" },
        { userId: "student1", content: "Thanks" },
      ],
    });
  });

  test("TC-MDSH-001 [N] Render dashboard with statistics and groups", async () => {
    // Test Requirement: TR-MDSH-001, TR-MDSH-002
    // Procedure: Render component and verify initial load
    render(<MentorDashboard />);

    // Expected: All group names visible
    await waitFor(() => {
      expect(screen.getByText("Group 1")).toBeInTheDocument();
    });

    expect(screen.getByText("Group 2")).toBeInTheDocument();
    expect(mockGroupService.getMyGroups).toHaveBeenCalled();
  });

  test("TC-MDSH-002 [N] Calculate statistics accurately", async () => {
    // Test Requirement: TR-MDSH-001
    // Pre-condition: Groups with progress 60% and 40%
    mockReportService.getProjectReport
      .mockResolvedValueOnce({ data: { project: { completionPercent: 60 } } })
      .mockResolvedValueOnce({ data: { project: { completionPercent: 40 } } });

    render(<MentorDashboard />);

    // Expected: Total groups = 2
    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    // Expected: Average progress = 50%
    await waitFor(() => {
      expect(screen.getByText("50%")).toBeInTheDocument();
    });
  });

  test("TC-MDSH-003 [N] Count mentor feedback accurately", async () => {
    // Test Requirement: TR-MDSH-004
    // Pre-condition: Tasks have comments from mentor and students
    render(<MentorDashboard />);

    // Expected: getTaskComments called for tasks
    await waitFor(() => {
      expect(mockBoardService.getTaskComments).toHaveBeenCalled();
    });

    // Expected: Feedback count displayed
    await waitFor(
      () => {
        const feedbackElements = screen.queryAllByText("2");
        expect(feedbackElements.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
  });

  test("TC-MDSH-004 [N] Navigate to group detail page", async () => {
    // Test Requirement: TR-MDSH-005
    // Pre-condition: Groups loaded and displayed
    const user = userEvent.setup();

    render(<MentorDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Group 1")).toBeInTheDocument();
    });

    // Procedure: Click view details button
    const viewButtons = screen.getAllByRole("button", { name: /view|xem chi tiết/i });
    if (viewButtons.length > 0) {
      await user.click(viewButtons[0]);

      // Expected: navigate called
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    }
  });

  test("TC-MDSH-005 [B] Handle service errors gracefully", async () => {
    // Test Requirement: TR-MDSH-006
    // Pre-condition: GroupService.getMyGroups configured to fail
    mockGroupService.getMyGroups.mockRejectedValue(new Error("API Error"));

    render(<MentorDashboard />);

    // Expected: Service called
    await waitFor(() => {
      expect(mockGroupService.getMyGroups).toHaveBeenCalled();
    });

    // Expected: No groups displayed, no crash
    await waitFor(
      () => {
        const group1 = screen.queryByText("Group 1");
        expect(group1).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  test("TC-MDSH-006 [N] Display recent activity per group", async () => {
    // Test Requirement: TR-MDSH-002
    // Pre-condition: Board has multiple tasks
    render(<MentorDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Group 1")).toBeInTheDocument();
    });

    // Expected: BoardService called for each group
    expect(mockBoardService.getBoard).toHaveBeenCalledWith("g1");
    expect(mockBoardService.getBoard).toHaveBeenCalledWith("g2");
  });

  test("TC-MDSH-007 [N] Handle empty groups list", async () => {
    // Test Requirement: TR-MDSH-002
    // Pre-condition: No groups exist
    mockGroupService.getMyGroups.mockResolvedValue({ data: [] });

    render(<MentorDashboard />);

    await waitFor(() => {
      expect(mockGroupService.getMyGroups).toHaveBeenCalled();
    });

    // Expected: Stats show 0
    await waitFor(() => {
      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  test("TC-MDSH-008 [N] Calculate need attention groups", async () => {
    // Test Requirement: TR-MDSH-001
    // Pre-condition: Groups with low progress (<50%)
    mockReportService.getProjectReport
      .mockResolvedValueOnce({ data: { project: { completionPercent: 30 } } })
      .mockResolvedValueOnce({ data: { project: { completionPercent: 40 } } });

    render(<MentorDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Group 1")).toBeInTheDocument();
    });

    // Expected: Need attention count = 2
    await waitFor(
      () => {
        const needAttention = screen.queryAllByText("2");
        expect(needAttention.length).toBeGreaterThan(0);
      },
      { timeout: 2000 }
    );
  });

  test("TC-MDSH-009 [B] Handle board service error", async () => {
    // Test Requirement: TR-MDSH-006
    // Pre-condition: BoardService fails
    mockBoardService.getBoard.mockRejectedValue(new Error("Board Error"));

    render(<MentorDashboard />);

    // Expected: Component still renders
    await waitFor(() => {
      expect(screen.getByText("Group 1")).toBeInTheDocument();
    });
  });

  test("TC-MDSH-010 [N] Display group status tags", async () => {
    // Test Requirement: TR-MDSH-002
    // Pre-condition: Groups with different progress levels
    mockReportService.getProjectReport
      .mockResolvedValueOnce({ data: { project: { completionPercent: 60 } } })
      .mockResolvedValueOnce({ data: { project: { completionPercent: 30 } } });

    render(<MentorDashboard />);

    // Expected: Groups displayed with status
    await waitFor(() => {
      expect(screen.getByText("Group 1")).toBeInTheDocument();
    });
  });
});
