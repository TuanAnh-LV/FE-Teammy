/**
UTC01 N Render hero copy => Shows heading, description, stats, and primary link
- Pre: translation mocked
- Condition: render HeroSection
- Confirmation: heading/description text visible; primary link points to /forum; stats labels rendered

UTC02 B Secondary actions and image => See how it works link and hero image alt
- Pre: default props
- Condition: render
- Confirmation: "See How It Works" link present; img with alt text exists (may be hidden via class)
*/

import React from "react";
import { render, screen } from "@testing-library/react";
import HeroSection from "../../src/components/common/HeroSection";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

jest.mock("react-router-dom", () => ({
  Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a>,
}));

jest.mock("../../src/assets/banner.png", () => "hero.png");

describe("HeroSection Report5", () => {
  test("UTC01 [N] Render hero copy => Shows heading, description, stats, and primary link", () => {
    render(<HeroSection />);
    expect(screen.getByText(/heroBuildYourFuture/i)).toBeInTheDocument();
    expect(screen.getByText(/heroDescription/i)).toBeInTheDocument();
    expect(screen.getByText(/startMatching/i).closest("a")).toHaveAttribute("href", "/forum");
    expect(screen.getByText(/hero1000Students/i)).toBeInTheDocument();
    expect(screen.getByText(/hero50Mentors/i)).toBeInTheDocument();
    expect(screen.getByText(/hero300Projects/i)).toBeInTheDocument();
  });

  test("UTC02 [B] Secondary actions and image => See how it works link and hero image alt", () => {
    render(<HeroSection />);
    expect(screen.getByText(/seeHowItWorks/i)).toHaveAttribute("href", "/how-it-works");
    expect(screen.getByAltText(/Students collaborating/i)).toBeInTheDocument();
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "HeroSection",
  totalTC: 2,
  breakdown: { N: 1, B: 1, A: 0 },
  notes: "Validates headline/description/statistics and presence of primary/secondary actions plus hero image.",
};
