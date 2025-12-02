import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Crown,
  Users,
  ClipboardList,
  UserPlus,
  ArrowRight,
  FileText,
  Activity,
} from "lucide-react";
import { useTranslation } from "../../hook/useTranslation";
import { useAuth } from "../../context/AuthContext";
import CreateGroupModal from "../../components/common/my-groups/CreateGroupModal";
import { useMyGroupsPage } from "../../hook/useMyGroupsPage";

export default function MyGroupsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [applicationSubTab, setApplicationSubTab] = useState("applications");

  const formatRoleLabel = (role) => {
    if (!role) return "";
    return role
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const getInitials = (name = "") => {
    const trimmed = name.trim();
    if (!trimmed) return "?";
    const parts = trimmed.split(/\s+/).slice(0, 2);
    return parts.map((part) => part.charAt(0).toUpperCase()).join("");
  };

  const getRoleLabel = (group) => {
    if (group.isLeader) {
      const leaderLabel =
        t("teamLeader") || t("leader") || group.displayRole || "Team Leader";
      return formatRoleLabel(leaderLabel);
    }

    const normalizedRoleKey = group.displayRole
      ? typeof group.displayRole === "string"
        ? group.displayRole.toLowerCase()
        : group.displayRole
      : null;

    const translatedRole = normalizedRoleKey ? t(normalizedRoleKey) : null;

    return (
      translatedRole ||
      formatRoleLabel(group.displayRole) ||
      t("member") ||
      "Member"
    );
  };

  const {
    groups,
    loading,
    heroStats,
    activeTab,
    setActiveTab,
    open,
    submitting,
    form,
    errors,
    pendingLoading,
    activeApplications,
    pendingTotal,
    groupsById,
    invitations,
    invitationsLoading,
    setOpen,
    handleFormChange,
    handleCreateGroup,
    requestCloseModal,
    handleViewGroup,
    handleLeaveGroup,
    handleApprove,
    handleReject,
    majors,
    majorsLoading,
    skills,
    skillsLoading,
  } = useMyGroupsPage(t, navigate, userInfo);

  const tabs = [
    {
      key: "groups",
      label: t("myGroups") || "My Groups",
      icon: <Users className="!w-4 !h-4" />,
    },
    {
      key: "applications",
      label: t("applications") || "Applications",
      icon: <FileText className="!w-4 !h-4" />,
    },
    {
      key: "overview",
      label: t("overview") || "Overview",
      icon: <Activity className="!w-4 !h-4" />,
    },
  ];

  const heroStatsWithIcons = [
    {
      ...heroStats[0],
      icon: <Users className="!w-4 !h-4 text-[#627084]" />,
    },
    {
      ...heroStats[1],
      icon: <ClipboardList className="!w-4 !h-4 text-[#627084]" />,
    },
  ];

  const overviewCards = [
    {
      title: t("activeGroups") || "Active groups",
      value: heroStats[0]?.value ?? 0,
      description: t("groups") || "Groups you are part of",
    },
    {
      title: t("pendingApplications") || "Pending applications",
      value: pendingTotal,
      description: t("pendingRequests") || "Awaiting your review",
    },
    {
      title: t("created") || "Created",
      value: groups.length
        ? new Date(groups[0].createdAt).toLocaleDateString()
        : "--",
      description: t("mostRecentGroup") || "Most recent group created",
    },
  ];

  const renderGroupsTab = () => {
    if (loading) {
      return (
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={`group-skeleton-${idx}`}
              className="animate-pulse space-y-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="h-6 w-48 rounded bg-gray-200" />
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="flex gap-3">
                <div className="h-3 flex-1 rounded bg-gray-100" />
                <div className="h-3 flex-1 rounded bg-gray-100" />
              </div>
              <div className="h-9 rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      );
    }

    if (groups.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-base font-semibold text-gray-800">
            {t("noData") || "No groups found"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {t("createGroup") || "Create a new group to get started."}
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        {groups.map((group) => (
          <div
            key={group.id}
            className="rounded-lg border border-gray-200 bg-white p-4 md:p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-3 md:gap-4">
              <div>
                <h3 className="mt-1 text-base md:text-[18px] font-bold text-gray-900">
                  {group.title}
                </h3>
                <p className="pt-1 text-xs md:text-sm text-[#627084]">
                  {group.field}
                </p>

                <p className="mt-2 line-clamp-3 text-xs md:text-sm text-[#1d2530]">
                  {group.description}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`inline-flex items-center rounded-full px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-semibold ${
                    group.isLeader
                      ? "bg-[#3182ed] text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="whitespace-nowrap capitalize leading-none">
                    {getRoleLabel(group)}
                  </span>
                </span>
                {group.isLeader && (
                  <Crown className="!h-3.5 !w-3.5 md:!h-4 md:!w-4 text-amber-400" />
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-4 text-sm text-gray-600 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-gray-400">
                  {t("semester") || "Semester"}
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {group.semesterLabel || t("updating") || "Updating"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">
                  {t("status") || "Status"}
                </p>
                <p className="mt-1 font-semibold capitalize text-gray-900">
                  {group.status}
                </p>
              </div>
            </div>

            {(() => {
              const progressPercent = Math.min(
                100,
                Math.max(0, Math.round(group.progress || 0))
              );
              return (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <p className="uppercase">{t("progress") || "Progress"}</p>
                    <p className="font-semibold text-gray-600">
                      {progressPercent}%
                    </p>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{
                        width: `${progressPercent}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })()}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {group.memberPreview?.length ? (
                  <>
                    <div className="flex -space-x-2">
                      {group.memberPreview.slice(0, 5).map((member, idx) => (
                        <div
                          key={member.id || `member-${idx}`}
                          className="relative h-8 w-8 rounded-full border-2 border-white bg-gray-100 text-[10px] font-semibold text-gray-600 shadow-sm"
                          title={member.name}
                        >
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center">
                              {getInitials(member.name)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    {group.memberPreview.length > 5 && (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-gray-200 bg-white text-[10px] font-semibold text-gray-500">
                        +{group.memberPreview.length - 5}
                      </span>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-gray-400">
                    {t("noMembersYet") || "No members yet"}
                  </p>
                )}
              </div>
              <p className="text-sm font-medium text-[#627084]">
                {group.members}/{group.maxMembers} members
              </p>
            </div>

            {/* Skills Section */}
            {group.skills && group.skills.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1.5">
                  {group.skills.map((skill, idx) => {
                    const getRoleColor = (skillName) => {
                      const lowerSkill = skillName.toLowerCase();
                      if (['react', 'angular', 'vue', 'javascript', 'html', 'css'].includes(lowerSkill)) {
                        return 'bg-blue-100 text-blue-700 border-blue-300';
                      } else if (['nodejs', 'java', 'python', 'csharp', 'dotnet'].includes(lowerSkill)) {
                        return 'bg-green-100 text-green-700 border-green-300';
                      } else if (['flutter', 'swift', 'kotlin', 'android', 'ios'].includes(lowerSkill)) {
                        return 'bg-purple-100 text-purple-700 border-purple-300';
                      } else if (['docker', 'kubernetes', 'aws', 'azure'].includes(lowerSkill)) {
                        return 'bg-orange-100 text-orange-700 border-orange-300';
                      }
                      return 'bg-gray-100 text-gray-700 border-gray-300';
                    };
                    
                    const capitalizeFirst = (str) => {
                      if (!str) return str;
                      return str.charAt(0).toUpperCase() + str.slice(1);
                    };
                    
                    return (
                      <span
                        key={idx}
                        className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border ${getRoleColor(skill)}`}
                      >
                        {capitalizeFirst(skill)}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="mt-4 md:mt-6 flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3">
              <button
                onClick={() => handleViewGroup(group.id)}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs md:text-sm font-semibold text-gray-700 hover:border-gray-300"
              >
                {t("view") || "View"}
                <ArrowRight className="!h-4 !w-4" />
              </button>
              <button
                onClick={() => handleLeaveGroup(group.id)}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-red-100 px-4 py-2 text-xs md:text-sm font-semibold text-red-600 hover:border-red-200"
              >
                {t("leaveGroup") || "Leave Group"}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderApplicationsTab = () => {
    if (pendingLoading || invitationsLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={`pending-skeleton-${idx}`}
              className="animate-pulse space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="h-4 w-40 rounded bg-gray-200" />
              <div className="h-3 w-24 rounded bg-gray-100" />
              <div className="h-14 rounded-xl bg-gray-50" />
            </div>
          ))}
        </div>
      );
    }

    // Filter tabs for applications/invitations
    const applicationSubTabs = [
      {
        key: "applications",
        label: t("applications") || "Applications",
      },
      {
        key: "invitations",
        label: t("invitations") || "Invitations",
      },
    ];

    return (
      <div>
        {/* Filter tabs */}
        <div className="mb-6 flex gap-2">
          {applicationSubTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setApplicationSubTab(tab.key)}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition ${
                applicationSubTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {applicationSubTab === "applications" ? (
          <>
            {activeApplications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <p className="text-base font-semibold text-gray-800">
                  {t("pendingRequests") || "No pending applications"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {t("noPendingRequests") || "You have reviewed all applications for now."}
                </p>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {activeApplications.map(([groupId, requests]) => {
                  const group = groupsById.get(groupId);
                  return (
                    <div
                      key={groupId}
                      className="rounded-2xl md:rounded-3xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase text-blue-500">
                            {group?.field || t("group") || "Group"}
                          </p>
                          <h3 className="text-base md:text-lg font-bold text-gray-900">
                            {group?.title || t("group") || "Group"}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-500">
                            {requests.length}{" "}
                            {requests.length > 1
                              ? t("applications") || "applications"
                              : t("application") || "application"}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          <Crown className="!h-3.5 !w-3.5 text-amber-500" />
                          {t("leader") || "Leader"}
                        </span>
                      </div>

                      <div className="mt-4 md:mt-5 space-y-3 md:space-y-4">
                        {requests.map((request) => (
                          <div
                            key={request.id}
                            className="flex flex-col gap-3 md:gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-3 md:p-4 md:flex-row md:items-center md:justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <img
                                src={
                                  request.avatarUrl ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    request.name || request.email || "User"
                                  )}&background=0D8ABC&color=fff`
                                }
                                alt={request.name}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {request.name}
                                </p>
                                <p className="text-xs text-gray-500">{request.email}</p>
                                {request.message &&
                                  (() => {
                                    const parts = request.message.split("-");
                                    if (parts.length >= 2) {
                                      const badge = parts[0].trim();
                                      const message = parts.slice(1).join("-").trim();
                                      return (
                                        <div className="mt-2 flex items-center gap-2">
                                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                                            {badge}
                                          </span>
                                          <p className="text-xs text-gray-600">
                                            {message}
                                          </p>
                                        </div>
                                      );
                                    }
                                    return (
                                      <p className="mt-1 text-xs text-gray-500">
                                        {request.message}
                                      </p>
                                    );
                                  })()}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReject(groupId, request)}
                                className="flex-1 md:flex-initial inline-flex h-9 md:h-10 items-center justify-center rounded-full border border-red-200 px-3 md:px-4 text-xs md:text-sm font-semibold text-red-600 hover:bg-red-50"
                              >
                                {t("reject") || "Reject"}
                              </button>
                              <button
                                onClick={() => handleApprove(groupId, request)}
                                className="flex-1 md:flex-initial inline-flex h-9 md:h-10 items-center justify-center rounded-full bg-emerald-500 px-3 md:px-4 text-xs md:text-sm font-semibold text-white hover:bg-emerald-600"
                              >
                                {t("approve") || "Approve"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {invitations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <p className="text-base font-semibold text-gray-800">
                  {t("noInvitations") || "No invitations"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {t("noInvitationsMessage") || "You have no pending invitations."}
                </p>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex flex-col gap-3 md:gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          invitation.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            invitation.displayName || invitation.email || "User"
                          )}&background=0D8ABC&color=fff`
                        }
                        alt={invitation.displayName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {invitation.displayName}
                        </p>
                        <p className="text-xs text-gray-500">{invitation.email}</p>
                        {invitation.topicTitle && (
                          <p className="mt-1 text-xs text-gray-600">
                            {t("invitedFor") || "Invited for"}: {invitation.topicTitle}
                          </p>
                        )}
                        {invitation.message && (
                          <p className="mt-1 text-xs text-gray-600">
                            {invitation.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderOverviewTab = () => (
    <div className="grid gap-4 md:gap-5 sm:grid-cols-2 md:grid-cols-3">
      {overviewCards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm"
        >
          <p className="text-xs md:text-sm font-semibold text-gray-500">
            {card.title}
          </p>
          <p className="mt-2 md:mt-3 text-2xl md:text-3xl font-bold text-gray-900">
            {card.value}
          </p>
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f8fb] pb-16 pt-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-10 lg:px-8">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 md:pb-8">
          <div className="flex flex-col gap-4 md:gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="mt-2 text-2xl md:text-3xl font-black tracking-tight text-gray-900">
                {t("myGroupsProjectsTitle") || "My Groups & Projects"}
              </h1>
              <p className="mt-3 max-w-3xl text-sm md:text-base text-gray-400 text-muted-foreground">
                {t("myGroupsProjectsSubtitle") ||
                  "Manage your capstone project teams, track progress, and collaborate with teammates."}
                <br className="hidden md:block" />
                {t("myGroupsProjectsCTA") ||
                  "Create new groups or join existing ones to build amazing projects together."}
              </p>

              <div className="mt-4 md:mt-5 flex flex-col gap-3 md:gap-4 lg:flex-row lg:justify-between lg:gap-8">
                {/* Buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 lg:flex-none">
                  <button
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 md:px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    <span>+</span>
                    {t("createNewGroup") || "Create New Group"}
                  </button>
                  <button
                    onClick={() => navigate("/discover")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 md:px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
                  >
                    <UserPlus className="!h-4 !w-4" />
                    {t("joinGroup") || "Join Group"}
                  </button>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm font-semibold text-[#627084] lg:flex-1 lg:justify-end">
                  {heroStatsWithIcons.map((stat) => (
                    <div
                      key={stat.label}
                      className="inline-flex items-center gap-2 text-[#627084]"
                    >
                      {stat.icon}
                      <span>
                        {stat.value} {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs + content */}
        <div className="mt-6 md:mt-8">
          <div className="flex h-auto md:h-10 w-full max-w-full md:max-w-2xl gap-1 md:gap-2 rounded-md border border-gray-200 bg-[#f2f4f5] p-1 text-xs md:text-sm font-semibold text-[#7d889c]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-1 items-center justify-center gap-1 md:gap-2 rounded-sm px-2 md:px-3 py-2 md:py-1.5 transition ${
                  activeTab === tab.key
                    ? "bg-[#f7f9fa] text-[#1d3a66] shadow"
                    : "bg-[#f2f4f5] text-[#7d889c] hover:text-[#1d3a66]"
                }`}
              >
                {tab.icon}
                <span className="capitalize hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-6">
            {activeTab === "groups" && renderGroupsTab()}
            {activeTab === "applications" && renderApplicationsTab()}
            {activeTab === "overview" && renderOverviewTab()}
          </div>
        </div>
      </div>

      {/* Modal */}
      <CreateGroupModal
        t={t}
        open={open}
        submitting={submitting}
        form={form}
        errors={errors}
        majors={majors}
        majorsLoading={majorsLoading}
        skills={skills}
        skillsLoading={skillsLoading}
        onClose={requestCloseModal}
        onSubmit={handleCreateGroup}
        onChange={handleFormChange}
      />
    </div>
  );
}
