import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const GroupService = {
  getListGroup() {
    return BaseService.get({
      url: API.GROUP.LIST_GROUP,
      isLoading: true,
    });
  },

  createGroup(payload) {
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

  // Mentor: list recruiting groups for mentoring
  listRecruitingGroups() {
    return BaseService.get({
      url: `${API.GROUP.LIST_GROUP}?status=recruiting`,
      isLoading: true,
    });
  },

  getGroupDetail(id) {
    return BaseService.get({
      url: API.GROUP.GROUP_DETAIL.replace(":id", id),
      isLoading: true,
    });
  },

  activateGroup(id) {
    return BaseService.post({
      url: API.GROUP.ACTIVATE(id),
      isLoading: true,
    });
  },

  updateGroup(id, payload) {
    return BaseService.patch({
      url: API.GROUP.UPDATE_GROUP(id),
      payload,
      isLoading: true,
    });
  },

  // Mentor: send mentor request to a group
  sendMentorRequest(groupId, payload) {
    return BaseService.post({
      url: `/groups/${groupId}/mentor-requests`,
      payload,
      isLoading: true,
    });
  },
  assignTopic(groupId, topicId) {
    return BaseService.patch({
      url: API.GROUP.UPDATE_GROUP(groupId),
      payload: { topicId },
      isLoading: true,
    });
  },


  getListMembers(id) {
    return BaseService.get({
      url: API.GROUP.LIST_MEMBERS.replace(":id", id),
      isLoading: true,
    });
  },

  kickMember(groupId, memberId) {
    return BaseService.remove({
      url: API.GROUP.REMOVE_MEMBER(groupId, memberId),
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

  inviteMentor(groupId, payload) {
    return BaseService.post({
      url: API.GROUP.INVITE_MENTOR(groupId),
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

  assignMemberRole(groupId, memberId, roleName) {
    return BaseService.post({
      url: API.GROUP.ASSIGN_ROLE(groupId, memberId),
      payload: { roleName },
      isLoading: true,
    });
  },

  updateMemberRole(groupId, memberId, roleName) {
    return BaseService.put({
      url: API.GROUP.ASSIGN_ROLE(groupId, memberId),
      payload: { roleName },
      isLoading: true,
    });
  },

  transferLeader(groupId, newLeaderUserId) {
    return BaseService.post({
      url: API.GROUP.TRANSFER_LEADER(groupId),
      payload: { newLeaderUserId },
      isLoading: true,
    });
  },

  // Feedback APIs
  getFeedbackList(groupId) {
    return BaseService.get({
      url: API.GROUP.FEEDBACK_LIST(groupId),
      isLoading: true,
    });
  },

  createFeedback(groupId, payload) {
    return BaseService.post({
      url: API.GROUP.FEEDBACK_CREATE(groupId),
      payload,
      isLoading: true,
    });
  },

  updateFeedbackStatus(groupId, feedbackId, payload) {
    return BaseService.post({
      url: API.GROUP.FEEDBACK_UPDATE_STATUS(groupId, feedbackId),
      payload,
      isLoading: true,
    });
  },
};

