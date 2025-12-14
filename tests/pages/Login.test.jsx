/**
 * Test Code: FE-TM-Page-Login
 * Test Name: Login Page Test
 * Description: Test Login page with Google authentication
 * Author: Test Suite
 * Date: 2024
 */

import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../../src/pages/common/Login";
import { useAuth } from "../../src/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../src/hook/useTranslation";
import { signInWithPopup } from "firebase/auth";

// Mock dependencies
jest.mock("../../src/context/AuthContext");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));
jest.mock("../../src/hook/useTranslation");
jest.mock("firebase/auth");

jest.mock("antd", () => ({
  ...jest.requireActual("antd"),
  notification: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../../src/config/firebase.config", () => ({
  auth: {},
  provider: {},
}));

describe("Login Page", () => {
  const { notification } = require("antd");
  const mockNavigate = jest.fn();
  const mockLoginGoogle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useTranslation.mockReturnValue({
      t: (key) => key,
    });
    useAuth.mockReturnValue({
      loginGoogle: mockLoginGoogle,
      token: null,
      userInfo: null,
      role: null,
    });
  });

  const renderLogin = (authOverrides = {}) => {
    useAuth.mockReturnValue({
      loginGoogle: mockLoginGoogle,
      token: null,
      userInfo: null,
      role: null,
      ...authOverrides,
    });

    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  /**
   * Test Case UTC01
   * Type: Normal
   * Description: Renders login page with Google sign-in button
   */
  it("UTC01 - should render login page with Google button", () => {
    renderLogin();

    expect(screen.getByText("Teammy")).toBeInTheDocument();
    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
  });

  /**
   * Test Case UTC02
   * Type: Normal
   * Description: Handles successful Google login for student
   */
  it("UTC02 - should handle successful Google login for student", async () => {
    const mockUser = {
      getIdToken: jest.fn().mockResolvedValue("mock-id-token"),
    };
    signInWithPopup.mockResolvedValue({ user: mockUser });
    mockLoginGoogle.mockResolvedValue({ role: "student" });

    renderLogin();

    const googleButton = screen.getByText(/Continue with Google/i);
    
    await act(async () => {
      googleButton.click();
    });

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
      expect(mockLoginGoogle).toHaveBeenCalledWith("mock-id-token");
      expect(notification.success).toHaveBeenCalledWith({
        message: "signedInWithGoogle",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  /**
   * Test Case UTC03
   * Type: Normal
   * Description: Handles successful Google login for admin
   */
  it("UTC03 - should navigate to admin dashboard for admin role", async () => {
    const mockUser = {
      getIdToken: jest.fn().mockResolvedValue("mock-id-token"),
    };
    signInWithPopup.mockResolvedValue({ user: mockUser });
    mockLoginGoogle.mockResolvedValue({ role: "admin" });

    renderLogin();

    const googleButton = screen.getByText(/Continue with Google/i);
    
    await act(async () => {
      googleButton.click();
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  /**
   * Test Case UTC04
   * Type: Normal
   * Description: Handles successful Google login for mentor
   */
  it("UTC04 - should navigate to mentor dashboard for mentor role", async () => {
    const mockUser = {
      getIdToken: jest.fn().mockResolvedValue("mock-id-token"),
    };
    signInWithPopup.mockResolvedValue({ user: mockUser });
    mockLoginGoogle.mockResolvedValue({ role: "mentor" });

    renderLogin();

    const googleButton = screen.getByText(/Continue with Google/i);
    
    await act(async () => {
      googleButton.click();
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/mentor/dashboard");
    });
  });

  /**
   * Test Case UTC05
   * Type: Normal
   * Description: Handles successful Google login for moderator
   */
  it("UTC05 - should navigate to moderator dashboard for moderator role", async () => {
    const mockUser = {
      getIdToken: jest.fn().mockResolvedValue("mock-id-token"),
    };
    signInWithPopup.mockResolvedValue({ user: mockUser });
    mockLoginGoogle.mockResolvedValue({ role: "moderator" });

    renderLogin();

    const googleButton = screen.getByText(/Continue with Google/i);
    
    await act(async () => {
      googleButton.click();
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/moderator/dashboard");
    });
  });

  /**
   * Test Case UTC06
   * Type: Normal
   * Description: Redirects authenticated student to home
   */
  it("UTC06 - should redirect authenticated student to home", () => {
    renderLogin({
      token: "existing-token",
      userInfo: { role: "student" },
      role: "student",
    });

    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  /**
   * Test Case UTC07
   * Type: Normal
   * Description: Redirects authenticated admin to admin dashboard
   */
  it("UTC07 - should redirect authenticated admin to dashboard", () => {
    renderLogin({
      token: "existing-token",
      userInfo: { role: "admin" },
      role: "admin",
    });

    expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard", { replace: true });
  });

  /**
   * Test Case UTC08
   * Type: Normal
   * Description: Redirects authenticated mentor to mentor dashboard
   */
  it("UTC08 - should redirect authenticated mentor to dashboard", () => {
    renderLogin({
      token: "existing-token",
      userInfo: { role: "mentor" },
      role: "mentor",
    });

    expect(mockNavigate).toHaveBeenCalledWith("/mentor/dashboard", { replace: true });
  });

  /**
   * Test Case UTC09
   * Type: Normal
   * Description: Redirects authenticated moderator to moderator group page
   */
  it("UTC09 - should redirect authenticated moderator to group page", () => {
    renderLogin({
      token: "existing-token",
      userInfo: { role: "moderator" },
      role: "moderator",
    });

    expect(mockNavigate).toHaveBeenCalledWith("/moderator/group", { replace: true });
  });

  /**
   * Test Case UTC10
   * Type: Abnormal
   * Description: Handles Google login error
   */
  it("UTC10 - should handle Google login error", async () => {
    signInWithPopup.mockRejectedValue(new Error("Auth failed"));

    renderLogin();

    const googleButton = screen.getByText(/Continue with Google/i);
    
    await act(async () => {
      googleButton.click();
    });

    await waitFor(() => {
      expect(notification.error).toHaveBeenCalledWith({
        message: "signInFailed",
        description: "Auth failed",
      });
    });
  });

  /**
   * Test Case UTC11
   * Type: Normal
   * Description: Handles role with ROLE_ prefix
   */
  it("UTC11 - should handle role with ROLE_ prefix", async () => {
    const mockUser = {
      getIdToken: jest.fn().mockResolvedValue("mock-id-token"),
    };
    signInWithPopup.mockResolvedValue({ user: mockUser });
    mockLoginGoogle.mockResolvedValue({ role: "ROLE_ADMIN" });

    renderLogin();

    const googleButton = screen.getByText(/Continue with Google/i);
    
    await act(async () => {
      googleButton.click();
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  /**
   * Test Case UTC12
   * Type: Normal
   * Description: Handles role as array
   */
  it("UTC12 - should handle role as array", async () => {
    const mockUser = {
      getIdToken: jest.fn().mockResolvedValue("mock-id-token"),
    };
    signInWithPopup.mockResolvedValue({ user: mockUser });
    mockLoginGoogle.mockResolvedValue({ role: ["mentor", "admin"] });

    renderLogin();

    const googleButton = screen.getByText(/Continue with Google/i);
    
    await act(async () => {
      googleButton.click();
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/mentor/dashboard");
    });
  });

  /**
   * Test Case UTC13
   * Type: Boundary
   * Description: Tests that login button is disabled during loading
   */
  it("UTC13 - should prevent multiple login attempts", async () => {
    const mockUser = {
      getIdToken: jest.fn().mockResolvedValue("mock-id-token"),
    };
    
    // Make signInWithPopup slow to ensure loading state is visible
    signInWithPopup.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ user: mockUser }), 100))
    );
    mockLoginGoogle.mockResolvedValue({ role: "student" });

    renderLogin();

    const googleButton = screen.getByText(/Continue with Google/i);
    
    // First click
    await act(async () => {
      googleButton.click();
    });

    // Check button is now disabled and text changed
    await waitFor(() => {
      expect(screen.getByText(/Signing in.../i)).toBeInTheDocument();
    });

    const disabledButton = screen.getByText(/Signing in.../i).closest('button');
    expect(disabledButton).toBeDisabled();

    // Wait for completion
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });

    // Should only be called once
    expect(signInWithPopup).toHaveBeenCalledTimes(1);
  });

  /**
   * Test Case UTC14
   * Type: Normal
   * Description: Displays campus selector
   */
  it("UTC14 - should display campus selection", () => {
    renderLogin();

    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
    // Check that FU-Hòa Lạc option exists
    expect(screen.getByText(/FU-Hòa Lạc/i)).toBeInTheDocument();
  });

  /**
   * Test Case UTC15
   * Type: Normal
   * Description: Redirects with replace flag when already authenticated
   */
  it("UTC15 - should use replace navigation for authenticated users", () => {
    renderLogin({
      token: "token",
      role: ["ROLE_STUDENT"],
    });

    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });
});
