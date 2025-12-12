import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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

describe("TaskCard", () => {
  test("renders task info and calls onOpen when clicked", () => {
    const onOpen = jest.fn();
    render(<TaskCard task={baseTask} onOpen={onOpen} columnMeta={columnMeta} />);

    expect(screen.getByText("Sample Task")).toBeInTheDocument();
    expect(screen.getByText("Do something")).toBeInTheDocument();
    expect(screen.getByText("medium")).toBeInTheDocument();
    expect(screen.getByText("To Do")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Sample Task"));
    expect(onOpen).toHaveBeenCalledWith(baseTask);
  });

  test("shows due date fallback and comments count", () => {
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

  test("shows assignees initials and +X when over limit", () => {
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

  test("uses done status class when column isDone is true", () => {
    render(
      <TaskCard
        task={{ ...baseTask, status: "done", columnId: "done" }}
        onOpen={jest.fn()}
        columnMeta={columnMeta}
      />
    );
    const status = screen.getByText("Done");
    expect(status.className).toMatch(/emerald/);
  });

  test("status color changes by position in non-done columns", () => {
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
    expect(first.className).toMatch(/gray/); // first column
    expect(second.className).toMatch(/blue/); // second non-done
    expect(third.className).toMatch(/indigo/); // later column
  });

  test("useSortable called with task id", () => {
    const { useSortable } = require("@dnd-kit/sortable");
    render(<TaskCard task={baseTask} onOpen={jest.fn()} columnMeta={columnMeta} />);
    expect(useSortable).toHaveBeenCalledWith({ id: baseTask.id });
  });
});
