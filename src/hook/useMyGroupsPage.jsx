// src/hooks/useMyGroupsPage.js
import { useEffect, useMemo, useState } from "react";
import { notification } from "antd";
import { GroupService } from "../services/group.service";
import { TopicService } from "../services/topic.service";
import { MajorService } from "../services/major.service";
import { normalizeGroup, mapPendingRequest } from "../utils/group.utils";

export const useMyGroupsPage = (t, navigate) => {
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
    if (!form.majorId.trim()) {
      e.majorId = t("majorIdRequired") || "Major ID is required";
    }
    const mm = Number(form.maxMembers);
    if (!mm || mm < 1 || mm > 50) {
      e.maxMembers = t("maxMembers") || "Members must be between 1 and 50";
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
        majorId: form.majorId.trim(),
      };
      if (form.topicId.trim()) payload.topicId = form.topicId.trim();
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
    if (!window.confirm(`Leave group ${groupId}?`)) return;
    try {
      await GroupService.leaveGroup(groupId);
      notification.success({
        message: t("leaveGroup") || "Leave group",
      });
      await fetchMyGroups();
    } catch (error) {
      console.error(error);
      notification.error({
        message: t("error") || "Failed to leave group.",
      });
    }
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
      const list = Array.isArray(res?.data) ? res.data : [];
      setTopics(list);
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
      setGroups(normalized);
      await loadPendingApplications(normalized);
    } catch (error) {
      console.error(error);
      setGroups([]);
      setPendingByGroup({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open) {
      fetchMajors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
  };
};
