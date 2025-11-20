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

  const memberEntries =
    (Array.isArray(group.membersList) && group.membersList) ||
    (Array.isArray(group.members) && group.members) ||
    (Array.isArray(group.memberDetails) && group.memberDetails) ||
    (Array.isArray(group.memberProfiles) && group.memberProfiles) ||
    [];

  const normalizedMembers = memberEntries.map((member, memberIdx) => {
    const name =
      member?.displayName ||
      member?.name ||
      member?.fullName ||
      member?.username ||
      member?.email ||
      `Member ${memberIdx + 1}`;
    return {
      id:
        member?.id ||
        member?.memberId ||
        member?.userId ||
        member?.userID ||
        member?.accountId ||
        `member-${memberIdx}`,
      name,
      avatar:
        member?.avatarUrl ||
        member?.avatarURL ||
        member?.photoURL ||
        member?.photoUrl ||
        member?.profileImage ||
        member?.profilePicture ||
        member?.imageUrl ||
        member?.imageURL ||
        member?.image ||
        "",
    };
  });

  const resolveMembersCount = () => {
    const numberCandidates = [
      group.currentMembers,
      !Array.isArray(group.members) ? group.members : null,
      group.memberCount,
      group.membersCount,
      group.totalMembers,
      group.countMembers,
    ];

    for (const candidate of numberCandidates) {
      if (candidate === null || candidate === undefined) continue;
      const num = Number(candidate);
      if (!Number.isNaN(num) && num >= 0) return num;
    }
    if (normalizedMembers.length > 0) return normalizedMembers.length;
    return 1;
  };

  const membersCount = resolveMembersCount();

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
    members: membersCount,
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
    memberPreview: normalizedMembers,
    mentor: group.mentor?.displayName || group.mentorName || "",
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


export const calculateProgressFromTasks = (board) => {
  if (!board || !board.columns || !Array.isArray(board.columns)) {
    return 0;
  }

  let totalTasks = 0;
  let completedTasks = 0;

  board.columns.forEach((column) => {
    const tasks = column.tasks || column.taskResponses || [];
    const taskCount = tasks.length;
    
    totalTasks += taskCount;
    
    if (column.isDone) {
      completedTasks += taskCount;
    }
  });

  if (totalTasks === 0) {
    return 0;
  }

  const progress = Math.round((completedTasks / totalTasks) * 100);
  return Math.min(100, Math.max(0, progress));
};
