import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, Users, UserPlus } from "lucide-react";
import { useTranslation } from "../../hook/useTranslation";
import CreatePostModal from "../../components/common/forum/CreatePostModal";
import CreatePersonalPostModal from "../../components/common/forum/CreatePersonalPostModal";
import { PostService } from "../../services/post.service";
import { AuthService } from "../../services/auth.service";
import { GroupService } from "../../services/group.service";
import {
  toArraySafe,
  timeAgoFrom,
  toArrayPositions,
  initials,
} from "../../utils/helpers";
import GroupDetailModal from "../../components/common/forum/GroupDetailModal";
import { message, notification } from "antd";
/** ---------- UI SMALLS ---------- */
function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset bg-blue-50 text-blue-700 ring-blue-100">
      {children}
    </span>
  );
}
function StatusChip({ status }) {
  const s = String(status || "").toLowerCase();
  const map = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    accepted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  };
  const cls = map[s] || "bg-gray-100 text-gray-700 ring-gray-200";
  const label =
    s === "pending"
      ? "Pending"
      : s === "accepted"
      ? "Accepted"
      : s === "rejected"
      ? "Rejected"
      : status || "Applied";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${cls}`}
    >
      {label}
    </span>
  );
}

const clamp3 = {
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const Forum = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  // membership state
  const [membership, setMembership] = useState({
    hasGroup: false,
    groupId: null,
    status: null, // 'leader' | 'member' | 'student' | null
  });

  // derive role from membership.status
  const userRole = membership.status === "leader" ? "leader" : "individual";

  // UI state
  const [activeTab, setActiveTab] = useState("groups"); // will be set by membership
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isCreatePersonalPostModalOpen, setIsCreatePersonalPostModalOpen] =
    useState(false);

  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserName = savedUser.name || "";

  // search
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timer = useRef(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebouncedQuery(query), 200);
    return () => timer.current && clearTimeout(timer.current);
  }, [query]);

  // posts list
  const [postsData, setPostsData] = useState([]);
  //View dẻtail modal group
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailGroupId, setDetailGroupId] = useState(null);

  const [applyLoadingId, setApplyLoadingId] = useState(null);

  /** 1) Lấy membership khi mount (hoặc sau login bạn cũng có thể set ở global store) */
  useEffect(() => {
    (async () => {
      try {
        const res = await AuthService.getMembership();
        const m = {
          hasGroup: !!res?.data?.hasGroup,
          groupId: res?.data?.groupId || null,
          status: res?.data?.status || null,
        };
        setMembership(m);
        setActiveTab(m.hasGroup ? "groups" : "individuals"); // quyết định tab theo hasGroup
      } catch {
        // nếu lỗi, để mặc định "groups"
      }
    })();
  }, []);

  /** helper fetch theo tab */
  const fetchList = async (tab) => {
    const wantType = tab === "groups" ? "group_hiring" : "individual";
    const res =
      tab === "groups"
        ? await PostService.getRecruitmentPosts()
        : await PostService.getPersonalPosts();
    const arr = toArraySafe(res);
    return arr.length && arr[0]?.type
      ? arr.filter((x) => x?.type === wantType)
      : arr;
  };

  /** 2) load list khi đổi tab (đã tự chọn theo membership) */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await fetchList(activeTab);
        if (mounted) setPostsData(rows);
      } catch {
        if (mounted) setPostsData([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [activeTab]);

  /** refetch sau khi tạo post */
  const handleCreated = async () => {
    const rows = await fetchList(activeTab);
    setPostsData(rows);
  };

  /** filter */
  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return (postsData || []).filter((item) => {
      const texts = [
        item.title,
        item.description,
        item.groupName,
        item.userDisplayName,
        String(item.skills || ""),
        String(item.positionNeeded ?? item.position_needed ?? ""),
      ]
        .filter(Boolean)
        .map((s) => String(s).toLowerCase());
      return !q || texts.some((h) => h.includes(q));
    });
  }, [postsData, debouncedQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, activeTab]);

  const total = filtered.length;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paged = filtered.slice(start, end);

  const onApply = async (post) => {
    const id = post?.id;
    if (!id) return;

    try {
      setApplyLoadingId(id);

      const res = await GroupService.applyPostToGroup(id, {});
      // CHỈ lấy status từ body nếu có; KHÔNG dùng res.status (HTTP)
      const bodyStatus = (res?.data?.status || "").toString().toLowerCase();
      const newStatus = bodyStatus || "pending"; // optimistic fallback

      setPostsData((prev) =>
        (prev || []).map((item) =>
          item.id === id
            ? {
                ...item,
                hasApplied: true,
                myApplicationStatus: newStatus, // "pending" (hoặc theo body)
                myApplicationId: res?.data?.id || item?.myApplicationId || null,
              }
            : item
        )
      );

      message.success("Đã gửi yêu cầu tham gia nhóm!");
    } catch (e) {
      console.error(e);
    } finally {
      setApplyLoadingId(null);
    }
  };
  const onInvite = (id) =>
    notification.info({
      message: `Invite user ${id} vào nhóm của bạn`,
    });

  const openDetail = (post) => {
    const gid =
      post?.group?.groupId ||
      post?.groupId ||
      post?.group?.id ||
      post?.group_id ||
      null;

    if (!gid) {
      console.warn("No groupId found in post:", post);
      return;
    }
    setDetailGroupId(gid);
    setDetailOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 lg:px-0 pt-10 pb-20">
        {/* Header */}
        <div className="mb-6 mt-16 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t("recruitmentForum") || "Recruitment Forum"}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {activeTab === "groups"
                ? t("forumSubtitle") ||
                  "Find team members for your projects or join exciting projects"
                : t("forumPersonalSubtitle") ||
                  "Publish your profile and let project teams invite you"}
            </p>
          </div>

          {/* Nút tạo: quyết định theo role từ API (không còn toggle) */}
          <div className="flex gap-2 items-center">
            {userRole === "leader" ? (
              <button
                onClick={() => setIsCreatePostModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#FF7A00] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-100"
                title={t("createRecruitPost") || "Create group post"}
              >
                <Plus className="h-4 w-4" />
                {t("createRecruitPost") || "Create recruitment post"}
              </button>
            ) : (
              <button
                onClick={() => setIsCreatePersonalPostModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#FF7A00] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <Plus className="h-4 w-4" />
                {t("createPersonalPost") || "Create personal post"}
              </button>
            )}
          </div>
        </div>

        {/* Segmented Tabs vẫn giữ để người dùng chuyển view */}
        <div className="mb-6">
          <div className="inline-flex rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("groups")}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
                activeTab === "groups"
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {t("postGroup") || "Post Group"}
            </button>
            <button
              onClick={() => setActiveTab("individuals")}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
                activeTab === "individuals"
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {t("postPersonal") || "Post Personal"}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                activeTab === "groups"
                  ? t("searchByProject") || "Search posts by project, skills…"
                  : t("searchByPeople") || "Search people by role, skills…"
              }
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none ring-blue-100 transition focus:border-blue-500 focus:ring-4"
            />
          </div>
        </div>

        {/* LISTS */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
              {t("noData") || "No results found."}
            </div>
          )}

          {/* GROUP CARDS */}
          {activeTab === "groups" &&
            paged.map((p) => {
              const author =
                p?.group?.name ||
                p?.groupName ||
                p?.userDisplayName ||
                p?.user?.displayName ||
                "";
              const timeAgo = p?.createdAt ? timeAgoFrom(p.createdAt) : "";
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-9 w-9 shrink-0 rounded-full bg-gray-200" />
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {p.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                          {author && (
                            <span className="font-medium text-gray-700">
                              {author}
                            </span>
                          )}
                          {author && timeAgo && <span>•</span>}
                          {timeAgo && <span>{timeAgo}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-gray-700" style={clamp3}>
                    {p.description}
                  </p>

                  <div className="mt-4">
                    <div className="text-xs font-semibold tracking-wide text-gray-500">
                      {(t("positionsNeeded") || "Positions Needed") + ":"}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {toArrayPositions(p).map((s) => (
                        <Chip key={s}>{s}</Chip>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      {!!p.currentMembers && (
                        <span>
                          {p.currentMembers} {t("members") || "Members"}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDetail(p)}
                        className="inline-flex items-center rounded-lg px-3.5 py-2 text-xs font-bold shadow-sm hover:border-orange-400 hover:text-orange-400 transition-all focus:outline-none focus:ring-4 focus:ring-blue-100"
                      >
                        {t("viewDetails") || "View Details"}
                      </button>
                      {p.hasApplied || p.myApplicationStatus ? (
                        <StatusChip
                          status={p.myApplicationStatus || "pending"}
                        />
                      ) : (
                        <button
                          onClick={() => onApply(p)}
                          disabled={applyLoadingId === p.id}
                          className="inline-flex items-center rounded-lg bg-[#FF7A00] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:!opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                        >
                          {applyLoadingId === p.id
                            ? t("applying") || "Applying…"
                            : t("applyNow") || "Apply Now"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          {/* PERSONAL CARDS */}
          {activeTab === "individuals" &&
            paged.map((u) => {
              const name =
                u?.userDisplayName || u?.user?.displayName || u?.name || "";
              const timeAgo = u?.createdAt
                ? timeAgoFrom(u.createdAt)
                : u?.timeAgo || "";
              return (
                <div
                  key={u.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                        {initials(name)}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {name}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                          <span>{timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-gray-700" style={clamp3}>
                    {u.description}
                  </p>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="mt-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {(t("skills") || "Skills") + ":"}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {toArrayPositions(u).map((s) => (
                          <Chip key={s}>{s}</Chip>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onInvite(u.id)}
                        className="inline-flex items-center rounded-lg bg-[#FF7A00] hover:opacity-90 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition focus:outline-none focus:ring-4 focus:ring-emerald-100"
                      >
                        <UserPlus className="mr-1 h-4 w-4" />
                        {t("inviteToGroup") || "Invite to Group"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          {/* Pagination */}
          {total > 0 && (
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between sm:gap-4">
              {/* Page size */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm"
                >
                  {[6, 9, 12, 18].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span>per page</span>
                <span className="ml-3 text-gray-400">•</span>
                <span className="ml-2">{total} results</span>
              </div>

              {/* Pager */}
              <div className="inline-flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 disabled:opacity-50"
                >
                  Prev
                </button>

                {Array.from({ length: maxPage }, (_, i) => i + 1)
                  .filter((p) => {
                    if (p === 1 || p === maxPage) return true;
                    if (Math.abs(p - page) <= 1) return true;
                    if (Math.abs(p - page) === 2) return true;
                    return false;
                  })
                  .reduce((acc, p, _, arr) => {
                    if (acc.length === 0) return [p];
                    const prev = acc[acc.length - 1];
                    if (p - prev > 1) acc.push("ellipsis");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "ellipsis" ? (
                      <span key={`e-${idx}`} className="px-2 text-gray-400">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                          p === page
                            ? "bg-gray-900 text-white"
                            : "text-gray-700 hover:bg-gray-50 border border-gray-200 bg-white"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                  disabled={page === maxPage}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          closeModal={() => setIsCreatePostModalOpen(false)}
          onCreated={handleCreated}
          defaultGroupId={membership.groupId || ""}
        />
        <CreatePersonalPostModal
          isOpen={isCreatePersonalPostModalOpen}
          closeModal={() => setIsCreatePersonalPostModalOpen(false)}
          onCreated={handleCreated}
          currentUserName={currentUserName}
        />
        <GroupDetailModal
          isOpen={detailOpen}
          onClose={() => setDetailOpen(false)}
          groupId={detailGroupId}
        />
      </div>
    </div>
  );
};

export default Forum;
