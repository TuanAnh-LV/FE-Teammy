/**
UTC01 N initials from full name => Returns first letters
- Pre: string with multiple words
- Condition: call initials("Nguyen Van A")
- Confirmation: result "NV"

UTC02 N initials from displayName => Returns initials of displayName
- Pre: object with displayName
- Condition: call initials({ displayName: "Le Minh" })
- Confirmation: result "LM"

UTC03 B initials from email => Uses email prefix initial
- Pre: object with email only
- Condition: call initials({ email: "user@example.com" })
- Confirmation: result "U"

UTC04 B initials falsy input => Returns empty string
- Pre: empty string/undefined
- Condition: call initials("") and initials()
- Confirmation: both return ""

UTC05 N Style maps contain keys => priority/status/tag maps defined
- Pre: style maps imported
- Condition: check high priority, todo status, Frontend tag
- Confirmation: values defined (truthy)
*/

import { initials, priorityStyles, statusStyles, tagStyles } from "../../src/utils/kanbanHelpers";

describe("kanbanHelpers Report5", () => {
  test("UTC01 [N] initials from full name => Returns first letters", () => {
    expect(initials("Nguyen Van A")).toBe("NV");
  });

  test("UTC02 [N] initials from displayName => Returns initials of displayName", () => {
    expect(initials({ displayName: "Le Minh" })).toBe("LM");
  });

  test("UTC03 [B] initials from email => Uses email prefix initial", () => {
    expect(initials({ email: "user@example.com" })).toBe("U");
  });

  test("UTC04 [B] initials falsy input => Returns empty string", () => {
    expect(initials("")).toBe("");
    expect(initials()).toBe("");
  });

  test("UTC05 [N] Style maps contain keys => priority/status/tag maps defined", () => {
    expect(priorityStyles.high).toBeDefined();
    expect(statusStyles.todo).toBeDefined();
    expect(tagStyles.Frontend).toBeDefined();
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "kanbanHelpers",
  totalTC: 5,
  breakdown: { N: 3, B: 2, A: 0 },
  notes: "Covers initials variations (name/displayName/email/falsy) and verifies style map keys exist.",
};
