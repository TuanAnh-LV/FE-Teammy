/**
UTC01 N Render members => Shows name, role, email, kick button when allowed
- Pre: members array with role; canEdit true
- Condition: render component
- Confirmation: member info visible; kick button rendered

UTC02 B Empty members => Shows empty label
- Pre: members empty
- Condition: render
- Confirmation: emptyLabel text shown

UTC03 A Current user cannot kick self => Kick button hidden
- Pre: member email equals currentUserEmail
- Condition: render with onKick
- Confirmation: no kick button for that member

UTC04 N Invite button => onInvite called
- Pre: onInvite provided
- Condition: click invite
- Confirmation: onInvite called once

UTC05 N Kick handler => onKick called with member
- Pre: onKick provided, canEdit true
- Condition: click kick
- Confirmation: onKick called with member object
*/

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import MembersList from "../../src/components/common/my-group/MembersList";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

jest.mock("../../src/utils/helpers", () => ({
  avatarFromEmail: (email) => `avatar://${email}`,
}));

const baseMembers = [
  { id: "m1", name: "Alice", email: "a@test.com", role: "frontend" },
];

const renderList = (props = {}) =>
  render(
    <MembersList
      members={baseMembers}
      inviteLabel="Invite"
      emptyLabel="Empty"
      onInvite={jest.fn()}
      onKick={jest.fn()}
      canEdit
      currentUserEmail="leader@test.com"
      {...props}
    />
  );

describe("MembersList Report5", () => {
  test("UTC01 [N] Render members => Shows name, role, email, kick button when allowed", () => {
    renderList();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText(/frontend/)).toBeInTheDocument();
    expect(screen.getByText("a@test.com")).toBeInTheDocument();
    expect(screen.getByText(/kick/i)).toBeInTheDocument();
  });

  test("UTC02 [B] Empty members => Shows empty label", () => {
    renderList({ members: [] });
    expect(screen.getByText("Empty")).toBeInTheDocument();
  });

  test("UTC03 [A] Current user cannot kick self => Kick button hidden", () => {
    renderList({
      members: [{ id: "m2", name: "Self", email: "leader@test.com", role: "leader" }],
      currentUserEmail: "leader@test.com",
    });
    expect(screen.queryByText(/kick/i)).toBeNull();
  });

  test("UTC04 [N] Invite button => onInvite called", async () => {
    const user = userEvent.setup();
    const onInvite = jest.fn();
    renderList({ onInvite });
    await user.click(screen.getByText("Invite"));
    expect(onInvite).toHaveBeenCalledTimes(1);
  });

  test("UTC05 [N] Kick handler => onKick called with member", async () => {
    const user = userEvent.setup();
    const onKick = jest.fn();
    renderList({ onKick });
    await user.click(screen.getByText(/kick/i));
    expect(onKick).toHaveBeenCalledWith(expect.objectContaining({ id: "m1" }));
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "MembersList",
  totalTC: 5,
  breakdown: { N: 3, B: 1, A: 1 },
  notes:
    "Covers render with role/email, empty state, self-kick protection, invite click, and kick handler invocation; translation and avatar helper mocked.",
};
