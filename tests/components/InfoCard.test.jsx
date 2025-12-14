/**
UTC01 N Render info => Shows title, status, counts, progress clamped
- Pre: group with statusText, maxMembers, progress >100
- Condition: render InfoCard
- Confirmation: displays title, status label, member counts, progress shown at 100%

UTC02 B Without handlers => Back button hidden and edit/select absent
- Pre: onBack/onEdit/onSelectTopic undefined
- Condition: render component
- Confirmation: no button text "back"/"editGroup"/"selectTopic"

UTC03 N Click handlers => onBack/onEdit/onSelectTopic invoked
- Pre: handlers provided
- Condition: click buttons
- Confirmation: each handler called once
*/

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import InfoCard from "../../src/components/common/my-group/InfoCard";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

const baseGroup = {
  title: "Group Alpha",
  statusText: "Active",
  maxMembers: 5,
  field: "CS",
  semester: "2025A",
  end: "2025-12-12",
  progress: 150,
  topicName: "AI",
};

describe("InfoCard Report5", () => {
  test("UTC01 [N] Render info => Shows title, status, counts, progress clamped", () => {
    render(<InfoCard group={baseGroup} memberCount={3} />);
    expect(screen.getByText("Group Alpha")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("3/5")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  test("UTC02 [B] Without handlers => Back and actions hidden", () => {
    render(<InfoCard group={baseGroup} memberCount={1} />);
    expect(screen.queryByText(/back/i)).toBeNull();
    expect(screen.queryByText(/editGroup/i)).toBeNull();
    expect(screen.queryByText(/selectTopic/i)).toBeNull();
  });

  test("UTC03 [N] Click handlers => onBack/onEdit/onSelectTopic invoked", async () => {
    const user = userEvent.setup();
    const onBack = jest.fn();
    const onEdit = jest.fn();
    const onSelectTopic = jest.fn();
    render(
      <InfoCard
        group={baseGroup}
        memberCount={2}
        onBack={onBack}
        onEdit={onEdit}
        onSelectTopic={onSelectTopic}
      />
    );
    await user.click(screen.getByText(/back/i));
    await user.click(screen.getByText(/editGroup/i));
    await user.click(screen.getByText(/selectTopic/i));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onSelectTopic).toHaveBeenCalledTimes(1);
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "InfoCard",
  totalTC: 3,
  breakdown: { N: 2, B: 1, A: 0 },
  notes: "Validates render with progress clamp and action buttons invoke handlers when provided.",
};
