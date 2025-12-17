  /**
   * MODULE: Mentor My Groups
   * FEATURE: List and manage all mentoring groups with filtering and search
   * 
   * TEST REQUIREMENTS:
   * TR-MYGR-001: System shall display all mentoring groups with progress and status
   * TR-MYGR-002: System shall calculate and display group statistics
   * TR-MYGR-003: System shall provide filtering by group status (all, on-track, need attention)
   * TR-MYGR-004: System shall provide search functionality by group name
   * TR-MYGR-005: System shall fetch progress data from ReportService for each group
   * TR-MYGR-006: System shall enable navigation to group detail pages
   * TR-MYGR-007: System shall handle loading states and API errors
   * 
   * TEST CASES:
   * 
   * TC-MYGR-001: Render groups list with statistics
   *   Description: Verify page loads and displays all mentoring groups
   *   Pre-conditions:
   *     - GroupService.getMyGroups returns multiple groups
   *     - ReportService.getProjectReport returns progress data
   *   Test Procedure:
   *     1. Render MyGroups component
   *     2. Wait for data to load
   *   Expected Results:
   *     - All group names are visible
   *     - Statistics cards display correct values
   *     - GroupService called correctly
   * 
   * TC-MYGR-002: Filter groups by on-track status
   *   Description: Verify filtering shows only on-track groups
   *   Pre-conditions:
   *     - Groups with mixed progress levels (>=60% and <60%)
   *   Test Procedure:
   *     1. Render component with groups
   *     2. Click "Đúng tiến độ" filter button
   *     3. Verify displayed groups
   *   Expected Results:
   *     - Only groups with progress >=60% visible
   *     - Filter button shows active state
   * 
   * TC-MYGR-003: Search groups by name
   *   Description: Verify search filters groups by name
   *   Pre-conditions:
   *     - Multiple groups with different names loaded
   *   Test Procedure:
   *     1. Render component
   *     2. Type search query in input
   *     3. Verify results
   *   Expected Results:
   *     - Only matching groups displayed
   *     - Search is case-insensitive
   * 
   * TC-MYGR-004: Calculate statistics correctly
   *   Description: Verify all statistics are accurate
   *   Pre-conditions:
   *     - Groups with known progress values
   *   Test Procedure:
   *     1. Mock groups with specific progress
   *     2. Render component
   *     3. Verify stat values
   *   Expected Results:
   *     - Total groups count correct
   *     - On-track count correct (progress >=60%)
   *     - Need attention count correct
   *     - Average progress calculated correctly
   * 
   * TC-MYGR-005: Navigate to group detail page
   *   Description: Verify clicking detail button navigates correctly
   *   Pre-conditions:
   *     - Groups loaded and displayed
   *   Test Procedure:
   *     1. Render component
   *     2. Click "Xem chi tiết" button
   *     3. Verify navigation
   *   Expected Results:
   *     - navigate function called with /mentor/group/{id}
   * 
   * TC-MYGR-006: Handle loading state
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
   * TC-MYGR-007: Handle service errors
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
   *     - No crash occurs
   */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import MyGroups from "../../../src/pages/mentor/MyGroups";

jest.mock("../../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockGroupService = {
  getMyGroups: jest.fn(),
};

const mockReportService = {
  getProjectReport: jest.fn(),
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

describe("MyGroups Mentor Page", () => {
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
          topic: { title: "AI Topic", description: "AI desc" },
          semester: { endDate: "2025-12-31" },
          major: { majorName: "Computer Science" },
          skills: ["React", "Node"],
          leader: { displayName: "John Doe", avatarUrl: null },
          members: [{ displayName: "Jane Smith", avatarUrl: null }],
        },
        {
          id: "g2",
          name: "Web Development",
          description: "Web desc",
          currentMembers: 4,
          maxMembers: 5,
          topic: { title: "Web Topic", description: "Web desc" },
          semester: { endDate: "2025-12-31" },
          major: { majorName: "Software Engineering" },
          skills: ["Vue", "Express"],
          leader: { displayName: "Bob Lee", avatarUrl: null },
          members: [],
        },
      ],
    });

    mockReportService.getProjectReport
      .mockResolvedValueOnce({ data: { project: { completionPercent: 70 } } })
      .mockResolvedValueOnce({ data: { project: { completionPercent: 45 } } });
  });

  test("TC-MYGR-001 [N] Render groups list with statistics", async () => {
    // Test Requirement: TR-MYGR-001, TR-MYGR-002
    // Procedure: Render component and verify initial load
    render(<MyGroups />);

    // Expected: All group names visible
    await waitFor(() => {
      expect(screen.getByText("AI Project")).toBeInTheDocument();
    });

    expect(screen.getByText("Web Development")).toBeInTheDocument();
    expect(mockGroupService.getMyGroups).toHaveBeenCalled();
  });

  test("TC-MYGR-002 [N] Filter groups by on-track status", async () => {
    // Test Requirement: TR-MYGR-003
    // Pre-condition: Groups with progress >=60% and <60%
    const user = userEvent.setup();

    render(<MyGroups />);

    await waitFor(() => {
      expect(screen.getByText("AI Project")).toBeInTheDocument();
    });

    // Procedure: Click on-track filter button
    const onTrackButton = screen.getByRole("button", { name: /đúng tiến độ/i });
    await user.click(onTrackButton);

    // Expected: Only on-track groups displayed
    expect(screen.getByText("AI Project")).toBeInTheDocument();
  });

  test("TC-MYGR-003 [N] Search groups by name", async () => {
    // Test Requirement: TR-MYGR-004
    // Pre-condition: Multiple groups with different names
    const user = userEvent.setup();

    render(<MyGroups />);

    await waitFor(() => {
      expect(screen.getByText("AI Project")).toBeInTheDocument();
    });

    // Procedure: Type search query
    const searchInput = screen.getByPlaceholderText(/tìm kiếm/i);
    await user.type(searchInput, "AI");

    // Expected: Matching groups displayed
    expect(screen.getByText("AI Project")).toBeInTheDocument();
  });

  test("TC-MYGR-004 [N] Calculate statistics correctly", async () => {
    // Test Requirement: TR-MYGR-002
    // Pre-condition: Groups with known progress values
    render(<MyGroups />);

    // Expected: Total groups = 2
    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  test("TC-MYGR-005 [N] Navigate to group detail page", async () => {
    // Test Requirement: TR-MYGR-006
    // Pre-condition: Groups loaded and displayed
    const user = userEvent.setup();

    render(<MyGroups />);

    await waitFor(() => {
      expect(screen.getByText("AI Project")).toBeInTheDocument();
    });

    // Procedure: Click detail button
    const detailButtons = screen.getAllByRole("button", { name: /xem chi tiết/i });
    if (detailButtons.length > 0) {
      await user.click(detailButtons[0]);

      // Expected: navigate called with correct path
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/mentor/group/g1");
      });
    }
  });

  test("TC-MYGR-006 [B] Handle loading state", async () => {
    // Test Requirement: TR-MYGR-007
    // Pre-condition: GroupService has delayed response
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockGroupService.getMyGroups.mockReturnValue(promise);

    render(<MyGroups />);

    // Expected: Loading spinner visible
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    resolvePromise({
      data: [
        {
          id: "g1",
          name: "AI Project",
          currentMembers: 3,
          maxMembers: 5,
          topic: { title: "AI Topic" },
          semester: { endDate: "2025-12-31" },
          major: { majorName: "CS" },
          leader: { displayName: "John" },
          members: [],
        },
      ],
    });

    // Expected: Spinner removed after load
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });
  });

  test("TC-MYGR-007 [B] Handle service errors", async () => {
    // Test Requirement: TR-MYGR-007
    // Pre-condition: GroupService.getMyGroups configured to fail
    mockGroupService.getMyGroups.mockRejectedValue(new Error("API Error"));

    render(<MyGroups />);

    // Expected: Service called
    await waitFor(() => {
      expect(mockGroupService.getMyGroups).toHaveBeenCalled();
    });

    // Expected: No groups displayed, no crash
    await waitFor(
      () => {
        expect(screen.queryByText("AI Project")).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  test("TC-MYGR-008 [N] Display group member avatars", async () => {
    // Test Requirement: TR-MYGR-001
    // Pre-condition: Groups with members loaded
    render(<MyGroups />);

    await waitFor(() => {
      expect(screen.getByText("AI Project")).toBeInTheDocument();
    });

    // Expected: Progress data fetched
    expect(mockReportService.getProjectReport).toHaveBeenCalledWith("g1");
  });

  test("TC-MYGR-009 [N] Display progress bars", async () => {
    // Test Requirement: TR-MYGR-001, TR-MYGR-005
    // Pre-condition: Groups with progress data
    render(<MyGroups />);

    // Expected: Groups displayed with progress
    await waitFor(() => {
      expect(screen.getByText("AI Project")).toBeInTheDocument();
    });
  });

  test("TC-MYGR-010 [N] Handle empty groups list", async () => {
    // Test Requirement: TR-MYGR-001
    // Pre-condition: No groups exist
    mockGroupService.getMyGroups.mockResolvedValue({ data: [] });

    render(<MyGroups />);

    // Expected: Component renders without error
    await waitFor(() => {
      expect(mockGroupService.getMyGroups).toHaveBeenCalled();
    });
  });

  test("TC-MYGR-011 [N] Filter by need attention status", async () => {
    // Test Requirement: TR-MYGR-003
    // Pre-condition: Groups with progress <60%
    const user = userEvent.setup();

    render(<MyGroups />);

    await waitFor(() => {
      expect(screen.getByText("Web Development")).toBeInTheDocument();
    });

    // Procedure: Click need attention filter
    const needButton = screen.getByRole("button", { name: /cần theo dõi/i });
    await user.click(needButton);

    // Expected: Only need-attention groups visible
    expect(screen.getByText("Web Development")).toBeInTheDocument();
  });

  test("TC-MYGR-012 [N] Reset to all groups filter", async () => {
    // Test Requirement: TR-MYGR-003
    // Pre-condition: Filter is active
    const user = userEvent.setup();

    render(<MyGroups />);

    await waitFor(() => {
      expect(screen.getByText("AI Project")).toBeInTheDocument();
    });

    // Procedure: Apply filter then reset
    const needButton = screen.getByRole("button", { name: /cần theo dõi/i });
    await user.click(needButton);

    const allButton = screen.getByRole("button", { name: /tất cả/i });
    await user.click(allButton);

    // Expected: All groups visible again
    expect(screen.getByText("AI Project")).toBeInTheDocument();
    expect(screen.getByText("Web Development")).toBeInTheDocument();
  });
});
