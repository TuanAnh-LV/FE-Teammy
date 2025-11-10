export const API = {
    COMMON: {
        PUBLIC: "api/client"
    },
    AUTH: {
        LOGIN: "/auth/login",
        ME: "/auth/me",
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
        GROUP_DETAIL: "/groups/:id",
        LIST_MEMBERS: "/groups/:id/members",
        INVITE_MEMBER: "/groups/:id/invites",
    }
}
