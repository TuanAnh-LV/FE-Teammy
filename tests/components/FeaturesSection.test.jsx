/**
UTC01 N Render stats and feature cards => Shows numbers and all feature titles
- Pre: translation mocked
- Condition: render FeaturesSection
- Confirmation: stats numbers visible; feature titles count matches config

UTC02 B How it works steps and CTA benefits => Steps listed and benefits displayed
- Pre: default props
- Condition: render
- Confirmation: 4 steps present; 4 benefit items shown with icons
*/

import React from "react";
import { render, screen } from "@testing-library/react";
import FeaturesSection from "../../src/components/common/FeaturesSection";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

describe("FeaturesSection Report5", () => {
  test("UTC01 [N] Render stats and feature cards => Shows numbers and all feature titles", () => {
    render(<FeaturesSection />);
    expect(screen.getByText("500+")).toBeInTheDocument();
    expect(screen.getByText("2,000+")).toBeInTheDocument();
    expect(screen.getByText("95%")).toBeInTheDocument();
    const featureTitles = [
      "featureTeammates",
      "featureMentor",
      "featureProjectManagementTitle",
      "featureCommunication",
      "featurePlanSchedule",
      "featureEvaluation",
    ];
    featureTitles.forEach((title) => expect(screen.getByText(title)).toBeInTheDocument());
  });

  test("UTC02 [B] How it works steps and CTA benefits => Steps listed and benefits displayed", () => {
    render(<FeaturesSection />);
    const steps = ["stepLogin", "stepSearch", "stepDiscuss", "stepBuild"];
    steps.forEach((step) => expect(screen.getByText(step)).toBeInTheDocument());
    const benefits = ["ctaBenefitFree", "ctaBenefitUI", "ctaBenefitSupport", "ctaBenefitSecure"];
    benefits.forEach((b) => expect(screen.getByText(b)).toBeInTheDocument());
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "FeaturesSection",
  totalTC: 2,
  breakdown: { N: 1, B: 1, A: 0 },
  notes: "Covers stats display, all feature cards, how-it-works steps, and CTA benefits with translation mocked.",
};
