/**
UTC01 N Render footer columns => Brand tagline and column titles/items shown
- Pre: translation mocked
- Condition: render Footer
- Confirmation: brand name and tagline visible; features/support/connect titles present

UTC02 B Link lists length => Each list renders expected item count
- Pre: default props
- Condition: render
- Confirmation: features/support/connect lists have 4 items each
*/

import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "../../src/components/common/Footer";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

describe("Footer Report5", () => {
  test("UTC01 [N] Render footer columns => Brand tagline and column titles/items shown", () => {
    render(<Footer />);
    expect(screen.getByText("Teammy.")).toBeInTheDocument();
    expect(screen.getByText("footerTagline")).toBeInTheDocument();
    expect(screen.getByText("footerFeaturesTitle")).toBeInTheDocument();
    expect(screen.getByText("footerSupportTitle")).toBeInTheDocument();
    expect(screen.getByText("footerConnectTitle")).toBeInTheDocument();
  });

  test("UTC02 [B] Link lists length => Each list renders expected item count", () => {
    render(<Footer />);
    const featureItems = ["footerFeatureFindTeammates", "footerFeatureChooseMentors", "footerFeatureProjectManagement", "footerFeatureTeamCommunication"];
    featureItems.forEach((item) => expect(screen.getByText(item)).toBeInTheDocument());
    const supportItems = ["footerSupportHelpCenter", "footerSupportGuides", "footerSupportFAQs", "footerSupportContact"];
    supportItems.forEach((item) => expect(screen.getByText(item)).toBeInTheDocument());
    const connectItems = ["footerConnectFacebook", "footerConnectLinkedIn", "footerConnectEmail", "footerConnectGithub"];
    connectItems.forEach((item) => expect(screen.getByText(item)).toBeInTheDocument());
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "Footer",
  totalTC: 2,
  breakdown: { N: 1, B: 1, A: 0 },
  notes: "Validates presence of brand info and all feature/support/connect list items with translation mocked.",
};
