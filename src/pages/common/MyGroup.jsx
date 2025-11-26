import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "../../hook/useTranslation";
import { useAuth } from "../../context/AuthContext";
import { GroupService } from "../../services/group.service";
import { BoardService } from "../../services/board.service";
import InfoCard from "../../components/common/my-group/InfoCard";
import AddMemberModal from "../../components/common/my-group/AddMemberModal";
import EditGroupModal from "../../components/common/my-group/EditGroupModal";
import LoadingState from "../../components/common/LoadingState";
import { notification } from "antd";
import { calculateProgressFromTasks } from "../../utils/group.utils";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { Modal, Form } from "antd";
import Column from "../../components/common/kanban/Column";
import TaskModal from "../../components/common/kanban/TaskModal";
import useKanbanBoard from "../../hook/useKanbanBoard";
import TabSwitcher from "../../components/common/my-group/TabSwitcher";
import OverviewSection from "../../components/common/my-group/OverviewSection";
import MembersPanel from "../../components/common/my-group/MembersPanel";
import FilesPanel from "../../components/common/my-group/FilesPanel";

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
  });
  const [editErrors, setEditErrors] = useState({});
  const loadedGroupIdRef = useRef(null);
  const [activeTab, setActiveTab] = useState("overview");
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [columnForm] = Form.useForm();

  // ---------------------------
  // Load Group & Board Data
  // ---------------------------
  useEffect(() => {
    if (!id) return;
    if (loadedGroupIdRef.current === id) return;

    loadedGroupIdRef.current = id;

    const loadData = async () => {
      try {
        setLoading(true);

        const [detailRes, membersRes, boardRes] = await Promise.allSettled([
          GroupService.getGroupDetail(id),
          GroupService.getListMembers(id),
          BoardService.getBoard(id),
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
          };
        });

        const currentEmail = (userInfo?.email || "").toLowerCase();
        const detailRole = (d.role || "").toLowerCase();
        const leaderFromMembers = normalizedMembers.some(
          (member) =>
            (member.email || "").toLowerCase() === currentEmail &&
            (member.role || "").toLowerCase() === "leader"
        );

        const boardData =
          boardRes.status === "fulfilled" ? boardRes.value?.data : null;

        const calculatedProgress = calculateProgressFromTasks(boardData);

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
          progress: calculatedProgress,
          mentor: d.mentor,
          status: d.status || "",
          statusText: d.status || "",
          maxMembers: Number(d.maxMembers || d.capacity || 5),
          majorId:
            d.majorId ||
            d.major?.id ||
            d.major?.majorId ||
            d.majorID ||
            "",
          topicId: d.topicId || d.topic?.id || "",
          topicName:
            d.topicName || d.topic?.title || d.topic?.name || "",
          canEdit: detailRole === "leader" || leaderFromMembers,
        });

        setGroupMembers(normalizedMembers);
        setBoard(boardData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, userInfo]);

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
            }
          : prev
      );

      setEditOpen(false);
    } catch (err) {
      console.error(err);
      notification.error({
        message: t("error") || "Failed to update group.",
      });
    } finally {
      setEditSubmitting(false);
    }
  };

  // Kanban Logic
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

  const fileItems = tasks
    .slice(0, 3)
    .map((task, idx) => ({
      name: task.title || `File ${idx + 1}`,
      owner: task.assignee || task.owner || "Team",
      size: task.size || "N/A",
      date:
        (task.updatedAt && new Date(task.updatedAt)) ||
        (task.createdAt && new Date(task.createdAt)) ||
        null,
    }))
    .filter(Boolean);

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
        assignee) ?? "";
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

  // ---------------------------
  // PAGE RENDER
  // ---------------------------
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
                  t={t}
                />
                <MembersPanel
                  groupMembers={groupMembers}
                  mentor={mentor}
                  group={group}
                  onInvite={() => setShowModal(true)}
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
                    t={t}
                    showStats
                    contributionStats={contributionStats}
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
                  <button
                    className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"
                    onClick={() => setIsColumnModalOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    {t("newColumn") || "New Column"}
                  </button>
                </div>

                {kanbanLoading ? (
                  <div className="text-sm text-gray-500">
                    {t("loading") || "Loading..."}
                  </div>
                ) : kanbanError ? (
                  <div className="text-sm text-red-500">
                    {kanbanError || t("error") || "Something went wrong"}
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                  >
                    {hasKanbanData ? (
                      <div className="mt-4 flex gap-6 overflow-x-auto pb-2">
                        {Object.entries(columnMeta || {})
                          .sort(
                            (a, b) =>
                              (a[1]?.position || 0) -
                              (b[1]?.position || 0)
                          )
                          .map(([colId, meta]) => {
                            const normalizedTitleValue = normalizeTitle(
                              meta?.title || colId
                            );
                            const statusForColumn =
                              normalizedTitleValue === "to_do"
                                ? "todo"
                                : normalizedTitleValue;

                            const allowQuickCreate = statusForColumn === "todo";

                            return (
                              <Column
                                key={colId}
                                id={colId}
                                meta={meta}
                                tasks={filteredColumns[colId] || []}
                                columnMeta={columnMeta}
                                onOpen={setSelectedTask}
                                onCreate={
                                  allowQuickCreate
                                    ? (quickPayload) => {
                                        createTask({
                                          columnId: colId,
                                          title:
                                            quickPayload?.title || "New Task",
                                          description: "",
                                          priority: "medium",
                                          status: statusForColumn,
                                          dueDate: null,
                                        });
                                      }
                                    : undefined
                                }
                                onDelete={() => {
                                  Modal.confirm({
                                    title:
                                      t("deleteColumn") || "Delete Column",
                                    content:
                                      t("deleteColumnConfirm") ||
                                      `Delete column "${
                                        columnMeta[colId]?.title || colId
                                      }"?`,
                                    okText: t("ok") || "OK",
                                    cancelText: t("cancel") || "Cancel",
                                    onOk: () => deleteColumn(colId),
                                  });
                                }}
                              />
                            );
                          })}
                      </div>
                    ) : (
                      <div className="mt-4 text-gray-500">
                        {t("noBoardData") || "No board data available."}
                      </div>
                    )}
                  </DndContext>
                )}
              </div>
            )}

            {/* FILES */}
            {activeTab === "files" && (
              <FilesPanel fileItems={fileItems} t={t} />
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
        formData={editForm}
        errors={editErrors}
        onChange={handleEditChange}
        onSubmit={handleSubmitEdit}
        onClose={() => setEditOpen(false)}
      />

      <TaskModal
        task={selectedTask}
        members={kanbanMembers}
        updateTaskFields={updateTaskFields}
        updateTaskAssignees={updateTaskAssignees}
        deleteTask={deleteTask}
        loadComments={loadTaskComments}
        addComment={addTaskComment}
        updateComment={updateTaskComment}
        deleteComment={deleteTaskComment}
        onClose={() => setSelectedTask(null)}
      />

    </div>
  );
}
