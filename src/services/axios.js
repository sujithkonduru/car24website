/**
 * axios.js — Centralized Axios instance for Car24
 *
 * - Base URL from VITE_API_URL env variable
 * - Attaches JWT + branch headers on every authenticated request
 * - Handles 401 (token expired) → auto logout + redirect
 * - Normalises error messages so every caller gets err.message
 */

import axios from "axios";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

// ── Helpers ────────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem("car24_token");
}

function decodeToken(token) {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

// ── Axios instance ─────────────────────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — attach auth + branch headers ────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

      // Attach branch-specific headers decoded from JWT
      const decoded = decodeToken(token);
      if (decoded?.branch_id) {
        config.headers["X-Branch-Id"] = String(decoded.branch_id);
      }
      if (decoded?.branchHeadId) {
        config.headers["X-Branch-Head-Id"] = String(decoded.branchHeadId);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — normalise errors ───────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response.data,          // unwrap .data so callers get payload directly
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || "Something went wrong";

    // 401 → token expired / invalid → force logout
    if (status === 401) {
      localStorage.removeItem("car24_token");
      // Dispatch a custom event so AuthContext can react without a circular import
      window.dispatchEvent(new CustomEvent("car24:unauthorized"));
    }

    const normalised = new Error(message);
    normalised.status = status;
    normalised.data   = error.response?.data;
    return Promise.reject(normalised);
  }
);

export default axiosInstance;
export { BASE_URL, getToken, decodeToken };
