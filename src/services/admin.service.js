// services/admin.service.js
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
  /** VALIDATE IMPORT USERS
   * - payload: JSON array of user data to validate
   */
  validateImportUsers(payload, isLoading = true) {
    return BaseService.post({
      url: API.ADMIN.VALIDATE_IMPORT,
      payload: { rows: payload },
      isLoading,
    });
  },

  /** IMPORT USERS
   * - file: File (csv/xlsx…)
   * - gửi multipart/form-data theo field "file"
   */
  importUsers(file, isLoading = true) {
    const form = new FormData();
    form.append("file", file);

    return BaseService.post({
      url: API.ADMIN.IMPORT_USERS,            // "/users/import"
      payload: form,
      isLoading,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /** BAN USER
   * - userId: string
   * - perform ban (DELETE or toggle depending on backend)
   */
  banUser(userId, isLoading = true) {
    return BaseService.remove({
      url: API.ADMIN.BAN_USER(userId),
      isLoading,
    });
  },

  /** DETAIL USER
   * - userId: string
   * - fetch full user details
   */
  detailUser(userId, isLoading = true) {
    return BaseService.get({
      url: API.ADMIN.DETAIL_USER(userId),
      isLoading,
    });
  },
  /** CREATE NEW USER
   * - payload: object containing user details
   */
  createUser(payload = {}, isLoading = true) {
    return BaseService.post({
      url: API.ADMIN.CREATE_USER,
      payload,
      isLoading,
    });
  },

  /** UPDATE USER
   * - userId: string
   * - payload: object containing fields to update
   */
  updateUser(userId, payload = {}, isLoading = true) {
    return BaseService.put({
      url: API.ADMIN.UPDATE_USER(userId),
      payload,
      isLoading,
    });
  },

  /** EXPORT TEMPLATE
   * - tải file template (excel/csv)
   * - responseType: "blob" để nhận file nhị phân
   */
  downloadUsersTemplate(isLoading = false) {
    return BaseService.get({
      url: API.ADMIN.EXPORT_USERS,            // "/users/import/template"
      isLoading,
      responseType: "blob",
    });
  },

  /** GET DASHBOARD STATS
   * - fetch dashboard statistics
   */
  getDashboardStats(isLoading = true) {
    return BaseService.get({
      url: API.ADMIN.DASHBOARD,
      isLoading,
    });
  },
    /** GET ACTIVITY LOGS (System Log)
   * params: {
   *   limit?: number,
   *   before?: string,      // ISO datetime string
   *   entityType?: string,
   *   action?: string,
   *   groupId?: string
   * }
   */
  getActivityLogs(params = {}, isLoading = true) {
    return BaseService.get({
      url: API.ADMIN.ACTIVITY_LOGS,
      params,
      isLoading,
    });
  },
    /** GET MAJOR STATS
   * - fetch statistics by major
   */
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
};
