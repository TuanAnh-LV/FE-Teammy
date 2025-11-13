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
      url: API.GROUP.GROUP_DETAIL.replace(":id", id),
      isLoading: true,
    });
  },

  getListMembers(id) {
    return BaseService.get({
      url: API.GROUP.LIST_MEMBERS.replace(":id", id),
      isLoading: true,
    });
  },

  getJoinRequests(groupId) {
    return BaseService.get({
      url: API.GROUP.PENDING_REQUESTS(groupId),
      isLoading: true,
    });
  },

  inviteMember(groupId, payload) {
    return BaseService.post({
      url: API.GROUP.INVITE_MEMBER.replace(":id", groupId),
      payload,
      isLoading: true,
    });
  },

  /** Member gửi yêu cầu tham gia nhóm */
  applyToGroup(groupId, payload = {}) {
    return BaseService.post({
      url: API.GROUP.JOIN_REQUESTS(groupId),
      payload,                 
      isLoading: true,
    });
  },
  applyPostToGroup(id, payload = {}) {
    return BaseService.post({
      url: API.GROUP.JOIN_POST_TO_GROUP(id),
      payload,
      isLoading: true,
    })
  },

  /** Leader chấp nhận yêu cầu tham gia */
  acceptJoinRequest(groupId, requestId, payload = {}) {
    return BaseService.post({
      url: API.GROUP.ACCEPT_JOIN(groupId, requestId),
      payload,
      isLoading: true,
    });
  },
  rejectJoinRequest(groupId, requestId, payload = {}) {
    return BaseService.post({
      url: API.GROUP.REJECT_JOIN(groupId, requestId),
      payload,
      isLoading: true,
    });
  },
    leaveGroup(groupId) {
        return BaseService.remove({
            url: API.GROUP.LEAVE_GROUP(groupId),
            isLoading: true,
        });
    },
};
