/**
UTC01 N Open with member => Prefills role and shows name
- Pre: isOpen true, member has id and role
- Condition: render AssignRoleModal
- Confirmation: title/name visible; input prefilled with role

UTC02 B Closed modal => Returns null
- Pre: isOpen false
- Condition: render component
- Confirmation: container empty

UTC03 N Change role and submit => Calls onAssign with memberId and role
- Pre: member has id; onAssign mock
- Condition: type new role and submit
- Confirmation: onAssign called with id and role; onClose not auto-called

UTC04 B Empty role => Submit blocked and onAssign not called
- Pre: member provided
- Condition: clear input and click save
- Confirmation: save disabled; onAssign not called

UTC05 A Missing member id => Does not call onAssign
- Pre: member without id fields
- Condition: enter role and submit
- Confirmation: onAssign not called

UTC06 B Backdrop click closes when not submitting => onClose called
- Pre: isOpen true, submitting false
- Condition: click backdrop
- Confirmation: onClose called once

UTC07 A Backdrop ignored when submitting => onClose not called
- Pre: submitting true
- Condition: click backdrop
- Confirmation: onClose not called; buttons disabled
*/

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import AssignRoleModal from "../../src/components/common/my-group/AssignRoleModal";

const renderModal = (props = {}) => {
  const onClose = jest.fn();
  const onAssign = jest.fn();
  const t = (k) => k;
  const utils = render(
    <AssignRoleModal
      isOpen
      onClose={onClose}
      onAssign={onAssign}
      member={{ id: "m1", name: "Alice", role: "Backend" }}
      t={t}
      {...props}
    />
  );
  return { ...utils, onClose, onAssign };
};

describe("AssignRoleModal Report5", () => {
  test("UTC01 [N] Open with member => Prefills role and shows name", () => {
    renderModal();
    expect(screen.getByText(/assignRole/i)).toBeInTheDocument();
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enterRole/i)).toHaveValue("Backend");
  });

  test("UTC02 [B] Closed modal => Returns null", () => {
    const { container } = render(
      <AssignRoleModal isOpen={false} onClose={jest.fn()} onAssign={jest.fn()} t={(k) => k} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("UTC03 [N] Change role and submit => Calls onAssign with memberId and role", async () => {
    const { onAssign, onClose } = renderModal();
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText(/enterRole/i);
    await user.clear(input);
    await user.type(input, "Frontend");
    await user.click(screen.getByRole("button", { name: /save/i }));
    expect(onAssign).toHaveBeenCalledWith("m1", "Frontend");
    expect(onClose).not.toHaveBeenCalled();
  });

  test("UTC04 [B] Empty role => Submit blocked and onAssign not called", async () => {
    const { onAssign } = renderModal();
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText(/enterRole/i);
    await user.clear(input);
    const saveBtn = screen.getByRole("button", { name: /save/i });
    expect(saveBtn).toBeDisabled();
    await user.click(saveBtn);
    expect(onAssign).not.toHaveBeenCalled();
  });

  test("UTC05 [A] Missing member id => Does not call onAssign", async () => {
    const { onAssign } = renderModal({
      member: { name: "NoId", role: "" },
    });
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/enterRole/i), "Tester");
    await user.click(screen.getByRole("button", { name: /save/i }));
    expect(onAssign).not.toHaveBeenCalled();
  });

  test("UTC06 [B] Backdrop click closes when not submitting => onClose called", () => {
    const { onClose } = renderModal();
    fireEvent.mouseDown(screen.getByRole("dialog"));
    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("UTC07 [A] Backdrop ignored when submitting => onClose not called", () => {
    const { onClose } = renderModal({ submitting: true });
    fireEvent.mouseDown(screen.getByRole("dialog"));
    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "AssignRoleModal",
  totalTC: 7,
  breakdown: { N: 2, B: 3, A: 2 },
  notes:
    "Covered open/closed render, submit success with id, empty role blocking, missing member id guard, backdrop close behavior with/without submitting.",
};
