import { useEffect, useMemo, useRef, useState } from "react";
import { notification, Modal } from "antd";
import { GroupService } from "../services/group.service";
import { MajorService } from "../services/major.service";
import { BoardService } from "../services/board.service";
import { SkillService } from "../services/skill.service";
import { ReportService } from "../services/report.service";
import { useInvitationRealtime } from "./useInvitationRealtime";
import { useAuth } from "../context/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { updatePendingList } from "../app/invitationSlice";

import { normalizeGroup, mapPendingRequest } from "../utils/group.utils";

export const useMyGroupsPage = (t, navigate, userInfo) => {
  const dispatch = useDispatch();
  const { token } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("groups");

  const [pendingByGroup, setPendingByGroup] = useState({});
  const [pendingLoading, setPendingLoading] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);

  const reduxApplications = useSelector(
    (state) => state.invitation?.applications || []
  );

  const { isConnected, joinGroupChannel, leaveGroupChannel } =
    useInvitationRealtime(token, userInfo?.userId || userInfo?.id, {
      onApplicationReceived: (payload) => {
        console.log("[MyGroups] Received PendingUpdated:", payload);

        dispatch(updatePendingList(payload));

        const count = payload.candidates?.length || 0;
        if (count > 0) {
          notification.success({
            message: t("newApplication") || "New Application",
            description: `You have ${count} new application${
              count > 1 ? "s" : ""
            }`,
            placement: "topRight",
            duration: 4,
          });
        }

        if (payload.groupId) {
          refreshPendingForGroup(payload.groupId);
        }
      },
    });

  useEffect(() => {
    if (activeTab === "applications" && isConnected) {
      const leaderGroups = groups.filter((g) => g.isLeader);

      console.log(
        "[MyGroups] 🎯 Joining SignalR groups for leaders:",
        leaderGroups.map((g) => g.id)
      );

      // Join all leader groups
      leaderGroups.forEach((group) => {
        console.log(`[MyGroups] Attempting to join group: ${group.id}`);
        joinGroupChannel(group.id);
      });

      // Cleanup: leave all groups when switching tab or unmounting
      return () => {
        console.log("[MyGroups] 👋 Leaving all groups");
        leaderGroups.forEach((group) => {
          leaveGroupChannel(group.id);
        });
      };
    }
  }, [activeTab, groups, isConnected]);

  // Sync Redux applications to local state
  useEffect(() => {
    if (reduxApplications.length > 0) {
      // Group applications by groupId
      const grouped = {};
      reduxApplications.forEach((app) => {
        if (!grouped[app.groupId]) {
          grouped[app.groupId] = [];
        }
        grouped[app.groupId].push(mapPendingRequest(app));
      });

      setPendingByGroup((prev) => ({
        ...prev,
        ...grouped,
      }));
    }
  }, [reduxApplications]);

  // Modal state
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    maxMembers: 5,
    majorId: "",
    topicId: "",
    skills: [],
  });
  const [errors, setErrors] = useState({});
  const [majors, setMajors] = useState([]);
  const [majorsLoading, setMajorsLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [board, setBoard] = useState(null);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const hasFetchedGroupsRef = useRef(false);
  const majorsFetchLock = useRef(false);

  const groupsById = useMemo(() => {
    const map = new Map();
    groups.forEach((g) => map.set(g.id, g));
    return map;
  }, [groups]);

  const pendingTotal = useMemo(
    () =>
      Object.values(pendingByGroup).reduce(
        (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
        0
      ),
    [pendingByGroup]
  );

  const heroStats = useMemo(
    () => [
      {
        label: t("activeGroups") || "Active groups",
        value: groups.filter((g) => g.status !== "closed").length,
      },
      {
        label: t("pendingApplications") || "Pending applications",
        value: pendingTotal,
      },
    ],
    [groups, pendingTotal, t]
  );

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t("groupName") || "Group name is required";

    // Remove majorId validation - no longer required

    const mm = Number(form.maxMembers);
    if (!mm || mm < 4 || mm > 6) {
      e.maxMembers = "Max members must be between 4 and 6";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetModal = () => {
    setForm({
      name: "",
      description: "",
      maxMembers: 5,
      majorId: "",
      topicId: "",
      skills: [],
    });
    setErrors({});
    setSubmitting(false);
  };

  const closeModal = () => {
    setOpen(false);
    resetModal();
  };

  const requestCloseModal = () => {
    if (!submitting) closeModal();
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateGroup = async (e) => {
    e?.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        maxMembers: Number(form.maxMembers) || 1,
      };
      if (form.skills && form.skills.length > 0) {
        payload.skills = form.skills;
      }
      const res = await GroupService.createGroup(payload);
      if (res?.data) {
        notification.success({ message: t("success") || "Group created!" });
        closeModal();
        await fetchMyGroups();
      }
    } catch (error) {
      notification.error({
        message: t("error") || "Failed to create group.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewGroup = (groupId) => navigate(`/my-group/${groupId}`);

  const handleLeaveGroup = async (groupId) => {
    const group = groups.find((g) => g.id === groupId);
    const isActiveGroup = group && group.status === "active";

    Modal.confirm({
      title: t("confirmLeaveGroup") || "Leave Group",
      content: isActiveGroup
        ? t("leaveActiveGroupWarning") ||
          "This group is currently active. Leaving will remove you from all ongoing activities. Are you sure you want to leave?"
        : t("confirmLeaveGroupMessage") ||
          `Are you sure you want to leave this group?`,
      okText: t("leave") || "Leave",
      cancelText: t("cancel") || "Cancel",
      okButtonProps: { danger: true },
      onOk: async () => {
        // Check if group is active before attempting to leave
        if (isActiveGroup) {
          notification.error({
            message: t("cannotLeaveActiveGroup") || "Cannot leave active group",
            description:
              t("cannotLeaveActiveGroupDesc") ||
              "You cannot leave a group that is currently active. Please wait until the group status changes or contact your mentor.",
            duration: 5,
          });
          return;
        }

        try {
          await GroupService.leaveGroup(groupId);
          notification.success({
            message: t("leaveGroupSuccess") || "Successfully left the group",
          });
          await fetchMyGroups();
        } catch (error) {
          // Check if error is 409 Conflict (need to transfer leadership)
          if (error?.response?.status === 409) {
            notification.error({
              message: t("cannotLeaveAsLeader") || "Cannot leave as leader",
              description:
                t("transferLeadershipFirst") ||
                "You must transfer leadership to another member before leaving the group. Please assign a new leader first.",
              duration: 6,
            });
          } else {
            notification.error({
              message: t("error") || "Error",
              description:
                error?.response?.data?.message ||
                t("failedToLeaveGroup") ||
                "Failed to leave group.",
              duration: 4,
            });
          }
        }
      },
    });
  };

  const handleApprove = async (groupId, request) => {
    try {
      const payload = {
        type: request.type || "application",
        postId: request.postId || "",
      };
      await GroupService.acceptJoinRequest(groupId, request.id, payload);
      setPendingByGroup((prev) => {
        const clone = { ...prev };
        clone[groupId] = (clone[groupId] || []).filter(
          (item) => item.id !== request.id
        );
        return clone;
      });
      notification.success({
        message: t("approve") || "Approved",
      });
    } catch (error) {
      notification.error({
        message: t("approveFailed") || "Approve failed",
      });
    }
  };

  const handleReject = async (groupId, request) => {
    try {
      const payload = {
        type: request.type || "application",
        postId: request.postId || "",
      };
      await GroupService.rejectJoinRequest(groupId, request.id, payload);
      setPendingByGroup((prev) => {
        const clone = { ...prev };
        clone[groupId] = (clone[groupId] || []).filter(
          (item) => item.id !== request.id
        );
        return clone;
      });
      notification.info({
        message: t("reject") || "Rejected",
      });
    } catch (error) {
      notification.error({
        message: t("rejectFailed") || "Reject failed",
      });
    }
  };

  const fetchMajors = async () => {
    if (majors.length > 0) return;
    setMajorsLoading(true);
    try {
      const res = await MajorService.getMajors();
      const data = Array.isArray(res?.data) ? res.data : [];
      setMajors(data);
    } catch (error) {
      notification.error({
        message: t("error") || "Failed to load majors.",
      });
    } finally {
      setMajorsLoading(false);
    }
  };

  const loadPendingApplications = async (dataset) => {
    const leaderGroups = dataset.filter((g) => g.isLeader);
    setPendingLoading(true);
    setInvitationsLoading(true);
    try {
      const entries = await Promise.all(
        leaderGroups.map(async (group) => {
          try {
            const res = await GroupService.getJoinRequests(group.id);
            const list = Array.isArray(res?.data) ? res.data : [];
            return [group.id, list];
          } catch (error) {
            return [group.id, []];
          }
        })
      );

      // Separate applications and invitations
      const applicationsByGroup = {};
      let allInvitations = [];

      entries.forEach(([groupId, list]) => {
        const applications = list.filter(
          (item) => item.type === "application" || !item.type
        );
        const invitations = list.filter((item) => item.type === "invitation");

        // Group applications by groupId
        if (applications.length > 0) {
          applicationsByGroup[groupId] = applications.map(mapPendingRequest);
        }

        // Collect all invitations (don't map, keep original structure)
        allInvitations = allInvitations.concat(invitations);
      });

      setPendingByGroup(applicationsByGroup);
      setInvitations(allInvitations);
    } catch (error) {
      setPendingByGroup({});
      setInvitations([]);
    } finally {
      setPendingLoading(false);
      setInvitationsLoading(false);
    }
  };

  // Refresh pending applications for a specific group
  const refreshPendingForGroup = async (groupId) => {
    try {
      const res = await GroupService.getJoinRequests(groupId);
      const list = Array.isArray(res?.data) ? res.data : [];

      const applications = list.filter(
        (item) => item.type === "application" || !item.type
      );

      setPendingByGroup((prev) => ({
        ...prev,
        [groupId]: applications.map(mapPendingRequest),
      }));
    } catch (error) {
      console.error("Failed to refresh pending for group:", groupId, error);
    }
  };

  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      const res = await GroupService.getMyGroups();
      const arr = Array.isArray(res?.data) ? res.data : [];
      const normalized = arr.map((g, idx) => normalizeGroup(g, idx));

      // Load completion percent from tracking reports API for each group
      const groupsWithProgress = await Promise.all(
        normalized.map(async (group) => {
          try {
            const reportRes = await ReportService.getProjectReport(group.id);
            const completionPercent =
              reportRes?.data?.project?.completionPercent ?? 0;
            return {
              ...group,
              progress: completionPercent,
            };
          } catch (error) {
            return group; // Return group with original progress if report fetch fails
          }
        })
      );

      setGroups(groupsWithProgress);
      await loadPendingApplications(groupsWithProgress);
    } catch (error) {
      setGroups([]);
      setPendingByGroup({});
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoardTask = async (groupId) => {
    if (!groupId) return;
    try {
      setLoading(true);
      const res = await BoardService.getBoard(groupId);

      const data = res?.data || null;
      setBoard(data);
      return data;
    } catch (error) {}
  };

  const getAllTasksFromBoard = (board) => {
    if (!board?.columns) return [];
    return board.columns.flatMap((column) => column.tasks || []);
  };

  useEffect(() => {
    if (hasFetchedGroupsRef.current) return;
    hasFetchedGroupsRef.current = true;
    fetchMyGroups();
  }, []);

  useEffect(() => {
    if (!open) {
      majorsFetchLock.current = false;
      return;
    }
    if (majorsFetchLock.current) return;
    majorsFetchLock.current = true;
    fetchMajors();
    fetchSkills();
  }, [open]);

  const fetchSkills = async () => {
    try {
      setSkillsLoading(true);
      const userMajor = userInfo?.majorName || "Software Engineering";
      const params = {
        major: userMajor,
        pageSize: 100,
      };
      const response = await SkillService.list(params, false);

      // Try different possible structures
      let data = [];
      if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response?.data?.items && Array.isArray(response.data.items)) {
        data = response.data.items;
      }

      setSkills(data);
    } catch (error) {
      setSkills([]);
    } finally {
      setSkillsLoading(false);
    }
  };

  const activeApplications = Object.entries(pendingByGroup).filter(
    ([, list]) => Array.isArray(list) && list.length > 0
  );

  return {
    // state
    groups,
    loading,
    heroStats,
    activeTab,
    setActiveTab,
    open,
    submitting,
    form,
    errors,
    pendingByGroup,
    pendingLoading,
    pendingTotal,
    groupsById,
    activeApplications,
    invitations,
    invitationsLoading,
    majors,
    majorsLoading,
    skills,
    skillsLoading,
    board,
    loadingBoard,

    // handlers
    setOpen,
    handleFormChange,
    handleCreateGroup,
    requestCloseModal,
    handleViewGroup,
    handleLeaveGroup,
    handleApprove,
    handleReject,

    //board
    fetchBoardTask,
    getAllTasksFromBoard,
  };
};
