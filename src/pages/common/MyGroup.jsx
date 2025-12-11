import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "../../hook/useTranslation";
import { useAuth } from "../../context/AuthContext";
import { GroupService } from "../../services/group.service";
import { BoardService } from "../../services/board.service";
import { SkillService } from "../../services/skill.service";
import { ReportService } from "../../services/report.service";
import InfoCard from "../../components/common/my-group/InfoCard";
import AddMemberModal from "../../components/common/my-group/AddMemberModal";
import EditGroupModal from "../../components/common/my-group/EditGroupModal";
import LoadingState from "../../components/common/LoadingState";
import { notification } from "antd";
import { Plus, FolderKanban, ListTodo, Flag, BarChart3, FileText } from "lucide-react";
import { Modal, Form, Input } from "antd";
import TaskModal from "../../components/common/kanban/TaskModal";
import useKanbanBoard from "../../hook/useKanbanBoard";
import TabSwitcher from "../../components/common/my-group/TabSwitcher";
import OverviewSection from "../../components/common/my-group/OverviewSection";
import MembersPanel from "../../components/common/my-group/MembersPanel";
import FilesPanel from "../../components/common/my-group/FilesPanel";
import GroupPostsTab from "../../components/common/my-group/GroupPostsTab";
import KanbanTab from "../../components/common/workspace/KanbanTab";
import BacklogTab from "../../components/common/workspace/BacklogTab";
import MilestonesTab from "../../components/common/workspace/MilestonesTab";
import ReportsTab from "../../components/common/workspace/ReportsTab";

export default function MyGroup() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userInfo } = useAuth();

  const [group, setGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    maxMembers: 5,
    majorId: "",
    topicId: "",
    skills: [],
  });
  const [editErrors, setEditErrors] = useState({});
  const [availableSkills, setAvailableSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [groupSkillsWithRole, setGroupSkillsWithRole] = useState([]);
  const loadedGroupIdRef = useRef(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState("kanban");

  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [columnForm] = Form.useForm();
  const [groupFiles, setGroupFiles] = useState([]);

  // ---------------------------
  // Fetch Completion Percent from API
  // ---------------------------
  const fetchCompletionPercent = async () => {
    if (!id) return;
    try {
      const res = await ReportService.getProjectReport(id);
      const completionPercent = res?.data?.project?.completionPercent ?? 0;
      setGroup((prev) =>
        prev ? { ...prev, progress: completionPercent } : prev
      );
    } catch {
      notification.error({
        message: t("error") || "Error",
        description:
          t("failedToFetchProgress") || "Failed to fetch project progress.",
      });
    }
  };

  // ---------------------------
  // Load Group Data (without board)
  // ---------------------------
  useEffect(() => {
    if (!id) return;
    if (loadedGroupIdRef.current === id) return;

    loadedGroupIdRef.current = id;

    const loadData = async () => {
      try {
        setLoading(true);

        const [detailRes, membersRes, reportRes] = await Promise.allSettled([
          GroupService.getGroupDetail(id),
          GroupService.getListMembers(id),
          ReportService.getProjectReport(id),
        ]);

        // Group detail
        const d = detailRes.status === "fulfilled" ? detailRes.value.data : {};

        const semesterInfo = d.semester || {};
        const rawStartDate = semesterInfo.startDate || d.startDate;
        const rawEndDate = semesterInfo.endDate || d.endDate;

        const season =
          typeof semesterInfo.season === "string"
            ? semesterInfo.season.trim()
            : semesterInfo.season
            ? String(semesterInfo.season)
            : "";

        const formattedSeason = season
          ? season.charAt(0).toUpperCase() + season.slice(1)
          : "";

        const semesterLabel = [formattedSeason, semesterInfo.year]
          .filter(Boolean)
          .join(" ");

        // Members
        const members =
          membersRes.status === "fulfilled" &&
          Array.isArray(membersRes.value?.data)
            ? membersRes.value.data
            : [];

        const normalizedMembers = members.map((m) => {
          const email = m.email || "";
          const normalizedEmail = email.toLowerCase();
          const currentEmail = (userInfo?.email || "").toLowerCase();

          const avatarFromApi =
            m.avatarUrl ||
            m.avatarURL ||
            m.avatar_url ||
            m.avatar ||
            m.imageUrl ||
            m.imageURL ||
            m.image_url ||
            m.photoURL ||
            m.photoUrl ||
            m.photo_url ||
            m.profileImage ||
            m.user?.avatarUrl ||
            m.user?.avatar ||
            m.user?.photoURL ||
            m.user?.photoUrl ||
            m.user?.imageUrl ||
            m.user?.profileImage ||
            "";

          const memberId =
            m.id || m.memberId || m.userId || m.userID || m.accountId || "";

          return {
            id: memberId,
            name: m.displayName || m.name || "",
            email,
            role: m.role || m.status || "",
            joinedAt: m.joinedAt,
            avatarUrl:
              avatarFromApi ||
              (currentEmail && normalizedEmail === currentEmail
                ? userInfo?.photoURL || ""
                : ""),
            assignedRoles: m.assignedRoles || [],
          };
        });

        const currentEmail = (userInfo?.email || "").toLowerCase();
        const detailRole = (d.role || "").toLowerCase();
        const leaderFromMembers = normalizedMembers.some(
          (member) =>
            (member.email || "").toLowerCase() === currentEmail &&
            (member.role || "").toLowerCase() === "leader"
        );

        // Get completion percent from API
        const completionPercent =
          reportRes.status === "fulfilled"
            ? reportRes.value?.data?.project?.completionPercent ?? 0
            : 0;

        setGroup({
          id: d.id || id,
          title: d.name || "",
          field:
            d.field ||
            d.major?.name ||
            d.major?.majorName ||
            (typeof d.major === "string" ? d.major : "") ||
            "",
          description: d.description || "",
          start: rawStartDate ? rawStartDate.slice(0, 10) : "",
          end: rawEndDate ? rawEndDate.slice(0, 10) : "",
          semester: semesterLabel,
          progress: completionPercent,
          mentor: d.mentor,
          status: d.status || "",
          statusText: d.status || "",
          maxMembers: Number(d.maxMembers || d.capacity || 5),
          majorId:
            d.majorId || d.major?.id || d.major?.majorId || d.majorID || "",
          topicId: d.topicId || d.topic?.id || "",
          topicName: d.topicName || d.topic?.title || d.topic?.name || "",
          skills: Array.isArray(d.skills)
            ? d.skills
            : typeof d.skills === "string" && d.skills
            ? d.skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          canEdit: detailRole === "leader" || leaderFromMembers,
        });

        setGroupMembers(normalizedMembers);

        // Fetch full skill info for technologies display
        if (d.skills && d.skills.length > 0) {
          try {
            const skillsResponse = await SkillService.list({});
            const allSkills = Array.isArray(skillsResponse?.data)
              ? skillsResponse.data
              : [];
            const groupSkillTokens = Array.isArray(d.skills) ? d.skills : [];
            const matchedSkills = allSkills.filter((s) =>
              groupSkillTokens.includes(s.token)
            );
            setGroupSkillsWithRole(matchedSkills);
          } catch {
            setGroupSkillsWithRole([]);
          }
        } else {
          setGroupSkillsWithRole([]);
        }
      } catch {
        notification.error({
          message: t("error") || "Error",
          description:
            t("failedToLoadGroupData") || "Failed to load group data.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, userInfo]);

  const loadGroupFiles = async () => {
    if (!id) return;
    try {
      const res = await BoardService.getGroupFiles(id);
      const list = Array.isArray(res?.data) ? res.data : res?.items || [];
      setGroupFiles(list);
    } catch {
      notification.error({
        message: t("error") || "Error",
        description:
          t("failedToLoadGroupFiles") || "Failed to load group files.",
      });
      setGroupFiles([]);
    }
  };

  // Load files only when Files tab is active
  useEffect(() => {
    if (activeTab === "files") {
      loadGroupFiles();
    }
  }, [id, activeTab]);

  useEffect(() => {
    if (group) {
      setEditForm({
        name: group.title || "",
        description: group.description || "",
        maxMembers: group.maxMembers || groupMembers.length || 5,
        majorId: group.majorId || "",
        topicId: group.topicId || "",
      });
    }
  }, [group, groupMembers.length]);

  const handleAddMember = (user) => {
    setShowModal(false);
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editForm.name.trim()) {
      errors.name = t("groupName") || "Group name is required";
    }
    const max = Number(editForm.maxMembers);
    if (!max || max < groupMembers.length) {
      errors.maxMembers =
        t("maxMembersValidation") ||
        "Max members must be at least current member count.";
    }
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch skills when edit modal opens
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setSkillsLoading(true);
        const majorName = userInfo?.majorName || group?.field;

        const params = { pageSize: 100 };
        if (majorName) {
          params.major = majorName;
        }

        const response = await SkillService.list(params);
        const skillsList = Array.isArray(response?.data) ? response.data : [];
        setAvailableSkills(skillsList);
      } catch {
        setAvailableSkills([]);
      } finally {
        setSkillsLoading(false);
      }
    };

    if (editOpen && group) {
      // Parse existing skills
      let groupSkills = [];
      if (Array.isArray(group.skills)) {
        groupSkills = group.skills;
      } else if (typeof group.skills === "string" && group.skills) {
        groupSkills = group.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      // Update form with current group data including skills
      setEditForm({
        name: group.title || "",
        description: group.description || "",
        maxMembers: group.maxMembers || groupMembers.length || 5,
        majorId: group.majorId || "",
        topicId: group.topicId || "",
        skills: groupSkills,
      });

      fetchSkills();
    }
  }, [editOpen, group, groupMembers.length, userInfo?.majorName]);

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitEdit = async (e) => {
    e?.preventDefault();
    if (!group || !validateEditForm()) return;

    try {
      setEditSubmitting(true);

      const payload = {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        maxMembers: Number(editForm.maxMembers),
      };

      if (editForm.majorId.trim()) payload.majorId = editForm.majorId.trim();
      if (editForm.topicId.trim()) payload.topicId = editForm.topicId.trim();

      // Add skills as array
      if (editForm.skills && editForm.skills.length > 0) {
        payload.skills = editForm.skills;
      }

      await GroupService.updateGroup(group.id, payload);

      notification.success({
        message: t("updateSuccess") || "Group updated successfully.",
      });

      setGroup((prev) =>
        prev
          ? {
              ...prev,
              title: payload.name,
              description: payload.description,
              maxMembers: payload.maxMembers,
              majorId: payload.majorId ?? prev.majorId,
              topicId: payload.topicId ?? prev.topicId,
              skills: payload.skills ?? prev.skills,
            }
          : prev
      );

      setEditOpen(false);
    } catch {
      notification.error({
        message: t("error") || "Failed to update group.",
      });
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleKickMember = async (memberId, memberName) => {
    if (!group?.id || !memberId) return;

    const confirmed = window.confirm(
      t("confirmKickMember") ||
        `Are you sure you want to remove ${memberName} from the group?`
    );

    if (!confirmed) return;

    try {
      await GroupService.kickMember(group.id, memberId);

      notification.success({
        message: t("success") || "Success",
        description:
          t("memberRemovedSuccessfully") || "Member removed successfully.",
      });

      // Refresh group members
      const membersRes = await GroupService.getListMembers(group.id);
      const members = Array.isArray(membersRes?.data) ? membersRes.data : [];

      const normalizedMembers = members.map((m) => {
        const email = m.email || "";
        const normalizedEmail = email.toLowerCase();
        const currentEmail = (userInfo?.email || "").toLowerCase();

        const avatarFromApi =
          m.avatarUrl ||
          m.avatarURL ||
          m.avatar_url ||
          m.avatar ||
          m.imageUrl ||
          m.imageURL ||
          m.image_url ||
          m.photoURL ||
          m.photoUrl ||
          m.photo_url ||
          m.profileImage ||
          m.user?.avatarUrl ||
          m.user?.avatar ||
          m.user?.photoURL ||
          m.user?.photoUrl ||
          m.user?.imageUrl ||
          m.user?.profileImage ||
          "";

        const memberId =
          m.id || m.memberId || m.userId || m.userID || m.accountId || "";

        return {
          id: memberId,
          name: m.displayName || m.name || "",
          email,
          role: m.role || m.status || "",
          joinedAt: m.joinedAt,
          avatarUrl:
            avatarFromApi ||
            (currentEmail && normalizedEmail === currentEmail
              ? userInfo?.photoURL || ""
              : ""),
        };
      });

      setGroupMembers(normalizedMembers);
    } catch {
      notification.error({
        message: t("error") || "Error",
        description: t("failedToRemoveMember") || "Failed to remove member.",
      });
    }
  };

  const handleAssignRole = async (memberId, roleName) => {
    if (!group?.id || !memberId || !roleName) return;

    try {
      await GroupService.assignMemberRole(group.id, memberId, roleName);

      notification.success({
        message: t("success") || "Success",
        description:
          t("roleAssignedSuccessfully") || "Role assigned successfully.",
      });

      // Refresh group members to show updated role
      const membersRes = await GroupService.getListMembers(group.id);
      const members = Array.isArray(membersRes?.data) ? membersRes.data : [];

      const normalizedMembers = members.map((m) => {
        const email = m.email || "";
        const normalizedEmail = email.toLowerCase();
        const currentEmail = (userInfo?.email || "").toLowerCase();

        const avatarFromApi =
          m.avatarUrl ||
          m.avatarURL ||
          m.avatar_url ||
          m.avatar ||
          m.imageUrl ||
          m.imageURL ||
          m.image_url ||
          m.photoURL ||
          m.photoUrl ||
          m.photo_url ||
          m.profileImage ||
          m.user?.avatarUrl ||
          m.user?.avatar ||
          m.user?.photoURL ||
          m.user?.photoUrl ||
          m.user?.imageUrl ||
          m.user?.profileImage ||
          "";

        const memberId =
          m.id || m.memberId || m.userId || m.userID || m.accountId || "";

        return {
          id: memberId,
          name: m.displayName || m.name || "",
          email,
          role: m.role || m.status || "",
          joinedAt: m.joinedAt,
          avatarUrl:
            avatarFromApi ||
            (currentEmail && normalizedEmail === currentEmail
              ? userInfo?.photoURL || ""
              : ""),
        };
      });

      setGroupMembers(normalizedMembers);
    } catch (err) {
      notification.error({
        message: t("error") || "Error",
        description: t("failedToAssignRole") || "Failed to assign role.",
      });
      throw err;
    }
  };

  // Kanban Logic - Always load board data to show recent activity
  const {
    filteredColumns,
    columnMeta,
    groupMembers: kanbanMembers,
    selectedTask,
    setSelectedTask,
    handleDragOver,
    handleDragEnd,
    createColumn,
    createTask,
    updateTaskFields,
    updateTaskAssignees,
    deleteTask,
    deleteColumn,
    loading: kanbanLoading,
    error: kanbanError,
    refetchBoard,
    loadTaskComments,
    addTaskComment,
    updateTaskComment,
    deleteTaskComment,
  } = useKanbanBoard(id);

  // Update board state when kanban data loads
  useEffect(() => {
    if (filteredColumns) {
      const boardData = {
        columns: Object.entries(filteredColumns).map(([columnId, tasks]) => ({
          id: columnId,
          tasks: tasks || [],
        })),
      };
      setBoard(boardData);

      // Fetch progress from API instead of calculating
      fetchCompletionPercent();
    }
  }, [filteredColumns]);

  const tasks =
    board?.columns?.flatMap((col) => col.tasks || [])?.filter(Boolean) || [];

  const recentActivity = tasks
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0)
    )
    .slice(0, 4);

  const descriptionText = (group?.description || "").trim();
  const mentor = group?.mentor || null;

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "N/A";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const getFileExtension = (fileType) => {
    if (!fileType) return "";
    const parts = fileType.split("/");
    return parts.length > 1 ? parts[1].toUpperCase() : "";
  };

  const fileItems = (groupFiles || []).map((f, idx) => ({
    id: f.fileId || f.id || idx,
    name: f.fileName || f.name || `File ${idx + 1}`,
    description: f.description || f.fileName || f.name || `File ${idx + 1}`,
    owner: f.uploadedBy || f.owner || "Team",
    size: formatFileSize(f.fileSize || f.size),
    fileType: getFileExtension(f.fileType || f.type),
    url: f.fileUrl || f.downloadUrl || f.url || "#",
    date: f.createdAt ? new Date(f.createdAt) : null,
  }));

  const statusMeta = {
    todo: { label: "To Do", dot: "bg-gray-300" },
    to_do: { label: "To Do", dot: "bg-gray-300" },
    inprogress: { label: "In Progress", dot: "bg-amber-400" },
    in_progress: { label: "In Progress", dot: "bg-amber-400" },
    doing: { label: "Doing", dot: "bg-amber-400" },
    done: { label: "Done", dot: "bg-green-500" },
    completed: { label: "Done", dot: "bg-green-500" },
    review: { label: "Review", dot: "bg-blue-400" },
  };

  const findAssignees = (task) => {
    const list = task?.assignees || task?.assignee || [];
    if (Array.isArray(list)) return list;
    if (typeof list === "string" || typeof list === "object") return [list];
    return [];
  };

  const renderAssignee = (assignee) => {
    const name =
      (assignee?.displayName ||
        assignee?.name ||
        assignee?.email ||
        assignee) ??
      "";
    const initials = String(name || "U")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return { name, initials };
  };

  // Contribution statistics
  const contributionStats = (() => {
    const total = tasks.length || 1;
    return groupMembers.map((m) => {
      const emailLower = (m.email || "").toLowerCase();
      const matches = tasks.filter((task) =>
        findAssignees(task).some((assignee) => {
          const rendered = renderAssignee(assignee);
          return (rendered.name || "").toLowerCase() === emailLower;
        })
      );
      const completed = matches.filter((task) => {
        const status = (task.status || "").toLowerCase();
        return status === "done" || status === "completed";
      }).length;

      const percent = Math.round((matches.length / total) * 100);

      return {
        ...m,
        taskCount: matches.length,
        completed,
        contribution: percent,
      };
    });
  })();

  const handleCreateColumn = () => {
    columnForm.validateFields().then((values) => {
      const payload = {
        columnName: values.columnName,
        position: Number(values.position) || 0,
      };
      createColumn(payload);
      setIsColumnModalOpen(false);
      columnForm.resetFields();
    });
  };

  const hasKanbanData =
    filteredColumns && Object.keys(filteredColumns).length > 0;

  const normalizeTitle = (value = "") =>
    value.toLowerCase().replace(/\s+/g, "_");

  if (loading) {
    return (
      <LoadingState
        message={t("loading") || "Loading..."}
        subtext={t("fetchingGroupData") || "Fetching your group workspace."}
      />
    );
  }

  return (
    <div className="relative bg-[#f7fafc]">
      <div className="relative z-10 min-h-screen flex flex-col items-center pt-4 xl:pt-8 pb-24">
        <div className="w-full flex flex-col gap-6">
          {group && (
            <InfoCard
              group={group}
              memberCount={groupMembers.length}
              onBack={() => navigate(-1)}
              onSelectTopic={
                group.canEdit ? () => navigate("/discover") : undefined
              }
              onEdit={group.canEdit ? () => setEditOpen(true) : null}
            />
          )}

          <div className="mx-auto w-full max-w-7xl px-2 sm:px-8">
            <TabSwitcher
              activeTab={activeTab}
              onChange={setActiveTab}
              tabs={[
                { key: "overview", label: t("overview") || "Overview" },
                { key: "members", label: t("teamMembers") || "Members" },
                { key: "workspace", label: t("workspace") || "Workspace" },
                { key: "posts", label: t("posts") || "Posts" },
                { key: "files", label: t("files") || "Files" },
              ]}
            />

            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <OverviewSection
                  descriptionText={descriptionText}
                  recentActivity={recentActivity}
                  statusMeta={statusMeta}
                  findAssignees={findAssignees}
                  renderAssignee={renderAssignee}
                  groupSkills={groupSkillsWithRole}
                  t={t}
                />
                <MembersPanel
                  groupMembers={groupMembers}
                  mentor={mentor}
                  group={group}
                  onInvite={() => setShowModal(true)}
                  onAssignRole={handleAssignRole}
                  onKickMember={handleKickMember}
                  currentUserEmail={userInfo?.email}
                  t={t}
                  showStats={false}
                />
              </div>
            )}

            {/* MEMBERS */}
            {activeTab === "members" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                  <MembersPanel
                    groupMembers={groupMembers}
                    mentor={mentor}
                    group={group}
                    onInvite={() => setShowModal(true)}
                    onAssignRole={handleAssignRole}
                    onKickMember={handleKickMember}
                    currentUserEmail={userInfo?.email}
                    t={t}
                    showStats
                    contributionStats={contributionStats}
                    board={board}
                  />
                </div>
              </div>
            )}

            {/* WORKSPACE */}
            {activeTab === "workspace" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {t("workspace") || "Workspace"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t("workspaceIntro") ||
                        "Drag tasks across columns, assign owners, and keep momentum."}
                    </p>
                  </div>
                  {activeWorkspaceTab === "kanban" && (
                    <button
                      className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"
                      onClick={() => setIsColumnModalOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                      {t("newColumn") || "New Column"}
                    </button>
                  )}
                </div>

                {/* Sub-tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                  <button
                    onClick={() => setActiveWorkspaceTab("kanban")}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeWorkspaceTab === "kanban"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <FolderKanban className="w-4 h-4" />
                    {(t("kanban") || "Kanban").charAt(0).toUpperCase() +
                      (t("kanban") || "Kanban").slice(1)}
                  </button>
                  <button
                    onClick={() => setActiveWorkspaceTab("backlog")}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeWorkspaceTab === "backlog"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <ListTodo className="w-4 h-4" />
                    {(t("backlog") || "Backlog").charAt(0).toUpperCase() +
                      (t("backlog") || "Backlog").slice(1)}
                  </button>
                  <button
                    onClick={() => setActiveWorkspaceTab("milestones")}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeWorkspaceTab === "milestones"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Flag className="w-4 h-4" />
                    {(t("milestones") || "Milestones").charAt(0).toUpperCase() +
                      (t("milestones") || "Milestones").slice(1)}
                  </button>
                  <button
                    onClick={() => setActiveWorkspaceTab("reports")}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeWorkspaceTab === "reports"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    {(t("reports") || "Reports").charAt(0).toUpperCase() +
                      (t("reports") || "Reports").slice(1)}
                  </button>
                </div>

                {/* KANBAN SUB-TAB */}
                {activeWorkspaceTab === "kanban" && (
                  <KanbanTab
                    kanbanLoading={kanbanLoading}
                    kanbanError={kanbanError}
                    hasKanbanData={hasKanbanData}
                    filteredColumns={filteredColumns}
                    columnMeta={columnMeta}
                    setSelectedTask={setSelectedTask}
                    createTask={createTask}
                    deleteColumn={deleteColumn}
                    handleDragOver={handleDragOver}
                    handleDragEnd={handleDragEnd}
                    isColumnModalOpen={isColumnModalOpen}
                    setIsColumnModalOpen={setIsColumnModalOpen}
                    handleCreateColumn={handleCreateColumn}
                    t={t}
                    normalizeTitle={normalizeTitle}
                  />
                )}

                {/* BACKLOG SUB-TAB */}
                {activeWorkspaceTab === "backlog" && (
                  <BacklogTab
                    groupId={id}
                    columnMeta={columnMeta}
                    groupMembers={groupMembers}
                    onPromoteSuccess={() =>
                      refetchBoard({ showLoading: false })
                    }
                  />
                )}

                {/* MILESTONES SUB-TAB */}
                {activeWorkspaceTab === "milestones" && (
                  <MilestonesTab groupId={id} />
                )}

                {/* REPORTS SUB-TAB */}
                {activeWorkspaceTab === "reports" && (
                  <ReportsTab groupId={id} />
                )}
              </div>
            )}

            {/* FILES */}
            {activeTab === "files" && (
              <FilesPanel
                fileItems={fileItems}
                t={t}
                groupId={id}
                onUploadSuccess={loadGroupFiles}
              />
            )}

            {/* POSTS */}
            {activeTab === "posts" && (
              <GroupPostsTab groupId={id} groupData={group} />
            )}
          </div>
        </div>
      </div>

      {/* ---------------------
           MODALS
      ---------------------- */}
      <AddMemberModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAddMember}
        t={t}
      />

      <EditGroupModal
        open={editOpen}
        submitting={editSubmitting}
        form={editForm}
        errors={editErrors}
        memberCount={groupMembers.length}
        skills={availableSkills}
        skillsLoading={skillsLoading}
        onChange={handleEditChange}
        onSubmit={handleSubmitEdit}
        onClose={() => setEditOpen(false)}
        t={t}
      />

      <TaskModal
        task={selectedTask}
        groupId={id}
        members={kanbanMembers}
        groupDetail={group}
        onUpdateTask={updateTaskFields}
        onUpdateAssignees={updateTaskAssignees}
        onDeleteTask={deleteTask}
        onFetchComments={loadTaskComments}
        onAddComment={addTaskComment}
        onUpdateComment={updateTaskComment}
        onDeleteComment={deleteTaskComment}
        onClose={() => setSelectedTask(null)}
      />

      {/* New Column Modal */}
      <Modal
        title={t("newColumn") || "New Column"}
        open={isColumnModalOpen}
        onOk={handleCreateColumn}
        onCancel={() => {
          setIsColumnModalOpen(false);
          columnForm.resetFields();
        }}
        okText={t("create") || "Create"}
        cancelText={t("cancel") || "Cancel"}
      >
        <Form form={columnForm} layout="vertical">
          <Form.Item
            name="columnName"
            label={t("columnName") || "Column Name"}
            rules={[
              {
                required: true,
                message:
                  t("pleaseEnterColumnName") || "Please enter column name",
              },
            ]}
          >
            <Input placeholder={t("enterColumnName") || "Enter column name"} />
          </Form.Item>
          <Form.Item
            name="position"
            label={t("position") || "Position"}
            initialValue={0}
          >
            <Input type="number" placeholder="0" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
