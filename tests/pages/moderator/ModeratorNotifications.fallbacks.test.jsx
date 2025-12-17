import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import ModeratorNotifications from "../../../src/pages/moderator/Notifications";

jest.mock("../../../src/hook/useTranslation", () => ({
  useTranslation: () => ({
    t: (k) => {
      // Force fallbacks to execute for these keys
      if (k === "scheduledReminderInfo") return "";
      if (k === "sentToGroup") return "";
      if (k === "pleaseSelectGroup") return "";
      return k;
    },
  }),
}));

jest.mock("antd", () => {
  const notification = {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  };

  const Card = ({ children, title }) => (
    <div>
      {title}
      {children}
    </div>
  );

  const Tag = ({ children }) => <span>{children}</span>;
  const Space = ({ children }) => <div>{children}</div>;

  const Button = ({ children, icon, ...props }) => (
    <button type="button" {...props}>
      {children || icon || "button"}
    </button>
  );

  const Select = ({ value, onChange, children, ...props }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    >
      {children}
    </select>
  );

  const Option = ({ value, children }) => <option value={value}>{children}</option>;
  Select.Option = Option;

  const Input = {
    TextArea: ({ autoSize, ...props }) => <textarea {...props} />,
  };

  const Switch = ({ checked, onChange }) => (
    <input
      type="checkbox"
      aria-label="auto-reminders"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  );

  const List = ({ dataSource, renderItem }) => (
    <div>
      {dataSource?.map((item) => (
        <div key={item.id}>{renderItem(item)}</div>
      ))}
    </div>
  );
  List.Item = ({ children }) => <div>{children}</div>;

  const Radio = ({ checked, onChange, children }) => (
    <label>
      <input type="radio" checked={checked} onChange={onChange} />
      {children}
    </label>
  );

  return {
    Card,
    Select,
    Input,
    Button,
    Switch,
    List,
    Radio,
    Tag,
    Space,
    notification,
  };
});

describe("ModeratorNotifications fallbacks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("UTC05 [A] sendNow fallback strings => Warns with default message", async () => {
    const { notification } = await import("antd");

    render(<ModeratorNotifications />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /send now/i }));

    expect(notification.warning).toHaveBeenCalledWith({
      message: "Please select a group.",
    });
  });

  test("UTC06 [B] schedule fallback string => Uses default scheduled message", async () => {
    const { notification } = await import("antd");

    render(<ModeratorNotifications />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /schedule/i }));

    expect(notification.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Scheduled reminder for tomorrow 9:00 AM (mock)",
      })
    );
  });

  test("UTC07 [B] sentToGroup fallback template => Uses default template", async () => {
    const { notification } = await import("antd");

    render(<ModeratorNotifications />);

    const user = userEvent.setup();

    // pick a group
    await user.click(screen.getByLabelText(/Gamma Force/i));

    await user.click(screen.getByRole("button", { name: /send now/i }));

    expect(notification.success).toHaveBeenCalledWith({
      message: "Sent to Gamma Force",
    });
  });
});
