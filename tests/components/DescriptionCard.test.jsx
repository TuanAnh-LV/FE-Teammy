/**
UTC01 N Render description text => Shows header and description
- Pre: description string provided
- Condition: render DescriptionCard
- Confirmation: description and title rendered

UTC02 B Empty description => Renders blank text node
- Pre: description empty string
- Condition: render component
- Confirmation: title still rendered; text content empty
*/

import React from "react";
import { render, screen } from "@testing-library/react";
import DescriptionCard from "../../src/components/common/my-group/DescriptionCard";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

const renderCard = (description) => render(<DescriptionCard description={description} />);

describe("DescriptionCard Report5", () => {
  test("UTC01 [N] Render description text => Shows header and description", () => {
    renderCard("Project overview");
    expect(screen.getByText(/description/i)).toBeInTheDocument();
    expect(screen.getByText("Project overview")).toBeInTheDocument();
  });

  test("UTC02 [B] Empty description => Renders blank text node", () => {
    renderCard("");
    expect(screen.getByText(/description/i)).toBeInTheDocument();
    const paragraph = screen.getByText((content, element) => element?.tagName === "P");
    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveTextContent("");
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "DescriptionCard",
  totalTC: 2,
  breakdown: { N: 1, B: 1, A: 0 },
  notes: "Covers normal render and empty description boundary with translation mocked.",
};
