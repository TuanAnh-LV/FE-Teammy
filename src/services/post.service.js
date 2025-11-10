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
};
