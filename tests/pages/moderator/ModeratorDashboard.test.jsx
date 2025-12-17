import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { jest } from "@jest/globals";
import { waitForServiceCall } from "./test-utils";

jest.setTimeout(20000);

jest.mock("../../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

jest.mock("antd", () => {
  const React = require("react");
  const actual = jest.requireActual("antd");

  const Table = ({ columns, dataSource, loading }) => (
    <div>
      {loading ? <div data-testid="table-loading">loading</div> : null}
      {dataSource?.map((row, rowIdx) => (
        <div key={row.id ?? rowIdx}>
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

  return {
    ...actual,
    Table,
    notification: {
      ...actual.notification,
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    },
  };
});

jest.mock("../../../src/services/admin.service", () => ({
  AdminService: {
    getDashboardStats: jest.fn(),
  },
}));

jest.mock("../../../src/services/group.service", () => ({
  GroupService: {
    getListGroup: jest.fn(),
  },
}));

jest.mock("../../../src/services/topic.service", () => ({
  TopicService: {
    getTopics: jest.fn(),
  },
}));

describe("ModeratorDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("UTC01 [N] Load dashboard => Calls services and renders stats + tables", async () => {
    // Arrange: Setup services with dashboard data
    const ModeratorDashboard = (
      await import("../../../src/pages/moderator/Dashboard")
    ).default;
    const { AdminService } = await import(
      "../../../src/services/admin.service"
    );
    const { GroupService } = await import(
      "../../../src/services/group.service"
    );
    const { TopicService } = await import(
      "../../../src/services/topic.service"
    );

    AdminService.getDashboardStats.mockResolvedValue({
      data: { totalGroups: 3, openTopics: 1, recruitingGroups: 2 },
    });
    GroupService.getListGroup.mockResolvedValue({
      data: [
        {
          id: "g1",
          name: "Group A",
          topic: { title: "Topic 1" },
          mentor: { displayName: "Mentor 1" },
          currentMembers: 2,
          maxMembers: 5,
          status: "active",
        },
      ],
    });
    TopicService.getTopics.mockResolvedValue({
      data: [
        {
          id: "t1",
          title: "Topic 1",
          majorName: "CS",
          mentors: [{ mentorName: "Mentor 1" }],
          status: "open",
        },
      ],
    });

    // Act: Render dashboard
    render(<ModeratorDashboard />);

    // Assert: Verify all services were called
    await waitForServiceCall(AdminService.getDashboardStats, 1);
    await waitForServiceCall(GroupService.getListGroup, 1);
    expect(TopicService.getTopics).toHaveBeenCalledWith({ pageSize: 5 });

    // Verify dashboard heading and stats
    expect(
      await screen.findByRole("heading", { name: /dashboard/i })
    ).toBeInTheDocument();

    expect(screen.getByText("totalGroups")).toBeInTheDocument();
    expect(screen.getByText("groupsMissingTopics")).toBeInTheDocument();
    expect(screen.getByText("groupsMissingMentor")).toBeInTheDocument();

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    // Verify tables display data correctly
    expect(screen.getByText(/Group A/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Topic 1/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mentor 1/i).length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.getByText(/recentGroups/i)).toBeInTheDocument();
      expect(screen.getByText(/recentTopics/i)).toBeInTheDocument();
    });
  });

  test("UTC02 [A] Dashboard stats error => Shows notification error and still renders page", async () => {
    const ModeratorDashboard = (
      await import("../../../src/pages/moderator/Dashboard")
    ).default;
    const { AdminService } = await import(
      "../../../src/services/admin.service"
    );
    const { GroupService } = await import(
      "../../../src/services/group.service"
    );
    const { TopicService } = await import(
      "../../../src/services/topic.service"
    );
    const { notification } = await import("antd");

    AdminService.getDashboardStats.mockRejectedValue(new Error("boom"));
    GroupService.getListGroup.mockResolvedValue({ data: [] });
    TopicService.getTopics.mockResolvedValue({ data: [] });

    render(<ModeratorDashboard />);

    expect(
      await screen.findByRole("heading", { name: /dashboard/i })
    ).toBeInTheDocument();

    expect(notification.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "error",
        description: "Failed to load dashboard statistics",
      })
    );
  });

  test("UTC03 [B] Groups/topics edge cases => Renders fallbacks for missing fields", async () => {
    const ModeratorDashboard = (
      await import("../../../src/pages/moderator/Dashboard")
    ).default;
    const { AdminService } = await import(
      "../../../src/services/admin.service"
    );
    const { GroupService } = await import(
      "../../../src/services/group.service"
    );
    const { TopicService } = await import(
      "../../../src/services/topic.service"
    );

    AdminService.getDashboardStats.mockResolvedValue({
      data: { totalGroups: 0, openTopics: 0, recruitingGroups: 0 },
    });

    GroupService.getListGroup.mockResolvedValue({
      data: [
        {
          id: "g2",
          name: "Group B",
          topic: null,
          mentor: null,
          status: "inactive",
        },
      ],
    });

    TopicService.getTopics.mockResolvedValue({
      data: {
        items: [
          {
            id: "t2",
            title: "Topic Pending",
            majorName: "SE",
            mentors: [],
            status: "pending",
          },
          {
            id: "t3",
            title: "Topic Closed",
            majorName: "SE",
            mentors: null,
            status: "closed",
          },
        ],
      },
    });

    render(<ModeratorDashboard />);

    expect(
      await screen.findByRole("heading", { name: /dashboard/i })
    ).toBeInTheDocument();

    // group row fallbacks
    expect(screen.getByText(/Group B/i)).toBeInTheDocument();
    expect(screen.getByText(/noTopic/i)).toBeInTheDocument();
    expect(screen.getAllByText("N/A").length).toBeGreaterThan(0);

    // topic row fallbacks
    expect(screen.getByText(/Topic Pending/i)).toBeInTheDocument();
    expect(screen.getByText(/Topic Closed/i)).toBeInTheDocument();
    expect(screen.getAllByText("N/A").length).toBeGreaterThan(0);
  });
});
