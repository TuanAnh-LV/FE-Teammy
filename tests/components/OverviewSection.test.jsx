/**
UTC01 N Render description and activity => Shows description and activity count
- Pre: descriptionText provided; recentActivity with status and assignees
- Condition: render component
- Confirmation: description text visible; activity count label shows updates; activity title rendered

UTC02 B No activity => Shows empty activity text
- Pre: recentActivity empty
- Condition: render
- Confirmation: noActivityYet text shown

UTC03 N Assignee rendering => Uses renderAssignee output and separator
- Pre: findAssignees returns two users; renderAssignee returns names
- Condition: render
- Confirmation: joined names displayed

UTC04 B Skills mapping => Applies role color and capitalizes names
- Pre: groupSkills with roles frontend/unknown
- Condition: render
- Confirmation: badges contain capitalized tokens and role color classes
*/

import React from "react";
import { render, screen } from "@testing-library/react";
import OverviewSection from "../../src/components/common/my-group/OverviewSection";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

const statusMeta = {
  todo: { dot: "dot-todo" },
  done: { dot: "dot-done" },
};

const baseTask = {
  id: "t1",
  title: "Task 1",
  status: "todo",
  updatedAt: "2025-01-01",
};

const renderSection = (props = {}) =>
  render(
    <OverviewSection
      descriptionText="Team desc"
      recentActivity={[baseTask]}
      statusMeta={statusMeta}
      findAssignees={() => [{ name: "Alice" }, { name: "Bob" }]}
      renderAssignee={(u) => ({ name: u.name })}
      groupSkills={[]}
      t={(k) => k}
      {...props}
    />
  );

describe("OverviewSection Report5", () => {
  test("UTC01 [N] Render description and activity => Shows description and activity count", () => {
    renderSection();
    expect(screen.getByText("Team desc")).toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.textContent === "1 update")).toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  test("UTC02 [B] No activity => Shows empty activity text", () => {
    renderSection({ recentActivity: [] });
    expect(screen.getByText(/noActivityYet/i)).toBeInTheDocument();
  });

  test("UTC03 [N] Assignee rendering => Uses renderAssignee output and separator", () => {
    renderSection();
    expect(screen.getByText(/Alice, Bob/)).toBeInTheDocument();
  });

  test("UTC04 [B] Skills mapping => Applies role color and capitalizes names", () => {
    renderSection({
      groupSkills: [
        { token: "react", role: "frontend" },
        { name: "custom", role: "other" },
      ],
    });
    expect(screen.getByText("React").className).toMatch(/blue/);
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "OverviewSection",
  totalTC: 4,
  breakdown: { N: 2, B: 2, A: 0 },
  notes:
    "Covers description render, activity list/empty state, assignee names from helpers, and skill badges with role color/capitalization.",
};
