import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const InvitationService = {
  list(params = {}, isLoading = true) {
    return BaseService.get({
      url: API.INVITATIONS.LIST,
      params,
      isLoading,
    });
  },

  accept(invitationId, isLoading = true) {
    return BaseService.post({
      url: API.INVITATIONS.ACCEPT(invitationId),
      isLoading,
    });
  },

  decline(invitationId, isLoading = true) {
    return BaseService.post({
      url: API.INVITATIONS.DECLINE(invitationId),
      isLoading,
    });
  },
   // GET /api/profile-posts/my/invitations?status=
  getMyProfilePostInvitations(params = {}, isLoading = true) {
    // params: { status?: string }
    return BaseService.get({
      url: API.INVITATIONS.MY_PROFILE_POSTS,
      params,
      isLoading,
    });
  },

 
  acceptProfilePostInvitation(postId, candidateId, isLoading = true) {
    return BaseService.post({
      url: API.INVITATIONS.PROFILE_POST_ACCEPT(postId, candidateId),
      isLoading,
    });
  },

  
  rejectProfilePostInvitation(postId, candidateId, isLoading = true) {
    return BaseService.post({
      url: API.INVITATIONS.PROFILE_POST_REJECT(postId, candidateId),
      isLoading,
    });
  },
};
