/**
UTC01 N Loads backlog on mount => Renders list
- Pre: BacklogService.getBacklog resolves with one item
- Condition: render BacklogTab with groupId
- Confirmation: item title visible; getBacklog called with groupId

UTC02 B Empty backlog payload => Shows placeholder
- Pre: BacklogService.getBacklog resolves with empty array
- Condition: render BacklogTab
- Confirmation: placeholder visible; item not rendered; no error notification

UTC03 B readOnly hides actions => No action buttons rendered
- Pre: BacklogService.getBacklog resolves with item
- Condition: render with readOnly true
- Confirmation: “New Item”, edit, archive buttons absent

UTC04 A Fetch backlog error => Shows error notification
- Pre: BacklogService.getBacklog rejects
- Condition: render BacklogTab
- Confirmation: notification.error called; item not rendered

UTC05 N Create backlog success => Calls create with form values
- Pre: BacklogService.createBacklogItem resolves
- Condition: open modal, fill all fields, save
- Confirmation: create called with payload; update not called

UTC06 A Create without title => Validation error and no service call
- Pre: BacklogService mocks
- Condition: open modal and save without title
- Confirmation: notification.error called; create/update not called

UTC07 N Edit backlog success => Calls update with id
- Pre: BacklogService.getBacklog returns item
- Condition: click edit, change fields, save
- Confirmation: update called with id/payload; create not called

UTC08 N Promote backlog => Calls promote and triggers callback
- Pre: BacklogService.promoteBacklogItem resolves
- Condition: click Move to Sprint
- Confirmation: promote called with default column/taskStatus; onPromoteSuccess called; no error

UTC09 A Promote error => Shows error and no success callback
- Pre: BacklogService.promoteBacklogItem rejects
- Condition: click Move to Sprint
- Confirmation: notification.error called; onPromoteSuccess not called

UTC10 N Archive confirm => Calls archive after confirm
- Pre: Modal.confirm mocked to confirm
- Condition: click archive
- Confirmation: archive called with ids; notification.error not called
*/

import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import BacklogTab from "../../src/components/common/workspace/BacklogTab";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

jest.mock("antd", () => {
  const notification = { success: jest.fn(), error: jest.fn() };
  const modalConfirm = jest.fn();
  global.__backlogNotification = notification;
  global.__backlogModalConfirm = modalConfirm;
  const Modal = Object.assign(
    ({ open, children, onOk, onCancel, okText = "ok", cancelText = "cancel", title }) =>
      open ? (
        <div>
          <h4>{title}</h4>
          {children}
          <button onClick={onOk}>{okText}</button>
          <button onClick={onCancel}>{cancelText}</button>
        </div>
      ) : null,
    { confirm: (...args) => modalConfirm(...args) }
  );
  const Input = Object.assign(
    ({ value, onChange, ...rest }) => <input value={value} onChange={onChange} {...rest} />,
    {
      TextArea: ({ value, onChange, ...rest }) => (
        <textarea value={value} onChange={onChange} {...rest} />
      ),
    }
  );
  const Select = ({ value, onChange, options = [], allowClear: _allowClear, ...rest }) => (
    <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
  const DatePicker = ({ value, onChange, ...rest }) => (
    <input type="date" value={value || ""} onChange={(e) => onChange?.(e.target.value)} {...rest} />
  );
  const InputNumber = ({ value, onChange, ...rest }) => (
    <input type="number" value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} {...rest} />
  );
  const Dropdown = ({ menu, children }) => (
    <div>
      {children}
      <div>
        {menu?.items?.map((item) => (
          <button key={item.key} onClick={item.onClick}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
  return { Modal, Input, Select, DatePicker, InputNumber, Dropdown, notification };
});

jest.mock("../../src/services/backlog.service", () => {
  const api = {
    getBacklog: jest.fn(),
    createBacklogItem: jest.fn(),
    updateBacklogItem: jest.fn(),
    archiveBacklogItem: jest.fn(),
    promoteBacklogItem: jest.fn(),
  };
  return { BacklogService: api };
});

const columnMeta = {
  todo: { title: "To Do", columnId: "todo", position: 1 },
  done: { title: "Done", columnId: "done", position: 2, isDone: true },
};

const baseItems = [
  {
    id: "b1",
    title: "Item 1",
    description: "Desc",
    priority: "high",
    category: "feature",
    storyPoints: 3,
    dueDate: "2025-12-12",
    ownerUserId: "u1",
    status: "todo",
  },
];

beforeEach(() => {
  const { BacklogService } = require("../../src/services/backlog.service");
  Object.values(BacklogService).forEach((fn) => fn.mockClear());
  const notification = require("antd").notification;
  notification.success.mockClear();
  notification.error.mockClear();
});

const setup = async (props = {}, backlogResponse = { data: baseItems }) => {
  const { BacklogService } = require("../../src/services/backlog.service");
  BacklogService.getBacklog.mockResolvedValue(backlogResponse);
  const user = userEvent.setup();
  await act(async () => {
    render(
      <BacklogTab
        groupId="g1"
        columnMeta={columnMeta}
        groupMembers={[{ id: "u1", name: "Alice Wonderland" }]}
        {...props}
      />
    );
  });
  return {
    user,
    BacklogService,
    notification: global.__backlogNotification,
    modalConfirm: global.__backlogModalConfirm,
  };
};

test("UTC01 [N] Loads backlog on mount => Renders list", async () => {
  const { BacklogService } = await setup();
  expect(await screen.findByText("Item 1")).toBeInTheDocument();
  expect(BacklogService.getBacklog).toHaveBeenCalledWith("g1");
});

test("UTC02 [B] Empty backlog payload => Shows placeholder", async () => {
  const { notification } = await setup({}, { data: [] });
  expect(await screen.findByText(/backlogPlaceholder/i)).toBeInTheDocument();
  expect(screen.queryByText("Item 1")).toBeNull();
  expect(notification.error).not.toHaveBeenCalled();
});

test("UTC03 [B] readOnly hides actions => No action buttons", async () => {
  await setup({ readOnly: true });
  expect(screen.queryByText(/newItem/i)).toBeNull();
  expect(screen.queryByText(/edit/i)).toBeNull();
  expect(screen.queryByText(/archive/i)).toBeNull();
});

test("UTC04 [A] Fetch backlog error => Shows error notification", async () => {
  const { BacklogService, notification } = await setup({}, Promise.reject(new Error("fail")));
  await waitFor(() => expect(notification.error).toHaveBeenCalled());
  expect(screen.queryByText("Item 1")).toBeNull();
  expect(BacklogService.getBacklog).toHaveBeenCalledWith("g1");
});

test("UTC05 [N] Create backlog success => Calls create with payload", async () => {
  const { user, BacklogService } = await setup();
  await user.click(screen.getByText(/newItem/i));
  await user.type(screen.getByLabelText(/title/i), "New Item");
  await user.selectOptions(screen.getByLabelText(/priority/i), "medium");
  await user.selectOptions(screen.getByLabelText(/category/i), "feature");
  await user.type(screen.getByLabelText(/storyPoints/i), "5");
  await user.type(screen.getByLabelText(/dueDate/i), "2025-12-20");
  await user.selectOptions(screen.getByLabelText(/owner/i), "u1");
  await user.type(screen.getByLabelText(/description/i), "New description");
  await user.click(screen.getByText(/save/i));
  await waitFor(() => {
    expect(BacklogService.createBacklogItem).toHaveBeenCalledWith(
      "g1",
      expect.objectContaining({
        title: "New Item",
        category: "feature",
        ownerUserId: "u1",
        storyPoints: 5,
        description: "New description",
      })
    );
  });
  expect(BacklogService.updateBacklogItem).not.toHaveBeenCalled();
});

test("UTC06 [A] Create without title => Validation error no call", async () => {
  const { user, BacklogService, notification } = await setup();
  await user.click(screen.getByText(/newItem/i));
  await user.click(screen.getByText(/save/i));
  expect(notification.error).toHaveBeenCalled();
  expect(BacklogService.createBacklogItem).not.toHaveBeenCalled();
  expect(BacklogService.updateBacklogItem).not.toHaveBeenCalled();
});

test("UTC07 [N] Edit backlog success => Calls update with id", async () => {
  const { user, BacklogService } = await setup();
  await user.click(await screen.findByText(/edit/i));
  await user.clear(screen.getByDisplayValue("Item 1"));
  await user.type(screen.getByLabelText(/title/i), "Edited");
  await user.selectOptions(screen.getAllByRole("combobox")[0], "high");
  await user.selectOptions(screen.getAllByRole("combobox")[3], "done");
  await user.clear(screen.getByDisplayValue("Desc"));
  await user.type(screen.getByLabelText(/description/i), "Updated desc");
  await user.click(screen.getByText(/save/i));
  await waitFor(() => {
    expect(BacklogService.updateBacklogItem).toHaveBeenCalledWith(
      "g1",
      "b1",
      expect.objectContaining({ title: "Edited", status: "done", description: "Updated desc" })
    );
  });
  expect(BacklogService.createBacklogItem).not.toHaveBeenCalled();
});

test("UTC08 [N] Promote backlog => Calls promote and callback", async () => {
  const onPromoteSuccess = jest.fn();
  const { user, BacklogService, notification } = await setup({ onPromoteSuccess });
  await user.click(await screen.findByText(/moveToSprint/i));
  await waitFor(() => {
    expect(BacklogService.promoteBacklogItem).toHaveBeenCalledWith(
      "g1",
      "b1",
      expect.objectContaining({ columnId: "todo", taskStatus: "todo" })
    );
  });
  expect(onPromoteSuccess).toHaveBeenCalled();
  expect(notification.error).not.toHaveBeenCalled();
});

test("UTC09 [A] Promote error => Shows error and no callback", async () => {
  const onPromoteSuccess = jest.fn();
  const { user, BacklogService, notification } = await setup({ onPromoteSuccess });
  BacklogService.promoteBacklogItem.mockRejectedValueOnce(new Error("fail"));
  await user.click(await screen.findByText(/moveToSprint/i));
  await waitFor(() => expect(notification.error).toHaveBeenCalled());
  expect(onPromoteSuccess).not.toHaveBeenCalled();
});

test("UTC10 [N] Archive confirm => Calls archive", async () => {
  const { user, BacklogService, modalConfirm, notification } = await setup();
  modalConfirm.mockImplementation(({ onOk }) => onOk && onOk());
  await user.click(await screen.findByText(/archive/i));
  await waitFor(() => expect(BacklogService.archiveBacklogItem).toHaveBeenCalledWith("g1", "b1"));
  expect(notification.error).not.toHaveBeenCalled();
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "BacklogTab",
  totalTC: 10,
  breakdown: { N: 6, B: 2, A: 2 },
  notes:
    "Covers load, empty/readOnly boundaries, fetch/create/promote error paths, and success flows for create/edit/promote/archive; mocks translation/antd/services deterministically.",
};
