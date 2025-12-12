import { filterColumns, moveTaskAcrossColumns } from "../../src/utils/kanbanUtils";

describe("kanbanUtils", () => {
  const columns = {
    todo: [
      { id: "t1", title: "New Task", description: "", status: "to_do", priority: "medium" },
      { id: "t2", title: "Another", description: "find me", status: "to_do", priority: "high" },
    ],
    inprogress: [{ id: "t3", title: "Doing work", description: "", status: "in_progress", priority: "low" }],
    done: [{ id: "t4", title: "Done item", description: "", status: "done", priority: "medium" }],
  };

  test("filterColumns matches search + status + priority with normalized status", () => {
    const filtered = filterColumns(columns, "find", "to do", "high", Object.keys(columns));
    expect(filtered.todo).toEqual([columns.todo[1]]);
    expect(filtered.inprogress).toEqual([]);
    expect(filtered.done).toEqual([]);
  });

  test("filterColumns returns all when filters are All/empty", () => {
    const filtered = filterColumns(columns, "", "All", "All", Object.keys(columns));
    expect(filtered.todo).toHaveLength(2);
    expect(filtered.inprogress).toHaveLength(1);
    expect(filtered.done).toHaveLength(1);
  });

  test("moveTaskAcrossColumns moves task and keeps order", () => {
    const updated = moveTaskAcrossColumns(columns, "t1", "t3", Object.keys(columns));
    expect(updated.todo.map((t) => t.id)).toEqual(["t2"]);
    expect(updated.inprogress.map((t) => t.id)).toEqual(["t1", "t3"]);
  });

  test("moveTaskAcrossColumns no-op when same column or invalid ids", () => {
    const same = moveTaskAcrossColumns(columns, "t1", "t1", Object.keys(columns));
    expect(same).toBe(columns);

    const missing = moveTaskAcrossColumns(columns, "t1", "unknown", Object.keys(columns));
    expect(missing).toBe(columns);
  });

  test("findColumnOfTask returns undefined when not found", () => {
    const result = moveTaskAcrossColumns({ todo: [] }, "x", "y", ["todo"]);
    expect(result).toEqual({ todo: [] });
  });
});
