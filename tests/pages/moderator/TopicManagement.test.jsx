import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";

jest.setTimeout(20000);

jest.mock("../../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("../../../src/components/moderator/TopicAddModal", () => (props) =>
  props.open ? (
    <div data-testid="topic-add-modal">
      open
      <button type="button" onClick={props.onClose}>
        close
      </button>
    </div>
  ) : null
);

jest.mock("../../../src/components/moderator/TopicEditModal", () => (props) =>
  props.open ? (
    <div data-testid="topic-edit-modal">
      {props.topic?.title || "no-topic"}
      <button type="button" onClick={props.onClose}>
        close
      </button>
    </div>
  ) : null
);

jest.mock("../../../src/components/moderator/TopicDetailModal", () => (props) =>
  props.open ? (
    <div data-testid="topic-detail-modal">
      {props.topicDetails?.topicName || props.topicDetails?.title}
      <button type="button" onClick={props.onClose}>
        close
      </button>
    </div>
  ) : null
);

jest.mock("../../../src/services/topic.service", () => ({
  TopicService: {
    getTopics: jest.fn(),
    deleteTopic: jest.fn(),
  },
}));

jest.mock("../../../src/services/group.service", () => ({
  GroupService: {
    getListGroup: jest.fn(),
  },
}));

jest.mock("antd", () => {
  const React = require("react");
  const actual = jest.requireActual("antd");

  const MockModal = actual.Modal;
  MockModal.confirm = jest.fn(({ onOk }) => {
    if (onOk) onOk();
  });

  const Table = ({ columns, dataSource, loading }) => (
    <div>
      {loading ? <div data-testid="table-loading">loading</div> : null}
      {dataSource?.map((row, rowIdx) => (
        <div key={row.key ?? rowIdx}>
          {columns.map((col, colIdx) => {
            const key = col.key || col.dataIndex || colIdx;
            const raw = col.dataIndex ? row[col.dataIndex] : undefined;
            const content = col.render ? col.render(raw, row, rowIdx) : raw;
            return (
              <div key={key} data-testid={`cell-${row.key}-${key}`}>
                {content}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  const Input = ({ prefix, ...props }) => <input {...props} />;

  const Select = ({ value, onChange, children, ...props }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} {...props}>
      {children}
    </select>
  );
  const Option = ({ value, children }) => <option value={value}>{children}</option>;
  Select.Option = Option;

  return {
    ...actual,
    Table,
    Input,
    Select,
    Modal: MockModal,
    notification: {
      ...actual.notification,
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    },
  };
});

const clickIconButton = async (user, iconLabel) => {
  const icon = await screen.findByLabelText(iconLabel);
  const button = icon.closest("button");
  if (!button) throw new Error(`No button found for icon: ${iconLabel}`);
  await user.click(button);
};

describe("TopicManagement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockReset();
  });

  test("UTC01 [N] Load topics => Calls APIs and renders mapped topic row", async () => {
    const TopicManagement = (await import("../../../src/pages/moderator/TopicManagement")).default;
    const { TopicService } = await import("../../../src/services/topic.service");
    const { GroupService } = await import("../../../src/services/group.service");

    TopicService.getTopics.mockResolvedValue({
      data: [
        {
          topicId: "t1",
          title: "AI Topic",
          description: "Desc",
          mentors: [{ mentorName: "Mentor A" }],
          majorName: "CS",
          createdAt: "2025-01-02T00:00:00Z",
          status: "open",
        },
      ],
    });
    GroupService.getListGroup.mockResolvedValue({ data: [] });

    render(<TopicManagement />);

    await waitFor(() => expect(TopicService.getTopics).toHaveBeenCalledTimes(1));
    expect(GroupService.getListGroup).toHaveBeenCalledTimes(1);

    expect(await screen.findByText(/AI Topic/i)).toBeInTheDocument();
    expect(screen.getByText(/Mentor A/i)).toBeInTheDocument();
    expect(screen.getByText(/^CS$/)).toBeInTheDocument();
    expect(screen.getByText(/notAssigned/i)).toBeInTheDocument();
  });

  test("UTC02 [B] Search + status filter => Filters rows", async () => {
    const TopicManagement = (await import("../../../src/pages/moderator/TopicManagement")).default;
    const { TopicService } = await import("../../../src/services/topic.service");
    const { GroupService } = await import("../../../src/services/group.service");

    TopicService.getTopics.mockResolvedValue({
      data: [
        { topicId: "t1", title: "AI Topic", majorName: "CS", status: "open" },
        { topicId: "t2", title: "SE Topic", majorName: "SE", status: "closed" },
      ],
    });
    GroupService.getListGroup.mockResolvedValue({ data: [] });

    render(<TopicManagement />);

    expect(await screen.findByText(/AI Topic/i)).toBeInTheDocument();
    expect(screen.getByText(/SE Topic/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/searchByTopicOrMentor/i), {
      target: { value: "AI" },
    });
    expect(screen.getByText(/AI Topic/i)).toBeInTheDocument();
    expect(screen.queryByText(/SE Topic/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "closed" } });
    expect(screen.queryByText(/AI Topic/i)).not.toBeInTheDocument();
  });

  test("UTC03 [B] Create/edit/detail modals => Close handlers hide modal", async () => {
    const TopicManagement = (await import("../../../src/pages/moderator/TopicManagement")).default;
    const { TopicService } = await import("../../../src/services/topic.service");
    const { GroupService } = await import("../../../src/services/group.service");

    TopicService.getTopics.mockResolvedValue({
      data: [{ topicId: "t1", title: "AI Topic", status: "open" }],
    });
    GroupService.getListGroup.mockResolvedValue({ data: [] });

    render(<TopicManagement />);

    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: /createTopic/i }));
    expect(screen.getByTestId("topic-add-modal")).toBeInTheDocument();
    await user.click(screen.getByTestId("topic-add-modal").querySelector("button"));
    expect(screen.queryByTestId("topic-add-modal")).not.toBeInTheDocument();

    await clickIconButton(user, "eye");
    expect(screen.getByTestId("topic-detail-modal")).toBeInTheDocument();
    await user.click(screen.getByTestId("topic-detail-modal").querySelector("button"));
    expect(screen.queryByTestId("topic-detail-modal")).not.toBeInTheDocument();

    await clickIconButton(user, "edit");
    expect(screen.getByTestId("topic-edit-modal")).toBeInTheDocument();
    await user.click(screen.getByTestId("topic-edit-modal").querySelector("button"));
    expect(screen.queryByTestId("topic-edit-modal")).not.toBeInTheDocument();
  });

  test("UTC04 [A] Delete topic confirm => Calls delete service and refreshes list", async () => {
    const TopicManagement = (await import("../../../src/pages/moderator/TopicManagement")).default;
    const { TopicService } = await import("../../../src/services/topic.service");
    const { GroupService } = await import("../../../src/services/group.service");
    const { Modal } = await import("antd");

    TopicService.getTopics
      .mockResolvedValueOnce({
        data: [{ topicId: "t1", title: "AI Topic", status: "open" }],
      })
      .mockResolvedValueOnce({ data: [] });
    GroupService.getListGroup.mockResolvedValue({ data: [] });
    TopicService.deleteTopic.mockResolvedValue({});

    render(<TopicManagement />);

    expect(await screen.findByText(/AI Topic/i)).toBeInTheDocument();

    const user = userEvent.setup();
    await clickIconButton(user, "delete");

    expect(Modal.confirm).toHaveBeenCalledTimes(1);
    expect(TopicService.deleteTopic).toHaveBeenCalledWith("t1");

    await waitFor(() => expect(TopicService.getTopics).toHaveBeenCalledTimes(2));
  });

  test("UTC05 [B] Mapping branches => Assigned group and pendingGroupName handled", async () => {
    const TopicManagement = (await import("../../../src/pages/moderator/TopicManagement")).default;
    const { TopicService } = await import("../../../src/services/topic.service");
    const { GroupService } = await import("../../../src/services/group.service");

    TopicService.getTopics.mockResolvedValue({
      data: {
        data: [
          {
            topicId: "t1",
            title: "Assigned Topic",
            mentors: [],
            createdByName: "Creator X",
            majorName: "IT",
            createdAt: null,
            status: null,
          },
          {
            topicId: "t2",
            title: "Pending Topic",
            mentors: null,
            pendingGroupName: "Pending Group",
            majorName: "SE",
            createdAt: "2025-01-02T00:00:00Z",
            status: "closed",
          },
        ],
      },
    });

    GroupService.getListGroup.mockResolvedValue({
      data: [{ id: "g1", name: "Group X", topic: { topicId: "t1" } }],
    });

    render(<TopicManagement />);

    expect(await screen.findByText(/Assigned Topic/i)).toBeInTheDocument();
    expect(screen.getByText(/Creator X/i)).toBeInTheDocument();
    expect(screen.getByText(/Group X/i)).toBeInTheDocument();

    expect(screen.getByText(/Pending Topic/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending Group/i)).toBeInTheDocument();
  });

  test("UTC06 [A] Delete topic error => Shows notification error", async () => {
    const TopicManagement = (await import("../../../src/pages/moderator/TopicManagement")).default;
    const { TopicService } = await import("../../../src/services/topic.service");
    const { GroupService } = await import("../../../src/services/group.service");
    const { notification } = await import("antd");

    TopicService.getTopics.mockResolvedValueOnce({
      data: [{ topicId: "t1", title: "AI Topic", status: "open" }],
    });
    GroupService.getListGroup.mockResolvedValue({ data: [] });
    TopicService.deleteTopic.mockRejectedValue(new Error("boom"));

    render(<TopicManagement />);

    expect(await screen.findByText(/AI Topic/i)).toBeInTheDocument();

    const user = userEvent.setup();
    await clickIconButton(user, "delete");

    await waitFor(() => {
      expect(notification.error).toHaveBeenCalledWith(
        expect.objectContaining({ message: "failedDeleteTopic" })
      );
    });
  });

  test("UTC07 [A] Delete guard (hasGroup) => Warns and does not open confirm", async () => {
    const TopicManagement = (await import("../../../src/pages/moderator/TopicManagement")).default;
    const { TopicService } = await import("../../../src/services/topic.service");
    const { GroupService } = await import("../../../src/services/group.service");
    const { Modal, notification } = await import("antd");

    TopicService.getTopics.mockResolvedValueOnce({
      data: [{ topicId: "t1", title: "Assigned Topic", status: "closed" }],
    });
    GroupService.getListGroup.mockResolvedValue({ data: [] });

    render(<TopicManagement />);

    expect(await screen.findByText(/Assigned Topic/i)).toBeInTheDocument();

    const user = userEvent.setup();
    await clickIconButton(user, "delete");

    expect(notification.warning).toHaveBeenCalledWith(
      expect.objectContaining({ message: "cannotDeleteTopic" })
    );
    expect(Modal.confirm).not.toHaveBeenCalled();
  });
});
