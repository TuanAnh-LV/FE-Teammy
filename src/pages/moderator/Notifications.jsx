import React, { useMemo, useState } from "react";
import {
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
} from "antd";
import { useTranslation } from "../../hook/useTranslation";
import {
  BellOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  SendOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

const MOCK = {
  withoutTopic: [{ id: 1, name: "Gamma Force", major: "Computer Science" }],
  withoutMentor: [{ id: 2, name: "Beta Squad", major: "Engineering" }],
  missingMembers: [{ id: 3, name: "Delta Group", major: "IT" }],
};

export default function ModeratorNotifications() {
  const { t } = useTranslation();
  const [autoRemind, setAutoRemind] = useState(true);
  const [filterType, setFilterType] = useState("withoutTopic");
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState("");

  const list = useMemo(() => MOCK[filterType] || [], [filterType]);

  const counts = {
    withoutTopic: MOCK.withoutTopic.length,
    withoutMentor: MOCK.withoutMentor.length,
    missingMembers: MOCK.missingMembers.length,
  };

  const sendNow = () => {
    if (!selected)
      return notification.warning({
        message: t("pleaseSelectGroup") || "Please select a group.",
      });
    const sentMsgTemplate = t("sentToGroup") || "Sent to {name}";
    const final = sentMsgTemplate.replace("{name}", selected.name);
    notification.success({ message: final });
    setMsg("");
  };

  const schedule = () =>
    notification.info({
      message:
        t("scheduledReminderInfo") ||
        "Scheduled reminder for tomorrow 9:00 AM (mock)",
    });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className="inline-block text-2xl sm:text-3xl lg:text-4xl font-extrabold"
          style={{
            backgroundImage: "linear-gradient(90deg,#3182ED 0%,#43D08A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Notifications
        </h1>
        <p className="text-gray-600">
          Send reminders and manage communication with groups and mentors
        </p>
      </div>

      {/* Cards: counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="shadow-sm border-gray-100 rounded-lg"
          bodyStyle={{ padding: 16 }}
        >
          <div className="flex items-center justify-between">
            <Space>
              <ExclamationCircleOutlined className="text-orange-500" />
              <span className="font-medium">
                {t("groupsWithoutTopics") || "Groups Without Topics"}
              </span>
            </Space>
            <Tag color="red-inverse">{counts.withoutTopic}</Tag>
          </div>
          <div className="text-xs text-gray-500 mt-1">e.g., Gamma Force</div>
        </Card>

        <Card
          className="shadow-sm border-gray-100 rounded-lg"
          bodyStyle={{ padding: 16 }}
        >
          <div className="flex items-center justify-between">
            <Space>
              <TeamOutlined className="text-rose-500" />
              <span className="font-medium">
                {t("groupsWithoutMentors") || "Groups Without Mentors"}
              </span>
            </Space>
            <Tag color="red-inverse">{counts.withoutMentor}</Tag>
          </div>
          <div className="text-xs text-gray-500 mt-1">e.g., Beta Squad</div>
        </Card>

        <Card
          className="shadow-sm border-gray-100 rounded-lg"
          bodyStyle={{ padding: 16 }}
        >
          <div className="flex items-center justify-between">
            <Space>
              <BellOutlined className="text-indigo-500" />
              <span className="font-medium">{t("groupsMissingMembers")}</span>
            </Space>
            <Tag color="red-inverse">{counts.missingMembers}</Tag>
          </div>
          <div className="text-xs text-gray-500 mt-1">e.g., Delta Group</div>
        </Card>
      </div>

      {/* Compose + Settings */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Compose */}
        <Card
          className="xl:col-span-2 shadow-sm border-gray-100 rounded-lg"
          bodyStyle={{ padding: 20 }}
          title={<span className="font-semibold">{t("composeNotification")}</span>}
        >
          {/* Filters */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <span className="text-sm text-gray-600 min-w-[130px]">
                Filter by Group Type
              </span>
              <Select
                value={filterType}
                onChange={(v) => {
                  setFilterType(v);
                  setSelected(null);
                }}
                className="w-full sm:w-64"
              >
                <Option value="withoutTopic">
                  {t("groupsWithoutTopics") || "Groups Without Topics"}
                </Option>
                <Option value="withoutMentor">
                  {t("groupsWithoutMentors") || "Groups Without Mentors"}
                </Option>
                <Option value="missingMembers">
                  {t("groupsMissingMembers") || "Groups Missing Members"}
                </Option>
              </Select>
            </div>

            {/* List group để chọn */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Select Groups to Notify ({selected ? 1 : 0} selected)
                </span>
                <Space>
                  <Button size="small">{t("selectAll")}</Button>
                  <Button size="small">{t("clear")}</Button>
                </Space>
              </div>

              <List
                dataSource={list}
                className="rounded-lg border border-gray-100"
                renderItem={(g) => (
                  <List.Item className="px-3">
                    <Radio
                      checked={selected?.id === g.id}
                      onChange={() => setSelected(g)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{g.name}</span>
                        <span className="text-xs text-gray-500">{g.major}</span>
                      </div>
                    </Radio>
                    {filterType === "withoutTopic" && (
                      <Tag color="error" className="ml-auto">
                        No Topic
                      </Tag>
                    )}
                  </List.Item>
                )}
              />
            </div>

            {/* Message */}
            <div>
              <span className="text-sm text-gray-600">Message</span>
              <TextArea
                className="mt-1"
                autoSize={{ minRows: 4, maxRows: 8 }}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder={
                  t("enterNotificationMessage") ||
                  "Enter your notification message..."
                }
              />
            </div>

            {/* Actions */}
            <Space className="mt-2">
              <Button
                type="primary"
                icon={<SendOutlined />}
                className="!bg-blue-600 hover:!bg-blue-700"
                onClick={sendNow}
              >
                Send Now
              </Button>
              <Button icon={<FieldTimeOutlined />} onClick={schedule}>
                Schedule
              </Button>
            </Space>
          </div>
        </Card>

        {/* Settings */}
        <Card
          className="shadow-sm border-gray-100 rounded-lg"
          bodyStyle={{ padding: 20 }}
          title={<span className="font-semibold">{t("settings")}</span>}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{t("autoReminders")}</div>
              <div className="text-xs text-gray-500">
                Send weekly reminders automatically
              </div>
            </div>
            <Switch checked={autoRemind} onChange={setAutoRemind} />
          </div>

          <div className="mt-6">
            <div className="text-sm font-medium mb-2">
              {t("quickStats") || "Quick Stats"}
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <div className="flex justify-between">
                <span>{t("sentToday") || "Sent Today"}</span> <span>12</span>
              </div>
              <div className="flex justify-between">
                <span>{t("thisWeek") || "This Week"}</span> <span>47</span>
              </div>
              <div className="flex justify-between">
                <span>{t("pending") || "Pending"}</span> <span>3</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
