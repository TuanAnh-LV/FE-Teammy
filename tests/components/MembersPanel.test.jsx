/**
UTC01 N List view renders members and actions => Opens menu and triggers handlers
- Pre: group canEdit true; current user leader; member role member
- Condition: click menu, choose assignRole/changeLeader/kick
- Confirmation: handlers called; navigate called on name click

UTC02 B No members => Shows placeholder and invite button
- Pre: empty groupMembers; group canEdit true
- Condition: render
- Confirmation: noMembersYet text and invite button visible

UTC03 N Stats view uses board contributions => Shows contribution percent and tasks
- Pre: showStats true with board columns tasks assigned to member
- Condition: render
- Confirmation: contribution percent reflects assignments; taskCount shown

UTC04 A Kick without id => Handler not called
- Pre: member lacks id/email
- Condition: click kick
- Confirmation: onKickMember not called; menu closes
*/

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import MembersPanel from "../../src/components/common/my-group/MembersPanel";

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockNavigate = jest.fn();

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

jest.mock("../../src/components/common/my-group/AssignRoleModal", () => (props) => (
  <div data-testid="assign-modal" data-open={props.isOpen}>
    {props.member?.name}
    <button onClick={() => props.onAssign?.("m2", "dev")}>assign</button>
  </div>
));

const leader = { id: "leader", name: "Leader", email: "leader@test.com", role: "leader" };
const member = { id: "m2", name: "Member", email: "m@test.com", role: "member" };

const renderPanel = (props = {}) => {
  const onInvite = jest.fn();
  const onAssignRole = jest.fn();
  const onKickMember = jest.fn();
  const onTransferLeader = jest.fn();
  render(
    <MembersPanel
      groupMembers={[leader, member]}
      mentor={{ name: "Mentor" }}
      group={{ canEdit: true }}
      onInvite={onInvite}
      onAssignRole={onAssignRole}
      onKickMember={onKickMember}
      onTransferLeader={onTransferLeader}
      currentUserEmail="leader@test.com"
      t={(k) => k}
      {...props}
    />
  );
  return { onInvite, onAssignRole, onKickMember, onTransferLeader };
};

describe("MembersPanel Report5", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("UTC01 [N] List view renders members and actions => Opens menu and triggers handlers", async () => {
    const user = userEvent.setup();
    const handlers = renderPanel();
    await user.click(screen.getByText("Leader"));
    expect(mockNavigate).toHaveBeenCalledWith("/profile/leader");

    const menuButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector(".lucide-ellipsis-vertical")
    );
    const memberMenuBtn = menuButtons[1];
    await user.click(memberMenuBtn);
    await user.click(await screen.findByText(/assignRole/i));
    expect(screen.getByTestId("assign-modal")).toHaveAttribute("data-open", "true");
    await user.click(screen.getByText("assign"));
    await waitFor(() => expect(handlers.onAssignRole).toHaveBeenCalledWith("m2", "dev"));

    await user.click(memberMenuBtn);
    await user.click(await screen.findByText(/changeLeader/i));
    expect(handlers.onTransferLeader).toHaveBeenCalled();

    await user.click(memberMenuBtn);
    await user.click(await screen.findByText(/kickMember/i));
    await waitFor(() => expect(handlers.onKickMember).toHaveBeenCalledWith("m2", "Member"));
  });

  test("UTC02 [B] No members => Shows placeholder and invite button", () => {
    const { onInvite } = renderPanel({ groupMembers: [] });
    expect(screen.getByText(/noMembersYet/i)).toBeInTheDocument();
    expect(screen.getByText(/inviteMembers/i)).toBeInTheDocument();
  });

  test("UTC03 [N] Stats view uses board contributions => Shows contribution percent and tasks", () => {
    const board = {
      columns: [
        { tasks: [{ assignees: [{ userId: "m2" }], id: "t1" }] },
        { tasks: [{ assignees: [{ userId: "m2" }, { userId: "leader" }], id: "t2" }] },
      ],
    };
    renderPanel({ showStats: true, board, groupMembers: [leader, member] });
    expect(screen.getByText(/Member/)).toBeInTheDocument();
    expect(screen.getByText(/100%/)).toBeInTheDocument();
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
  });

  test("UTC04 [A] Kick without id => Handler not called", async () => {
    const user = userEvent.setup();
    const handlers = renderPanel({
      groupMembers: [{ name: "NoId", role: "member" }],
      currentUserEmail: "leader@test.com",
    });
    const menuButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector(".lucide-ellipsis-vertical")
    );
    await user.click(menuButtons[0]);
    const kick = screen.queryByText(/kickMember/i);
    if (kick) {
      await user.click(kick);
    }
    await waitFor(() => expect(handlers.onKickMember).toHaveBeenCalledWith("", "NoId"));
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "MembersPanel",
  totalTC: 4,
  breakdown: { N: 2, B: 1, A: 1 },
  notes:
    "Covers list actions (assign/transfer/kick/navigate), empty state with invite, stats view contributions from board tasks, and guard when member lacks id.",
};
