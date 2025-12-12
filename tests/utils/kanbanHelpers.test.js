import { initials, priorityStyles, statusStyles, tagStyles } from "../../src/utils/kanbanHelpers";

describe("kanbanHelpers", () => {
  test("initials handles string with multiple words", () => {
    expect(initials("Nguyen Van A")).toBe("NV");
  });

  test("initials handles object displayName and email", () => {
    expect(initials({ displayName: "Le Minh" })).toBe("LM");
    expect(initials({ email: "user@example.com" })).toBe("U");
  });

  test("initials returns empty string for falsy/empty", () => {
    expect(initials("")).toBe("");
    expect(initials()).toBe("");
  });

  test("style maps contain expected keys", () => {
    expect(priorityStyles.high).toBeDefined();
    expect(statusStyles.todo).toBeDefined();
    expect(tagStyles.Frontend).toBeDefined();
  });
});
