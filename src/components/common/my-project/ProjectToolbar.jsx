import React from "react";
import { Plus, Search } from "lucide-react";

export default function ProjectToolbar({
  t,
  totalCount,
  query,
  onQueryChange,
  onCreate,
}) {
  return (
    <div className="mb-6 mt-16 flex flex-col gap-5 sm:mt-20 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          {t("myProjects") || "My Projects"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("total") || "Total"}:{" "}
          <span className="font-semibold text-gray-800">{totalCount}</span>
        </p>
      </div>

      <div className="flex w-full flex-col sm:w-auto sm:flex-row sm:items-center sm:gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={t("searchProjects") || "Search projects..."}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none ring-blue-100 transition focus:border-blue-400 focus:ring-4"
          />
        </div>

        <button
          onClick={onCreate}
          className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF7A00] px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-orange-100 sm:mt-0"
        >
          <Plus className="h-4 w-4" />
          {t("createNewGroup") || "Create New Group"}
        </button>
      </div>
    </div>
  );
}
