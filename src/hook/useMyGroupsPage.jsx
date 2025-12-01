// src/hooks/useMyGroupsPage.js
import { useEffect, useMemo, useRef, useState } from "react";
import { notification, Modal } from "antd";
import { GroupService } from "../services/group.service";
import { TopicService } from "../services/topic.service";
import { MajorService } from "../services/major.service";
import { BoardService } from "../services/board.service";
import { SkillService } from "../services/skill.service";

import { normalizeGroup, mapPendingRequest, calculateProgressFromTasks } from "../utils/group.utils";
import { use } from "react";

export const useMyGroupsPage = (t, navigate, userInfo) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("groups");

  const [pendingByGroup, setPendingByGroup] = useState({});
  const [pendingLoading, setPendingLoading] = useState(false);

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
  const [topicModalGroup, setTopicModalGroup] = useState(null);
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [assigningTopic, setAssigningTopic] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [topicSearch, setTopicSearch] = useState("");
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
      console.error(error);
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
        ? (t("leaveActiveGroupWarning") || "This group is currently active. Leaving will remove you from all ongoing activities. Are you sure you want to leave?")
        : (t("confirmLeaveGroupMessage") || `Are you sure you want to leave this group?`),
      okText: t("leave") || "Leave",
      cancelText: t("cancel") || "Cancel",
      okButtonProps: { danger: true },
      onOk: async () => {
        // Check if group is active before attempting to leave
        if (isActiveGroup) {
          notification.error({
            message: t("cannotLeaveActiveGroup") || "Cannot leave active group",
            description: t("cannotLeaveActiveGroupDesc") || "You cannot leave a group that is currently active. Please wait until the group status changes or contact your mentor.",
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
          console.error(error);
          notification.error({
            message: t("error") || "Failed to leave group.",
          });
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
      console.error(error);
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
      console.error(error);
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
      console.error(error);
      notification.error({
        message: t("error") || "Failed to load majors.",
      });
    } finally {
      setMajorsLoading(false);
    }
  };

  const fetchTopics = async (group, keyword = "") => {
    if (!group) return;
    setTopicsLoading(true);
    try {
      const params = {
        q: keyword.trim() || undefined,
        majorId: group.majorId || undefined,
      };
      const res = await TopicService.getTopics(params);
      const raw = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : [];
      const openTopics = raw.filter(
        (topic) =>
          String(topic?.status || topic?.topicStatus || topic?.state || "").toLowerCase() ===
          "open"
      );
      setTopics(openTopics);
    } catch (error) {
      console.error(error);
      notification.error({
        message: t("error") || "Failed to load topics.",
      });
    } finally {
      setTopicsLoading(false);
    }
  };

  const handleOpenTopicModal = (group) => {
    if (!group) return;
    setTopicModalGroup(group);
    setSelectedTopicId(group.topicId || "");
    setTopicSearch("");
    fetchTopics(group, "");
  };

  const handleCloseTopicModal = () => {
    if (assigningTopic) return;
    setTopicModalGroup(null);
    setSelectedTopicId("");
    setTopicSearch("");
    setTopics([]);
  };

  const handleSearchTopics = (value) => {
    setTopicSearch(value);
    if (topicModalGroup) {
      fetchTopics(topicModalGroup, value);
    }
  };

  const handleAssignTopic = async () => {
    if (!selectedTopicId || !topicModalGroup) return;
    try {
      setAssigningTopic(true);
      await GroupService.assignTopic(topicModalGroup.id, selectedTopicId);
      notification.success({
        message: t("updateSuccess") || "Topic assigned successfully.",
      });
      handleCloseTopicModal();
      await fetchMyGroups();
    } catch (error) {
      console.error(error);
      notification.error({
        message: t("error") || "Failed to assign topic.",
      });
    } finally {
      setAssigningTopic(false);
    }
  };

  const canSelectTopic = (group) =>
    Boolean(group) && group.isLeader && group.members >= group.maxMembers;

  const loadPendingApplications = async (dataset) => {
    const leaderGroups = dataset.filter((g) => g.isLeader);
    if (leaderGroups.length === 0) {
      setPendingByGroup({});
      return;
    }
    setPendingLoading(true);
    try {
      const entries = await Promise.all(
        leaderGroups.map(async (group) => {
          try {
            const res = await GroupService.getJoinRequests(group.id);
            const list = Array.isArray(res?.data)
              ? res.data.map(mapPendingRequest)
              : [];
            return [group.id, list];
          } catch (error) {
            console.error(error);
            return [group.id, []];
          }
        })
      );
      setPendingByGroup(Object.fromEntries(entries));
    } finally {
      setPendingLoading(false);
    }
  };

  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      const res = await GroupService.getMyGroups();
      const arr = Array.isArray(res?.data) ? res.data : [];
      const normalized = arr.map((g, idx) => normalizeGroup(g, idx));
      
      // Load board data for each group to calculate progress from tasks
      const groupsWithProgress = await Promise.all(
        normalized.map(async (group) => {
          try {
            const boardRes = await BoardService.getBoard(group.id);
            const boardData = boardRes?.data || null;
            const calculatedProgress = calculateProgressFromTasks(boardData);
            return {
              ...group,
              progress: calculatedProgress,
            };
          } catch (error) {
            console.error(`Failed to load board for group ${group.id}:`, error);
            return group; // Return group with original progress if board fetch fails
          }
        })
      );
      
      setGroups(groupsWithProgress);
      await loadPendingApplications(groupsWithProgress);
    } catch (error) {
      console.error(error);
      setGroups([]);
      setPendingByGroup({});
    } finally {
      setLoading(false);
    }
  };

  const fetchBoardTask = async (groupId) => {
    if (!groupId) return;
    try {
      setLoading(true);
      const res = await BoardService.getBoard(groupId);
      console.log(res);
      const data = res?.data || null;
      setBoard(data);
      return data;
    }catch (error) {
      console.error(error);
    }
  } 

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
        pageSize: 100
      };
      const response = await SkillService.list(params, false);
      console.log("Skills API full response:", response);
      console.log("response.data:", response?.data);
      console.log("response.data type:", typeof response?.data);
      
      // Try different possible structures
      let data = [];
      if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response?.data?.items && Array.isArray(response.data.items)) {
        data = response.data.items;
      }
      
      console.log("Final parsed skills:", data);
      console.log("First skill sample:", data[0]);
      setSkills(data);
    } catch (error) {
      console.error("Error fetching skills:", error);
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
    topicModalGroup,
    topics,
    topicsLoading,
    assigningTopic,
    selectedTopicId,
    topicSearch,
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
    handleOpenTopicModal,
    handleCloseTopicModal,
    handleSearchTopics,
    handleAssignTopic,
    setSelectedTopicId,
    canSelectTopic,

    //board
    fetchBoardTask,
    getAllTasksFromBoard,
  };
};
