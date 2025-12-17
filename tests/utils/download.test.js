/**
UTC01 N Download with UTF-8 filename => Extracts and decodes filename
- Pre: disposition header with filename*=UTF-8''encoded.xlsx
- Condition: call downloadBlob with data and disposition
- Confirmation: creates anchor with decoded filename; downloads blob

UTC02 N Download with regular filename => Uses filename from header
- Pre: disposition with filename="test.xlsx"
- Condition: call downloadBlob
- Confirmation: anchor download attribute set to test.xlsx

UTC03 B Download without disposition => Uses fallback name
- Pre: no disposition header
- Condition: call downloadBlob with data only
- Confirmation: uses default TeammyUsersTemplate.xlsx

UTC04 N Download Blob instance => Uses blob directly
- Pre: Blob instance passed
- Condition: call downloadBlob with Blob
- Confirmation: creates URL from blob; downloads

UTC05 N Download raw data => Creates blob from data
- Pre: raw data array passed
- Condition: call downloadBlob with array
- Confirmation: wraps in Blob; downloads

UTC06 A Invalid disposition => Falls back gracefully
- Pre: malformed disposition header
- Condition: call downloadBlob
- Confirmation: uses fallback filename without error

UTC07 N Cleanup => Revokes object URL
- Pre: download triggered
- Condition: call downloadBlob
- Confirmation: URL.revokeObjectURL called; anchor removed
*/

import { describe, test, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { downloadBlob } from "../../src/utils/download.js";

describe("download utils Report5", () => {
  let createElementSpy, createObjectURLSpy, revokeObjectURLSpy, appendChildSpy, removeSpy, clickSpy;

  beforeEach(() => {
    // Mock URL methods
    global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = jest.fn();
    createObjectURLSpy = global.URL.createObjectURL;
    revokeObjectURLSpy = global.URL.revokeObjectURL;
    
    clickSpy = jest.fn();
    removeSpy = jest.fn();
    
    const mockAnchor = {
      href: "",
      download: "",
      click: clickSpy,
      remove: removeSpy,
    };
    
    createElementSpy = jest.spyOn(document, "createElement").mockReturnValue(mockAnchor);
    appendChildSpy = jest.spyOn(document.body, "appendChild").mockImplementation(() => {});
  });

  afterEach(() => {
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    jest.clearAllMocks();
  });

  test("UTC01 [N] Download with UTF-8 filename => Extracts and decodes filename", () => {
    const data = new Blob(["test"]);
    const disposition = "attachment; filename*=UTF-8''My%20File.xlsx";
    
    downloadBlob(data, "fallback.xlsx", disposition);
    
    const anchor = createElementSpy.mock.results[0].value;
    expect(anchor.download).toBe("My File.xlsx");
    expect(clickSpy).toHaveBeenCalled();
  });

  test("UTC02 [N] Download with regular filename => Uses filename from header", () => {
    const data = new Blob(["test"]);
    const disposition = 'attachment; filename="test.xlsx"';
    
    downloadBlob(data, "fallback.xlsx", disposition);
    
    const anchor = createElementSpy.mock.results[0].value;
    expect(anchor.download).toBe("test.xlsx");
  });

  test("UTC03 [B] Download without disposition => Uses fallback name", () => {
    const data = new Blob(["test"]);
    
    downloadBlob(data);
    
    const anchor = createElementSpy.mock.results[0].value;
    expect(anchor.download).toBe("TeammyUsersTemplate.xlsx");
  });

  test("UTC04 [N] Download Blob instance => Uses blob directly", () => {
    const blob = new Blob(["content"], { type: "text/plain" });
    
    downloadBlob(blob, "file.txt");
    
    expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalled();
  });

  test("UTC05 [N] Download raw data => Creates blob from data", () => {
    const data = ["raw", "data"];
    
    downloadBlob(data, "data.txt");
    
    expect(createObjectURLSpy).toHaveBeenCalled();
    const anchor = createElementSpy.mock.results[0].value;
    expect(anchor.download).toBe("data.txt");
  });

  test("UTC06 [A] Invalid disposition => Falls back gracefully", () => {
    const data = new Blob(["test"]);
    const disposition = "invalid;;;header";
    
    downloadBlob(data, "fallback.xlsx", disposition);
    
    const anchor = createElementSpy.mock.results[0].value;
    expect(anchor.download).toBe("fallback.xlsx");
    expect(clickSpy).toHaveBeenCalled();
  });

  test("UTC07 [N] Cleanup => Revokes object URL", () => {
    const data = new Blob(["test"]);
    
    downloadBlob(data, "file.txt");
    
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
    expect(removeSpy).toHaveBeenCalled();
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "downloadBlob",
  totalTC: 7,
  breakdown: { N: 5, B: 1, A: 1 },
  notes: "Covers UTF-8/regular filename parsing, fallback, Blob handling, raw data wrapping, invalid headers, and cleanup.",
};
