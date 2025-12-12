import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { jest } from "@jest/globals";
import BacklogTab from "../../src/components/common/workspace/BacklogTab";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

jest.mock("antd", () => {
  const notification = {
    success: jest.fn(),
    error: jest.fn(),
  };
  const modalConfirm = jest.fn();
  global.__backlogNotification = notification;
  global.__backlogModalConfirm = modalConfirm;
  return {
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
    Select: ({ value, onChange, options = [], allowClear: _allowClear, ...rest }) => (
      <select
        data-testid="select"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ),
    DatePicker: ({ value, onChange, ...rest }) => (
      <input
        type="date"
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        {...rest}
      />
    ),
    InputNumber: ({ value, onChange, ...rest }) => (
      <input
        type="number"
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        {...rest}
      />
    ),
    Dropdown: ({ menu, children }) => (
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
    ),
    notification,
  };
});

const backlogItems = [
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

jest.mock("../../src/services/backlog.service", () => {
  const api = {
    getBacklog: jest.fn(() => Promise.resolve({ data: backlogItems })),
    createBacklogItem: jest.fn(() => Promise.resolve({})),
    updateBacklogItem: jest.fn(() => Promise.resolve({})),
    archiveBacklogItem: jest.fn(() => Promise.resolve({})),
    promoteBacklogItem: jest.fn(() => Promise.resolve({})),
  };
  global.__backlogServiceMock = api;
  return { BacklogService: api };
});

const columnMeta = {
  todo: { title: "To Do", columnId: "todo", position: 1 },
  done: { title: "Done", columnId: "done", position: 2, isDone: true },
};

describe("BacklogTab", () => {
  const notification = () => global.__backlogNotification;
  const modalConfirm = () => global.__backlogModalConfirm;

  beforeEach(() => {
    jest.clearAllMocks();
    notification().success.mockClear();
    notification().error.mockClear();
    backlogItems.length = 1;
  });

  const renderTab = async (props = {}, backlogResponse = { data: backlogItems }, waitForItem = true) => {
    const { BacklogService } = require("../../src/services/backlog.service");
    BacklogService.getBacklog.mockResolvedValue(backlogResponse);
    render(
      <BacklogTab
        groupId="g1"
        columnMeta={columnMeta}
        groupMembers={[{ id: "u1", name: "Alice" }]}
        {...props}
      />
    );
    if (waitForItem) {
      await screen.findByText("Item 1");
    }
  };

  test("loads backlog list", async () => {
    const { BacklogService } = require("../../src/services/backlog.service");
    await renderTab();
    expect(BacklogService.getBacklog).toHaveBeenCalledWith("g1");
    expect(screen.getByText(/productBacklog/i)).toBeInTheDocument();
  });

  test("fetch backlog supports payload.items format", async () => {
    await renderTab({}, { items: backlogItems });
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });

  test("create validation error when title empty", async () => {
    await renderTab();
    fireEvent.click(screen.getByText(/newItem/i));
    fireEvent.click(screen.getByText(/save/i));
    expect(notification().error).toHaveBeenCalled();
  });

  test("create backlog item success", async () => {
    const { BacklogService } = require("../../src/services/backlog.service");
    await renderTab();
    fireEvent.click(screen.getByText(/newItem/i));
    fireEvent.change(screen.getByPlaceholderText(/enterTitle/i), {
      target: { value: "New Item" },
    });
    fireEvent.click(screen.getByText(/save/i));
    await waitFor(() => {
      expect(BacklogService.createBacklogItem).toHaveBeenCalledWith(
        "g1",
        expect.objectContaining({ title: "New Item" })
      );
    });
  });

  test("create backlog item error path shows notification", async () => {
    const { BacklogService } = require("../../src/services/backlog.service");
    BacklogService.createBacklogItem.mockRejectedValueOnce(new Error("fail"));
    await renderTab();
    fireEvent.click(screen.getByText(/newItem/i));
    fireEvent.change(screen.getByPlaceholderText(/enterTitle/i), {
      target: { value: "New Item" },
    });
    fireEvent.click(screen.getByText(/save/i));
    await waitFor(() => {
      expect(notification().error).toHaveBeenCalled();
    });
  });

  test("edit backlog item and update", async () => {
    const { BacklogService } = require("../../src/services/backlog.service");
    await renderTab();
    fireEvent.click(screen.getByText(/edit/i));
    const titleInput = screen.getByDisplayValue("Item 1");
    fireEvent.change(titleInput, { target: { value: "Edited" } });
    fireEvent.change(screen.getAllByTestId("select")[0], { target: { value: "high" } });
    fireEvent.click(screen.getByText(/save/i));
    await waitFor(() => {
      expect(BacklogService.updateBacklogItem).toHaveBeenCalled();
    });
  });

  test("archive backlog item via confirm", async () => {
    const { BacklogService } = require("../../src/services/backlog.service");
    modalConfirm().mockImplementation(({ onOk }) => onOk && onOk());
    await renderTab();
    fireEvent.click(screen.getByText(/archive/i));
    await waitFor(() => {
      expect(BacklogService.archiveBacklogItem).toHaveBeenCalledWith("g1", "b1");
    });
  });

  test("promote backlog item to sprint", async () => {
    const { BacklogService } = require("../../src/services/backlog.service");
    const onPromoteSuccess = jest.fn();
    await renderTab({ onPromoteSuccess });
    fireEvent.click(screen.getByText(/moveToSprint/i));
    await waitFor(() => {
      expect(BacklogService.promoteBacklogItem).toHaveBeenCalledWith(
        "g1",
        "b1",
        expect.objectContaining({ columnId: "todo" })
      );
      expect(onPromoteSuccess).toHaveBeenCalled();
    });
  });

  test("fetch error shows notification", async () => {
    const { BacklogService } = require("../../src/services/backlog.service");
    BacklogService.getBacklog.mockRejectedValueOnce(new Error("fail"));
    render(
      <BacklogTab
        groupId="g1"
        columnMeta={columnMeta}
        groupMembers={[]}
      />
    );
    await waitFor(() => {
      expect(notification().error).toHaveBeenCalled();
    });
  });

  test("readOnly hides actions", async () => {
    render(
      <BacklogTab
        groupId="g1"
        columnMeta={columnMeta}
        groupMembers={[]}
        readOnly
      />
    );
    expect(screen.queryByText(/newItem/i)).toBeNull();
  });

  test("renders placeholder when no items and handles array payload", async () => {
    await renderTab({}, [], false);
    await screen.findByText(/loading/i);
    await waitFor(() => {
      expect(screen.getByText(/backlogPlaceholder/i)).toBeInTheDocument();
    });
  });

  test("renders status tone for done column and linked task", async () => {
    const linked = [{ ...backlogItems[0], columnId: "done", linkedTaskId: "t1" }];
    await renderTab({}, { data: linked });
    const badge = screen.getAllByText(/todo/i)[0];
    expect(badge.className).toMatch(/emerald/i);
  });
});
