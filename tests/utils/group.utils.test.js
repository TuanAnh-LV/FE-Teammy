/**
UTC01 N formatSemester normal => Formats season and year
- Pre: season "spring", year 2025
- Condition: call formatSemester
- Confirmation: returns "Spring 2025"

UTC02 B formatSemester missing data => Fallback to season value stringified
- Pre: season 0, year ""
- Condition: call formatSemester
- Confirmation: returns "0"

UTC03 N normalizeGroup maps fields and clamps progress => Returns normalized object
- Pre: group with over-100 progress, leader role, members array
- Condition: call normalizeGroup(group, 0)
- Confirmation: id/title/progress capped to 100; isLeader true; semesterLabel formatted

UTC04 B normalizeGroup skills/members/progress fallback => Parses skills string and numeric fallback
- Pre: skills string with commas/spaces; members numeric; progress string
- Condition: call normalizeGroup(group, 1)
- Confirmation: skills array trimmed; members count kept; progress number parsed

UTC05 N mapPendingRequest => Picks id/name/email defaults
- Pre: request object with requesterName/email
- Condition: call mapPendingRequest
- Confirmation: id/email/name mapped correctly

UTC06 N calculateProgressFromTasks => Computes percent done across columns
- Pre: board with one done column and two todo tasks
- Condition: call calculateProgressFromTasks
- Confirmation: returns 33

UTC07 A calculateProgressFromTasks null => Returns 0
- Pre: board null/undefined
- Condition: call calculateProgressFromTasks(null)
- Confirmation: returns 0
*/

import {
  formatSemester,
  normalizeGroup,
  mapPendingRequest,
  calculateProgressFromTasks,
} from "../../src/utils/group.utils";

describe("group.utils Report5", () => {
  test("UTC01 [N] formatSemester normal => Formats season and year", () => {
    expect(formatSemester({ season: "spring", year: 2025 })).toBe("Spring 2025");
  });

  test("UTC02 [B] formatSemester missing data => Fallback to season value stringified", () => {
    expect(formatSemester({ season: 0, year: "" })).toBe("0");
  });

  test("UTC03 [N] normalizeGroup maps fields and clamps progress => Returns normalized object", () => {
    const group = {
      groupId: "g1",
      name: "Team A",
      progress: 120,
      maxMembers: 10,
      members: [{ name: "Alice", id: "u1" }],
      role: "leader",
      major: { name: "CS", id: "m1" },
      semester: { season: "fall", year: 2024 },
    };
    const normalized = normalizeGroup(group, 0);
    expect(normalized.id).toBe("g1");
    expect(normalized.title).toBe("Team A");
    expect(normalized.progress).toBe(100);
    expect(normalized.isLeader).toBe(true);
    expect(normalized.memberPreview[0].name).toBe("Alice");
    expect(normalized.semesterLabel).toBe("Fall 2024");
  });

  test("UTC04 [B] normalizeGroup skills/members/progress fallback => Parses skills string and numeric fallback", () => {
    const group = {
      id: "g2",
      skills: "js, react , ",
      membersList: [],
      members: 4,
      progress: "10",
    };
    const normalized = normalizeGroup(group, 1);
    expect(normalized.skills).toEqual(["js", "react"]);
    expect(normalized.members).toBe(4);
    expect(normalized.progress).toBe(10);
  });

  test("UTC05 [N] mapPendingRequest => Picks id/name/email defaults", () => {
    const mapped = mapPendingRequest({
      requestId: "r1",
      requesterName: "Bob",
      requesterEmail: "bob@example.com",
    });
    expect(mapped.id).toBe("r1");
    expect(mapped.email).toBe("bob@example.com");
    expect(mapped.name).toBe("Bob");
  });

  test("UTC06 [N] calculateProgressFromTasks => Computes percent done across columns", () => {
    const board = {
      columns: [
        { tasks: [{ id: "t1" }, { id: "t2" }] },
        { isDone: true, tasks: [{ id: "t3" }] },
      ],
    };
    expect(calculateProgressFromTasks(board)).toBe(33);
  });

  test("UTC07 [A] calculateProgressFromTasks null => Returns 0", () => {
    expect(calculateProgressFromTasks(null)).toBe(0);
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "group.utils",
  totalTC: 7,
  breakdown: { N: 4, B: 2, A: 1 },
  notes:
    "Covers semester formatting, normalizeGroup mapping/clamp and skill parsing, pending request defaults, and calculateProgressFromTasks normal and null inputs.",
};
