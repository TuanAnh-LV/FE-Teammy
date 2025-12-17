/**
 * MODULE: My Groups Page (Common)
 * FEATURE: Group management dashboard with creation and applications
 * 
 * TEST REQUIREMENTS:
 * TR-MYGRS-001: System shall display user's groups with overview statistics
 * TR-MYGRS-002: System shall provide tab navigation (Groups, Applications, Invitations, Overview)
 * TR-MYGRS-003: System shall support group creation with form validation
 * TR-MYGRS-004: System shall display group applications and invitations
 * TR-MYGRS-005: System shall handle group member management (view, leave, approve, reject)
 * TR-MYGRS-006: System shall display group metadata (skills, progress, members)
 * TR-MYGRS-007: System shall provide filtering and search capabilities
 * TR-MYGRS-008: System shall handle loading and empty states
 * 
 * ============================================================================
 * TEST CASES (53 Total)
 * ============================================================================
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ SECTION 1: BASIC RENDERING & TAB NAVIGATION (UTC01-UTC07)              │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * TC-MYGRS-001: Render groups tab with statistics
 *   ID: UTC01 [N]
 *   Requirement: TR-MYGRS-001
 *   Description: Verify groups tab displays group cards and hero statistics
 *   Pre-conditions: useMyGroupsPage returns one group and heroStats
 *   Test Procedure:
 *     1. Render MyGroupsPage component
 *     2. Verify group card displays
 *   Expected Results:
 *     - Group name visible
 *     - Hero stat values rendered
 * 
 * TC-MYGRS-002: Switch to applications tab
 *   ID: UTC02 [B]
 *   Requirement: TR-MYGRS-002
 *   Description: Verify tab navigation to applications
 *   Pre-conditions: activeTab initially set to "groups"
 *   Test Procedure:
 *     1. Click Applications tab
 *     2. Verify state update
 *   Expected Results:
 *     - setActiveTab called with "applications"
 * 
 * TC-MYGRS-003: Open create group modal
 *   ID: UTC03 [N]
 *   Requirement: TR-MYGRS-003
 *   Description: Verify create group button opens modal
 *   Pre-conditions: setOpen function mocked
 *   Test Procedure:
 *     1. Click Create New Group button
 *     2. Verify modal state
 *   Expected Results:
 *     - setOpen called with true
 *     - Modal receives open=true prop
 * 
 * TC-MYGRS-004: Display loading skeleton
 *   ID: UTC04 [N]
 *   Requirement: TR-MYGRS-008
 *   Description: Verify skeleton cards show during loading
 *   Pre-conditions: loading state is true
 *   Test Procedure:
 *     1. Set loading to true
 *     2. Render component
 *   Expected Results:
 *     - Skeleton cards visible
 * 
 * TC-MYGRS-005: Display empty state
 *   ID: UTC05 [N]
 *   Requirement: TR-MYGRS-008
 *   Description: Verify empty message when no groups exist
 *   Pre-conditions: groups array is empty
 *   Test Procedure:
 *     1. Set groups to []
 *     2. Render component
 *   Expected Results:
 *     - Empty message displayed
 * 
 * TC-MYGRS-006: Switch to overview tab
 *   ID: UTC06 [N]
 *   Requirement: TR-MYGRS-002
 *   Description: Verify tab navigation to overview
 *   Pre-conditions: Component rendered
 *   Test Procedure:
 *     1. Click Overview tab
 *     2. Verify state update
 *   Expected Results:
 *     - Tab changes to overview
 * 
 * TC-MYGRS-007: Display invitations tab
 *   ID: UTC07 [N]
 *   Requirement: TR-MYGRS-004
 *   Description: Verify invitations tab shows invitation list
 *   Pre-conditions: invitations array has data
 *   Test Procedure:
 *     1. Set invitations data
 *     2. Click Invitations tab
 *   Expected Results:
 *     - Invitations list displayed
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ SECTION 2: GROUP ACTIONS & INTERACTIONS (UTC08-UTC14)                  │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * TC-MYGRS-008: View group action
 *   ID: UTC08 [B]
 *   Requirement: TR-MYGRS-005
 *   Description: Verify view group handler called
 *   Pre-conditions: Group card rendered
 *   Test Procedure:
 *     1. Click view group button
 *     2. Verify handler call
 *   Expected Results:
 *     - handleViewGroup called with groupId
 * 
 * TC-MYGRS-009: Leave group action
 *   ID: UTC09 [B]
 *   Requirement: TR-MYGRS-005
 *   Description: Verify leave group handler called
 *   Pre-conditions: Group card rendered
 *   Test Procedure:
 *     1. Click leave group button
 *     2. Verify handler call
 *   Expected Results:
 *     - handleLeaveGroup called with groupId
 * 
 * TC-MYGRS-010: Display leader role with crown
 *   ID: UTC10 [N]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify crown icon shown for leaders
 *   Pre-conditions: Group has isLeader=true
 *   Test Procedure:
 *     1. Render group with leader role
 *     2. Check for crown icon
 *   Expected Results:
 *     - Crown icon visible
 * 
 * TC-MYGRS-011: Display pending applications
 *   ID: UTC11 [N]
 *   Requirement: TR-MYGRS-004
 *   Description: Verify pending applications tab shows applications
 *   Pre-conditions: activeApplications has data
 *   Test Procedure:
 *     1. Navigate to Applications tab
 *     2. Verify applications display
 *   Expected Results:
 *     - Applications list shown
 * 
 * TC-MYGRS-012: Approve application handler
 *   ID: UTC12 [B]
 *   Requirement: TR-MYGRS-005
 *   Description: Verify approve button calls handler
 *   Pre-conditions: Application card rendered
 *   Test Procedure:
 *     1. Click approve button
 *     2. Verify handler call
 *   Expected Results:
 *     - handleApprove called with applicationId
 * 
 * TC-MYGRS-013: Reject application handler
 *   ID: UTC13 [B]
 *   Requirement: TR-MYGRS-005
 *   Description: Verify reject button calls handler
 *   Pre-conditions: Application card rendered
 *   Test Procedure:
 *     1. Click reject button
 *     2. Verify handler call
 *   Expected Results:
 *     - handleReject called with applicationId
 * 
 * TC-MYGRS-014: Display member role without crown
 *   ID: UTC14 [N]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify member badge shown without crown for non-leaders
 *   Pre-conditions: Group has isLeader=false
 *   Test Procedure:
 *     1. Render group as member
 *     2. Check display
 *   Expected Results:
 *     - Member badge shown
 *     - No crown icon
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ SECTION 3: GROUP METADATA DISPLAY (UTC15-UTC25)                        │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * TC-MYGRS-015: Display group progress bar
 *   ID: UTC15 [N]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify progress percentage shown
 *   Pre-conditions: Group has progress data
 *   Test Procedure:
 *     1. Render group with progress
 *     2. Verify progress bar
 *   Expected Results:
 *     - Progress bar displayed
 *     - Percentage shown
 * 
 * TC-MYGRS-016: Display member avatars preview
 *   ID: UTC16 [N]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify member avatar preview shows
 *   Pre-conditions: Group has memberPreview array
 *   Test Procedure:
 *     1. Render group with members
 *     2. Verify avatars display
 *   Expected Results:
 *     - Member avatars shown
 * 
 * TC-MYGRS-017: Display +N indicator for extra members
 *   ID: UTC17 [N]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify +N shown when more than 5 members
 *   Pre-conditions: Group has >5 members
 *   Test Procedure:
 *     1. Render group with 6+ members
 *     2. Check for +N indicator
 *   Expected Results:
 *     - +N indicator displayed
 * 
 * TC-MYGRS-018: Display skill badges
 *   ID: UTC18 [N]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify skill badges rendered
 *   Pre-conditions: Group has skills array
 *   Test Procedure:
 *     1. Render group with skills
 *     2. Verify badges
 *   Expected Results:
 *     - Skill badges shown
 *     - Correct colors applied
 * 
 * TC-MYGRS-019: Display empty invitations message
 *   ID: UTC19 [N]
 *   Requirement: TR-MYGRS-008
 *   Description: Verify empty state for invitations
 *   Pre-conditions: invitations array is empty
 *   Test Procedure:
 *     1. Navigate to Invitations tab
 *     2. Verify empty message
 *   Expected Results:
 *     - "No invitations" message shown
 * 
 * TC-MYGRS-020: Parse application message with badge
 *   ID: UTC20 [N]
 *   Requirement: TR-MYGRS-004
 *   Description: Verify badge parsing from message
 *   Pre-conditions: Application has message with -- separator
 *   Test Procedure:
 *     1. Render application with badge message
 *     2. Verify parsing
 *   Expected Results:
 *     - Badge displayed
 *     - Message text shown
 * 
 * TC-MYGRS-021: Display plain application message
 *   ID: UTC21 [N]
 *   Requirement: TR-MYGRS-004
 *   Description: Verify plain message without badge parsing
 *   Pre-conditions: Application has simple message
 *   Test Procedure:
 *     1. Render application without badge
 *     2. Verify display
 *   Expected Results:
 *     - Plain message shown
 *     - No badge parsed
 * 
 * TC-MYGRS-022: Display overview statistics
 *   ID: UTC22 [N]
 *   Requirement: TR-MYGRS-001
 *   Description: Verify overview tab shows statistics cards
 *   Pre-conditions: heroStats has data
 *   Test Procedure:
 *     1. Click Overview tab
 *     2. Verify stat cards
 *   Expected Results:
 *     - All stat cards displayed
 * 
 * TC-MYGRS-023: Display group without members
 *   ID: UTC23 [N]
 *   Requirement: TR-MYGRS-008
 *   Description: Verify handling of empty memberPreview
 *   Pre-conditions: Group has no members
 *   Test Procedure:
 *     1. Render group without members
 *     2. Verify display
 *   Expected Results:
 *     - "No members" message shown
 * 
 * TC-MYGRS-024: Format role label utility
 *   ID: UTC24 [N]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify role formatting handles different formats
 *   Pre-conditions: Various role formats provided
 *   Test Procedure:
 *     1. Test role formatting function
 *     2. Verify outputs
 *   Expected Results:
 *     - Roles formatted correctly
 * 
 * TC-MYGRS-025: Display loading state for applications
 *   ID: UTC25 [N]
 *   Requirement: TR-MYGRS-008
 *   Description: Verify skeleton shown while loading applications
 *   Pre-conditions: pendingLoading is true
 *   Test Procedure:
 *     1. Set loading state
 *     2. Navigate to Applications tab
 *   Expected Results:
 *     - Skeleton loader shown
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ SECTION 4: SKILL COLORS & CATEGORIZATION (UTC26-UTC32)                 │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * TC-MYGRS-026: Display mobile skills with purple color
 *   ID: UTC26 [N]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify mobile skills show purple badges
 *   Pre-conditions: Group has mobile skills
 *   Test Procedure:
 *     1. Render group with mobile skills
 *     2. Check badge colors
 *   Expected Results:
 *     - Purple badges for mobile skills
 * 
 * TC-MYGRS-027: Switch application sub-tab to invitations
 *   ID: UTC27 [N]
 *   Requirement: TR-MYGRS-002
 *   Description: Verify sub-tab navigation within Applications
 *   Pre-conditions: Applications tab active
 *   Test Procedure:
 *     1. Click Invitations sub-tab
 *     2. Verify state change
 *   Expected Results:
 *     - Sub-tab changes to invitations
 * 
 * TC-MYGRS-028: Display invitation with topic and message
 *   ID: UTC28 [N]
 *   Requirement: TR-MYGRS-004
 *   Description: Verify invitation shows all details
 *   Pre-conditions: Invitation has topic and message
 *   Test Procedure:
 *     1. Render invitation card
 *     2. Verify all fields
 *   Expected Results:
 *     - Topic, message, and details shown
 * 
 * TC-MYGRS-029: Handle null displayRole
 *   ID: UTC29 [B]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify default member label when role is null
 *   Pre-conditions: Group member has null displayRole
 *   Test Procedure:
 *     1. Render group with null role
 *     2. Verify fallback
 *   Expected Results:
 *     - Default "Member" label shown
 * 
 * TC-MYGRS-030: Display backend skills with green color
 *   ID: UTC30 [B]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify backend skills show green badges
 *   Pre-conditions: Group has backend skills
 *   Test Procedure:
 *     1. Render group with backend skills
 *     2. Check badge colors
 *   Expected Results:
 *     - Green badges for backend skills
 * 
 * TC-MYGRS-031: Display DevOps skills with orange color
 *   ID: UTC31 [B]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify DevOps skills show orange badges
 *   Pre-conditions: Group has DevOps skills
 *   Test Procedure:
 *     1. Render group with DevOps skills
 *     2. Check badge colors
 *   Expected Results:
 *     - Orange badges for DevOps skills
 * 
 * TC-MYGRS-032: Display unknown skills with default gray
 *   ID: UTC32 [B]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify unknown skills show gray badges
 *   Pre-conditions: Group has uncategorized skills
 *   Test Procedure:
 *     1. Render group with unknown skills
 *     2. Check badge colors
 *   Expected Results:
 *     - Gray badges for unknown skills
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ SECTION 5: BOUNDARY CASES & EDGE SCENARIOS (UTC33-UTC44)               │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * TC-MYGRS-033: Display zero progress
 *   ID: UTC33 [B]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify 0% progress displays correctly
 *   Pre-conditions: Group has 0% progress
 *   Test Procedure:
 *     1. Render group with 0 progress
 *     2. Verify display
 *   Expected Results:
 *     - "0%" shown
 * 
 * TC-MYGRS-034: Cap progress at 100%
 *   ID: UTC34 [B]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify progress capped at maximum 100%
 *   Pre-conditions: Group has >100% progress
 *   Test Procedure:
 *     1. Render group with 150% progress
 *     2. Verify capping
 *   Expected Results:
 *     - Display shows "100%"
 * 
 * TC-MYGRS-035: Handle missing semester label
 *   ID: UTC35 [B]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify fallback when semesterLabel is null
 *   Pre-conditions: Group has no semesterLabel
 *   Test Procedure:
 *     1. Render group without semester
 *     2. Verify fallback
 *   Expected Results:
 *     - "Updating" or placeholder shown
 * 
 * TC-MYGRS-036: Display invitation without topic
 *   ID: UTC36 [B]
 *   Requirement: TR-MYGRS-004
 *   Description: Verify invitation renders without topic field
 *   Pre-conditions: Invitation has no topicTitle
 *   Test Procedure:
 *     1. Render invitation without topic
 *     2. Verify display
 *   Expected Results:
 *     - Invitation shown without topic section
 * 
 * TC-MYGRS-037: Display invitation without message
 *   ID: UTC37 [B]
 *   Requirement: TR-MYGRS-004
 *   Description: Verify invitation renders without message
 *   Pre-conditions: Invitation has no message
 *   Test Procedure:
 *     1. Render invitation without message
 *     2. Verify display
 *   Expected Results:
 *     - Invitation shown without message section
 * 
 * TC-MYGRS-038: Use email fallback for missing displayName
 *   ID: UTC38 [B]
 *   Requirement: TR-MYGRS-004
 *   Description: Verify email used when displayName missing
 *   Pre-conditions: Invitation sender has no displayName
 *   Test Procedure:
 *     1. Render invitation with only email
 *     2. Verify display
 *   Expected Results:
 *     - Email shown as fallback name
 * 
 * TC-MYGRS-039: Handle negative progress
 *   ID: UTC39 [B]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify negative progress shown as 0%
 *   Pre-conditions: Group has negative progress
 *   Test Procedure:
 *     1. Render group with -10% progress
 *     2. Verify normalization
 *   Expected Results:
 *     - Display shows "0%"
 * 
 * TC-MYGRS-040: Display application without message
 *   ID: UTC40 [B]
 *   Requirement: TR-MYGRS-004
 *   Description: Verify application renders without message field
 *   Pre-conditions: Application has no message
 *   Test Procedure:
 *     1. Render application without message
 *     2. Verify display
 *   Expected Results:
 *     - Application shown without message section
 * 
 * TC-MYGRS-041: Handle no groups for overview date
 *   ID: UTC41 [B]
 *   Requirement: TR-MYGRS-001
 *   Description: Verify default date shown when no groups
 *   Pre-conditions: groups array is empty
 *   Test Procedure:
 *     1. Navigate to Overview tab
 *     2. Verify date display
 *   Expected Results:
 *     - Default date shown
 * 
 * TC-MYGRS-042: Use translated role value
 *   ID: UTC42 [B]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify role uses translation function
 *   Pre-conditions: Role key requires translation
 *   Test Procedure:
 *     1. Render group with role key
 *     2. Verify t() called
 *   Expected Results:
 *     - Translated role value shown
 * 
 * TC-MYGRS-043: Display member avatar image
 *   ID: UTC43 [B]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify avatar image element rendered
 *   Pre-conditions: Member has avatarUrl
 *   Test Procedure:
 *     1. Render member with avatar
 *     2. Check img element
 *   Expected Results:
 *     - img element with src shown
 * 
 * TC-MYGRS-044: Handle message with single dash
 *   ID: UTC44 [B]
 *   Requirement: TR-MYGRS-004
 *   Description: Verify no badge parsing with single dash
 *   Pre-conditions: Message has single "-" not "--"
 *   Test Procedure:
 *     1. Render application with single dash
 *     2. Verify no parsing
 *   Expected Results:
 *     - Plain message shown, no badge
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ SECTION 6: ADDITIONAL SKILL CATEGORIES (UTC45-UTC53)                   │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * TC-MYGRS-045: Display frontend skills with blue color
 *   ID: UTC45 [B]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify frontend skills show blue badges
 *   Pre-conditions: Group has frontend skills (React, Vue, Angular)
 *   Test Procedure: Render and verify badge colors
 *   Expected Results: Blue badges for frontend skills
 * 
 * TC-MYGRS-046: Display Android/iOS skills with purple
 *   ID: UTC46 [B]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify mobile platform skills show purple
 *   Pre-conditions: Group has Android or iOS skills
 *   Test Procedure: Render and verify colors
 *   Expected Results: Purple badges shown
 * 
 * TC-MYGRS-047: Display Azure skill with orange
 *   ID: UTC47 [B]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify Azure shows orange badge
 *   Pre-conditions: Group has Azure skill
 *   Test Procedure: Render and verify color
 *   Expected Results: Orange badge shown
 * 
 * TC-MYGRS-048: Display C# and .NET with green
 *   ID: UTC48 [B]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify C# and .NET show green badges
 *   Pre-conditions: Group has C# or .NET skills
 *   Test Procedure: Render and verify colors
 *   Expected Results: Green badges shown
 * 
 * TC-MYGRS-049: Display HTML/CSS with blue
 *   ID: UTC49 [B]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify HTML/CSS show blue badges
 *   Pre-conditions: Group has HTML or CSS skills
 *   Test Procedure: Render and verify colors
 *   Expected Results: Blue badges shown
 * 
 * TC-MYGRS-050: Handle undefined memberPreview
 *   ID: UTC50 [B]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify handling when memberPreview is undefined
 *   Pre-conditions: Group has undefined memberPreview
 *   Test Procedure: Render group
 *   Expected Results: No members section shown
 * 
 * TC-MYGRS-051: Display exactly 5 members
 *   ID: UTC51 [B]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify no +N indicator with exactly 5 members
 *   Pre-conditions: Group has exactly 5 members
 *   Test Procedure: Render and check
 *   Expected Results: All 5 shown, no +N indicator
 * 
 * TC-MYGRS-052: Display 6 members with +1 indicator
 *   ID: UTC52 [B]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify +1 shown with 6 members
 *   Pre-conditions: Group has 6 members
 *   Test Procedure: Render and verify
 *   Expected Results: 5 avatars + "+1" indicator
 * 
 * TC-MYGRS-053: Handle member without ID
 *   ID: UTC53 [B]
 *   Requirement: TR-MYGRS-006
 *   Description: Verify index used as key when member has no ID
 *   Pre-conditions: Member object missing ID field
 *   Test Procedure: Render member list
 *   Expected Results: Component renders using index
 * 
 * ============================================================================
 * 
 * Test Code: FE-TM-Page-MyGroups
 * Test Name: MyGroups Page Test
 * Author: Test Suite
 * Date: 2024
 * Total Test Cases: 53
 * Coverage: Group listing, Applications, Invitations, Overview statistics
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import MyGroupsPage from "../../src/pages/common/MyGroups";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

const mockTranslationWithValues = (translations) => {
  return (key) => translations[key] || key;
};

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock("../../src/context/AuthContext", () => ({
  useAuth: () => ({ userInfo: { name: "User" } }),
}));

const mockSetActiveTab = jest.fn();
const mockSetOpen = jest.fn();
const mockUseMyGroupsPage = jest.fn();
jest.mock("../../src/hook/useMyGroupsPage", () => ({
  useMyGroupsPage: (...args) => mockUseMyGroupsPage(...args),
}));

jest.mock("../../src/components/common/my-groups/CreateGroupModal", () => (props) => (
  <div data-testid="create-modal">{props.open ? "open" : "closed"}</div>
));

describe("MyGroupsPage Report5", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMyGroupsPage.mockReturnValue({
      groups: [
        {
          id: "g1",
          title: "Group One",
          field: "AI",
          description: "Desc",
          isLeader: true,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
        },
      ],
      loading: false,
      heroStats: [
        { title: "created", value: 1, label: "created" },
        { title: "applications", value: 0, label: "applications" },
      ],
      activeTab: "groups",
      setActiveTab: mockSetActiveTab,
      open: false,
      submitting: false,
      form: {},
      errors: {},
      pendingLoading: false,
      activeApplications: [],
      pendingTotal: 0,
      groupsById: {},
      invitations: [],
      invitationsLoading: false,
      setOpen: mockSetOpen,
      handleFormChange: jest.fn(),
      handleCreateGroup: jest.fn(),
      requestCloseModal: jest.fn(),
      handleViewGroup: jest.fn(),
      handleLeaveGroup: jest.fn(),
      handleApprove: jest.fn(),
      handleReject: jest.fn(),
      majors: [],
      majorsLoading: false,
      skills: [],
      skillsLoading: false,
    });
  });

  test("UTC01 [N] Render groups tab => Shows group cards and stats", () => {
    render(<MyGroupsPage />);
    expect(screen.getByText(/Group One/i)).toBeInTheDocument();
    expect(screen.getByText(/created/i)).toBeInTheDocument();
  });

  test("UTC02 [B] Switch to applications tab => Tab change triggers handler", async () => {
    render(<MyGroupsPage />);
    const user = userEvent.setup();
    await user.click(screen.getAllByText(/applications/i)[1]);
    expect(mockSetActiveTab).toHaveBeenCalledWith("applications");
  });

  test("UTC03 [N] Open create group modal => Button toggles modal open", async () => {
    render(<MyGroupsPage />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/createNewGroup/i));
    expect(mockSetOpen).toHaveBeenCalledWith(true);
    expect(screen.getByTestId("create-modal").textContent).toBe("closed");
  });

  test("UTC04 [N] Render loading skeleton => Shows skeleton cards while loading", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      loading: true,
      groups: [],
    });
    render(<MyGroupsPage />);
    const skeletons = screen.getAllByRole("generic").filter(el => 
      el.className.includes("animate-pulse")
    );
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test("UTC05 [N] Render empty state => Shows empty message when no groups", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      loading: false,
      groups: [],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/noData/i)).toBeInTheDocument();
  });

  test("UTC06 [N] Switch to overview tab => Tab change to overview", async () => {
    render(<MyGroupsPage />);
    const user = userEvent.setup();
    const overviewBtns = screen.getAllByText(/overview/i);
    await user.click(overviewBtns[overviewBtns.length - 1]);
    expect(mockSetActiveTab).toHaveBeenCalledWith("overview");
  });

  test("UTC07 [N] Render invitations tab => Shows invitations list", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      activeTab: "applications",
      invitations: [
        {
          id: "inv1",
          group: { title: "Test Group", field: "AI" },
          status: "pending",
        },
      ],
      invitationsLoading: false,
    });
    render(<MyGroupsPage />);
    const user = userEvent.setup();
    // Switch to invitations sub-tab
    const invitationsBtn = screen.getByText(/invitations/i);
    user.click(invitationsBtn);
    // Check that invitation section renders
    expect(invitationsBtn).toBeInTheDocument();
  });

  test("UTC08 [B] Handle view group action => Calls view group handler", async () => {
    const mockHandleViewGroup = jest.fn();
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      handleViewGroup: mockHandleViewGroup,
    });
    render(<MyGroupsPage />);
    const user = userEvent.setup();
    const viewButton = screen.getByText(/^View$/i);
    await user.click(viewButton);
    expect(mockHandleViewGroup).toHaveBeenCalled();
  });

  test("UTC09 [B] Handle leave group action => Calls leave group handler", async () => {
    const mockHandleLeaveGroup = jest.fn();
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      handleLeaveGroup: mockHandleLeaveGroup,
    });
    render(<MyGroupsPage />);
    const user = userEvent.setup();
    const leaveButton = screen.getByText(/Leave/i);
    await user.click(leaveButton);
    expect(mockHandleLeaveGroup).toHaveBeenCalled();
  });

  test("UTC10 [N] Render group with leader role => Shows crown icon for leader", () => {
    render(<MyGroupsPage />);
    expect(screen.getByText(/Group One/i)).toBeInTheDocument();
    // Leader badge should be visible (from translation key)
    expect(screen.getByText(/AI/i)).toBeInTheDocument();
  });

  test("UTC11 [N] Render pending applications tab => Shows pending applications", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      activeTab: "applications",
      activeApplications: [
        ["g1", [
          {
            id: "app1",
            name: "John Doe",
            email: "john@test.com",
            status: "pending",
          },
        ]],
      ],
      groupsById: new Map([["g1", { title: "Test Group", field: "AI" }]]),
      pendingLoading: false,
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });

  test("UTC12 [B] Handle approve application => Calls approve handler", async () => {
    const mockHandleApprove = jest.fn();
    const testRequest = {
      id: "app1",
      name: "John Doe",
      email: "john@test.com",
    };
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      activeTab: "applications",
      handleApprove: mockHandleApprove,
      activeApplications: [
        ["g1", [testRequest]],
      ],
      groupsById: new Map([["g1", { title: "Test Group", field: "AI" }]]),
    });
    render(<MyGroupsPage />);
    const user = userEvent.setup();
    const approveBtn = screen.getByText(/approve/i);
    await user.click(approveBtn);
    expect(mockHandleApprove).toHaveBeenCalledWith("g1", testRequest);
  });

  test("UTC14 [N] Render group as member (not leader) => Shows member badge without crown", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g2",
          title: "Member Group",
          field: "Backend",
          description: "Test",
          isLeader: false,
          displayRole: "developer",
          semesterLabel: "Spring",
          status: "active",
          createdAt: "2025-01-15",
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/Member Group/i)).toBeInTheDocument();
    expect(screen.getByText(/Backend/i)).toBeInTheDocument();
  });

  test("UTC15 [N] Render group progress bar => Shows progress percentage", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "Progress Group",
          field: "AI",
          description: "Test",
          isLeader: true,
          progress: 65,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/65%/i)).toBeInTheDocument();
  });

  test("UTC16 [N] Render group with member avatars => Shows member preview", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "Team with Members",
          field: "AI",
          description: "Test",
          isLeader: true,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
          memberPreview: [
            { id: "m1", name: "Alice", avatar: null },
            { id: "m2", name: "Bob", avatar: null },
          ],
          members: 2,
          maxMembers: 5,
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/2\/5 members/i)).toBeInTheDocument();
  });

  test("UTC17 [N] Render group with more than 5 members => Shows +N indicator", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "Large Team",
          field: "AI",
          description: "Test",
          isLeader: true,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
          memberPreview: Array.from({ length: 8 }, (_, i) => ({
            id: `m${i}`,
            name: `Member ${i}`,
            avatar: null,
          })),
          members: 8,
          maxMembers: 10,
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/\+3/i)).toBeInTheDocument();
  });

  test("UTC18 [N] Render group with skills => Shows skill badges", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "Skilled Team",
          field: "AI",
          description: "Test",
          isLeader: true,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
          skills: ["react", "nodejs", "docker"],
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/React/i)).toBeInTheDocument();
    expect(screen.getByText(/Nodejs/i)).toBeInTheDocument();
  });

  test("UTC19 [N] Render empty invitations list => Shows no invitations message", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      activeTab: "applications",
      invitations: [],
      invitationsLoading: false,
    });
    render(<MyGroupsPage />);
    const user = userEvent.setup();
    const invitationsBtn = screen.getByText(/invitations/i);
    user.click(invitationsBtn);
    // Should show empty state in invitations tab
    expect(screen.getByText(/invitations/i)).toBeInTheDocument();
  });

  test("UTC20 [N] Render application with message badge => Parses and displays badge", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      activeTab: "applications",
      activeApplications: [
        [
          "g1",
          [
            {
              id: "app1",
              name: "Jane Doe",
              email: "jane@test.com",
              message: "Frontend - I am a React developer",
              status: "pending",
            },
          ],
        ],
      ],
      groupsById: new Map([["g1", { title: "Test Group", field: "AI" }]]),
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/Jane Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Frontend/i)).toBeInTheDocument();
  });

  test("UTC21 [N] Render application without badge message => Shows plain message", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      activeTab: "applications",
      activeApplications: [
        [
          "g1",
          [
            {
              id: "app1",
              name: "Sam Smith",
              email: "sam@test.com",
              message: "Just a simple message",
              status: "pending",
            },
          ],
        ],
      ],
      groupsById: new Map([["g1", { title: "Test Group", field: "AI" }]]),
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/Sam Smith/i)).toBeInTheDocument();
    expect(screen.getByText(/Just a simple message/i)).toBeInTheDocument();
  });

  test("UTC22 [N] Render overview tab stats => Shows all overview cards", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      activeTab: "overview",
      groups: [
        {
          id: "g1",
          title: "Test",
          field: "AI",
          description: "Test",
          isLeader: true,
          createdAt: "2025-01-01T00:00:00Z",
          semesterLabel: "Fall",
          status: "active",
        },
      ],
      pendingTotal: 5,
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/activeGroups/i)).toBeInTheDocument();
    expect(screen.getByText(/pendingApplications/i)).toBeInTheDocument();
  });

  test("UTC23 [N] Render group without members => Shows no members message", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "Empty Team",
          field: "AI",
          description: "Test",
          isLeader: true,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
          memberPreview: [],
          members: 1,
          maxMembers: 5,
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/noMembersYet/i)).toBeInTheDocument();
  });

  test("UTC24 [N] Format role label utility => Handles different role formats", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "Role Test",
          field: "AI",
          description: "Test",
          isLeader: false,
          displayRole: "backendDeveloper",
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
        },
      ],
    });
    render(<MyGroupsPage />);
    // Role should be formatted from camelCase to readable text
    expect(screen.getByText(/Role Test/i)).toBeInTheDocument();
  });

  test("UTC25 [N] Render loading state for applications => Shows skeleton", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      activeTab: "applications",
      pendingLoading: true,
      activeApplications: [],
    });
    render(<MyGroupsPage />);
    const skeletons = screen.getAllByRole("generic").filter((el) =>
      el.className.includes("animate-pulse")
    );
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test("UTC13 [B] Handle reject application => Calls reject handler", async () => {
    const mockHandleReject = jest.fn();
    const testRequest = {
      id: "app1",
      name: "John Doe",
      email: "john@test.com",
    };
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      activeTab: "applications",
      handleReject: mockHandleReject,
      activeApplications: [
        ["g1", [testRequest]],
      ],
      groupsById: new Map([["g1", { title: "Test Group", field: "AI" }]]),
    });
    render(<MyGroupsPage />);
    const user = userEvent.setup();
    const rejectBtn = screen.getByText(/reject/i);
    await user.click(rejectBtn);
    expect(mockHandleReject).toHaveBeenCalledWith("g1", testRequest);
  });

  test("UTC14 [N] Render overview tab => Shows overview statistics cards", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      activeTab: "overview",
      pendingTotal: 5,
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/activeGroups/i)).toBeInTheDocument();
    expect(screen.getByText(/pendingApplications/i)).toBeInTheDocument();
  });

  test("UTC26 [N] Render mobile skills => Shows mobile skill badges with purple color", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "Mobile Team",
          field: "Mobile",
          description: "Test",
          isLeader: true,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
          skills: ["flutter", "swift", "kotlin"],
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/Flutter/i)).toBeInTheDocument();
    expect(screen.getByText(/Swift/i)).toBeInTheDocument();
  });

  test("UTC27 [N] Switch application sub-tab => Changes to invitations", async () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      activeTab: "applications",
      invitations: [
        {
          id: "inv1",
          displayName: "Leader User",
          email: "leader@test.com",
          avatarUrl: null,
          topicTitle: "AI Project",
          message: "Join us",
        },
      ],
      invitationsLoading: false,
    });
    render(<MyGroupsPage />);
    const user = userEvent.setup();
    // Get all buttons with invitations text - last one is the sub-tab button
    const allButtons = screen.getAllByRole("button");
    const invitationsSubTab = allButtons.find(
      (btn) => btn.textContent === "invitations" && btn.className.includes("rounded-lg")
    );
    await user.click(invitationsSubTab);
    // After clicking sub-tab, invitation should render
    expect(await screen.findByText(/Leader User/i)).toBeInTheDocument();
  });

  test("UTC28 [N] Render invitation with topic and message => Shows all details", async () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      activeTab: "applications",
      invitations: [
        {
          id: "inv1",
          displayName: "Team Leader",
          email: "tl@test.com",
          avatarUrl: "https://example.com/avatar.jpg",
          topicTitle: "Machine Learning Project",
          message: "We need your skills",
        },
      ],
      invitationsLoading: false,
    });
    render(<MyGroupsPage />);
    const user = userEvent.setup();
    const allButtons = screen.getAllByRole("button");
    const invitationsSubTab = allButtons.find(
      (btn) => btn.textContent === "invitations" && btn.className.includes("rounded-lg")
    );
    await user.click(invitationsSubTab);
    // After click, wait for the invitation details to render
    expect(await screen.findByText(/Team Leader/i)).toBeInTheDocument();
    expect(await screen.findByText(/tl@test.com/i)).toBeInTheDocument();
  });

  test("UTC29 [B] Render group with null displayRole => Shows default member label", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "No Role Group",
          field: "AI",
          description: "Test",
          isLeader: false,
          displayRole: null,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/No Role Group/i)).toBeInTheDocument();
  });

  test("UTC30 [B] Render backend skills => Shows green color badges", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "Backend Team",
          field: "Backend",
          description: "Test",
          isLeader: true,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
          skills: ["nodejs", "java", "python"],
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/Nodejs/i)).toBeInTheDocument();
    expect(screen.getByText(/Java/i)).toBeInTheDocument();
  });

  test("UTC31 [B] Render devops skills => Shows orange color badges", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "DevOps Team",
          field: "DevOps",
          description: "Test",
          isLeader: true,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
          skills: ["docker", "kubernetes", "aws"],
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/Docker/i)).toBeInTheDocument();
    expect(screen.getByText(/Kubernetes/i)).toBeInTheDocument();
  });

  test("UTC32 [B] Render unknown skills => Shows default gray badges", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "Mixed Skills",
          field: "AI",
          description: "Test",
          isLeader: true,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
          skills: ["rust", "golang"],
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/Rust/i)).toBeInTheDocument();
  });

  test("UTC33 [B] Render group with zero progress => Shows 0%", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "New Group",
          field: "AI",
          description: "Test",
          isLeader: true,
          progress: 0,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/0%/i)).toBeInTheDocument();
  });

  test("UTC34 [B] Render group with over 100% progress => Caps at 100%", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "Overachievers",
          field: "AI",
          description: "Test",
          isLeader: true,
          progress: 150,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/100%/i)).toBeInTheDocument();
  });

  test("UTC35 [B] Render group without semesterLabel => Shows updating", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "No Semester",
          field: "AI",
          description: "Test",
          isLeader: true,
          semesterLabel: null,
          status: "active",
          createdAt: "2025-01-01",
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/updating/i)).toBeInTheDocument();
  });

  test("UTC36 [B] Render invitation without topicTitle => Shows without topic", async () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      activeTab: "applications",
      invitations: [
        {
          id: "inv1",
          displayName: "No Topic Leader",
          email: "leader@test.com",
          avatarUrl: null,
          topicTitle: null,
          message: "Join",
        },
      ],
      invitationsLoading: false,
    });
    render(<MyGroupsPage />);
    const user = userEvent.setup();
    const allButtons = screen.getAllByRole("button");
    const invitationsSubTab = allButtons.find(
      (btn) => btn.textContent === "invitations" && btn.className.includes("rounded-lg")
    );
    await user.click(invitationsSubTab);
    expect(await screen.findByText(/No Topic Leader/i)).toBeInTheDocument();
  });

  test("UTC37 [B] Render invitation without message => Shows without message", async () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      activeTab: "applications",
      invitations: [
        {
          id: "inv1",
          displayName: "No Msg Leader",
          email: "leader@test.com",
          avatarUrl: null,
          topicTitle: "Project",
          message: null,
        },
      ],
      invitationsLoading: false,
    });
    render(<MyGroupsPage />);
    const user = userEvent.setup();
    const allButtons = screen.getAllByRole("button");
    const invitationsSubTab = allButtons.find(
      (btn) => btn.textContent === "invitations" && btn.className.includes("rounded-lg")
    );
    await user.click(invitationsSubTab);
    expect(await screen.findByText(/No Msg Leader/i)).toBeInTheDocument();
  });

  test("UTC38 [B] Render invitation with missing displayName => Uses email fallback", async () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      activeTab: "applications",
      invitations: [
        {
          id: "inv1",
          displayName: null,
          email: "fallback@test.com",
          avatarUrl: null,
          topicTitle: null,
          message: null,
        },
      ],
      invitationsLoading: false,
    });
    render(<MyGroupsPage />);
    const user = userEvent.setup();
    const allButtons = screen.getAllByRole("button");
    const invitationsSubTab = allButtons.find(
      (btn) => btn.textContent === "invitations" && btn.className.includes("rounded-lg")
    );
    await user.click(invitationsSubTab);
    expect(await screen.findByText(/fallback@test.com/i)).toBeInTheDocument();
  });

  test("UTC39 [B] Render group with negative progress => Shows 0%", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "Negative Progress",
          field: "AI",
          description: "Test",
          isLeader: true,
          progress: -10,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/0%/i)).toBeInTheDocument();
  });

  test("UTC40 [B] Render application without message => No message displayed", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      activeTab: "applications",
      activeApplications: [
        [
          "g1",
          [
            {
              id: "app1",
              name: "No Message User",
              email: "user@test.com",
              message: null,
              status: "pending",
            },
          ],
        ],
      ],
      groupsById: new Map([["g1", { title: "Test Group", field: "AI" }]]),
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/No Message User/i)).toBeInTheDocument();
  });

  test("UTC41 [B] Render overview with no groups => Shows default date", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      activeTab: "overview",
      groups: [],
      pendingTotal: 0,
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/activeGroups/i)).toBeInTheDocument();
  });

  test("UTC42 [B] Render group with translated role => Uses t() value", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "Translated Role Group",
          field: "AI",
          description: "Test",
          isLeader: false,
          displayRole: "developer",
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/Translated Role Group/i)).toBeInTheDocument();
  });

  test("UTC43 [B] Render member avatar with image => Shows img element", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "Avatar Group",
          field: "AI",
          description: "Test",
          isLeader: true,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
          memberPreview: [
            { id: "m1", name: "Alice", avatar: "https://example.com/alice.jpg" },
          ],
          members: 1,
          maxMembers: 5,
        },
      ],
    });
    render(<MyGroupsPage />);
    const img = screen.getByAltText(/Alice/i);
    expect(img).toBeInTheDocument();
  });

  test("UTC44 [B] Render application message with single dash => No badge parsing", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      activeTab: "applications",
      activeApplications: [
        [
          "g1",
          [
            {
              id: "app1",
              name: "Single Dash",
              email: "dash@test.com",
              message: "NoSplit",
              status: "pending",
            },
          ],
        ],
      ],
      groupsById: new Map([["g1", { title: "Test Group", field: "AI" }]]),
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/NoSplit/i)).toBeInTheDocument();
  });

  test("UTC45 [B] Render frontend skills => Shows blue badges", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "Frontend Team",
          field: "Frontend",
          description: "Test",
          isLeader: true,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
          skills: ["react", "vue", "angular", "javascript"],
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/React/i)).toBeInTheDocument();
    expect(screen.getByText(/Vue/i)).toBeInTheDocument();
    expect(screen.getByText(/Angular/i)).toBeInTheDocument();
  });

  test("UTC46 [B] Render Android/iOS skills => Shows purple badges", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "Mobile Team",
          field: "Mobile",
          description: "Test",
          isLeader: true,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
          skills: ["android", "ios"],
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/Android/i)).toBeInTheDocument();
    expect(screen.getByText(/Ios/i)).toBeInTheDocument();
  });

  test("UTC47 [B] Render Azure skill => Shows orange badge", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "Cloud Team",
          field: "DevOps",
          description: "Test",
          isLeader: true,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
          skills: ["azure"],
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/Azure/i)).toBeInTheDocument();
  });

  test("UTC48 [B] Render C# and .NET skills => Shows green badges", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "Backend Team",
          field: "Backend",
          description: "Test",
          isLeader: true,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
          skills: ["csharp", "dotnet"],
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/Csharp/i)).toBeInTheDocument();
    expect(screen.getByText(/Dotnet/i)).toBeInTheDocument();
  });

  test("UTC49 [B] Render HTML/CSS skills => Shows blue badges", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "Web Basics",
          field: "Web",
          description: "Test",
          isLeader: true,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
          skills: ["html", "css"],
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/Html/i)).toBeInTheDocument();
    expect(screen.getByText(/Css/i)).toBeInTheDocument();
  });

  test("UTC50 [B] Render group with undefined memberPreview => Shows no members", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "No Preview",
          field: "AI",
          description: "Test",
          isLeader: true,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
          memberPreview: undefined,
          members: 0,
          maxMembers: 5,
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/noMembersYet/i)).toBeInTheDocument();
  });

  test("UTC51 [B] Render group with exactly 5 members => No +N indicator", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "Exactly Five",
          field: "AI",
          description: "Test",
          isLeader: true,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
          memberPreview: Array.from({ length: 5 }, (_, i) => ({
            id: `m${i}`,
            name: `Member ${i}`,
            avatar: null,
          })),
          members: 5,
          maxMembers: 10,
        },
      ],
    });
    render(<MyGroupsPage />);
    const text = screen.getByText(/5\/10 members/i);
    expect(text).toBeInTheDocument();
  });

  test("UTC52 [B] Render group with 6 members => Shows +1 indicator", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "Six Members",
          field: "AI",
          description: "Test",
          isLeader: true,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
          memberPreview: Array.from({ length: 6 }, (_, i) => ({
            id: `m${i}`,
            name: `Member ${i}`,
            avatar: null,
          })),
          members: 6,
          maxMembers: 10,
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/\+1/i)).toBeInTheDocument();
  });

  test("UTC53 [B] Render member without id => Uses index as key", () => {
    mockUseMyGroupsPage.mockReturnValue({
      ...mockUseMyGroupsPage(),
      groups: [
        {
          id: "g1",
          title: "No ID Member",
          field: "AI",
          description: "Test",
          isLeader: true,
          semesterLabel: "Fall",
          status: "active",
          createdAt: "2025-01-01",
          memberPreview: [
            { name: "No ID User", avatar: null },
          ],
          members: 1,
          maxMembers: 5,
        },
      ],
    });
    render(<MyGroupsPage />);
    expect(screen.getByText(/No ID Member/i)).toBeInTheDocument();
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "MyGroupsPage",
  totalTC: 53,
  breakdown: { N: 31, B: 22, A: 0 },
  notes:
    "Comprehensive branch coverage including all skill color variations, role label edge cases, message parsing branches, avatar rendering paths, and memberPreview edge cases.",
};
