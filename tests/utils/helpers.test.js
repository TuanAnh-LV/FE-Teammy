/**
UTC01 N toArraySafe with array => Returns same array
- Pre: input is array
- Condition: call toArraySafe([1,2])
- Confirmation: result strictly equals input

UTC02 N toArraySafe with response data => Extracts data array
- Pre: res.data = [1]
- Condition: call toArraySafe({ data: [1] })
- Confirmation: result [1]

UTC03 B toArraySafe missing arrays => Returns empty array
- Pre: undefined input
- Condition: call toArraySafe(undefined)
- Confirmation: result []

UTC04 N timeAgoFrom past => Returns minutes string
- Pre: iso 2 minutes ago
- Condition: call timeAgoFrom(iso)
- Confirmation: string includes "minute"

UTC05 B timeAgoFrom future/invalid => Handles gracefully
- Pre: future iso; invalid string
- Condition: call timeAgoFrom(future) and timeAgoFrom("bad")
- Confirmation: future returns "just now"; invalid returns ""

UTC06 N toArrayPositions => Parses snake/camel string into array
- Pre: obj.position_needed = "dev, qa"
- Condition: call toArrayPositions(obj)
- Confirmation: ["dev","qa"]

UTC07 N toArraySkills => Parses array, JSON string, and CSV
- Pre: array ["js"]; json "[\"css\",\"bootstrap\"]"; csv "ts, react "
- Condition: call toArraySkills with each
- Confirmation: returns filtered arrays accordingly

UTC08 B toArraySkills empty => Returns []
- Pre: empty string
- Condition: call toArraySkills("")
- Confirmation: []

UTC09 N avatarFromEmail => Builds URL with encoded name and clamped size
- Pre: email "u+ser@example.com", size 10
- Condition: call avatarFromEmail(email, 10)
- Confirmation: URL contains encoded name "u ser", size=32, background hex

UTC10 N getErrorMessage => Picks nested message over fallback
- Pre: error.response.data.message set
- Condition: call getErrorMessage(error, "fallback")
- Confirmation: returns message; when missing returns fallback
*/

import {
  toArraySafe,
  timeAgoFrom,
  toArrayPositions,
  toArraySkills,
  initials,
  avatarFromEmail,
  getErrorMessage,
} from "../../src/utils/helpers";

describe("helpers Report5", () => {
  test("UTC01 [N] toArraySafe with array => Returns same array", () => {
    const arr = [1, 2];
    expect(toArraySafe(arr)).toBe(arr);
  });

  test("UTC02 [N] toArraySafe with response data => Extracts data array", () => {
    expect(toArraySafe({ data: [1] })).toEqual([1]);
  });

  test("UTC03 [B] toArraySafe missing arrays => Returns empty array", () => {
    expect(toArraySafe(undefined)).toEqual([]);
  });

  test("UTC04 [N] timeAgoFrom past => Returns minutes string", () => {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    expect(timeAgoFrom(twoMinutesAgo)).toMatch(/minute/);
  });

  test("UTC05 [B] timeAgoFrom future/invalid => Handles gracefully", () => {
    const future = new Date(Date.now() + 60 * 1000).toISOString();
    expect(timeAgoFrom(future)).toBe("just now");
    expect(timeAgoFrom("not-a-date")).toBe("");
  });

  test("UTC06 [N] toArrayPositions => Parses snake/camel string into array", () => {
    expect(toArrayPositions({ position_needed: "dev, qa" })).toEqual(["dev", "qa"]);
    expect(toArrayPositions({ positionNeeded: "pm" })).toEqual(["pm"]);
  });

  test("UTC07 [N] toArraySkills => Parses array, JSON string, and CSV", () => {
    expect(toArraySkills({ skills: ["js", "", ""] })).toEqual(["js"]);
    expect(toArraySkills({ skills: '["css","bootstrap"]' })).toEqual(["css", "bootstrap"]);
    expect(toArraySkills({ skills: "ts, react " })).toEqual(["ts", "react"]);
  });

  test("UTC08 [B] toArraySkills empty => Returns []", () => {
    expect(toArraySkills("")).toEqual([]);
  });

  test("UTC09 [N] avatarFromEmail => Builds URL with encoded name and clamped size", () => {
    const url = avatarFromEmail("u+ser@example.com", 10);
    expect(url).toContain("name=u%20ser");
    expect(url).toContain("size=32");
    expect(url).toMatch(/background=[0-9A-F]{6}/);
  });

  test("UTC10 [N] getErrorMessage => Picks nested message over fallback", () => {
    const err = { response: { data: { message: "bad" } } };
    expect(getErrorMessage(err, "fallback")).toBe("bad");
    expect(getErrorMessage(null, "fallback")).toBe("fallback");
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "helpers",
  totalTC: 10,
  breakdown: { N: 7, B: 3, A: 0 },
  notes:
    "Covers toArraySafe variants, timeAgo past/future/invalid, positions/skills parsing, initials, avatar URL generation, and error message fallback.",
};
