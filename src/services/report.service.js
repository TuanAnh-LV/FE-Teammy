import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const ReportService = {
  getProjectReport(groupId, params = {}) {
    return BaseService.get({
      url: API.REPORT.PROJECT(groupId),
      params,
      isLoading: true,
    });
  },
};
