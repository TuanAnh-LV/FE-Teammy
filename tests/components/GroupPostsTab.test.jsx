/**
UTC01 N Leader detected => Passes isLeader true to GroupPostsList
- Pre: useAuth returns userId matching group leader
- Condition: render GroupPostsTab with groupData leader id
- Confirmation: GroupPostsList called with isLeader true and groupId

UTC02 B Member role => Passes isLeader false
- Pre: useAuth returns different userId
- Condition: render component
- Confirmation: GroupPostsList called with isLeader false

UTC03 B Missing groupData => isLeader false
- Pre: groupData undefined
- Condition: render component
- Confirmation: isLeader passed as false
*/

import React from "react";
import { render } from "@testing-library/react";
import { jest } from "@jest/globals";
import GroupPostsTab from "../../src/components/common/my-group/GroupPostsTab";

const mockUseAuth = jest.fn();
jest.mock("../../src/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockListSpy = jest.fn(() => null);
jest.mock("../../src/components/common/my-group/GroupPostsList", () => (props) => {
  mockListSpy(props);
  return <div data-testid="list-props" />;
});

const renderTab = (props = {}, authUser = { userId: "u1" }) => {
  mockUseAuth.mockReturnValue({ userInfo: authUser });
  render(<GroupPostsTab groupId="g1" groupData={props.groupData} />);
};

describe("GroupPostsTab Report5", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("UTC01 [N] Leader detected => Passes isLeader true to GroupPostsList", () => {
    renderTab({ groupData: { leader: { userId: "u1" } } }, { userId: "u1" });
    expect(mockListSpy).toHaveBeenCalledWith(expect.objectContaining({ groupId: "g1", isLeader: true }));
  });

  test("UTC02 [B] Member role => Passes isLeader false", () => {
    renderTab({ groupData: { leader: { userId: "leader" } } }, { userId: "member" });
    expect(mockListSpy).toHaveBeenCalledWith(expect.objectContaining({ isLeader: false }));
  });

  test("UTC03 [B] Missing groupData => isLeader false", () => {
    renderTab({ groupData: undefined }, { userId: "u1" });
    expect(mockListSpy).toHaveBeenCalledWith(expect.objectContaining({ isLeader: false }));
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "GroupPostsTab",
  totalTC: 3,
  breakdown: { N: 1, B: 2, A: 0 },
  notes: "Validates leader detection and prop pass-through to GroupPostsList under leader/member/missing data.",
};
