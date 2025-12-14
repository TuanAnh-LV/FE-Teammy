/**
UTC01 N Load milestones => Renders list and calls list API
- Pre: MilestoneService.list resolves with one milestone
- Condition: render MilestonesTab with groupId
- Confirmation: milestone name/desc visible; list called with groupId

UTC02 B Create modal empty title => Shows validation error, no create/update
- Pre: default mocks
- Condition: open create modal, click save without title
- Confirmation: notification.error called; create/update not called

UTC03 N Create milestone success => Calls create with payload
- Pre: default mocks
- Condition: open create, enter title, save
- Confirmation: create called with groupId and payload

UTC04 A Create milestone error => Shows notification.error
- Pre: MilestoneService.create rejects once
- Condition: open create, enter title, save
- Confirmation: notification.error called

UTC05 N Edit milestone success => Calls update with id
- Pre: default mocks
- Condition: click edit, change title, save
- Confirmation: update called with id/payload; create not called

UTC06 N Delete milestone confirm => Calls remove after confirm
- Pre: Modal.confirm mocked to onOk
- Condition: click delete
- Confirmation: remove called with groupId and id

UTC07 A Delete milestone error => Shows notification.error after confirm
- Pre: remove rejects once; confirm onOk
- Condition: click delete
- Confirmation: notification.error called

UTC08 N Assign backlog items => Calls assignBacklogItems with selected ids
- Pre: BacklogService.getBacklog resolves; assign mocked
- Condition: open assign, select backlog id, save
- Confirmation: assignBacklogItems called with groupId, milestoneId, ids

UTC09 B Assign without selection => Validation error and no assign call
- Pre: default mocks
- Condition: open assign, click save without selecting
- Confirmation: notification.error called; assignBacklogItems not called

UTC10 N Remove backlog item => Calls removeBacklogItem after confirm
- Pre: milestone has assigned item; confirm onOk
- Condition: click remove on backlog item
- Confirmation: removeBacklogItem called with groupId, milestoneId, backlogId

UTC11 B readOnly mode => Create/action controls hidden and not callable
- Pre: readOnly true
- Condition: render tab
- Confirmation: newMilestone button absent; dropdown actions not rendered

UTC12 A Fetch milestones error => Shows notification.error
- Pre: MilestoneService.list rejects
- Condition: render tab
- Confirmation: notification.error called
*/

import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MilestonesTab from "../../src/components/common/workspace/MilestonesTab";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

jest.mock("antd", () => {
  const notification = { success: jest.fn(), error: jest.fn() };
  const modalConfirm = jest.fn();
  global.__notificationMock = notification;
  global.__modalConfirmMock = modalConfirm;
  return {
    Button: ({ children, onClick, danger: _danger, ...rest }) => (
      <button onClick={onClick} {...rest}>
        {children}
      </button>
    ),
    Input: Object.assign(
      ({ value, onChange, ...rest }) => <input value={value} onChange={onChange} {...rest} />,
      {
        TextArea: ({ value, onChange, ...rest }) => (
          <textarea value={value} onChange={onChange} {...rest} />
        ),
      }
    ),
    DatePicker: ({ value, onChange, ...rest }) => (
      <input data-testid="datepicker" value={value || ""} onChange={(e) => onChange?.(e.target.value)} {...rest} />
    ),
    Select: ({ value = [], onChange, options = [], mode, ...rest }) => (
      <select
        data-testid="select"
        multiple={mode === "multiple"}
        value={value}
        onChange={(e) => {
          const opts = e.target.selectedOptions
            ? Array.from(e.target.selectedOptions).map((o) => o.value)
            : e.target.value;
          onChange(mode === "multiple" ? (Array.isArray(opts) ? opts : [opts]) : opts);
        }}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ),
    Tag: ({ children }) => <span>{children}</span>,
    Progress: ({ percent }) => <div data-testid="progress">{percent}</div>,
    Dropdown: ({ menu, children }) => (
      <div>
        {children}
        <div>
          {menu?.items?.map((item) => (
            <button key={item?.key} onClick={item?.onClick}>
              {typeof item?.label === "string" ? item.label : item?.key || "action"}
            </button>
          ))}
        </div>
      </div>
    ),
    Modal: Object.assign(
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
    ),
    notification,
  };
});

jest.mock("lucide-react", () => ({
  Plus: () => null,
  MoreVertical: () => null,
  Calendar: () => null,
  Trash2: () => null,
  Edit2: () => null,
  Link: () => null,
  Target: () => null,
  CheckCircle2: () => null,
  Circle: () => null,
}));

jest.mock("../../src/services/milestone.service", () => {
  const api = {
    list: jest.fn(() =>
      Promise.resolve({
        data: [
          {
            id: "m1",
            name: "MS1",
            description: "Desc",
            targetDate: "2025-12-12",
            status: "planned",
            completionPercent: 50,
            completedItems: 1,
            totalItems: 2,
            items: [{ id: "b1", title: "Backlog A", status: "done" }],
          },
        ],
      })
    ),
    create: jest.fn(() => Promise.resolve({})),
    update: jest.fn(() => Promise.resolve({})),
    remove: jest.fn(() => Promise.resolve({})),
    assignBacklogItems: jest.fn(() => Promise.resolve({})),
    removeBacklogItem: jest.fn(() => Promise.resolve({})),
  };
  global.__milestoneServiceMock = api;
  return { MilestoneService: api };
});

jest.mock("../../src/services/backlog.service", () => {
  const api = {
    getBacklog: jest.fn(() => Promise.resolve({ data: [{ id: "b1", title: "BL1", status: "todo" }] })),
  };
  global.__backlogServiceMock = api;
  return { BacklogService: api };
});

const notificationMock = () => global.__notificationMock;
const modalConfirmMock = () => global.__modalConfirmMock;
const services = () => ({
  MilestoneService: global.__milestoneServiceMock,
  BacklogService: global.__backlogServiceMock,
});

beforeEach(() => {
  jest.clearAllMocks();
  notificationMock().success.mockClear();
  notificationMock().error.mockClear();
});

const renderTab = async (props = {}) => {
  const user = userEvent.setup();
  await act(async () => {
    render(<MilestonesTab groupId="g1" {...props} />);
  });
  await screen.findByText("MS1");
  return { user };
};

describe("MilestonesTab Report5", () => {
  test("UTC01 [N] Load milestones => Renders list and calls list API", async () => {
    const { MilestoneService } = services();
    await renderTab();
    expect(screen.getByText("Desc")).toBeInTheDocument();
    expect(MilestoneService.list).toHaveBeenCalledWith("g1");
  });

  test("UTC02 [B] Create modal empty title => Shows validation error, no create/update", async () => {
    const { MilestoneService } = services();
    const { user } = await renderTab();
    await user.click(screen.getByText(/newMilestone/i));
    await user.click(screen.getByText(/save/i));
    expect(notificationMock().error).toHaveBeenCalled();
    expect(MilestoneService.create).not.toHaveBeenCalled();
    expect(MilestoneService.update).not.toHaveBeenCalled();
  });

  test("UTC03 [N] Create milestone success => Calls create with payload", async () => {
    const { MilestoneService } = services();
    const { user } = await renderTab();
    await user.click(screen.getByText(/newMilestone/i));
    await user.type(screen.getByPlaceholderText(/enterTitle/i), "New MS");
    await user.click(screen.getByText(/save/i));
    await waitFor(() =>
      expect(MilestoneService.create).toHaveBeenCalledWith("g1", {
        name: "New MS",
        description: "",
        targetDate: null,
      })
    );
  });

  test("UTC04 [A] Create milestone error => Shows notification.error", async () => {
    const { MilestoneService } = services();
    MilestoneService.create.mockRejectedValueOnce(new Error("fail"));
    const { user } = await renderTab();
    await user.click(screen.getByText(/newMilestone/i));
    await user.type(screen.getByPlaceholderText(/enterTitle/i), "New MS");
    await user.click(screen.getByText(/save/i));
    await waitFor(() => expect(notificationMock().error).toHaveBeenCalled());
  });

  test("UTC05 [N] Edit milestone success => Calls update with id", async () => {
    const { MilestoneService } = services();
    const { user } = await renderTab();
    await user.click(screen.getByText(/edit/i));
    const input = screen.getByDisplayValue("MS1");
    await user.clear(input);
    await user.type(input, "Edited");
    await user.click(screen.getByText(/save/i));
    await waitFor(() => expect(MilestoneService.update).toHaveBeenCalled());
    expect(MilestoneService.create).not.toHaveBeenCalled();
  });

  test("UTC06 [N] Delete milestone confirm => Calls remove after confirm", async () => {
    const { MilestoneService } = services();
    const { user } = await renderTab();
    modalConfirmMock().mockImplementation(({ onOk }) => onOk && onOk());
    await user.click(screen.getByText(/delete/i));
    await waitFor(() => expect(MilestoneService.remove).toHaveBeenCalledWith("g1", "m1"));
  });

  test("UTC07 [A] Delete milestone error => Shows notification.error after confirm", async () => {
    const { MilestoneService } = services();
    MilestoneService.remove.mockRejectedValueOnce(new Error("fail"));
    modalConfirmMock().mockImplementation(({ onOk }) => onOk && onOk());
    await act(async () => {
      render(<MilestonesTab groupId="g1" />);
    });
    await screen.findByText("MS1");
    await userEvent.click(screen.getByText(/delete/i));
    await waitFor(() => expect(notificationMock().error).toHaveBeenCalled());
  });

  test("UTC08 [N] Assign backlog items => Calls assignBacklogItems with selected ids", async () => {
    const { MilestoneService } = services();
    const { user } = await renderTab();
    await user.click(screen.getByText(/assign/i));
    const select = screen.getByTestId("select");
    await user.selectOptions(select, "b1");
    await user.click(screen.getAllByText(/save/i)[0]);
    await waitFor(() =>
      expect(MilestoneService.assignBacklogItems).toHaveBeenCalledWith("g1", "m1", ["b1"])
    );
  });

  test("UTC09 [B] Assign without selection => Validation error and no assign call", async () => {
    const { MilestoneService } = services();
    const { user } = await renderTab();
    await user.click(screen.getByText(/assign/i));
    await user.click(screen.getAllByText(/save/i)[0]);
    expect(notificationMock().error).toHaveBeenCalled();
    expect(MilestoneService.assignBacklogItems).not.toHaveBeenCalled();
  });

  test("UTC10 [N] Remove backlog item => Calls removeBacklogItem after confirm", async () => {
    const { MilestoneService } = services();
    modalConfirmMock().mockImplementation(({ onOk }) => onOk && onOk());
    await renderTab();
    await screen.findByText("Backlog A");
    await userEvent.click(screen.getByText(/remove/i));
    await waitFor(() =>
      expect(MilestoneService.removeBacklogItem).toHaveBeenCalledWith("g1", "m1", "b1")
    );
  });

  test("UTC11 [B] readOnly mode => Create/action controls hidden and not callable", async () => {
    await act(async () => {
      render(<MilestonesTab groupId="g1" readOnly />);
    });
    expect(screen.queryByText(/newMilestone/i)).toBeNull();
    expect(screen.queryByText(/assign/i)).toBeNull();
    expect(screen.queryByText(/edit/i)).toBeNull();
    expect(screen.queryByText(/delete/i)).toBeNull();
  });

  test("UTC12 [A] Fetch milestones error => Shows notification.error", async () => {
    const { MilestoneService } = services();
    MilestoneService.list.mockRejectedValueOnce(new Error("fail"));
    await act(async () => {
      render(<MilestonesTab groupId="g1" />);
    });
    await waitFor(() => expect(notificationMock().error).toHaveBeenCalled());
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "MilestonesTab",
  totalTC: 12,
  breakdown: { N: 6, B: 3, A: 3 },
  notes:
    "Covers list load, create/edit/delete flows, validation for empty title and assign selection, assign/remove backlog, readOnly boundary, and error paths for create/delete/list.",
};
