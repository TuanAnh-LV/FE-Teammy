// src/utils/group.utils.js
export const formatSemester = (semester = {}) => {
  const season = semester.season
    ? `${semester.season}`.trim()
    : semester.season === 0
      ? "0"
      : "";
  const formattedSeason = season
    ? season.charAt(0).toUpperCase() + season.slice(1)
    : "";
  return [formattedSeason, semester.year].filter(Boolean).join(" ");
};

export const normalizeGroup = (group, idx = 0) => {
  const role = (group.role || "").toLowerCase();
  const progress = Number(group.progress ?? 0);
  return {
    id: String(group.groupId || group.id || `G-${idx + 1}`),
    title: group.name || group.title || `Group ${idx + 1}`,
    description: group.description || "No description yet.",
    status: (group.status || "recruiting").toLowerCase(),
    field:
      group.field ||
      group.major?.name ||
      group.major?.majorName ||
      (typeof group.major === "string" ? group.major : "") ||
      "",
    majorId:
      group.majorId ||
      group.major?.id ||
      group.major?.majorId ||
      group.majorID ||
      "",
    role,
    displayRole: group.role || "Member",
    isLeader: role === "leader",
    members: Number(group.currentMembers ?? group.members ?? 1),
    maxMembers: Number(group.maxMembers ?? 5),
    createdAt: group.createdAt || new Date().toISOString(),
    avatarUrl: group.leader?.avatarUrl || "",
    leaderName: group.leader?.displayName || "",
    topicId: group.topicId || group.topic?.id || "",
    topicTitle: group.topic?.title || group.topicTitle || "",
    semesterLabel: formatSemester(group.semester || {}),
    progress: Number.isNaN(progress)
      ? 0
      : Math.min(100, Math.max(0, progress)),
  };
};

export const mapPendingRequest = (req = {}) => {
  const email = req.email || req.requesterEmail || "";
  return {
    id: req.requestId || req.id,
    name: req.displayName || req.name || req.requesterName || "Unknown",
    email,
    requestedAt: req.requestedAt || req.createdAt || "",
    avatarUrl:
      req.avatarUrl ||
      req.avatarURL ||
      req.photoURL ||
      req.photoUrl ||
      "",
    type: req.type || "application",
    postId: req.postId || req.postID || "",
    message: req.message || "",
  };
};
