import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import ModeratorNotifications from "../../../src/pages/moderator/Notifications";

jest.mock("../../../src/hook/useTranslation", () => ({
  useTranslation: () => ({
    t: (k) => {
      if (k === "sentToGroup") return "Sent to {name}";
      if (k === "pleaseSelectGroup") return "Please select a group.";
      if (k === "scheduledReminderInfo") return "Scheduled reminder for tomorrow 9:00 AM (mock)";
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

describe("ModeratorNotifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("UTC01 [A] Send without selecting group => Shows warning and does not send", async () => {
    const { notification } = await import("antd");

    render(<ModeratorNotifications />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /send now/i }));

    expect(notification.warning).toHaveBeenCalledWith({
      message: "Please select a group.",
    });
    expect(notification.success).not.toHaveBeenCalled();
  });

  test("UTC02 [B] Select group + type message + send => Sends success and clears message", async () => {
    const { notification } = await import("antd");

    render(<ModeratorNotifications />);

    const user = userEvent.setup();

    await user.selectOptions(
      screen.getByRole("combobox"),
      screen.getByRole("option", { name: /groupsWithoutMentors/i })
    );

    await user.click(screen.getByLabelText(/Beta Squad/i));

    const textarea = screen.getByPlaceholderText(/enterNotificationMessage/i);
    await user.type(textarea, "Hello");

    await user.click(screen.getByRole("button", { name: /send now/i }));

    expect(notification.success).toHaveBeenCalledWith({
      message: "Sent to Beta Squad",
    });
    expect(textarea).toHaveValue("");
  });

  test("UTC03 [B] Schedule => Shows info notification", async () => {
    const { notification } = await import("antd");

    render(<ModeratorNotifications />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /schedule/i }));

    expect(notification.info).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Scheduled reminder for tomorrow 9:00 AM (mock)" })
    );
  });

  test("UTC04 [B] Filter withoutTopic => Shows 'No Topic' tag, then hides on filter change", async () => {
    render(<ModeratorNotifications />);

    expect(screen.getByText(/No Topic/i)).toBeInTheDocument();

    const user = userEvent.setup();
    await user.selectOptions(
      screen.getByRole("combobox"),
      screen.getByRole("option", { name: /groupsWithoutMentors/i })
    );

    expect(screen.queryByText(/No Topic/i)).not.toBeInTheDocument();
  });
});
