import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../hook/useTranslation";
import { GroupService } from "../../services/group.service";
import ProjectToolbar from "../../components/common/my-project/ProjectToolbar";
import ProjectTable from "../../components/common/my-project/ProjectTable";
import CreateGroupModal from "../../components/common/my-project/CreateGroupModal";
import { notification } from "antd";



export default function MyProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  // ----- Modal state -----
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    field: "",
    description: "",
    maxMembers: 5,
  });
  const [errors, setErrors] = useState({});

  /** enrich server data & apply fixed fields if missing */
  const normalize = (g, i = 0) => {
    // status/field from BE could be g.status or g.role; keep human-friendly
    const status = (g.status || g.field || "recruiting").toLowerCase();
    const tone = status === "closed" ? "gray" : status === "recruiting" ? "blue" : "amber";

    return {
      id: String(g.groupId || g.id || `TMP-${i + 1}`),
      title: g.name || g.title || `Group ${i + 1}`,
      description: g.description || "No description yet.",
      status,
      tone,
      role: g.role || "Member",
      members: Number(g.members ?? g.currentMembers ?? 1),
      maxMembers: Number(g.maxMembers ?? 5),
      createdAt: g.createdAt || new Date().toISOString().slice(0, 10),
    };
  };

  /** table data + search */
  const data = useMemo(() => groups.map(normalize), [groups]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (g) =>
        g.id.toLowerCase().includes(q) ||
        g.title.toLowerCase().includes(q) ||
        g.status.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q)
    );
  }, [data, query]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Group name is required";
    if (!form.field.trim()) e.field = "Field is required";
    const mm = Number(form.maxMembers);
    if (!mm || mm < 1 || mm > 50) e.maxMembers = "Members must be between 1 and 50";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLeaveGroup = async (groupId) => {
    if (!confirm(`Leave group ${groupId}?`)) return;
    try {
      await GroupService.leaveGroup(groupId);
      notification.success({
        message: "You left the group.",
      });
      await fetchMyGroups();
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Failed to leave group. Please try again.",
      });
    }
  };

  const handleViewGroup = (groupId) => navigate(`/my-group/${groupId}`);

  const handleQueryChange = (value) => setQuery(value);

  const resetModal = () => {
    setForm({ name: "", field: "", description: "", maxMembers: 5 });
    setErrors({});
    setSubmitting(false);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const closeModal = () => {
    setOpen(false);
    resetModal();
  };

  const requestCloseModal = () => {
    if (submitting) return;
    closeModal();
  };

  const handleCreateGroup = async (e) => {
    e?.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      const payload = {
        name: form.name.trim(),
        field: form.field.trim(),
        description: form.description.trim(),
        maxMembers: Number(form.maxMembers) || 1,
      };
      const res = await GroupService.createGroup(payload);
      if (res?.data) {
        notification.success({
          message: "Group created!",
        });
        closeModal();
        await fetchMyGroups();
        // navigate(`/my-group/${res.data.id}`);
      }
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Failed to create group. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      const res = await GroupService.getMyGroups();
      const arr = Array.isArray(res?.data) ? res.data : [];

      // Normalize fields coming from BE
      const mapped = arr.map((g) => ({
        id: g.groupId || g.id,
        name: g.name || g.title,
        status: g.status || "recruiting",
        role: g.role || "Member",
        description: g.description || "",
        members: g.members ?? g.currentMembers ?? 1,
        maxMembers: g.maxMembers ?? 5,
        createdAt: g.createdAt,
      }));

      // If BE returns empty data, fallback to mock groups so UI stays informative
      const finalData =
        mapped.length === 0
          ? MOCK_GROUPS
          : mapped.map((g, i) => normalize(g, i));

      setGroups(finalData);
    } catch (e) {
      console.error(e);
      // Reuse mock data if the request fails to keep UI stable
      setGroups(MOCK_GROUPS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <div className="mx-auto max-w-6xl px-6 pt-10 pb-16 lg:px-0">
        <ProjectToolbar
          t={t}
          totalCount={filtered.length}
          query={query}
          onQueryChange={handleQueryChange}
          onCreate={() => setOpen(true)}
        />

        <ProjectTable
          t={t}
          loading={loading}
          projects={filtered}
          onView={handleViewGroup}
          onLeave={handleLeaveGroup}
        />

        <CreateGroupModal
          t={t}
          open={open}
          submitting={submitting}
          form={form}
          errors={errors}
          onClose={requestCloseModal}
          onSubmit={handleCreateGroup}
          onChange={handleFormChange}
        />
      </div>
    </div>
  );
}
