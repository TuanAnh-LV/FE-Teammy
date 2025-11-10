export const API = {
    COMMON: {
        PUBLIC: "api/client"
    },
    AUTH: {
        LOGIN: "/auth/login"
    },
    POST: {
        GET_PERSONAL: "/profile-posts",
        GET_GROUP: "/recruitment-posts",
        POST_PERSONAL: "/profile-posts",
        POST_GROUP: "/recruitment-posts",
    },
    GROUPS: {
        MEMBERSHIP: "/groups/membership", 
    },
     USERS: {
        LIST: "/users",
        DETAIL: "/users/:id",
    },
    INVITATIONS: {
        LIST: "/invitations",
        ACCEPT: (id) => `/invitations/${id}/accept`,
        DECLINE: (id) => `/invitations/${id}/decline`,
    },
    GROUP: {
        CREATE_GROUP: "/groups",
        MY_GROUPS: "/groups/my",
        GROUP_DETAIL: "/groups/:id/",
        LIST_MEMBERS: "/groups/:id/members",
        INVITE_MEMBER: "/groups/:id/invites",
        JOIN_REQUESTS: (groupId) => `/groups/${groupId}/join-requests`,
        ACCEPT_JOIN: (groupId, requestId) =>
      `/groups/${groupId}/join-requests/${requestId}/accept`,
        REJECT_JOIN: (groupId, requestId) =>
      `/groups/${groupId}/join-requests/${requestId}/reject`,
    }
}

   

