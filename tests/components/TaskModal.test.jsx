import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { jest } from "@jest/globals";
import TaskModal from "../../src/components/common/kanban/TaskModal";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("antd", () => ({
  notification: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("lucide-react", () => ({
  MessageSquare: () => null,
  Upload: () => null,
  X: () => null,
  FileIcon: ({ className = "" }) => <div data-testid="file-icon" className={className} />,
}));

jest.mock("../../src/services/board.service", () => ({
  BoardService: {
    getTaskFiles: jest.fn(() => Promise.resolve({ data: [] })),
    uploadTaskFile: jest.fn(() => Promise.resolve({ data: { fileId: "f1" } })),
    deleteTaskFile: jest.fn(() => Promise.resolve({})),
    getTaskComments: jest.fn(() => Promise.resolve({ data: [] })),
  },
}));

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

  render(<TaskModal {...props} />);
  await waitFor(() => {
    expect(screen.getByText(/details/i)).toBeInTheDocument();
  });
  return props;
};

describe("TaskModal", () => {
  const getStatusSelect = () => {
    const statusLabel = screen.getByText(/status/i);
    return statusLabel?.parentElement?.querySelector("select");
  };

  test("renders status options from columnMeta", async () => {
    await renderModal();
    const statusSelect = getStatusSelect();
    expect(statusSelect).toBeTruthy();
    const options = Array.from(statusSelect.querySelectorAll("option")).map((o) => o.textContent);
    const normalized = options.map((o) => o.toLowerCase().replace(/\s+/g, " "));
    expect(normalized).toEqual(expect.arrayContaining(["to do", "in progress"]));
  });

  test("normalizes existing dueDate and falls back when missing", async () => {
    await renderModal({ task: { ...baseTask, dueDate: "2025-12-12T10:00:00Z" } });
    const dateInput = document.querySelector('input[type="date"]');
    expect(dateInput.value).toBe("2025-12-12");
  });

  test("returns null when task is missing", () => {
    const { container } = render(<TaskModal task={null} onClose={jest.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  test("changing status calls onUpdateTask with new value", async () => {
    const handlers = await renderModal();
    const statusSelect = getStatusSelect();
    fireEvent.change(statusSelect, { target: { value: "inprogress" } });
    await waitFor(() => {
      expect(handlers.onUpdateTask).toHaveBeenCalledWith(baseTask.id, { status: "inprogress" });
    });
  });

  test("priority and description updates call onUpdateTask", async () => {
    const handlers = await renderModal();

    const prioritySelect = screen.getByDisplayValue(/medium/i);
    fireEvent.change(prioritySelect, { target: { value: "high" } });

    const description = screen.getAllByRole("textbox")[0];
    fireEvent.change(description, { target: { value: "New description" } });
    fireEvent.blur(description);

    await waitFor(() => {
      expect(handlers.onUpdateTask).toHaveBeenCalledWith(baseTask.id, { priority: "high" });
      expect(handlers.onUpdateTask).toHaveBeenCalledWith(baseTask.id, { description: "New description" });
    });
  });

  test("selecting assignee calls onUpdateAssignees", async () => {
    const member = { id: "u1", name: "Alice" };
    const handlers = await renderModal({
      members: [member],
      onUpdateAssignees: jest.fn(),
    });

    const assigneeButton = screen.getByText(/unassigned/i).closest("button");
    fireEvent.click(assigneeButton);
    const option = await screen.findByText(member.name);
    fireEvent.click(option);

    await waitFor(() => {
      expect(handlers.onUpdateAssignees).toHaveBeenCalledWith(baseTask.id, ["u1"]);
    });
  });

  test("assignee badge click opens profile", async () => {
    await renderModal({
      task: { ...baseTask, assignees: [{ id: "u2", name: "Bob" }] },
    });
    const badge = screen
      .getAllByText("Bob")
      .map((el) => el.closest("div"))
      .find((div) => div && div.className.includes("inline-flex"));
    fireEvent.click(badge);
    expect(mockNavigate).toHaveBeenCalledWith("/profile/u2");
  });

  test("unassign action clears assignees", async () => {
    const handlers = await renderModal({
      task: { ...baseTask, assignees: [{ id: "u2", name: "Bob" }] },
    });
    const assigneeButton =
      screen.getAllByRole("button").find((btn) => /bob|unassigned/i.test(btn.textContent || ""));
    fireEvent.click(assigneeButton);
    const unassignBtn = await screen.findByText(/unassign/i);
    fireEvent.click(unassignBtn);
    expect(handlers.onUpdateAssignees).toHaveBeenCalledWith(baseTask.id, []);
  });

  test("uploading file calls uploadTaskFile", async () => {
    await renderModal();
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(["data"], "test.txt", { type: "text/plain" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const { BoardService } = require("../../src/services/board.service");
      expect(BoardService.uploadTaskFile).toHaveBeenCalled();
    });
  });

  test("adding comment calls onAddComment", async () => {
    const handlers = await renderModal({ onAddComment: jest.fn() });
    const input = screen.getByPlaceholderText(/writecomment/i);
    fireEvent.change(input, { target: { value: "New comment" } });
    const postBtn = screen.getByText(/post/i);
    fireEvent.click(postBtn);

    await waitFor(() => {
      expect(handlers.onAddComment).toHaveBeenCalledWith(baseTask.id, "New comment");
    });
  });

  test("delete button triggers confirm flow", async () => {
    const handlers = await renderModal({
      onDeleteTask: jest.fn(),
      onClose: jest.fn(),
    });
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    const deleteButton = await screen.findByText(/delete/i);
    fireEvent.click(deleteButton);
    expect(confirmSpy).toHaveBeenCalled();
    expect(handlers.onDeleteTask).toHaveBeenCalledWith(baseTask.id);
    expect(handlers.onClose).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  test("due date blur triggers onUpdateTask", async () => {
    const handlers = await renderModal();
    const dateInput = document.querySelector('input[type="date"]');
    fireEvent.change(dateInput, { target: { value: "2025-12-12" } });
    fireEvent.blur(dateInput);
    await waitFor(() => {
      expect(handlers.onUpdateTask).toHaveBeenCalledWith(baseTask.id, { dueDate: "2025-12-12" });
    });
  });

  test("delete file calls deleteTaskFile and updates state", async () => {
    const file = { fileId: "f1", fileName: "Doc", fileSize: 10, fileType: "txt", fileUrl: "#" };
    const { BoardService } = require("../../src/services/board.service");
    BoardService.getTaskFiles.mockResolvedValueOnce({ data: [file] });
    await renderModal({
      task: { ...baseTask, files: [file] },
    });
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    let deleteBtn = null;
    await waitFor(() => {
      deleteBtn = document.querySelector('button[title*="delete"]');
      expect(deleteBtn).not.toBeNull();
    });
    fireEvent.click(deleteBtn);
    await waitFor(() => {
      expect(BoardService.deleteTaskFile).toHaveBeenCalledWith("group-1", baseTask.id, "f1");
    });
    confirmSpy.mockRestore();
  });

  test("edit and delete comment flows call handlers", async () => {
    const handlers = await renderModal({
      task: { ...baseTask, comments: [{ id: "c1", content: "old", createdBy: "A", userId: "u1" }] },
      onUpdateComment: jest.fn(),
      onDeleteComment: jest.fn(),
    });
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

    const editBtn = screen.getByText(/edit/i);
    fireEvent.click(editBtn);
    const textarea = screen.getByDisplayValue("old");
    fireEvent.change(textarea, { target: { value: "new" } });
    const saveBtn = screen.getByText(/save/i);
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(handlers.onUpdateComment).toHaveBeenCalledWith(baseTask.id, "c1", "new");
    });

    const deleteBtn = screen.getAllByText(/delete/i).filter((el) => el.tagName === "BUTTON").pop();
    fireEvent.click(deleteBtn);
    await waitFor(() => {
      expect(handlers.onDeleteComment).toHaveBeenCalledWith(baseTask.id, "c1");
    });
    confirmSpy.mockRestore();
  });

  test("readOnly mode disables inputs and hides delete", async () => {
    const handlers = await renderModal({ readOnly: true, onDeleteTask: undefined });
    const deleteBtn = screen.queryByText(/delete/i);
    expect(deleteBtn).toBeNull();

    const description = screen.getAllByRole("textbox")[0];
    fireEvent.blur(description);
    expect(handlers.onUpdateTask).not.toHaveBeenCalled();
  });

  test("delete comment while editing triggers cancel path", async () => {
    const handlers = await renderModal({
      task: { ...baseTask, comments: [{ id: "c1", content: "old", createdBy: "A", userId: "u1" }] },
      onDeleteComment: jest.fn(),
    });
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(screen.getByText(/edit/i));
    const deleteBtn = screen.getAllByText(/delete/i).filter((el) => el.tagName === "BUTTON").pop();
    fireEvent.click(deleteBtn);
    await waitFor(() => {
      expect(handlers.onDeleteComment).toHaveBeenCalledWith(baseTask.id, "c1");
    });
    confirmSpy.mockRestore();
  });

  test("comment add ignored when empty", async () => {
    const handlers = await renderModal({ onAddComment: jest.fn() });
    const postBtn = screen.getByText(/post/i);
    fireEvent.click(postBtn);
    expect(handlers.onAddComment).not.toHaveBeenCalled();
  });

  test("assignee menu closes on outside click", async () => {
    await renderModal();
    const assigneeButton = screen.getByText(/unassigned/i).closest("button");
    fireEvent.click(assigneeButton);
    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(document.querySelector("div[role='menu']")).toBeNull();
    });
  });

  test("upload error shows notification", async () => {
    const { BoardService } = require("../../src/services/board.service");
    BoardService.uploadTaskFile.mockRejectedValueOnce(new Error("fail"));
    await renderModal();
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(["data"], "err.txt", { type: "text/plain" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const { notification } = require("antd");
      expect(notification.error).toHaveBeenCalled();
    });
  });

  test("delete file error shows notification", async () => {
    const file = { fileId: "f1", fileName: "Doc", fileSize: 10, fileType: "txt", fileUrl: "#" };
    const { BoardService } = require("../../src/services/board.service");
    BoardService.getTaskFiles.mockResolvedValueOnce({ data: [file] });
    BoardService.deleteTaskFile.mockRejectedValueOnce(new Error("fail"));
    await renderModal({
      task: { ...baseTask, files: [file] },
    });
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    let deleteBtn = null;
    await waitFor(() => {
      deleteBtn = document.querySelector('button[title*="delete"]');
      expect(deleteBtn).not.toBeNull();
    });
    fireEvent.click(deleteBtn);
    await waitFor(() => {
      const { notification } = require("antd");
      expect(notification.error).toHaveBeenCalled();
    });
    confirmSpy.mockRestore();
  });

  test("handleDeleteComment respects cancel confirm", async () => {
    const handlers = await renderModal({
      task: { ...baseTask, comments: [{ id: "c1", content: "old", createdBy: "A", userId: "u1" }] },
      onDeleteComment: jest.fn(),
    });
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);
    const deleteBtn = screen.getAllByText(/delete/i).filter((el) => el.tagName === "BUTTON").pop();
    fireEvent.click(deleteBtn);
    expect(handlers.onDeleteComment).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  test("fetchTaskFiles error path clears files", async () => {
    const { BoardService } = require("../../src/services/board.service");
    BoardService.getTaskFiles.mockRejectedValueOnce(new Error("fail"));
    await renderModal({ groupId: "group-1" });
    await waitFor(() => {
      expect(BoardService.getTaskFiles).toHaveBeenCalled();
    });
  });

  test("avatar branches render correctly for members and comments", async () => {
    const handlers = await renderModal({
      task: {
        ...baseTask,
        assignees: [{ id: "u3", name: "Carol", avatarUrl: "avatar.png" }],
        comments: [
          { id: "c1", content: "hi", userId: "mentor-id", createdAt: "2025-01-01T00:00:00Z" },
          { id: "c2", content: "raw", authorAvatar: "author.png", createdBy: "Anon", createdAt: "invalid-date" },
        ],
      },
      groupDetail: {
        mentor: { userId: "mentor-id", displayName: "Mentor User", avatarUrl: "mentor.png", email: "m@x.com" },
        leader: { userId: "leader-id", displayName: "Leader User", avatarUrl: "leader.png", email: "l@x.com" },
      },
    });

    expect(screen.getByAltText("Carol")).toBeInTheDocument();
    expect(screen.getByAltText("Mentor User")).toBeInTheDocument();
    expect(screen.getByAltText("Anon")).toBeInTheDocument();

    const timestamps = screen.getAllByText((content) => content.includes("/"));
    expect(timestamps.length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(handlers.onUpdateTask).not.toHaveBeenCalled();
    });
  });

  test("due date blur triggers onUpdateTask", async () => {
    const handlers = await renderModal();
    const dateInput = document.querySelector('input[type="date"]');
    fireEvent.change(dateInput, { target: { value: "2025-12-12" } });
    fireEvent.blur(dateInput);
    await waitFor(() => {
      expect(handlers.onUpdateTask).toHaveBeenCalledWith(baseTask.id, { dueDate: "2025-12-12" });
    });
  });

  test("delete file calls deleteTaskFile and updates state", async () => {
    const file = { fileId: "f1", fileName: "Doc", fileSize: 10, fileType: "txt", fileUrl: "#" };
    const { BoardService } = require("../../src/services/board.service");
    BoardService.getTaskFiles.mockResolvedValueOnce({ data: [file] });
    await renderModal({
      task: { ...baseTask, files: [file] },
    });
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    let deleteBtn = null;
    await waitFor(() => {
      deleteBtn = document.querySelector('button[title*="delete"]');
      expect(deleteBtn).not.toBeNull();
    });
    fireEvent.click(deleteBtn);
    await waitFor(() => {
      const { BoardService } = require("../../src/services/board.service");
      expect(BoardService.deleteTaskFile).toHaveBeenCalledWith("group-1", baseTask.id, "f1");
    });
    confirmSpy.mockRestore();
  });

  test("renders correct file icons by extension", async () => {
    const files = [
      { id: "img1", name: "pic.png", size: 1000, url: "#" },
      { id: "pdf1", name: "file.pdf", size: 1000, url: "#" },
      { id: "doc1", name: "spec.docx", size: 1000, url: "#" },
      { id: "xls1", name: "sheet.xlsx", size: 1000, url: "#" },
      { id: "txt1", name: "note.txt", size: 1000, url: "#" },
    ];
    await renderModal({ task: { ...baseTask, files }, groupId: null });

    expect(screen.getByAltText("img")).toBeInTheDocument();
    const icons = screen.getAllByTestId("file-icon").map((el) => el.className);
    expect(icons.some((c) => c.includes("text-red-500"))).toBe(true);
    expect(icons.some((c) => c.includes("text-blue-500"))).toBe(true);
    expect(icons.some((c) => c.includes("text-green-500"))).toBe(true);
    expect(icons.some((c) => c.includes("text-gray-500"))).toBe(true);
  });

  test("edit and delete comment flows call handlers", async () => {
    const handlers = await renderModal({
      task: { ...baseTask, comments: [{ id: "c1", content: "old", createdBy: "A", userId: "u1" }] },
      onUpdateComment: jest.fn(),
      onDeleteComment: jest.fn(),
    });
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

    const editBtn = screen.getByText(/edit/i);
    fireEvent.click(editBtn);
    const textarea = screen.getByDisplayValue("old");
    fireEvent.change(textarea, { target: { value: "new" } });
    const saveBtn = screen.getByText(/save/i);
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(handlers.onUpdateComment).toHaveBeenCalledWith(baseTask.id, "c1", "new");
    });

    const deleteBtn = screen.getAllByText(/delete/i).filter((el) => el.tagName === "BUTTON").pop();
    fireEvent.click(deleteBtn);
    await waitFor(() => {
      expect(handlers.onDeleteComment).toHaveBeenCalledWith(baseTask.id, "c1");
    });
    confirmSpy.mockRestore();
  });
});
