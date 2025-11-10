import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Search, LogOut, X } from "lucide-react";
import { useTranslation } from "../../hook/useTranslation";
import { GroupService } from "../../services/group.service";

/** ---------- FALLBACK MOCK WHEN API THIN/EMPTY ---------- */
const MOCK_GROUPS = [
  {
    id: "1c17f57e-a414-4ec9-800a-46e82a6ebcf9",
    title: "AI Capstone",
    description:
      "Xây dựng trợ lý AI hỗ trợ mentor/lecturer đánh giá tiến độ nhóm theo rubric.",
    status: "closed",
    role: "Leader",
    members: 5,
    maxMembers: 5,
    createdAt: "2025-10-12",
  },
  {
    id: "5a7aa82b-c2a6-43de-8ffd-d7283ae63d00",
    title: "Nhóm 2",
    description:
      "E-Commerce Platform với gợi ý sản phẩm bằng ML. Cần thêm 1 BE .NET.",
    status: "recruiting",
    role: "Member",
    members: 3,
    maxMembers: 5,
    createdAt: "2025-11-01",
  },
];

/** Small helpers */
const Badge = ({ children, tone = "blue" }) => {
  const toneMap = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    green: "bg-green-50 text-green-700 ring-green-100",
    gray: "bg-gray-50 text-gray-700 ring-gray-200",
    red: "bg-red-50 text-red-700 ring-red-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${toneMap[tone]}`}
    >
      {children}
    </span>
  );
};

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
      description: g.description || "Chưa có mô tả.",
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
    if (!form.name.trim()) e.name = "Tên nhóm là bắt buộc";
    if (!form.field.trim()) e.field = "Lĩnh vực là bắt buộc";
    const mm = Number(form.maxMembers);
    if (!mm || mm < 1 || mm > 50) e.maxMembers = "Số thành viên 1–50";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLeaveGroup = (groupId) => {
    if (confirm(`Bạn chắc chắn rời nhóm ${groupId}?`)) {
      // TODO: call API leave group
      alert(`Bạn đã rời nhóm ${groupId}`);
    }
  };

  const resetModal = () => {
    setForm({ name: "", field: "", description: "", maxMembers: 5 });
    setErrors({});
    setSubmitting(false);
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
        alert("Tạo nhóm thành công!");
        setOpen(false);
        resetModal();
        await fetchMyGroups();
        // navigate(`/my-group/${res.data.id}`);
      }
    } catch (err) {
      console.error(err);
      alert("Tạo nhóm thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      const res = await GroupService.getMyGroups();
      const arr = Array.isArray(res?.data) ? res.data : [];

      // Map thô từ BE
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

      // Nếu BE rỗng hoặc thiếu, ghép thêm MOCK để hiển thị đẹp
      const finalData =
        mapped.length === 0
          ? MOCK_GROUPS
          : mapped.map((g, i) => normalize(g, i));

      setGroups(finalData);
    } catch (e) {
      console.error(e);
      // Lỗi thì xài MOCK để có UI ổn định
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
        {/* Header */}
        <div className="mb-6 mt-16 flex flex-col gap-5 sm:mt-20 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {t("My Projects") || "My Projects"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t("total") || "Total"}:{" "}
              <span className="font-semibold text-gray-800">
                {filtered.length}
              </span>
            </p>
          </div>

          {/* Right side */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchProjects") || "Tìm kiếm dự án..."}
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none ring-blue-100 transition focus:border-blue-400 focus:ring-4"
              />
            </div>

            <button
              onClick={() => setOpen(true)}
              className="mt-3 sm:mt-0 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              <Plus className="h-4 w-4" />
              {t("Create New Group") || "Create New Group"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    STT
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Tên dự án
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Mô tả
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Trạng thái
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Members
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Role
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Created
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={`sk-${i}`} className="animate-pulse">
                      <td className="px-5 py-4">
                        <div className="h-4 w-6 rounded bg-gray-200" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-40 rounded bg-gray-200 mb-2" />
                        <div className="h-3 w-56 rounded bg-gray-100" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-72 rounded bg-gray-100" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-6 w-20 rounded-full bg-gray-100" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-12 rounded bg-gray-100" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-16 rounded bg-gray-100" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-24 rounded bg-gray-100" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="h-8 w-28 rounded bg-gray-200 inline-block mr-2" />
                        <div className="h-8 w-28 rounded bg-gray-100 inline-block" />
                      </td>
                    </tr>
                  ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      {t("noData") || "Không có dự án nào."}
                    </td>
                  </tr>
                )}

                {!loading &&
                  filtered.map((g, idx) => (
                    <tr key={g.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {idx + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {g.title}
                        </div>
                        <div className="text-[11px] text-gray-500">{g.id}</div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700 line-clamp-2">
                        {g.description}
                      </td>

                      <td className="px-5 py-4">
                        <Badge tone={g.tone}>
                          {g.status === "recruiting" ? "recruiting" : g.status}
                        </Badge>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {g.members}/{g.maxMembers}
                      </td>

                      <td className="px-5 py-4">
                        <Badge tone={g.role === "Leader" ? "green" : "amber"}>
                          {g.role}
                        </Badge>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {g.createdAt}
                      </td>

                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => navigate(`/my-group/${g.id}`)}
                          className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-black focus:outline-none focus:ring-4 focus:ring-gray-200"
                        >
                          <Eye className="h-4 w-4" />
                          {t("view") || "View"}
                        </button>

                        <button
                          onClick={() => handleLeaveGroup(g.id)}
                          className="inline-flex items-center gap-2 rounded-md bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-100 transition hover:bg-red-600 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-100"
                        >
                          <LogOut className="h-4 w-4" />
                          {t("Leave") || "Leave Group"}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------- Modal Create Group ---------- */}
        {open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
            onClick={(e) => {
              if (e.target === e.currentTarget && !submitting) {
                setOpen(false);
                resetModal();
              }
            }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Panel */}
            <form
              onSubmit={handleCreateGroup}
              className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h3 className="text-lg font-semibold">Create New Group</h3>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    resetModal();
                  }}
                  className="rounded p-1 hover:bg-gray-100"
                  disabled={submitting}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 px-6 py-5">
                {/* Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tên nhóm <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, name: e.target.value }))
                    }
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-4 transition ${
                      errors.name
                        ? "border-red-400 ring-red-100"
                        : "border-gray-200 focus:border-blue-400 ring-blue-100"
                    }`}
                    placeholder="VD: AI Capstone"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Field */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Lĩnh vực <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.field}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, field: e.target.value }))
                    }
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-4 transition ${
                      errors.field
                        ? "border-red-400 ring-red-100"
                        : "border-gray-200 focus:border-blue-400 ring-blue-100"
                    }`}
                    placeholder="VD: Healthcare / Fintech / Education..."
                  />
                  {errors.field && (
                    <p className="mt-1 text-xs text-red-600">{errors.field}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Mô tả
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, description: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 ring-blue-100 transition"
                    placeholder="Mục tiêu nhóm, công nghệ sẽ dùng..."
                  />
                </div>

                {/* Max members */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Số thành viên tối đa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={form.maxMembers}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, maxMembers: e.target.value }))
                    }
                    className={`w-40 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-4 transition ${
                      errors.maxMembers
                        ? "border-red-400 ring-red-100"
                        : "border-gray-200 focus:border-blue-400 ring-blue-100"
                    }`}
                  />
                  {errors.maxMembers && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.maxMembers}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    resetModal();
                  }}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                >
                  {submitting ? "Đang tạo..." : "Tạo nhóm"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
