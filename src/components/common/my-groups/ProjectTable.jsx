import React from "react";
import { Eye, LogOut } from "lucide-react";
import Badge from "./Badge";

const formatStatus = (status = "") => {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case "recruiting":
      return "Recruiting";
    case "in-progress":
      return "In progress";
    case "open":
      return "Open";
    case "closed":
      return "Closed";
    default:
      if (!status) return "Unknown";
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export default function ProjectTable({
  t,
  loading,
  projects,
  onView,
  onLeave,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                #
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                {t?.("group") || "Group"}
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                {t?.("status") || "Status"}
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                {t?.("members") || "Members"}
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                {t?.("role") || "Role"}
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                {t?.("created") || "Created"}
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                {t?.("action") || "Action"}
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
                    <div className="mb-2 h-4 w-40 rounded bg-gray-200" />
                    <div className="h-3 w-56 rounded bg-gray-100" />
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
                    <div className="mr-2 inline-block h-8 w-28 rounded bg-gray-200" />
                    <div className="inline-block h-8 w-28 rounded bg-gray-100" />
                  </td>
                </tr>
              ))}

            {!loading && projects.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-500">
                  {t("noData") || "No groups found."}
                </td>
              </tr>
            )}

            {!loading &&
              projects.map((g, idx) => (
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

                  <td className="px-5 py-4">
                    <Badge tone={g.tone}>{formatStatus(g.status)}</Badge>
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

                  <td className="px-5 py-4 space-x-2 text-right">
                    <button
                      onClick={() => onView(g.id)}
                      className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-black focus:outline-none focus:ring-4 focus:ring-gray-200"
                    >
                      <Eye className="h-4 w-4" />
                      {t("view") || "View"}
                    </button>

                    <button
                      onClick={() => onLeave(g.id)}
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
  );
}
