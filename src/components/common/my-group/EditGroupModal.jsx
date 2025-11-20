import React from "react";
import { X } from "lucide-react";

export default function EditGroupModal({
  t,
  open,
  submitting,
  form,
  errors,
  memberCount,
  onClose,
  onSubmit,
  onChange,
}) {
  if (!open) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget && !submitting) {
      onClose();
    }
  };

  const label = (key, fallback) => t(key) || fallback;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdrop}
    >
      <div className="absolute inset-0 bg-black/40" />
      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-500">
              {label("editGroup", "Edit group")}
            </p>
            <h3 className="text-lg font-semibold text-gray-900">
              {label("updateGroupDetails", "Update group details")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {label("groupName", "Group name")}
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
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {label("description", "Description")}
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-blue-100 transition focus:border-blue-400 focus:ring-4"
              placeholder={label(
                "updateGroupPlaceholder",
                "Share the latest direction, scope, or constraints."
              )}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {label("maxMembers", "Max members")}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={memberCount || 1}
              value={form.maxMembers}
              onChange={(e) => onChange("maxMembers", e.target.value)}
              className={`w-40 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-4 transition ${
                errors.maxMembers
                  ? "border-red-400 ring-red-100"
                  : "border-gray-200 focus:border-blue-400 ring-blue-100"
              }`}
            />
            <p className="mt-1 text-xs text-gray-500">
              {label(
                "maxMembersHint",
                "Cannot be lower than current member count"
              )}{" "}
              ({memberCount})
            </p>
            {errors.maxMembers && (
              <p className="mt-1 text-xs text-red-600">{errors.maxMembers}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {label("cancel", "Cancel")}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting
              ? label("saving", "Saving...")
              : label("saveChanges", "Save changes")}
          </button>
        </div>
      </form>
    </div>
  );
}
