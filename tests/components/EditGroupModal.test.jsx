/**
UTC01 N Open modal renders fields => Shows name, description, maxMembers populated
- Pre: open true with form values
- Condition: render component
- Confirmation: inputs display provided form values

UTC02 B Closed modal => Returns null
- Pre: open false
- Condition: render
- Confirmation: container empty

UTC03 N Change handlers => onChange called for name/maxMembers/description
- Pre: onChange mock
- Condition: type into fields
- Confirmation: onChange called with proper keys and values

UTC04 B Skill filter => Filters by role and shows loading/empty states
- Pre: skills with different roles
- Condition: click filter buttons
- Confirmation: only matching tokens rendered; loading text when skillsLoading true

UTC05 N Toggle skill add/remove => onChange toggles selection
- Pre: form.skills empty
- Condition: click available skill then remove via tag close
- Confirmation: onChange called with updated arrays

UTC06 N Submit and close buttons => onSubmit called; onClose invoked on click/backdrop
- Pre: handlers provided
- Condition: click save button; click cancel/backdrop
- Confirmation: onSubmit fired; onClose called twice (cancel and backdrop)
*/

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import EditGroupModal from "../../src/components/common/my-group/EditGroupModal";

jest.mock("antd", () => ({
  Tag: ({ children, color = "default", closable, onClose, onClick, className }) => (
    <div data-color={color} className={className} onClick={onClick}>
      {children}
      {closable && <button aria-label="close" onClick={onClose}>x</button>}
    </div>
  ),
}));

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

const baseProps = {
  open: true,
  submitting: false,
  form: { name: "Group A", description: "Desc", maxMembers: 5, skills: [] },
  errors: {},
  memberCount: 3,
  skills: [
    { id: "s1", token: "react", role: "frontend" },
    { id: "s2", token: "node", role: "backend" },
  ],
  onClose: jest.fn(),
  onSubmit: jest.fn((e) => e.preventDefault()),
  onChange: jest.fn(),
  t: (k) => k,
};

const renderModal = (props = {}) => render(<EditGroupModal {...baseProps} {...props} />);

describe("EditGroupModal Report5", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("UTC01 [N] Open modal renders fields => Shows name, description, maxMembers populated", () => {
    renderModal();
    expect(screen.getByDisplayValue("Group A")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Desc")).toBeInTheDocument();
    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
  });

  test("UTC02 [B] Closed modal => Returns null", () => {
    const { container } = renderModal({ open: false });
    expect(container.firstChild).toBeNull();
  });

  test("UTC03 [N] Change handlers => onChange called for name/maxMembers/description", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.type(screen.getByDisplayValue("Group A"), "X");
    fireEvent.change(screen.getByDisplayValue("Desc"), { target: { value: "Desc new" } });
    await user.type(screen.getByDisplayValue("5"), "0");
    expect(baseProps.onChange).toHaveBeenCalledWith("name", "Group AX");
    const descCalls = baseProps.onChange.mock.calls.filter(([key]) => key === "description");
    expect(descCalls.pop()?.[1]).toContain("Desc");
    expect(baseProps.onChange).toHaveBeenCalledWith("maxMembers", "50");
  });

  test("UTC04 [B] Skill filter => Filters by role and shows loading/empty states", () => {
    const { rerender } = renderModal();
    fireEvent.click(screen.getByText(/frontend/i));
    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.queryByText("node")).toBeNull();
    rerender(<EditGroupModal {...baseProps} skills={[]} skillsLoading />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("UTC05 [N] Toggle skill add/remove => onChange toggles selection", () => {
    renderModal({ form: { ...baseProps.form, skills: [] } });
    const selectable = screen.getAllByText("react").find((el) => el.getAttribute("data-color") === "blue");
    fireEvent.click(selectable);
    expect(baseProps.onChange).toHaveBeenCalledWith("skills", expect.arrayContaining(["react"]));
    renderModal({ form: { ...baseProps.form, skills: ["react"] } });
    const closableTag = screen.getAllByText("x")[0];
    fireEvent.click(closableTag);
    expect(baseProps.onChange).toHaveBeenCalledWith("skills", expect.not.arrayContaining(["react"]));
  });

  test("UTC06 [N] Submit and close buttons => onSubmit called; onClose invoked on click/backdrop", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByText(/saveChanges/i));
    expect(baseProps.onSubmit).toHaveBeenCalled();
    await user.click(screen.getByText(/cancel/i));
    fireEvent.click(screen.getByRole("dialog"));
    expect(baseProps.onClose).toHaveBeenCalledTimes(2);
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "EditGroupModal",
  totalTC: 6,
  breakdown: { N: 4, B: 2, A: 0 },
  notes:
    "Covers render/closed, input change handlers, skill filtering and toggle, submit and close interactions; antd Tag mocked.",
};
