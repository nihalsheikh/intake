import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { envConfig } from "@/config/envConfig";

export const TOKEN_KEY = "intake_token";

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void =>
  localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

const api: AxiosInstance = axios.create({
  baseURL: envConfig.apiUrl,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Network error - is the backend running?";

    if (status === 401 && getToken()) {
      clearToken();
      if (!["/login", "/register"].includes(window.location.pathname)) {
        window.location.href = "/login";
      }
    }

    return Promise.reject({
      ...error,
      message,
      details: error.response?.data?.details,
    });
  },
);

export default api;
