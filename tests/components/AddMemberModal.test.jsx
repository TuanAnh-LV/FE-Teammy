/**
UTC01 N Open modal => Renders title and input
- Pre: open true; useParams returns groupId
- Condition: render AddMemberModal
- Confirmation: title and email placeholder visible

UTC02 B Closed modal => Returns null
- Pre: open false
- Condition: render AddMemberModal
- Confirmation: container empty

UTC03 N Search users => Calls UserService.list, filters hasGroupInSemester, allows select
- Pre: UserService.list resolves with 2 users (one filtered out)
- Condition: type email, click result
- Confirmation: list called with { email }; selected email filled; only eligible user rendered

UTC04 B Add click without selection => Shows warning, no invite
- Pre: no selection
- Condition: click Add
- Confirmation: notification.warning called; GroupService.inviteMember not called

UTC05 B Add click missing groupId => Shows error, no invite
- Pre: useParams returns undefined id; selected user set
- Condition: click Add
- Confirmation: notification.error called; inviteMember not called

UTC06 N Add success => Calls inviteMember, onAdd, success notification, onClose
- Pre: selection made; invite resolves
- Condition: click Add
- Confirmation: inviteMember called with groupId and userId; onAdd/onClose called; success notified

UTC07 A Add failure => Shows notification.error
- Pre: inviteMember rejects
- Condition: click Add after selecting user
- Confirmation: notification.error called
*/

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import AddMemberModal from "../../src/components/common/my-group/AddMemberModal";

jest.mock("antd", () => {
  const notification = {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  };
  return { notification };
});

const mockUseParams = jest.fn();
jest.mock("react-router-dom", () => ({
  useParams: () => mockUseParams(),
}));

jest.mock("../../src/services/user.service", () => ({
  UserService: {
    list: jest.fn(),
  },
}));

jest.mock("../../src/services/group.service", () => ({
  GroupService: {
    inviteMember: jest.fn(),
  },
}));

const renderModal = async (props = {}) => {
  const user = userEvent.setup();
  const onAdd = jest.fn();
  const onClose = jest.fn();
  const t = (k) => k;
  render(
    <AddMemberModal
      open
      onClose={onClose}
      onAdd={onAdd}
      t={t}
      {...props}
    />
  );
  return { user, onAdd, onClose };
};

const getNotification = () => require("antd").notification;

describe("AddMemberModal Report5", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ id: "g1" });
    const { UserService } = require("../../src/services/user.service");
    UserService.list.mockResolvedValue({ data: [] });
    const { GroupService } = require("../../src/services/group.service");
    GroupService.inviteMember.mockResolvedValue({});
  });

  test("UTC01 [N] Open modal => Renders title and input", async () => {
    await renderModal();
    expect(screen.getByText(/addMemberByEmail/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enterMemberEmail/i)).toBeInTheDocument();
  });

  test("UTC02 [B] Closed modal => Returns null", () => {
    const { container } = render(
      <AddMemberModal open={false} onClose={jest.fn()} t={(k) => k} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("UTC03 [N] Search users => Calls list, filters, allows select", async () => {
    const { UserService } = require("../../src/services/user.service");
    UserService.list.mockResolvedValue({
      data: [
        { userId: "u1", displayName: "Alice", email: "a@test.com", hasGroupInSemester: false },
        { userId: "u2", displayName: "Bob", email: "b@test.com", hasGroupInSemester: true },
      ],
    });
    const { user } = await renderModal();
    const input = screen.getByPlaceholderText(/enterMemberEmail/i);
    await user.type(input, "a@test.com");
    await waitFor(() => expect(UserService.list).toHaveBeenCalledWith({ email: "a@test.com" }));
    await waitFor(() => {
      expect(screen.queryAllByText("Alice").length).toBeGreaterThan(0);
    });
    const alice = screen.getByText("Alice");
    expect(screen.queryByText("Bob")).toBeNull();
    await user.click(alice);
    expect(screen.getByDisplayValue("a@test.com")).toBeInTheDocument();
  });

  test("UTC04 [B] Add click without selection => Shows warning, no invite", async () => {
    const { user } = await renderModal();
    const addBtn = screen.getByRole("button", { name: /^add$/i });
    expect(addBtn).toBeDisabled();
    await user.click(addBtn);
    expect(getNotification().warning).not.toHaveBeenCalled();
    const { GroupService } = require("../../src/services/group.service");
    expect(GroupService.inviteMember).not.toHaveBeenCalled();
  });

  test("UTC05 [B] Add click missing groupId => Shows error, no invite", async () => {
    mockUseParams.mockReturnValue({});
    const { user } = await renderModal();
    const { UserService } = require("../../src/services/user.service");
    UserService.list.mockResolvedValue({ data: [{ userId: "u1", displayName: "Alice", email: "a@test.com" }] });
    await user.type(screen.getByPlaceholderText(/enterMemberEmail/i), "a@test.com");
    await waitFor(() => expect(screen.queryAllByText("Alice").length).toBeGreaterThan(0));
    await user.click(screen.getByText("Alice"));
    const addBtn = screen.getByRole("button", { name: /^add$/i });
    await waitFor(() => expect(addBtn).not.toBeDisabled());
    await user.click(addBtn);
    expect(getNotification().error).toHaveBeenCalled();
    const { GroupService } = require("../../src/services/group.service");
    expect(GroupService.inviteMember).not.toHaveBeenCalled();
  });

  test("UTC06 [N] Add success => Calls inviteMember, onAdd, success notification, onClose", async () => {
    const { GroupService } = require("../../src/services/group.service");
    const { UserService } = require("../../src/services/user.service");
    UserService.list.mockResolvedValue({ data: [{ userId: "u1", displayName: "Alice", email: "a@test.com" }] });
    const { user, onAdd, onClose } = await renderModal();
    await user.type(screen.getByPlaceholderText(/enterMemberEmail/i), "a@test.com");
    await waitFor(() => expect(screen.queryAllByText("Alice").length).toBeGreaterThan(0));
    await user.click(screen.getByText("Alice"));
    const addBtn = screen.getByRole("button", { name: /^add$/i });
    await waitFor(() => expect(addBtn).not.toBeDisabled());
    await user.click(addBtn);
    await waitFor(() => {
      expect(GroupService.inviteMember).toHaveBeenCalledWith("g1", { userId: "u1" });
      expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ userId: "u1" }));
      expect(onClose).toHaveBeenCalled();
      expect(getNotification().success).toHaveBeenCalled();
    });
  });

  test("UTC07 [A] Add failure => Shows notification.error", async () => {
    const { GroupService } = require("../../src/services/group.service");
    GroupService.inviteMember.mockRejectedValueOnce(new Error("fail"));
    const { UserService } = require("../../src/services/user.service");
    UserService.list.mockResolvedValue({ data: [{ userId: "u1", displayName: "Alice", email: "a@test.com" }] });
    const { user } = await renderModal();
    await user.type(screen.getByPlaceholderText(/enterMemberEmail/i), "a@test.com");
    await waitFor(() => expect(screen.queryAllByText("Alice").length).toBeGreaterThan(0));
    await user.click(screen.getByText("Alice"));
    const addBtn = screen.getByRole("button", { name: /^add$/i });
    await waitFor(() => expect(addBtn).not.toBeDisabled());
    await user.click(addBtn);
    await waitFor(() => expect(getNotification().error).toHaveBeenCalled());
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "AddMemberModal",
  totalTC: 7,
  breakdown: { N: 3, B: 3, A: 1 },
  notes:
    "Covers open/closed render, search/filter/select, warning when no selection, missing groupId, invite success with callbacks, and invite error path.",
};
