import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const AdminService = {
    getListUsers(params = {}, isLoading = true) {
    return BaseService.get({
      url: API.ADMIN.LIST_USERS,
      params,
      isLoading,
    });
  },

  validateImportUsers(payload, isLoading = true) {
    return BaseService.post({
      url: API.ADMIN.VALIDATE_IMPORT,
      payload: { rows: payload },
      isLoading,
    });
  },


  importUsers(file, isLoading = true) {
    const form = new FormData();
    form.append("file", file);

    return BaseService.post({
      url: API.ADMIN.IMPORT_USERS,           
      payload: form,
      isLoading,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },


  banUser(userId, isLoading = true) {
    return BaseService.remove({
      url: API.ADMIN.BAN_USER(userId),
      isLoading,
    });
  },


  detailUser(userId, isLoading = true) {
    return BaseService.get({
      url: API.ADMIN.DETAIL_USER(userId),
      isLoading,
    });
  },

  createUser(payload = {}, isLoading = true) {
    return BaseService.post({
      url: API.ADMIN.CREATE_USER,
      payload,
      isLoading,
    });
  },


  updateUser(userId, payload = {}, isLoading = true) {
    return BaseService.put({
      url: API.ADMIN.UPDATE_USER(userId),
      payload,
      isLoading,
    });
  },


  downloadUsersTemplate(isLoading = false) {
    return BaseService.get({
      url: API.ADMIN.EXPORT_USERS,            
      isLoading,
      responseType: "blob",
    });
  },

  getDashboardStats(isLoading = true) {
    return BaseService.get({
      url: API.ADMIN.DASHBOARD,
      isLoading,
    });
  },
  getActivityLogs(params = {}, isLoading = true) {
    return BaseService.get({
      url: API.ADMIN.ACTIVITY_LOGS,
      params,
      isLoading,
    });
  },
  getMajorStats(isLoading = true) {
    return BaseService.get({
      url: API.ADMIN.MAJOR_STATS,
      isLoading,
    });
  },
  exportReport(payload, isLoading = true) {
    return BaseService.post({
      url: API.REPORT.EXPORT,
      payload,
      isLoading,
      responseType: "blob", 
    });
  },
    getReportOptions(params = {}, isLoading = true) {
    return BaseService.get({
      url: API.REPORT.OPTIONS,
      params,
      isLoading,
    });
  },
    getDashboardModerator(isLoading = true) {
    return BaseService.get({
      url: API.ADMIN.DASHBOARD_MODERATOR,
      isLoading,
    });
  },
  getPlanningOverview(params = {}, isLoading = true) {
    return BaseService.get({
      url: API.ADMIN.PLANNING_OVERVIEW,
      params,
      isLoading,
    });
  },
  createAnnouncement(payload = {}, isLoading = true) {
  return BaseService.post({
    url: API.ADMIN.CREATE_ANNOUNCEMENT,
    payload,
    isLoading,
  });
},
};
