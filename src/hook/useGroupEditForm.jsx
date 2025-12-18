import { useEffect, useState } from "react";
import { notification } from "antd";
import { SkillService } from "../services/skill.service";
import { GroupService } from "../services/group.service";


export const useGroupEditForm = ({ group, groupMembers, userInfo, t, setGroup }) => {
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

  useEffect(() => {
    if (group) {
      setEditForm({
        name: group.title || "",
        description: group.description || "",
        maxMembers: group.maxMembers || (groupMembers?.length ?? 0) || 5,
        majorId: group.majorId || "",
        topicId: group.topicId || "",
        skills: Array.isArray(group.skills)
          ? group.skills
          : typeof group.skills === "string" && group.skills
          ? group.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      });
    }
  }, [group, groupMembers?.length]);

  const validateEditForm = () => {
    const errors = {};
    if (!editForm.name.trim()) {
      errors.name = t("groupName") || "Group name is required";
    }
    const max = Number(editForm.maxMembers);
    const memberCount = groupMembers?.length ?? 0;
    if (!max || max < memberCount) {
      errors.maxMembers =
        t("maxMembersValidation") ||
        "Max members must be at least current member count.";
    }
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
      let groupSkills = [];
      if (Array.isArray(group.skills)) {
        groupSkills = group.skills;
      } else if (typeof group.skills === "string" && group.skills) {
        groupSkills = group.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      setEditForm((prev) => ({
        ...prev,
        name: group.title || "",
        description: group.description || "",
        maxMembers: group.maxMembers || (groupMembers?.length ?? 0) || 5,
        majorId: group.majorId || "",
        topicId: group.topicId || "",
        skills: groupSkills,
      }));

      fetchSkills();
    }
  }, [editOpen, group, groupMembers?.length, userInfo?.majorName]);

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

  return {
    editOpen,
    setEditOpen,
    editForm,
    editErrors,
    editSubmitting,
    availableSkills,
    skillsLoading,
    handleEditChange,
    handleSubmitEdit,
  };
};


