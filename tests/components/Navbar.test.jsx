/**
UTC01 N Logged out view => Shows sign in and navigates to /login
- Pre: useAuth returns no user/token
- Condition: render and click sign in button
- Confirmation: navigate called with /login; language toggle visible

UTC02 N Logged in dropdown => Toggles menu and triggers logout
- Pre: useAuth returns user and role admin
- Condition: click avatar to open menu then click logout
- Confirmation: email/name visible; logout called; navigate("/") called

UTC03 B Notifications badge from pending invites => Bell shows count
- Pre: pendingInvitations has one item; token present
- Condition: render logged-in navbar
- Confirmation: badge with "1" appears

UTC04 B Mobile menu toggle => Opens links
- Pre: logged out state
- Condition: click mobile menu button
- Confirmation: mobile links (forum/discover/my-group) shown

UTC05 N Accept invitation => onAccept calls service and dispatch remove
- Pre: useAuth logged in; onAccept from NotificationDrawer invoked with direct invite
- Condition: call captured onAccept
- Confirmation: InvitationService.accept called; dispatch removeInvitation called; notification success invoked
*/

import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import Navbar from "../../src/components/common/Navbar";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a>,
  useLocation: () => ({ pathname: "/" }),
  useNavigate: () => mockNavigate,
}));

const mockUseSelector = jest.fn();
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (fn) => mockUseSelector(fn),
  useDispatch: () => mockDispatch,
}));

jest.mock("../../src/context/LanguageContext", () => ({
  useLanguage: () => ({ language: "EN", toggleLanguage: jest.fn() }),
}));

const mockLogout = jest.fn();
const makeAuth = (overrides = {}) => ({
  logout: mockLogout,
  userInfo: null,
  token: null,
  role: "admin",
  ...overrides,
});
let mockAuthState = makeAuth();
jest.mock("../../src/context/AuthContext", () => ({
  useAuth: () => mockAuthState,
}));

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

jest.mock("../../src/hook/useInvitationRealtime", () => ({
  useInvitationRealtime: jest.fn(),
}));

const mockNotificationSuccess = jest.fn();
const mockNotificationError = jest.fn();
const mockNotificationInfo = jest.fn();
jest.mock("antd", () => ({
  notification: {
    useNotification: () => ([
      { success: mockNotificationSuccess, error: mockNotificationError, info: mockNotificationInfo },
      <div data-testid="notif-context" key="ctx" />,
    ]),
  },
}));

const lastDrawerProps = { current: null };
jest.mock("../../src/components/common/NotificationDrawer", () => (props) => {
  lastDrawerProps.current = props;
  return <div data-testid="drawer" />;
});

jest.mock("../../src/services/invitation.service", () => {
  return {
    InvitationService: {
    list: jest.fn().mockResolvedValue({ data: [] }),
    getMyProfilePostInvitations: jest.fn().mockResolvedValue({ data: [] }),
    acceptProfilePostInvitation: jest.fn().mockResolvedValue({}),
    accept: jest.fn().mockResolvedValue({}),
    decline: jest.fn().mockResolvedValue({}),
    rejectProfilePostInvitation: jest.fn().mockResolvedValue({}),
    },
  };
});

jest.mock("../../src/translations", () => ({
  getTranslation: (key) => key,
}));

describe("Navbar Report5", () => {
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "log").mockImplementation(() => {});
  const mockState = {
    invitation: {
      pendingInvitations: [],
      applications: [],
      applicationCount: 0,
    },
  };
  mockUseSelector.mockImplementation((sel) => sel(mockState));
  mockAuthState = makeAuth();
});

  const renderNavbar = async () => {
    await act(async () => {
      render(<Navbar />);
      await Promise.resolve();
    });
  };

  test("UTC01 [N] Logged out view => Shows sign in and navigates to /login", async () => {
    const user = userEvent.setup();
    await renderNavbar();
    await user.click(screen.getByText(/signIn/i));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
    expect(screen.getByText("EN")).toBeInTheDocument();
  });

  test("UTC02 [N] Logged in dropdown => Toggles menu and triggers logout", async () => {
    mockAuthState = makeAuth({ userInfo: { email: "u@test.com", name: "User" }, token: "tok" });
    const user = userEvent.setup();
    await renderNavbar();
    await user.click(screen.getByRole("img"));
    expect(screen.getByText("u@test.com")).toBeInTheDocument();
    await user.click(screen.getByText(/logout/i));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("UTC03 [B] Notifications badge from pending invites => Bell shows count", async () => {
    mockAuthState = makeAuth({ userInfo: { email: "a@b.com", id: "u1" }, token: "tok" });
    const state = {
      invitation: {
        pendingInvitations: [{ id: "i1", invitedByName: "Leader" }],
        applications: [],
        applicationCount: 0,
      },
    };
    mockUseSelector.mockImplementation((sel) => sel(state));
    await renderNavbar();
    expect(await screen.findByText("1")).toBeInTheDocument();
  });

  test("UTC04 [B] Mobile menu toggle => Opens links", async () => {
    const user = userEvent.setup();
    await renderNavbar();
    await user.click(screen.getByRole("button", { name: "" }));
    expect(screen.getAllByRole("link", { name: /forum/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /topics/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /myGroups/i })[0]).toBeInTheDocument();
  });

  test("UTC05 [N] Accept invitation => onAccept calls service and dispatch remove", async () => {
    mockAuthState = makeAuth({ userInfo: { email: "a@b.com", id: "u1" }, token: "tok" });
    await renderNavbar();
    const invite = { id: "inv1", type: "direct" };
    const { InvitationService } = require("../../src/services/invitation.service");
    await act(async () => {
      await lastDrawerProps.current.onAccept(invite);
    });
    expect(InvitationService.accept).toHaveBeenCalledWith("inv1");
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockNotificationSuccess).toHaveBeenCalled();
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "Navbar",
  totalTC: 5,
  breakdown: { N: 3, B: 2, A: 0 },
  notes:
    "Covers logged-out sign-in, logged-in dropdown/logout, notifications badge from invites, mobile menu toggle, and invitation accept invoking services/dispatch with notification success; router, auth, language, redux, services, and drawer mocked.",
};
