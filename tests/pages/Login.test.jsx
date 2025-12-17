/**
 * MODULE: Authentication (Common)
 * FEATURE: User login with Google OAuth
 * 
 * TEST REQUIREMENTS:
 * TR-AUTH-001: System shall provide Google authentication
 * TR-AUTH-002: System shall handle successful login and token storage
 * TR-AUTH-003: System shall redirect users based on role after login
 * TR-AUTH-004: System shall handle authentication errors
 * TR-AUTH-005: System shall display loading state during authentication
 * 
 * Test Code: FE-TM-Page-Login
 * Test Name: Login Page Test
 * Author: Test Suite
 * Date: 2024
 * Compliance: Follows MessagesPage.test.jsx standards
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

jest.mock("../../src/config/firebase.config", () => ({
  auth: {},
  provider: {},
}));

jest.mock("antd", () => ({
  ...jest.requireActual("antd"),
  notification: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("Login Page", () => {
  const { notification } = require("antd");
  const mockNavigate = jest.fn();
  const mockLoginGoogle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Firebase signInWithPopup
    signInWithPopup.mockResolvedValue({
      user: { getIdToken: jest.fn().mockResolvedValue("mock-token") }
    });
    
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

  test("UTC01 [N] Initial page render => Shows branding and Google button", () => {
    // Pre-condition: User not authenticated
    renderLogin();

    // Positive assertions
    expect(screen.getByText("Teammy")).toBeInTheDocument();
    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
    
    // Negative assertions
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("UTC02 [N] Click Google login as student => Navigates to home", async () => {
    // Pre-condition: Mock successful auth
    mockLoginGoogle.mockResolvedValue({ role: "student" });

    renderLogin();

    // Action: Click Google button
    const googleButton = screen.getByText(/Continue with Google/i);
    await act(async () => {
      googleButton.click();
    });

    // Positive assertions - UI result
    await waitFor(() => {
      expect(notification.success).toHaveBeenCalledWith({
        message: "signedInWithGoogle",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
    
    // Negative assertions
    expect(notification.error).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalledWith("/admin/dashboard");
  });

  test.each([
    ["admin", "/admin/dashboard"],
    ["mentor", "/mentor/dashboard"],
    ["moderator", "/moderator/dashboard"],
  ])("UTC03 [N] Login as %s role => Navigates to %s", async (role, expectedRoute) => {
    // Pre-condition: Mock successful auth with specific role
    mockLoginGoogle.mockResolvedValue({ role });

    renderLogin();

    // Action: Click Google button
    const googleButton = screen.getByText(/Continue with Google/i);
    await act(async () => {
      googleButton.click();
    });

    // Positive assertions
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(expectedRoute);
      expect(notification.success).toHaveBeenCalled();
    });
    
    // Negative assertions
    expect(notification.error).not.toHaveBeenCalled();
  });

  test.each([
    ["student", "/"],
    ["admin", "/admin/dashboard"],
    ["mentor", "/mentor/dashboard"],
    ["moderator", "/moderator/group"],
  ])("UTC04 [N] Already authenticated as %s => Auto redirects to %s", (role, expectedRoute) => {
    // Pre-condition: User already has token
    renderLogin({
      token: "existing-token",
      userInfo: { role },
      role,
    });

    // Positive assertions - Should redirect immediately
    expect(mockNavigate).toHaveBeenCalledWith(expectedRoute, { replace: true });
    
    // Negative assertions - No login button click needed
    expect(mockLoginGoogle).not.toHaveBeenCalled();
  });

  test("UTC05 [A] Google login fails => Shows error notification", async () => {
    // Pre-condition: Mock auth failure
    mockLoginGoogle.mockRejectedValue(new Error("Auth failed"));

    renderLogin();

    // Action: Click Google button
    const googleButton = screen.getByText(/Continue with Google/i);
    await act(async () => {
      googleButton.click();
    });

    // Positive assertions - Error handling
    await waitFor(() => {
      expect(notification.error).toHaveBeenCalledWith({
        message: "signInFailed",
        description: "Auth failed",
      });
    });
    
    // Negative assertions
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(notification.success).not.toHaveBeenCalled();
  });

  test("UTC06 [N] Login with ROLE_ prefix => Navigates correctly", async () => {
    // Pre-condition: Backend returns role with ROLE_ prefix
    mockLoginGoogle.mockResolvedValue({ role: "ROLE_ADMIN" });

    renderLogin();

    // Action: Click Google button
    const googleButton = screen.getByText(/Continue with Google/i);
    await act(async () => {
      googleButton.click();
    });

    // Positive assertions - Should handle prefix
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
    });
    
    // Negative assertions
    expect(notification.error).not.toHaveBeenCalled();
  });

  test("UTC07 [N] Login with role array => Uses first role", async () => {
    // Pre-condition: Backend returns multiple roles
    mockLoginGoogle.mockResolvedValue({ role: ["mentor", "admin"] });

    renderLogin();

    // Action: Click Google button
    const googleButton = screen.getByText(/Continue with Google/i);
    await act(async () => {
      googleButton.click();
    });

    // Positive assertions - Should use first role
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/mentor/dashboard");
    });
    
    // Negative assertions
    expect(mockNavigate).not.toHaveBeenCalledWith("/admin/dashboard");
  });

  test("UTC08 [B] Click login during loading => Button disabled prevents duplicate", async () => {
    // Pre-condition: Make login slow to test loading state
    mockLoginGoogle.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ role: "student" }), 100))
    );

    renderLogin();

    const googleButton = screen.getByText(/Continue with Google/i);
    
    // Action: Click button
    await act(async () => {
      googleButton.click();
    });

    // Positive assertions - Loading state
    await waitFor(() => {
      expect(screen.getByText(/Signing in.../i)).toBeInTheDocument();
    });

    const disabledButton = screen.getByText(/Signing in.../i).closest('button');
    expect(disabledButton).toBeDisabled();

    // Wait for completion
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });

    // Negative assertions - Should prevent multiple calls
    expect(mockLoginGoogle).toHaveBeenCalledTimes(1);
  });

  test("UTC09 [N] Render campus selector => Shows FU-Hòa Lạc option", () => {
    // Pre-condition: User on login page
    renderLogin();

    // Positive assertions - Campus selector visible
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
    expect(screen.getByText(/FU-Hòa Lạc/i)).toBeInTheDocument();
    
    // Negative assertions
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("UTC10 [B] Authenticated with role array format => Redirects correctly", () => {
    // Pre-condition: User has token with role array
    renderLogin({
      token: "token",
      role: ["ROLE_STUDENT"],
    });

    // Positive assertions - Should redirect with replace
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    
    // Negative assertions
    expect(mockLoginGoogle).not.toHaveBeenCalled();
  });
});
