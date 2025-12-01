import React, { useState, useEffect } from "react";
import { Card, Button, Progress, Tag, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import {
  Users,
  TrendingUp,
  Clock,
  MessageSquare,
  FileText,
  Send,
  Target,
  Bookmark,
  Loader2,
} from "lucide-react";
import { GroupService } from "../../services/group.service";
import { ReportService } from "../../services/report.service";
import { BoardService } from "../../services/board.service";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../hook/useTranslation";

export default function MentorDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [mentoringGroups, setMentoringGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalGroups: 0,
    needAttention: 0,
    avgProgress: 0,
    feedbackCount: 0,
  });

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      console.log('Starting fetchMyGroups...');
      console.log('UserInfo:', userInfo);
      
      const res = await GroupService.getMyGroups();
      const groups = Array.isArray(res?.data) ? res.data : [];
      console.log(`Found ${groups.length} groups:`, groups);
      
      let totalFeedbackCount = 0;
      
      // Fetch progress, board data and calculate feedback for each group
      const groupsWithProgress = await Promise.all(
        groups.map(async (g) => {
          try {
            console.log(`Processing group ${g.id} (${g.name})...`);
            
            const [reportRes, boardRes] = await Promise.all([
              ReportService.getProjectReport(g.id),
              BoardService.getBoard(g.id)
            ]);
            
            const progress = reportRes?.data?.project?.completionPercent ?? 0;
            const boardData = boardRes?.data;
            
            // Get all tasks from board
            const tasks = boardData?.columns?.flatMap((col) => col.tasks || [])?.filter(Boolean) || [];
            console.log(`Group ${g.id} has ${tasks.length} tasks`);
            if (tasks.length > 0) {
              console.log('First task object:', tasks[0]);
              console.log('Task keys:', Object.keys(tasks[0]));
            }
            
            // Recent activity logic (like MyGroup.jsx)
            const recentActivity = tasks
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.updatedAt || b.createdAt || 0) -
                  new Date(a.updatedAt || a.createdAt || 0)
              )
              .slice(0, 1)[0]; // Get most recent task
            
            // Count mentor's comments across all tasks by loading comments from API
            let mentorCommentCount = 0;
            if (tasks.length > 0) {
              try {
                console.log(`Fetching comments for ${tasks.length} tasks in group ${g.id}`);
                console.log(`UserInfo ID: ${userInfo?.userId}`);
                
                const commentPromises = tasks.map(task => 
                  BoardService.getTaskComments(g.id, task.taskId, false)
                    .then(res => {
                      console.log(`Comments for task ${task.taskId}:`, res?.data);
                      return { taskId: task.taskId, comments: res?.data || [] };
                    })
                    .catch(err => {
                      console.error(`Failed to fetch comments for task ${task.taskId}:`, err);
                      return { taskId: task.taskId, comments: [] };
                    })
                );
                
                const commentResults = await Promise.all(commentPromises);
                
                if (userInfo?.userId) {
                  commentResults.forEach(result => {
                    const comments = Array.isArray(result.comments) ? result.comments : [];
                    const mentorComments = comments.filter(comment => comment.userId === userInfo.userId);
                    console.log(`Task ${result.taskId}: ${comments.length} total comments, ${mentorComments.length} from mentor`);
                    mentorCommentCount += mentorComments.length;
                  });
                  console.log(`Total mentor comments in group ${g.id}: ${mentorCommentCount}`);
                } else {
                  console.log('UserInfo.userId not available yet, skipping comment count');
                }
              } catch (err) {
                console.error(`Failed to fetch comments for group ${g.id}:`, err);
              }
            }
            
            totalFeedbackCount += mentorCommentCount;
            
            return {
              id: g.id,
              name: g.name || "Nhóm không tên",
              topic: g.topic?.title || "Chưa có topic",
              members: g.currentMembers || 0,
              progress: progress,
              status: progress >= 50 ? "on_track" : "need_attention",
              lastUpdate: recentActivity?.updatedAt 
                ? new Date(recentActivity.updatedAt).toLocaleDateString("vi-VN")
                : g.updatedAt 
                ? new Date(g.updatedAt).toLocaleDateString("vi-VN") 
                : "N/A",
              recentActivity: recentActivity?.title || "Chưa có hoạt động",
            };
          } catch (err) {
            console.error(`Failed to fetch data for group ${g.id}:`, err);
            return {
              id: g.id,
              name: g.name || "Nhóm không tên",
              topic: g.topic?.title || "Chưa có topic",
              members: g.currentMembers || 0,
              progress: 0,
              status: "need_attention",
              lastUpdate: g.updatedAt ? new Date(g.updatedAt).toLocaleDateString("vi-VN") : "N/A",
              recentActivity: "Chưa có hoạt động",
            };
          }
        })
      );
      
      setMentoringGroups(groupsWithProgress);
      
      // Calculate stats
      const totalGroups = groupsWithProgress.length;
      const needAttention = groupsWithProgress.filter(g => g.status === "need_attention").length;
      const avgProgress = totalGroups > 0 
        ? Math.round(groupsWithProgress.reduce((sum, g) => sum + g.progress, 0) / totalGroups)
        : 0;
      
      setStats({
        totalGroups,
        needAttention,
        avgProgress,
        feedbackCount: totalFeedbackCount,
      });
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusMap = {
    on_track: { color: "green", text: "Đúng tiến độ" },
    need_attention: { color: "orange", text: "Cần theo dõi" },
  };

  return (
    <div className="space-y-8 bg-gray-50 min-h-screen p-8">
      {/* HEADER */}
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row">
        <div>
          <h1 className="t  t-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent">
            Mentor Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your mentorships, monitor progress, and support your student
            teams.
          </p>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng số nhóm</p>
              <h2 className="text-2xl font-semibold">{stats.totalGroups}</h2>
            </div>
          </div>
        </Card>

        <Card bordered={false} className="rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Cần xem xét</p>
              <h2 className="text-2xl font-semibold">{stats.needAttention}</h2>
            </div>
          </div>
        </Card>

        <Card bordered={false} className="rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tiến độ trung bình</p>
              <h2 className="text-2xl font-semibold">{stats.avgProgress}%</h2>
            </div>
          </div>
        </Card>

        <Card bordered={false} className="rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Phản hồi đã gửi</p>
              <h2 className="text-2xl font-semibold">{stats.feedbackCount}</h2>
            </div>
          </div>
        </Card>
      </div>

      {/* CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GROUP LIST */}
        <div className="lg:col-span-2">
          <Card
            title={
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-gray-800 text-lg">
                  Các nhóm đang hướng dẫn
                </span>
              </div>
            }
            extra={
              <Button
                onClick={() => navigate("/mentor/my-groups")}
                className="
               !px-4 !py-1.5 !rounded-md !font-medium !text-gray-700 !bg-transparent !border-none hover:!bg-orange-500 hover:!text-white transition-all duration-200 !flex !items-center !gap-2 "
              >
                Xem tất cả
                <span className="text-lg leading-none">→</span>
              </Button>
            }
            className="rounded-2xl shadow-sm border-0"
          >
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : mentoringGroups.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Chưa có nhóm nào đang hướng dẫn</p>
              </div>
            ) : (
              mentoringGroups.map((group) => {
              const s = statusMap[group.status];

              return (
                <div key={group.id} className="mb-5">
                  <Card className="border border-gray-200 rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">
                          {group.name}
                        </h3>
                        <p className="text-sm text-gray-500">{group.topic}</p>
                      </div>

                      <Tag
                        color={s.color}
                        className="text-xs !rounded-full px-3 py-1"
                      >
                        {s.text}
                      </Tag>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-1 text-gray-600">
                        <span>Tiến độ</span>
                        <span className="font-semibold">{group.progress}%</span>
                      </div>

                      <Progress
                        percent={group.progress}
                        strokeColor={
                          group.progress >= 90
                            ? "#10b981"
                            : group.progress >= 50
                            ? "#3b82f6"
                            : "#f59e0b"
                        }
                        showInfo={false}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex gap-4 text-xs text-gray-500 my-3">
                      <div className="flex gap-1 items-center">
                        <Users className="w-3.5 h-3.5" />
                        {group.members} sinh viên
                      </div>
                      <div className="flex gap-1 items-center">
                        <FileText className="w-3.5 h-3.5" />
                        {group.lastUpdate}
                      </div>
                    </div>

                    {/* Recent activity */}
                    <div className="pt-3 mt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">
                        Cập nhật gần nhất:
                      </p>
                      <p className="text-sm text-gray-700">
                        {group.recentActivity}
                      </p>
                    </div>
                  </Card>
                </div>
              );
            })
            )}
          </Card>
        </div>

        {/* QUICK ACTIONS */}
        <div className="lg:col-span-1">
          <Card
            title={
              <span className="font-semibold text-gray-800 text-lg">
                Thao tác nhanh
              </span>
            }
            className="rounded-2xl shadow-sm"
            bodyStyle={{ padding: "20px" }}
          >
            <div className="space-y-3">
              {/* Item 1 */}
              <button
                onClick={() => navigate("/mentor/discover")}
                className="
        w-full flex items-center gap-3 p-3 
        bg-white border border-gray-200 
        rounded-lg hover:bg-gray-50 transition
      "
              >
                <Target className="w-5 h-5 text-gray-700" />
                <span className="text-gray-800 font-medium text-sm">
                  Tìm nhóm mới
                </span>
              </button>

              {/* Item 2 */}
              <button
                className="
        w-full flex items-center gap-3 p-3 
        bg-white border border-gray-200 
        rounded-lg hover:bg-gray-50 transition
      "
              >
                <MessageSquare className="w-5 h-5 text-gray-700" />
                <span className="text-gray-800 font-medium text-sm">
                  Tin nhắn
                </span>
              </button>

              {/* Item 3 */}
              <button
                className="
        w-full flex items-center gap-3 p-3 
        bg-white border border-gray-200 
        rounded-lg hover:bg-gray-50 transition
      "
              >
                <Bookmark className="w-5 h-5 text-gray-700" />
                <span className="text-gray-800 font-medium text-sm">
                  Đánh giá nhóm
                </span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
