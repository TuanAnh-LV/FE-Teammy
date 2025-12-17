import { screen } from "@testing-library/react";

/**
 * Helper function to click an icon button
 * @param {Object} user - userEvent setup instance
 * @param {string} iconLabel - The aria-label of the icon
 */
export const clickIconButton = async (user, iconLabel) => {
  const icon = await screen.findByLabelText(iconLabel);
  const button = icon.closest("button");
  if (!button) throw new Error(`No button found for icon: ${iconLabel}`);
  await user.click(button);
};

/**
 * Helper function to wait for service calls to complete
 * @param {Function} mockFn - Jest mock function
 * @param {number} times - Expected call count
 */
export const waitForServiceCall = async (mockFn, times = 1) => {
  const { waitFor } = await import("@testing-library/react");
  await waitFor(() => expect(mockFn).toHaveBeenCalledTimes(times));
};

/**
 * Creates default mock response for AI service
 */
export const createDefaultAIMockResponse = () => ({
  status: 200,
  data: {
    data: {
      semesterId: "sem-1",
      groupsWithoutTopic: { items: [] },
      studentsWithoutGroup: { items: [] },
      groupsNeedingMembers: { items: [] },
    },
    success: true,
  },
});

/**
 * Creates default summary mock response
 */
export const createDefaultSummaryMock = () => ({
  status: 200,
  data: { data: {}, success: true },
});

/**
 * Setup console error spy to suppress expected errors in tests
 */
export const setupConsoleErrorSpy = () => {
  const { jest } = require("@jest/globals");
  return jest.spyOn(console, "error").mockImplementation(() => {});
};

/**
 * Common mock for useTranslation hook
 */
export const mockUseTranslation = () => ({
  useTranslation: () => ({ t: (k) => k }),
});

/**
 * Creates a mock notification object
 */
export const createMockNotification = () => {
  const { jest } = require("@jest/globals");
  return {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  };
};
