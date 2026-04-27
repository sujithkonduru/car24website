/**
 * bookingService.js — Bookings, staff tasks, branch operations, payments
 */

import http from "./axios.js";

// ── User bookings ──────────────────────────────────────────────────────────
export const getMyBookings = () =>
  http.get("/bookingApi/myBookings");

export const getBookingDetails = (bookingId) =>
  http.get(`/bookingApi/booking/${bookingId}`);

export const checkAvailability = (carId, pickupDate, dropoffDate) =>
  http.get("/bookingApi/checkAvailability", { params: { carId, pickupDate, dropoffDate } });

export const bookCar = (data) =>
  http.post("/bookingApi/bookCar", data);

export const verifyPayment = (data) =>
  http.post("/bookingApi/verify-payment", data);

export const cancelBooking = (id) =>
  http.post(`/bookingApi/cancelBooking/${id}`, {});

// ── Owner bookings ─────────────────────────────────────────────────────────
export const getOwnerBookings = (filters = {}) =>
  http.get("/bookingApi/ownerBookings", { params: filters });

// ── Staff ──────────────────────────────────────────────────────────────────
export const getStaffTasks = () =>
  http.get("/bookingApi/getStaffTasks");

export const verifyCarKey = (bookingId, key, id) =>
  http.get("/bookingApi/carKeyVerify", { params: { bookingId, key, id } });

export const startRide = (data) =>
  http.put("/bookingApi/startRide", data);

export const endRide = (bookingId, data) =>
  http.put(`/bookingApi/endRide/${bookingId}`, data);

export const collectRemainingPayment = (data) =>
  http.post("/payment/collect-remaining", data);

// ── Branch head ────────────────────────────────────────────────────────────
export const getBranchDashboardStats = () =>
  http.get("/branch/dashboard_stats");

export const getBranchHeadProfile = () =>
  http.get("/branch/profile");

export const getBranchCars = () =>
  http.get("/branch/cars");

export const getBranchBookings = (status = "all") =>
  http.get("/branch/bookings", { params: { status } });

export const getBranchStaff = () =>
  http.get("/branch/staff");

export const getBranchActivities = () =>
  http.get("/branch/activities");

export const verifyBookingStart = (bookingId, otp) =>
  http.post(`/branch/verify-start/${bookingId}`, { otp });

export const verifyBookingEnd = (bookingId, otp) =>
  http.post(`/branch/verify-end/${bookingId}`, { otp });

export const updateBookingStatus = (bookingId, status) =>
  http.put(`/branch/booking/${bookingId}/status`, { status });

export const verifyBooking = (bookingId, action) =>
  http.put(`/staff/verify_booking/${bookingId}`, { action });
