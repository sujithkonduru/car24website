/**
 * authService.js — Authentication API calls
 * Covers: user login/register/OTP, owner login/register/OTP,
 *         staff login/OTP, forgot-password flow
 */

import http from "./axios.js";

// ── User ───────────────────────────────────────────────────────────────────
export const userLogin = (email, password) =>
  http.post("/user/userLogin", { email, password });

export const userRegister = (data) =>
  http.post("/user/createUser", data);

export const verifyUserOtp = (email, otp) =>
  http.put("/user/verifyuserRegister", { email, otp });

export const resendUserOtp = (email) =>
  http.post("/user/resendOTP", { email });

export const forgotPassOtp = (email) =>
  http.post("/user/forgotPassOTP", { email });

export const forgotPassOtpVerify = (email, otp) =>
  http.post("/user/forgotPassOTPVerify", { email, otp });

export const changePassword = (changeToken, pass) =>
  http.put("/user/changePass", { pass }, {
    headers: { Authorization: `Bearer ${changeToken}` },
  });

// ── Owner ──────────────────────────────────────────────────────────────────
export const ownerRegister = (data) =>
  http.post("/owners/CreateOwnerAccount", data);

export const ownerLogin = (email, password) =>
  http.post("/owners/LoginOwnerAccount", { email, password });

export const verifyOwnerOtp = (email, otp) =>
  http.put("/user/verifyuserRegister", { email, otp });

export const resendOwnerOtp = (email) =>
  http.post("/owners/resendOwnerOTP", { email });

// ── Staff ──────────────────────────────────────────────────────────────────
export const staffLogin = (email, password) =>
  http.post("/staff/login", { email, password });

export const verifyStaffRegister = (email, otp) =>
  http.put("/staff/verify", { email, otp });

export const sendStaffOtp = (email) =>
  http.post("/user/sendStaffOtp", { email });

export const verifyStaffOtp = (email, otp) =>
  http.post("/user/verifyStaffOtp", { email, otp });

// ── Branch Login ───────────────────────────────────────────────────────────
export const branchLogin = (email, password) =>
  http.post("/branch/login", { email, password });
