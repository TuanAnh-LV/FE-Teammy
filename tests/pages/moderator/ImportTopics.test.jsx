import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";

jest.mock("../../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("antd", () => {
  const Steps = ({ current, items }) => (
    <div>
      <div data-testid="steps-current">{current}</div>
      <ul>
        {items.map((it) => (
          <li key={it.title}>
            {it.title}:{it.status}
          </li>
        ))}
      </ul>
    </div>
  );

  const Button = ({ children, icon, ...props }) => (
    <button type="button" {...props}>
      {children || icon || "button"}
    </button>
  );

  return { Steps, Button };
});

jest.mock("../../../src/components/moderator/import/ImportStep1UploadTopic", () => (props) => (
  <div>
    <div data-testid="step1">step1</div>
    <button
      type="button"
      onClick={() => {
        props.setRawData(["row1"]);
        props.setUploadedTopics([{ topicName: "T1" }]);
        props.setValidationResult({ ok: true });
        props.setOriginalFile({ name: "file.xlsx" });
        props.setCurrentStep(1);
      }}
    >
      next
    </button>
  </div>
));

jest.mock("../../../src/components/moderator/import/ImportStep3PreviewTopic", () => (props) => (
  <div>
    <div data-testid="step3">preview:{props.uploadedTopics?.length || 0}</div>
    <button
      type="button"
      onClick={() => {
        props.setMappedTopics([{ topicName: "T1", status: "valid" }]);
        props.setCurrentStep(2);
      }}
    >
      next
    </button>
  </div>
));

jest.mock("../../../src/components/moderator/import/ImportStep4ResultTopic", () => (props) => (
  <div>
    <div data-testid="step4">result:{props.mappedTopics?.length || 0}</div>
    <button type="button" onClick={() => props.setCurrentStep(0)}>
      restart
    </button>
  </div>
));

describe("ImportTopics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockReset();
  });

  test("UTC01 [N] Render initial => Shows step1 and steps statuses", async () => {
    const ImportTopics = (await import("../../../src/pages/moderator/ImportTopics")).default;

    render(<ImportTopics />);

    expect(screen.getByText(/importTopics/i)).toBeInTheDocument();
    expect(screen.getByTestId("step1")).toBeInTheDocument();

    expect(screen.getByText(/uploadFile:process/i)).toBeInTheDocument();
    expect(screen.getByText(/review:wait/i)).toBeInTheDocument();
    expect(screen.getByText(/import:wait/i)).toBeInTheDocument();
  });

  test("UTC02 [B] Step flow => Upload -> Preview -> Result -> Restart", async () => {
    const ImportTopics = (await import("../../../src/pages/moderator/ImportTopics")).default;

    render(<ImportTopics />);

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByTestId("step3")).toHaveTextContent("preview:1");
    expect(screen.getByText(/uploadFile:finish/i)).toBeInTheDocument();
    expect(screen.getByText(/review:process/i)).toBeInTheDocument();
    expect(screen.getByText(/import:wait/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByTestId("step4")).toHaveTextContent("result:1");
    expect(screen.getByText(/uploadFile:finish/i)).toBeInTheDocument();
    expect(screen.getByText(/review:finish/i)).toBeInTheDocument();
    expect(screen.getByText(/import:process/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /restart/i }));
    expect(screen.getByTestId("step1")).toBeInTheDocument();
    expect(screen.getByText(/uploadFile:process/i)).toBeInTheDocument();
    expect(screen.getByText(/review:wait/i)).toBeInTheDocument();
    expect(screen.getByText(/import:wait/i)).toBeInTheDocument();
  });

  test("UTC03 [B] Back button => Navigates to moderator topic", async () => {
    const ImportTopics = (await import("../../../src/pages/moderator/ImportTopics")).default;

    render(<ImportTopics />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /backToTopics/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/moderator/topic");
  });
});
