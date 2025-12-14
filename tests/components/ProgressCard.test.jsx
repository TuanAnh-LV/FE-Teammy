/**
UTC01 N Render progress => Shows value percent and label
- Pre: value provided
- Condition: render component
- Confirmation: displays text and percent

UTC02 B Missing text uses translation fallback => Shows t('progress')
- Pre: text undefined
- Condition: render
- Confirmation: label from t; value still rendered
*/

import React from "react";
import { render, screen } from "@testing-library/react";
import ProgressCard from "../../src/components/common/my-group/ProgressCard";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

describe("ProgressCard Report5", () => {
  test("UTC01 [N] Render progress => Shows value percent and label", () => {
    render(<ProgressCard value={45} text="Done" />);
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("45%")).toBeInTheDocument();
  });

  test("UTC02 [B] Missing text uses translation fallback => Shows t('progress')", () => {
    render(<ProgressCard value={80} />);
    expect(screen.getByText(/progress/i)).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "ProgressCard",
  totalTC: 2,
  breakdown: { N: 1, B: 1, A: 0 },
  notes: "Covers normal render and translation fallback label.",
};
