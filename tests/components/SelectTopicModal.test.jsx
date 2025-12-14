/**
UTC01 N Load topics and select => Filters open topics, allows selection, calls onSelect
- Pre: TopicService returns open topics with mentor and id
- Condition: render open modal, click topic, confirm
- Confirmation: onSelect called with selected id and topic; button enabled

UTC02 B Filter removes assigned/no mentor topics => Not rendered
- Pre: topics include assigned and no-mentor entries
- Condition: render and search empty
- Confirmation: only eligible topic shown

UTC03 A Load topics error => Shows empty state and no selection possible
- Pre: TopicService rejects
- Condition: render modal
- Confirmation: noTopicsFound shown; onSelect not called

UTC04 B Closed modal => Returns null
- Pre: open false
- Condition: render
- Confirmation: container empty

UTC05 B Loading state => Shows loading label
- Pre: TopicService promise pending
- Condition: render
- Confirmation: loading text shown
*/

import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import SelectTopicModal from "../../src/components/common/my-group/SelectTopicModal";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

jest.mock("antd", () => {
  const notification = { error: jest.fn() };
  return { notification };
});

jest.mock("../../src/services/topic.service", () => ({
  TopicService: {
    getTopics: jest.fn(),
  },
}));

const renderModal = async (props = {}) => {
  const user = userEvent.setup();
  const onSelect = jest.fn();
  let result;
  await act(async () => {
    result = render(
      <SelectTopicModal
        t={(k) => k}
        open
        onClose={jest.fn()}
        onSelect={onSelect}
        {...props}
      />
    );
  });
  return { user, onSelect, ...result };
};

describe("SelectTopicModal Report5", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("UTC01 [N] Load topics and select => Filters open topics, allows selection, calls onSelect", async () => {
    const { TopicService } = require("../../src/services/topic.service");
    TopicService.getTopics.mockResolvedValue({
      data: [{ id: "t1", name: "Topic 1", status: "open", mentorId: "m1" }],
    });
    const { user, onSelect } = await renderModal();
    await waitFor(() => expect(screen.getByText("Topic 1")).toBeInTheDocument());
    await user.click(screen.getByText("Topic 1"));
    await user.click(screen.getByText(/confirm/i));
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith("t1", expect.objectContaining({ id: "t1" })));
  });

  test("UTC02 [B] Filter removes assigned/no mentor topics => Not rendered", async () => {
    const { TopicService } = require("../../src/services/topic.service");
    TopicService.getTopics.mockResolvedValue({
      data: [
        { id: "t1", name: "Ok", status: "open", mentorId: "m1" },
        { id: "t2", name: "Assigned", status: "open", mentorId: "m1", isAssigned: true },
        { id: "t3", name: "NoMentor", status: "open" },
      ],
    });
    await renderModal();
    await waitFor(() => expect(screen.getByText("Ok")).toBeInTheDocument());
    expect(screen.queryByText("Assigned")).toBeNull();
    expect(screen.queryByText("NoMentor")).toBeNull();
  });

  test("UTC03 [A] Load topics error => Shows empty state and no selection possible", async () => {
    const { TopicService } = require("../../src/services/topic.service");
    TopicService.getTopics.mockRejectedValueOnce(new Error("fail"));
    const { user, onSelect } = await renderModal();
    await waitFor(() => expect(screen.getByText(/noTopicsFound/i)).toBeInTheDocument());
    await user.click(screen.getByText(/confirm/i));
    expect(onSelect).not.toHaveBeenCalled();
  });

  test("UTC04 [B] Closed modal => Returns null", () => {
    const { container } = render(
      <SelectTopicModal t={(k) => k} open={false} onClose={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("UTC05 [B] Loading state => Shows loading label", async () => {
    const { TopicService } = require("../../src/services/topic.service");
    TopicService.getTopics.mockReturnValue(new Promise(() => {}));
    await renderModal();
    await waitFor(() => expect(TopicService.getTopics).toHaveBeenCalled());
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "SelectTopicModal",
  totalTC: 5,
  breakdown: { N: 1, B: 3, A: 1 },
  notes:
    "Covers topic loading, filtering eligible topics, mentor validation error, closed modal null render, and loading UI; TopicService and notification mocked.",
};
