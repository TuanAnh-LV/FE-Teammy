/**
UTC01 N Loading state => Renders loading text
- Pre: kanbanLoading true
- Condition: render KanbanTab with t returning "Loading..."
- Confirmation: loading text visible

UTC02 A Error state => Shows error message
- Pre: kanbanError set
- Condition: render KanbanTab with kanbanError
- Confirmation: error text rendered

UTC03 B No board data => Shows placeholder
- Pre: hasKanbanData false
- Condition: render KanbanTab
- Confirmation: placeholder text shown

UTC04 N Columns sorted => First column follows position
- Pre: columnMeta unsorted; filteredColumns provided
- Condition: render KanbanTab
- Confirmation: columns sorted by position; first shows title A

UTC05 N Quick create => createTask called with defaults
- Pre: createTask mocked
- Condition: trigger onCreate from first column
- Confirmation: createTask called with columnId/status/title defaults

UTC06 N Move column => moveColumn called with id/meta
- Pre: moveColumn mocked
- Condition: trigger onMoveColumn
- Confirmation: moveColumn called with colId and meta

UTC07 N Delete column => confirm runs and deleteColumn called
- Pre: Modal.confirm mocked to call onOk
- Condition: trigger onDelete
- Confirmation: deleteColumn called with colId

UTC08 B readOnly => Actions disabled
- Pre: readOnly true
- Condition: click create/move/delete triggers
- Confirmation: handlers not called
*/

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    <span data-testid="tasks-count">{props.tasks.length}</span>
  </div>
));

const columnMeta = {
  b: { title: "B", position: 2, columnId: "b" },
  a: { title: "A", position: 1, columnId: "a" },
};
const filteredColumns = { a: [{ id: "t1" }], b: [] };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("KanbanTab Report5", () => {
  test("UTC01 [N] Loading state => Renders loading text", () => {
    render(<KanbanTab kanbanLoading t={() => "Loading..."} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("UTC02 [A] Error state => Shows error message", () => {
    render(<KanbanTab kanbanError="err" t={() => ""} />);
    expect(screen.getByText("err")).toBeInTheDocument();
  });

  test("UTC03 [B] No board data => Shows placeholder", () => {
    render(<KanbanTab hasKanbanData={false} t={() => "No board data available."} />);
    expect(screen.getByText(/no board data/i)).toBeInTheDocument();
  });

  test("UTC04 [N] Columns sorted => First column follows position", () => {
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
    expect(cols[0]).toHaveTextContent("A");
  });

  test("UTC05 [N] Quick create => createTask called with defaults", async () => {
    const user = userEvent.setup();
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
    await user.click(screen.getAllByText("create")[0]);
    expect(mockCreateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        columnId: "a",
        status: "a",
        title: "Quick",
        priority: "medium",
      })
    );
  });

  test("UTC06 [N] Move column => moveColumn called with id/meta", async () => {
    const user = userEvent.setup();
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
    await user.click(screen.getAllByText("move")[0]);
    expect(mockMoveColumn).toHaveBeenCalledWith("a", columnMeta.a);
  });

  test("UTC07 [N] Delete column => confirm runs and deleteColumn called", async () => {
    const user = userEvent.setup();
    mockConfirm.mockImplementation(({ onOk }) => onOk && onOk());
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
        t={(k) => k}
      />
    );
    await user.click(screen.getAllByText("delete")[0]);
    expect(mockConfirm).toHaveBeenCalled();
    expect(mockDeleteColumn).toHaveBeenCalledWith("a");
  });

  test("UTC08 [B] readOnly => Actions disabled", async () => {
    const user = userEvent.setup();
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
    await user.click(screen.getAllByText("create")[0]);
    await user.click(screen.getAllByText("move")[0]);
    await user.click(screen.getAllByText("delete")[0]);
    expect(mockCreateTask).not.toHaveBeenCalled();
    expect(mockMoveColumn).not.toHaveBeenCalled();
    expect(mockDeleteColumn).not.toHaveBeenCalled();
    expect(mockConfirm).not.toHaveBeenCalled();
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "KanbanTab",
  totalTC: 8,
  breakdown: { N: 6, B: 2, A: 1 },
  notes:
    "Covered loading/error/placeholder, sorted columns, quick create payload, move/delete handlers, and readOnly disabling actions with deterministic mocks.",
};
