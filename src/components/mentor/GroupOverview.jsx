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
import { calculateProgressFromTasks } from "../../utils/group.utils";

export default function GroupOverview({ groupId, groupDetail }) {
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
      
      // Fetch board data
      const boardResponse = await BoardService.getBoard(groupId);
      const board = boardResponse?.data || null;

      console.log("Board data:", board);

      // Calculate progress from tasks
      const calculatedProgress = board ? calculateProgressFromTasks(board) : 0;
      console.log("Calculated progress:", calculatedProgress);
      
      setProgress(calculatedProgress);
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
      console.error("Failed to fetch data:", error);
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

    Object.values(board.columns).forEach(column => {
      if (column.tasks) {
        Object.values(column.tasks).forEach(task => {
          totalTasks++;
          if (task.assignees && Array.isArray(task.assignees)) {
            task.assignees.forEach(assigneeId => {
              memberTaskCount[assigneeId] = (memberTaskCount[assigneeId] || 0) + 1;
            });
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
              className="rounded-md text-xs font-medium px-3 py-1 border border-blue-100 bg-blue-50 text-blue-600"
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
            />
            <Tag
              color={group.status === "At risk" ? "volcano" : group.status === "Behind" ? "orange" : "green"}
              className="mt-1 rounded-md"
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
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
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
                  className="w-40"
                />
              </div>
              <Tag
                color={m.status === "Active" ? "blue" : "default"}
                className="rounded-md"
              >
                {m.status}
              </Tag>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
