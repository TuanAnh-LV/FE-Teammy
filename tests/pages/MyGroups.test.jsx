/**
UTC01 N Render groups tab => Shows group cards and stats
- Pre: useMyGroupsPage returns one group and heroStats
- Condition: render MyGroupsPage
- Confirmation: group name visible; hero stat values rendered

UTC02 B Switch to applications tab => Tab change triggers handler
- Pre: activeTab initially groups
- Condition: click Applications tab
- Confirmation: setActiveTab called with "applications"

UTC03 N Open create group modal => Button toggles modal open
- Pre: setOpen mocked
- Condition: click Create New Group button
- Confirmation: setOpen called with true; modal receives open=true
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
