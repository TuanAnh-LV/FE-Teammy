import { Clock, Eye, Calendar, Users } from "lucide-react";
import { Chip, StatusChip } from "./Chip";
import { toArrayPositions, toArraySkills } from "../../../utils/helpers";
import { useTranslation } from "../../../hook/useTranslation";

const clamp3 = {
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

export function GroupCard({
  post,
  membership,
  applyLoadingId,
  onOpenDetail,
  onApply,
  onClickLeader,
}) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
        <div className="space-y-2 flex-1">
          {/* Title & Status */}
          <div className="flex items-start gap-2 md:gap-3 flex-wrap">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 cursor-pointer hover:text-primary transition-colors flex-1 min-w-0">
              {post.title}
            </h3>
            {post.status && (
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg shrink-0 ${
                  post.status === "open"
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {post.status}
              </span>
            )}
          </div>

          {/* Author, Group, Date */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
            <div
              className="flex items-center gap-2 cursor-pointer hover:text-gray-700"
              onClick={() =>
                onClickLeader(
                  post.group?.leader || post.leader || post.owner || {}
                )
              }
            >
              <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm md:text-lg font-semibold shrink-0">
                {(
                  post.group?.leader?.displayName ||
                  post.leader?.displayName ||
                  post.group?.name ||
                  "T"
                )
                  .slice(0, 1)
                  .toUpperCase()}
              </div>
              <span className="truncate">
                {post.group?.leader?.displayName || post.leader?.displayName} •{" "}
                {post.group?.leader?.role ||
                  post.leader?.role ||
                  t("leader") ||
                  "Leader"}
              </span>
            </div>
            <span className="hidden sm:inline">•</span>
            <span className="truncate">{post.group?.name}</span>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex md:flex-col gap-4 md:gap-0 md:text-right text-xs md:text-sm text-gray-600">
          {/* Applications & Due Date */}
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>
              {post.applicationsCount}{" "}
              <span className="hidden sm:inline">
                {t("applications") || "Applications"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1 md:mt-1">
            <Calendar className="w-3 h-3" />
            <span className="truncate">
              {post.applicationDeadline
                ? `${t("due") || "Due"}: ${new Date(
                    post.applicationDeadline
                  ).toLocaleDateString()}`
                : t("noDeadline") || "No deadline"}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-700" style={clamp3}>
        {post.description}
      </p>

      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Positions Needed */}
          <div className="text-xs font-semibold tracking-wide text-gray-800">
            {(t("positionsNeeded") || "Positions Needed") + ":"}
            <div className="mt-2 flex flex-wrap gap-2">
              {toArrayPositions(post).map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </div>
          </div>

          {/* Major */}
          <div className="lg:ml-10 text-xs font-semibold tracking-wide text-gray-800">
            {(t("major") || "Major") + ":"}
            <div className="mt-2 text-gray-500">
              {post?.major?.majorName || "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {/* Skills */}
        {toArraySkills(post).length > 0 && (
          <div className="text-xs font-semibold tracking-wide text-gray-800">
            {(t("skills") || "Skills") + ":"}
            <div className="mt-2 flex flex-wrap gap-2">
              {toArraySkills(post).map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-300">
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
          <Users className="h-4 w-4" />
          {!!post.currentMembers && (
            <span>
              {post.currentMembers}/{post.group?.maxMembers}{" "}
              {t("members") || "Members"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenDetail(post)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-lg px-3 md:px-3.5 py-2 text-xs font-bold shadow-sm hover:border-orange-400 hover:text-orange-400 transition-all focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            {t("viewDetails") || "View Details"}
          </button>
          {!membership.hasGroup &&
            (post.hasApplied || post.myApplicationStatus ? (
              <StatusChip status={post.myApplicationStatus || "pending"} />
            ) : (
              <button
                onClick={() => onApply(post)}
                disabled={applyLoadingId === post.id}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-lg bg-[#FF7A00] px-3 md:px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:!opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
              >
                {applyLoadingId === post.id
                  ? t("applying") || "Applying…"
                  : t("applyNow") || "Apply Now"}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
