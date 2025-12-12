import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function AssignRoleModal({
  isOpen,
  onClose,
  member,
  onAssign,
  t,
  submitting = false,
}) {
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    if (member && isOpen) {
      setSelectedRole(member.role || "");
    }
  }, [member, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRole && member) {
      const memberId =
        member.id ||
        member.userId ||
        member.userID ||
        member.memberId ||
        member.studentId ||
        member.accountId ||
        "";
      if (memberId) {
        onAssign(memberId, selectedRole);
      }
    }
  };

  if (!isOpen || !member) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget && !submitting) {
      onClose();
    }
  };

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
        className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t("assignRole") || "Assign Role"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {member.name || member.displayName}
            </p>
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

        <div className="px-6 py-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {t("selectRole") || "Select a role"}{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            placeholder={t("enterRole") || "Enter role (e.g., Frontend, Backend, Designer...)"}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-4 ring-blue-100 transition"
            required
            disabled={submitting}
          />
          <p className="mt-2 text-xs text-gray-500">
            {t("roleHint") || "Examples: Frontend, Backend, Mobile, DevOps, QA/Tester, Designer, Leader, Member"}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-gray-300 hover:!border-orange-400 hover:!text-orange-400 transition-all px-4 py-2.5 text-sm font-medium"
          >
            {t("cancel") || "Cancel"}
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedRole}
            className="inline-flex items-center justify-center rounded-lg !bg-[#FF7A00] hover:!opacity-90 px-4 py-2.5 text-sm font-semibold text-white transition focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
          >
            {submitting ? t("saving") || "Saving..." : t("save") || "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
