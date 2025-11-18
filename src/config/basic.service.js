// config/basic.service.js
import axios from "axios";
import { toggleLoading } from "../app/loadingSlice";
import { toast } from "react-toastify";
import store from "../app/store";
import { DOMAIN_ADMIN } from "../consts/const";
import { ROUTER_URL } from "../consts/router.const";

export const axiosInstance = axios.create({
  baseURL: DOMAIN_ADMIN,
  headers: { "content-type": "application/json; charset=UTF-8" },
  timeout: 300000,
  timeoutErrorMessage: "Connection timeout exceeded",
});

// ---- NEW: 1 chỗ chuẩn để lấy token ----
function getAccessToken() {
  try {
    const raw = localStorage.getItem("account_admin");
    if (raw) {
      const obj = JSON.parse(raw);
      // đồng bộ nhiều tên khóa nếu trước đây khác nhau
      return obj?.accessToken || obj?.access_token || null;
    }
    // fallback nếu bạn vẫn đang set thêm key 'token'
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

// ---- Interceptor request ----
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (!config.headers) config.headers = {};
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// ---- Interceptor response ----
axiosInstance.interceptors.response.use(
  (res) => {
    store.dispatch(toggleLoading(false));
    return res;
  },
  (err) => {
    store.dispatch(toggleLoading(false));
    const { response } = err;

    if (response?.status === 401) {
      localStorage.clear();
      const loginPath = ROUTER_URL?.COMMON?.LOGIN || "/login";
      window.location.href = loginPath;
    }

    // nếu thiếu token => 403 public page: giữ nguyên logic nhưng dùng getAccessToken()
    if (response?.status === 403 && !getAccessToken()) {
      console.warn("403 Forbidden - likely due to missing token on public page");
      return Promise.reject(err);
    }

    const messages = response?.data?.message || err.message;
    toast.error(messages);
    return Promise.reject(err);
  }
);

// ---- BaseService giữ nguyên chữ ký ----
const checkLoading = (isLoading = false) => {
  if (isLoading) store.dispatch(toggleLoading(true));
};

export const BaseService = {
  get({ url, isLoading = true, params = {}, headers = {}, responseType, onDownloadProgress }) {
    const cleanedParams = { ...params };
    for (const k in cleanedParams) {
      if (cleanedParams[k] === "" && cleanedParams[k] !== 0) delete cleanedParams[k];
    }
    checkLoading(isLoading);
    return axiosInstance.get(url, { params: cleanedParams, headers, ...(responseType ? { responseType } : {}), ...(onDownloadProgress ? { onDownloadProgress } : {}) });
  },

  post({ url, isLoading = true, payload = {}, headers = {}, responseType }) {
    checkLoading(isLoading);
    const isFormData = payload instanceof FormData;
    const finalHeaders = { ...headers, ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}) };
    return axiosInstance.post(url, payload, { headers: finalHeaders, ...(responseType ? { responseType } : {}), });
  },

  put({ url, isLoading = true, payload = {}, headers = {}, responseType  }) {
    checkLoading(isLoading);
    const isFormData = payload instanceof FormData;
    const finalHeaders = { ...headers, ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}) };
    return axiosInstance.put(url, payload, { headers: finalHeaders, ...(responseType ? { responseType } : {}) });
  },

  remove({ url, isLoading = true, payload = {}, headers = {} }) {
    checkLoading(isLoading);
    return axiosInstance.delete(url, { params: payload, headers });
  },

  getById({ url, isLoading = true, payload = {}, headers = {} }) {
    checkLoading(isLoading);
    return axiosInstance.get(url, { params: payload, headers });
  },

  patch({ url, isLoading = true, payload = {}, headers = {}, responseType }) {
    checkLoading(isLoading);
    const isFormData = payload instanceof FormData;
    const finalHeaders = { ...headers, ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}) };
    return axiosInstance.patch(url, payload, { headers: finalHeaders, ...(responseType ? { responseType } : {}) });
  },

  // ---- FIX uploadMedia: dùng token đúng field, có thể xài axiosInstance cho tiện
  async uploadMedia(url, file, isMultiple = false, isLoading = true) {
    const formData = new FormData();
    if (isMultiple) {
      for (let i = 0; i < file.length; i++) formData.append("files[]", file[i]);
    } else {
      formData.append("file", file);
    }

    checkLoading(isLoading);
    try {
      const res = await axiosInstance.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${getAccessToken() || ""}` },
      });
      store.dispatch(toggleLoading(false));
      return res.data;
    } catch (error) {
      const messages = error.response?.data?.message || error.message;
      toast.error(messages);
      store.dispatch(toggleLoading(false));
      return null;
    }
  },
};
