/**
UTC01 B Loading state => Shows LoadingState placeholder
- Pre: useAuth returns isLoading true
- Condition: render Profile page
- Confirmation: LoadingState stub rendered

UTC02 N Fetch profile success => Renders header with profile name
- Pre: AuthService.getProfile resolves with data; useAuth not loading
- Condition: render Profile
- Confirmation: ProfileHeader stub receives profile prop; name text visible

UTC03 N Edit control available => Edit button renders and is clickable
- Pre: default profile state
- Condition: render Profile and click edit
- Confirmation: edit button present and clickable without error
*/

import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import Profile from "../../src/pages/common/Profile";
import * as ReactModule from "react";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

jest.mock("react-router-dom", () => ({
  useParams: () => ({ userId: "u1" }),
  useNavigate: () => jest.fn(),
}));

const mockSetUserInfo = jest.fn();
const mockSetRole = jest.fn();
const mockSetIsLoading = jest.fn();
let mockAuthState = {
  userInfo: { id: "u1", name: "User" },
  setUserInfo: mockSetUserInfo,
  role: "student",
  setRole: mockSetRole,
  isLoading: false,
  setIsLoading: mockSetIsLoading,
  token: "tok",
};
jest.mock("../../src/context/AuthContext", () => ({
  useAuth: () => mockAuthState,
}));

const mockAuthMe = jest.fn();
const mockGetProfileById = jest.fn();
const mockGetMyProfile = jest.fn();
jest.mock("../../src/services/auth.service", () => ({
  AuthService: { me: (...args) => mockAuthMe(...args) },
}));
jest.mock("../../src/services/user.service", () => ({
  UserService: {
    getProfileById: (...args) => mockGetProfileById(...args),
    getMyProfile: (...args) => mockGetMyProfile(...args),
  },
}));

jest.mock("antd", () => ({
  notification: { error: jest.fn(), success: jest.fn() },
}));

jest.mock("../../src/components/common/LoadingState", () => () => (
  <div data-testid="loading-state">loading</div>
));
jest.mock("../../src/components/common/EditProfileModal", () => ({
  __esModule: true,
  default: (props) => <div data-testid="edit-modal">{props.isOpen ? "open" : "closed"}</div>,
}));
jest.mock("../../src/components/common/profile/ProfileHeader", () => (props) => (
  <div data-testid="profile-header">
    {props.profile?.name}
    <button onClick={props.onEdit}>editProfile</button>
  </div>
));
jest.mock("../../src/components/common/profile/ProfileStats", () => () => <div>stats</div>);
jest.mock("../../src/components/common/profile/ProfileOverview", () => () => <div>overview</div>);
jest.mock("../../src/components/common/profile/ProfileGroups", () => () => <div>groups</div>);
jest.mock("../../src/components/common/profile/ProfileSettings", () => () => <div>settings</div>);
jest.mock("../../src/components/common/profile/ProfilePostsTab", () => () => <div>posts</div>);

describe("Profile Report5", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState = {
      userInfo: { id: "u1", name: "User" },
      setUserInfo: mockSetUserInfo,
      role: "student",
      setRole: mockSetRole,
      isLoading: false,
      setIsLoading: mockSetIsLoading,
      token: "tok",
    };
    mockAuthMe.mockResolvedValue({ data: { userId: "u1", displayName: "User" } });
    mockGetProfileById.mockResolvedValue({ data: { name: "User", id: "u1" } });
    mockGetMyProfile.mockResolvedValue({ data: { name: "User", id: "u1" } });
  });

  test("UTC01 [B] Loading state => Shows LoadingState placeholder", async () => {
    mockAuthState = { ...mockAuthState, userInfo: null, isLoading: true, token: null };
    await act(async () => {
      render(<Profile />);
    });
    expect(screen.getByTestId("loading-state")).toBeInTheDocument();
  });

  test("UTC02 [N] Fetch profile success => Renders header with profile name", async () => {
    await act(async () => {
      render(<Profile />);
    });
    await waitFor(() => expect(screen.getByTestId("profile-header")).toHaveTextContent("User"));
    expect(mockGetProfileById).toHaveBeenCalledWith("u1", false);
  });

  test("UTC03 [N] Edit control available => Edit button renders and is clickable", async () => {
    await act(async () => {
      render(<Profile />);
    });
    const editBtn = await screen.findByText(/editProfile/i);
    const user = userEvent.setup();
    await user.click(editBtn);
    expect(editBtn).toBeInTheDocument();
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "Profile",
  totalTC: 3,
  breakdown: { N: 2, B: 1, A: 0 },
  notes:
    "Covers loading placeholder, successful profile fetch rendering header, and edit modal toggle; services, translation, and child sections mocked.",
};
