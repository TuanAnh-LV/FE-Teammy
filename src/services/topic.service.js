import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const TopicService = {
  getTopics(params = {}) {
    return BaseService.get({
      url: API.TOPICS.LIST,
      params,
      isLoading: true,
    });
  },

  validateImportTopics(payload, isLoading = true) {
    return BaseService.post({
      url: API.TOPICS.VALIDATE_IMPORT,
      payload: { rows: payload },
      isLoading,
    });
  },
  getTopicDetail(topicId) {
    return BaseService.get({
      url: API.TOPICS.DETAIL_TOPIC(topicId),
      isLoading: true,
    });
  }
  ,
  /** EXPORT TOPICS TEMPLATE
   * - responseType: blob
   */
  exportTopics(isLoading = false) {
    return BaseService.get({
      url: API.TOPICS.EXPORT_TOPICS,
      isLoading,
      responseType: "blob",
    });
  },

  /** IMPORT TOPICS
   * - file: File (csv/xlsx)
   */
  importTopics(file, isLoading = true) {
    const form = new FormData();
    form.append("file", file);
    return BaseService.post({
      url: API.TOPICS.IMPORT_TOPICS,
      payload: form,
      isLoading,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
