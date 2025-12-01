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
  BookOutlined,
} from "@ant-design/icons";
import { useTranslation } from "../../hook/useTranslation";

const { Option } = Select;

export default function AIAssistantModerator() {
  const { t } = useTranslation();
  const [mode, setMode] = useState("missingTopics");
  const [autoMerge, setAutoMerge] = useState(false);
  const [analysisResults, setAnalysisResults] = useState([]);

  const summary = {
    missingTopics: 3,
    membersWithoutGroup: 5,
    groupsMissingMembers: 4,
  };

  const allFindings = {
    missingTopics: [
      {
        id: 1,
        group: "Gamma Force",
        status: ["No Topic"],
        suggestions: {
          topic: "AI Campus Assistant",
        },
        confidence: 91,
      },
      {
        id: 2,
        group: "Delta Group",
        status: ["No Topic"],
        suggestions: {
          topic: "Cloud Service Optimization for Education",
        },
        confidence: 85,
      },
      {
        id: 3,
        group: "Alpha Team",
        status: ["No Topic"],
        suggestions: {
          topic: "Mobile Learning Platform",
        },
        confidence: 88,
      },
    ],
    membersWithoutGroup: [
      {
        id: 1,
        member: "Nguyen Van A",
        status: ["No Group"],
        suggestions: {
          group: "Gamma Force",
          reason: "Matching skills: React, Node.js",
        },
        confidence: 92,
      },
      {
        id: 2,
        member: "Tran Thi B",
        status: ["No Group"],
        suggestions: {
          group: "Beta Squad",
          reason: "Matching skills: Python, AI/ML",
        },
        confidence: 89,
      },
      {
        id: 3,
        member: "Le Van C",
        status: ["No Group"],
        suggestions: {
          group: "Delta Group",
          reason: "Matching skills: Java, Spring Boot",
        },
        confidence: 87,
      },
      {
        id: 4,
        member: "Pham Thi D",
        status: ["No Group"],
        suggestions: {
          group: "Omega Crew",
          reason: "Matching skills: Flutter, Firebase",
        },
        confidence: 90,
      },
      {
        id: 5,
        member: "Hoang Van E",
        status: ["No Group"],
        suggestions: {
          group: "Alpha Team",
          reason: "Matching skills: Angular, .NET",
        },
        confidence: 85,
      },
    ],
    groupsMissingMembers: [
      {
        id: 1,
        group: "Beta Squad",
        status: ["Missing Members (2/4)"],
        suggestions: {
          mergeWith: "Omega Crew",
          reason: "Similar project scope and timeline",
        },
        confidence: 88,
      },
      {
        id: 2,
        group: "Sigma Team",
        status: ["Missing Members (1/3)"],
        suggestions: {
          member: "Available students with matching skills",
          reason: "2 qualified candidates found",
        },
        confidence: 86,
      },
      {
        id: 3,
        group: "Theta Group",
        status: ["Missing Members (2/5)"],
        suggestions: {
          mergeWith: "Kappa Force",
          reason: "Overlapping topic areas",
        },
        confidence: 84,
      },
      {
        id: 4,
        group: "Lambda Squad",
        status: ["Missing Members (1/4)"],
        suggestions: {
          member: "Students without group",
          reason: "3 potential matches available",
        },
        confidence: 91,
      },
    ],
  };

  const runAnalysis = () => {
    const results = allFindings[mode] || [];
    setAnalysisResults(results);
    notification.success({
      message: t("aiAnalysisComplete") || "AI analysis complete!",
      description: `Found ${results.length} items with actionable suggestions`,
      placement: "topRight",
    });
  };

  const sendNotice = (group) => {
    notification.info({
      message: "Notification Sent",
      description: `Sent reminder notification to ${group}`,
      placement: "topRight",
    });
  };

  const autoMergeHandler = (group) => {
    notification.success({
      message: "Auto Merge Completed",
      description: `Successfully merged ${group} with suggested team`,
      placement: "topRight",
    });
  };

  const applySuggestion = (group) => {
    notification.success({
      message: "Suggestions Applied",
      description: `Applied AI recommendations for ${group}`,
      placement: "topRight",
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ThunderboltOutlined className="text-blue-600" />
            {t("aiAssistant") || "AI Assistant"}
          </h1>
          <p className="text-gray-500 mt-2">
            Intelligent detection and automated suggestions for group
            optimization
          </p>
        </div>
      </div>

      {/* INSIGHTS SUMMARY */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-md">
        <h4 className="font-semibold text-gray-900 mb-4 text-lg">
          {t("aiInsightsSummary") || "AI Insights Summary"}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-red-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                Missing Topics
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <BookOutlined className="text-lg text-red-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-red-600">
              {summary.missingTopics}
            </div>
            <div className="text-gray-500 text-sm mt-1">
              {t("groupsWithoutTopics") || "Groups Without Topics"}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                Members Without Group
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <UsergroupAddOutlined className="text-lg text-orange-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-orange-600">
              {summary.membersWithoutGroup}
            </div>
            <div className="text-gray-500 text-sm mt-1">
              {t("membersWithoutGroup") || "Members Without Group"}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-yellow-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">
                Groups Missing Members
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <UsergroupAddOutlined className="text-lg text-yellow-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-yellow-600">
              {summary.groupsMissingMembers}
            </div>
            <div className="text-gray-500 text-sm mt-1">
              {t("groupsMissingMembers") || "Groups Missing Members"}
            </div>
          </div>
        </div>
      </Card>

      {/* CONFIGURATION CARD */}
      <Card className="shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              Analysis Mode
            </h3>
            <p className="text-gray-500 text-sm">
              Configure AI analysis settings and run intelligent detection
            </p>
          </div>
          <Space size="middle" className="flex-wrap">
            <Select
              value={mode}
              onChange={setMode}
              className="w-64"
              size="large"
            >
              <Option value="missingTopics">
                <Space>
                  <BookOutlined />
                  {t("missingTopics") || "Missing Topics"}
                </Space>
              </Option>
              <Option value="membersWithoutGroup">
                <Space>
                  <UsergroupAddOutlined />
                  {t("membersWithoutGroup") || "Members Without Group"}
                </Space>
              </Option>
              <Option value="groupsMissingMembers">
                <Space>
                  <ThunderboltOutlined />
                  {t("groupsMissingMembers") || "Groups Missing Members"}
                </Space>
              </Option>
            </Select>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              size="large"
              className="!bg-blue-600 hover:!bg-blue-700 !shadow-md"
              onClick={runAnalysis}
            >
              Run Analysis
            </Button>
          </Space>
        </div>

        <Divider className="my-4" />

        <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg">
          <Switch
            checked={autoMerge}
            onChange={setAutoMerge}
            className="bg-gray-300"
          />
          <div className="flex-1">
            <span className="text-gray-700 font-medium text-sm">
              {t("autoMerge") || "Enable Auto-Merge"}
            </span>
            <p className="text-gray-500 text-xs mt-1">
              Automatically merge compatible teams with high confidence scores
              (≥85%)
            </p>
          </div>
        </div>
      </Card>

      {/* FINDINGS & ACTIONS */}
      {analysisResults.length > 0 && (
        <Card className="shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900 text-xl">
              AI Findings & Recommendations
            </h3>
            <Tag color="blue" className="px-3 py-1 text-sm">
              {analysisResults.length} Items Found
            </Tag>
          </div>

          <div className="flex flex-col gap-4">
            {analysisResults.map((item, index) => (
              <Card
                key={item.id}
                className="rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">
                          {item.group || item.member}
                        </h4>
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
                              className="rounded-full px-3 py-1 font-medium"
                            >
                              {s}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Suggestions */}
                    <div className="bg-gray-50 rounded-lg p-4 mt-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        AI Recommendations
                      </div>
                      <div className="space-y-2 text-sm text-gray-700">
                        {item.suggestions.topic && (
                          <div className="flex items-start gap-2">
                            <CheckOutlined className="text-green-600 mt-0.5" />
                            <div>
                              <span className="font-semibold">
                                {t("suggestedTopic") || "Suggested Topic"}:
                              </span>{" "}
                              <span className="text-blue-600 font-medium">
                                {item.suggestions.topic}
                              </span>
                            </div>
                          </div>
                        )}
                        {item.suggestions.group && (
                          <div className="flex items-start gap-2">
                            <CheckOutlined className="text-green-600 mt-0.5" />
                            <div>
                              <span className="font-semibold">
                                {t("suggestedGroup") || "Suggested Group"}:
                              </span>{" "}
                              <span className="text-blue-600 font-medium">
                                {item.suggestions.group}
                              </span>
                            </div>
                          </div>
                        )}
                        {item.suggestions.member && (
                          <div className="flex items-start gap-2">
                            <CheckOutlined className="text-green-600 mt-0.5" />
                            <div>
                              <span className="font-semibold">
                                {t("suggestedMember") || "Suggested Member"}:
                              </span>{" "}
                              <span className="text-blue-600 font-medium">
                                {item.suggestions.member}
                              </span>
                            </div>
                          </div>
                        )}
                        {item.suggestions.mergeWith && (
                          <div className="flex items-start gap-2">
                            <UsergroupAddOutlined className="text-purple-600 mt-0.5" />
                            <div>
                              <span className="font-semibold">
                                {t("mergeSuggestion") || "Merge Suggestion"}:
                              </span>{" "}
                              <span className="text-purple-600 font-medium">
                                {t("mergeWith") || "Merge with"}{" "}
                                {item.suggestions.mergeWith}
                              </span>
                            </div>
                          </div>
                        )}
                        {item.suggestions.reason && (
                          <div className="flex items-start gap-2">
                            <CheckOutlined className="text-gray-500 mt-0.5" />
                            <div>
                              <span className="font-semibold">
                                {t("reason") || "Reason"}:
                              </span>{" "}
                              <span className="text-gray-600">
                                {item.suggestions.reason}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Confidence Score */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-2">
                    <div className="text-center lg:text-right">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Confidence
                      </div>
                      <div
                        className={`text-3xl font-bold ${
                          item.confidence >= 90
                            ? "text-green-600"
                            : item.confidence >= 80
                            ? "text-blue-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {item.confidence}%
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.confidence >= 90
                          ? "bg-green-100 text-green-700"
                          : item.confidence >= 80
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.confidence >= 90
                        ? "High"
                        : item.confidence >= 80
                        ? "Good"
                        : "Medium"}
                    </div>
                  </div>
                </div>

                <Divider className="my-4" />

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    className="!bg-blue-600 hover:!bg-blue-700"
                    onClick={() => applySuggestion(item.group || item.member)}
                  >
                    Apply Suggestion
                  </Button>
                  <Button
                    icon={<SendOutlined />}
                    onClick={() => sendNotice(item.group || item.member)}
                    className="hover:!bg-gray-50"
                  >
                    Send Notification
                  </Button>
                  {item.suggestions.mergeWith && (
                    <Button
                      icon={<UsergroupAddOutlined />}
                      onClick={() =>
                        autoMergeHandler(item.group || item.member)
                      }
                      className="!text-purple-600 !border-purple-300 hover:!bg-purple-50"
                    >
                      Auto Merge
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
