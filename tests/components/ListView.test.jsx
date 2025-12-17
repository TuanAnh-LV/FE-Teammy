/**
UTC01 B Empty tasks => Shows placeholder and new task button
- Pre: tasks empty
- Condition: render ListView
- Confirmation: noTasks and newTask text visible; no rows rendered

UTC02 N Render rows and fallback => Displays task data and opens on click
- Pre: tasks include complete and missing fields; columnMeta provided
- Condition: render ListView and click first title
- Confirmation: status/priority/dueDate/assignee rendered; fallbacks shown; onOpenTask called with task

UTC03 N New task button => Calls onCreateTask handler
- Pre: onCreateTask mocked
- Condition: click newTask button
- Confirmation: onCreateTask called once
*/

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ListView from "../../src/components/common/workspace/ListView";

const t = (k) => k;

const columnMeta = {
  todo: { title: "To Do" },
  done: { title: "Done" },
};

const tasks = [
  {
    id: "1",
    title: "Task A",
    description: "Desc A",
    status: "to_do",
    columnId: "todo",
    priority: "high",
    assignees: [{ id: "u1", name: "Alice" }],
    dueDate: "2025-12-12T00:00:00Z",
    comments: [{ id: "c1" }],
  },
  {
    id: "2",
    title: "",
    description: "",
    status: "custom_status",
    columnId: "unknown",
    priority: "",
    assignees: [],
    dueDate: null,
    comments: [],
  },
];

describe("ListView Report5", () => {
  test("UTC01 [B] Empty tasks => Shows placeholder and new task button", () => {
    render(<ListView tasks={[]} columnMeta={{}} t={t} />);
    expect(screen.getByText(/noTasks/i)).toBeInTheDocument();
    expect(screen.getByText(/newTask/i)).toBeInTheDocument();
    expect(screen.queryByText("Task A")).toBeNull();
  });

  test("UTC02 [N] Render rows and fallback => Displays task data and opens on click", async () => {
    const onOpenTask = jest.fn();
    const user = userEvent.setup();
    render(<ListView tasks={tasks} columnMeta={columnMeta} onOpenTask={onOpenTask} t={t} />);

    expect(screen.getByText("Task A")).toBeInTheDocument();
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getAllByText("high").length).toBeGreaterThan(0);
    expect(screen.getByText("12/12/2025")).toBeInTheDocument();
    expect(screen.getByTitle("Alice")).toBeInTheDocument();

    expect(screen.getByText(/untitledTask/i)).toBeInTheDocument();
    expect(screen.getByText(/noDescription/i)).toBeInTheDocument();
    expect(screen.getByText(/unassigned/i)).toBeInTheDocument();

    await user.click(screen.getByText("Task A"));
    expect(onOpenTask).toHaveBeenCalledWith(tasks[0]);
  });

  test("UTC03 [N] New task button => Calls onCreateTask handler", async () => {
    const onCreateTask = jest.fn();
    const user = userEvent.setup();
    render(<ListView tasks={tasks} columnMeta={columnMeta} onCreateTask={onCreateTask} t={t} />);
    await user.click(screen.getByText(/newTask/i));
    expect(onCreateTask).toHaveBeenCalledTimes(1);
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "ListView",
  totalTC: 3,
  breakdown: { N: 2, B: 1, A: 0 },
  notes: "Covers empty placeholder boundary, normal row rendering with fallbacks, open handler, and new-task action.",
};
