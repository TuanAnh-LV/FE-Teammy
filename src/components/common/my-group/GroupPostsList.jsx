import React, { useEffect, useState } from "react";
import { Empty, Button, Alert, Modal, Tag } from "antd";
import { Clock, Eye, Calendar, Users } from "lucide-react";
import { PostService } from "../../../services/post.service";
import { useTranslation } from "../../../hook/useTranslation";
import { toArrayPositions, toArraySkills } from "../../../utils/helpers";


export default function GroupPostsList({ groupId, isLeader = false }) {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!groupId) return;
    fetchPosts();
  }, [groupId]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await PostService.getGroupPostsByGroupId(groupId);
      const data = Array.isArray(response.data) ? response.data : [];
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch group posts:", err);
      setError(err?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const clamp3 = {
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Posts"
        description={error}
        type="error"
        showIcon
        style={{ marginTop: "20px" }}
        action={
          <Button size="small" danger onClick={fetchPosts}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Empty
        description="No Posts Yet"
        style={{ marginTop: "100px", marginBottom: "100px" }}
      >
        <div className="text-center text-gray-600">
          <p className="mb-2">This group hasn't created any recruitment posts yet.</p>
          {isLeader && (
            <Button type="primary" onClick={() => console.log("Create post")}>
              Create First Post
            </Button>
          )}
        </div>
      </Empty>
    );
  }

  const handleApply = (post) => {
    Modal.confirm({
      title: `Apply to "${post.title}"`,
      content: `Are you sure you want to apply for this position?`,
      okText: "Apply",
      okType: "primary",
      onOk() {
        console.log("Applying to post:", post.id);
        // TODO: Call apply API
      },
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Recruitment Posts</h2>
        <p className="text-gray-600 text-sm mt-1">{posts.length} position(s) available</p>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
              <div className="space-y-2 flex-1">
                {/* Title & Status */}
                <div className="flex items-start gap-2 md:gap-3 flex-wrap">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 flex-1 min-w-0">
                    {post.title}
                  </h3>
                  {post.status && (
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg shrink-0 whitespace-nowrap ${
                        post.status === "open"
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {post.status}
                    </span>
                  )}
                </div>

                {/* Author, Team, Date */}
                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm md:text-lg font-semibold shrink-0">
                      {(post.group?.leader?.displayName || post.group?.name || "T")
                        .slice(0, 1)
                        .toUpperCase()}
                    </div>
                    <span className="truncate">
                      {post.group?.leader?.displayName || "Unknown"} •{" "}
                      {post.group?.leader?.role || "leader"}
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

              {/* Applications & Due Date */}
              <div className="flex md:flex-col gap-4 md:gap-0 md:text-right text-xs md:text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>
                    {post.applicationsCount || 0}{" "}
                    <span className="hidden sm:inline">Applications</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 md:mt-1">
                  <Calendar className="w-3 h-3" />
                  <span className="truncate">
                    {post.applicationDeadline
                      ? `Due: ${new Date(post.applicationDeadline).toLocaleDateString()}`
                      : "No deadline"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="mt-3 text-sm text-gray-700" style={clamp3}>
              {post.description}
            </p>

            {/* Positions & Major */}
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Positions Needed */}
                <div className="text-xs font-semibold tracking-wide text-gray-800">
                  Positions Needed:
                  <div className="mt-2 flex flex-wrap gap-2">
                    {toArrayPositions(post).length > 0 ? (
                      toArrayPositions(post).map((s) => (
                        <span
                          key={s}
                          className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">{post.position_needed}</span>
                    )}
                  </div>
                </div>

                {/* Major */}
                <div className="lg:ml-10 text-xs font-semibold tracking-wide text-gray-800">
                  Major:
                  <div className="mt-2 text-gray-500">
                    {post.major?.majorName || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            {(toArraySkills(post).length > 0 || post.skills?.length > 0) && (
              <div className="mt-4 text-xs font-semibold tracking-wide text-gray-800">
                Skills:
                <div className="mt-2 flex flex-wrap gap-2">
                  {toArraySkills(post).length > 0 ? (
                    toArraySkills(post).map((s) => (
                      <span
                        key={s}
                        className="inline-block bg-cyan-50 text-cyan-600 px-3 py-1 rounded-lg text-xs"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    post.skills?.map((s) => (
                      <span
                        key={s}
                        className="inline-block bg-cyan-50 text-cyan-600 px-3 py-1 rounded-lg text-xs"
                      >
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Footer - Members only */}
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-300">
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                <Users className="h-4 w-4" />
                <span>
                  {post.currentMembers}/{post.group?.maxMembers} Members
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
