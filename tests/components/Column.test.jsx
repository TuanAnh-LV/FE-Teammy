import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { jest } from "@jest/globals";
import Column from "../../src/components/common/kanban/Column";

jest.mock("@dnd-kit/core", () => ({
  useDroppable: jest.fn(() => ({ setNodeRef: jest.fn(), isOver: false })),
}));

jest.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }) => <div data-testid="sortable">{children}</div>,
  verticalListSortingStrategy: jest.fn(),
}));

jest.mock("lucide-react", () => ({
  MoreVertical: () => null,
}));

jest.mock("../../src/components/common/kanban/TaskCard", () => (props) => (
  <div data-testid="task-card">{props.task.title}</div>
));

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

const baseMeta = { title: "To Do", position: 1 };
const tasks = [
  { id: "t1", title: "Task 1", columnId: "col-1" },
  { id: "t2", title: "Task 2", columnId: "col-1" },
];

describe("Column", () => {
  test("renders title, count, and tasks", () => {
    render(
      <Column id="col-1" meta={baseMeta} tasks={tasks} onOpen={jest.fn()} columnMeta={{}} />
    );
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getAllByTestId("task-card")).toHaveLength(2);
  });

  test("shows due date label when meta has dueDate", () => {
    render(
      <Column
        id="col-1"
        meta={{ ...baseMeta, dueDate: "2025-12-12T00:00:00Z" }}
        tasks={[]}
        onOpen={jest.fn()}
        columnMeta={{}}
      />
    );
    expect(screen.getByText(/Due:/i)).toBeInTheDocument();
  });

  test("toggles menu and triggers actions", () => {
    const onCreate = jest.fn();
    const onDelete = jest.fn();
    const onMoveColumn = jest.fn();
    render(
      <Column
        id="col-1"
        meta={baseMeta}
        tasks={tasks}
        onOpen={jest.fn()}
        onCreate={onCreate}
        onDelete={onDelete}
        onMoveColumn={onMoveColumn}
        columnMeta={{}}
      />
    );

    const menuBtn = screen.getByLabelText("Column actions");
    fireEvent.click(menuBtn);

    fireEvent.click(screen.getByText(/createTask/i));
    expect(onCreate).not.toHaveBeenCalled(); // quick task just toggles input

    fireEvent.click(menuBtn);
    fireEvent.click(screen.getByText(/moveColumn/i));
    expect(onMoveColumn).toHaveBeenCalledWith("col-1", baseMeta);

    fireEvent.click(menuBtn);
    fireEvent.click(screen.getByText(/deleteColumn/i));
    expect(onDelete).toHaveBeenCalled();
  });

  test("quick add creates task and resets state", () => {
    const onCreate = jest.fn();
    render(
      <Column
        id="col-1"
        meta={baseMeta}
        tasks={[]}
        onOpen={jest.fn()}
        onCreate={onCreate}
        columnMeta={{}}
      />
    );
    const menuBtn = screen.getByLabelText("Column actions");
    fireEvent.click(menuBtn);
    fireEvent.click(screen.getByText(/createTask/i));

    const input = screen.getByPlaceholderText(/whatNeedsToBeDone/i);
    fireEvent.change(input, { target: { value: "New quick task" } });
    fireEvent.click(screen.getByText("Add"));

    expect(onCreate).toHaveBeenCalledWith({ title: "New quick task", priority: "medium" });
  });

  test("quick add cancel and outside click close menus", () => {
    render(
      <Column
        id="col-1"
        meta={baseMeta}
        tasks={tasks}
        onOpen={jest.fn()}
        onCreate={jest.fn()}
        columnMeta={{}}
      />
    );

    const menuBtn = screen.getByLabelText("Column actions");
    fireEvent.click(menuBtn);
    fireEvent.click(screen.getByText(/createTask/i));

    // cancel should hide quick form
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByPlaceholderText(/whatNeedsToBeDone/i)).toBeNull();

    // reopen menu then click outside to close dropdown
    fireEvent.click(menuBtn);
    expect(screen.getByText(/moveColumn/i)).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText(/moveColumn/i)).toBeNull();
  });
});
