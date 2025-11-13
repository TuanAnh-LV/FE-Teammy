import React from "react";
import { X, Search, Loader2 } from "lucide-react";

export default function SelectTopicModal({
  t,
  open,
  group,
  topics = [],
  loading,
  assigning,
  search,
  selectedTopicId,
  onClose,
  onSearch,
  onSelect,
  onSubmit,
}) {
  if (!open || !group) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const topicIdValue = (topic) =>
    topic.topicId || topic.id || topic.idTopic || topic.topicID || "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdrop}
    >
      <div className="absolute inset-0 bg-black/40" />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-500">
              {t("selectTopic") || "Select topic"}
            </p>
            <h3 className="text-lg font-semibold text-gray-900">
              {group.title}
            </h3>
            <p className="text-sm text-gray-500">
              {group.topicTitle
                ? `${t("currentTopic") || "Current topic"}: ${group.topicTitle}`
                : t("noTopicAssigned") || "No topic assigned yet."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
            disabled={assigning}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={
                t("searchTopicPlaceholder") || "Search by keyword or lecturer"
              }
              className="w-full rounded-lg border border-gray-200 px-10 py-2 text-sm outline-none ring-blue-100 transition focus:border-blue-400 focus:ring-4"
            />
          </div>

          <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-3">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("loading") || "Loading..."}
              </div>
            ) : topics.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                {t("noTopicsFound") || "No topics found for this filter."}
              </div>
            ) : (
              <ul className="space-y-3">
                {topics.map((topic) => {
                  const value = topicIdValue(topic);
                  const isSelected = selectedTopicId === value;
                  return (
                    <li key={value || topic.title}>
                      <label
                        className={`flex cursor-pointer gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                          isSelected
                            ? "border-blue-500 bg-white shadow-sm"
                            : "border-transparent bg-white hover:border-blue-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name="topic"
                          value={value}
                          checked={isSelected}
                          onChange={() => onSelect(value)}
                          disabled={assigning}
                          className="mt-1 h-4 w-4 accent-blue-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {topic.title || topic.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {topic.description || t("noDescription") || ""}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                            {topic.status && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5">
                                {topic.status}
                              </span>
                            )}
                            {topic.createdBy && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5">
                                {topic.createdBy}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={assigning}
          >
            {t("cancel") || "Cancel"}
          </button>
          <button
            type="submit"
            disabled={!selectedTopicId || assigning}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {assigning
              ? t("saving") || "Saving..."
              : t("assignTopic") || "Assign topic"}
          </button>
        </div>
      </form>
    </div>
  );
}
