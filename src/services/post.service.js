import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const PostService = {
  getPersonalPosts() {
    return BaseService.get({
      url: API.POST.GET_PERSONAL,
      isLoading: true,  
    });
  },
  getRecruitmentPosts() {
    return BaseService.get({
      url: API.POST.GET_GROUP,
      isLoading: true,
    });
  },
  createPersonalPost(payload) {
    return BaseService.post({
      url: API.POST.POST_PERSONAL,
      payload,
      isLoading: true,
    });
  },
  createRecruitmentPost(payload) {
    return BaseService.post({
      url: API.POST.POST_GROUP,
      payload,
      isLoading: true,
    });
  },
  inviteProfilePost(postId) {
    return BaseService.post({
      url: API.POST.INVITE_PROFILE_POST(postId),
      payload: {},
      isLoading: true,
    });
  },
  // Get all profile posts (lay tat ca posts ca nhan, roi filter o client)
  getAllProfilePosts() {
    return BaseService.get({
      url: API.POST.GET_PERSONAL,
      isLoading: true,
    });
  },
  // Delete a profile post
  deleteProfilePost(postId) {
    return BaseService.delete({
      url: `${API.POST.GET_PERSONAL}/${postId}`,
      isLoading: true,
    });
  },
  // Get posts for a specific group
  getGroupPostsByGroupId(groupId) {
    return BaseService.get({
      url: API.POST.GET_GROUP_POSTS(groupId),
      isLoading: true,
    });
  },
};
