import React, { useEffect, useState } from "react";
import { Empty, Skeleton } from "antd";
import { PostService } from "../../../services/post.service";
import { useTranslation } from "../../../hook/useTranslation";
import { useAuth } from "../../../context/AuthContext";
import { initials, timeAgoFrom, toArraySkills } from "../../../utils/helpers";

const clamp3 = {
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

export default function ProfilePostsTab({ userId }) {
  const { t } = useTranslation();
  const { userInfo } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserPosts();
  }, [userId]);

  const loadUserPosts = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await PostService.getAllProfilePosts();
      const allPosts = Array.isArray(response?.data) ? response.data : [];
      
      const userPosts = allPosts.filter((post) => {
        const postUserId = post.user?.userId || post.userId;
        return postUserId === userId;
      });
      
      setPosts(userPosts);
    } catch (error) {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await PostService.deleteProfilePost(postId);
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (error) {
      // Error handled
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} active paragraph={{ rows: 4 }} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Empty
        description={t("noPostsYet") || "No posts yet"}
        style={{ marginTop: "50px", marginBottom: "50px" }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {posts.map((post) => {
        const postUserId = post.user?.userId || post.userId;
        const postAuthorName = post.user?.displayName || post.authorName || "Unknown";
        const postAuthorAvatar = post.user?.avatarUrl;
        const majorName = post.user?.majorName || post.major?.majorName || "";
        const isAuthor = postUserId === userInfo?.userId;
        const timeAgo = post.createdAt ? timeAgoFrom(post.createdAt) : "";
        
        // Parse skills from position_needed
        const skills = (typeof post.position_needed === "string"
          ? post.position_needed.split(",")
          : post.position_needed || []
        ).map((s) => s.trim());

        return (
          <div
            key={post.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Header - Author Info */}
            <div className="flex items-start gap-3">
              <div className="flex items-start gap-3 flex-1">
                {/* AVATAR */}
                <div className="relative mt-1 h-10 w-10 shrink-0">
                  {postAuthorAvatar && (
                    <img
                      src={postAuthorAvatar}
                      alt={postAuthorName}
                      className="h-10 w-10 rounded-full object-cover shadow-sm"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "flex";
                      }}
                    />
                  )}
                  <div
                    className="h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white"
                    style={{ display: postAuthorAvatar ? "none" : "flex" }}
                  >
                    {initials(postAuthorName)}
                  </div>
                </div>

                {/* Name + Time + Major */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {postAuthorName}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                    <span>{timeAgo}</span>
                    {majorName && <span>•</span>}
                    {majorName && <span>{majorName}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Title */}
            <p className="mt-3 text-base font-semibold text-gray-900">
              {post.title}
            </p>

            {/* Description */}
            <p className="mt-2 text-sm text-gray-700" style={clamp3}>
              {post.description}
            </p>

            {/* Skills and Major Section */}
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Skills */}
                <div className="text-xs font-semibold tracking-wide text-gray-500">
                  {(t("skills") || "Skills") + ":"}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                      skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </div>
                </div>

                {/* Major */}
                {majorName && (
                  <div className="lg:ml-10 text-xs font-semibold tracking-wide text-gray-800">
                    {(t("major") || "Major") + ":"}
                    <div className="mt-2 text-gray-500">{majorName}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Footer */}
            <div className="mt-5 pt-4 border-t border-gray-200">
            </div>
          </div>
        );
      })}
    </div>
  );
}
