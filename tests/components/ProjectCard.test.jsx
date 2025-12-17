/**
UTC01 N Render and view detail => Calls onViewDetail on card click
- Pre: project has title/description
- Condition: render ProjectCard and click card area
- Confirmation: onViewDetail called with project; text visible

UTC02 B Closed topic disables select => Button disabled and no callback
- Pre: project.status closed, membership leader
- Condition: click select button
- Confirmation: button disabled; onSelectTopic not called

UTC03 N Select via prop => Triggers onSelectTopic and stops navigation
- Pre: project open with topicId, membership leader, onSelectTopic provided
- Condition: click Select Topic
- Confirmation: onSelectTopic called with project; onViewDetail not called

UTC04 A No groups available => Shows error and navigates to my-group
- Pre: GroupService.getMyGroups returns empty; no onSelectTopic prop
- Condition: click Select Topic
- Confirmation: notification.error called; navigate("/my-group"); assignTopic not called

UTC05 A Assign topic failure => Error notification when assign rejects
- Pre: GroupService returns full group; assignTopic rejects
- Condition: click Select Topic
- Confirmation: assignTopic called with group/topic ids; notification.error called; navigate not called

UTC06 N Assign topic success => Calls assignTopic then success + navigate
- Pre: GroupService returns full group; assignTopic resolves
- Condition: click Select Topic
- Confirmation: assignTopic called; notification.success called; navigate("/my-group")
*/

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import ProjectCard from "../../src/components/common/discover/ProjectCard";

jest.mock("lucide-react", () => ({
  Sparkles: () => <span data-testid="sparkles" />,
  Users: () => <span data-testid="users" />,
  Download: () => <span data-testid="download" />,
  FileText: () => <span data-testid="filetext" />,
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockNotificationSuccess = jest.fn();
const mockNotificationError = jest.fn();
jest.mock("antd", () => ({
  notification: {
    success: (...args) => mockNotificationSuccess(...args),
    error: (...args) => mockNotificationError(...args),
  },
}));

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

const mockGetMyGroups = jest.fn();
const mockAssignTopic = jest.fn();
jest.mock("../../src/services/group.service", () => ({
  GroupService: {
    getMyGroups: (...args) => mockGetMyGroups(...args),
    assignTopic: (...args) => mockAssignTopic(...args),
  },
}));

const baseProject = {
  title: "Project A",
  description: "Desc",
  domain: "AI",
  tags: ["open"],
  topicSkills: ["React", "ML"],
  createdAt: "2025-12-12",
  status: "open",
  topicId: "t1",
};

describe("ProjectCard Report5", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMyGroups.mockResolvedValue({ data: [] });
    mockAssignTopic.mockResolvedValue({});
  });

  test("UTC01 [N] Render and view detail => Calls onViewDetail on card click", async () => {
    const onViewDetail = jest.fn();
    render(
      <ProjectCard project={baseProject} onViewDetail={onViewDetail} hasGroupTopic membership={{}} />
    );
    const card = screen.getByText("Project A");
    const user = userEvent.setup();
    await user.click(card);
    expect(onViewDetail).toHaveBeenCalledWith(baseProject);
    expect(screen.getByText("Desc")).toBeInTheDocument();
  });

  test("UTC02 [B] Closed topic disables select => Button disabled and no callback", async () => {
    const onSelectTopic = jest.fn();
    render(
      <ProjectCard
        project={{ ...baseProject, status: "closed" }}
        membership={{ status: "leader" }}
        onSelectTopic={onSelectTopic}
      />
    );
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    const user = userEvent.setup();
    await user.click(button);
    expect(onSelectTopic).not.toHaveBeenCalled();
  });

  test("UTC03 [N] Select via prop => Triggers onSelectTopic and stops navigation", async () => {
    const onSelectTopic = jest.fn();
    const onViewDetail = jest.fn();
    render(
      <ProjectCard
        project={baseProject}
        membership={{ status: "leader" }}
        onSelectTopic={onSelectTopic}
        onViewDetail={onViewDetail}
      />
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button"));
    expect(onSelectTopic).toHaveBeenCalledWith(baseProject);
    expect(onViewDetail).not.toHaveBeenCalled();
  });

  test("UTC04 [A] No groups available => Shows error and navigates to my-group", async () => {
    mockGetMyGroups.mockResolvedValue({ data: [] });
    render(
      <ProjectCard
        project={baseProject}
        membership={{ status: "leader" }}
        hasGroupTopic={false}
      />
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button"));
    await waitFor(() => expect(mockNotificationError).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith("/my-group");
    expect(mockAssignTopic).not.toHaveBeenCalled();
  });

  test("UTC05 [A] Assign topic failure => Error notification when assign rejects", async () => {
    mockGetMyGroups.mockResolvedValue({
      data: [{ id: "g1", currentMembers: 3, maxMembers: 3 }],
    });
    mockAssignTopic.mockRejectedValue(new Error("fail"));
    render(
      <ProjectCard
        project={baseProject}
        membership={{ status: "leader" }}
        hasGroupTopic={false}
      />
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button"));
    await waitFor(() => expect(mockAssignTopic).toHaveBeenCalledWith("g1", "t1"));
    expect(mockNotificationError).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("UTC06 [N] Assign topic success => Calls assignTopic then success + navigate", async () => {
    mockGetMyGroups.mockResolvedValue({
      data: [{ id: "g1", currentMembers: 3, maxMembers: 3 }],
    });
    render(
      <ProjectCard
        project={baseProject}
        membership={{ status: "leader" }}
        hasGroupTopic={false}
      />
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button"));
    await waitFor(() => expect(mockAssignTopic).toHaveBeenCalledWith("g1", "t1"));
    expect(mockNotificationSuccess).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/my-group");
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "ProjectCard",
  totalTC: 6,
  breakdown: { N: 3, B: 1, A: 2 },
  notes:
    "Covers view detail click, disabled closed topic, select via callback, empty groups path, assign failure and success flows with notifications and navigation.",
};
