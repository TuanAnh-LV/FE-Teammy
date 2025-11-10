import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";


export const GroupService = {
    createGroup({ name, description, maxMembers }) {
        const payload = { name, description, maxMembers };
        return BaseService.post({
            url: API.GROUP.CREATE_GROUP,
            payload,
            isLoading: true,
        });
    },
    getMyGroups() {
        return BaseService.get({
            url: API.GROUP.MY_GROUPS,
            isLoading: true,
        });
    },

    getGroupDetail(id) {
        return BaseService.get({
            url: API.GROUP.GROUP_DETAIL.replace(':id', id),
            isLoading: true,
        });
    },
    getListMembers(id) {
        return BaseService.get({
            url: API.GROUP.LIST_MEMBERS.replace(':id', id),
            isLoading: true,
        });
    },

    inviteMember(groupId, userId) {
        const payload = { userId };
        return BaseService.post({
            url: API.GROUP.INVITE_MEMBER.replace(':id', groupId),
            payload,
            isLoading: true,
        });
    },
};
