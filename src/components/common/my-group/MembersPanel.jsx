import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import AssignRoleModal from "./AssignRoleModal";

export default function MembersPanel({
  groupMembers,
  mentor,
  group,
  onInvite,
  onAssignRole,
  onKickMember,
  currentUserEmail,
  t,
  showStats = false,
  contributionStats = [],
  board = null,
}) {
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const navigate = useNavigate();

  // Calculate member contributions based on task assignments
  const calculateMemberContributions = () => {
    if (!board?.columns || !groupMembers?.length) return groupMembers || [];

    // Flatten tasks from all columns
    let allTasks = [];
    if (Array.isArray(board.columns)) {
      allTasks = board.columns.flatMap(col => col.tasks || []);
    } else if (typeof board.columns === 'object') {
      allTasks = Object.values(board.columns).flatMap(col => 
        Array.isArray(col.tasks) ? col.tasks : Object.values(col.tasks || {})
      );
    }

    const totalTasks = allTasks.length || 1;
    const memberTaskCount = {};

    // Count tasks per member
    allTasks.forEach(task => {
      const assignees = task.assignees || [];
      assignees.forEach(assignee => {
        const assigneeId = typeof assignee === 'string' 
          ? assignee 
          : assignee?.userId || assignee?.id;
        
        if (assigneeId) {
          memberTaskCount[assigneeId] = (memberTaskCount[assigneeId] || 0) + 1;
        }
      });
    });

    // Map to members with contribution percentage
    return groupMembers.map(member => {
      const memberId = member.id || member.userId || member.email;
      const taskCount = memberTaskCount[memberId] || 0;
      const contribution = Math.round((taskCount / totalTasks) * 100);

      return {
        ...member,
        taskCount,
        contribution
      };
    });
  };

  // Use calculated contributions if board data is available
  const memberStats = board ? calculateMemberContributions() : contributionStats;
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

  const getMemberId = (member) => {
    return (
      member.id ||
      member.userId ||
      member.userID ||
      member.memberId ||
      member.studentId ||
      member.accountId ||
      member.email ||
      ""
    );
  };

  const handleOpenAssignRole = (member) => {
    setSelectedMember(member);
    setAssignRoleOpen(true);
    setOpenMenuId(null);
  };

  const handleAssignRole = async (memberId, role) => {
    if (onAssignRole) {
      setAssignSubmitting(true);
      try {
        await onAssignRole(memberId, role);
        setAssignRoleOpen(false);
        setSelectedMember(null);
      } catch (error) {

      } finally {
        setAssignSubmitting(false);
      }
    }
  };

  const toggleMenu = (memberId) => {
    setOpenMenuId(openMenuId === memberId ? null : memberId);
  };

  const handleKickMember = async (member) => {
    if (onKickMember) {
      const memberId = getMemberId(member);
      await onKickMember(memberId, member.name || member.displayName || "this member");
    }
    setOpenMenuId(null);
  };

  const isLeader = (member) => {
    const memberEmail = (member.email || "").toLowerCase();
    const memberRole = (member.role || "").toLowerCase();
    const currentEmail = (currentUserEmail || "").toLowerCase();
    
    // Current user is leader and this is not the leader themselves
    return memberRole !== "leader" && currentEmail !== memberEmail;
  };

  // When we only need the contribution cards (members tab), skip the other blocks.
  if (showStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {memberStats.length ? (
          memberStats.map((member, idx) => {
            const initials = (member.name || member.displayName || "U")
              .split(" ")
              .filter(Boolean)
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const contribution = member.contribution || 0;
            const tasksCompleted = member.taskCount || 0;
            return (
              <div
                key={member.id || member.email}
                className="border border-gray-200 rounded-2xl bg-white shadow-sm p-5 flex flex-col gap-3 relative"
              >
                {/* Kebab Menu */}
                {group?.canEdit && (
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => toggleMenu(getMemberId(member))}
                      className="p-1 rounded hover:bg-gray-100 text-gray-500"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenuId === getMemberId(member) && (
                      <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => handleOpenAssignRole(member)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {t("assignRole") || "Assign Role"}
                        </button>
                        {group?.canEdit && isLeader(member) && (
                          <button
                            onClick={() => handleKickMember(member)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            {t("kickMember") || "Remove"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => openProfile(member)}
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name || "avatar"}
                      className="w-10 h-10 rounded-full object-cover"
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
                    <p className="text-xs text-gray-500 capitalize">
                      {(member.assignedRoles && member.assignedRoles.length > 0
                        ? member.assignedRoles.join(", ")
                        : member.role) || t("member") || "Member"}
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
    <>
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
                className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-3 bg-white shadow-sm relative"
              >
                <div
                  className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                  onClick={() => openProfile(member)}
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name || member.displayName || "avatar"}
                      className="w-10 h-10 rounded-full object-cover"
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
                      className="w-10 h-10 rounded-full object-cover"
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
                    <p className="text-xs text-gray-500 capitalize">
                      {(member.assignedRoles && member.assignedRoles.length > 0
                        ? member.assignedRoles.join(", ")
                        : member.role) || "Member"}
                    </p>
                  </div>
                </div>
                {group?.canEdit && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => toggleMenu(getMemberId(member))}
                      className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    {openMenuId === getMemberId(member) && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                          <button
                            type="button"
                            onClick={() => handleOpenAssignRole(member)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            {t("assignRole") || "Assign Role"}
                          </button>
                          {group?.canEdit && isLeader(member) && (
                            <button
                              type="button"
                              onClick={() => handleKickMember(member)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              {t("kickMember") || "Remove"}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
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
                className="w-12 h-12 rounded-full object-cover bg-white"
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

      <AssignRoleModal
        isOpen={assignRoleOpen}
        onClose={() => {
          setAssignRoleOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        onAssign={handleAssignRole}
        t={t}
        submitting={assignSubmitting}
      />
    </>
  );
}

