import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import {
  createDefaultAIMockResponse,
  createDefaultSummaryMock,
  setupConsoleErrorSpy,
  waitForServiceCall,
} from "./test-utils";

jest.setTimeout(20000);

jest.mock("../../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

jest.mock("antd", () => {
  const notification = {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  };

  const Card = ({ children, title }) => (
    <div>
      {title}
      {children}
    </div>
  );

  const Tag = ({ children }) => <span>{children}</span>;
  const Divider = () => <hr />;

  const Space = ({ children }) => <div>{children}</div>;

  const Button = ({ children, icon, loading, ...props }) => (
    <button type="button" {...props}>
      {loading ? "loading" : null}
      {children || icon || "button"}
    </button>
  );

  const Select = ({ value, onChange, children }) => (
    <select
      aria-label="mode"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  );

  const Option = ({ value }) => <option value={value}>{value}</option>;
  Select.Option = Option;

  const Switch = ({ checked, onChange }) => (
    <input
      type="checkbox"
      aria-label="switch"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  );

  return {
    Card,
    Select,
    Button,
    Space,
    Tag,
    Divider,
    notification,
    Switch,
  };
});

jest.mock("../../../src/services/ai.service", () => ({
  AiService: {
    getOptions: jest.fn(),
    getSummary: jest.fn(),
    autoAssignTeams: jest.fn(),
    autoAssignTopic: jest.fn(),
    autoResolve: jest.fn(),
  },
}));

describe("AIAssistantModerator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("UTC01 [N] Mount fetch => Loads summary + initial results", async () => {
    // Arrange: Import components and mock services
    const AIAssistant = (
      await import("../../../src/pages/moderator/AIAssistant")
    ).default;
    const { AiService } = await import("../../../src/services/ai.service");

    AiService.getOptions.mockResolvedValue({
      status: 200,
      data: {
        data: {
          semesterId: "sem-1",
          groupsWithoutTopic: {
            items: [{ name: "Group No Topic", groupId: "g0", suggestions: [] }],
          },
          studentsWithoutGroup: {
            items: [
              {
                displayName: "Student A",
                studentId: "s1",
                suggestedGroup: {
                  name: "Group X",
                  groupId: "g1",
                  reason: "Điểm AI 88",
                },
              },
            ],
          },
          groupsNeedingMembers: {
            items: [
              {
                name: "Group Need Members",
                groupId: "g2",
                currentMembers: 2,
                maxMembers: 5,
                suggestedMembers: [{ displayName: "Student B", score: 90 }],
              },
            ],
          },
        },
        success: true,
      },
    });

    AiService.getSummary.mockResolvedValue({
      status: 200,
      data: {
        data: {
          groupsWithoutTopic: 1,
          studentsWithoutGroup: 2,
          groupsUnderCapacity: 3,
        },
        success: true,
      },
    });

    // Act: Render component
    render(<AIAssistant />);

    // Assert: Verify heading and summary stats
    expect(
      await screen.findByRole("heading", { name: /aiAssistant/i })
    ).toBeInTheDocument();

    expect(screen.getAllByText(/groupsWithoutTopics/i).length).toBeGreaterThan(
      0
    );
    expect(screen.getAllByText(/membersWithoutGroup/i).length).toBeGreaterThan(
      0
    );
    expect(screen.getAllByText(/groupsMissingMembers/i).length).toBeGreaterThan(
      0
    );

    // Verify initial mode displays correct data
    expect(screen.getByText(/Student A/i)).toBeInTheDocument();
    expect(screen.getByText(/Group Need Members/i)).toBeInTheDocument();
    expect(screen.getByText(/88%/i)).toBeInTheDocument();

    // Verify service calls
    expect(AiService.getOptions).toHaveBeenCalledTimes(1);
    expect(AiService.getSummary).toHaveBeenCalledTimes(1);
  });

  test("UTC02 [B] Change mode => Missing topics list renders", async () => {
    // Arrange: Setup component with groups missing topics
    const AIAssistant = (
      await import("../../../src/pages/moderator/AIAssistant")
    ).default;
    const { AiService } = await import("../../../src/services/ai.service");

    AiService.getOptions.mockResolvedValue({
      status: 200,
      data: {
        data: {
          semesterId: "sem-1",
          groupsWithoutTopic: {
            items: [
              {
                name: "Group No Topic",
                groupId: "g0",
                suggestions: [
                  { title: "Topic 1", reason: "Match", score: 80 },
                  { title: "Topic 2", reason: "Also match", score: 70 },
                ],
              },
            ],
          },
          studentsWithoutGroup: { items: [] },
          groupsNeedingMembers: { items: [] },
        },
        success: true,
      },
    });

    AiService.getSummary.mockResolvedValue({
      status: 200,
      data: { data: {}, success: true },
    });

    // Act: Render and switch to missing topics mode
    render(<AIAssistant />);

    expect(
      await screen.findByRole("heading", { name: /aiAssistant/i })
    ).toBeInTheDocument();

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("mode"), "missingTopics");

    // Assert: Verify missing topics are displayed with suggestions
    expect(await screen.findByText(/Group No Topic/i)).toBeInTheDocument();
    expect(screen.getByText(/Topic 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Topic 2/i)).toBeInTheDocument();
  });

  test("UTC03 [B] Run analysis (groupsAndMembers) => Calls autoAssignTeams then refresh", async () => {
    // Arrange: Setup component and mock successful analysis
    const AIAssistant = (
      await import("../../../src/pages/moderator/AIAssistant")
    ).default;
    const { AiService } = await import("../../../src/services/ai.service");
    const { notification } = await import("antd");

    AiService.getOptions
      .mockResolvedValueOnce({
        status: 200,
        data: {
          data: {
            semesterId: "sem-1",
            groupsWithoutTopic: { items: [] },
            studentsWithoutGroup: { items: [] },
            groupsNeedingMembers: { items: [] },
          },
          success: true,
        },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: {
          data: {
            semesterId: "sem-1",
            groupsWithoutTopic: { items: [] },
            studentsWithoutGroup: { items: [] },
            groupsNeedingMembers: { items: [] },
          },
          success: true,
        },
      });

    AiService.getSummary.mockResolvedValue({
      status: 200,
      data: { data: {}, success: true },
    });
    AiService.autoAssignTeams.mockResolvedValue({});

    // Act: Render component and run analysis for groups and members
    render(<AIAssistant />);

    await waitFor(() => expect(AiService.getOptions).toHaveBeenCalledTimes(1));

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /runAnalysis/i }));

    // Assert: Verify correct service was called with correct params
    expect(AiService.autoAssignTeams).toHaveBeenCalledWith({
      semesterId: "sem-1",
      majorId: null,
      limit: null,
    });
    expect(AiService.autoAssignTopic).not.toHaveBeenCalled();
    expect(AiService.autoResolve).not.toHaveBeenCalled();

    expect(notification.success).toHaveBeenCalledWith(
      expect.objectContaining({ message: "aiAnalysisComplete" })
    );

    await waitForServiceCall(AiService.getOptions, 2);
  });

  test("UTC04 [A] Fetch options error => Shows notification error", async () => {
    // Arrange: Setup component with failing getOptions service
    const AIAssistant = (
      await import("../../../src/pages/moderator/AIAssistant")
    ).default;
    const { AiService } = await import("../../../src/services/ai.service");
    const { notification } = await import("antd");

    AiService.getOptions.mockRejectedValue(new Error("boom"));

    const consoleErrorSpy = setupConsoleErrorSpy();

    // Act: Render component which triggers fetch on mount
    render(<AIAssistant />);

    // Assert: Verify error notification is shown
    await waitFor(() => {
      expect(notification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "error",
        })
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test("UTC05 [B] Run AI auto-assign => Calls autoResolve then refresh", async () => {
    // Arrange: Setup component and mock successful auto-resolve
    const AIAssistant = (
      await import("../../../src/pages/moderator/AIAssistant")
    ).default;
    const { AiService } = await import("../../../src/services/ai.service");

    AiService.getOptions
      .mockResolvedValueOnce({
        status: 200,
        data: {
          data: {
            semesterId: "sem-1",
            groupsWithoutTopic: { items: [] },
            studentsWithoutGroup: { items: [] },
            groupsNeedingMembers: { items: [] },
          },
          success: true,
        },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: {
          data: {
            semesterId: "sem-1",
            groupsWithoutTopic: { items: [] },
            studentsWithoutGroup: { items: [] },
            groupsNeedingMembers: { items: [] },
          },
          success: true,
        },
      });

    AiService.getSummary.mockResolvedValue({
      status: 200,
      data: { data: {}, success: true },
    });
    AiService.autoResolve.mockResolvedValue({});

    // Act: Render component and trigger AI auto-assign
    render(<AIAssistant />);

    await waitFor(() => expect(AiService.getOptions).toHaveBeenCalledTimes(1));

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /runAIAutoAssign/i }));

    // Assert: Verify autoResolve was called with correct params
    expect(AiService.autoResolve).toHaveBeenCalledWith({
      semesterId: "sem-1",
      majorId: null,
    });
    expect(AiService.autoAssignTeams).not.toHaveBeenCalled();
    expect(AiService.autoAssignTopic).not.toHaveBeenCalled();

    await waitFor(() => expect(AiService.getOptions).toHaveBeenCalledTimes(2));
  });

  test("UTC06 [B] Run analysis (missingTopics) => Calls autoAssignTopic then refresh", async () => {
    // Arrange: Setup component for missing topics analysis
    const AIAssistant = (
      await import("../../../src/pages/moderator/AIAssistant")
    ).default;
    const { AiService } = await import("../../../src/services/ai.service");

    AiService.getOptions
      .mockResolvedValueOnce({
        status: 200,
        data: {
          data: {
            semesterId: "sem-1",
            groupsWithoutTopic: { items: [] },
            studentsWithoutGroup: { items: [] },
            groupsNeedingMembers: { items: [] },
          },
          success: true,
        },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: {
          data: {
            semesterId: "sem-1",
            groupsWithoutTopic: { items: [] },
            studentsWithoutGroup: { items: [] },
            groupsNeedingMembers: { items: [] },
          },
          success: true,
        },
      });

    AiService.getSummary.mockResolvedValue({
      status: 200,
      data: { data: {}, success: true },
    });
    AiService.autoAssignTopic.mockResolvedValue({});

    // Act: Render, switch to missing topics mode, and run analysis
    render(<AIAssistant />);
    await waitFor(() => expect(AiService.getOptions).toHaveBeenCalledTimes(1));

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("mode"), "missingTopics");
    await user.click(screen.getByRole("button", { name: /runAnalysis/i }));

    // Assert: Verify autoAssignTopic was called (limitPerGroup is component default)
    expect(AiService.autoAssignTopic).toHaveBeenCalledWith(
      expect.objectContaining({
        groupId: null,
        majorId: null,
      })
    );
    expect(AiService.autoAssignTeams).not.toHaveBeenCalled();
    expect(AiService.autoResolve).not.toHaveBeenCalled();

    await waitFor(() => expect(AiService.getOptions).toHaveBeenCalledTimes(2));
  });

  test("UTC07 [A] Run analysis error => Shows notification error", async () => {
    // Arrange: Setup component with failing autoAssignTeams service
    const AIAssistant = (
      await import("../../../src/pages/moderator/AIAssistant")
    ).default;
    const { AiService } = await import("../../../src/services/ai.service");
    const { notification } = await import("antd");

    AiService.getOptions.mockResolvedValue({
      status: 200,
      data: {
        data: {
          semesterId: "sem-1",
          groupsWithoutTopic: { items: [] },
          studentsWithoutGroup: { items: [] },
          groupsNeedingMembers: { items: [] },
        },
        success: true,
      },
    });
    AiService.getSummary.mockResolvedValue({
      status: 200,
      data: { data: {}, success: true },
    });
    AiService.autoAssignTeams.mockRejectedValue(new Error("Analysis failed"));

    const consoleErrorSpy = setupConsoleErrorSpy();

    // Act: Render and trigger analysis that will fail
    render(<AIAssistant />);
    await waitFor(() => expect(AiService.getOptions).toHaveBeenCalledTimes(1));

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /runAnalysis/i }));

    // Assert: Verify error notification is shown
    await waitFor(() => {
      expect(notification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "error",
        })
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test("UTC08 [A] Run AI auto-assign error => Shows notification error", async () => {
    // Arrange: Setup component with failing autoResolve service
    const AIAssistant = (
      await import("../../../src/pages/moderator/AIAssistant")
    ).default;
    const { AiService } = await import("../../../src/services/ai.service");
    const { notification } = await import("antd");

    AiService.getOptions.mockResolvedValue({
      status: 200,
      data: {
        data: {
          semesterId: "sem-1",
          groupsWithoutTopic: { items: [] },
          studentsWithoutGroup: { items: [] },
          groupsNeedingMembers: { items: [] },
        },
        success: true,
      },
    });
    AiService.getSummary.mockResolvedValue({
      status: 200,
      data: { data: {}, success: true },
    });
    AiService.autoResolve.mockRejectedValue(new Error("Auto-resolve failed"));

    const consoleErrorSpy = setupConsoleErrorSpy();

    // Act: Render and trigger auto-assign that will fail
    render(<AIAssistant />);
    await waitFor(() => expect(AiService.getOptions).toHaveBeenCalledTimes(1));

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /runAIAutoAssign/i }));

    // Assert: Verify error notification is shown
    await waitFor(() => {
      expect(notification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "error",
        })
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test("UTC09 [N] Status tag rendering => noTopic, noGroup, missingMembers labels appear", async () => {
    // Arrange: Setup component with all types of issues
    const AIAssistant = (
      await import("../../../src/pages/moderator/AIAssistant")
    ).default;
    const { AiService } = await import("../../../src/services/ai.service");

    AiService.getOptions.mockResolvedValue({
      status: 200,
      data: {
        data: {
          semesterId: "sem-1",
          groupsWithoutTopic: {
            items: [
              {
                name: "Group No Topic",
                groupId: "g0",
                suggestions: [],
              },
            ],
          },
          studentsWithoutGroup: {
            items: [
              {
                displayName: "Student A",
                studentId: "s1",
                suggestedGroup: { name: "Group X", groupId: "g1", reason: "" },
              },
            ],
          },
          groupsNeedingMembers: {
            items: [
              {
                name: "Group Need Members",
                groupId: "g2",
                currentMembers: 2,
                maxMembers: 5,
                suggestedMembers: [],
              },
            ],
          },
        },
        success: true,
      },
    });
    AiService.getSummary.mockResolvedValue({
      status: 200,
      data: { data: {}, success: true },
    });

    // Act: Render component in default mode
    render(<AIAssistant />);

    expect(
      await screen.findByRole("heading", { name: /aiAssistant/i })
    ).toBeInTheDocument();

    // Assert: Verify status tags in groupsAndMembers mode
    expect(screen.getAllByText(/noGroup/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/missingMembers/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/\(2\/5\)/i)).toBeInTheDocument();

    // Act: Switch to missing topics mode
    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("mode"), "missingTopics");

    // Assert: Verify noTopic status tag appears
    expect(screen.getByText(/noTopic/i)).toBeInTheDocument();
  });
});
