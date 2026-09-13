import axios from "axios";
import { envConfig } from "../config/envConfig";

// Local storage key used to persist the active user's JWT access token
export const TOKEN_KEY = "intake_token";

// Reads the stored auth token from the browser
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

// Saves the active session token to local storage
export const setToken = (token: string): void =>
  localStorage.setItem(TOKEN_KEY, token);

// Removes the session token from local storage on sign out
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

const API_BASE = envConfig.apiUrl;

// Configured Axios HTTP client instance for backend communication
const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attaches the Bearer token to all outgoing HTTP requests if a session exists
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalizes API error payloads and triggers auto-logout redirect on 401 Unauthorized
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Network error - is the backend running?";

    // Handles session expiration without triggering recursive redirects on auth screens
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
