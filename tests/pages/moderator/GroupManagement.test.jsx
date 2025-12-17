import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import { clickIconButton, waitForServiceCall } from "./test-utils";

jest.setTimeout(20000);

jest.mock("../../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

jest.mock(
  "../../../src/components/moderator/GroupDetailModal",
  () => (props) =>
    props.open ? (
      <div data-testid="group-detail-modal">
        {props.group?.title || props.group?.name}
        <button type="button" onClick={props.onClose}>
          close
        </button>
      </div>
    ) : null
);

jest.mock("../../../src/services/group.service", () => ({
  GroupService: {
    getListGroup: jest.fn(),
    getGroupDetail: jest.fn(),
  },
}));

jest.mock("../../../src/services/major.service", () => ({
  MajorService: {
    getMajors: jest.fn(),
  },
}));

jest.mock("antd", () => {
  const React = require("react");
  const actual = jest.requireActual("antd");

  const Table = ({ columns, dataSource, loading }) => (
    <div>
      {loading ? <div data-testid="table-loading">loading</div> : null}
      {dataSource?.map((row, rowIdx) => (
        <div key={row.key ?? rowIdx}>
          {columns.map((col, colIdx) => {
            const key = col.key || col.dataIndex || colIdx;
            const raw = col.dataIndex ? row[col.dataIndex] : undefined;
            const content = col.render ? col.render(raw, row, rowIdx) : raw;
            return <div key={key}>{content}</div>;
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
  const Option = ({ value, children }) => (
    <option value={value}>{children}</option>
  );
  Select.Option = Option;

  return {
    ...actual,
    Table,
    Input,
    Select,
    notification: {
      ...actual.notification,
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    },
  };
});

describe("GroupManagement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("UTC01 [N] Load groups + majors => Renders group row", async () => {
    // Arrange: Setup services with mock data
    const GroupManagement = (
      await import("../../../src/pages/moderator/GroupManagement")
    ).default;
    const { GroupService } = await import(
      "../../../src/services/group.service"
    );
    const { MajorService } = await import(
      "../../../src/services/major.service"
    );

    GroupService.getListGroup.mockResolvedValue({
      data: [
        {
          groupId: "g1",
          name: "Gamma Force",
          status: "active",
          major: { name: "Computer Science" },
          currentMembers: 2,
          maxMembers: 5,
        },
      ],
    });
    MajorService.getMajors.mockResolvedValue({
      data: [{ majorId: "m1", majorName: "Computer Science" }],
    });

    // Act: Render component
    render(<GroupManagement />);

    // Assert: Verify services were called and data is displayed
    await waitForServiceCall(GroupService.getListGroup, 1);
    expect(MajorService.getMajors).toHaveBeenCalledTimes(1);

    expect(await screen.findByText(/groupManagement/i)).toBeInTheDocument();
    expect(screen.getByText(/Gamma Force/i)).toBeInTheDocument();
    expect(screen.getAllByText(/notAssigned/i).length).toBeGreaterThan(0);
  });

  test("UTC02 [B] View details => Calls service and opens/closes detail modal", async () => {
    // Arrange: Setup component with group data
    const GroupManagement = (
      await import("../../../src/pages/moderator/GroupManagement")
    ).default;
    const { GroupService } = await import(
      "../../../src/services/group.service"
    );
    const { MajorService } = await import(
      "../../../src/services/major.service"
    );

    GroupService.getListGroup.mockResolvedValue({
      data: [{ groupId: "g1", name: "Gamma Force", status: "active" }],
    });
    MajorService.getMajors.mockResolvedValue({ data: [] });
    GroupService.getGroupDetail.mockResolvedValue({
      data: { id: "g1", title: "Gamma Force" },
    });

    // Act: Render and open detail modal
    render(<GroupManagement />);

    expect(await screen.findByText(/Gamma Force/i)).toBeInTheDocument();

    const user = userEvent.setup();
    await clickIconButton(user, "eye");

    // Assert: Verify detail modal is displayed with correct data
    expect(GroupService.getGroupDetail).toHaveBeenCalledWith("g1");
    expect(await screen.findByTestId("group-detail-modal")).toHaveTextContent(
      "Gamma Force"
    );

    // Act: Close modal
    await user.click(
      screen.getByTestId("group-detail-modal").querySelector("button")
    );

    // Assert: Verify modal is closed
    expect(screen.queryByTestId("group-detail-modal")).not.toBeInTheDocument();
  });

  test("UTC03 [A] Remind topic when missing => Shows info notification", async () => {
    const GroupManagement = (
      await import("../../../src/pages/moderator/GroupManagement")
    ).default;
    const { GroupService } = await import(
      "../../../src/services/group.service"
    );
    const { MajorService } = await import(
      "../../../src/services/major.service"
    );
    const { notification } = await import("antd");

    GroupService.getListGroup.mockResolvedValue({
      data: [{ groupId: "g1", name: "Gamma Force", status: "active" }],
    });
    MajorService.getMajors.mockResolvedValue({ data: [] });

    render(<GroupManagement />);

    expect(await screen.findByText(/Gamma Force/i)).toBeInTheDocument();

    const user = userEvent.setup();
    await clickIconButton(user, "bell");

    expect(notification.info).toHaveBeenCalledWith(
      expect.objectContaining({ message: "topicReminderSent" })
    );
  });

  test("UTC04 [B] Filter selects => Update major/status filters", async () => {
    const GroupManagement = (
      await import("../../../src/pages/moderator/GroupManagement")
    ).default;
    const { GroupService } = await import(
      "../../../src/services/group.service"
    );
    const { MajorService } = await import(
      "../../../src/services/major.service"
    );

    GroupService.getListGroup.mockResolvedValue({
      data: [
        {
          groupId: "g1",
          name: "Gamma Force",
          status: "active",
          major: { name: "Computer Science" },
        },
        {
          groupId: "g2",
          name: "Delta Group",
          status: "pending",
          major: { name: "IT" },
        },
      ],
    });
    MajorService.getMajors.mockResolvedValue({
      data: [
        { majorId: "m1", majorName: "Computer Science" },
        { majorId: "m2", majorName: "IT" },
      ],
    });

    render(<GroupManagement />);

    expect(await screen.findByText(/Gamma Force/i)).toBeInTheDocument();
    expect(screen.getByText(/Delta Group/i)).toBeInTheDocument();

    const selects = screen.getAllByRole("combobox");
    const majorSelect = selects[0];
    const statusSelect = selects[1];

    fireEvent.change(majorSelect, { target: { value: "IT" } });
    expect(screen.queryByText(/Gamma Force/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Delta Group/i)).toBeInTheDocument();

    fireEvent.change(statusSelect, { target: { value: "Active" } });
    expect(screen.queryByText(/Delta Group/i)).not.toBeInTheDocument();
  });

  test("UTC05 [A] Load groups error => Shows notification error", async () => {
    const GroupManagement = (
      await import("../../../src/pages/moderator/GroupManagement")
    ).default;
    const { GroupService } = await import(
      "../../../src/services/group.service"
    );
    const { MajorService } = await import(
      "../../../src/services/major.service"
    );
    const { notification } = await import("antd");

    GroupService.getListGroup.mockRejectedValue(new Error("boom"));
    MajorService.getMajors.mockResolvedValue({ data: [] });

    render(<GroupManagement />);

    await waitFor(() => {
      expect(notification.error).toHaveBeenCalledWith(
        expect.objectContaining({ message: "failedLoadGroups" })
      );
    });
  });

  test("UTC06 [A] Load majors error => Shows notification error", async () => {
    const GroupManagement = (
      await import("../../../src/pages/moderator/GroupManagement")
    ).default;
    const { GroupService } = await import(
      "../../../src/services/group.service"
    );
    const { MajorService } = await import(
      "../../../src/services/major.service"
    );
    const { notification } = await import("antd");

    GroupService.getListGroup.mockResolvedValue({ data: [] });
    MajorService.getMajors.mockRejectedValue(new Error("boom"));

    render(<GroupManagement />);

    await waitFor(() => {
      expect(notification.error).toHaveBeenCalledWith(
        expect.objectContaining({ message: "failedLoadMajors" })
      );
    });
  });

  test("UTC07 [A] Group detail error => Shows notification error", async () => {
    const GroupManagement = (
      await import("../../../src/pages/moderator/GroupManagement")
    ).default;
    const { GroupService } = await import(
      "../../../src/services/group.service"
    );
    const { MajorService } = await import(
      "../../../src/services/major.service"
    );
    const { notification } = await import("antd");

    GroupService.getListGroup.mockResolvedValue({
      data: [{ groupId: "g1", name: "Gamma Force", status: "active" }],
    });
    MajorService.getMajors.mockResolvedValue({ data: [] });
    GroupService.getGroupDetail.mockRejectedValue(new Error("boom"));

    render(<GroupManagement />);

    expect(await screen.findByText(/Gamma Force/i)).toBeInTheDocument();

    const user = userEvent.setup();
    await clickIconButton(user, "eye");

    expect(notification.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: "failedLoadGroupDetail" })
    );
  });
});
