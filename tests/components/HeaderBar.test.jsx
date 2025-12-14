/**
UTC01 N Click add member => onOpenAdd called
- Pre: handlers provided
- Condition: click Add button
- Confirmation: onOpenAdd called once; onOpenWorkspace not called

UTC02 N Click open workspace => onOpenWorkspace called
- Pre: handlers provided
- Condition: click Workspace button
- Confirmation: onOpenWorkspace called once
*/

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import HeaderBar from "../../src/components/common/my-group/HeaderBar";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

const setup = async () => {
  const onOpenAdd = jest.fn();
  const onOpenWorkspace = jest.fn();
  const user = userEvent.setup();
  render(<HeaderBar onOpenAdd={onOpenAdd} onOpenWorkspace={onOpenWorkspace} />);
  return { onOpenAdd, onOpenWorkspace, user };
};

describe("HeaderBar Report5", () => {
  test("UTC01 [N] Click add member => onOpenAdd called", async () => {
    const { user, onOpenAdd, onOpenWorkspace } = await setup();
    await user.click(screen.getByText(/addMember/i));
    expect(onOpenAdd).toHaveBeenCalledTimes(1);
    expect(onOpenWorkspace).not.toHaveBeenCalled();
  });

  test("UTC02 [N] Click open workspace => onOpenWorkspace called", async () => {
    const { user, onOpenWorkspace } = await setup();
    await user.click(screen.getByText(/openWorkspace/i));
    expect(onOpenWorkspace).toHaveBeenCalledTimes(1);
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "HeaderBar",
  totalTC: 2,
  breakdown: { N: 2, B: 0, A: 0 },
  notes: "Ensures both buttons trigger their respective callbacks with translation mocked.",
};
