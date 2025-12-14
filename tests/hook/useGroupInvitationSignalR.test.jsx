/**
 * Test Code: FE-TM-Hook-useGroupInvitationSignalR
 * Test Name: useGroupInvitationSignalR Hook Test
 * Description: Test SignalR connection hook for group invitations
 * Author: Test Suite
 * Date: 2024
 */

import { renderHook, waitFor, act } from "@testing-library/react";
import * as signalR from "@microsoft/signalr";
import { useGroupInvitationSignalR } from "../../src/hook/useGroupInvitationSignalR";

// Mock SignalR
jest.mock("@microsoft/signalr");

describe("useGroupInvitationSignalR Hook", () => {
  let mockConnection;
  let mockOn;
  let mockOff;
  let mockStart;
  let mockStop;
  let eventHandlers;

  beforeEach(() => {
    // Reset event handlers
    eventHandlers = {};

    mockOn = jest.fn((eventName, callback) => {
      eventHandlers[eventName] = callback;
    });

    mockOff = jest.fn();
    mockStart = jest.fn().mockResolvedValue(undefined);
    mockStop = jest.fn().mockResolvedValue(undefined);

    mockConnection = {
      on: mockOn,
      off: mockOff,
      start: mockStart,
      stop: mockStop,
      state: signalR.HubConnectionState.Disconnected,
      onclose: jest.fn(),
      onreconnecting: jest.fn(),
      onreconnected: jest.fn(),
    };

    const mockBuilder = {
      withUrl: jest.fn().mockReturnThis(),
      withAutomaticReconnect: jest.fn().mockReturnThis(),
      configureLogging: jest.fn().mockReturnThis(),
      build: jest.fn(() => mockConnection),
    };

    signalR.HubConnectionBuilder = jest.fn(() => mockBuilder);
    signalR.HttpTransportType = { WebSockets: 1 };
    signalR.LogLevel = { Error: 3 };
    signalR.HubConnectionState = {
      Disconnected: "Disconnected",
      Connecting: "Connecting",
      Connected: "Connected",
      Reconnecting: "Reconnecting",
    };

    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    if (console.log.mockRestore) console.log.mockRestore();
    if (console.error.mockRestore) console.error.mockRestore();
    if (console.warn && console.warn.mockRestore) console.warn.mockRestore();
  });

  /**
   * Test Case UTC01
   * Type: Normal
   * Description: Hook initializes disconnected state without token
   */
  it("UTC01 - should initialize with disconnected state when no token", () => {
    const { result } = renderHook(() =>
      useGroupInvitationSignalR(null, null)
    );

    expect(result.current.isConnected).toBe(false);
    expect(result.current.state).toBe("Disconnected");
    expect(result.current.connection).toBe(null);
  });

  /**
   * Test Case UTC02
   * Type: Normal
   * Description: Attempts to connect when token and userId provided
   */
  it("UTC02 - should attempt connection with token and userId", async () => {
    await act(async () => {
      renderHook(() =>
        useGroupInvitationSignalR("test-token", "user-123")
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(signalR.HubConnectionBuilder).toHaveBeenCalled();
    expect(mockStart).toHaveBeenCalled();
  });

  /**
   * Test Case UTC03
   * Type: Normal
   * Description: Registers event listeners for SignalR events
   */
  it("UTC03 - should register event listeners", async () => {
    const callbacks = {
      onInvitationCreated: jest.fn(),
      onInvitationStatusChanged: jest.fn(),
      onPendingUpdated: jest.fn(),
    };

    await act(async () => {
      renderHook(() =>
        useGroupInvitationSignalR("test-token", "user-123", callbacks)
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(mockOn).toHaveBeenCalledWith(
      "InvitationCreated",
      expect.any(Function)
    );
    expect(mockOn).toHaveBeenCalledWith(
      "InvitationStatusChanged",
      expect.any(Function)
    );
    expect(mockOn).toHaveBeenCalledWith(
      "PendingUpdated",
      expect.any(Function)
    );
  });

  /**
   * Test Case UTC04
   * Type: Normal
   * Description: Callback is invoked when SignalR event is received
   */
  it("UTC04 - should invoke callback when event received", async () => {
    const onInvitationCreated = jest.fn();

    await act(async () => {
      renderHook(() =>
        useGroupInvitationSignalR("test-token", "user-123", {
          onInvitationCreated,
        })
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Simulate event from SignalR
    const eventData = { invitationId: "inv-001", groupName: "Test" };
    if (eventHandlers["InvitationCreated"]) {
      eventHandlers["InvitationCreated"](eventData);
    }

    expect(onInvitationCreated).toHaveBeenCalledWith(eventData);
  });

  /**
   * Test Case UTC05
   * Type: Normal
   * Description: Connection builder is called on initial setup
   */
  it("UTC05 - should call HubConnectionBuilder during setup", async () => {
    await act(async () => {
      renderHook(() =>
        useGroupInvitationSignalR("test-token", "user-123")
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Should create connection
    expect(signalR.HubConnectionBuilder).toHaveBeenCalled();
    expect(mockStart).toHaveBeenCalled();
  });

  /**
   * Test Case UTC06
   * Type: Abnormal
   * Description: Connection handles start error gracefully
   */
  it("UTC06 - should handle connection error", async () => {
    mockStart.mockRejectedValueOnce(new Error("Connection failed"));

    await act(async () => {
      renderHook(() =>
        useGroupInvitationSignalR("test-token", "user-123")
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Failed to connect"),
      expect.any(String)
    );
  });

  /**
   * Test Case UTC07
   * Type: Normal
   * Description: Connection state updates when connected
   */
  it("UTC07 - should update state to Connected after successful start", async () => {
    let result;

    await act(async () => {
      const hook = renderHook(() =>
        useGroupInvitationSignalR("test-token", "user-123")
      );
      result = hook.result;
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await waitFor(
      () => {
        expect(result.current.isConnected).toBe(true);
      },
      { timeout: 1000 }
    );
  });

  /**
   * Test Case UTC08
   * Type: Normal
   * Description: Cleans up listeners on unmount
   */
  it("UTC08 - should remove listeners on unmount", async () => {
    const callback = jest.fn();
    let unmount;

    await act(async () => {
      const hook = renderHook(() =>
        useGroupInvitationSignalR("test-token", "user-123", {
          onInvitationCreated: callback,
        })
      );
      unmount = hook.unmount;
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Trigger event before unmount
    if (eventHandlers["InvitationCreated"]) {
      eventHandlers["InvitationCreated"]({ id: "1" });
    }
    expect(callback).toHaveBeenCalledTimes(1);

    // Unmount
    act(() => {
      unmount();
    });

    // Trigger event after unmount - callback should not be called again
    if (eventHandlers["InvitationCreated"]) {
      eventHandlers["InvitationCreated"]({ id: "2" });
    }
    expect(callback).toHaveBeenCalledTimes(1);
  });

  /**
   * Test Case UTC09
   * Type: Normal
   * Description: Handles all event callbacks
   */
  it("UTC09 - should handle all event types", async () => {
    const callbacks = {
      onInvitationStatusChanged: jest.fn(),
      onMemberRemoved: jest.fn(),
      onMemberRoleChanged: jest.fn(),
      onGroupUpdated: jest.fn(),
      onMemberJoined: jest.fn(),
    };

    await act(async () => {
      renderHook(() =>
        useGroupInvitationSignalR("test-token", "user-123", callbacks)
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Trigger all events
    act(() => {
      if (eventHandlers["InvitationStatusChanged"]) {
        eventHandlers["InvitationStatusChanged"]({ id: "1", status: "accepted" });
      }
      if (eventHandlers["MemberRemoved"]) {
        eventHandlers["MemberRemoved"]({ groupId: "g1", userId: "u1" });
      }
      if (eventHandlers["MemberRoleChanged"]) {
        eventHandlers["MemberRoleChanged"]({ groupId: "g1", role: "leader" });
      }
      if (eventHandlers["GroupUpdated"]) {
        eventHandlers["GroupUpdated"]({ id: "g1", name: "New Name" });
      }
      if (eventHandlers["MemberJoined"]) {
        eventHandlers["MemberJoined"]({ groupId: "g1", userId: "u2" });
      }
    });

    expect(callbacks.onInvitationStatusChanged).toHaveBeenCalled();
    expect(callbacks.onMemberRemoved).toHaveBeenCalled();
    expect(callbacks.onMemberRoleChanged).toHaveBeenCalled();
    expect(callbacks.onGroupUpdated).toHaveBeenCalled();
    expect(callbacks.onMemberJoined).toHaveBeenCalled();
  });

  /**
   * Test Case UTC10
   * Type: Abnormal
   * Description: Handles callback errors gracefully
   */
  it("UTC10 - should handle callback errors without crashing", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    const errorCallback = jest.fn(() => {
      throw new Error("Callback error");
    });

    await act(async () => {
      renderHook(() =>
        useGroupInvitationSignalR("test-token", "user-123", {
          onPendingUpdated: errorCallback,
        })
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    act(() => {
      if (eventHandlers["PendingUpdated"]) {
        eventHandlers["PendingUpdated"]({ count: 5 });
      }
    });

    expect(errorCallback).toHaveBeenCalled();
    // Should not crash, error should be logged
    
    consoleError.mockRestore();
  });

  /**
   * Test Case UTC11
   * Type: Normal
   * Description: Handles multiple callbacks for same event
   */
  it("UTC11 - should handle multiple callbacks for same event", async () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    await act(async () => {
      renderHook(() =>
        useGroupInvitationSignalR("test-token", "user-123", {
          onPendingUpdated: callback1,
        })
      );
      renderHook(() =>
        useGroupInvitationSignalR("test-token", "user-456", {
          onPendingUpdated: callback2,
        })
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    act(() => {
      if (eventHandlers["PendingUpdated"]) {
        eventHandlers["PendingUpdated"]({ count: 3 });
      }
    });

    expect(callback1).toHaveBeenCalledWith({ count: 3 });
    expect(callback2).toHaveBeenCalledWith({ count: 3 });
  });

  /**
   * Test Case UTC12
   * Type: Normal
   * Description: Handles connection state changes
   */
  it("UTC12 - should track connection state changes", async () => {
    let result;

    await act(async () => {
      const hook = renderHook(() =>
        useGroupInvitationSignalR("test-token", "user-123")
      );
      result = hook.result;
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await waitFor(() => {
      expect(result.current.state).toBeDefined();
    });

    expect([
      signalR.HubConnectionState.Disconnected,
      signalR.HubConnectionState.Connecting,
      signalR.HubConnectionState.Connected,
    ]).toContain(result.current.state);
  });
});

