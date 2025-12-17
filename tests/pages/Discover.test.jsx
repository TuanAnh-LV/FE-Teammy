/**
 * MODULE: Topic Discovery (Common)
 * FEATURE: Browse and discover topics with AI-powered suggestions
 * 
 * TEST REQUIREMENTS:
 * TR-DISC-001: System shall display available topics with search and filtering
 * TR-DISC-002: System shall provide AI-powered topic suggestions
 * TR-DISC-003: System shall allow users to view topic details
 * TR-DISC-004: System shall handle topic selection and group creation
 * TR-DISC-005: System shall handle API errors and loading states
 * 
 * Test Code: FE-TM-Page-Discover
 * Test Name: Discover Page Test
 * Author: Test Suite
 * Date: 2024
 */

import React from "react";
import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Discover from "../../src/pages/common/Discover";
import { useTranslation } from "../../src/hook/useTranslation";
import { TopicService } from "../../src/services/topic.service";
import { GroupService } from "../../src/services/group.service";
import { AuthService } from "../../src/services/auth.service";
import { AiService } from "../../src/services/ai.service";

// Mock dependencies
jest.mock("../../src/hook/useTranslation");
jest.mock("../../src/services/topic.service");
jest.mock("../../src/services/group.service");
jest.mock("../../src/services/auth.service");
jest.mock("../../src/services/ai.service");

jest.mock("antd", () => {
  const React = require("react");
  return {
    ...jest.requireActual("antd"),
    notification: {
      error: jest.fn(),
      info: jest.fn(),
      success: jest.fn(),
      warning: jest.fn(),
    },
    Modal: function MockModal({ open, children, onCancel, onOk, title }) {
      return open ? (
        <div data-testid="modal">
          <div data-testid="modal-title">{title}</div>
          <div>{children}</div>
          <button onClick={onCancel} data-testid="modal-cancel">Cancel</button>
          <button onClick={onOk} data-testid="modal-ok">OK</button>
        </div>
      ) : null;
    },
    Input: {
      TextArea: function MockTextArea(props) {
        return <textarea {...props} />;
      },
    },
  };
});

jest.mock("../../src/components/common/discover/FilterSidebar", () => {
  return function MockFilterSidebar({ onFilterChange }) {
    return (
      <div data-testid="filter-sidebar">
        <button onClick={() => onFilterChange({ major: "1", aiRecommended: false })}>
          Filter
        </button>
      </div>
    );
  };
});

jest.mock("../../src/components/common/discover/ProjectCard", () => {
  return function MockProjectCard({ project, onSelectTopic, onViewDetail, isAISuggestion }) {
    return (
      <div data-testid={isAISuggestion ? "ai-project-card" : "project-card"}>
        <h3>{project.title}</h3>
        <button onClick={() => onSelectTopic(project)}>Select</button>
        <button onClick={() => onViewDetail(project)}>View</button>
      </div>
    );
  };
});

jest.mock("../../src/components/common/discover/TopicDetailModal", () => {
  return function MockTopicDetailModal({ isOpen, topic, loading, onClose, onSelectTopic }) {
    return isOpen ? (
      <div data-testid="topic-detail-modal">
        {loading ? <div>Loading...</div> : <div>{topic?.title}</div>}
        <button onClick={onClose} data-testid="detail-close">Close</button>
        {onSelectTopic && (
          <button onClick={() => onSelectTopic(topic)} data-testid="detail-select">
            Select from Detail
          </button>
        )}
      </div>
    ) : null;
  };
});

describe("Discover Page", () => {
  const { notification } = require("antd");

  beforeEach(() => {
    jest.clearAllMocks();
    useTranslation.mockReturnValue({
      t: (key) => key,
    });
  });

  const mockTopics = [
    {
      topicId: "topic-1",
      title: "Topic 1",
      description: "Description 1",
      majorName: "Computer Science",
      majorId: "1",
      status: "open",
      mentors: [{ mentorName: "Mentor 1" }],
      skills: ["React", "Node.js"],
    },
    {
      topicId: "topic-2",
      title: "Topic 2",
      description: "Description 2",
      majorName: "Software Engineering",
      majorId: "2",
      status: "open",
      mentors: [{ mentorName: "Mentor 2" }],
      skills: ["Python"],
    },
  ];

  const mockAISuggestions = [
    {
      topicId: "ai-topic-1",
      title: "AI Topic 1",
      score: 95,
      detail: {
        topicId: "ai-topic-1",
        title: "AI Topic 1",
        description: "AI Description",
        majorName: "AI & ML",
        majorId: "3",
        mentors: [{ mentorName: "AI Mentor" }],
        skills: ["TensorFlow"],
      },
      matchingSkills: ["TensorFlow"],
    },
  ];

  const renderDiscover = async () => {
    AuthService.getMembership.mockResolvedValue({
      data: { hasGroup: false, groupId: null, status: null },
    });
    TopicService.getTopics.mockResolvedValue({ data: mockTopics });

    await act(async () => {
      render(
        <BrowserRouter>
          <Discover />
        </BrowserRouter>
      );
    });
  };

  /**
   * Test Case UTC01
   * Type: Normal
   * Description: Renders discover page with title and description
   */
  test("UTC01 [N] Render discover page => Shows header", async () => {
    await renderDiscover();

    expect(screen.getByText("findProjects")).toBeInTheDocument();
    expect(screen.getByText("discoverProjects")).toBeInTheDocument();
  });

  /**
   * Test Case UTC02
   * Type: Normal
   * Description: Fetches and displays topics on mount
   */
  test("UTC02 [N] Fetch topics => Displays topic list", async () => {
    await renderDiscover();

    await waitFor(() => {
      expect(TopicService.getTopics).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText("Topic 1")).toBeInTheDocument();
      expect(screen.getByText("Topic 2")).toBeInTheDocument();
    });
  });

  /**
   * Test Case UTC03
   * Type: Normal
   * Description: Fetches membership status on mount
   */
  test("UTC03 [N] Fetch membership => Calls getMembership", async () => {
    await renderDiscover();

    await waitFor(() => {
      expect(AuthService.getMembership).toHaveBeenCalled();
    });
  });

  /**
   * Test Case UTC04
   * Type: Normal
   * Description: Shows AI suggestions when user has a group without topic
   */
  test("UTC04 [N] Group without topic => Shows AI suggestions", async () => {
    AuthService.getMembership.mockResolvedValue({
      data: { hasGroup: true, groupId: "group-1", status: "active" },
    });
    GroupService.getGroupDetail.mockResolvedValue({
      data: { groupId: "group-1", topicId: null },
    });
    AiService.getTopicSuggestions.mockResolvedValue({
      success: true,
      data: { data: mockAISuggestions },
    });
    TopicService.getTopics.mockResolvedValue({ data: mockTopics });

    await act(async () => {
      render(
        <BrowserRouter>
          <Discover />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(AiService.getTopicSuggestions).toHaveBeenCalledWith({
        groupId: "group-1",
        limit: 5,
      });
    });

    await waitFor(() => {
      expect(screen.getByText("AI Topic 1")).toBeInTheDocument();
    });
  });

  /**
   * Test Case UTC05
   * Type: Normal
   * Description: Does not show AI suggestions when group has topic
   */
  test("UTC05 [N] Group with topic => No AI suggestions", async () => {
    AuthService.getMembership.mockResolvedValue({
      data: { hasGroup: true, groupId: "group-1", status: "active" },
    });
    GroupService.getGroupDetail.mockResolvedValue({
      data: { groupId: "group-1", topicId: "topic-123" },
    });
    TopicService.getTopics.mockResolvedValue({ data: mockTopics });

    await act(async () => {
      render(
        <BrowserRouter>
          <Discover />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(AiService.getTopicSuggestions).not.toHaveBeenCalled();
    });
  });

  /**
   * Test Case UTC06
   * Type: Normal
   * Description: Filters topics by major
   */
  test("UTC06 [N] Filter by major => Shows filtered topics", async () => {
    await renderDiscover();

    await waitFor(() => {
      expect(screen.getByText("Topic 1")).toBeInTheDocument();
      expect(screen.getByText("Topic 2")).toBeInTheDocument();
    });

    const filterButton = screen.getByText("Filter");
    await act(async () => {
      filterButton.click();
    });

    await waitFor(() => {
      expect(screen.getByText("Topic 1")).toBeInTheDocument();
      expect(screen.queryByText("Topic 2")).not.toBeInTheDocument();
    });
  });

  /**
   * Test Case UTC07
   * Type: Abnormal
   * Description: Handles topic fetch error
   */
  test("UTC07 [A] Topic fetch error => Shows error notification", async () => {
    AuthService.getMembership.mockResolvedValue({
      data: { hasGroup: false, groupId: null, status: null },
    });
    TopicService.getTopics.mockRejectedValue(new Error("Network error"));

    await act(async () => {
      render(
        <BrowserRouter>
          <Discover />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(notification.error).toHaveBeenCalledWith({
        message: "failedLoadTopics",
      });
    });
  });

  /**
   * Test Case UTC08
   * Type: Abnormal
   * Description: Handles membership fetch error
   */
  test("UTC08 [A] Membership fetch error => Continues without membership", async () => {
    AuthService.getMembership.mockRejectedValue({
      response: { data: { message: "Auth error" } },
    });
    TopicService.getTopics.mockResolvedValue({ data: mockTopics });

    await act(async () => {
      render(
        <BrowserRouter>
          <Discover />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(notification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "failedToFetchMembership",
          description: "Auth error",
        })
      );
    });
  });

  /**
   * Test Case UTC09
   * Type: Normal
   * Description: Opens topic detail modal
   */
  test("UTC09 [N] View detail => Opens topic detail modal", async () => {
    TopicService.getTopicDetail.mockResolvedValue({
      data: mockTopics[0],
    });
    await renderDiscover();

    await waitFor(() => {
      expect(screen.getByText("Topic 1")).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByText("View");
    await act(async () => {
      fireEvent.click(viewButtons[0]);
    });

    await waitFor(
      () => {
        expect(TopicService.getTopicDetail).toHaveBeenCalledWith("topic-1");
      },
      { timeout: 3000 }
    );
  });

  /**
   * Test Case UTC10
   * Type: Abnormal
   * Description: Handles AI suggestions fetch error gracefully
   */
  test("UTC10 [A] AI suggestions error => Handles gracefully", async () => {
    AuthService.getMembership.mockResolvedValue({
      data: { hasGroup: true, groupId: "group-1", status: "active" },
    });
    GroupService.getGroupDetail.mockResolvedValue({
      data: { groupId: "group-1", topicId: null },
    });
    AiService.getTopicSuggestions.mockRejectedValue(new Error("AI error"));
    TopicService.getTopics.mockResolvedValue({ data: mockTopics });

    await act(async () => {
      render(
        <BrowserRouter>
          <Discover />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(AiService.getTopicSuggestions).toHaveBeenCalled();
    });

    // Should still show regular topics
    await waitFor(() => {
      expect(screen.getByText("Topic 1")).toBeInTheDocument();
    });
  });

  /**
   * Test Case UTC11
   * Type: Boundary
   * Description: Handles empty topics list
   */
  test("UTC11 [B] Empty topics list => Displays no topics", async () => {
    AuthService.getMembership.mockResolvedValue({
      data: { hasGroup: false, groupId: null, status: null },
    });
    TopicService.getTopics.mockResolvedValue({ data: [] });

    await act(async () => {
      render(
        <BrowserRouter>
          <Discover />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(TopicService.getTopics).toHaveBeenCalled();
    });

    const projectCards = screen.queryAllByTestId("project-card");
    expect(projectCards).toHaveLength(0);
  });

  /**
   * Test Case UTC12
   * Type: Normal
   * Description: Filters out AI suggested topics from main list
   */
  test("UTC12 [N] AI topics in list => Filters from main list", async () => {
    AuthService.getMembership.mockResolvedValue({
      data: { hasGroup: true, groupId: "group-1", status: "active" },
    });
    GroupService.getGroupDetail.mockResolvedValue({
      data: { groupId: "group-1", topicId: null },
    });
    AiService.getTopicSuggestions.mockResolvedValue({
      success: true,
      data: {
        data: [
          {
            topicId: "topic-1", // Same as regular topic
            title: "AI Topic 1",
            score: 95,
            detail: {
              topicId: "topic-1",
              title: "AI Topic 1",
              mentors: [],
            },
          },
        ],
      },
    });
    TopicService.getTopics.mockResolvedValue({ data: mockTopics });

    await act(async () => {
      render(
        <BrowserRouter>
          <Discover />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      const aiCards = screen.getAllByTestId("ai-project-card");
      expect(aiCards).toHaveLength(1);

      // topic-1 should not appear in regular list
      const regularCards = screen.getAllByTestId("project-card");
      const topic1InRegular = regularCards.some((card) =>
        card.textContent.includes("Topic 1")
      );
      expect(topic1InRegular).toBe(false);
    });
  });

  /**
   * Test Case UTC13
   * Type: Normal
   * Description: Fetches group details when user has group
   */
  test("UTC13 [N] User with group => Fetches group details", async () => {
    AuthService.getMembership.mockResolvedValue({
      data: { hasGroup: true, groupId: "group-1", status: "active" },
    });
    GroupService.getGroupDetail.mockResolvedValue({
      data: { groupId: "group-1", groupName: "My Group", topicId: "topic-1" },
    });
    TopicService.getTopics.mockResolvedValue({ data: mockTopics });

    await act(async () => {
      render(
        <BrowserRouter>
          <Discover />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(GroupService.getGroupDetail).toHaveBeenCalledWith("group-1");
    });
  });

  /**
   * Test Case UTC14
   * Type: Abnormal
   * Description: Handles group detail fetch error
   */
  test("UTC14 [A] Group detail fetch error => Handles gracefully", async () => {
    AuthService.getMembership.mockResolvedValue({
      data: { hasGroup: true, groupId: "group-1", status: "active" },
    });
    GroupService.getGroupDetail.mockRejectedValue(new Error("Group error"));
    TopicService.getTopics.mockResolvedValue({ data: mockTopics });

    await act(async () => {
      render(
        <BrowserRouter>
          <Discover />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(GroupService.getGroupDetail).toHaveBeenCalled();
    });

    // Should still render page
    expect(screen.getByText("findProjects")).toBeInTheDocument();
  });

  /**
   * Test Case UTC15
   * Type: Normal
   * Description: Shows AI suggestions notification
   */
  test("UTC15 [N] AI suggestions available => Shows notification", async () => {
    AuthService.getMembership.mockResolvedValue({
      data: { hasGroup: true, groupId: "group-1", status: "active" },
    });
    GroupService.getGroupDetail.mockResolvedValue({
      data: { groupId: "group-1", topicId: null },
    });
    AiService.getTopicSuggestions.mockResolvedValue({
      success: true,
      data: { data: mockAISuggestions },
    });
    TopicService.getTopics.mockResolvedValue({ data: mockTopics });

    await act(async () => {
      render(
        <BrowserRouter>
          <Discover />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(notification.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "aiSuggestionsAvailable",
          description: expect.stringContaining("1 recommended topics"),
        })
      );
    });
  });

  /**
   * Test Case UTC16
   * Type: Normal
   * Description: Opens and closes invite modal successfully
   */
  test("UTC16 [N] Open invite modal => Opens and closes modal", async () => {
    AuthService.getMembership.mockResolvedValue({
      data: { hasGroup: true, groupId: "group-1", status: "leader" },
    });
    
    GroupService.getGroupDetail.mockResolvedValue({
      data: { groupId: "group-1", topicId: null },
    });
    
    TopicService.getTopics.mockResolvedValue({ data: mockTopics });
    AiService.getTopicSuggestions.mockResolvedValue({ success: false });

    await act(async () => {
      render(
        <BrowserRouter>
          <Discover />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getAllByTestId("project-card")).toHaveLength(2);
    });

    // Click select button
    const selectButtons = screen.getAllByText("Select");
    await act(async () => {
      fireEvent.click(selectButtons[0]);
    });

    // Modal should open
    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    // Close modal
    const cancelButton = screen.getByTestId("modal-cancel");
    await act(async () => {
      fireEvent.click(cancelButton);
    });

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
  });

  /**
   * Test Case UTC17
   * Type: Normal  
   * Description: Successfully assigns topic and invites mentor
   */
  test("UTC17 [N] Assign topic and invite mentor => Success notifications", async () => {
    const { notification } = require("antd");
    
    AuthService.getMembership
      .mockResolvedValueOnce({
        data: { hasGroup: true, groupId: "group-1", status: "leader" },
      })
      .mockResolvedValueOnce({
        data: { hasGroup: true, groupId: "group-1", status: "leader" },
      });
    
    GroupService.getGroupDetail.mockResolvedValue({
      data: { groupId: "group-1", topicId: null },
    });
    
    const topicWithMentor = {
      ...mockTopics[0],
      mentorsRaw: [{ mentorId: "m1", mentorName: "Mentor One" }],
      mentors: [{ mentorId: "m1", mentorName: "Mentor One" }],
    };
    
    TopicService.getTopics.mockResolvedValue({ data: [topicWithMentor] });
    GroupService.getMyGroups.mockResolvedValue({
      data: [{ id: "group-1", groupId: "group-1" }],
    });
    GroupService.assignTopic.mockResolvedValue({ success: true });
    GroupService.inviteMentor.mockResolvedValue({ success: true });
    AiService.getTopicSuggestions.mockResolvedValue({ success: false });

    await act(async () => {
      render(
        <BrowserRouter>
          <Discover />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("project-card")).toBeInTheDocument();
    });

    // Click select
    const selectButton = screen.getByText("Select");
    await act(async () => {
      fireEvent.click(selectButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    // Click OK to confirm
    const okButton = screen.getByTestId("modal-ok");
    await act(async () => {
      fireEvent.click(okButton);
    });

    await waitFor(() => {
      expect(GroupService.assignTopic).toHaveBeenCalledWith(
        "group-1",
        topicWithMentor.topicId
      );
      expect(GroupService.inviteMentor).toHaveBeenCalledWith(
        "group-1",
        expect.objectContaining({
          mentorUserId: "m1",
          topicId: topicWithMentor.topicId,
        })
      );
      expect(notification.success).toHaveBeenCalled();
    });
  });

  /**
   * Test Case UTC18
   * Type: Boundary
   * Description: Non-leader cannot assign topic
   */
  test("UTC18 [B] Non-leader user => Cannot assign topic", async () => {
    const { notification } = require("antd");
    
    AuthService.getMembership
      .mockResolvedValueOnce({
        data: { hasGroup: true, groupId: "group-1", status: "member" },
      })
      .mockResolvedValueOnce({
        data: { hasGroup: true, groupId: "group-1", status: "member" },
      });
    
    GroupService.getGroupDetail.mockResolvedValue({
      data: { groupId: "group-1", topicId: null },
    });
    
    TopicService.getTopics.mockResolvedValue({ data: mockTopics });
    AiService.getTopicSuggestions.mockResolvedValue({ success: false });

    await act(async () => {
      render(
        <BrowserRouter>
          <Discover />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getAllByTestId("project-card")).toHaveLength(2);
    });

    const selectButton = screen.getAllByText("Select")[0];
    await act(async () => {
      fireEvent.click(selectButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    const okButton = screen.getByTestId("modal-ok");
    await act(async () => {
      fireEvent.click(okButton);
    });

    await waitFor(() => {
      expect(notification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "notAuthorized",
        })
      );
      expect(GroupService.assignTopic).not.toHaveBeenCalled();
    });
  });

  /**
   * Test Case UTC19
   * Type: Boundary
   * Description: Shows warning when topic has no mentor
   */
  test("UTC19 [B] Topic has no mentor => Shows warning", async () => {
    const { notification } = require("antd");
    
    AuthService.getMembership
      .mockResolvedValueOnce({
        data: { hasGroup: true, groupId: "group-1", status: "leader" },
      })
      .mockResolvedValueOnce({
        data: { hasGroup: true, groupId: "group-1", status: "leader" },
      });
    
    GroupService.getGroupDetail.mockResolvedValue({
      data: { groupId: "group-1", topicId: null },
    });
    
    const topicNoMentor = { 
      ...mockTopics[0], 
      mentorsRaw: [],
      mentors: []
    };
    TopicService.getTopics.mockResolvedValue({ data: [topicNoMentor] });
    GroupService.getMyGroups.mockResolvedValue({
      data: [{ id: "group-1" }],
    });
    GroupService.assignTopic.mockResolvedValue({ success: true });
    AiService.getTopicSuggestions.mockResolvedValue({ success: false });

    await act(async () => {
      render(
        <BrowserRouter>
          <Discover />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("project-card")).toBeInTheDocument();
    });

    const selectButton = screen.getByText("Select");
    await act(async () => {
      fireEvent.click(selectButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    const okButton = screen.getByTestId("modal-ok");
    await act(async () => {
      fireEvent.click(okButton);
    });

    await waitFor(() => {
      expect(GroupService.assignTopic).toHaveBeenCalled();
      expect(notification.warning).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "noMentorFound",
        })
      );
      expect(GroupService.inviteMentor).not.toHaveBeenCalled();
    });
  });

  /**
   * Test Case UTC20
   * Type: Boundary
   * Description: Shows error when user has no group
   */
  test("UTC20 [B] User has no group => Shows error", async () => {
    const { notification } = require("antd");
    
    AuthService.getMembership
      .mockResolvedValueOnce({
        data: { hasGroup: false, groupId: null, status: null },
      })
      .mockResolvedValueOnce({
        data: { hasGroup: false, groupId: null, status: null },
      });
    
    TopicService.getTopics.mockResolvedValue({ data: mockTopics });
    GroupService.getMyGroups.mockResolvedValue({ data: [] });

    await act(async () => {
      render(
        <BrowserRouter>
          <Discover />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getAllByTestId("project-card")).toHaveLength(2);
    });

    const selectButton = screen.getAllByText("Select")[0];
    await act(async () => {
      fireEvent.click(selectButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    const okButton = screen.getByTestId("modal-ok");
    await act(async () => {
      fireEvent.click(okButton);
    });

    await waitFor(() => {
      expect(notification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "notAuthorized",
        })
      );
      expect(GroupService.assignTopic).not.toHaveBeenCalled();
    });
  });

  /**
   * Test Case UTC21
   * Type: Abnormal
   * Description: Handles assign topic error gracefully
   */
  test("UTC21 [A] Assign topic error => Shows error notification", async () => {
    const { notification } = require("antd");
    
    AuthService.getMembership
      .mockResolvedValueOnce({
        data: { hasGroup: true, groupId: "group-1", status: "leader" },
      })
      .mockResolvedValueOnce({
        data: { hasGroup: true, groupId: "group-1", status: "leader" },
      });
    
    GroupService.getGroupDetail.mockResolvedValue({
      data: { groupId: "group-1", topicId: null },
    });
    
    const topicWithMentor = {
      ...mockTopics[0],
      mentorsRaw: [{ mentorId: "m1" }],
    };
    
    TopicService.getTopics.mockResolvedValue({ data: [topicWithMentor] });
    GroupService.getMyGroups.mockResolvedValue({ data: [{ id: "group-1" }] });
    GroupService.assignTopic.mockRejectedValue(new Error("Failed"));
    AiService.getTopicSuggestions.mockResolvedValue({ success: false });

    await act(async () => {
      render(
        <BrowserRouter>
          <Discover />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("project-card")).toBeInTheDocument();
    });

    const selectButton = screen.getByText("Select");
    await act(async () => {
      fireEvent.click(selectButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    const okButton = screen.getByTestId("modal-ok");
    await act(async () => {
      fireEvent.click(okButton);
    });

    await waitFor(() => {
      expect(notification.error).toHaveBeenCalled();
      expect(GroupService.inviteMentor).not.toHaveBeenCalled();
    });
  });
});
