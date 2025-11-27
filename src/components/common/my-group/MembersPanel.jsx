import React from "react";
import { useNavigate } from "react-router-dom";

export default function MembersPanel({
  groupMembers,
  mentor,
  group,
  onInvite,
  t,
  showStats = false,
  contributionStats = [],
}) {
  const navigate = useNavigate();
  const openProfile = (member = {}) => {
    const memberId =
      member.id ||
      member.userId ||
      member.userID ||
      member.memberId ||
      member.accountId ||
      member.mentorId ||
      "";
    if (!memberId) return;
    navigate(`/profile/${memberId}`);
  };

  // When we only need the contribution cards (members tab), skip the other blocks.
  if (showStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {contributionStats.length ? (
          contributionStats.map((member, idx) => {
            const initials = (member.name || member.displayName || "U")
              .split(" ")
              .filter(Boolean)
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const fallbackTasks = [12, 8, 6];
            const fallbackContribution = [45, 32, 28];
            const contribution =
              Number.isFinite(member.contribution) && member.contribution >= 0
                ? member.contribution
                : fallbackContribution[idx % fallbackContribution.length];
            const tasksCompleted =
              Number.isFinite(member.taskCount) && member.taskCount >= 0
                ? member.taskCount
                : fallbackTasks[idx % fallbackTasks.length];
            return (
              <div
                key={member.id || member.email}
                className="border border-gray-200 rounded-2xl bg-white shadow-sm p-5 flex flex-col gap-3"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => openProfile(member)}
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name || "avatar"}
                      className="w-10 h-10 rounded-full object-cover border"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const fallbackName =
                          member.name || member.displayName || "User";
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          fallbackName
                        )}`;
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold">
                      {initials || "U"}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {member.name || member.displayName || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {member.role || t("member") || "Member"}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>{t("tasksCompleted") || "Tasks Completed"}</span>
                    <span className="font-semibold">{tasksCompleted}</span>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span>{t("contributionScore") || "Contribution Score"}</span>
                    <span className="font-semibold">{contribution}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${Math.min(contribution, 100)}%` }}
                    />
                  </div>
                </div>
                {member.email && (
                  <a
                    className="text-xs text-blue-600 mt-1 break-all"
                    href={`mailto:${member.email}`}
                  >
                    {member.email}
                  </a>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-sm text-gray-500">
            {t("noMembersYet") || "No members yet."}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("teamMembers") || "Team Members"}
          </h3>
          <span className="text-sm text-gray-400">
            {groupMembers?.length || 0}{" "}
            {groupMembers?.length === 1 ? "person" : "people"}
          </span>
        </div>
        <div className="mt-3 space-y-3">
          {groupMembers?.length ? (
            groupMembers.map((member) => (
              <div
                key={member.id || member.email}
                className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-3 bg-white shadow-sm"
              >
                <div
                  className="flex items-center gap-3 min-w-0 cursor-pointer"
                  onClick={() => openProfile(member)}
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name || member.displayName || "avatar"}
                      className="w-10 h-10 rounded-full object-cover border"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const fallbackName =
                          member.name || member.displayName || "User";
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          fallbackName
                        )}`;
                      }}
                    />
                  ) : member.user?.avatarUrl ? (
                    <img
                      src={member.user.avatarUrl}
                      alt={member.name || member.displayName || "avatar"}
                      className="w-10 h-10 rounded-full object-cover border"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const fallbackName =
                          member.name || member.displayName || "User";
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          fallbackName
                        )}`;
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                      {(member.name || member.displayName || "U")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {member.name || member.displayName || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {member.role || "Member"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              {t("noMembersYet") || "No members yet."}
            </p>
          )}
          {group?.canEdit && (
            <button
              type="button"
              onClick={onInvite}
              className="w-full border border-dashed border-blue-400 rounded-xl py-2 text-sm font-semibold text-blue-600 bg-white hover:bg-blue-50 transition"
            >
              {t("inviteMembers") || "Invite Members"}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("projectMentor") || "Mentor"}
        </h3>
        {mentor ? (
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => openProfile(mentor)}
          >
            {mentor.avatarUrl ? (
              <img
                src={mentor.avatarUrl}
                alt={mentor.displayName || mentor.name || "mentor"}
                className="w-12 h-12 rounded-full object-cover border bg-white"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const fallbackName = mentor.displayName || mentor.name || "Mentor";
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    fallbackName
                  )}`;
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold">
                {(mentor.displayName || mentor.name || "M").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-800">
                {mentor.displayName || mentor.name}
              </p>
              <p className="text-sm text-gray-500">
                {mentor.email || t("mentor") || "Mentor"}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            {t("noMentorAssigned") ||
              "No mentor assigned. Add a mentor to keep guidance aligned."}
          </div>
        )}
      </div>
    </div>
  );
}
