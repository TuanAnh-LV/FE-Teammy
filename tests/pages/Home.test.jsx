/**
 * MODULE: Home Page (Common)
 * FEATURE: Landing page with hero section and profile completion
 * 
 * TEST REQUIREMENTS:
 * TR-HOME-001: System shall display hero section for new users
 * TR-HOME-002: System shall display features section
 * TR-HOME-003: System shall prompt incomplete profiles to complete information
 * TR-HOME-004: System shall handle profile completion workflow
 * TR-HOME-005: System shall redirect authenticated users appropriately
 * 
 * Test Code: FE-TM-Page-Home
 * Test Name: Home Page Test
 * Author: Test Suite
 * Date: 2024
 * Compliance: Follows MessagesPage.test.jsx standards
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  test("UTC01 [N] Initial page render => Shows hero and features sections", () => {
    // Pre-condition: User visits home page
    renderHome();

    // Positive assertions
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    expect(screen.getByTestId("features-section")).toBeInTheDocument();
    
    // Negative assertions
    expect(screen.queryByTestId("complete-profile-modal")).not.toBeInTheDocument();
  });

  test("UTC02 [N] Student with incomplete profile => Shows completion modal", async () => {
    // Pre-condition: Student hasn't completed skills
    renderHome({
      userInfo: {
        id: "user-1",
        name: "Student User",
        skillsCompleted: false,
      },
      role: "student",
    });

    // Positive assertions - Modal appears
    await waitFor(() => {
      expect(screen.getByTestId("complete-profile-modal")).toBeInTheDocument();
    });
    
    // Negative assertions - Page still renders
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
  });

  test("UTC03 [B] Student with completed profile => No modal shown", () => {
    // Pre-condition: Student has completed profile
    renderHome({
      userInfo: {
        id: "user-1",
        name: "Student User",
        skillsCompleted: true,
      },
      role: "student",
    });

    // Positive assertions
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    
    // Negative assertions - Modal should not appear
    expect(screen.queryByTestId("complete-profile-modal")).not.toBeInTheDocument();
  });

  test.each([
    ["admin"],
    ["moderator"],
    ["mentor"],
  ])("UTC04 [N] Non-student role %s => No modal shown", (role) => {
    // Pre-condition: Non-student user with incomplete profile
    renderHome({
      userInfo: {
        id: "user-1",
        name: `${role} User`,
        skillsCompleted: false,
      },
      role,
    });

    // Positive assertions - Page renders normally
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    
    // Negative assertions - No modal for non-students
    expect(screen.queryByTestId("complete-profile-modal")).not.toBeInTheDocument();
  });

  test("UTC05 [N] Click Complete in modal => Updates user profile state", async () => {
    // Pre-condition: Student with incomplete profile
    const user = userEvent.setup();
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

    // Action: Click complete button
    const completeButton = screen.getByText("Complete");
    await user.click(completeButton);

    // Positive assertions - State updated
    expect(mockSetUserInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        skillsCompleted: true,
      })
    );
    
    // Negative assertions
    expect(mockSetUserInfo).toHaveBeenCalledTimes(1);
  });

  test("UTC06 [N] Click Close in modal => Modal disappears", async () => {
    // Pre-condition: Student with incomplete profile
    const user = userEvent.setup();
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

    // Action: Click close button
    const closeButton = screen.getByText("Close");
    await user.click(closeButton);

    // Positive assertions - Modal closes
    await waitFor(() => {
      expect(screen.queryByTestId("complete-profile-modal")).not.toBeInTheDocument();
    });
    
    // Negative assertions - No state update
    expect(mockSetUserInfo).not.toHaveBeenCalled();
  });

  test("UTC07 [B] Null userInfo => Renders page without modal", () => {
    // Pre-condition: User not logged in
    renderHome({
      userInfo: null,
      role: "student",
    });

    // Positive assertions - Page renders
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    
    // Negative assertions - No modal shown
    expect(screen.queryByTestId("complete-profile-modal")).not.toBeInTheDocument();
  });

  test("UTC08 [B] Uppercase role name => Handles case-insensitively", () => {
    // Pre-condition: Role in uppercase
    renderHome({
      userInfo: {
        id: "admin-1",
        name: "Admin User",
        skillsCompleted: false,
      },
      role: "ADMIN",
    });

    // Positive assertions - Page renders
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    
    // Negative assertions - No modal for uppercase ADMIN
    expect(screen.queryByTestId("complete-profile-modal")).not.toBeInTheDocument();
  });

  test("UTC09 [B] skillsCompleted undefined => No modal shown", () => {
    // Pre-condition: skillsCompleted field missing (undefined !== false)
    renderHome({
      userInfo: {
        id: "user-1",
        name: "Student User",
        // skillsCompleted is undefined
      },
      role: "student",
    });

    // Positive assertions - Page renders normally
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    
    // Negative assertions - No modal (undefined !== false)
    expect(screen.queryByTestId("complete-profile-modal")).not.toBeInTheDocument();
  });

  test("UTC10 [B] Empty role string => Shows modal for non-staff role", async () => {
    // Pre-condition: Role is empty string (not in staff list)
    renderHome({
      userInfo: {
        id: "user-1",
        name: "User",
        skillsCompleted: false,
      },
      role: "",
    });

    // Positive assertions - Modal appears (empty role not staff)
    await waitFor(() => {
      expect(screen.getByTestId("complete-profile-modal")).toBeInTheDocument();
    });
    
    // Negative assertions - Page still renders
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
  });
});
