/**
UTC01 N Load majors and select => Renders options and notifies change
- Pre: MajorService.getMajors resolves with list
- Condition: render FilterSidebar and select first major
- Confirmation: option text shown; onFilterChange called with major id

UTC02 B Default all major => Emits initial filter all
- Pre: MajorService.getMajors resolves empty array
- Condition: render FilterSidebar
- Confirmation: onFilterChange called with {major:"all"} once; only All option present

UTC03 A Fetch majors error => Shows error notification
- Pre: MajorService.getMajors rejects
- Condition: render component
- Confirmation: notification.error called; onFilterChange still receives all

UTC04 B Change back to all => Updates filter to all when selecting radio
- Pre: MajorService.getMajors resolves with list
- Condition: select major then select all
- Confirmation: onFilterChange called with major id then "all" in order
*/

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import FilterSidebar from "../../src/components/common/discover/FilterSidebar";

const mockNotificationError = jest.fn();
jest.mock("antd", () => ({
  notification: { error: (...args) => mockNotificationError(...args) },
}));

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

const mockGetMajors = jest.fn();
jest.mock("../../src/services/major.service", () => ({
  MajorService: { getMajors: (...args) => mockGetMajors(...args) },
}));

describe("FilterSidebar Report5", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderSidebar = async (onFilterChange = jest.fn()) => {
    render(<FilterSidebar onFilterChange={onFilterChange} />);
    await waitFor(() => expect(mockGetMajors).toHaveBeenCalled());
    return { onFilterChange };
  };

  test("UTC01 [N] Load majors and select => Renders options and notifies change", async () => {
    mockGetMajors.mockResolvedValue({ data: [{ id: "m1", name: "CS" }] });
    const { onFilterChange } = await renderSidebar();
    expect(await screen.findByText("CS")).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByLabelText("CS"));
    await waitFor(() =>
      expect(onFilterChange).toHaveBeenCalledWith({ major: "m1" })
    );
  });

  test("UTC02 [B] Default all major => Emits initial filter all", async () => {
    mockGetMajors.mockResolvedValue({ data: [] });
    const onFilterChange = jest.fn();
    await renderSidebar(onFilterChange);
    await waitFor(() =>
      expect(onFilterChange).toHaveBeenCalledWith({ major: "all" })
    );
    expect(screen.getAllByLabelText(/allMajors/i).length).toBe(1);
  });

  test("UTC03 [A] Fetch majors error => Shows error notification", async () => {
    mockGetMajors.mockRejectedValueOnce(new Error("fail"));
    const onFilterChange = jest.fn();
    await renderSidebar(onFilterChange);
    await waitFor(() => expect(mockNotificationError).toHaveBeenCalled());
    expect(onFilterChange).toHaveBeenCalledWith({ major: "all" });
  });

  test("UTC04 [B] Change back to all => Updates filter to all when selecting radio", async () => {
    mockGetMajors.mockResolvedValue({ data: [{ id: "m1", name: "CS" }] });
    const onFilterChange = jest.fn();
    await renderSidebar(onFilterChange);
    const user = userEvent.setup();
    await user.click(screen.getByLabelText("CS"));
    await user.click(screen.getByLabelText(/allMajors/i));
    expect(onFilterChange).toHaveBeenNthCalledWith(1, { major: "all" });
    expect(onFilterChange).toHaveBeenCalledWith({ major: "m1" });
    expect(onFilterChange).toHaveBeenLastCalledWith({ major: "all" });
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "FilterSidebar",
  totalTC: 4,
  breakdown: { N: 1, B: 2, A: 1 },
  notes:
    "Covers majors load success/empty/error, ensures filter change emits all by default, selection changes propagate radio choices and error notification on fetch failure.",
};
