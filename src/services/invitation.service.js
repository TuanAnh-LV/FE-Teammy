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
};
