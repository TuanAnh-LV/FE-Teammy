import React, { useState, useEffect } from "react";
import { Tag, Progress, Card, List, Avatar, Button, Spin } from "antd";
import {
  TeamOutlined,
  CalendarOutlined,
  PieChartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { GroupService } from "../../services/group.service";
import { BoardService } from "../../services/board.service";
import { ReportService } from "../../services/report.service";
import { useTranslation } from "../../hook/useTranslation";

export default function GroupOverview({ groupId, groupDetail }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [progress, setProgress] = useState(0);
  const [boardData, setBoardData] = useState(null);

  useEffect(() => {
    if (groupId && groupDetail) {
      fetchData();
    }
  }, [groupId, groupDetail]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch progress from tracking reports API
      const [reportResponse, boardResponse] = await Promise.all([
        ReportService.getProjectReport(groupId),
        BoardService.getBoard(groupId)
      ]);

      const completionPercent = reportResponse?.data?.project?.completionPercent ?? 0;
      const board = boardResponse?.data || null;
      
      setProgress(completionPercent);
      setBoardData(board);

      // Get all members from groupDetail (leader + members)
      const allMembers = [];
      if (groupDetail?.leader) {
        allMembers.push({
          ...groupDetail.leader,
          fullName: groupDetail.leader.displayName,
          avatar: groupDetail.leader.avatarUrl,
        });
      }
      if (groupDetail?.members && Array.isArray(groupDetail.members)) {
        groupDetail.members.forEach(member => {
          allMembers.push({
            ...member,
            fullName: member.displayName,
            avatar: member.avatarUrl,
          });
        });
      }

      // Calculate member contributions
      const membersWithContribution = calculateMemberContributions(allMembers, board);
      setMembers(membersWithContribution);
    } catch (error) {

      setMembers([]);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const calculateMemberContributions = (membersList, board) => {
    if (!board || !board.columns) return membersList.map(m => ({ ...m, contribution: 0, status: "Idle" }));

    // Count tasks assigned to each member
    const memberTaskCount = {};
    let totalTasks = 0;

    // Flatten all tasks from all columns
    const allTasks = Object.values(board.columns).flatMap(column => 
      Array.isArray(column.tasks) ? column.tasks : Object.values(column.tasks || {})
    );

    allTasks.forEach(task => {
      if (!task) return;
      totalTasks++;
      
      // Check assignees array
      if (task.assignees && Array.isArray(task.assignees)) {
        task.assignees.forEach(assignee => {
          // assignee might be an ID string or an object with userId
          const assigneeId = typeof assignee === 'string' ? assignee : assignee?.userId || assignee?.id;
          if (assigneeId) {
            memberTaskCount[assigneeId] = (memberTaskCount[assigneeId] || 0) + 1;
          }
        });
      }
    });

    // Calculate contribution percentage
    return membersList.map(member => {
      const taskCount = memberTaskCount[member.userId] || 0;
      const contribution = totalTasks > 0 ? Math.round((taskCount / totalTasks) * 100) : 0;
      const status = contribution > 0 ? "Active" : "Idle";
      
      return {
        ...member,
        contribution,
        status,
      };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" tip="Loading overview..." />
      </div>
    );
  }

  // currentMembers already includes leader, so don't add 1
  const totalMembers = groupDetail?.currentMembers || 0;
  
  // Determine status based on progress (same logic as MyGroups)
  let status = "On track";
  if (progress < 30) status = "At risk";
  else if (progress < 60) status = "Behind";

  const group = {
    description: groupDetail?.description || "No description available.",
    tags: groupDetail?.topicName ? [groupDetail.topicName] : [],
    major: groupDetail?.major?.majorName || "N/A",
    mentor: groupDetail?.mentor?.displayName || "No mentor assigned",
    members: totalMembers,
    progress: progress,
    activeWeeks: groupDetail?.activeWeeks || 0,
    status: status,
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">
            Project Overview
          </h2>
          <p className="text-gray-500 text-sm max-w-xl">{group.description}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          {group.tags.map((t) => (
            <Tag
              key={t}
              color="blue"
              className="!rounded-md !text-xs !font-medium !px-3 !py-1 !border !border-blue-100 !bg-blue-50 !text-blue-600"
            >
              {t}
            </Tag>
          ))}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left column */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TeamOutlined className="text-blue-500" /> Group Information
          </h3>
          <div className="space-y-2 text-gray-600 text-sm">
            <p>
              <span className="font-medium text-gray-700">Members:</span>{" "}
              {group.members}
            </p>
            <p>
              <span className="font-medium text-gray-700">Major:</span>{" "}
              {group.major}
            </p>
            <p>
              <span className="font-medium text-gray-700">Mentor:</span>{" "}
              <span className="font-semibold text-gray-800">
                {group.mentor}
              </span>
            </p>
          </div>
          <div className="mt-6">
            <Progress
              percent={group.progress}
              size="small"
              status={group.status === "At risk" ? "exception" : "active"}
              strokeColor={group.status === "At risk" ? "#fa541c" : "#43D08A"}
              className="!mb-1"
            />
            <Tag
              color={group.status === "At risk" ? "volcano" : group.status === "Behind" ? "orange" : "green"}
              className="!mt-1 !rounded-md"
            >
              {group.status}
            </Tag>
          </div>
        </div>

        {/* Right column */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col items-start justify-between">
            <div className="flex items-center gap-2">
              <PieChartOutlined className="text-blue-500 text-xl" />
              <h4 className="text-sm font-medium text-gray-600">
                Task Completion
              </h4>
            </div>
            <p className="text-3xl font-bold text-blue-600 mt-3">
              {group.progress}%
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col items-start justify-between">
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-green-500 text-xl" />
              <h4 className="text-sm font-medium text-gray-600">
                Active Weeks
              </h4>
            </div>
            <p className="text-3xl font-bold text-green-500 mt-3">
              {group.activeWeeks}w
            </p>
          </div>
        </div>
      </div>
      {/* Bottom section - 2 columns */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Contribution Summary */}
        <Card className="!rounded-2xl !border !border-gray-100 !shadow-sm">
          <h3 className="text-gray-800 font-semibold mb-3">
            Contribution Summary
          </h3>
          <List
            dataSource={members}
            renderItem={(m) => (
              <List.Item>
                <Avatar icon={<UserOutlined />} src={m.avatar} />
                <div className="ml-3 flex-1">
                  <p className="font-medium text-gray-700">{m.fullName || m.name}</p>
                  <Progress
                    percent={m.contribution}
                    strokeColor={m.status === "Active" ? "#3182ED" : "#D1D5DB"}
                    size="small"
                    className="!w-40"
                  />
                </div>
              </List.Item>
            )}
          />
        </Card>

        {/* Recent Activity */}
        <Card className="!rounded-2xl !border !border-gray-100 !shadow-sm">
          <h3 className="text-gray-800 font-semibold mb-3">
            Recent Activity
          </h3>
          {boardData && boardData.columns ? (
            <List
              dataSource={
                Object.values(boardData.columns)
                  .flatMap(col => col.tasks || [])
                  .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
                  .slice(0, 4)
              }
              renderItem={(task) => {
                const assigneeName = task.assignees?.[0]?.displayName || task.assignee?.displayName || "Unassigned";
                const taskDate = task.updatedAt || task.createdAt;
                const relativeTime = taskDate ? getRelativeTime(taskDate, t) : "";
                
                return (
                  <List.Item>
                    <div className="flex items-start gap-2 w-full">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium line-clamp-1">
                          {task.title || "Untitled Task"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {assigneeName} • {relativeTime}
                        </p>
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          ) : (
            <p className="text-sm text-gray-500 italic">Chưa có hoạt động gần đây</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function getRelativeTime(dateString, t) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t("justNow") || "vừa xong";
  if (diffMins < 60) return `${diffMins} ${t("minutesAgo") || "phút trước"}`;
  if (diffHours < 24) return `${diffHours} ${t("hoursAgo") || "giờ trước"}`;
  if (diffDays < 7) return `${diffDays} ${t("daysAgo") || "ngày trước"}`;
  return date.toLocaleDateString("vi-VN");
}

