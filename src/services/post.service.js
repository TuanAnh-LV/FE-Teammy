import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const PostService = {
  getPersonalPosts(params) {
    return BaseService.get({
      url: API.POST.GET_PERSONAL,
      params,             
      isLoading: true,
    });
  },

  getRecruitmentPosts(params) {
    return BaseService.get({
      url: API.POST.GET_GROUP,
      params,                
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
  getPersonalPostDetail(id) {
    return BaseService.get({
      url: API.POST.DETAIL_PERSONAL(id),
      isLoading: true,
    });
  },
  getRecruitmentPostDetail(id) {
    return BaseService.get({
      url: API.POST.DETAIL_GROUP(id),
      isLoading: true,
    });
  },
  updatePersonalPost(id, payload) {
    return BaseService.put({
      url: API.POST.UPDATE_PERSONAL(id),
      payload,
      isLoading: true,
    });
  },
  updateRecruitmentPost(id, payload) {
    return BaseService.put({
      url: API.POST.UPDATE_GROUP(id),
      payload,
      isLoading: true,
    });
  },
  deleteRecruitmentPost(id) {
    return BaseService.remove({
      url: API.POST.DELETE_GROUP(id),
      isLoading: true,
    });
  },
  getAllProfilePosts() {
    return BaseService.get({
      url: API.POST.GET_PERSONAL,
      isLoading: true,
    });
  },
  deleteProfilePost(postId) {
    return BaseService.remove({
      url: API.POST.DELETE_PERSONAL(postId),
      isLoading: true,
    });
  },
  getGroupPostsByGroupId(groupId) {
    return BaseService.get({
      url: API.POST.GET_GROUP_POSTS(groupId),
      isLoading: true,
    });
  },
};
