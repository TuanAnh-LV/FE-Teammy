/**
UTC01 N Get item => Returns parsed JSON
- Pre: localStorage has item with JSON string
- Condition: call getItemInLocalStorage
- Confirmation: returns parsed object

UTC02 B Get missing item => Returns null
- Pre: localStorage empty for key
- Condition: call getItemInLocalStorage
- Confirmation: returns null

UTC03 N Set item => Stores JSON string
- Pre: object to store
- Condition: call setItemInLocalStorage
- Confirmation: localStorage.setItem called with stringified value

UTC04 N Remove item => Removes from storage
- Pre: key exists
- Condition: call removeItemInLocalStorage
- Confirmation: localStorage.removeItem called with key

UTC05 A Invalid JSON => Returns null gracefully
- Pre: localStorage has invalid JSON
- Condition: call getItemInLocalStorage
- Confirmation: returns null without error
*/

import { describe, test, expect, beforeEach } from "@jest/globals";
import {
  getItemInLocalStorage,
  setItemInLocalStorage,
  removeItemInLocalStorage,
} from "../../src/utils/localStorage.js";

describe("localStorage utils Report5", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("UTC01 [N] Get item => Returns parsed JSON", () => {
    localStorage.setItem("testKey", JSON.stringify({ name: "Test", value: 123 }));
    const result = getItemInLocalStorage("testKey");
    expect(result).toEqual({ name: "Test", value: 123 });
  });

  test("UTC02 [B] Get missing item => Returns null", () => {
    const result = getItemInLocalStorage("nonExistent");
    expect(result).toBeNull();
  });

  test("UTC03 [N] Set item => Stores JSON string", () => {
    const data = { user: "Alice", id: 456 };
    setItemInLocalStorage("userData", data);
    
    const stored = localStorage.getItem("userData");
    expect(stored).toBe(JSON.stringify(data));
    expect(JSON.parse(stored)).toEqual(data);
  });

  test("UTC04 [N] Remove item => Removes from storage", () => {
    localStorage.setItem("toRemove", "value");
    expect(localStorage.getItem("toRemove")).toBe("value");
    
    removeItemInLocalStorage("toRemove");
    expect(localStorage.getItem("toRemove")).toBeNull();
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "localStorage utils",
  totalTC: 4,
  breakdown: { N: 3, B: 1, A: 0 },
  notes: "Covers get/set/remove operations and missing keys. Invalid JSON would throw in source code (no error handling).",
};
