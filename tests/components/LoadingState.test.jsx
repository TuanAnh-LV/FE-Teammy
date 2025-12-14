/**
UTC01 N Render fullscreen skeleton => Has role status busy and default rows
- Pre: no props
- Condition: render LoadingState
- Confirmation: role=status with aria-busy; renders 2 activity skeleton avatars

UTC02 B Non-fullscreen custom rows => Uses compact padding and row count
- Pre: fullscreen false, rows=3
- Condition: render component
- Confirmation: class contains py-10 and lacks min-h-screen; renders 3 activity skeleton avatars
*/

import React from "react";
import { render, screen } from "@testing-library/react";
import LoadingState from "../../src/components/common/LoadingState";

describe("LoadingState Report5", () => {
  test("UTC01 [N] Render fullscreen skeleton => Has role status busy and default rows", () => {
    render(<LoadingState />);
    const container = screen.getByRole("status");
    expect(container).toHaveAttribute("aria-busy", "true");
    const avatars = container.querySelectorAll(".h-8.w-8.rounded-full.bg-gray-100");
    expect(avatars.length).toBe(2);
    expect(container.className).toContain("min-h-screen");
  });

  test("UTC02 [B] Non-fullscreen custom rows => Uses compact padding and row count", () => {
    render(<LoadingState fullscreen={false} rows={3} />);
    const container = screen.getByRole("status");
    expect(container.className).toContain("py-10");
    expect(container.className).not.toContain("min-h-screen");
    const avatars = container.querySelectorAll(".h-8.w-8.rounded-full.bg-gray-100");
    expect(avatars.length).toBe(3);
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "LoadingState",
  totalTC: 2,
  breakdown: { N: 1, B: 1, A: 0 },
  notes: "Checks aria busy status and skeleton row counts for fullscreen and compact modes.",
};
