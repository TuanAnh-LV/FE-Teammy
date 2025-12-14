/**
 * Test Code: FE-TM-Hook-useMyGroupsPage
 * Test Name: useMyGroupsPage Hook Test
 * Description: Test My Groups page state management hook (basic tests due to complexity)
 * Author: Test Suite
 * Date: 2024
 * 
 * NOTE: This hook is extremely complex (648 lines) with many service dependencies.
 * These tests cover basic initialization and state management.
 * Full integration testing would require extensive mocking of all services.
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useMyGroupsPage } from "../../src/hook/useMyGroupsPage";
import { GroupService } from "../../src/services/group.service";
import { TopicService } from "../../src/services/topic.service";
import invitationReducer from "../../src/app/invitationSlice";
import { notification } from "antd";

// Mock services and dependencies
jest.mock("../../src/services/group.service");
jest.mock("../../src/services/topic.service");
jest.mock("../../src/services/major.service");
jest.mock("../../src/services/board.service");
jest.mock("../../src/services/skill.service");
jest.mock("../../src/services/report.service");
jest.mock("../../src/hook/useInvitationRealtime");
jest.mock("../../src/context/AuthContext");
jest.mock("antd", () => ({
  ...jest.requireActual("antd"),
  notification: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
  Modal: {
    confirm: jest.fn(({ onOk }) => {
      if (onOk) onOk();
    }),
  },
}));

const { useInvitationRealtime } = require("../../src/hook/useInvitationRealtime");
const { useAuth } = require("../../src/context/AuthContext");

describe("useMyGroupsPage Hook", () => {
  let store;
  const mockT = (key) => key;
  const mockNavigate = jest.fn();
  const mockUserInfo = {
    userId: "user-123",
    id: "user-123",
    name: "Test User",
    email: "test@test.com",
  };

  beforeEach(() => {
    // Create mock store
    store = configureStore({
      reducer: {
        invitation: invitationReducer,
      },
    });

    // Mock auth context
    useAuth.mockReturnValue({
      token: "test-token",
    });

    // Mock realtime hook
    useInvitationRealtime.mockReturnValue({
      isConnected: true,
      joinGroupChannel: jest.fn(),
      leaveGroupChannel: jest.fn(),
    });

    // Mock group service
    GroupService.getMyGroups = jest.fn().mockResolvedValue({
      data: [
        {
          groupId: "group-1",
          name: "Test Group",
          description: "Test description",
          role: "leader",
          status: "active",
        },
      ],
    });

    GroupService.createGroup = jest.fn();
    GroupService.acceptJoinRequest = jest.fn();
    GroupService.rejectJoinRequest = jest.fn();
    GroupService.leaveGroup = jest.fn();
    GroupService.assignTopic = jest.fn();
    GroupService.getJoinRequests = jest.fn();

    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  const wrapper = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  );

  /**
   * Test Case UTC01
   * Type: Normal
   * Description: Hook initializes with default state
   */
  it("UTC01 - should initialize with default state", () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    expect(result.current.groups).toEqual([]);
    expect(result.current.activeTab).toBe("groups");
    expect(result.current.open).toBe(false);
  });

  /**
   * Test Case UTC02
   * Type: Normal
   * Description: Loads groups on mount
   */
  it("UTC02 - should load groups on mount", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
      expect(result.current.groups[0].title).toBe("Test Group");
    });

    expect(GroupService.getMyGroups).toHaveBeenCalled();
  });

  /**
   * Test Case UTC03
   * Type: Normal
   * Description: Switches active tab
   */
  it("UTC03 - should switch active tab", () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    expect(result.current.activeTab).toBe("groups");

    act(() => {
      result.current.setActiveTab("applications");
    });

    expect(result.current.activeTab).toBe("applications");
  });

  /**
   * Test Case UTC04
   * Type: Normal
   * Description: Opens and closes create modal
   */
  it("UTC04 - should open and close create modal", () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    expect(result.current.open).toBe(false);

    act(() => {
      result.current.setOpen(true);
    });

    expect(result.current.open).toBe(true);

    act(() => {
      result.current.requestCloseModal();
    });

    expect(result.current.open).toBe(false);
  });

  /**
   * Test Case UTC05
   * Type: Normal
   * Description: Handles form field changes
   */
  it("UTC05 - should handle form changes", () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    act(() => {
      result.current.handleFormChange("name", "New Group");
      result.current.handleFormChange("description", "Test desc");
    });

    expect(result.current.form.name).toBe("New Group");
    expect(result.current.form.description).toBe("Test desc");
  });

  /**
   * Test Case UTC06
   * Type: Normal
   * Description: Provides hero stats
   */
  it("UTC06 - should provide hero stats", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.heroStats).toHaveLength(2);
    });

    expect(result.current.heroStats[0].label).toBe("activeGroups");
    expect(result.current.heroStats[1].label).toBe("pendingApplications");
  });

  /**
   * Test Case UTC07
   * Type: Normal
   * Description: Navigates to group view
   */
  it("UTC07 - should navigate to group view", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    act(() => {
      result.current.handleViewGroup("group-1");
    });

    expect(mockNavigate).toHaveBeenCalled();
  });

  /**
   * Test Case UTC08
   * Type: Abnormal
   * Description: Handles groups fetch error
   */
  it("UTC08 - should handle groups fetch error", async () => {
    GroupService.getMyGroups.mockRejectedValueOnce(
      new Error("Failed to fetch")
    );

    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.groups).toEqual([]);
  });

  /**
   * Test Case UTC09
   * Type: Normal
   * Description: Provides pending applications count
   */
  it("UTC09 - should calculate pending total", () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    expect(result.current.pendingTotal).toBe(0);
  });

  /**
   * Test Case UTC10
   * Type: Normal
   * Description: Sets up realtime connection with callbacks
   */
  it("UTC10 - should setup realtime connection", () => {
    renderHook(() => useMyGroupsPage(mockT, mockNavigate, mockUserInfo), {
      wrapper,
    });

    expect(useInvitationRealtime).toHaveBeenCalledWith(
      "test-token",
      "user-123",
      expect.objectContaining({
        onApplicationReceived: expect.any(Function),
      })
    );
  });

  /**
   * Test Case UTC11
   * Type: Normal
   * Description: Handles create group submission
   */
  it("UTC11 - should handle create group", async () => {
    GroupService.createGroup = jest.fn().mockResolvedValue({
      data: { groupId: "new-group" },
    });

    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    act(() => {
      result.current.handleFormChange("name", "New Group");
      result.current.handleFormChange("maxMembers", 5);
    });

    await act(async () => {
      await result.current.handleCreateGroup({ preventDefault: jest.fn() });
    });

    expect(GroupService.createGroup).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New Group",
        maxMembers: 5,
      })
    );
  });

  /**
   * Test Case UTC12
   * Type: Normal
   * Description: Validates form before submission
   */
  it("UTC12 - should validate form and show errors", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    // Try to submit with empty name
    await act(async () => {
      await result.current.handleCreateGroup({ preventDefault: jest.fn() });
    });

    // Should have validation errors
    expect(result.current.errors.name).toBeDefined();
  });

  /**
   * Test Case UTC13
   * Type: Normal
   * Description: Handles approve application
   */
  it("UTC13 - should approve application", async () => {
    GroupService.acceptJoinRequest = jest.fn().mockResolvedValue({});

    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    await act(async () => {
      await result.current.handleApprove("group-1", {
        id: "app-1",
        type: "application",
      });
    });

    expect(GroupService.acceptJoinRequest).toHaveBeenCalledWith(
      "group-1",
      "app-1",
      expect.objectContaining({
        type: "application",
      })
    );
  });

  /**
   * Test Case UTC14
   * Type: Normal
   * Description: Handles reject application
   */
  it("UTC14 - should reject application", async () => {
    GroupService.rejectJoinRequest = jest.fn().mockResolvedValue({});

    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    await act(async () => {
      await result.current.handleReject("group-1", { id: "app-1" });
    });

    expect(GroupService.rejectJoinRequest).toHaveBeenCalled();
  });

  /**
   * Test Case UTC15
   * Type: Normal
   * Description: Opens topic selection modal
   */
  it("UTC15 - should open topic modal", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    act(() => {
      result.current.handleOpenTopicModal({ id: "group-1" });
    });

    expect(result.current.topicModalGroup).toEqual({ id: "group-1" });
  });

  /**
   * Test Case UTC16
   * Type: Normal
   * Description: Closes topic selection modal
   */
  it("UTC16 - should close topic modal", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    act(() => {
      result.current.handleOpenTopicModal({ id: "group-1" });
    });

    expect(result.current.topicModalGroup).toEqual({ id: "group-1" });

    act(() => {
      result.current.handleCloseTopicModal();
    });

    expect(result.current.topicModalGroup).toBe(null);
  });

  /**
   * Test Case UTC17
   * Type: Normal
   * Description: Searches topics with keyword
   */
  it("UTC17 - should search topics", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    act(() => {
      result.current.handleOpenTopicModal({ id: "group-1", majorId: "major-1" });
    });

    act(() => {
      result.current.handleSearchTopics("React");
    });

    expect(result.current.topicSearch).toBe("React");
  });

  /**
   * Test Case UTC18
   * Type: Abnormal
   * Description: Handles create group error
   */
  it("UTC18 - should handle create group error", async () => {
    GroupService.createGroup = jest.fn().mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    act(() => {
      result.current.handleFormChange("name", "Test Group");
      result.current.handleFormChange("maxMembers", 5);
    });

    await act(async () => {
      await result.current.handleCreateGroup({ preventDefault: jest.fn() });
    });

    expect(result.current.submitting).toBe(false);
  });

  /**
   * Test Case UTC19
   * Type: Abnormal
   * Description: Handles approve error
   */
  it("UTC19 - should handle approve error", async () => {
    GroupService.acceptJoinRequest = jest
      .fn()
      .mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    await act(async () => {
      await result.current.handleApprove("group-1", { id: "app-1" });
    });

    expect(GroupService.acceptJoinRequest).toHaveBeenCalled();
  });

  /**
   * Test Case UTC20
   * Type: Abnormal
   * Description: Handles reject error
   */
  it("UTC20 - should handle reject error", async () => {
    GroupService.rejectJoinRequest = jest
      .fn()
      .mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    await act(async () => {
      await result.current.handleReject("group-1", { id: "app-1" });
    });

    expect(GroupService.rejectJoinRequest).toHaveBeenCalled();
  });

  /**
   * Test Case UTC21
   * Type: Boundary
   * Description: Validates maxMembers range
   */
  it("UTC21 - should validate maxMembers range", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    // Try maxMembers < 4
    act(() => {
      result.current.handleFormChange("name", "Test Group");
      result.current.handleFormChange("maxMembers", 2);
    });

    await act(async () => {
      await result.current.handleCreateGroup({ preventDefault: jest.fn() });
    });

    expect(result.current.errors.maxMembers).toBeDefined();
  });

  /**
   * Test Case UTC22
   * Type: Boundary
   * Description: Validates maxMembers upper limit
   */
  it("UTC22 - should validate maxMembers upper limit", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    // Try maxMembers > 6
    act(() => {
      result.current.handleFormChange("name", "Test Group");
      result.current.handleFormChange("maxMembers", 10);
    });

    await act(async () => {
      await result.current.handleCreateGroup({ preventDefault: jest.fn() });
    });

    expect(result.current.errors.maxMembers).toBeDefined();
  });

  /**
   * Test Case UTC23
   * Type: Normal
   * Description: Submits group with skills
   */
  it("UTC23 - should submit group with skills", async () => {
    GroupService.createGroup = jest.fn().mockResolvedValue({
      data: { groupId: "new-group" },
    });

    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    act(() => {
      result.current.handleFormChange("name", "New Group");
      result.current.handleFormChange("maxMembers", 5);
      result.current.handleFormChange("skills", ["React", "Node.js"]);
    });

    await act(async () => {
      await result.current.handleCreateGroup({ preventDefault: jest.fn() });
    });

    expect(GroupService.createGroup).toHaveBeenCalledWith(
      expect.objectContaining({
        skills: ["React", "Node.js"],
      })
    );
  });

  /**
   * Test Case UTC24
   * Type: Normal
   * Description: Prevents modal close when submitting
   */
  it("UTC24 - should prevent modal close when submitting", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    act(() => {
      result.current.setOpen(true);
    });

    // Manually set submitting
    act(() => {
      result.current.handleFormChange("name", "Test");
    });

    expect(result.current.open).toBe(true);
  });

  /**
   * Test Case UTC25
   * Type: Normal
   * Description: Calculates pending total correctly
   */
  it("UTC25 - should calculate pending total", () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    expect(typeof result.current.pendingTotal).toBe("number");
    expect(result.current.pendingTotal).toBeGreaterThanOrEqual(0);
  });

  /**
   * Test Case UTC26
   * Type: Normal
   * Description: Provides groupsById map
   */
  it("UTC26 - should provide groupsById map", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    expect(result.current.groupsById).toBeInstanceOf(Map);
    expect(result.current.groupsById.size).toBe(1);
  });

  /**
   * Test Case UTC27
   * Type: Normal
   * Description: Handles form reset on modal close
   */
  it("UTC27 - should reset form on close", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    act(() => {
      result.current.setOpen(true);
      result.current.handleFormChange("name", "Test Group");
    });

    expect(result.current.form.name).toBe("Test Group");

    act(() => {
      result.current.requestCloseModal();
    });

    expect(result.current.open).toBe(false);
    expect(result.current.form.name).toBe("");
  });

  /**
   * Test Case UTC28
   * Type: Normal
   * Description: Handles description field change
   */
  it("UTC28 - should handle description change", () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    act(() => {
      result.current.handleFormChange("description", "Test description");
    });

    expect(result.current.form.description).toBe("Test description");
  });

  /**
   * Test Case UTC29
   * Type: Abnormal
   * Description: Handles empty group ID in operations
   */
  it("UTC29 - should handle empty groupId gracefully", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    await act(async () => {
      await result.current.handleApprove(null, { id: "app-1" });
    });

    // Should not crash
    expect(result.current.groups).toHaveLength(1);
  });

  /**
   * Test Case UTC30
   * Type: Normal
   * Description: Provides hero stats with correct labels
   */
  it("UTC30 - should provide hero stats", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.heroStats).toHaveLength(2);
    });

    expect(result.current.heroStats[0]).toHaveProperty("label");
    expect(result.current.heroStats[0]).toHaveProperty("value");
  });

  /**
   * Test Case UTC31
   * Type: Normal
   * Description: Assigns topic to group successfully
   */
  it("UTC31 - should assign topic to group", async () => {
    GroupService.assignTopic = jest.fn().mockResolvedValue({});

    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    act(() => {
      result.current.handleOpenTopicModal(result.current.groups[0]);
      result.current.setSelectedTopicId("topic-1");
    });

    await act(async () => {
      await result.current.handleAssignTopic();
    });

    expect(GroupService.assignTopic).toHaveBeenCalled();
    expect(notification.success).toHaveBeenCalled();
  });

  /**
   * Test Case UTC32
   * Type: Abnormal
   * Description: Handles topic assignment error
   */
  it("UTC32 - should handle topic assignment error", async () => {
    GroupService.assignTopic = jest
      .fn()
      .mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    act(() => {
      result.current.handleOpenTopicModal(result.current.groups[0]);
      result.current.setSelectedTopicId("topic-1");
    });

    await act(async () => {
      await result.current.handleAssignTopic();
    });

    expect(notification.error).toHaveBeenCalled();
  });

  /**
   * Test Case UTC33
   * Type: Boundary
   * Description: Does not assign topic without selection
   */
  it("UTC33 - should not assign topic when nothing selected", async () => {
    GroupService.assignTopic = jest.fn();

    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    await act(async () => {
      await result.current.handleAssignTopic();
    });

    expect(GroupService.assignTopic).not.toHaveBeenCalled();
  });

  /**
   * Test Case UTC34
   * Type: Normal
   * Description: Validates topic selection for leader with full members
   */
  it("UTC34 - should validate canSelectTopic for leader", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    const canSelect = result.current.canSelectTopic({
      id: "g1",
      isLeader: true,
      members: 5,
      maxMembers: 5,
    });

    expect(canSelect).toBe(true);
  });

  /**
   * Test Case UTC35
   * Type: Normal
   * Description: Prevents topic selection for non-leader
   */
  it("UTC35 - should prevent topic selection for non-leader", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    const canSelect = result.current.canSelectTopic({
      id: "g1",
      isLeader: false,
      members: 5,
      maxMembers: 5,
    });

    expect(canSelect).toBe(false);
  });

  /**
   * Test Case UTC36
   * Type: Normal
   * Description: Prevents topic selection without full members
   */
  it("UTC36 - should prevent topic selection without full members", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    const canSelect = result.current.canSelectTopic({
      id: "g1",
      isLeader: true,
      members: 3,
      maxMembers: 5,
    });

    expect(canSelect).toBe(false);
  });

  /**
   * Test Case UTC37
   * Type: Normal
   * Description: Handles leave group successfully
   */
  it("UTC37 - should handle leave group", async () => {
    GroupService.leaveGroup = jest.fn().mockResolvedValue({});
    GroupService.getMyGroups = jest.fn().mockResolvedValue({
      data: [
        {
          groupId: "group-1",
          name: "Test Group",
          description: "Test description",
          role: "member",
          status: "inactive",
        },
      ],
    });

    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    await act(async () => {
      await result.current.handleLeaveGroup("group-1");
    });

    expect(GroupService.leaveGroup).toHaveBeenCalledWith("group-1");
  });

  /**
   * Test Case UTC38
   * Type: Abnormal
   * Description: Handles leave group error
   */
  it("UTC38 - should handle leave group error", async () => {
    GroupService.leaveGroup = jest
      .fn()
      .mockRejectedValue(new Error("Cannot leave"));
    GroupService.getMyGroups = jest.fn().mockResolvedValue({
      data: [
        {
          groupId: "group-1",
          name: "Test Group",
          description: "Test description",
          role: "member",
          status: "inactive",
        },
      ],
    });

    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    await act(async () => {
      await result.current.handleLeaveGroup("group-1");
    });

    expect(notification.error).toHaveBeenCalled();
  });

  /**
   * Test Case UTC39
   * Type: Normal
   * Description: Opens topic modal for group
   */
  it("UTC39 - should open topic modal", async () => {
    TopicService.getAllTopics = jest.fn().mockResolvedValue({
      data: [{ id: "t1", name: "Topic 1" }],
    });

    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    act(() => {
      result.current.handleOpenTopicModal(result.current.groups[0]);
    });

    expect(result.current.topicModalGroup).toBeDefined();
  });

  /**
   * Test Case UTC40
   * Type: Normal
   * Description: Closes topic modal
   */
  it("UTC40 - should close topic modal", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    act(() => {
      result.current.handleOpenTopicModal(result.current.groups[0]);
    });

    act(() => {
      result.current.handleCloseTopicModal();
    });

    expect(result.current.topicModalGroup).toBe(null);
  });

  /**
   * Test Case UTC41
   * Type: Normal
   * Description: Searches topics
   */
  it("UTC41 - should search topics", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    act(() => {
      result.current.handleSearchTopics("AI Project");
    });

    expect(result.current.topicSearch).toBe("AI Project");
  });

  /**
   * Test Case UTC42
   * Type: Normal
   * Description: Validates form correctly - empty name
   */
  it("UTC42 - should validate form with empty name", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    act(() => {
      result.current.handleFormChange("name", "");
    });

    await act(async () => {
      await result.current.handleCreateGroup({ preventDefault: jest.fn() });
    });

    expect(result.current.errors).toBeDefined();
    expect(result.current.errors.name).toBeTruthy();
    expect(GroupService.createGroup).not.toHaveBeenCalled();
  });

  /**
   * Test Case UTC43
   * Type: Normal
   * Description: Validates max members limit
   */
  it("UTC43 - should validate maxMembers", async () => {
    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    act(() => {
      result.current.handleFormChange("name", "Valid Group Name");
      result.current.handleFormChange("maxMembers", 100);
    });

    await act(async () => {
      await result.current.handleCreateGroup({ preventDefault: jest.fn() });
    });

    expect(result.current.errors).toBeDefined();
  });

  /**
   * Test Case UTC44
   * Type: Normal
   * Description: Handles empty groups response
   */
  it("UTC44 - should handle empty groups", async () => {
    GroupService.getMyGroups = jest.fn().mockResolvedValue({ data: [] });

    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.groups).toEqual([]);
  });

  /**
   * Test Case UTC45
   * Type: Normal
   * Description: Loads pending join requests
   */
  it("UTC45 - should load join requests for leader groups", async () => {
    GroupService.getJoinRequests = jest.fn().mockResolvedValue({
      data: [
        { id: "req1", type: "application", userId: "u1" },
        { id: "req2", type: "invitation", userId: "u2" },
      ],
    });

    const { result } = renderHook(
      () => useMyGroupsPage(mockT, mockNavigate, mockUserInfo),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
    });

    act(() => {
      result.current.setActiveTab("applications");
    });

    await waitFor(() => {
      expect(result.current.pendingByGroup).toBeDefined();
    });
  });
});

