import {
  formatSemester,
  normalizeGroup,
  mapPendingRequest,
  calculateProgressFromTasks,
} from "../../src/utils/group.utils";

describe("group.utils", () => {
  test("formatSemester formats season and year", () => {
    expect(formatSemester({ season: "spring", year: 2025 })).toBe("Spring 2025");
    expect(formatSemester({ season: 0, year: "" })).toBe("0");
  });

  test("normalizeGroup maps fields and members", () => {
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
    expect(normalized.skills).toEqual([]);
  });

  test("mapPendingRequest picks default fields", () => {
    const mapped = mapPendingRequest({
      requestId: "r1",
      requesterName: "Bob",
      requesterEmail: "bob@example.com",
    });
    expect(mapped.id).toBe("r1");
    expect(mapped.email).toBe("bob@example.com");
    expect(mapped.name).toBe("Bob");
  });

  test("calculateProgressFromTasks handles different column/task shapes", () => {
    const board = {
      columns: [
        { tasks: [{ id: "t1" }, { id: "t2" }] },
        { isDone: true, tasks: [{ id: "t3" }] },
      ],
    };
    expect(calculateProgressFromTasks(board)).toBe(33);
    expect(calculateProgressFromTasks(null)).toBe(0);
  });

  test("normalizeGroup parses skills and member counts fallback", () => {
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
});
