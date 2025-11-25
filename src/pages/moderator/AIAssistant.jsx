import React, { useState } from "react";
import {
  Card,
  Select,
  Button,
  Space,
  Tag,
  Divider,
  notification,
  Switch,
} from "antd";
import {
  ThunderboltOutlined,
  SendOutlined,
  UsergroupAddOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useTranslation } from "../../hook/useTranslation";

const { Option } = Select;

export default function AIAssistantModerator() {
  const { t } = useTranslation();
  const [mode, setMode] = useState("Identify Missing Elements");
  const [autoMerge, setAutoMerge] = useState(false);

  const summary = {
    missingTopics: 3,
    missingMentors: 2,
    missingMembers: 4,
  };

  const findings = [
    {
      id: 1,
      group: "Gamma Force",
      status: ["No Topic", "Missing Mentor"],
      suggestions: {
        topic: "AI Campus Assistant",
        mentor: "Dr. Sarah Williams",
      },
      confidence: 91,
    },
    {
      id: 2,
      group: "Beta Squad",
      status: ["Missing Members (2/3)"],
      suggestions: {
        mergeWith: "Omega Crew",
      },
      confidence: 88,
    },
    {
      id: 3,
      group: "Delta Group",
      status: ["No Topic"],
      suggestions: {
        topic: "Cloud Service Optimization for Education",
      },
      confidence: 85,
    },
  ];

  const runAnalysis = () => {
    notification.success({
      message: t("aiAnalysisComplete") || "AI analysis complete!",
    });
  };

  const sendNotice = (group) => {
    const tmpl = t("notificationSentTo") || "Notification sent to {name}";
    notification.info({ message: tmpl.replace("{name}", group) });
  };

  const autoMergeHandler = (group) => {
    const tmpl = t("aiMergedSuccess") || "AI merged {name} successfully!";
    notification.success({ message: tmpl.replace("{name}", group) });
  };

  const applySuggestion = (group) => {
    const tmpl =
      t("appliedAISuggestions") || "Applied AI suggestions for {name}";
    notification.success({ message: tmpl.replace("{name}", group) });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* HEADER */}
      <div>
        <h1
          className="inline-block text-4xl font-extrabold"
          style={{
            backgroundImage: "linear-gradient(90deg,#3182ED 0%,#43D08A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          AI Assistant
        </h1>
        <p className="text-gray-600">
          Detect incomplete groups, suggest improvements, and automate merges
        </p>
      </div>

      {/* CONFIGURATION */}
      <Card bodyStyle={{ padding: "20px 24px" }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-semibold text-gray-800">
              Matching Configuration
            </h3>
            <p className="text-gray-500 text-sm">
              Select mode and run AI analysis to find missing elements
            </p>
          </div>
          <Space>
            <Select value={mode} onChange={setMode} className="w-64">
              <Option value="Identify Missing Elements">
                Identify Missing Elements
              </Option>
              <Option value="Suggest Matches">Suggest Matches</Option>
              <Option value="Auto Merge">Auto Merge Mode</Option>
            </Select>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              className="!bg-blue-600 hover:!bg-blue-700"
              onClick={runAnalysis}
            >
              Run AI Analysis
            </Button>
          </Space>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <Switch checked={autoMerge} onChange={setAutoMerge} />
          <span className="text-gray-600 text-sm">
            Enable Auto Merge for compatible teams
          </span>
        </div>
      </Card>

      {/* INSIGHTS */}
      <Card
        className="bg-blue-50 border-none shadow-none"
        bodyStyle={{ padding: "16px 24px" }}
      >
        <h4 className="font-medium text-gray-800 mb-2">AI Insights Summary</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 text-center gap-4">
          <div>
            <div className="text-3xl font-semibold text-red-600">
              {summary.missingTopics}
            </div>
            <div className="text-gray-600 text-sm">Groups Missing Topics</div>
          </div>
          <div>
            <div className="text-3xl font-semibold text-orange-500">
              {summary.missingMentors}
            </div>
            <div className="text-gray-600 text-sm">Groups Missing Mentors</div>
          </div>
          <div>
            <div className="text-3xl font-semibold text-yellow-500">
              {summary.missingMembers}
            </div>
            <div className="text-gray-600 text-sm">Groups Missing Members</div>
          </div>
        </div>
      </Card>

      {/* FINDINGS */}
      <Card
        className="shadow-sm border-gray-100"
        bodyStyle={{ padding: "28px 32px" }}
      >
        <h3 className="font-semibold text-gray-800 mb-6">
          AI Findings & Actions
        </h3>

        <div className="flex flex-col gap-6">
          {findings.map((item) => (
            <Card
              key={item.id}
              className="rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
              bodyStyle={{ padding: "20px 28px" }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <div className="font-semibold text-lg text-gray-800">
                    {item.group}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.status.map((s) => (
                      <Tag
                        key={s}
                        color={
                          s.includes("Topic")
                            ? "red"
                            : s.includes("Mentor")
                            ? "orange"
                            : "gold"
                        }
                        className="rounded-full px-3 py-1"
                      >
                        {s}
                      </Tag>
                    ))}
                  </div>
                  <div className="mt-3 text-gray-600 text-sm">
                    {item.suggestions.topic && (
                      <>
                        <strong>Suggested Topic:</strong>{" "}
                        {item.suggestions.topic}
                        <br />
                      </>
                    )}
                    {item.suggestions.mentor && (
                      <>
                        <strong>Suggested Mentor:</strong>{" "}
                        {item.suggestions.mentor}
                        <br />
                      </>
                    )}
                    {item.suggestions.mergeWith && (
                      <>
                        <strong>Merge Suggestion:</strong> Merge with{" "}
                        <b>{item.suggestions.mergeWith}</b>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-gray-400 text-sm">Confidence</div>
                  <div className="text-xl font-semibold text-green-600">
                    {item.confidence}%
                  </div>
                </div>
              </div>

              <Divider className="my-3" />

              <Space>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  className="!bg-blue-600 hover:!bg-blue-700"
                  onClick={() => applySuggestion(item.group)}
                >
                  Apply Suggestion
                </Button>
                <Button
                  icon={<SendOutlined />}
                  onClick={() => sendNotice(item.group)}
                >
                  Send Notification
                </Button>
                {item.suggestions.mergeWith && (
                  <Button
                    icon={<UsergroupAddOutlined />}
                    onClick={() => autoMergeHandler(item.group)}
                  >
                    Auto Merge
                  </Button>
                )}
              </Space>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
