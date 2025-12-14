/**
 * Test Code: FE-TM-Page-Discover
 * Test Name: Discover Page Test
 * Description: Test Discover page with topics, AI suggestions, and filters
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
    },
    Modal: function MockModal({ open, children }) {
      return open ? <div data-testid="modal">{children}</div> : null;
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
  return function MockTopicDetailModal({ open, topic, loading, onClose }) {
    return open ? (
      <div data-testid="topic-detail-modal">
        {loading ? "Loading..." : topic?.title}
        <button onClick={onClose}>Close</button>
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
  it("UTC01 - should render discover page with header", async () => {
    await renderDiscover();

    expect(screen.getByText("findProjects")).toBeInTheDocument();
    expect(screen.getByText("discoverProjects")).toBeInTheDocument();
  });

  /**
   * Test Case UTC02
   * Type: Normal
   * Description: Fetches and displays topics on mount
   */
  it("UTC02 - should fetch and display topics", async () => {
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
  it("UTC03 - should fetch membership status", async () => {
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
  it("UTC04 - should show AI suggestions for group without topic", async () => {
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
  it("UTC05 - should not show AI suggestions when group has topic", async () => {
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
  it("UTC06 - should filter topics by major", async () => {
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
  it("UTC07 - should handle topic fetch error", async () => {
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
  it("UTC08 - should handle membership fetch error", async () => {
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
  it("UTC09 - should open topic detail modal", async () => {
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
  it("UTC10 - should handle AI suggestions error gracefully", async () => {
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
  it("UTC11 - should handle empty topics list", async () => {
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
  it("UTC12 - should filter AI topics from main list", async () => {
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
  it("UTC13 - should fetch group details for user with group", async () => {
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
  it("UTC14 - should handle group detail fetch error", async () => {
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
  it("UTC15 - should show notification for AI suggestions", async () => {
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
});
