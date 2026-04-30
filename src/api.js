const raw = import.meta.env.VITE_API_URL || "http://192.168.29.152:3000";

export const API_BASE = raw.replace(/\/$/, "");

export function decodeToken(token) {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(base64));
    console.log("Decoded token:", decoded);
    return decoded;
  } catch (error) {
    console.error("Token decode error:", error);
    return null;
  }
}

export function authHeaders() {
  const t = localStorage.getItem("car24_token");
  if (!t) return {};
  const decoded = decodeToken(t);
  const headers = {
    Authorization: `Bearer ${t}`,
  };
  
  if (decoded?.branch_id) {
    headers["X-Branch-Id"] = decoded.branch_id.toString();
  }
  if (decoded?.branchHeadId) {
    headers["X-Branch-Head-Id"] = decoded.branchHeadId.toString();
  }
  
  return headers;
}

function parseResponse(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

class ApiError extends Error {
  constructor(message, status, statusCode, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusCode = statusCode;
    this.data = data;
  }
}

export async function apiGet(path, { query, withAuth, headers } = {}) {
  const base = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const url = new URL(base);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      ...(withAuth ? authHeaders() : {}),
      ...(headers || {}),
    },
  });
  const text = await res.text();
  const data = parseResponse(text);
  if (!res.ok) {
    const message = data?.message || res.statusText || "Request failed";
    console.error(`GET ${path} failed [${res.status} ${res.statusText}]:`, { 
      message, 
      data,
      url: url.toString() 
    });
    throw new ApiError(message, res.status, res.status, data);
  }
  return data;
}

export async function apiPost(path, body, { withAuth, headers } = {}) {
  const isFormData = body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(withAuth ? authHeaders() : {}),
      ...(headers || {}),
    },
    body: isFormData ? body : JSON.stringify(body ?? {}),
  });
  const text = await res.text();
  const data = parseResponse(text);
  if (!res.ok) {
    const message = data?.message || res.statusText || "Request failed";
    console.error(`POST ${path} failed [${res.status} ${res.statusText}]:`, { 
      message, 
      data,
      body: isFormData ? '[FormData]' : body 
    });
    throw new ApiError(message, res.status, res.status, data);
  }
  return data;
}

export async function apiPut(path, body, { withAuth, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(withAuth ? authHeaders() : {}),
      ...(headers || {}),
    },
    body: JSON.stringify(body ?? {}),
  });
  const text = await res.text();
  const data = parseResponse(text);
  if (!res.ok) {
    const message = data?.message || res.statusText || "Request failed";
    console.error(`PUT ${path} failed [${res.status} ${res.statusText}]:`, { 
      message, 
      data 
    });
    throw new ApiError(message, res.status, res.status, data);
  }
  return data;
}

export async function apiDelete(path, { withAuth, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(withAuth ? authHeaders() : {}),
      ...(headers || {}),
    },
  });
  const text = await res.text();
  const data = parseResponse(text);
  if (!res.ok) {
    const message = data?.message || res.statusText || "Request failed";
    console.error(`DELETE ${path} failed [${res.status} ${res.statusText}]:`, { 
      message, 
      data 
    });
    throw new ApiError(message, res.status, res.status, data);
  }
  return data;
}

export function setToken(token) {
  if (token) localStorage.setItem("car24_token", token);
  else localStorage.removeItem("car24_token");
}

export function getToken() {
  return localStorage.getItem("car24_token");
}

// ── User Auth ──────────────────────────────────────────────
export async function userLogin(email, password) {
  return apiPost("/user/userLogin", { email, password });
}

export async function userRegister(data) {
  return apiPost("/user/createUser", data);
}

export async function verifyUserOtp(email, otp) {
  return apiPut("/verifyuserRegister", { email, otp });
}

export async function resendUserOtp(email) {
  return apiPost("/resendOTP", { email });
}

export async function getUserData() {
  return apiGet("/getData", { withAuth: true });
}

export async function updateProfile(id, data) {
  return apiPut(`/UpdateProfile/${id}`, data, { withAuth: true });
}

export async function forgotPassOtp(email) {
  return apiPost("/forgotPassOTP", { email });
}

export async function forgotPassOtpVerify(email, otp) {
  return apiPost("/forgotPassOTPVerify", { email, otp });
}

export async function changePassword(changeToken, pass) {
  return apiPut("/changePass", { pass }, { headers: { Authorization: `Bearer ${changeToken}` } });
}

export async function getDocuments() {
  return apiGet("/getDocuments", { withAuth: true });
}

// ── Owner Auth ─────────────────────────────────────────────
export async function ownerRegister(data) {
  return apiPost("/owners/CreateOwnerAccount", data);
}

export async function ownerLogin(email, password) {
  return apiPost("/user/userLogin", { email, password });
}

export async function verifyOwnerOtp(email, otp) {
  return apiPut("/user/verifyuserRegister", { email, otp });
}

export async function resendOwnerOtp(email) {
  return apiPost("/owners/resendOwnerOTP", { email });
}

export async function getOwnerData() {
  return apiGet("/owners/getOwnerData", { withAuth: true });
}

export async function getOwnerDashboardData() {
  return apiGet("/owners/getOwnerData", { withAuth: true });
}

export async function getCarStats(carId) {
  return apiGet(`/owners/getCarStats/${carId}`, { withAuth: true });
}

export async function getOwnerCars() {
  const token = getToken();
  const decoded = decodeToken(token);
  const ownerId = decoded?.id;
  if (!ownerId) return [];
  return apiGet("/cars/owner_cars", { withAuth: true, query: { ownerId } });
}

export async function getCarDetails(carId) {
  return apiGet(`/owners/get_car_details/${carId}`, { withAuth: true });
}

export async function getEarningsBreakdown(period = "all") {
  return apiGet("/owners/get_earnings_breakdown", { withAuth: true, query: { period } });
}

export async function getOwnerBookings(filters = {}) {
  return apiGet("/bookingApi/ownerBookings", { withAuth: true, query: filters });
}

export async function getOwnerProfile() {
  return apiGet("/owners/owner_profile", { withAuth: true });
}

export async function updateOwnerProfile(profileData) {
  return apiPut("/owners/update_owner_profile", profileData, { withAuth: true });
}

export async function addCar(branchId, formData) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/cars/addCar/${branchId}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const text = await res.text();
  const parsed = parseResponse(text);
  if (!res.ok) {
    const err = new Error(parsed?.message || res.statusText || "Request failed");
    err.status = res.status;
    throw err;
  }
  return parsed;
}

export async function updateCar(carId, formData) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/roleauth/updateCar/${carId}`, {
    method: "PUT",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const text = await res.text();
  const parsed = parseResponse(text);
  if (!res.ok) {
    const err = new Error(parsed?.message || res.statusText || "Request failed");
    err.status = res.status;
    throw err;
  }
  return parsed;
}

// ── Owner Approvals ────────────────────────────────────────
export async function getPendingOwners() {
  return apiGet("/owners/get_pending_owners", { withAuth: true });
}

export async function approveOwner(ownerId) {
  return apiPut(`/owners/approve_owner/${ownerId}`, {}, { withAuth: true });
}

// ── Cars ───────────────────────────────────────────────────
export async function getCars(query = {}) {
  return apiGet("/cars/get_cars", { query });
}

export async function getCar(id) {
  return apiGet(`/cars/get_car/${id}`);
}

export async function getBranches() {
  return apiGet("/cars/get_branches");
}

export async function getPendingCars() {
  return apiGet("/cars/get_pending_cars", { withAuth: true });
}

export async function approveCar(carId, data) {
  return apiPut(`/cars/approve_pending_cars/${carId}`, data, { withAuth: true });
}

export async function rejectCar(carId) {
  return apiPut(`/cars/approve_pending_cars/${carId}`, { status: 'rejected' }, { withAuth: true });
}

export async function updateCarPricing(carId, pricingData) {
  return apiPut(`/cars/approve_pending_cars/${carId}`, { 
    status: 'approved', 
    ...pricingData 
  }, { withAuth: true });
}

// ── Admin Management Routes ─────────────────────────────────
export async function getUsers(id = null, role = "user", number = 10, offset = 0) {
  const idParam = id && id !== "null" && id !== "" ? id : "null";
  // Fix: Backend getUsersData expects id/role/number/offset (4 params)
  // When role=null, default to "user" and skip extra null param
  const roleParam = role && role !== "null" && role !== "" ? role : "user";
  const url = `/roleauth/getUsersData/${idParam}/${roleParam}/${number}/${offset}`;
  return apiGet(url, { withAuth: true });
}

export async function getManagementUsers(id = "null", branch = "null", role = "null", number = "10", offset = "0") {
  const url = `/roleauth/getManagementData/${id}/${branch}/${role}/${number}/${offset}`;
  try {
    const response = await apiGet(url, { withAuth: true });
    return response;
  } catch (error) {
    console.error("getManagementUsers error:", error);
    return { count: 0, data: [] };
  }
}

// Add these missing functions to your api.js file

// Get branch bookings by date (for branch head dashboard)
export async function getBranchBookingsByDate(branchId, date) {
  try {
    const response = await apiGet("/bookingApi/getBranchBookingsByDate", {
      withAuth: true,
      query: { branchId, date }
    });
    return response;
  } catch (error) {
    console.error("Failed to get branch bookings:", error);
    return { data: [] };
  }
}

// Get all bookings by date (for super admin)
export async function getAllBookingsByDate(date) {
  try {
    const response = await apiGet("/bookingApi/getAllBookingsByDate", {
      withAuth: true,
      query: { date }
    });
    return response;
  } catch (error) {
    console.error("Failed to get all bookings:", error);
    return { data: [] };
  }
}

// Get branch dashboard stats with date
export async function getBranchDashboardStatsWithDate(branchId, month) {
  try {
    const response = await apiGet(`/roleauth/branch_dashboard/${branchId}`, {
      withAuth: true,
      query: { month }
    });
    return response;
  } catch (error) {
    console.error("Failed to get branch dashboard stats:", error);
    return {
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      onRoadToday: 0,
      totalCars: 0,
      idleCars: 0
    };
  }
}

// Get branch staff
// export async function getBranchStaff(branchId) {
//   try {
//     const response = await getManagementUsers("null", branchId, "staff", 1000, 0);
//     return response?.data || [];
//   } catch (error) {
//     console.error("Failed to get branch staff:", error);
//     return [];
//   }
// }
export async function getAdminCars(branchId = null, isAvailable = null, approvalstatus = null) {
  if (branchId && branchId !== "null") {
    const query = {};
    if (isAvailable !== null) query.isavailable = isAvailable;
    if (approvalstatus !== null) query.approvalstatus = approvalstatus;
    return apiGet(`/roleauth/branch_cars/${branchId}`, { withAuth: true, query });
  }
  return apiGet("/cars/get_cars", { withAuth: true, query: { limit: 1000 } });
}

export async function getAdminBookings(page = 0, limit = 100, search = "") {
  return apiGet("/bookingApi/myBookings", { withAuth: true, query: { page, limit, search } });
}

export async function getAdminOwners() {
  // Fix: Use correct params for owner filtering
  const response = await getUsers(null, "owner", 1000, 0);
  return response?.data || [];
}

export async function getAdminStaff() {
  const response = await getManagementUsers(null, null, "staff", 1000, 0);
  return response?.data || [];
}

export async function getAdminPayments() {
  const response = await getUsers(null, "owner", 1000, 0);
  return response?.data || [];
}

export async function updateUserStatus(userId, status) {
  return apiPut(`/admin/users/${userId}/status`, { status }, { withAuth: true });
}

export async function updateCarStatus(carId, status) {
  return apiPut(`/roleauth/updateCar/${carId}`, { status }, { withAuth: true });
}

export async function updateBookingStatus(bookingId, status) {
  return apiPut(`/admin/bookings/${bookingId}/status`, { status }, { withAuth: true });
}

export async function deleteCar(carId) {
  return apiDelete(`/cars/delete_car/${carId}`, { withAuth: true });
}

export async function deleteUser(userId) {
  return apiDelete(`/admin/users/${userId}`, { withAuth: true });
}

export async function createStaff(data) {
  // Transform data to match backend expectations
  const staffData = {
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role,
    mobile_no: data.mobile_no || data.phone || "",
    address: data.address || "",
    branch: data.branchId || data.branch || null,
    dob: data.dob || null,
    marrieddate: data.marrieddate || null,
    permissions: data.permissions || []
  };
  return apiPost("/roleauth/createMangement", staffData, { withAuth: true });
}

export async function deleteStaff(staffId) {
  return apiDelete(`/admin/staff/${staffId}`, { withAuth: true });
}

export async function verifyStaffRegister(email, otp) {
  return apiPut("/roleauth/verifyManagementRegister", { email, otp }, { withAuth: true });
}

export async function getSettings() {
  const savedSettings = localStorage.getItem("app_settings");
  if (savedSettings) {
    return JSON.parse(savedSettings);
  }
  return {
    siteName: "Car24",
    contactEmail: "support@car24.com",
    platformFee: 2.36,
    bookingPrefix: "CAR24"
  };
}

export async function updateSettings(settings) {
  localStorage.setItem("app_settings", JSON.stringify(settings));
  return settings;
}

// ── Admin Analytics ────────────────────────────────────────
export async function getAdminDashboardStats() {
  try {
    return await apiGet("/roleauth/getAllData", { withAuth: true });
  } catch (error) {
    console.error("Failed to get dashboard stats:", error);
    return {
      totalCars: 0,
      pendingCars: 0,
      totalBranches: 0,
      carsUsedToday: 0,
      verifiedUsers: 0,
      totalOwners: 0
    };
  }
}

export async function getAdminEarningsReport(period = "month") {
  try {
    const branches = await getBranchRevenue();
    const totalRevenue = Array.isArray(branches) 
      ? branches.reduce((sum, b) => sum + (Number(b.revenue) || 0), 0)
      : 0;
    
    return {
      totalRevenue,
      branches: branches || [],
      period
    };
  } catch (error) {
    // Gracefully handle branch revenue failure
    return { totalRevenue: 0, branches: [], period };
  }
}

export async function getAdminCarAnalytics() {
  try {
    const cars = await getAdminCars();
    const carList = cars?.data || cars || [];
    const byCategory = {};
    const byFuelType = {};
    const byTransmission = {};
    
    carList.forEach(car => {
      if (car.category) byCategory[car.category] = (byCategory[car.category] || 0) + 1;
      if (car.fuelType) byFuelType[car.fuelType] = (byFuelType[car.fuelType] || 0) + 1;
      if (car.transmission) byTransmission[car.transmission] = (byTransmission[car.transmission] || 0) + 1;
    });
    
    return { byCategory, byFuelType, byTransmission, total: carList.length };
  } catch (error) {
    console.error("Failed to get car analytics:", error);
    return { byCategory: {}, byFuelType: {}, byTransmission: {}, total: 0 };
  }
}

export async function getAdminOwnerAnalytics() {
  try {
    const owners = await getAdminOwners();
    const ownerList = Array.isArray(owners) ? owners : [];
    const verified = ownerList.filter(o => o.is_verified).length;
    
    return {
      total: ownerList.length,
      verified,
      pending: ownerList.length - verified
    };
  } catch (error) {
    console.error("Failed to get owner analytics:", error);
    return { total: 0, verified: 0, pending: 0 };
  }
}

export async function getAdminBranchPerformance() {
  try {
    return await getBranchRevenue();
  } catch {
    return [];
  }
}

export async function getBranchRevenue() {
  try {
    const response = await apiGet("/roleauth/get_branches_revenue", { withAuth: true });
    return response || [];
  } catch (error) {
    // Silently return empty array - backend issue, don't spam console
    return [];
  }
}

export async function getBranchIncome(branchId) {
  try {
    const response = await apiGet(`/roleauth/get_income/${branchId}`, { withAuth: true });
    return response?.data || [];
  } catch (error) {
    console.error("Failed to get branch income:", error);
    return [];
  }
}

export async function adminChangePassword(email, newPassword) {
  return apiPut(`/roleauth/superAdmin/changePass/${email}`, { pass: newPassword }, { withAuth: true });
}

// ── Bookings ───────────────────────────────────────────────
export async function getMyBookings() {
  return apiGet("/bookingApi/myBookings", { withAuth: true });
}

export async function getMyCredits() {
  return apiGet("/bookingApi/myCredits", { withAuth: true });
}

export async function bookCar(data) {
  return apiPost("/bookingApi/bookCar", data, { withAuth: true });
}

export async function offlineBookCar(data) {
  // Staff books on behalf of a user: POST /bookingApi/offlineBooking
  // Body: { carId, userId, pickupDate, dropoffDate, totalPrice, advanceAmount, paymentMode }
  return apiPost("/bookingApi/offlineBooking", data, { withAuth: true });
}

export async function verifyPayment(data) {
  return apiPost("/bookingApi/verify-payment", data);
}

export async function cancelBooking(id) {
  return apiPost(`/bookingApi/cancelBooking/${id}`, {}, { withAuth: true });
}

export async function checkAvailability(carId, pickupDate, dropoffDate) {
  return apiGet("/bookingApi/checkAvailability", { query: { carId, pickupDate, dropoffDate } });
}

export async function getBookingDetails(bookingId) {
  return apiGet(`/bookingApi/getBooking/${bookingId}`, { withAuth: true });
}

// ── Staff / Management ─────────────────────────────────────
export async function getStaffTasks() {
  return apiGet("/bookingApi/getStaffTasks", { withAuth: true });
}

export async function verifyCarKey(bookingId, key, id) {
  return apiGet("/bookingApi/carKeyVerify", { withAuth: true, query: { bookingId, key, id } });
}

export async function startRide(data) {
  return apiPut("/bookingApi/startRide", data, { withAuth: true });
}

export async function endRide(bookingId, data) {
  return apiPut(`/bookingApi/endRide/${bookingId}`, data, { withAuth: true });
}

export async function uploadOwnerDocument(formData) {
  return apiPost("/photoUpload/DocumentUpload", formData, { withAuth: true });
}

export async function createManagement(data) {
  return createStaff(data);
}

// ── Staff OTP Verification ─────────────────────────────────
export async function sendStaffOtp(email) {
  return apiPost("/user/sendStaffOtp", { email });
}

export async function verifyStaffOtp(email, otp) {
  return apiPost("/user/verifyStaffOtp", { email, otp });
}

export async function staffLogin(email, password) {
  return apiPost("/staff/login", { email, password });
}

export async function getStaffDashboard() {
  return apiGet("/staff/dashboard", { withAuth: true });
}

export async function verifyBooking(bookingId, action) {
  return apiPut(`/staff/verify_booking/${bookingId}`, { action }, { withAuth: true });
}

export async function collectRemainingPayment(data) {
  return apiPost("/payment/collect-remaining", data, { withAuth: true });
}

// ── Branch Head Dashboard ──────────────────────────────────
export async function getBranchDashboardStats(branchId) {
  if (!branchId) return {};
  return apiGet(`/roleauth/branch_dashboard/${branchId}`, { withAuth: true });
}

export async function getBranchHeadProfile() {
  return apiGet("/roleauth/getManagementProfile", { withAuth: true });
}

export async function getBranchCars(branchId, query = {}) {
  if (!branchId) return [];
  return apiGet(`/roleauth/branch_cars/${branchId}`, { withAuth: true, query });
}

export async function getBranchBookings(statusFilter = "all") {
  const query = statusFilter && statusFilter !== "all" ? { status: statusFilter } : {};
  return apiGet("/branch/bookings", { withAuth: true, query });
}

export async function getBranchStaff(branchId) {
  const id = branchId || "null";
  const response = await getManagementUsers("null", id, "staff", "1000", "0");
  return response?.data || [];
}

export async function getBranchActivities() {
  return apiGet("/branch/activities", { withAuth: true });
}

export async function verifyBookingStart(bookingId, otp) {
  return apiPost(`/branch/verify-start/${bookingId}`, { otp }, { withAuth: true });
}

export async function verifyBookingEnd(bookingId, otp) {
  return apiPost(`/branch/verify-end/${bookingId}`, { otp }, { withAuth: true });
}

export async function updateBranchBookingStatus(bookingId, status) {
  return apiPut(`/branch/booking/${bookingId}/status`, { status }, { withAuth: true });
}

// ── Super Admin APIs ──────────────────────────────────────
export async function getSuperAdminFinances() {
  return apiGet("/roleauth/getSuperAdminFinances", { withAuth: true });
}

export async function getFinancialData(filters = {}) {
  return apiGet("/roleauth/getFinancial", { withAuth: true, query: filters });
}

export async function getPaymentHistory(filters = {}) {
  return apiGet("/roleauth/getPaymentHistory", { withAuth: true, query: filters });
}

export async function getOwnerPendingBreakdown(ownerId, branchId) {
  return apiGet(`/roleauth/getOwnerPendingBreakdown/${ownerId}`, { withAuth: true, query: { branchId } });
}

export async function markOwnerPaid(ownerId, branchId) {
  return apiPut(`/roleauth/mark-owner-paid/${ownerId}`, { branchId }, { withAuth: true });
}

export async function updateBranch(branchId, data) {
  return apiPut(`/roleauth/update-branch/${branchId}`, data, { withAuth: true });
}

export async function getAllData() {
  return apiGet("/roleauth/getAllData", { withAuth: true });
}

// ── Reviews ────────────────────────────────────────────────
export async function addReview(reviewData) {
  return apiPost("/reviews/add_review", reviewData, { withAuth: true });
}

export async function getCarReviews(carId) {
  return apiGet(`/reviews/car_reviews/${carId}`);
}

// ── Utilities ──────────────────────────────────────────────
export function calculatePrice(hours, pricing) {
  if (!pricing || !pricing.six_hr_price || !pricing.twelve_hr_price || !pricing.twentyfour_hr_price) {
    return 0;
  }

  let remaining = hours;
  let totalPrice = 0;

  const days = Math.floor(remaining / 24);
  totalPrice += days * pricing.twentyfour_hr_price;
  remaining -= days * 24;

  const halfDays = Math.floor(remaining / 12);
  totalPrice += halfDays * pricing.twelve_hr_price;
  remaining -= halfDays * 12;

  const sixHrs = Math.floor(remaining / 6);
  totalPrice += sixHrs * pricing.six_hr_price;

  return totalPrice; // NO PLATFORM FEE
}

export function calculateAdvanceAmount(totalHours) {
  let remaining = totalHours;
  let advance = 0;

  const days = Math.floor(remaining / 24);
  advance += days * 500;
  remaining -= days * 24;

  const halfDays = Math.floor(remaining / 12);
  advance += halfDays * 500;
  remaining -= halfDays * 12;

  const sixHrs = Math.floor(remaining / 6);
  advance += sixHrs * 400;

  return advance;
}

export function formatINR(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

export function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status) {
  const colors = {
    pending: "#f59e0b",
    confirmed: "#10b981",
    ongoing: "#3b82f6",
    completed: "#6b7280",
    cancelled: "#ef4444",
    approved: "#10b981",
    rejected: "#ef4444",
  };
  return colors[status] || "#6b7280";
}

export function getStatusText(status) {
  const texts = {
    pending: "Pending",
    confirmed: "Confirmed",
    ongoing: "Ongoing",
    completed: "Completed",
    cancelled: "Cancelled",
    approved: "Approved",
    rejected: "Rejected",
  };
  return texts[status] || status;
}

// Aliases for AdminDashboard compatibility
// export const getOwners = getAdminOwners;
// export const getBookings = getAdminBookings;
// export const getPayments = getAdminPayments;
// export const getBranchStaff = getBranchStaff;

const api = {
  // User Auth
  userLogin,
  userRegister,
  verifyUserOtp,
  resendUserOtp,
  getUserData,
  updateProfile,
  forgotPassOtp,
  forgotPassOtpVerify,
  changePassword,
  getDocuments,
  
  // Owner Auth
  ownerRegister,
  ownerLogin,
  resendOwnerOtp,
  getOwnerData,
  getOwnerDashboardData,
  getCarStats,
  getOwnerCars,
  getCarDetails,
  getEarningsBreakdown,
  getOwnerBookings,
  getOwnerProfile,
  updateOwnerProfile,
  addCar,
  updateCar,
  
  // Owner Approvals
  getPendingOwners,
  approveOwner,
  
  // Cars
  getCars,
  getCar,
  getBranches,
  getPendingCars,
  approveCar,
  rejectCar,
  updateCarPricing,
  deleteCar,
  
  // Admin Analytics
  getAdminDashboardStats,
  getAdminEarningsReport,
  getAdminCarAnalytics,
  getAdminOwnerAnalytics,
  getAdminBranchPerformance,
  getBranchRevenue,
  getBranchIncome,
  
  // Admin Management
  getUsers,
  getManagementUsers,
  getAdminCars,
  getAdminBookings,
  getAdminOwners,
  getAdminStaff,
  getAdminPayments,
  updateUserStatus,
  updateCarStatus,
  updateBookingStatus,
  deleteUser,
  createStaff,
  deleteStaff,
  verifyStaffRegister,
  getSettings,
  updateSettings,
  adminChangePassword,
  
  // Bookings
  getMyBookings,
  getMyCredits,
  bookCar,
  offlineBookCar,
  verifyPayment,
  cancelBooking,
  checkAvailability,
  getBookingDetails,
  
  // Staff
  getStaffTasks,
  verifyCarKey,
  startRide,
  endRide,
  uploadOwnerDocument,
  createManagement,
  sendStaffOtp,
  verifyStaffOtp,
  staffLogin,
  getStaffDashboard,
  verifyBooking,
  collectRemainingPayment,

  // Branch Head
  getBranchDashboardStats,
  getBranchCars,
  getBranchBookings,
  getBranchStaff,
  getBranchActivities,
  verifyBookingStart,
  verifyBookingEnd,
  updateBranchBookingStatus,
  getBranchHeadProfile,
  
  // Super Admin
  getSuperAdminFinances,
  getFinancialData,
  getPaymentHistory,
  getOwnerPendingBreakdown,
  markOwnerPaid,
  updateBranch,
  getAllData,

  // Reviews
  addReview,
  getCarReviews,
  
  // Utilities
  calculatePrice,
  calculateAdvanceAmount,
  formatINR,
  formatDate,
  formatDateTime,
  getStatusColor,
  getStatusText,
  
  // Core API methods
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  setToken,
  getToken,
  authHeaders,
  decodeToken,
};

export default api;