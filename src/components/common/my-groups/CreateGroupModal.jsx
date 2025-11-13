import React from "react";
import { X } from "lucide-react";

export default function CreateGroupModal({
  t,
  open,
  submitting,
  form,
  errors,
  majors = [],
  majorsLoading = false,
  onClose,
  onSubmit,
  onChange,
}) {
  if (!open) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={handleBackdrop}
    >
      <div className="absolute inset-0 bg-black/40" />

      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold">
            {t("createNewGroup") || "Create New Group"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100"
            disabled={submitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t("groupName") || "Group name"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-4 transition ${
                errors.name
                  ? "border-red-400 ring-red-100"
                  : "border-gray-200 focus:border-blue-400 ring-blue-100"
              }`}
              placeholder="E.g., AI Capstone"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t("majorId") || "Major"} <span className="text-red-500">*</span>
            </label>
            <div
              className={`rounded-lg border px-3 py-2 transition focus-within:ring-4 ${
                errors.majorId
                  ? "border-red-400 ring-red-100"
                  : "border-gray-200 focus-within:border-blue-400 ring-blue-100"
              }`}
            >
              <select
                value={form.majorId}
                onChange={(e) => onChange("majorId", e.target.value)}
                disabled={majorsLoading}
                className="w-full border-none bg-transparent text-sm outline-none"
              >
                <option value="">
                  {majorsLoading
                    ? t("loading") || "Loading..."
                    : t("selectMajor") || "Select major"}
                </option>
                {majors.map((major) => (
                  <option key={major.majorId || major.id} value={major.majorId || major.id}>
                    {major.majorName || major.name || major.title}
                  </option>
                ))}
              </select>
            </div>
            {errors.majorId && (
              <p className="mt-1 text-xs text-red-600">{errors.majorId}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t("description") || "Description"}
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-blue-100 transition focus:border-blue-400 focus:ring-4"
              placeholder="Team goals, preferred tech stack..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t("maxMembers") || "Max members"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={form.maxMembers}
              onChange={(e) => onChange("maxMembers", e.target.value)}
              className={`w-40 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-4 transition ${
                errors.maxMembers
                  ? "border-red-400 ring-red-100"
                  : "border-gray-200 focus:border-blue-400 ring-blue-100"
              }`}
            />
            {errors.maxMembers && (
              <p className="mt-1 text-xs text-red-600">{errors.maxMembers}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("topicId") || "Topic ID"}
              </label>
              <input
                value={form.topicId}
                onChange={(e) => onChange("topicId", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 ring-blue-100 transition"
                placeholder="Optional topic id"
              />
            </div> */}
            {/* <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("semesterId") || "Semester ID"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                value={form.semesterId}
                onChange={(e) => onChange("semesterId", e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-4 transition ${
                  errors.semesterId
                    ? "border-red-400 ring-red-100"
                    : "border-gray-200 focus:border-blue-400 ring-blue-100"
                }`}
                placeholder="uuid of semester"
              />
              {errors.semesterId && (
                <p className="mt-1 text-xs text-red-600">{errors.semesterId}</p>
              )}
            </div> */}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={submitting}
          >
            {t("cancel") || "Cancel"}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg bg-[#FF7A00] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
          >
            {submitting
              ? t("creating") || "Creating..."
              : t("createGroup") || "Create group"}
          </button>
        </div>
      </form>
    </div>
  );
}
