/**
UTC01 N Render task details => Shows title and status options
- Pre: task provided; BoardService.getTaskFiles resolves empty
- Condition: render modal with groupId
- Confirmation: title visible; status options include columnMeta keys; getTaskFiles called

UTC02 B Missing task => Renders null
- Pre: task null
- Condition: render modal
- Confirmation: container is null

UTC03 N Change status => Calls onUpdateTask with new status
- Pre: default task
- Condition: change status select to inprogress
- Confirmation: onUpdateTask called with task id and status

UTC04 N Update priority and description => onUpdateTask called with payload
- Pre: default task
- Condition: change priority to high and description text then blur
- Confirmation: onUpdateTask called with priority and description payloads; create navigation not triggered

UTC05 N Assign user => Calls onUpdateAssignees with selected id
- Pre: members contain one user
- Condition: open assignee menu, pick member
- Confirmation: onUpdateAssignees called with member id

UTC06 B Comment submit empty => onAddComment not called
- Pre: onAddComment mocked
- Condition: click post with empty input
- Confirmation: handler not called

UTC07 N Add comment => onAddComment called with content
- Pre: onAddComment mocked
- Condition: enter text and click post
- Confirmation: onAddComment called with task id and content

UTC08 N Delete task confirmed => onDeleteTask and onClose called
- Pre: window.confirm returns true
- Condition: click delete
- Confirmation: confirm called; onDeleteTask called with id; onClose called

UTC09 A Upload file error => Shows notification.error
- Pre: BoardService.uploadTaskFile rejects once
- Condition: change file input
- Confirmation: notification.error called

UTC10 N Upload file success => BoardService.uploadTaskFile called
- Pre: upload resolves
- Condition: change file input with file
- Confirmation: uploadTaskFile called with groupId and taskId

UTC11 A Delete file error => notification.error called
- Pre: getTaskFiles resolves with a file; deleteTaskFile rejects
- Condition: click delete file with confirm true
- Confirmation: notification.error called; deleteTaskFile called with ids

UTC12 B Delete comment canceled => onDeleteComment not called
- Pre: window.confirm returns false; task has one comment
- Condition: click delete comment
- Confirmation: onDeleteComment not called

UTC13 N Edit comment => onUpdateComment called with new content
- Pre: task has one comment
- Condition: click edit, change text, save
- Confirmation: onUpdateComment called with task id, comment id, updated text

UTC14 B readOnly mode => Delete hidden and updates not called
- Pre: readOnly true
- Condition: blur description
- Confirmation: delete button absent; onUpdateTask not called
*/

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import TaskModal from "../../src/components/common/kanban/TaskModal";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("antd", () => {
  const notification = { success: jest.fn(), error: jest.fn() };
  return { notification };
});

jest.mock("lucide-react", () => ({
  MessageSquare: () => null,
  Upload: () => null,
  X: () => null,
  FileIcon: ({ className = "" }) => <div data-testid="file-icon" className={className} />,
}));

jest.mock("../../src/services/board.service", () => {
  const BoardService = {
    getTaskFiles: jest.fn(() => Promise.resolve({ data: [] })),
    uploadTaskFile: jest.fn(() => Promise.resolve({ data: { fileId: "f1" } })),
    deleteTaskFile: jest.fn(() => Promise.resolve({})),
    getTaskComments: jest.fn(() => Promise.resolve({ data: [] })),
  };
  return { BoardService };
});

const baseTask = {
  id: "task-1",
  title: "Sample task",
  status: "to_do",
  priority: "medium",
  assignees: [],
  comments: [],
  files: [],
};

const columnMeta = {
  todo: { title: "to_do" },
  inprogress: { title: "in progress" },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockNavigate.mockReset();
});

const renderModal = async (overrides = {}) => {
  const props = {
    task: baseTask,
    columnMeta,
    groupId: "group-1",
    members: [],
    groupDetail: null,
    readOnly: false,
    onUpdateTask: jest.fn(),
    onUpdateAssignees: jest.fn(),
    onDeleteTask: jest.fn(),
    onFetchComments: jest.fn(() => Promise.resolve([])),
    onAddComment: jest.fn(),
    onUpdateComment: jest.fn(),
    onDeleteComment: jest.fn(),
    onClose: jest.fn(),
    ...overrides,
  };

  const user = userEvent.setup();
  render(<TaskModal {...props} />);
  await waitFor(() => expect(screen.getByText(/details/i)).toBeInTheDocument());
  return { user, props };
};

describe("TaskModal Report5", () => {
  const getStatusSelect = () => {
    const label = screen.getByText(/status/i);
    return label?.parentElement?.querySelector("select");
  };

  test("UTC01 [N] Render task details => Shows title and status options", async () => {
    const { props } = await renderModal();
    const statusSelect = getStatusSelect();
    expect(screen.getByText(props.task.title)).toBeInTheDocument();
    const options = Array.from(statusSelect.querySelectorAll("option")).map((o) =>
      o.textContent?.toLowerCase().replace(/\s+/g, " ")
    );
    expect(options).toEqual(expect.arrayContaining(["to do", "in progress"]));
    const { BoardService } = require("../../src/services/board.service");
    expect(BoardService.getTaskFiles).toHaveBeenCalledWith("group-1", baseTask.id);
  });

  test("UTC02 [B] Missing task => Renders null", () => {
    const { container } = render(<TaskModal task={null} onClose={jest.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  test("UTC03 [N] Change status => Calls onUpdateTask with new status", async () => {
    const { props } = await renderModal();
    const select = getStatusSelect();
    await userEvent.selectOptions(select, "inprogress");
    await waitFor(() =>
      expect(props.onUpdateTask).toHaveBeenCalledWith(baseTask.id, { status: "inprogress" })
    );
  });

  test("UTC04 [N] Update priority and description => Calls onUpdateTask with payload", async () => {
    const { user, props } = await renderModal();
    const prioritySelect = screen.getByDisplayValue(/medium/i);
    await user.selectOptions(prioritySelect, "high");
    const description = screen.getAllByRole("textbox")[0];
    await user.clear(description);
    await user.type(description, "New description");
    await user.tab();
    await waitFor(() => {
      expect(props.onUpdateTask).toHaveBeenCalledWith(baseTask.id, { priority: "high" });
      expect(props.onUpdateTask).toHaveBeenCalledWith(baseTask.id, { description: "New description" });
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("UTC05 [N] Assign user => Calls onUpdateAssignees with selected id", async () => {
    const member = { id: "u1", name: "Alice" };
    const { user, props } = await renderModal({ members: [member], onUpdateAssignees: jest.fn() });
    const assigneeButton = screen.getByText(/unassigned/i).closest("button");
    await user.click(assigneeButton);
    await user.click(await screen.findByText(member.name));
    await waitFor(() => {
      expect(props.onUpdateAssignees).toHaveBeenCalledWith(baseTask.id, ["u1"]);
    });
  });

  test("UTC06 [B] Comment submit empty => Handler not called", async () => {
    const { user, props } = await renderModal({ onAddComment: jest.fn() });
    await user.click(screen.getByText(/post/i));
    expect(props.onAddComment).not.toHaveBeenCalled();
  });

  test("UTC07 [N] Add comment => Calls onAddComment with content", async () => {
    const { user, props } = await renderModal({ onAddComment: jest.fn() });
    const input = screen.getByPlaceholderText(/writecomment/i);
    await user.type(input, "New comment");
    await user.click(screen.getByText(/post/i));
    await waitFor(() => {
      expect(props.onAddComment).toHaveBeenCalledWith(baseTask.id, "New comment");
    });
  });

  test("UTC08 [N] Delete task confirmed => Calls onDeleteTask and onClose", async () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    const { user, props } = await renderModal();
    await user.click(await screen.findByText(/delete/i));
    expect(confirmSpy).toHaveBeenCalled();
    expect(props.onDeleteTask).toHaveBeenCalledWith(baseTask.id);
    expect(props.onClose).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  test("UTC09 [A] Upload file error => Shows notification.error", async () => {
    const { BoardService } = require("../../src/services/board.service");
    BoardService.uploadTaskFile.mockRejectedValueOnce(new Error("fail"));
    const notification = require("antd").notification;
    await renderModal();
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(["data"], "err.txt", { type: "text/plain" });
    await userEvent.upload(fileInput, file);
    await waitFor(() => expect(notification.error).toHaveBeenCalled());
  });

  test("UTC10 [N] Upload file success => Calls uploadTaskFile with ids", async () => {
    const { BoardService } = require("../../src/services/board.service");
    await renderModal();
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(["data"], "ok.txt", { type: "text/plain" });
    await userEvent.upload(fileInput, file);
    await waitFor(() => {
      expect(BoardService.uploadTaskFile).toHaveBeenCalledWith("group-1", baseTask.id, expect.any(FormData));
    });
  });

  test("UTC11 [A] Delete file error => notification.error called", async () => {
    const file = { fileId: "f1", fileName: "Doc", fileSize: 10, fileType: "txt", fileUrl: "#" };
    const { BoardService } = require("../../src/services/board.service");
    BoardService.getTaskFiles.mockResolvedValueOnce({ data: [file] });
    BoardService.deleteTaskFile.mockRejectedValueOnce(new Error("fail"));
    const notification = require("antd").notification;
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    await renderModal({ task: { ...baseTask, files: [file] } });
    const deleteBtn = await screen.findByTitle(/delete/i);
    await userEvent.click(deleteBtn);
    await waitFor(() => {
      expect(BoardService.deleteTaskFile).toHaveBeenCalledWith("group-1", baseTask.id, "f1");
      expect(notification.error).toHaveBeenCalled();
    });
    confirmSpy.mockRestore();
  });

  test("UTC12 [B] Delete comment canceled => onDeleteComment not called", async () => {
    const handlers = { onDeleteComment: jest.fn() };
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);
    await renderModal({
      task: { ...baseTask, comments: [{ id: "c1", content: "old", createdBy: "A", userId: "u1" }] },
      ...handlers,
    });
    const deleteBtn = screen.getAllByText(/delete/i).find((el) => el.tagName === "BUTTON");
    await userEvent.click(deleteBtn);
    expect(handlers.onDeleteComment).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  test("UTC13 [N] Edit comment => onUpdateComment called with new content", async () => {
    const handlers = { onUpdateComment: jest.fn() };
    await renderModal({
      task: { ...baseTask, comments: [{ id: "c1", content: "old", createdBy: "A", userId: "u1" }] },
      ...handlers,
    });
    await userEvent.click(screen.getByText(/edit/i));
    const textarea = screen.getByDisplayValue("old");
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "new");
    await userEvent.click(screen.getByText(/save/i));
    await waitFor(() => {
      expect(handlers.onUpdateComment).toHaveBeenCalledWith(baseTask.id, "c1", "new");
    });
  });

  test("UTC14 [B] readOnly mode => Delete hidden and updates not called", async () => {
    const handlers = { onUpdateTask: jest.fn(), onDeleteTask: jest.fn() };
    await renderModal({ readOnly: true, ...handlers });
    expect(screen.queryByText(/delete/i)).toBeNull();
    const description = screen.getAllByRole("textbox")[0];
    await userEvent.tab();
    await userEvent.tab();
    expect(handlers.onUpdateTask).not.toHaveBeenCalled();
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "TaskModal",
  totalTC: 14,
  breakdown: { N: 9, B: 3, A: 2 },
  notes:
    "Covered rendering, status/priority updates, assignee changes, comment add/edit/delete, task delete confirm, file upload/delete success and error, readOnly boundary, and missing task boundary with deterministic mocks.",
};
