/**
UTC01 N Render activities => Shows title, description, assignees and status color
- Pre: items array with assignees and status "done"
- Condition: render component
- Confirmation: title and description visible; status dot has green class; assignee names shown

UTC02 B Empty items => Shows empty state texts
- Pre: items empty
- Condition: render
- Confirmation: noRecentActivity and activityWillAppearHere texts shown

UTC03 B Assignees over limit => Shows +X overflow
- Pre: 5 assignees
- Condition: render
- Confirmation: text contains "+1"

UTC04 A Missing assignees => Shows fallback text
- Pre: assignees undefined
- Condition: render
- Confirmation: "No assignees" displayed
*/

import React from "react";
import { render, screen } from "@testing-library/react";
import RecentActivityCard from "../../src/components/common/my-group/RecentActivityCard";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

const baseItem = {
  id: "1",
  title: "Implement feature",
  description: "Details",
  status: "done",
  assignees: [
    { name: "Alice", displayName: "Alice", avatarUrl: "a" },
    { name: "Bob", displayName: "Bob", avatarUrl: "b" },
  ],
};

describe("RecentActivityCard Report5", () => {
  test("UTC01 [N] Render activities => Shows title, description, assignees and status color", () => {
    render(<RecentActivityCard items={[baseItem]} />);
    expect(screen.getByText(/Implement feature/)).toBeInTheDocument();
    expect(screen.getByText(/Details/)).toBeInTheDocument();
    const dot = screen.getByText(/Implement feature/).closest("div").previousSibling.querySelector("span, .bg");
    expect(document.querySelector(".bg-green-500")).toBeTruthy();
    expect(screen.getByText(/Alice, Bob/)).toBeInTheDocument();
  });

  test("UTC02 [B] Empty items => Shows empty state texts", () => {
    render(<RecentActivityCard items={[]} />);
    expect(screen.getByText(/noRecentActivity/i)).toBeInTheDocument();
    expect(screen.getByText(/activityWillAppearHere/i)).toBeInTheDocument();
  });

  test("UTC03 [B] Assignees over limit => Shows +X overflow", () => {
    const assignees = Array.from({ length: 5 }, (_, i) => ({ name: `User${i}`, displayName: `User${i}` }));
    render(<RecentActivityCard items={[{ ...baseItem, assignees }]} />);
    expect(screen.getByText(/\+1/)).toBeInTheDocument();
  });

  test("UTC04 [A] Missing assignees => Shows fallback text", () => {
    render(<RecentActivityCard items={[{ ...baseItem, assignees: undefined }]} />);
    expect(screen.getByText(/No assignees/)).toBeInTheDocument();
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "RecentActivityCard",
  totalTC: 4,
  breakdown: { N: 1, B: 2, A: 1 },
  notes:
    "Covers normal activity rendering with status color and assignees, empty state, overflow indicator, and missing assignees fallback.",
};
