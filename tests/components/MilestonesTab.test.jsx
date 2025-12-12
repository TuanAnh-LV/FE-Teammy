import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { jest } from "@jest/globals";
import MilestonesTab from "../../src/components/common/workspace/MilestonesTab";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

jest.mock("antd", () => {
  const notification = {
    success: jest.fn(),
    error: jest.fn(),
  };
  const modalConfirm = jest.fn();
  global.__notificationMock = notification;
  global.__modalConfirmMock = modalConfirm;
  return {
    Button: ({ children, onClick, danger, ...rest }) => (
      <button onClick={onClick} {...rest}>
        {children}
      </button>
    ),
    Input: Object.assign(
      ({ value, onChange, ...rest }) => (
        <input value={value} onChange={onChange} {...rest} />
      ),
      {
        TextArea: ({ value, onChange, ...rest }) => (
          <textarea value={value} onChange={onChange} {...rest} />
        ),
      }
    ),
    DatePicker: ({ value, onChange, ...rest }) => (
      <input
        data-testid="datepicker"
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        {...rest}
      />
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
          {menu?.items?.map((item) => {
            const text =
              typeof item?.label === "string"
                ? item.label
                : typeof item?.key === "string"
                ? item.key
                : "action";
            return (
              <button key={item?.key} onClick={item?.onClick}>
                {text}
              </button>
            );
          })}
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
      {
        confirm: (...args) => modalConfirm(...args),
      }
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
    getBacklog: jest.fn(() =>
      Promise.resolve({ data: [{ id: "b1", title: "BL1", status: "todo" }] })
    ),
  };
  global.__backlogServiceMock = api;
  return { BacklogService: api };
});

describe("MilestonesTab", () => {
  const notificationMock = () => global.__notificationMock;
  const modalConfirmMock = () => global.__modalConfirmMock;
  const services = () => ({
    MilestoneService: global.__milestoneServiceMock,
    BacklogService: global.__backlogServiceMock,
  });
  const renderTab = async (props = {}) => {
    render(<MilestonesTab groupId="g1" {...props} />);
    await screen.findByText("MS1");
  };

  beforeEach(() => {
    jest.clearAllMocks();
    notificationMock().success.mockClear();
    notificationMock().error.mockClear();
  });

  test("loads and displays milestones list", async () => {
    const { MilestoneService } = services();
    await renderTab();
    expect(screen.getByText("Desc")).toBeInTheDocument();
    expect(MilestoneService.list).toHaveBeenCalledWith("g1");
  });

  test("open create modal and validate empty title error", async () => {
    await renderTab();
    fireEvent.click(screen.getByText(/newMilestone/i));
    fireEvent.click(screen.getByText(/save/i));
    expect(notificationMock().error).toHaveBeenCalled();
  });

  test("create milestone success", async () => {
    const { MilestoneService } = services();
    await renderTab();
    fireEvent.click(screen.getByText(/newMilestone/i));
    fireEvent.change(screen.getByPlaceholderText(/enterTitle/i), {
      target: { value: "New MS" },
    });
    fireEvent.click(screen.getByText(/save/i));
    await waitFor(() => {
      expect(MilestoneService.create).toHaveBeenCalledWith("g1", {
        name: "New MS",
        description: "",
        targetDate: null,
      });
    });
  });

  test("edit milestone and update", async () => {
    const { MilestoneService } = services();
    await renderTab();
    fireEvent.click(screen.getByText(/edit/i));
    fireEvent.change(screen.getByDisplayValue("MS1"), {
      target: { value: "Edited" },
    });
    fireEvent.click(screen.getByText(/save/i));
    await waitFor(() => {
      expect(MilestoneService.update).toHaveBeenCalled();
    });
  });

  test("delete milestone confirms and calls remove", async () => {
    const { MilestoneService } = services();
    modalConfirmMock().mockImplementation(({ onOk }) => onOk && onOk());
    await renderTab();
    fireEvent.click(screen.getByText(/delete/i));
    await waitFor(() => {
      expect(MilestoneService.remove).toHaveBeenCalledWith("g1", "m1");
    });
  });

  test("assign backlog items flows", async () => {
    const { MilestoneService } = services();
    await renderTab();
    fireEvent.click(screen.getByText(/assign/i));
    const select = screen.getByTestId("select");
    fireEvent.change(select, { target: { value: ["b1"] } });
    fireEvent.click(screen.getAllByText(/save/i)[0]);
    await waitFor(() => {
      expect(MilestoneService.assignBacklogItems).toHaveBeenCalledWith("g1", "m1", ["b1"]);
    });
  });

  test("remove backlog item triggers confirm and API", async () => {
    const { MilestoneService } = services();
    modalConfirmMock().mockImplementationOnce(({ onOk }) => onOk && onOk());
    await renderTab();
    await screen.findByText("Backlog A");
    fireEvent.click(screen.getByText(/remove/i));
    await waitFor(() => {
      expect(MilestoneService.removeBacklogItem).toHaveBeenCalledWith("g1", "m1", "b1");
    });
  });

  test("readOnly hides create button", async () => {
    await renderTab({ readOnly: true });
    expect(screen.queryByText(/newMilestone/i)).toBeNull();
  });

  test("assign validation error when no backlog selected", async () => {
    await renderTab();
    fireEvent.click(screen.getByText(/assign/i));
    fireEvent.click(screen.getAllByText(/save/i)[0]);
    expect(notificationMock().error).toHaveBeenCalled();
  });

  test("create milestone error path shows notification", async () => {
    const { MilestoneService } = services();
    MilestoneService.create.mockRejectedValueOnce(new Error("fail"));
    await renderTab();
    fireEvent.click(screen.getByText(/newMilestone/i));
    fireEvent.change(screen.getByPlaceholderText(/enterTitle/i), {
      target: { value: "New MS" },
    });
    fireEvent.click(screen.getByText(/save/i));
    await waitFor(() => {
      expect(notificationMock().error).toHaveBeenCalled();
    });
  });

  test("delete milestone error path shows notification", async () => {
    const { MilestoneService } = services();
    MilestoneService.remove.mockRejectedValueOnce(new Error("fail"));
    modalConfirmMock().mockImplementation(({ onOk }) => onOk && onOk());
    render(<MilestonesTab groupId="g1" />);
    await screen.findByText("MS1");
    fireEvent.click(screen.getByText(/delete/i));
    await waitFor(() => {
      expect(notificationMock().error).toHaveBeenCalled();
    });
  });
});
