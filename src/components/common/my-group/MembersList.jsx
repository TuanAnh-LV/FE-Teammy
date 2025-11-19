import React from "react";
import { UserRound, UserPlus, UserX } from "lucide-react";
import { avatarFromEmail } from "../../../utils/helpers";

const formatRoleLabel = (role) => {
  if (!role) return "";
  return role
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export default function MembersList({
  members = [],
  title = "Team Members",
  inviteLabel = "Invite Members",
  emptyLabel = "No members yet",
  onInvite,
  onKick,
  canEdit = false,
  currentUserEmail = "",
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center gap-3">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-3">
        {members.length === 0 && (
          <p className="text-sm text-gray-400">{emptyLabel}</p>
        )}
        {members.map((member, index) => (
          <div
            key={member.email || member.id || index}
            className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2 transition hover:border-gray-200"
          >
            <img
              src={member.avatarUrl || avatarFromEmail(member.email, 80)}
              alt={member.name || member.email}
              className="h-10 w-10 rounded-full object-cover shadow"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {member.name || member.email}
              </p>
              {member.role && (
                <p className="text-xs font-medium text-gray-500 capitalize">
                  {formatRoleLabel(member.role)}
                </p>
              )}
              {member.email && (
                <p className="text-[12px] text-gray-400">{member.email}</p>
              )}
            </div>
            {(canEdit || onKick) && (
              <div className="flex items-center gap-2">
                {onKick && member.id &&
                  (member.email || "").toLowerCase() !==
                    (currentUserEmail || "").toLowerCase() && (
                    <button
                      type="button"
                      onClick={() => onKick(member)}
                      className="ml-2 inline-flex items-center gap-2 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <UserX className="h-4 w-4" />
                      Kick
                    </button>
                  )}
              </div>
            )}
          </div>
        ))}
      </div>

      {onInvite && (
        <button
          type="button"
          onClick={onInvite}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
        >
          <UserPlus className="h-4 w-4" />
          {inviteLabel}
        </button>
      )}
    </div>
  );
}
