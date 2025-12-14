/**
 * Test Code: FE-TM-Page-Home
 * Test Name: Home Page Test
 * Description: Test Home page component with hero, features, and profile completion
 * Author: Test Suite
 * Date: 2024
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Home from "../../src/pages/common/Home";
import { useAuth } from "../../src/context/AuthContext";

// Mock dependencies
jest.mock("../../src/context/AuthContext");
jest.mock("../../src/components/common/HeroSection", () => {
  return function MockHeroSection() {
    return <div data-testid="hero-section">Hero Section</div>;
  };
});
jest.mock("../../src/components/common/FeaturesSection", () => {
  return function MockFeaturesSection() {
    return <div data-testid="features-section">Features Section</div>;
  };
});
jest.mock("../../src/components/common/CompleteProfileModal", () => {
  return function MockCompleteProfileModal({ isOpen, onComplete, onClose }) {
    return isOpen ? (
      <div data-testid="complete-profile-modal">
        <button onClick={() => onComplete({ skillsCompleted: true })}>
          Complete
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null;
  };
});

describe("Home Page", () => {
  const mockSetUserInfo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderHome = (authContext = {}) => {
    useAuth.mockReturnValue({
      userInfo: null,
      setUserInfo: mockSetUserInfo,
      role: "student",
      ...authContext,
    });

    return render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
  };

  /**
   * Test Case UTC01
   * Type: Normal
   * Description: Renders home page with hero and features sections
   */
  it("UTC01 - should render hero and features sections", () => {
    renderHome();

    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    expect(screen.getByTestId("features-section")).toBeInTheDocument();
  });

  /**
   * Test Case UTC02
   * Type: Normal
   * Description: Shows profile completion modal for incomplete student profile
   */
  it("UTC02 - should show complete profile modal for students with incomplete profile", async () => {
    renderHome({
      userInfo: {
        id: "user-1",
        name: "Student User",
        skillsCompleted: false,
      },
      role: "student",
    });

    await waitFor(() => {
      expect(screen.getByTestId("complete-profile-modal")).toBeInTheDocument();
    });
  });

  /**
   * Test Case UTC03
   * Type: Normal
   * Description: Does not show modal for completed profile
   */
  it("UTC03 - should not show modal for completed profile", () => {
    renderHome({
      userInfo: {
        id: "user-1",
        name: "Student User",
        skillsCompleted: true,
      },
      role: "student",
    });

    expect(
      screen.queryByTestId("complete-profile-modal")
    ).not.toBeInTheDocument();
  });

  /**
   * Test Case UTC04
   * Type: Normal
   * Description: Does not show modal for admin users
   */
  it("UTC04 - should not show modal for admin users", () => {
    renderHome({
      userInfo: {
        id: "admin-1",
        name: "Admin User",
        skillsCompleted: false,
      },
      role: "admin",
    });

    expect(
      screen.queryByTestId("complete-profile-modal")
    ).not.toBeInTheDocument();
  });

  /**
   * Test Case UTC05
   * Type: Normal
   * Description: Does not show modal for moderator users
   */
  it("UTC05 - should not show modal for moderator users", () => {
    renderHome({
      userInfo: {
        id: "mod-1",
        name: "Moderator User",
        skillsCompleted: false,
      },
      role: "moderator",
    });

    expect(
      screen.queryByTestId("complete-profile-modal")
    ).not.toBeInTheDocument();
  });

  /**
   * Test Case UTC06
   * Type: Normal
   * Description: Does not show modal for mentor users
   */
  it("UTC06 - should not show modal for mentor users", () => {
    renderHome({
      userInfo: {
        id: "mentor-1",
        name: "Mentor User",
        skillsCompleted: false,
      },
      role: "mentor",
    });

    expect(
      screen.queryByTestId("complete-profile-modal")
    ).not.toBeInTheDocument();
  });

  /**
   * Test Case UTC07
   * Type: Normal
   * Description: Handles profile completion
   */
  it("UTC07 - should handle profile completion", async () => {
    renderHome({
      userInfo: {
        id: "user-1",
        name: "Student User",
        skillsCompleted: false,
      },
      role: "student",
    });

    await waitFor(() => {
      expect(screen.getByTestId("complete-profile-modal")).toBeInTheDocument();
    });

    const completeButton = screen.getByText("Complete");
    completeButton.click();

    expect(mockSetUserInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        skillsCompleted: true,
      })
    );
  });

  /**
   * Test Case UTC08
   * Type: Normal
   * Description: Handles modal close
   */
  it("UTC08 - should close modal when close button clicked", async () => {
    renderHome({
      userInfo: {
        id: "user-1",
        name: "Student User",
        skillsCompleted: false,
      },
      role: "student",
    });

    await waitFor(() => {
      expect(screen.getByTestId("complete-profile-modal")).toBeInTheDocument();
    });

    const closeButton = screen.getByText("Close");
    closeButton.click();

    await waitFor(() => {
      expect(
        screen.queryByTestId("complete-profile-modal")
      ).not.toBeInTheDocument();
    });
  });

  /**
   * Test Case UTC09
   * Type: Boundary
   * Description: Handles null userInfo
   */
  it("UTC09 - should handle null userInfo gracefully", () => {
    renderHome({
      userInfo: null,
      role: "student",
    });

    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    expect(
      screen.queryByTestId("complete-profile-modal")
    ).not.toBeInTheDocument();
  });

  /**
   * Test Case UTC10
   * Type: Normal
   * Description: Handles case-insensitive role check
   */
  it("UTC10 - should handle uppercase role names", () => {
    renderHome({
      userInfo: {
        id: "admin-1",
        name: "Admin User",
        skillsCompleted: false,
      },
      role: "ADMIN",
    });

    expect(
      screen.queryByTestId("complete-profile-modal")
    ).not.toBeInTheDocument();
  });
});
