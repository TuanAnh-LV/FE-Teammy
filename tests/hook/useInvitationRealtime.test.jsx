/**
 * Test Code: FE-TM-Hook-useInvitationRealtime
 * Test Name: useInvitationRealtime Hook Test
 * Description: Test real-time invitation event handling hook
 * Author: Test Suite
 * Date: 2024
 */

import { renderHook, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useInvitationRealtime } from "../../src/hook/useInvitationRealtime";
import invitationReducer from "../../src/app/invitationSlice";

// Mock the SignalR hook
jest.mock("../../src/hook/useGroupInvitationSignalR");
const { useGroupInvitationSignalR } = require("../../src/hook/useGroupInvitationSignalR");

describe("useInvitationRealtime Hook", () => {
  let store;
  let mockConnection;
  let registeredCallbacks;

  beforeEach(() => {
    // Create mock store
    store = configureStore({
      reducer: {
        invitation: invitationReducer,
      },
    });

    // Mock connection
    mockConnection = {
      invoke: jest.fn().mockResolvedValue(undefined),
    };

    // Track registered callbacks
    registeredCallbacks = {};

    // Mock SignalR hook to capture callbacks
    useGroupInvitationSignalR.mockImplementation((token, userId, callbacks) => {
      registeredCallbacks = callbacks;
      return {
        isConnected: true,
        state: "Connected",
        connection: mockConnection,
      };
    });

    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    if (console.log.mockRestore) console.log.mockRestore();
    if (console.warn.mockRestore) console.warn.mockRestore();
    if (console.error.mockRestore) console.error.mockRestore();
  });

  /**
   * Test Case UTC01
   * Type: Normal
   * Description: Hook initializes with connection and returns methods
   */
  it("UTC01 - should initialize and return connection methods", () => {
    const { result } = renderHook(
      () => useInvitationRealtime("token123", "user456"),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      }
    );

    expect(result.current.isConnected).toBe(true);
    expect(result.current.connectionState).toBe("Connected");
    expect(result.current.joinGroupChannel).toBeInstanceOf(Function);
    expect(result.current.leaveGroupChannel).toBeInstanceOf(Function);
  });

  /**
   * Test Case UTC02
   * Type: Normal
   * Description: Handles InvitationCreated event and dispatches to store
   */
  it("UTC02 - should handle InvitationCreated event", async () => {
    renderHook(() => useInvitationRealtime("token123", "user456"), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    const invitation = {
      invitationId: "inv-001",
      groupId: "group-123",
      groupName: "Test Group",
      postId: "post-001",
      postTitle: "Need React Developer",
      invitedBy: "John Doe",
      candidateId: "candidate-001",
      status: "pending",
    };

    // Trigger the InvitationCreated event
    registeredCallbacks.onInvitationCreated(invitation);

    await waitFor(() => {
      const state = store.getState();
      expect(state.invitation.pendingInvitations).toHaveLength(1);
      expect(state.invitation.pendingInvitations[0]).toMatchObject({
        id: "inv-001",
        groupName: "Test Group",
        status: "pending",
      });
    });
  });

  /**
   * Test Case UTC03
   * Type: Normal
   * Description: Normalizes invitation data with fallback ID
   */
  it("UTC03 - should normalize invitation with fallback ID", async () => {
    renderHook(() => useInvitationRealtime("token123", "user456"), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    const invitation = {
      // No invitationId
      postId: "post-123",
      candidateId: "candidate-456",
      groupName: "Test Group",
    };

    registeredCallbacks.onInvitationCreated(invitation);

    await waitFor(() => {
      const state = store.getState();
      expect(state.invitation.pendingInvitations[0].id).toBe("post-123-candidate-456");
    });
  });

  /**
   * Test Case UTC04
   * Type: Normal
   * Description: Handles InvitationStatusChanged event
   */
  it("UTC04 - should handle InvitationStatusChanged event", async () => {
    // First add an invitation
    store.dispatch({
      type: "invitation/addPendingInvitation",
      payload: {
        id: "inv-001",
        groupName: "Test Group",
        status: "pending",
      },
    });

    renderHook(() => useInvitationRealtime("token123", "user456"), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // Change status
    registeredCallbacks.onInvitationStatusChanged({
      invitationId: "inv-001",
      status: "accepted",
    });

    await waitFor(() => {
      const state = store.getState();
      expect(state.invitation.pendingInvitations[0].status).toBe("accepted");
    });
  });

  /**
   * Test Case UTC05
   * Type: Abnormal
   * Description: Handles status change with missing invitationId
   */
  it("UTC05 - should warn when status change has no invitationId", () => {
    renderHook(() => useInvitationRealtime("token123", "user456"), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    registeredCallbacks.onInvitationStatusChanged({
      status: "accepted",
      // No invitationId
    });

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("Missing invitationId")
    );
  });

  /**
   * Test Case UTC06
   * Type: Normal
   * Description: Handles PendingUpdated event with candidates
   */
  it("UTC06 - should handle PendingUpdated with pending candidates", async () => {
    renderHook(() => useInvitationRealtime("token123", "user456"), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    const payload = {
      groupId: "group-123",
      candidates: [
        {
          id: "app-001",
          userId: "user-001",
          userName: "Jane Smith",
          status: "pending",
          skills: ["React", "TypeScript"],
        },
      ],
    };

    registeredCallbacks.onPendingUpdated(payload);

    await waitFor(() => {
      const state = store.getState();
      expect(state.invitation.applications).toHaveLength(1);
      expect(state.invitation.applications[0].userName).toBe("Jane Smith");
    });
  });

  /**
   * Test Case UTC07
   * Type: Normal
   * Description: Calls custom callback when invitation received
   */
  it("UTC07 - should call onInvitationReceived callback", () => {
    const onInvitationReceived = jest.fn();

    renderHook(
      () =>
        useInvitationRealtime("token123", "user456", {
          onInvitationReceived,
        }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      }
    );

    const invitation = {
      invitationId: "inv-001",
      groupName: "Test Group",
    };

    registeredCallbacks.onInvitationCreated(invitation);

    expect(onInvitationReceived).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "inv-001",
        groupName: "Test Group",
      })
    );
  });

  /**
   * Test Case UTC08
   * Type: Normal
   * Description: Join group channel invokes SignalR method
   */
  it("UTC08 - should join group channel", async () => {
    const { result } = renderHook(
      () => useInvitationRealtime("token123", "user456"),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      }
    );

    await result.current.joinGroupChannel("group-123");

    expect(mockConnection.invoke).toHaveBeenCalledWith("JoinGroup", "group-123");
  });

  /**
   * Test Case UTC09
   * Type: Normal
   * Description: Leave group channel invokes SignalR method
   */
  it("UTC09 - should leave group channel", async () => {
    const { result } = renderHook(
      () => useInvitationRealtime("token123", "user456"),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      }
    );

    await result.current.leaveGroupChannel("group-123");

    expect(mockConnection.invoke).toHaveBeenCalledWith("LeaveGroup", "group-123");
  });

  /**
   * Test Case UTC10
   * Type: Abnormal
   * Description: Cannot join group when not connected
   */
  it("UTC10 - should not join group when disconnected", async () => {
    useGroupInvitationSignalR.mockReturnValue({
      isConnected: false,
      state: "Disconnected",
      connection: null,
    });

    const { result } = renderHook(
      () => useInvitationRealtime("token123", "user456"),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      }
    );

    await result.current.joinGroupChannel("group-123");

    expect(mockConnection.invoke).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("Cannot join group")
    );
  });

  /**
   * Test Case UTC11
   * Type: Abnormal
   * Description: Handles error in onInvitationStatusChanged callback
   */
  it("UTC11 - should handle invalid invitationId gracefully", async () => {
    const consoleWarn = jest.spyOn(console, "warn").mockImplementation();
    
    renderHook(() => useInvitationRealtime("token123", "user456"), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // Trigger with no invitationId
    registeredCallbacks.onInvitationStatusChanged({
      status: "accepted",
    });

    expect(consoleWarn).toHaveBeenCalled();

    consoleWarn.mockRestore();
  });

  /**
   * Test Case UTC12
   * Type: Normal
   * Description: Handles multiple group channel joins
   */
  it("UTC12 - should handle joining multiple groups", async () => {
    const { result } = renderHook(
      () => useInvitationRealtime("token123", "user456"),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      }
    );

    await act(async () => {
      await result.current.joinGroupChannel("group-1");
      await result.current.joinGroupChannel("group-2");
      await result.current.joinGroupChannel("group-3");
    });

    expect(mockConnection.invoke).toHaveBeenCalledTimes(3);
    expect(mockConnection.invoke).toHaveBeenCalledWith("JoinGroup", "group-1");
    expect(mockConnection.invoke).toHaveBeenCalledWith("JoinGroup", "group-2");
    expect(mockConnection.invoke).toHaveBeenCalledWith("JoinGroup", "group-3");
  });

  /**
   * Test Case UTC13
   * Type: Normal
   * Description: Handles multiple group channel leaves
   */
  it("UTC13 - should handle leaving multiple groups", async () => {
    const { result } = renderHook(
      () => useInvitationRealtime("token123", "user456"),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      }
    );

    await act(async () => {
      await result.current.leaveGroupChannel("group-1");
      await result.current.leaveGroupChannel("group-2");
    });

    expect(mockConnection.invoke).toHaveBeenCalledWith("LeaveGroup", "group-1");
    expect(mockConnection.invoke).toHaveBeenCalledWith("LeaveGroup", "group-2");
  });

  /**
   * Test Case UTC14
   * Type: Abnormal
   * Description: Handles PendingUpdated with no candidates
   */
  it("UTC14 - should handle PendingUpdated with empty candidates", async () => {
    renderHook(() => useInvitationRealtime("token123", "user456"), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    registeredCallbacks.onPendingUpdated({
      groupId: "group-123",
      candidates: [],
    });

    // Should not crash
    const state = store.getState();
    expect(state.invitation.applications).toEqual([]);
  });

  /**
   * Test Case UTC15
   * Type: Normal
   * Description: Returns correct connection status
   */
  it("UTC15 - should return isConnected status", () => {
    const { result } = renderHook(
      () => useInvitationRealtime("token123", "user456"),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      }
    );

    expect(result.current.isConnected).toBe(true);
  });
});

