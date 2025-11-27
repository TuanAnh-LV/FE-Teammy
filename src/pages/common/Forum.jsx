import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  Users,
  UserPlus,
  Clock,
  Eye,
  Calendar,
  MessageSquare,
} from "lucide-react";
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
import { notification } from "antd";
import ApplyModal from "../../components/common/forum/ApplyModal";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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

  const savedUser = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const currentUserName = savedUser.name || "";

  // search
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timer = useRef(null);
  const membershipFetchedRef = useRef(false);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebouncedQuery(query), 200);
    return () => timer.current && clearTimeout(timer.current);
  }, [query]);

  // posts list
  const [postsData, setPostsData] = useState([]);
  const [allPostsData, setAllPostsData] = useState([]); // Store all posts for stats
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailGroupId, setDetailGroupId] = useState(null);

  const [applyLoadingId, setApplyLoadingId] = useState(null);

  const [applyOpen, setApplyOpen] = useState(false);
  const [applyPost, setApplyPost] = useState(null);

  /** 1) L???y membership khi mount (ho???c sau login b???n c?cng cA3 th??? set ??Y global store) */
  useEffect(() => {
    if (membershipFetchedRef.current) return;
    membershipFetchedRef.current = true;
    (async () => {
      try {
        const res = await AuthService.getMembership();
        const m = {
          hasGroup: !!res?.data?.hasGroup,
          groupId: res?.data?.groupId || null,
          status: res?.data?.status || null,
        };
        setMembership(m);
        // Luôn giữ tab ở "groups" (Post Group)
        // setActiveTab(m.hasGroup ? "groups" : "individuals");
      } catch {}
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

  // Fetch all posts for stats on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [groupRes, individualRes] = await Promise.all([
          PostService.getRecruitmentPosts(),
          PostService.getPersonalPosts(),
        ]);
        const groupArr = toArraySafe(groupRes);
        const individualArr = toArraySafe(individualRes);
        const allPosts = [...groupArr, ...individualArr];
        if (mounted) setAllPostsData(allPosts);
      } catch {
        if (mounted) setAllPostsData([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // Khi activeTab thay đổi, gọi lại hàm fetch để tải dữ liệu mới
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

  /** refetch sau khi t?o post */
  const handleCreated = async () => {
    const rows = await fetchList(activeTab);
    setPostsData(rows);

    // Also refetch all posts for stats
    try {
      const [groupRes, individualRes] = await Promise.all([
        PostService.getRecruitmentPosts(),
        PostService.getPersonalPosts(),
      ]);
      const groupArr = toArraySafe(groupRes);
      const individualArr = toArraySafe(individualRes);
      const allPosts = [...groupArr, ...individualArr];
      setAllPostsData(allPosts);
    } catch {
      // ignore error
    }
  };

  /** filter */
  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return (postsData || []).filter((item) => {
      // Hide posts that are explicitly closed
      if ((item?.status || "").toString().toLowerCase() === "closed")
        return false;

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

  // Count open posts for stats from all posts
  const openGroupPosts = useMemo(() => {
    return (allPostsData || []).filter(
      (item) =>
        item?.type === "group_hiring" &&
        (item?.status || "").toString().toLowerCase() === "open"
    ).length;
  }, [allPostsData]);

  const openIndividualPosts = useMemo(() => {
    return (allPostsData || []).filter(
      (item) =>
        item?.type === "individual" &&
        (item?.status || "").toString().toLowerCase() === "open"
    ).length;
  }, [allPostsData]);

  const onClickOpenApply = (post) => {
    if (!post?.id) return;
    setApplyPost(post);
    setApplyOpen(true);
  };
  const handleApplySubmit = async (payload /* { message } */) => {
    const id = applyPost?.id;
    if (!id) return;
    try {
      setApplyLoadingId(id);
      const res = await GroupService.applyPostToGroup(id, payload);
      const bodyStatus = (res?.data?.status || "").toString().toLowerCase();
      const newStatus = bodyStatus || "pending";

      // Cập nhật UI lạc quan
      setPostsData((prev) =>
        (prev || []).map((item) =>
          item.id === id
            ? {
                ...item,
                hasApplied: true,
                myApplicationStatus: newStatus,
                myApplicationId: res?.data?.id || item?.myApplicationId || null,
              }
            : item
        )
      );
      notification.success(t("inviteRequestSent") || "Invite request sent!");
    } catch (e) {
      console.error(e);
    } finally {
      setApplyLoadingId(null);
      setApplyOpen(false);
      setApplyPost(null);
    }
  };

  const onInvite = async (id) => {
    const user = paged.find((u) => u.id === id);
    const userId = user?.user?.userId;
    const groupId = membership.groupId;
    const payload = {
      userId,
    };

    try {
      // Call the inviteMember API method
      await GroupService.inviteMember(groupId, payload);

      // Display success message when the invite is successful
      notification.success({
        message:
          t("userInvitedToGroup") || "User invited to the group successfully!",
      });
    } catch (error) {
      console.error("Failed to send invitation", error);
      notification.error({
        message: t("failedToInviteUser") || "Failed to invite user.",
      });
    }
  };

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

  const resolveUserId = (userObj = {}) =>
    userObj.userId ||
    userObj.id ||
    userObj.user?.userId ||
    userObj.user?.id ||
    userObj.accountId ||
    userObj.ownerId ||
    "";

  const goProfile = (userObj = {}) => {
    const id = typeof userObj === "string" ? userObj : resolveUserId(userObj);
    if (!id) return;
    navigate(`/profile/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] pb-16 pt-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-10 lg:px-8">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 md:pb-8 mb-4 md:mb-6">
          <div className="space-y-3">
            <h1 className="mt-2 text-2xl md:text-3xl font-black tracking-tight text-gray-900">
              {t("recruitmentForum") || "Recruitment Forum"}
            </h1>
            <p className="mt-3 max-w-3xl text-sm md:text-base text-gray-400 text-muted-foreground">
              Post recruitment opportunities or showcase your profile to find
              the perfect team match. Connect with students and groups across
              all departments.
            </p>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                {userRole === "leader" ? (
                  <button
                    onClick={() => setIsCreatePostModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF7A00] px-3 md:px-4 py-2.5 text-xs md:text-sm font-bold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-100 w-full md:w-auto justify-center"
                    title={t("createRecruitPost") || "Create group post"}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {t("createRecruitPost") || "Create recruitment post"}
                    </span>
                    <span className="sm:hidden">
                      {t("createPost") || "Create Post"}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsCreatePersonalPostModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF7A00] px-3 md:px-4 py-2.5 text-xs md:text-sm font-bold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-100 w-full md:w-auto justify-center"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {t("createPersonalPost") || "Create personal post"}
                    </span>
                    <span className="sm:hidden">
                      {t("createPost") || "Create Post"}
                    </span>
                  </button>
                )}
              </div>

              <div className="hidden lg:flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {openGroupPosts}{" "}
                    {openGroupPosts === 1
                      ? "recruitment post"
                      : "recruitment posts"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>
                    {openIndividualPosts}{" "}
                    {openIndividualPosts === 1
                      ? "student profile"
                      : "student profiles"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4 md:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
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

        {/* Segmented Tabs vẫn giữ để người dùng chuyển view */}
        <div className="mb-4 md:mb-6">
          <div className="inline-flex w-full md:w-auto rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("groups")}
              className={`flex-1 md:flex-initial px-3 md:px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition ${
                activeTab === "groups"
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {t("postGroup") || "Post Group"}
            </button>
            <button
              onClick={() => setActiveTab("individuals")}
              className={`flex-1 md:flex-initial px-3 md:px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition ${
                activeTab === "individuals"
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {t("postPersonal") || "Post Personal"}
            </button>
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
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                    <div className="space-y-2 flex-1">
                      {/* Title & Status */}
                      <div className="flex items-start gap-2 md:gap-3 flex-wrap">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 cursor-pointer hover:text-primary transition-colors flex-1 min-w-0">
                          {p.title}
                        </h3>
                        {p.status && (
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg shrink-0 ${
                              p.status === "open"
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {p.status}
                          </span>
                        )}
                      </div>

                      {/* Author, Group, Date */}
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
                        <div
                          className="flex items-center gap-2 cursor-pointer hover:text-gray-700"
                          onClick={() =>
                            goProfile(p.group?.leader || p.leader || p.owner || {})
                          }
                        >
                          <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm md:text-lg font-semibold shrink-0">
                            {(p.group?.leader?.displayName ||
                              p.leader?.displayName ||
                              p.group?.name ||
                              "T")
                              .slice(0, 1)
                              .toUpperCase()}
                          </div>
                          <span className="truncate">
                            {p.group?.leader?.displayName || p.leader?.displayName} •{" "}
                            {p.group?.leader?.role || p.leader?.role || t("leader") || "Leader"}
                          </span>
                        </div>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate">{p.group?.name}</span>
                        <span className="hidden sm:inline">•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-4 md:gap-0 md:text-right text-xs md:text-sm text-gray-600">
                      {/* Applications & Due Date */}
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>
                          {p.applicationsCount}{" "}
                          <span className="hidden sm:inline">
                            {t("applications") || "Applications"}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1 md:mt-1">
                        <Calendar className="w-3 h-3" />
                        <span className="truncate">
                          {p.applicationDeadline
                            ? `${t("due") || "Due"}: ${new Date(
                                p.applicationDeadline
                              ).toLocaleDateString()}`
                            : t("noDeadline") || "No deadline"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-gray-700" style={clamp3}>
                    {p.description}
                  </p>

                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Positions Needed */}
                    <div className="text-xs font-semibold tracking-wide text-gray-800">
                      {(t("positionsNeeded") || "Positions Needed") + ":"}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {toArrayPositions(p).map((s) => (
                          <Chip key={s}>{s}</Chip>
                        ))}
                      </div>
                    </div>

                    {/* Major */}
                    <div className="lg:ml-10 text-xs font-semibold tracking-wide text-gray-800">
                      {(t("major") || "Major") + ":"}
                      <div className="mt-2 text-gray-500">
                        {p?.major?.majorName || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-300">
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      {!!p.currentMembers && (
                        <span>
                          {p.currentMembers}/{p.group?.maxMembers}{" "}
                          {t("members") || "Members"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openDetail(p)}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-lg px-3 md:px-3.5 py-2 text-xs font-bold shadow-sm hover:border-orange-400 hover:text-orange-400 transition-all focus:outline-none focus:ring-4 focus:ring-blue-100"
                      >
                        {t("viewDetails") || "View Details"}
                      </button>
                      {p.hasApplied || p.myApplicationStatus ? (
                        <StatusChip
                          status={p.myApplicationStatus || "pending"}
                        />
                      ) : (
                        <button
                          onClick={() => onClickOpenApply(p)}
                          disabled={applyLoadingId === p.id}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-lg bg-[#FF7A00] px-3 md:px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:!opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
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
              const author = u.user || u.owner || u;
              const authorId = resolveUserId(author);
              const name =
                u?.userDisplayName ||
                u?.user?.displayName ||
                u?.name ||
                author?.displayName ||
                "";
              const timeAgo = u?.createdAt
                ? timeAgoFrom(u.createdAt)
                : u?.timeAgo || "";
              return (
                <div
                  key={u.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className="flex items-start gap-3 cursor-pointer hover:text-gray-800"
                      onClick={() => goProfile(authorId || author)}
                    >
                      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                        {initials(name)}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {name || t("profile") || "Profile"}
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

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="mt-2">
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
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-lg bg-[#FF7A00] hover:opacity-90 px-3 md:px-3.5 py-2 text-xs font-bold text-white shadow-sm transition focus:outline-none focus:ring-4 focus:ring-emerald-100"
                        disabled={u.emailSent} // Optionally disable the button if the user has already been invited
                      >
                        <UserPlus className="mr-1 h-4 w-4" />
                        <span className="hidden sm:inline">
                          {u.emailSent
                            ? t("alreadyInvited") || "Already Invited"
                            : t("inviteToGroup") || "Invite to Group"}
                        </span>
                        <span className="sm:hidden">
                          {u.emailSent
                            ? t("invited") || "Invited"
                            : t("invite") || "Invite"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          {/* Pagination */}
          {total > 0 && (
            <div className="mt-6 md:mt-8 mb-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between sm:gap-4">
              {/* Page size */}
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs md:text-sm"
                >
                  {[6, 9, 12, 18].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span className="hidden sm:inline">per page</span>
                <span className="text-gray-400 hidden sm:inline">•</span>
                <span className="hidden sm:inline">{total} results</span>
              </div>

              {/* Pager */}
              <div className="inline-flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-200 bg-white px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 disabled:opacity-50"
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
                  .reduce((acc, p) => {
                    if (acc.length === 0) return [p];
                    const prev = acc[acc.length - 1];
                    if (p - prev > 1) acc.push("ellipsis");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "ellipsis" ? (
                      <span
                        key={`e-${idx}`}
                        className="px-1 md:px-2 text-gray-400"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`rounded-lg px-2 md:px-3 py-1.5 text-xs md:text-sm font-semibold ${
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
                  className="rounded-lg border border-gray-200 bg-white px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 disabled:opacity-50"
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
          destroyOnClose
        />
        <CreatePersonalPostModal
          isOpen={isCreatePersonalPostModalOpen}
          closeModal={() => setIsCreatePersonalPostModalOpen(false)}
          onCreated={handleCreated}
          currentUserName={currentUserName}
          destroyOnClose
        />
        <GroupDetailModal
          isOpen={detailOpen}
          onClose={() => setDetailOpen(false)}
          groupId={detailGroupId}
        />
        <ApplyModal
          open={applyOpen}
          onClose={() => {
            setApplyOpen(false);
            setApplyPost(null);
          }}
          post={applyPost}
          onSubmit={handleApplySubmit}
        />
      </div>
    </div>
  );
};

export default Forum;
