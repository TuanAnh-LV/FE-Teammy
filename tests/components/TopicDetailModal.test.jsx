/**
UTC01 N Render open topic => Shows fields and stays visible
- Pre: topic provided with title/domain/open status
- Condition: render TopicDetailModal open
- Confirmation: title and domain text visible; modal content rendered

UTC02 B No topic => Returns null
- Pre: topic null
- Condition: render with isOpen true
- Confirmation: nothing rendered

UTC03 N Select topic => Calls onSelectTopic then onClose
- Pre: membership leader, topic open
- Condition: click Select Topic button
- Confirmation: onSelectTopic called with topic; onClose called

UTC04 B Detail loading => Shows loading placeholder
- Pre: detailLoading true
- Condition: render modal
- Confirmation: displays loadingDetails text

UTC05 A Download attached file => handleDownload creates link and clicks
- Pre: topic has attachedFiles entry
- Condition: click its download button
- Confirmation: created anchor with href; click invoked
*/

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import TopicDetailModal from "../../src/components/common/discover/TopicDetailModal";

jest.mock("lucide-react", () => ({
  X: () => <span data-testid="x" />,
  Users: () => null,
  Calendar: () => null,
  FileText: () => null,
  Download: (props) => <span data-testid="download-icon" {...props} />,
  Sparkles: () => null,
  Award: () => null,
}));

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

jest.mock("antd", () => ({
  Modal: ({ open, children, onCancel, footer }) =>
    open ? (
      <div data-testid="modal">
        <button onClick={onCancel}>close</button>
        {children}
        {footer}
      </div>
    ) : null,
}));

const topic = {
  title: "AI Project",
  description: "Desc",
  domain: "AI",
  status: "open",
  topicSkills: ["React"],
  attachedFiles: [{ name: "file.txt", url: "http://file" }],
  referenceDocs: ["http://doc"],
};

describe("TopicDetailModal Report5", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("UTC01 [N] Render open topic => Shows fields and stays visible", () => {
    render(
      <TopicDetailModal
        isOpen
        topic={topic}
        onClose={jest.fn()}
        onSelectTopic={jest.fn()}
        membership={{ status: "leader" }}
      />
    );
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByText("AI Project")).toBeInTheDocument();
    expect(screen.getByText("AI")).toBeInTheDocument();
  });

  test("UTC02 [B] No topic => Returns null", () => {
    const { container } = render(
      <TopicDetailModal isOpen topic={null} onClose={jest.fn()} onSelectTopic={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("UTC03 [N] Select topic => Calls onSelectTopic then onClose", async () => {
    const onSelectTopic = jest.fn();
    const onClose = jest.fn();
    render(
      <TopicDetailModal
        isOpen
        topic={topic}
        onClose={onClose}
        onSelectTopic={onSelectTopic}
        membership={{ status: "leader" }}
        loading={false}
      />
    );
    const user = userEvent.setup();
    await user.click(screen.getByText("selectTopic"));
    expect(onSelectTopic).toHaveBeenCalledWith(topic);
    expect(onClose).toHaveBeenCalled();
  });

  test("UTC04 [B] Detail loading => Shows loading placeholder", () => {
    render(
      <TopicDetailModal
        isOpen
        topic={topic}
        onClose={jest.fn()}
        onSelectTopic={jest.fn()}
        membership={{ status: "leader" }}
        detailLoading
      />
    );
    expect(screen.getByText("loadingDetails")).toBeInTheDocument();
  });

  test("UTC05 [A] Download attached file => handleDownload creates link and clicks", async () => {
    const appendSpy = jest.spyOn(document.body, "appendChild");
    const removeSpy = jest.spyOn(document.body, "removeChild");
    const anchor = document.createElement("a");
    const clickSpy = jest.spyOn(anchor, "click").mockImplementation(() => {});
    const realCreate = document.createElement.bind(document);
    jest.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "a") return anchor;
      return realCreate(tag);
    });

    render(
      <TopicDetailModal
        isOpen
        topic={topic}
        onClose={jest.fn()}
        onSelectTopic={jest.fn()}
        membership={{ status: "leader" }}
      />
    );
    const downloadButton =
      screen.getByText("file.txt").closest("div")?.parentElement?.querySelector("button");
    const user = userEvent.setup();
    await user.click(downloadButton);
    expect(appendSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "TopicDetailModal",
  totalTC: 5,
  breakdown: { N: 2, B: 2, A: 1 },
  notes:
    "Validates render with topic, null topic shortcut, selection callback, loading placeholder, and download handler creating anchor for attached files.",
};
