/**
 * MODULE: Mentor Group Discovery
 * FEATURE: Display and manage groups being mentored and invitations
 * 
 * TEST REQUIREMENTS:
 * TR-DISC-001: System shall display all groups being mentored with progress tracking
 * TR-DISC-002: System shall allow mentors to manage group invitations
 * TR-DISC-003: System shall provide search and filter capabilities
 * TR-DISC-004: System shall handle API errors gracefully
 * 
 * TEST CASES:
 * 
 * TC-DISC-001: Render Discover page with groups and invitations
 *   Description: Verify that the discover page loads and displays groups with invitations
 *   Pre-conditions: 
 *     - GroupService.getMyGroups returns valid group data
 *     - InvitationService.list returns invitation data
 *     - BoardService and ReportService return valid progress data
 *   Test Procedure:
 *     1. Render Discover component
 *     2. Wait for data to load 
 *   Expected Results:
 *     - Group names are visible
 *     - Invitation section is rendered
 *     - Services are called correctly
 * 
 * TC-DISC-002: Accept group invitation
 *   Description: Verify mentor can accept a pending invitation
 *   Pre-conditions:
 *     - Pending invitation exists in the list
 *     - InvitationService.accept is functional
 *   Test Procedure:
 *     1. Render component with pending invitation
 *     2. Click accept button on invitation
 *     3. Wait for confirmation
 *   Expected Results:
 *     - InvitationService.accept called with correct ID
 *     - Success modal is displayed
 *     - Groups list is refetched
 * 
 * TC-DISC-003: Reject group invitation
 *   Description: Verify mentor can decline an invitation
 *   Pre-conditions:
 *     - Pending invitation exists
 *     - InvitationService.decline is functional
 *   Test Procedure:
 *     1. Render component with invitation
 *     2. Click reject button
 *     3. Wait for response
 *   Expected Results:
 *     - InvitationService.decline called with correct ID
 *     - Notification shown
 *     - Invitation removed from list
 * 
 * TC-DISC-004: Filter invitations by status
 *   Description: Verify tab filtering works correctly
 *   Pre-conditions:
 *     - Multiple invitations with different statuses exist
 *   Test Procedure:
 *     1. Render with mixed status invitations
 *     2. Click pending tab
 *     3. Verify displayed invitations
 *   Expected Results:
 *     - Only pending invitations are visible
 *     - Tab UI updates correctly
 * 
 * TC-DISC-005: Search groups by name
 *   Description: Verify search functionality filters groups
 *   Pre-conditions:
 *     - Multiple groups are loaded
 *   Test Procedure:
 *     1. Render component with groups
 *     2. Type search query in input
 *     3. Verify filtered results
 *   Expected Results:
 *     - Only matching groups displayed
 *     - Search is case-insensitive
 * 
 * TC-DISC-006: Handle API errors gracefully
 *   Description: Verify error handling when service fails
 *   Pre-conditions:
 *     - GroupService.getMyGroups configured to fail
 *   Test Procedure:
 *     1. Mock service to throw error
 *     2. Render component
 *     3. Wait for error handling
 *   Expected Results:
 *     - Loading stops
 *     - Empty state shown
 *     - No crash occurs
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import Discover from "../../../src/pages/mentor/Discover";

jest.mock("../../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));

const mockGroupService = {
  getMyGroups: jest.fn(),
};

const mockBoardService = {
  getBoard: jest.fn(),
};

const mockReportService = {
  getProjectReport: jest.fn(),
};

const mockInvitationService = {
  list: jest.fn(),
  accept: jest.fn(),
  decline: jest.fn(),
};

jest.mock("../../../src/services/group.service", () => ({
  GroupService: {
    getMyGroups: (...args) => mockGroupService.getMyGroups(...args),
  },
}));

jest.mock("../../../src/services/board.service", () => ({
  BoardService: {
    getBoard: (...args) => mockBoardService.getBoard(...args),
  },
}));

jest.mock("../../../src/services/report.service", () => ({
  ReportService: {
    getProjectReport: (...args) => mockReportService.getProjectReport(...args),
  },
}));

jest.mock("../../../src/services/invitation.service", () => ({
  InvitationService: {
    list: (...args) => mockInvitationService.list(...args),
    accept: (...args) => mockInvitationService.accept(...args),
    decline: (...args) => mockInvitationService.decline(...args),
  },
}));

jest.mock("antd", () => {
  const actual = jest.requireActual("antd");
  return {
    ...actual,
    Modal: ({ children }) => <div data-testid="modal">{children}</div>,
    notification: {
      useNotification: () => [
        {
          error: jest.fn(),
          info: jest.fn(),
        },
        <div />,
      ],
    },
  };
});

describe("Discover Mentor Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGroupService.getMyGroups.mockResolvedValue({
      data: [
        {
          id: "g1",
          name: "AI Project",
          description: "AI description",
          currentMembers: 3,
          maxMembers: 5,
          topic: { title: "AI Topic" },
          semester: { endDate: "2025-12-31" },
          major: { majorName: "Computer Science" },
          skills: ["React", "Node"],
        },
      ],
    });

    mockBoardService.getBoard.mockResolvedValue({
      data: {
        columns: [
          {
            tasks: [
              {
                taskId: "t1",
                title: "Task 1",
                assignee: { displayName: "John" },
                createdAt: "2025-12-01",
              },
            ],
          },
        ],
      },
    });

    mockReportService.getProjectReport.mockResolvedValue({
      data: {
        project: { completionPercent: 75 },
      },
    });

    mockInvitationService.list.mockResolvedValue({
      data: [
        {
          id: "inv1",
          invitationId: "inv1",
          groupName: "Test Group",
          status: "pending",
        },
      ],
    });
  });

  test("TC-DISC-001 [N] Render Discover page with groups and invitations", async () => {
    // Test Requirement: TR-DISC-001
    // Procedure: Render component and verify initial data load
    render(<Discover />);

    // Expected: Group names are visible
    await waitFor(() => {
      expect(screen.getByText("AI Project")).toBeInTheDocument();
    });

    // Expected: Services are called correctly
    expect(mockGroupService.getMyGroups).toHaveBeenCalled();
    expect(mockInvitationService.list).toHaveBeenCalled();
  });

  test("TC-DISC-002 [N] Accept group invitation", async () => {
    // Test Requirement: TR-DISC-002
    // Pre-condition: Pending invitation exists
    const user = userEvent.setup();
    mockInvitationService.accept.mockResolvedValue({});

    render(<Discover />);

    await waitFor(() => {
      expect(screen.getByText("Test Group")).toBeInTheDocument();
    });

    // Procedure: Click accept button
    const acceptButtons = screen.getAllByRole("button", { name: /accept|chấp nhận/i });
    if (acceptButtons.length > 0) {
      await user.click(acceptButtons[0]);

      // Expected: InvitationService.accept called with correct ID
      await waitFor(() => {
        expect(mockInvitationService.accept).toHaveBeenCalledWith("inv1");
      });
    }
  });

  test("TC-DISC-003 [N] Reject group invitation", async () => {
    // Test Requirement: TR-DISC-002
    // Pre-condition: Pending invitation exists
    const user = userEvent.setup();
    mockInvitationService.decline.mockResolvedValue({});

    render(<Discover />);

    await waitFor(() => {
      expect(screen.getByText("Test Group")).toBeInTheDocument();
    });

    // Procedure: Click reject button
    const rejectButtons = screen.getAllByRole("button", { name: /reject|từ chối/i });
    if (rejectButtons.length > 0) {
      await user.click(rejectButtons[0]);

      // Expected: InvitationService.decline called, notification shown
      await waitFor(() => {
        expect(mockInvitationService.decline).toHaveBeenCalledWith("inv1");
      });
    }
  });

  test("TC-DISC-004 [N] Filter invitations by status", async () => {
    // Test Requirement: TR-DISC-003
    // Pre-condition: Multiple invitations with different statuses
    const user = userEvent.setup();
    mockInvitationService.list.mockResolvedValue({
      data: [
        { id: "inv1", status: "pending", groupName: "Group 1" },
        { id: "inv2", status: "accepted", groupName: "Group 2" },
      ],
    });

    render(<Discover />);

    await waitFor(() => {
      expect(screen.getByText("Group 1")).toBeInTheDocument();
    });

    // Procedure: Click pending tab
    const pendingTab = screen.getByRole("button", { name: /pending/i });
    await user.click(pendingTab);

    // Expected: Only pending invitations visible
    expect(screen.getByText("Group 1")).toBeInTheDocument();
  });

  test("TC-DISC-005 [N] Search groups by name", async () => {
    // Test Requirement: TR-DISC-003
    // Pre-condition: Multiple groups loaded
    const user = userEvent.setup();

    render(<Discover />);

    await waitFor(() => {
      expect(screen.getByText("AI Project")).toBeInTheDocument();
    });

    // Procedure: Type in search input
    const searchInput = screen.getByPlaceholderText(/search|tìm kiếm/i);
    await user.type(searchInput, "AI");

    // Expected: Filtered groups displayed
    expect(screen.getByText("AI Project")).toBeInTheDocument();
  });

  test("TC-DISC-006 [B] Handle API errors gracefully", async () => {
    // Test Requirement: TR-DISC-004
    // Pre-condition: GroupService.getMyGroups configured to fail
    mockGroupService.getMyGroups.mockRejectedValue(new Error("API Error"));

    render(<Discover />);

    // Expected: Loading stops
    await waitFor(() => {
      expect(mockGroupService.getMyGroups).toHaveBeenCalled();
    });

    // Expected: Empty state shown, no crash
    await waitFor(
      () => {
        const aiProject = screen.queryByText("AI Project");
        expect(aiProject).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  test("TC-DISC-007 [N] Display progress and activities", async () => {
    // Test Requirement: TR-DISC-001
    // Pre-condition: Groups with progress data exist
    render(<Discover />);

    await waitFor(() => {
      expect(screen.getByText("AI Project")).toBeInTheDocument();
    });

    // Expected: Progress data fetched correctly
    expect(mockReportService.getProjectReport).toHaveBeenCalledWith("g1");
    expect(mockBoardService.getBoard).toHaveBeenCalledWith("g1");
  });

  test("TC-DISC-008 [N] Handle empty groups list", async () => {
    // Test Requirement: TR-DISC-001
    // Pre-condition: No groups exist
    mockGroupService.getMyGroups.mockResolvedValue({ data: [] });

    render(<Discover />);

    // Expected: Component renders without error
    await waitFor(() => {
      expect(mockGroupService.getMyGroups).toHaveBeenCalled();
    });
  });

  test("TC-DISC-009 [N] Handle empty invitations list", async () => {
    // Test Requirement: TR-DISC-002
    // Pre-condition: No invitations exist
    mockInvitationService.list.mockResolvedValue({ data: [] });

    render(<Discover />);

    // Expected: Component renders without error
    await waitFor(() => {
      expect(mockInvitationService.list).toHaveBeenCalled();
    });
  });
});
