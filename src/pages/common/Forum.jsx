import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Plus, Search, Users, MessageSquare } from "lucide-react";
import { useTranslation } from "../../hook/useTranslation";
import CreatePostModal from "../../components/common/forum/CreatePostModal";
import CreatePersonalPostModal from "../../components/common/forum/CreatePersonalPostModal";
import { PostService } from "../../services/post.service";
import { AuthService } from "../../services/auth.service";
import { GroupService } from "../../services/group.service";
import { AiService } from "../../services/ai.service";
import { toArraySafe, getErrorMessage } from "../../utils/helpers";
import GroupDetailModal from "../../components/common/forum/GroupDetailModal";
import { notification } from "antd";
import ApplyModal from "../../components/common/forum/ApplyModal";
import { useNavigate } from "react-router-dom";
import { AIRecommendedProfiles } from "../../components/common/forum/AIRecommendedProfiles";
import { AIRecommendedGroups } from "../../components/common/forum/AIRecommendedGroups";
import { GroupCard } from "../../components/common/forum/GroupCard";
import { PersonalCard } from "../../components/common/forum/PersonalCard";
import { Pagination } from "../../components/common/forum/Pagination";
import { useGroupInvitationSignalR } from "../../hook/useGroupInvitationSignalR";
import { useAuth } from "../../context/AuthContext";

const Forum = () => {
  const { token, userInfo } = useAuth();
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

  // Group details state
  const [myGroupDetails, setMyGroupDetails] = useState(null);

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
  const [aiSuggestedPosts, setAiSuggestedPosts] = useState([]); // AI suggested posts for individuals
  const [aiSuggestedGroupPosts, setAiSuggestedGroupPosts] = useState([]); // AI suggested posts for groups
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailGroupId, setDetailGroupId] = useState(null);

  const [applyLoadingId, setApplyLoadingId] = useState(null);

  const [applyOpen, setApplyOpen] = useState(false);
  const [applyPost, setApplyPost] = useState(null);

  // 🔥 REALTIME: Handle invitation events từ SignalR
  const handleInvitationCreated = useCallback((payload) => {
    // Chỉ xử lý event cho profile_post invitations
    if (payload.type === "profile_post" && payload.postId) {
      // Update trạng thái của post trong danh sách
      const updatePostStatus = (posts) => 
        posts.map((post) => 
          post.id === payload.postId
            ? { ...post, hasApplied: true, myApplicationStatus: "pending" }
            : post
        );

      setAllPostsData((prev) => updatePostStatus(prev));
      setPostsData((prev) => updatePostStatus(prev));
      setAiSuggestedPosts((prev) =>
        prev.map((s) => {
          const profilePost = s.profilePost || {};
          if (profilePost.id !== payload.postId) return s;
          return {
            ...s,
            profilePost: {
              ...profilePost,
              hasApplied: true,
              myApplicationStatus: "pending",
            },
          };
        })
      );
    }
  }, []);

  const handleInvitationStatusChanged = useCallback((payload) => {
    // Update status của invitation trong UI
    if (payload.postId) {
      const updatePostStatus = (posts) =>
        posts.map((post) =>
          post.id === payload.postId
            ? { ...post, myApplicationStatus: payload.status }
            : post
        );

      setAllPostsData((prev) => updatePostStatus(prev));
      setPostsData((prev) => updatePostStatus(prev));
      setAiSuggestedPosts((prev) =>
        prev.map((s) => {
          const profilePost = s.profilePost || {};
          if (profilePost.id !== payload.postId) return s;
          return {
            ...s,
            profilePost: {
              ...profilePost,
              myApplicationStatus: payload.status,
            },
          };
        })
      );
    }
  }, []);

  // 🔥 Setup SignalR connection cho realtime updates
  const { isConnected } = useGroupInvitationSignalR(token, userInfo?.userId, {
    onInvitationCreated: handleInvitationCreated,
    onInvitationStatusChanged: handleInvitationStatusChanged,
  });

  /** 1) Lấy membership khi mount */
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

        // Fetch group details if user has group
        if (m.groupId) {
          try {
            const groupRes = await GroupService.getGroupDetail(m.groupId);
            setMyGroupDetails(groupRes?.data || null);
          } catch {
            setMyGroupDetails(null);
          }
        }
      } catch {
        // Ignore membership fetch error
      }
    })();
  }, []);

  /** 2) Fetch tất cả posts MỘT LẦN khi mount - dùng cho cả display và stats */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [groupRes, individualRes] = await Promise.all([
          PostService.getRecruitmentPosts(),
          PostService.getPersonalPosts(),
        ]);
        const groupArr = toArraySafe(groupRes).filter(
          (x) => x?.type === "group_hiring"
        );
        const individualArr = toArraySafe(individualRes).filter(
          (x) => x?.type === "individual"
        );

        if (mounted) {
          // Lưu tất cả posts
          setAllPostsData([...groupArr, ...individualArr]);
        }
      } catch {
        if (mounted) {
          setAllPostsData([]);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /** 3) Khi activeTab thay đổi, CHỈ filter data từ allPostsData thay vì gọi API lại */
  useEffect(() => {
    const groupArr = allPostsData.filter((x) => x?.type === "group_hiring");
    const individualArr = allPostsData.filter((x) => x?.type === "individual");
    setPostsData(activeTab === "groups" ? groupArr : individualArr);
  }, [activeTab, allPostsData]);

  /** 4) Gọi AI suggestions khi chuyển sang tab individuals */
  useEffect(() => {
    // Don't show AI suggestions if:
    // 1. Not on individuals tab
    // 2. User doesn't have a group
    // 3. Group is full (members >= maxMembers)
    // 4. Group has topic assigned
    if (activeTab !== "individuals" || !membership.groupId) {
      setAiSuggestedPosts([]);
      return;
    }

    // Check if group is active (full members and has topic)
    if (myGroupDetails) {
      const currentMembers = myGroupDetails.members?.length || 0;
      const maxMembers =
        myGroupDetails.maxMembers || myGroupDetails.capacity || 0;
      const hasTopic =
        myGroupDetails.topicId && myGroupDetails.topicId.trim() !== "";

      // If group is full AND has topic, don't show AI suggestions
      if (currentMembers >= maxMembers && hasTopic) {
        setAiSuggestedPosts([]);
        return;
      }
    }

    let mounted = true;
    (async () => {
      try {
        const aiResponse = await AiService.getProfilePostSuggestions({
          groupId: membership.groupId,
          limit: 10,
        });
        console.log("AI profile suggestions response:", aiResponse);
        console.log("AI profile suggestions data:", aiResponse.data);
        console.log("AI profile suggestions data.data:", aiResponse.data?.data);
        console.log(
          "AI profile suggestions data.data[0]:",
          aiResponse.data?.data?.[0]
        );
        console.log(
          "AI profile suggestions data.data[0].profilePost:",
          aiResponse.data?.data?.[0]?.profilePost
        );

        // Check if response is successful
        if (!aiResponse || aiResponse.success === false || !aiResponse.data) {
          if (mounted) setAiSuggestedPosts([]);
          return;
        }

        let suggestions = [];

        if (Array.isArray(aiResponse.data.data)) {
          suggestions = aiResponse.data.data.filter(
            (item) =>
              item &&
              typeof item === "object" &&
              item.profilePost &&
              item.profilePost.id
          );
        }

        if (mounted && suggestions.length > 0) {
          setAiSuggestedPosts(suggestions);
          notification.info({
            message: t("aiSuggestionsAvailable") || "AI Suggestions Available",
            description: `Found ${suggestions.length} recommended profiles for your group`,
            placement: "topRight",
            duration: 3,
          });
        } else {
          if (mounted) setAiSuggestedPosts([]);
        }
      } catch {
        if (mounted) setAiSuggestedPosts([]);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, membership.groupId, myGroupDetails]);

  /** 5) Gọi AI suggestions khi chuyển sang tab groups */
  useEffect(() => {
    // Don't show AI suggestions if:
    // 1. Not on groups tab
    // 2. User doesn't have majorId
    // 3. User already has group and it's active (full + has topic)
    if (activeTab !== "groups" || !savedUser?.majorId) {
      setAiSuggestedGroupPosts([]);
      return;
    }

    // If user has a group that is full AND has topic, don't show suggestions
    if (membership.hasGroup && myGroupDetails) {
      const currentMembers = myGroupDetails.members?.length || 0;
      const maxMembers =
        myGroupDetails.maxMembers || myGroupDetails.capacity || 0;
      const hasTopic =
        myGroupDetails.topicId && myGroupDetails.topicId.trim() !== "";

      if (currentMembers >= maxMembers && hasTopic) {
        setAiSuggestedGroupPosts([]);
        return;
      }
    }

    let mounted = true;
    (async () => {
      try {
        const aiResponse = await AiService.getRecruitmentPostSuggestions({
          majorId: savedUser.majorId,
          limit: 10,
        });

        // Check if response is successful
        if (!aiResponse || aiResponse.success === false || !aiResponse.data) {
          if (mounted) setAiSuggestedGroupPosts([]);
          return;
        }
        // Handle array response structure with post wrapper
        let suggestions = [];

        if (Array.isArray(aiResponse.data.data)) {
          suggestions = aiResponse.data.data.filter(
            (item) =>
              item && typeof item === "object" && item.post && item.post.id
          );
        }

        if (mounted && suggestions.length > 0) {
          setAiSuggestedGroupPosts(suggestions);
          notification.info({
            message: t("aiSuggestionsAvailable") || "AI Suggestions Available",
            description: `Found ${suggestions.length} recommended groups for you`,
            placement: "topRight",
            duration: 3,
          });
        } else {
          if (mounted) setAiSuggestedGroupPosts([]);
        }
      } catch {
        if (mounted) setAiSuggestedGroupPosts([]);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, savedUser?.majorId, membership.hasGroup, myGroupDetails]);

  /** refetch sau khi tạo post - GỌI LẠI API để có data mới nhất */
  const handleCreated = async () => {
    try {
      const [groupRes, individualRes] = await Promise.all([
        PostService.getRecruitmentPosts(),
        PostService.getPersonalPosts(),
      ]);
      const groupArr = toArraySafe(groupRes).filter(
        (x) => x?.type === "group_hiring"
      );
      const individualArr = toArraySafe(individualRes).filter(
        (x) => x?.type === "individual"
      );

      // Cập nhật lại tất cả data
      setAllPostsData([...groupArr, ...individualArr]);
      setPostsData(activeTab === "groups" ? groupArr : individualArr);
    } catch {
      notification.error({
        message: t("error") || "Error",
        description: t("failedToFetchPosts") || "Failed to fetch posts",
        placement: "topRight",
        duration: 3,
      });
    }
  };

  /** Create sets of AI suggested IDs to filter duplicates */
  const aiGroupPostIds = useMemo(() => {
    return new Set(
      aiSuggestedGroupPosts.map((item) => item.post?.id).filter(Boolean)
    );
  }, [aiSuggestedGroupPosts]);

  const aiProfilePostIds = useMemo(() => {
    return new Set(
      aiSuggestedPosts.map((item) => item.profilePost?.id).filter(Boolean)
    );
  }, [aiSuggestedPosts]);

  /** filter */
  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return (postsData || []).filter((item) => {
      // Hide posts that are explicitly closed
      if ((item?.status || "").toString().toLowerCase() === "closed")
        return false;

      // Hide posts that are already shown in AI suggestions
      if (activeTab === "groups" && aiGroupPostIds.has(item.id)) {
        return false;
      }
      if (activeTab === "individuals" && aiProfilePostIds.has(item.id)) {
        return false;
      }

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
  }, [postsData, debouncedQuery, activeTab, aiGroupPostIds, aiProfilePostIds]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, activeTab]);

  const total = filtered.length;
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

      const updatePost = (item) => {
        if (!item || item.id !== id) return item;

        const currentCount = item.applicationsCount || 0;

        return {
          ...item,
          hasApplied: true,
          myApplicationStatus: newStatus,
          myApplicationId: res?.data?.id || item?.myApplicationId || null,
          applicationsCount: currentCount + 1,
        };
      };

      setPostsData((prev) => (prev || []).map(updatePost));

      setAllPostsData((prev) => (prev || []).map(updatePost));

      setAiSuggestedGroupPosts((prev) =>
        (prev || []).map((s) => {
          const post = s.post || {};
          if (post.id !== id) return s;

          const currentCount = post.applicationsCount || 0;

          return {
            ...s,
            post: {
              ...post,
              hasApplied: true,
              myApplicationStatus: newStatus,
              myApplicationId: res?.data?.id || post.myApplicationId || null,
              applicationsCount: currentCount + 1,
            },
          };
        })
      );

      notification.success({
        message: t("inviteRequestSent") || "Invite request sent!",
      });

      // Close detail modal if open
      setDetailOpen(false);
    } catch {
      notification.error({
        message:
          t("failedToSendInviteRequest") || "Failed to send invite request.",
      });
    } finally {
      setApplyLoadingId(null);
      setApplyOpen(false);
      setApplyPost(null);
    }
  };

  const onInvite = async (postId) => {
    try {
      await PostService.inviteProfilePost(postId);

      // Update main lists
      setAllPostsData((prev) =>
        prev.map((item) =>
          item.id === postId
            ? { ...item, hasApplied: true, myApplicationStatus: "pending" }
            : item
        )
      );
      setPostsData((prev) =>
        prev.map((item) =>
          item.id === postId
            ? { ...item, hasApplied: true, myApplicationStatus: "pending" }
            : item
        )
      );

      // 👉 Update AI recommended profiles
      setAiSuggestedPosts((prev) =>
        (prev || []).map((s) => {
          const profilePost = s.profilePost || {};
          if (profilePost.id !== postId) return s;
          return {
            ...s,
            profilePost: {
              ...profilePost,
              hasApplied: true,
              myApplicationStatus: "pending",
            },
          };
        })
      );

      notification.success({
        message:
          t("userInvitedToGroup") || "User invited to the group successfully!",
      });
    } catch (error) {
      notification.error({
        message: getErrorMessage(
          error,
          t("failedToInviteUser") || "Failed to invite user."
        ),
      });
    }
  };

  const openDetail = (postId) => {
    if (!postId) {
      return;
    }
    setDetailGroupId(postId);
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

  // Handler for AI recommended groups
  const handleAIGroupApply = (detail, postId, groupId) => {
    const fullPost = postsData.find((p) => p.groupId === groupId) || {
      ...detail,
      id: postId || groupId,
      groupId,
      type: "group_hiring",
    };
    onClickOpenApply(fullPost);
  };

  // Handler for opening group detail
  const handleOpenGroupDetail = (postId) => {
    setDetailGroupId(postId);
    setDetailOpen(true);
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
                      {t("createRecruitPost") || "Create recruitment Post"}
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
                      {t("createPersonalPost") || "Create personal Post"}
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
          {/* AI Suggested Groups - Show at top for groups tab */}
          {activeTab === "groups" && (
            <AIRecommendedGroups
              aiSuggestedGroupPosts={aiSuggestedGroupPosts}
              membership={membership}
              onOpenDetail={handleOpenGroupDetail}
              onApply={handleAIGroupApply}
            />
          )}

          {/* AI Suggested Profiles - Show at top for individuals tab */}
          {activeTab === "individuals" && (
            <AIRecommendedProfiles
              aiSuggestedPosts={aiSuggestedPosts}
              membership={membership}
              onInvite={onInvite}
            />
          )}

          {/* Only show "No results" if there are no AI suggestions AND no filtered posts */}
          {filtered.length === 0 &&
            aiSuggestedGroupPosts.length === 0 &&
            aiSuggestedPosts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
                {t("noData") || "No results found."}
              </div>
            )}

          {/* GROUP CARDS */}
          {activeTab === "groups" &&
            paged.map((p) => (
              <GroupCard
                key={p.id}
                post={p}
                membership={membership}
                applyLoadingId={applyLoadingId}
                onOpenDetail={openDetail}
                onApply={onClickOpenApply}
                onClickLeader={goProfile}
              />
            ))}

          {/* PERSONAL CARDS */}
          {activeTab === "individuals" &&
            paged.map((u) => (
              <PersonalCard
                key={u.id}
                post={u}
                userRole={userRole}
                onInvite={onInvite}
                onClickProfile={goProfile}
              />
            ))}

          {/* Pagination */}
          <Pagination
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            total={total}
          />
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
          onApply={onClickOpenApply}
          membership={membership}
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
