import React, { useState, useEffect } from "react";
import {
  Card,
  Select,
  Button,
  Space,
  Tag,
  Divider,
  notification,
  Tooltip,
} from "antd";
import {
  ThunderboltOutlined,
  UsergroupAddOutlined,
  CheckOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useTranslation } from "../../hook/useTranslation";
import { AiService } from "../../services/ai.service";
const normalizeSkillTags = (skillTags) => {
  const arr = Array.isArray(skillTags) ? skillTags : [];
  return arr
    .flatMap((s) => String(s || "").split(","))
    .map((s) => s.trim())
    .filter(Boolean);
};
const { Option } = Select;

export default function AIAssistantModerator() {
  const { t } = useTranslation();
  const [mode, setMode] = useState("groupsAndMembers");
  const [analysisResults, setAnalysisResults] = useState([]);
  const [summary, setSummary] = useState({
    missingTopics: 0,
    membersWithoutGroup: 0,
    groupsMissingMembers: 0,
  });
  const [loading, setLoading] = useState(false);
  const [aiOptionsData, setAiOptionsData] = useState(null);
  const itemsFoundText = (t("itemsFound") || "{count} items found").replace(
    "{count}",
    analysisResults.length
  );
  useEffect(() => {
    fetchAiOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAiOptions = async () => {
    try {
      setLoading(true);
      const response = await AiService.getOptions({
        section: "All",
        page: 1,
        pageSize: 20,
      });

      const data = response?.data?.data || response?.data;
      const isSuccess = response?.data?.success ?? response?.status === 200;

      if (isSuccess && data) {
        setAiOptionsData(data);

        const summaryResponse = await AiService.getSummary();

        const summaryData =
          summaryResponse?.data?.data || summaryResponse?.data;
        const summarySuccess =
          summaryResponse?.data?.success ?? summaryResponse?.status === 200;

        if (summarySuccess && summaryData) {
          const counts = {
            missingTopics: summaryData.groupsWithoutTopic || 0,
            membersWithoutGroup: summaryData.studentsWithoutGroup || 0,
            groupsMissingMembers: summaryData.groupsUnderCapacity || 0,
          };
          setSummary(counts);
        }

        updateAnalysisResults(mode, data);
      }
    } catch (error) {
      console.error("Failed to fetch AI options:", error);
      notification.error({
        message: t("error") || "Error",
        description: t("failedToFetchAiData") || "Failed to fetch AI data",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAnalysisResults = (selectedMode, data) => {
    if (!data) {
      return;
    }

    // 1) Groups thiếu topic
    const missingTopicsResults =
      (data.groupsWithoutTopic?.items || []).map((item, index) => ({
        id: `missingTopics-${index + 1}`,
        group: item.name,
        groupId: item.groupId,
        status: ["noTopic"],
        suggestions: {
          topics: item.suggestions || [],
        },
        confidence: item.suggestions?.[0]?.score || 0,
        majorName: item.majorName,
        currentMembers: item.currentMembers,
        maxMembers: item.maxMembers,
      })) || [];

    // 2) Thành viên chưa có nhóm
    const membersWithoutGroupResults =
      (data.studentsWithoutGroup?.items || []).map((item, index) => ({
        id: `membersWithoutGroup-${index + 1}`,
        member: item.displayName,
        studentId: item.studentId,
        status: ["noGroup"],
        suggestions: {
          group: item.suggestedGroup?.name || "",
          groupId: item.suggestedGroup?.groupId || "",
          reason: item.suggestedGroup?.reason || "",
        },
        confidence: extractConfidenceFromReason(item.suggestedGroup?.reason),
        majorName: item.majorName,
        primaryRole: item.primaryRole,
        skillTags: item.skillTags || [],
      })) || [];

    // 3) Group thiếu thành viên
    const groupsMissingMembersResults =
      (data.groupsNeedingMembers?.items || []).map((item, index) => ({
        id: `groupsMissingMembers-${index + 1}`,
        group: item.name,
        groupId: item.groupId,
        status: [
          {
            type: "missingMembers",
            current: item.currentMembers,
            max: item.maxMembers,
          },
        ],
        suggestions: {
          members: item.suggestedMembers || [],
        },
        confidence: item.suggestedMembers?.[0]?.score || 0,
        majorName: item.majorName,
        currentMembers: item.currentMembers,
        maxMembers: item.maxMembers,
      })) || [];

    let results = [];

    if (selectedMode === "missingTopics") {
      results = missingTopicsResults;
    } else if (selectedMode === "groupsAndMembers") {
      results = [...groupsMissingMembersResults, ...membersWithoutGroupResults];
    }

    setAnalysisResults(results);
  };

  const extractConfidenceFromReason = (reason) => {
    if (!reason) return 0;
    const match = reason.match(/Điểm AI (\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const runAnalysis = async () => {
    try {
      setLoading(true);

      if (mode === "groupsAndMembers") {
        await AiService.autoAssignTeams({
          semesterId: aiOptionsData?.semesterId || null,
          majorId: null,
          limit: null,
        });

        notification.success({
          message: t("aiAnalysisComplete") || "AI analysis complete!",
          description:
            t("aiGroupsAndMembersUpdated") ||
            "Groups and members have been analysed and updated.",
          placement: "topRight",
        });
      } else if (mode === "missingTopics") {
        await AiService.autoAssignTopic({
          groupId: null,
          majorId: null,
          limitPerGroup: 3,
        });

        notification.success({
          message: t("aiAnalysisComplete") || "AI analysis complete!",
          description:
            t("aiMissingTopicsUpdated") ||
            "Topics have been suggested and assigned for groups without topics.",
          placement: "topRight",
        });
      }

      await fetchAiOptions();
    } catch (error) {
      console.error("Run analysis failed:", error);
      notification.error({
        message: t("error") || "Error",
        description: t("failedToRunAiAnalysis") || "Failed to run AI analysis",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const runAIAutoAssign = async () => {
    try {
      setLoading(true);

      await AiService.autoResolve({
        semesterId: aiOptionsData?.semesterId || null,
        majorId: null,
      });

      notification.success({
        message: t("aiAutoAssignComplete") || "AI Auto-Assign Complete!",
        description:
          t("aiAutoAssignSuccess") ||
          "AI has automatically resolved groups, members and topics.",
        placement: "topRight",
      });

      await fetchAiOptions();
    } catch (error) {
      console.error("Failed to run AI auto-resolve:", error);
      notification.error({
        message: t("error") || "Error",
        description:
          t("failedToRunAiAutoAssign") || "Failed to run AI auto-assign",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            {t("aiAssistant") || "AI Assistant"}
          </h1>
          <p className="text-gray-500 mt-2">
            {t("aiAssistantDescription") ||
              "Intelligent detection and automated suggestions for group optimization"}
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
                {t("missingTopics") || "Missing Topics"}
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
                {t("membersWithoutGroup") || "Members Without Group"}
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
                {t("groupsMissingMembers") || "Groups Missing Members"}
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
              {t("analysisMode") || "Analysis Mode"}
            </h3>
            <p className="text-gray-500 text-sm">
              {t("configureAIAnalysis") ||
                "Configure AI analysis settings and run intelligent detection"}
            </p>
          </div>
          <Space size="large" className="flex-wrap">
            <Select
              value={mode}
              onChange={(value) => {
                setMode(value);
                if (aiOptionsData) {
                  updateAnalysisResults(value, aiOptionsData);
                }
              }}
              className="w-80"
              size="large"
            >
              <Option value="groupsAndMembers">
                <Space>
                  <ThunderboltOutlined />
                  {t("groupsAndMembers") || "Groups & Members Overview"}
                </Space>
              </Option>

              <Option value="missingTopics">
                <Space>
                  <BookOutlined />
                  {t("missingTopics") || "Missing Topics"}
                </Space>
              </Option>
            </Select>

            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              size="large"
              className="!bg-blue-600 hover:!bg-blue-700 !shadow-md"
              onClick={runAnalysis}
              loading={loading}
            >
              {t("runAnalysis") || "Run Analysis"}
            </Button>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              size="large"
              className="!bg-green-600 hover:!bg-green-700 !shadow-md"
              onClick={runAIAutoAssign}
              loading={loading}
            >
              {t("runAIAutoAssign") || "Run AI Auto-Assign"}
            </Button>
          </Space>
        </div>
      </Card>

      {/* FINDINGS & ACTIONS */}
      {analysisResults.length > 0 && (
        <Card className="shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900 text-xl">
              {t("aiFindingsRecommendations") ||
                "AI Findings & Recommendations"}
            </h3>
            <Tag color="blue" className="px-3 py-1 text-sm">
              {itemsFoundText}
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
                          {item.status.map((s, idx) => {
                            let label = "";
                            let color = "gold";

                            if (typeof s === "string") {
                              if (s === "noTopic") {
                                label = t("noTopic") || "No Topic";
                                color = "red";
                              } else if (s === "noGroup") {
                                label = t("noGroup") || "No Group";
                                color = "orange";
                              } else {
                                label = s;
                              }
                            } else if (
                              s &&
                              typeof s === "object" &&
                              s.type === "missingMembers"
                            ) {
                              label = `${
                                t("missingMembers") || "Missing Members"
                              } (${s.current}/${s.max})`;
                              color = "gold";
                            }

                            return (
                              <Tag
                                key={`${item.id}-status-${idx}`}
                                color={color}
                                className="rounded-full px-3 py-1 font-medium"
                              >
                                {label}
                              </Tag>
                            );
                          })}
                        </div>
                        {item.studentId && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {!!item.primaryRole && (
                              <Tag
                                color="geekblue"
                                className="rounded-full px-3 py-1 font-medium"
                              >
                                {t("role") || "Role"}: {item.primaryRole}
                              </Tag>
                            )}

                            {(() => {
                              const skills = normalizeSkillTags(item.skillTags);
                              const show = skills.slice(0, 8);
                              const more = skills.length - show.length;

                              return (
                                <>
                                  {show.map((sk) => (
                                    <Tag
                                      key={`${item.id}-skill-${sk}`}
                                      className="rounded-full px-3 py-1"
                                    >
                                      {sk}
                                    </Tag>
                                  ))}

                                  {more > 0 && (
                                    <Tooltip title={skills.join(", ")}>
                                      <Tag className="rounded-full px-3 py-1">
                                        +{more}
                                      </Tag>
                                    </Tooltip>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Suggestions */}
                    <div className="bg-gray-50 rounded-lg p-4 mt-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        {t("aiRecommendations") || "AI Recommendations"}
                      </div>
                      <div className="space-y-2 text-sm text-gray-700">
                        {/* Topics for missingTopics mode */}
                        {item.suggestions.topics &&
                          item.suggestions.topics.length > 0 && (
                            <div>
                              <span className="font-semibold">
                                {t("suggestedTopics") || "Suggested Topics"}:
                              </span>
                              <div className="mt-2 space-y-2">
                                {item.suggestions.topics
                                  .slice(0, 3)
                                  .map((topic, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-2 pl-4"
                                    >
                                      <CheckOutlined className="text-green-600 mt-0.5" />
                                      <div className="flex-1">
                                        <div className="text-blue-600 font-medium">
                                          {topic.title}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {topic.reason}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                        {/* Group for membersWithoutGroup mode */}
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

                        {/* Members for groupsMissingMembers mode */}
                        {item.suggestions.members &&
                          item.suggestions.members.length > 0 && (
                            <div>
                              <span className="font-semibold">
                                {t("suggestedMembers") || "Suggested Members"}:
                              </span>
                              <div className="mt-2 space-y-2">
                                {item.suggestions.members
                                  .slice(0, 3)
                                  .map((member, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-2 pl-4"
                                    >
                                      <CheckOutlined className="text-green-600 mt-0.5" />
                                      <div className="flex-1">
                                        <div className="text-blue-600 font-medium">
                                          {member.displayName}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {member.primaryRole} • {member.reason}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
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
                        {t("confidence") || "Confidence"}
                      </div>
                      <div
                        className={`text-3xl font-bold ${
                          item.confidence >= 80
                            ? "text-green-600"
                            : item.confidence >= 50
                            ? "text-blue-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {item.confidence}%
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.confidence >= 80
                          ? "bg-green-100 text-green-700"
                          : item.confidence >= 50
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.confidence >= 80
                        ? t("high") || "High"
                        : item.confidence >= 50
                        ? t("medium") || "Medium"
                        : t("low") || "Low"}
                    </div>
                  </div>
                </div>

                <Divider className="my-4" />
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
