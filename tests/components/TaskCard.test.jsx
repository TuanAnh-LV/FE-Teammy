/**
UTC01 N Render task info and open => Calls onOpen with task
- Pre: task has title, description, priority, column meta
- Condition: render TaskCard and click title
- Confirmation: text visible; onOpen called with task object

UTC02 B Missing due date and non-array comments => Shows fallback values
- Pre: task dueDate null; comments not array
- Condition: render TaskCard
- Confirmation: due date shows "--"; comments count shows 0

UTC03 B Many assignees => Shows initials and +X overflow
- Pre: task assignees length > 3
- Condition: render TaskCard
- Confirmation: first initials shown; "+1" overflow badge shown

UTC04 N Done column => Uses done status color
- Pre: columnMeta done isDone true; task status done/columnId done
- Condition: render TaskCard
- Confirmation: status element has emerald class

UTC05 B Status tone by position => Colors change by column order
- Pre: columnMeta with multiple non-done columns and positions
- Condition: render three TaskCards in different columns
- Confirmation: first gray, second blue, third indigo classes

UTC06 N Drag setup => useSortable called with task id
- Pre: useSortable mocked
- Condition: render TaskCard
- Confirmation: useSortable called with { id: task.id }
*/

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import TaskCard from "../../src/components/common/kanban/TaskCard";

jest.mock("@dnd-kit/sortable", () => ({
  useSortable: jest.fn(() => ({
    attributes: { role: "article" },
    listeners: { onPointerDown: jest.fn() },
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

jest.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: () => "" } },
}));

jest.mock("lucide-react", () => ({
  Calendar: () => null,
  MessageSquare: () => null,
}));

const baseTask = {
  id: "t1",
  title: "Sample Task",
  description: "Do something",
  priority: "medium",
  status: "todo",
  columnId: "todo",
  dueDate: "2025-12-12T00:00:00Z",
  assignees: [{ id: "u1", name: "Alice" }],
  comments: [{ id: "c1" }, { id: "c2" }],
};

const columnMeta = {
  todo: { title: "To Do", position: 1 },
  progress: { title: "In Progress", position: 2 },
  done: { title: "Done", position: 3, isDone: true },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TaskCard Report5", () => {
  test("UTC01 [N] Render task info and open => Calls onOpen with task", async () => {
    const onOpen = jest.fn();
    render(<TaskCard task={baseTask} onOpen={onOpen} columnMeta={columnMeta} />);

    expect(screen.getByText("Sample Task")).toBeInTheDocument();
    expect(screen.getByText("Do something")).toBeInTheDocument();
    expect(screen.getByText("medium")).toBeInTheDocument();
    expect(screen.getByText("To Do")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Sample Task"));
    expect(onOpen).toHaveBeenCalledWith(baseTask);
  });

  test("UTC02 [B] Missing due date and non-array comments => Shows fallback values", () => {
    render(
      <TaskCard
        task={{ ...baseTask, dueDate: null, comments: "not-array" }}
        onOpen={jest.fn()}
        columnMeta={columnMeta}
      />
    );
    expect(screen.getByText("--")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  test("UTC03 [B] Many assignees => Shows initials and +X overflow", () => {
    const many = [
      { id: "u1", name: "Alice" },
      { id: "u2", name: "Bob" },
      { id: "u3", name: "Carol" },
      { id: "u4", name: "David" },
    ];
    render(<TaskCard task={{ ...baseTask, assignees: many }} onOpen={jest.fn()} columnMeta={columnMeta} />);
    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  test("UTC04 [N] Done column => Uses done status color", () => {
    render(
      <TaskCard
        task={{ ...baseTask, status: "done", columnId: "done" }}
        onOpen={jest.fn()}
        columnMeta={columnMeta}
      />
    );
    const status = screen.getByText("Done");
    expect(status.className).toMatch(/emerald/i);
  });

  test("UTC05 [B] Status tone by position => Colors change by column order", () => {
    const meta = {
      todo: { title: "To Do", position: 1, columnId: "todo" },
      doing: { title: "Doing", position: 2, columnId: "doing" },
      review: { title: "Review", position: 3, columnId: "review" },
      done: { title: "Done", position: 4, columnId: "done", isDone: true },
    };

    render(
      <>
        <TaskCard task={{ ...baseTask, status: "todo", columnId: "todo" }} onOpen={jest.fn()} columnMeta={meta} />
        <TaskCard task={{ ...baseTask, status: "doing", columnId: "doing" }} onOpen={jest.fn()} columnMeta={meta} />
        <TaskCard task={{ ...baseTask, status: "review", columnId: "review" }} onOpen={jest.fn()} columnMeta={meta} />
      </>
    );

    const [first, second, third] = screen.getAllByText(/To Do|Doing|Review/);
    expect(first.className).toMatch(/gray/i);
    expect(second.className).toMatch(/blue/i);
    expect(third.className).toMatch(/indigo/i);
  });

  test("UTC06 [N] Drag setup => useSortable called with task id", () => {
    const { useSortable } = require("@dnd-kit/sortable");
    render(<TaskCard task={baseTask} onOpen={jest.fn()} columnMeta={columnMeta} />);
    expect(useSortable).toHaveBeenCalledWith({ id: baseTask.id });
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "TaskCard",
  totalTC: 6,
  breakdown: { N: 3, B: 3, A: 0 },
  notes:
    "Covers rendering, missing due/comments boundary, overflow assignees, done column tone, position-based status tone, and dnd useSortable integration.",
};
