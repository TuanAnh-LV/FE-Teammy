/**
UTC01 N Render column => Shows title, count, tasks
- Pre: meta with title; tasks provided
- Condition: render Column
- Confirmation: title and count match; task cards rendered

UTC02 B Due date label => Displays formatted due date when meta has dueDate
- Pre: meta.dueDate set
- Condition: render Column
- Confirmation: "Due:" label visible

UTC03 N Menu actions => Move and delete handlers invoked
- Pre: onMoveColumn and onDelete mocked
- Condition: open menu, click move then delete
- Confirmation: onMoveColumn called with id/meta; onDelete called

UTC04 N Quick add create => Calls onCreate with title/priority and hides form
- Pre: onCreate mocked
- Condition: open quick add, enter title, click Add
- Confirmation: onCreate called with payload; quick form closes

UTC05 B Quick add empty => Does not call onCreate when title blank
- Pre: onCreate mocked
- Condition: open quick add, click Add without text
- Confirmation: onCreate not called

UTC06 B Cancel and outside click => Quick form/menu close
- Pre: onCreate provided
- Condition: open quick add then Cancel; reopen menu and click outside
- Confirmation: quick form hidden after Cancel; menu closes after outside click
*/

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

describe("Column Report5", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("UTC01 [N] Render column => Shows title, count, tasks", () => {
    render(<Column id="col-1" meta={baseMeta} tasks={tasks} onOpen={jest.fn()} columnMeta={{}} />);
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getAllByTestId("task-card")).toHaveLength(2);
  });

  test("UTC02 [B] Due date label => Displays formatted due date when meta has dueDate", () => {
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

  test("UTC03 [N] Menu actions => Move and delete handlers invoked", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    const onMoveColumn = jest.fn();
    render(
      <Column
        id="col-1"
        meta={baseMeta}
        tasks={tasks}
        onOpen={jest.fn()}
        onMoveColumn={onMoveColumn}
        onDelete={onDelete}
        columnMeta={{}}
      />
    );

    const menuBtn = screen.getByLabelText("Column actions");
    await user.click(menuBtn);
    await user.click(screen.getByText(/moveColumn/i));
    expect(onMoveColumn).toHaveBeenCalledWith("col-1", baseMeta);

    await user.click(menuBtn);
    await user.click(screen.getByText(/deleteColumn/i));
    expect(onDelete).toHaveBeenCalled();
  });

  test("UTC04 [N] Quick add create => Calls onCreate with title/priority and hides form", async () => {
    const user = userEvent.setup();
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
    await user.click(menuBtn);
    await user.click(screen.getByText(/createTask/i));

    const input = screen.getByPlaceholderText(/whatNeedsToBeDone/i);
    await user.type(input, "New quick task");
    await user.click(screen.getByText("Add"));

    expect(onCreate).toHaveBeenCalledWith({ title: "New quick task", priority: "medium" });
    expect(screen.queryByPlaceholderText(/whatNeedsToBeDone/i)).toBeNull();
  });

  test("UTC05 [B] Quick add empty => Does not call onCreate when title blank", async () => {
    const user = userEvent.setup();
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
    await user.click(menuBtn);
    await user.click(screen.getByText(/createTask/i));
    await user.click(screen.getByText("Add"));
    expect(onCreate).not.toHaveBeenCalled();
  });

  test("UTC06 [B] Cancel and outside click => Quick form/menu close", async () => {
    const user = userEvent.setup();
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
    await user.click(menuBtn);
    await user.click(screen.getByText(/createTask/i));
    await user.click(screen.getByText("Cancel"));
    expect(screen.queryByPlaceholderText(/whatNeedsToBeDone/i)).toBeNull();

    await user.click(menuBtn);
    expect(screen.getByText(/moveColumn/i)).toBeInTheDocument();
    await user.pointer({ keys: "[MouseLeft]", target: document.body });
    expect(screen.queryByText(/moveColumn/i)).toBeNull();
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "Column",
  totalTC: 6,
  breakdown: { N: 3, B: 3, A: 0 },
  notes:
    "Covers render/count, due date boundary, move/delete actions, quick add success, empty-title guard, and closing via cancel/outside click.",
};
