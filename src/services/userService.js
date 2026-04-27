/**
 * userService.js — User profile, documents, credits
 */

import http from "./axios.js";

export const getUserData = () =>
  http.get("/user/getData");

export const updateProfile = (id, data) =>
  http.put(`/user/UpdateProfile/${id}`, data);

export const getDocuments = () =>
  http.get("/user/getDocuments");

export const uploadDocument = (formData) =>
  http.post("/photoUpload/DocumentUpload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getMyCredits = () =>
  http.get("/bookingApi/myCredits");

// ── Management (admin creates staff) ──────────────────────────────────────
export const createManagement = (data) =>
  http.post("/roleauth/createMangement", data);
