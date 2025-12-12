import React from "react";
import { UserPlus } from "lucide-react";
import { Chip, StatusChip } from "./Chip";
import { initials, timeAgoFrom, toArraySkills } from "../../../utils/helpers";
import { useTranslation } from "../../../hook/useTranslation";

const clamp3 = {
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

export function PersonalCard({
  post,
  userRole,
  onInvite,
  onClickProfile,
  membership,
}) {
  const { t } = useTranslation();
  // Show status only when hasApplied is true
  const inviteStatus = post.hasApplied
    ? post.myApplicationStatus || "pending"
    : null;

  const author = post.user || post.owner || post;
  const authorId =
    author.userId ||
    author.id ||
    author.user?.userId ||
    author.user?.id ||
    author.accountId ||
    author.ownerId ||
    "";
  const name =
    post?.userDisplayName ||
    post?.user?.displayName ||
    post?.name ||
    author?.displayName ||
    "";
  const timeAgo = post?.createdAt
    ? timeAgoFrom(post.createdAt)
    : post?.timeAgo || "";
  const avatarUrl =
    author?.avatarUrl || post?.user?.avatarUrl || post?.ownerAvatarUrl || null;
  const majorName =
    post?.user?.majorName || post?.major?.majorName || author?.majorName || "";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div
        className="flex items-start gap-3 cursor-pointer hover:text-gray-800"
        onClick={() => onClickProfile(authorId || author)}
      >
        {/* AVATAR + FALLBACK INITIALS */}
        <div className="relative mt-1 h-10 w-10 shrink-0">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt={name}
              className="h-10 w-10 rounded-full object-cover shadow-sm"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextElementSibling.style.display = "flex";
              }}
            />
          )}
          <div
            className="h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white"
            style={{ display: avatarUrl ? "none" : "flex" }}
          >
            {initials(name)}
          </div>
        </div>

        {/* TÊN + THỜI GIAN + MAJOR */}
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            {name || t("profile") || "Profile"}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-700" style={clamp3}>
        {post.description}
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Skills */}
            <div className="text-xs font-semibold tracking-wide text-gray-500">
              {(t("skills") || "Skills") + ":"}
              <div className="mt-2 flex flex-wrap gap-2">
                {toArraySkills(post).map((s) => (
                  <Chip key={s}>{s}</Chip>
                ))}
              </div>
            </div>

            {/* Major */}
            <div className="lg:ml-10 text-xs font-semibold tracking-wide text-gray-800">
              {(t("major") || "Major") + ":"}
              <div className="mt-2 text-gray-500">{majorName}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-300">
        {userRole === "leader" && (
          <div className="flex justify-end">
            {membership?.status !== "member" &&
            membership?.status !== "student" ? (
              post.hasApplied && inviteStatus ? (
                <StatusChip status={inviteStatus} />
              ) : (
                <button
                  onClick={async () => {
                    await onInvite(post.id);
                  }}
                  className="inline-flex items-center justify-center rounded-lg bg-[#FF7A00] hover:opacity-90 px-3 md:px-3.5 py-2 text-xs font-bold text-white shadow-sm transition focus:outline-none focus:ring-4 focus:ring-emerald-100"
                >
                  <UserPlus className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">
                    {t("inviteToGroup") || "Invite to Group"}
                  </span>
                  <span className="sm:hidden">{t("invite") || "Invite"}</span>
                </button>
              )
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
