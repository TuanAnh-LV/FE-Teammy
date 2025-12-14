/**
UTC01 N useTranslation hook => Returns t function and language
- Pre: LanguageContext provides language
- Condition: call useTranslation hook
- Confirmation: returns object with t and language properties

UTC02 N t function => Returns translation for key
- Pre: getTranslation mocked
- Condition: call t with key
- Confirmation: getTranslation called with key and language

UTC03 B Language change => Updates translations
- Pre: language switches from en to vi
- Condition: re-render with new language
- Confirmation: t function uses new language
*/

import React from "react";
import { renderHook } from "@testing-library/react";
import { jest } from "@jest/globals";
import { useTranslation } from "../../src/hook/useTranslation";

const mockGetTranslation = jest.fn((key) => key);
const mockLanguage = { language: "en" };

jest.mock("../../src/context/LanguageContext", () => ({
  useLanguage: () => mockLanguage,
}));

jest.mock("../../src/translations", () => ({
  getTranslation: (key, lang) => mockGetTranslation(key, lang),
}));

describe("useTranslation Report5", () => {
  beforeEach(() => {
    mockGetTranslation.mockClear();
    mockLanguage.language = "en";
  });

  test("UTC01 [N] useTranslation hook => Returns t function and language", () => {
    const { result } = renderHook(() => useTranslation());
    
    expect(result.current).toHaveProperty("t");
    expect(result.current).toHaveProperty("language");
    expect(typeof result.current.t).toBe("function");
    expect(result.current.language).toBe("en");
  });

  test("UTC02 [N] t function => Returns translation for key", () => {
    mockGetTranslation.mockReturnValue("Hello");
    
    const { result } = renderHook(() => useTranslation());
    const translation = result.current.t("greeting");
    
    expect(mockGetTranslation).toHaveBeenCalledWith("greeting", "en");
    expect(translation).toBe("Hello");
  });

  test("UTC03 [B] Language change => Updates translations", () => {
    const { result, rerender } = renderHook(() => useTranslation());
    
    result.current.t("test");
    expect(mockGetTranslation).toHaveBeenCalledWith("test", "en");
    
    mockGetTranslation.mockClear();
    mockLanguage.language = "vi";
    rerender();
    
    result.current.t("test");
    expect(mockGetTranslation).toHaveBeenCalledWith("test", "vi");
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "useTranslation",
  totalTC: 3,
  breakdown: { N: 2, B: 1, A: 0 },
  notes: "Covers hook return values, translation function call, and language switching.",
};
