/**
UTC01 N filterColumns with search/status/priority => Returns matched tasks only
- Pre: columns with multiple tasks; column order provided
- Condition: call filterColumns with search "find", status "to do", priority "high"
- Confirmation: only matching task remains in todo; other columns empty

UTC02 B filterColumns with empty filters => Returns all tasks
- Pre: same columns
- Condition: call filterColumns with blank search and "All" filters
- Confirmation: lengths match original columns

UTC03 B filterColumns with missing columns => Returns empty object
- Pre: columns undefined
- Condition: call filterColumns with undefined/null
- Confirmation: result equals {} and no throw

UTC04 N moveTaskAcrossColumns => Moves task and preserves order
- Pre: columns with todo/inprogress; order list provided
- Condition: move t1 into inprogress before t3
- Confirmation: todo only t2; inprogress order [t1, t3]

UTC05 B moveTaskAcrossColumns no-op => Returns original for same column or invalid ids
- Pre: columns setup
- Condition: move t1 to same id; move to unknown
- Confirmation: returned object strictly equal to original

UTC06 A moveTaskAcrossColumns without columns list => Returns original
- Pre: columns setup
- Condition: call moveTaskAcrossColumns with empty columnIds array
- Confirmation: returned object strictly equal to original
*/

import { filterColumns, moveTaskAcrossColumns } from "../../src/utils/kanbanUtils";

const columns = {
  todo: [
    { id: "t1", title: "New Task", description: "", status: "to_do", priority: "medium" },
    { id: "t2", title: "Another", description: "find me", status: "to_do", priority: "high" },
  ],
  inprogress: [{ id: "t3", title: "Doing work", description: "", status: "in_progress", priority: "low" }],
  done: [{ id: "t4", title: "Done item", description: "", status: "done", priority: "medium" }],
};

describe("kanbanUtils Report5", () => {
  test("UTC01 [N] filterColumns with search/status/priority => Returns matched tasks only", () => {
    const filtered = filterColumns(columns, "find", "to do", "high", Object.keys(columns));
    expect(filtered.todo).toEqual([columns.todo[1]]);
    expect(filtered.inprogress).toEqual([]);
    expect(filtered.done).toEqual([]);
  });

  test("UTC02 [B] filterColumns with empty filters => Returns all tasks", () => {
    const filtered = filterColumns(columns, "", "All", "All", Object.keys(columns));
    expect(filtered.todo).toHaveLength(2);
    expect(filtered.inprogress).toHaveLength(1);
    expect(filtered.done).toHaveLength(1);
  });

  test("UTC03 [B] filterColumns with missing columns => Returns empty object", () => {
    const filtered = filterColumns(undefined, "", "All", "All", undefined);
    expect(filtered).toEqual({});
  });

  test("UTC04 [N] moveTaskAcrossColumns => Moves task and preserves order", () => {
    const updated = moveTaskAcrossColumns(columns, "t1", "t3", Object.keys(columns));
    expect(updated.todo.map((t) => t.id)).toEqual(["t2"]);
    expect(updated.inprogress.map((t) => t.id)).toEqual(["t1", "t3"]);
  });

  test("UTC05 [B] moveTaskAcrossColumns no-op => Returns original for same column or invalid ids", () => {
    const same = moveTaskAcrossColumns(columns, "t1", "t1", Object.keys(columns));
    expect(same).toBe(columns);
    const missing = moveTaskAcrossColumns(columns, "t1", "unknown", Object.keys(columns));
    expect(missing).toBe(columns);
  });

  test("UTC06 [A] moveTaskAcrossColumns without columns list => Returns original", () => {
    const result = moveTaskAcrossColumns(columns, "t1", "t3", []);
    expect(result).toBe(columns);
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "kanbanUtils",
  totalTC: 6,
  breakdown: { N: 2, B: 3, A: 1 },
  notes: "Covers filterColumns matching/empty/missing inputs and moveTaskAcrossColumns normal move, no-op cases, and missing columnIds guard.",
};
