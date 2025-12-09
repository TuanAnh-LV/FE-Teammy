export const API = {
  COMMON: {
    PUBLIC: "api/client",
  },
  AUTH: {
    LOGIN: "/auth/login",
    ME: "/auth/me",
  },
  ADMIN: {
    LIST_USERS: "/users/admin",
    CREATE_USER: "/users/admin",
    DETAIL_USER: (id) => `/users/admin/${id}`,
    BAN_USER: (id) => `/users/admin/${id}`,
    IMPORT_USERS: "/users/import",
    VALIDATE_IMPORT: "/users/import/validate",
    EXPORT_USERS: "/users/import/template",
    UPDATE_USER: (id) => `/users/admin/${id}`,
    DASHBOARD: "/dashboard",
    ACTIVITY_LOGS: "/admin/activity-logs"
  },
  POST: {
    GET_PERSONAL: "/profile-posts",
    GET_GROUP: "/recruitment-posts",
    POST_PERSONAL: "/profile-posts",
    POST_GROUP: "/recruitment-posts",
    INVITE_PROFILE_POST: (postId) => `/profile-posts/${postId}/invites`,
  },
  GROUPS: {
    MEMBERSHIP: "/groups/membership",
  },
  USERS: {
    LIST: "/users",
    DETAIL: (id) => `/users/${id}`,
    MY_PROFILE: "/users/me/profile",
    UPDATE_PROFILE: "/users/me/profile",
    GET_USER_BY_ID: (id) => `/users/${id}/profile`,
    PROFILE_BY_ID: (userId) => `/users/${userId}/profile`,
  },
  INVITATIONS: {
    LIST: "/invitations",
    ACCEPT: (id) => `/invitations/${id}/accept`,
    DECLINE: (id) => `/invitations/${id}/decline`,
     MY_PROFILE_POSTS: "/profile-posts/my/invitations",
    PROFILE_POST_ACCEPT: (postId, candidateId) =>
      `/profile-posts/${postId}/invitations/${candidateId}/accept`,
    PROFILE_POST_REJECT: (postId, candidateId) =>
      `/profile-posts/${postId}/invitations/${candidateId}/reject`,
  },
  GROUP: {
    LIST_GROUP: "/groups",
    CREATE_GROUP: "/groups",
    MY_GROUPS: "/groups/my",
    GROUP_DETAIL: "/groups/:id",
    UPDATE_GROUP: (id) => `/groups/${id}`,
    LIST_MEMBERS: "/groups/:id/members",
    INVITE_MEMBER: "/groups/:id/invites",
    INVITE_MENTOR: (groupId) => `/groups/${groupId}/mentor-invites`,
    REMOVE_MEMBER: (groupId, memberId) =>
      `/groups/${groupId}/members/${memberId}`,
    ASSIGN_ROLE: (groupId, memberId) =>
      `/groups/${groupId}/members/${memberId}/roles`,
    JOIN_REQUESTS: (groupId) => `/groups/${groupId}/join-requests`,
    PENDING_REQUESTS: (groupId) => `/groups/${groupId}/pending`,
    ACCEPT_JOIN: (groupId, requestId) =>
      `/groups/${groupId}/pending/${requestId}/accept`,
    REJECT_JOIN: (groupId, requestId) =>
      `/groups/${groupId}/pending/${requestId}/reject`,
        LEAVE_GROUP: (id) => `/groups/${id}/members/me`,
        JOIN_POST_TO_GROUP: (id) => `recruitment-posts/${id}/applications`,
    },
    TOPICS: {
        LIST: "/topics",
        CREATE: "/topics",
        DETAIL_TOPIC: (id) => `/topics/${id}`,
        UPDATE: (id) => `/topics/${id}`,
        DELETE: (id) => `/topics/${id}`,
        EXPORT_TOPICS: "/topics/template",
        IMPORT_TOPICS: "/topics/import",
        VALIDATE_IMPORT: "/topics/import/validate",
    },
    MAJORS: {
        LIST: "/majors",
    },
    SKILLS: {
        LIST: "/skills",
        CREATE: "/skills",
        DETAIL: (token) => `/skills/${token}`,
        UPDATE: (token) => `/skills/${token}`,
        DELETE: (token) => `/skills/${token}`,
    },
    BOARD: {
        DETAIL: (groupId) => `/groups/${groupId}/board`,
        CREATE_COLUMN: (groupId) => `/groups/${groupId}/board/columns`,
        UPDATE_COLUMN: (groupId, columnId) =>
            `/groups/${groupId}/board/columns/${columnId}`,
        DELETE_COLUMN: (groupId, columnId) =>
            `/groups/${groupId}/board/columns/${columnId}`,
        CREATE_TASK: (groupId) => `/groups/${groupId}/board/tasks`,
        UPDATE_TASK: (groupId, taskId) =>
            `/groups/${groupId}/board/tasks/${taskId}`,
        DELETE_TASK: (groupId, taskId) =>
            `/groups/${groupId}/board/tasks/${taskId}`,
        MOVE_TASK: (groupId, taskId) =>
            `/groups/${groupId}/board/tasks/${taskId}/move`,
        REPLACE_ASSIGNEES: (groupId, taskId) =>
            `/groups/${groupId}/board/tasks/${taskId}/assignees`,
        LIST_COMMENTS: (groupId, taskId) =>
            `/groups/${groupId}/board/tasks/${taskId}/comments`,
        CREATE_COMMENT: (groupId, taskId) =>
            `/groups/${groupId}/board/tasks/${taskId}/comments`,
        UPDATE_COMMENT: (groupId, commentId) =>
            `/groups/${groupId}/board/comments/${commentId}`,
        DELETE_COMMENT: (groupId, commentId) =>
            `/groups/${groupId}/board/comments/${commentId}`,
        GROUP_FILES: (groupId) => `/groups/${groupId}/board/files`,
        TASK_FILES: (groupId, taskId) =>
            `/groups/${groupId}/board/tasks/${taskId}/files`,
        UPLOAD_FILE: (groupId) => `/groups/${groupId}/board/files/upload`,
        DELETE_FILE: (groupId, fileId) =>
            `/groups/${groupId}/board/files/${fileId}`,
   },
    BACKLOG: {
      LIST: (groupId) => `/groups/${groupId}/tracking/backlog`,
      CREATE: (groupId) => `/groups/${groupId}/tracking/backlog`,
      UPDATE: (groupId, backlogId) =>
        `/groups/${groupId}/tracking/backlog/${backlogId}`,
      ARCHIVE: (groupId, backlogId) =>
        `/groups/${groupId}/tracking/backlog/${backlogId}`,
      PROMOTE: (groupId, backlogId) =>
        `/groups/${groupId}/tracking/backlog/${backlogId}/promote`,
  },
  MILESTONES: {
    LIST: (groupId) => `/groups/${groupId}/tracking/milestones`,
    CREATE: (groupId) => `/groups/${groupId}/tracking/milestones`,
    UPDATE: (groupId, milestoneId) =>
      `/groups/${groupId}/tracking/milestones/${milestoneId}`,
    DELETE: (groupId, milestoneId) =>
      `/groups/${groupId}/tracking/milestones/${milestoneId}`,
    ASSIGN_ITEMS: (groupId, milestoneId) =>
      `/groups/${groupId}/tracking/milestones/${milestoneId}/items`,
    REMOVE_ITEM: (groupId, milestoneId, backlogItemId) =>
      `/groups/${groupId}/tracking/milestones/${milestoneId}/items/${backlogItemId}`,
  },
  REPORT: {
    PROJECT: (groupId) => `/groups/${groupId}/tracking/reports/project`,
  },
  CHAT: {
    CONVERSATIONS: "/chat/conversations",
    MESSAGES: (sessionId) => `/chat/sessions/${sessionId}/messages`,
    SEND_MESSAGE: "/chat/messages",
    GROUP_MESSAGES: (groupId) => `/groups/${groupId}/chat/messages`,
  },
  AI: {
    RECRUITMENT_POST_SUGGESTIONS: "/ai/recruitment-post-suggestions",
    TOPIC_SUGGESTIONS: "/ai/topic-suggestions",
    PROFILE_POST_SUGGESTIONS: "/ai/profile-post-suggestions",
    AUTO_ASSIGN_TEAMS: "/ai/auto-assign/teams",
    AUTO_ASSIGN_TOPIC: "/ai/auto-assign/topic",
    SUMMARY: "/ai/summary",
    OPTIONS: "/ai/options",
    AUTO_RESOLVE: "/ai/auto-resolve"
  },
  SEMESTERS: {
    LIST: "/semesters",
    CREATE: "/semesters",
    DETAIL: (id) => `/semesters/${id}`,
    UPDATE: (id) => `/semesters/${id}`,
    ACTIVE: "/semesters/active",
    POLICY: (id) => `/semesters/${id}/policy`,
    UPDATE_POLICY: (id) => `/semesters/${id}/policy`,
    ACTIVATE: (id) => `/semesters/${id}/activate`,
  },
}

    

