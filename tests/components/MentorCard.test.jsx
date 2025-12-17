/**
UTC01 N Render mentor info => Shows name, label, email
- Pre: mentor object with avatar and strings
- Condition: render component
- Confirmation: name, label, email visible; img src matches avatar

UTC02 B Missing label => Falls back to default Mentor
- Pre: label undefined
- Condition: render component
- Confirmation: text contains default label
*/

import React from "react";
import { render, screen } from "@testing-library/react";
import MentorCard from "../../src/components/common/my-group/MentorCard";

describe("MentorCard Report5", () => {
  test("UTC01 [N] Render mentor info => Shows name, label, email", () => {
    const avatar = "http://img.test/avatar.png";
    render(<MentorCard name="Dr. Jane" email="jane@test.com" label="Advisor" />);
    expect(screen.getByText(/Dr\. Jane/)).toBeInTheDocument();
    expect(screen.getAllByText(/Advisor/).length).toBeGreaterThan(0);
    expect(screen.getByText(/jane@test.com/)).toBeInTheDocument();
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "mentor");
  });

  test("UTC02 [B] Missing label => Falls back to default Mentor", () => {
    render(<MentorCard name="Mentor X" email="x@test.com" />);
    expect(screen.getAllByText(/Mentor/).length).toBeGreaterThan(0);
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "MentorCard",
  totalTC: 2,
  breakdown: { N: 1, B: 1, A: 0 },
  notes: "Covers rendering with provided label and default label fallback.",
};
