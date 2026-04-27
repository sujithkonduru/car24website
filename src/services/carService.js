/**
 * carService.js — Cars, branches, owner car management, admin approvals
 */

import http from "./axios.js";

// ── Public ─────────────────────────────────────────────────────────────────
export const getCars = (params = {}) =>
  http.get("/cars/get_cars", { params });

export const getCar = (id) =>
  http.get(`/cars/get_car/${id}`);

export const getBranches = () =>
  http.get("/cars/get_branches");

// ── Owner ──────────────────────────────────────────────────────────────────
export const getOwnerCars = () =>
  http.get("/owners/owner_cars", { params: { ownerId: "me" } });

export const getCarDetails = (carId) =>
  http.get(`/owners/get_car_details/${carId}`);

export const getCarStats = (carId) =>
  http.get(`/owners/getCarStats/${carId}`);

export const addCar = (branchId, formData) =>
  http.post(`/cars/addCar/${branchId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateCar = (carId, formData) =>
  http.put(`/cars/update_car/${carId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getOwnerDashboardData = () =>
  http.get("/owners/get_owner_dashboard");

export const getEarningsBreakdown = (period = "all") =>
  http.get("/owners/get_earnings_breakdown", { params: { period } });

export const getOwnerProfile = () =>
  http.get("/owners/owner_profile");

export const updateOwnerProfile = (data) =>
  http.put("/owners/update_owner_profile", data);

// ── Admin approvals ────────────────────────────────────────────────────────
export const getPendingCars = () =>
  http.get("/cars/get_pending_cars");

export const approveCar = (carId, data) =>
  http.put(`/cars/approve_pending_cars/${carId}`, data);

export const getPendingOwners = () =>
  http.get("/owners/get_pending_owners");

export const approveOwner = (ownerId) =>
  http.put(`/owners/approve_owner/${ownerId}`, {});

// ── Admin analytics ────────────────────────────────────────────────────────
export const getAdminDashboardStats = () =>
  http.get("/cars/admin/dashboard_stats");

export const getAdminEarningsReport = (period = "month") =>
  http.get("/cars/admin/earnings_report", { params: { period } });

export const getAdminCarAnalytics = () =>
  http.get("/cars/admin/car_analytics");

export const getAdminOwnerAnalytics = () =>
  http.get("/cars/admin/owner_analytics");

export const getAdminBranchPerformance = () =>
  http.get("/cars/admin/branch_performance");

// ── Reviews ────────────────────────────────────────────────────────────────
export const getCarReviews = (carId) =>
  http.get(`/reviews/car_reviews/${carId}`);

export const addReview = (data) =>
  http.post("/reviews/add_review", data);
