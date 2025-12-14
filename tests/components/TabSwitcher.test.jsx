/**
UTC01 N Change tab => onChange called with key
- Pre: tabs array provided
- Condition: click inactive tab
- Confirmation: onChange called with that tab key

UTC02 B Active tab styled => Only active has selected classes
- Pre: activeTab set
- Condition: render
- Confirmation: active tab has selected class substring; inactive does not
*/

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import TabSwitcher from "../../src/components/common/my-group/TabSwitcher";

const tabs = [
  { key: "info", label: "Info" },
  { key: "members", label: "Members" },
];

describe("TabSwitcher Report5", () => {
  test("UTC01 [N] Change tab => onChange called with key", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<TabSwitcher activeTab="info" tabs={tabs} onChange={onChange} />);
    await user.click(screen.getByText("Members"));
    expect(onChange).toHaveBeenCalledWith("members");
  });

  test("UTC02 [B] Active tab styled => Only active has selected classes", () => {
    const { container } = render(<TabSwitcher activeTab="members" tabs={tabs} onChange={() => {}} />);
    const buttons = container.querySelectorAll("button");
    expect(buttons[1].className).toMatch(/bg-white/);
    expect(buttons[0].className).not.toMatch(/bg-white text-gray-900/);
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "TabSwitcher",
  totalTC: 2,
  breakdown: { N: 1, B: 1, A: 0 },
  notes: "Verifies tab change callback and active styling.",
};
