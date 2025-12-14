/**
UTC01 N Load posts success => Renders posts list with title and positions
- Pre: PostService resolves array with post data
- Condition: render with groupId
- Confirmation: service called with id; post title and position tags shown

UTC02 B Missing groupId => Does not fetch and shows empty state
- Pre: groupId undefined
- Condition: render
- Confirmation: getGroupPostsByGroupId not called; shows empty text

UTC03 A Fetch error => Shows alert and retry calls service again
- Pre: PostService rejects
- Condition: render and click retry
- Confirmation: alert shown; service called twice after retry

UTC04 B Loading state => Shows Spin while pending
- Pre: PostService promise pending
- Condition: render
- Confirmation: loading text rendered

UTC05 N Leader empty => Shows create button
- Pre: PostService resolves empty array; isLeader true
- Condition: render
- Confirmation: "Create First Post" button rendered
*/

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import GroupPostsList from "../../src/components/common/my-group/GroupPostsList";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

const mockConfirm = jest.fn();
jest.mock("antd", () => {
  const Empty = ({ description, children }) => (
    <div>
      <div>{description}</div>
      {children}
    </div>
  );
  const Button = (props) => (
    <button onClick={props.onClick}>{props.children || "btn"}</button>
  );
  const Spin = ({ tip }) => <div>{tip}</div>;
  const Alert = ({ message, description, action }) => (
    <div>
      <div>{message}</div>
      <div>{description}</div>
      {action}
    </div>
  );
  const Modal = { confirm: (...args) => mockConfirm(...args) };
  const Tag = ({ children }) => <span>{children}</span>;
  return { Empty, Button, Spin, Alert, Modal, Tag };
});

jest.mock("../../src/services/post.service", () => ({
  PostService: {
    getGroupPostsByGroupId: jest.fn(),
  },
}));

jest.mock("../../src/utils/helpers", () => ({
  toArrayPositions: jest.fn((post) => post.positions || []),
  toArraySkills: jest.fn((post) => post.skills || []),
}));

const samplePost = {
  id: "p1",
  title: "Post 1",
  status: "open",
  group: { leader: { displayName: "Leader" }, name: "G1", maxMembers: 5 },
  description: "Desc",
  positions: ["Dev"],
  skills: ["JS"],
  createdAt: "2025-01-01",
  currentMembers: 1,
};

describe("GroupPostsList Report5", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("UTC01 [N] Load posts success => Renders posts list with title and positions", async () => {
    const { PostService } = require("../../src/services/post.service");
    PostService.getGroupPostsByGroupId.mockResolvedValue({ data: [samplePost] });
    render(<GroupPostsList groupId="g1" isLeader={false} />);
    expect(PostService.getGroupPostsByGroupId).toHaveBeenCalledWith("g1");
    expect(await screen.findByText("Post 1")).toBeInTheDocument();
    expect(screen.getByText("Dev")).toBeInTheDocument();
  });

  test("UTC02 [B] Missing groupId => Does not fetch and shows empty state", () => {
    const { PostService } = require("../../src/services/post.service");
    PostService.getGroupPostsByGroupId.mockResolvedValue({ data: [] });
    render(<GroupPostsList isLeader={false} />);
    expect(PostService.getGroupPostsByGroupId).not.toHaveBeenCalled();
    expect(screen.getByText(/No Posts Yet/i)).toBeInTheDocument();
  });

  test("UTC03 [A] Fetch error => Shows alert and retry calls service again", async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { PostService } = require("../../src/services/post.service");
    PostService.getGroupPostsByGroupId.mockRejectedValueOnce(new Error("fail"));
    PostService.getGroupPostsByGroupId.mockResolvedValueOnce({ data: [] });
    const user = userEvent.setup();
    render(<GroupPostsList groupId="g1" isLeader={false} />);
    expect(await screen.findByText(/Error Loading Posts/i)).toBeInTheDocument();
    await user.click(screen.getByText(/Retry/i));
    expect(PostService.getGroupPostsByGroupId).toHaveBeenCalledTimes(2);
    consoleErrorSpy.mockRestore();
  });

  test("UTC04 [B] Loading state => Shows Spin while pending", () => {
    const { PostService } = require("../../src/services/post.service");
    PostService.getGroupPostsByGroupId.mockReturnValue(new Promise(() => {}));
    render(<GroupPostsList groupId="g1" isLeader={false} />);
    expect(screen.getByText(/Loading posts/i)).toBeInTheDocument();
  });

  test("UTC05 [N] Leader empty => Shows create button", async () => {
    const { PostService } = require("../../src/services/post.service");
    PostService.getGroupPostsByGroupId.mockResolvedValue({ data: [] });
    render(<GroupPostsList groupId="g1" isLeader />);
    expect(await screen.findByText(/Create First Post/i)).toBeInTheDocument();
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "GroupPostsList",
  totalTC: 5,
  breakdown: { N: 2, B: 2, A: 1 },
  notes:
    "Covers fetch success, missing groupId guard, error with retry, loading state, and leader empty UI with create button; services and helpers mocked.",
};
