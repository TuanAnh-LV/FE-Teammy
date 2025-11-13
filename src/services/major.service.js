import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const MajorService = {
  getMajors(params = {}) {
    return BaseService.get({
      url: API.MAJORS.LIST,
      params,
      isLoading: true,
    });
  },
};
