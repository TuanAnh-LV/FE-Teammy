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
};
