import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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

describe("ListView", () => {
  test("renders empty state", () => {
    render(<ListView tasks={[]} columnMeta={{}} t={t} />);
    expect(screen.getByText(/noTasks/i)).toBeInTheDocument();
    expect(screen.getByText(/newTask/i)).toBeInTheDocument();
  });

  test("renders rows with status/priority/assignees and triggers onOpenTask", () => {
    const onOpenTask = jest.fn();
    render(<ListView tasks={tasks} columnMeta={columnMeta} onOpenTask={onOpenTask} t={t} />);

    expect(screen.getByText("Task A")).toBeInTheDocument();
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getAllByText("high").length).toBeGreaterThan(0);
    expect(screen.getByText("12/12/2025")).toBeInTheDocument();
    expect(screen.getByTitle("Alice")).toBeInTheDocument();

    // fallback values for missing data
    expect(screen.getByText(/untitledTask/i)).toBeInTheDocument();
    expect(screen.getByText(/noDescription/i)).toBeInTheDocument();
    expect(screen.getByText(/unassigned/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Task A"));
    expect(onOpenTask).toHaveBeenCalledWith(tasks[0]);
  });

  test("new task button invokes onCreateTask when provided", () => {
    const onCreateTask = jest.fn();
    render(<ListView tasks={tasks} columnMeta={columnMeta} onCreateTask={onCreateTask} t={t} />);
    fireEvent.click(screen.getByText(/newTask/i));
    expect(onCreateTask).toHaveBeenCalled();
  });
});
