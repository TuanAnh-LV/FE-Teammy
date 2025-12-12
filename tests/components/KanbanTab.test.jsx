import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import KanbanTab from "../../src/components/common/workspace/KanbanTab";

const mockConfirm = jest.fn();

jest.mock("antd", () => ({
  Modal: {
    confirm: (...args) => mockConfirm(...args),
  },
}));

const mockCreateTask = jest.fn();
const mockDeleteColumn = jest.fn();
const mockMoveColumn = jest.fn();

jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ children, onDragEnd, onDragOver }) => (
    <div data-testid="dnd" onDragEnd={onDragEnd} onDragOver={onDragOver}>
      {children}
    </div>
  ),
  closestCenter: "closestCenter",
  PointerSensor: jest.fn(),
  useSensor: jest.fn((sensor) => sensor),
  useSensors: jest.fn((...args) => args),
}));

jest.mock("../../src/components/common/kanban/Column", () => (props) => (
  <div data-testid={`column-${props.id}`}>
    <button onClick={() => props.onCreate?.({ title: "Quick" })}>create</button>
    <button onClick={() => props.onMoveColumn?.()}>move</button>
    <button onClick={() => props.onDelete?.()}>delete</button>
    <div>{props.meta?.title}</div>
    {props.tasks.length}
  </div>
));

const columnMeta = {
  b: { title: "B", position: 2 },
  a: { title: "A", position: 1 },
};
const filteredColumns = { a: [{ id: "t1" }], b: [] };

describe("KanbanTab", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("shows loading and error states", () => {
    render(<KanbanTab kanbanLoading t={() => ""} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    render(<KanbanTab kanbanError="err" t={() => ""} />);
    expect(screen.getByText("err")).toBeInTheDocument();
  });

  test("renders columns sorted and triggers handlers", () => {
    render(
      <KanbanTab
        hasKanbanData
        filteredColumns={filteredColumns}
        columnMeta={columnMeta}
        createTask={mockCreateTask}
        deleteColumn={mockDeleteColumn}
        moveColumn={mockMoveColumn}
        setSelectedTask={jest.fn()}
        handleDragEnd={jest.fn()}
        handleDragOver={jest.fn()}
        isColumnModalOpen={false}
        setIsColumnModalOpen={jest.fn()}
        normalizeTitle={(v) => v.toLowerCase()}
        t={() => ""}
      />
    );

    const cols = screen.getAllByTestId(/column-/);
    expect(cols[0]).toHaveTextContent("A"); // sorted by position

    fireEvent.click(screen.getAllByText("create")[0]);
    expect(mockCreateTask).toHaveBeenCalledWith(
      expect.objectContaining({ columnId: "a", status: "a" })
    );

    fireEvent.click(screen.getAllByText("move")[0]);
    expect(mockMoveColumn).toHaveBeenCalledWith("a", columnMeta.a);

    fireEvent.click(screen.getAllByText("delete")[0]);
    expect(mockConfirm).toHaveBeenCalled();
  });

  test("readOnly disables column actions", () => {
    render(
      <KanbanTab
        hasKanbanData
        filteredColumns={filteredColumns}
        columnMeta={columnMeta}
        createTask={mockCreateTask}
        deleteColumn={mockDeleteColumn}
        moveColumn={mockMoveColumn}
        setSelectedTask={jest.fn()}
        handleDragEnd={jest.fn()}
        handleDragOver={jest.fn()}
        isColumnModalOpen={false}
        setIsColumnModalOpen={jest.fn()}
        normalizeTitle={(v) => v.toLowerCase()}
        t={() => ""}
        readOnly
      />
    );

    fireEvent.click(screen.getAllByText("create")[0]);
    expect(mockCreateTask).not.toHaveBeenCalled();
  });

  test("shows placeholder when no board data", () => {
    render(<KanbanTab hasKanbanData={false} t={() => ""} />);
    expect(screen.getByText(/no board data/i)).toBeInTheDocument();
  });
});
