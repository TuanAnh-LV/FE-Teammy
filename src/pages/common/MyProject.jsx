import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Search, LogOut } from "lucide-react";
import { useTranslation } from "../../hook/useTranslation";

const mock = [
  {
    id: "G001",
    title: "AI Healthcare Team",
    field: "Healthcare",
    description:
      "Phát triển mô hình ML hỗ trợ bác sĩ chẩn đoán và dự đoán kết quả điều trị.",
  },
];

export default function MyProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const data = useMemo(() => mock, []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (g) =>
        g.id.toLowerCase().includes(q) ||
        g.title.toLowerCase().includes(q) ||
        g.field.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q)
    );
  }, [data, query]);

  const handleLeaveGroup = (groupId) => {
    // TODO: Gọi API hoặc logic rời nhóm ở đây
    alert(`Bạn đã rời nhóm ${groupId}`);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <div className="mx-auto max-w-6xl px-6 pt-10 pb-16 lg:px-0">
        {/* Header */}
        <div className="mb-6 mt-16 flex flex-col gap-5 sm:mt-20 sm:flex-row sm:items-center sm:justify-between">
          {/* Left side */}
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
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchProjects") || "Tìm kiếm dự án..."}
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none ring-blue-100 transition focus:border-blue-400 focus:ring-4"
              />
            </div>

            {/* Create button */}
            <button
              onClick={() => navigate("/my-group/new")}
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
                    Field
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      {t("noData") || "Không có dự án nào."}
                    </td>
                  </tr>
                )}
                {filtered.map((g, idx) => (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {idx + 1}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {g.title}
                      </div>
                      <div className="text-xs text-gray-500">{g.id}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 line-clamp-2">
                      {g.description}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-100">
                        {g.field}
                      </span>
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
                        className="inline-flex items-center mt-4 gap-2 rounded-md bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-100 transition hover:bg-red-600 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-100"
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
      </div>
    </div>
  );
}
