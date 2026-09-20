import axios from "axios";
import { getToken, clearToken } from "./auth";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A single place to react to auth failures instead of every page repeating
// the same "if 401/403 -> wipe token -> redirect" block.
let onUnauthorized = null;
export function registerUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      clearToken();
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(error);
  }
);

// Helper to pull a readable message out of whatever shape the backend
// returned (plain string, {message}, {error}, validation map, etc.)
export function extractErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (typeof data === "string") return data;
  if (data.message) return data.message;
  if (data.error) return data.error;
  const firstKey = Object.keys(data)[0];
  if (firstKey && typeof data[firstKey] === "string") return data[firstKey];
  return fallback;
}

export default api;
