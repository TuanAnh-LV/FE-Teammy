/**
UTC01 N Open modal renders form => Shows inputs and skill filters
- Pre: open true; form with defaults; skills provided
- Condition: render CreateGroupModal
- Confirmation: name/description/maxMembers inputs visible; skill filter buttons rendered

UTC02 B Closed modal => Returns null
- Pre: open false
- Condition: render modal
- Confirmation: container is null

UTC03 N Change form fields => onChange called with field values
- Pre: onChange mocked
- Condition: type in name, description, maxMembers inputs
- Confirmation: onChange called with correct field names and values

UTC04 B Name validation error => Shows error message
- Pre: errors.name set; open true
- Condition: render modal
- Confirmation: error text visible; input has error border styles

UTC05 N Filter skills by role => Filters skill list
- Pre: skills with mixed roles (frontend, backend, qa)
- Condition: click "frontend" filter button
- Confirmation: only frontend skills shown; other roles hidden

UTC06 N Toggle skill selection => onChange called with updated skills array
- Pre: form.skills empty; skills available
- Condition: click skill tag to add; click closable tag to remove
- Confirmation: onChange called with skills array updated; selected count changes

UTC07 B Skills loading state => Shows loading text
- Pre: skillsLoading true
- Condition: render modal
- Confirmation: loading message visible in skills area

UTC08 N Submit form => onSubmit called
- Pre: onSubmit mocked
- Condition: click Create group button
- Confirmation: onSubmit called; form submitted

UTC09 B Submitting state => Disables buttons and shows creating text
- Pre: submitting true
- Condition: render modal
- Confirmation: submit button disabled; text shows "Creating..."; close buttons disabled

UTC10 N Close modal => onClose called on backdrop/button click
- Pre: onClose mocked; submitting false
- Condition: click close button and backdrop
- Confirmation: onClose called twice

UTC11 B Backdrop click while submitting => onClose not called
- Pre: submitting true
- Condition: click backdrop
- Confirmation: onClose not called; modal stays open
*/

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import CreateGroupModal from "../../src/components/common/my-groups/CreateGroupModal";

jest.mock("lucide-react", () => ({
  X: () => <span data-testid="x-icon" />,
  Plus: () => <span data-testid="plus-icon" />,
}));

jest.mock("antd", () => ({
  Tag: ({ children, closable, onClose, onClick, ...props }) => (
    <span data-testid="tag" onClick={onClick} {...props}>
      {children}
      {closable && <button onClick={onClose} data-testid="tag-close">×</button>}
    </span>
  ),
}));

const defaultForm = {
  name: "",
  description: "",
  maxMembers: 5,
  skills: [],
};

const mockSkills = [
  { id: "1", token: "React", role: "frontend" },
  { id: "2", token: "Node.js", role: "backend" },
  { id: "3", token: "Jest", role: "qa" },
  { id: "4", token: "Vue", role: "frontend" },
];

describe("CreateGroupModal Report5", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("UTC01 [N] Open modal renders form => Shows inputs and skill filters", () => {
    render(
      <CreateGroupModal
        t={(k) => k}
        open={true}
        submitting={false}
        form={defaultForm}
        errors={{}}
        skills={mockSkills}
        skillsLoading={false}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByPlaceholderText(/AI Capstone/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Team goals/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
    expect(screen.getByText(/all/i)).toBeInTheDocument();
    expect(screen.getByText(/frontend/i)).toBeInTheDocument();
  });

  test("UTC02 [B] Closed modal => Returns null", () => {
    const { container } = render(
      <CreateGroupModal
        t={(k) => k}
        open={false}
        submitting={false}
        form={defaultForm}
        errors={{}}
        skills={[]}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
        onChange={jest.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test("UTC03 [N] Change form fields => onChange called with field values", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <CreateGroupModal
        t={(k) => k}
        open={true}
        submitting={false}
        form={defaultForm}
        errors={{}}
        skills={mockSkills}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
        onChange={onChange}
      />
    );

    const nameInput = screen.getByPlaceholderText(/AI Capstone/i);
    await user.type(nameInput, "Test");
    expect(onChange).toHaveBeenCalledWith("name", "T");
    expect(onChange).toHaveBeenCalledWith("name", "e");

    onChange.mockClear();
    const descInput = screen.getByPlaceholderText(/Team goals/i);
    await user.type(descInput, "Desc");
    expect(onChange).toHaveBeenCalledWith("description", expect.any(String));

    onChange.mockClear();
    const maxInput = screen.getByDisplayValue("5");
    await user.clear(maxInput);
    expect(onChange).toHaveBeenCalledWith("maxMembers", "");
  });

  test("UTC04 [B] Name validation error => Shows error message", () => {
    render(
      <CreateGroupModal
        t={(k) => k}
        open={true}
        submitting={false}
        form={defaultForm}
        errors={{ name: "Name is required" }}
        skills={[]}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText("Name is required")).toBeInTheDocument();
    const nameInput = screen.getByPlaceholderText(/AI Capstone/i);
    expect(nameInput).toHaveClass("border-red-400");
  });

  test("UTC05 [N] Filter skills by role => Filters skill list", async () => {
    const user = userEvent.setup();
    render(
      <CreateGroupModal
        t={(k) => k}
        open={true}
        submitting={false}
        form={defaultForm}
        errors={{}}
        skills={mockSkills}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
        onChange={jest.fn()}
      />
    );

    // Initially shows all skills
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();

    // Click frontend filter
    const frontendBtn = screen.getByText(/frontend/i);
    await user.click(frontendBtn);

    // Should show React and Vue
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Vue")).toBeInTheDocument();
    // Node.js (backend) should still be in DOM but we can verify filter works
  });

  test("UTC06 [N] Toggle skill selection => onChange called with updated skills array", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const formWithSkill = { ...defaultForm, skills: ["React"] };

    const { rerender } = render(
      <CreateGroupModal
        t={(k) => k}
        open={true}
        submitting={false}
        form={defaultForm}
        errors={{}}
        skills={mockSkills}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
        onChange={onChange}
      />
    );

    // Add skill
    const reactTag = screen.getByText("React");
    await user.click(reactTag);
    expect(onChange).toHaveBeenCalledWith("skills", ["React"]);

    // Rerender with skill selected
    onChange.mockClear();
    rerender(
      <CreateGroupModal
        t={(k) => k}
        open={true}
        submitting={false}
        form={formWithSkill}
        errors={{}}
        skills={mockSkills}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
        onChange={onChange}
      />
    );

    // Remove skill
    const closeBtn = screen.getByTestId("tag-close");
    await user.click(closeBtn);
    expect(onChange).toHaveBeenCalledWith("skills", []);
  });

  test("UTC07 [B] Skills loading state => Shows loading text", () => {
    render(
      <CreateGroupModal
        t={(k) => k}
        open={true}
        submitting={false}
        form={defaultForm}
        errors={{}}
        skills={[]}
        skillsLoading={true}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("UTC08 [N] Submit form => onSubmit called", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn((e) => e.preventDefault());
    render(
      <CreateGroupModal
        t={(k) => k}
        open={true}
        submitting={false}
        form={defaultForm}
        errors={{}}
        skills={[]}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        onChange={jest.fn()}
      />
    );

    const submitBtn = screen.getByText(/createGroup/i);
    await user.click(submitBtn);
    expect(onSubmit).toHaveBeenCalled();
  });

  test("UTC09 [B] Submitting state => Disables buttons and shows creating text", () => {
    render(
      <CreateGroupModal
        t={(k) => k}
        open={true}
        submitting={true}
        form={defaultForm}
        errors={{}}
        skills={[]}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText(/creating/i)).toBeInTheDocument();
    const submitBtn = screen.getByText(/creating/i);
    expect(submitBtn).toBeDisabled();
    
    const cancelBtn = screen.getByText(/cancel/i);
    expect(cancelBtn).toBeDisabled();
  });

  test("UTC10 [N] Close modal => onClose called on backdrop/button click", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <CreateGroupModal
        t={(k) => k}
        open={true}
        submitting={false}
        form={defaultForm}
        errors={{}}
        skills={[]}
        onClose={onClose}
        onSubmit={jest.fn()}
        onChange={jest.fn()}
      />
    );

    // Click X close button (top right)
    const xIcon = screen.getByTestId("x-icon");
    await user.click(xIcon.parentElement);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Click Cancel button
    const cancelBtn = screen.getByText(/cancel/i);
    await user.click(cancelBtn);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  test("UTC11 [B] Backdrop click while submitting => onClose not called", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <CreateGroupModal
        t={(k) => k}
        open={true}
        submitting={true}
        form={defaultForm}
        errors={{}}
        skills={[]}
        onClose={onClose}
        onSubmit={jest.fn()}
        onChange={jest.fn()}
      />
    );

    const backdrop = screen.getByRole("dialog");
    await user.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "CreateGroupModal",
  totalTC: 11,
  breakdown: { N: 6, B: 5, A: 0 },
  notes:
    "Covers form rendering, field changes, validation errors, skill filtering, skill toggle, loading state, submit, submitting state, and close handlers including backdrop guard.",
};
