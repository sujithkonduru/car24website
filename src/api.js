const raw = import.meta.env.VITE_API_URL || "";

export const API_BASE = raw ? raw.replace(/\/$/, "") : "";

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
    authorization: `Bearer ${t}`,
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
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(cleanPath.startsWith("http") ? cleanPath : cleanPath, window.location.origin);
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
    console.error(`GET ${cleanPath} failed [${res.status} ${res.statusText}]:`, { 
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
  const res = await fetch(path, {
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
  const res = await fetch(path, {
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
  const res = await fetch(path, {
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
  return apiPut("/user/verifyuserRegister", { email, otp });
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
  return apiPost("/user/forgotPassOTP", { email });
}

export async function forgotPassOtpVerify(email, otp) {
  return apiPost("/user/forgotPassOTPVerify", { email, otp });
}

export async function changePassword(changeToken, pass) {
  return apiPut("/roleauth/changePass", { pass }, { headers: { Authorization: `Bearer ${changeToken}` } });
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
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }
    
    const decoded = decodeToken(token);
    const ownerId = decoded?.id || decoded?.userId;
    
    if (!ownerId) {
      throw new Error("Invalid token - missing owner ID");
    }
    
    console.log("Fetching cars for owner ID:", ownerId);
    
    const response = await apiGet("/cars/owner_cars", { 
      withAuth: true, 
      query: { ownerId: ownerId }
    });
    
    console.log("Owner cars response:", response);
    
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("Failed to fetch owner cars:", error);
    throw error;
  }
}

export async function getCarDetails(carId) {
  return apiGet(`/cars/get_car/${carId}`, { withAuth: true });
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
  return apiPost(`/cars/addCar/${branchId}`, formData, { 
    withAuth: true,
    headers: formData instanceof FormData ? {} : {}
  });
}

export async function updateCar(carId, formData) {
  return apiPut(`/roleauth/updateCar/${carId}`, formData, { 
    withAuth: true,
    headers: formData instanceof FormData ? {} : {}
  });
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
  const response = await apiGet("/cars/get_pending_cars", { withAuth: true });
  return response?.data || [];
}

export const approveCar = async (carId, pricing) => {
  try {
    const response = await apiPut("/cars/approve_pending_cars/" + carId, {
      status: 'approved',
      six_hr_price: pricing.six,
      twelve_hr_price: pricing.twelve,
      twentyfour_hr_price: pricing.twentyFour,
      percentage: pricing.percentage || 70
    }, { withAuth: true });
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to approve car");
  }
};

export const rejectCar = async (carId, reason) => {
  try {
    const response = await apiPut("/cars/approve_pending_cars/" + carId, {
      status: 'rejected'
    }, { withAuth: true });
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to reject car");
  }
};

export async function updateCarPricing(carId, pricingData) {
  return apiPut("/cars/approve_pending_cars/" + carId, { 
    status: 'approved', 
    ...pricingData 
  }, { withAuth: true });
}

export const updateCarStatus = async (carId, status) => {
  try {
    const response = await apiPut(`/cars/update_car_status/${carId}`, { status }, { withAuth: true });
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to update car status");
  }
};

export const deleteCar = async (carId) => {
  try {
    const response = await apiDelete(`/cars/delete_car/${carId}`, { withAuth: true });
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to delete car");
  }
};

// ── Admin Management Routes ─────────────────────────────────
export async function getUsers(id = null, role = null, number = 10, offset = 0) {
  try {
    const idParam = id !== null && id !== undefined && id !== "" ? id : "null";
    const roleParam = role !== null && role !== undefined && role !== "" ? role : "null";
    const limitParam = Number(number) || 10;
    const offsetParam = Number(offset) || 0;

    // Using roleauth getData route
    const url = `/roleauth/getData/${idParam}/${roleParam}/${limitParam}/${offsetParam}`;

    const response = await apiGet(url, { withAuth: true });

    return {
      success: true,
      data: response?.data || [],
      raw: response,
    };
  } catch (error) {
    console.error("getUsers API Error:", error);
    return {
      success: false,
      data: [],
      message: error?.message || "Failed to fetch users",
    };
  }
}

export async function getManagementUsers(id, branch, role, number = 10, offset = 0) {
  const idParam = id !== undefined && id !== null && id !== "" ? id : "null";
  const branchParam = branch !== undefined && branch !== null && branch !== "" ? branch : "null";
  const roleParam = role !== undefined && role !== null && role !== "" ? role : "null";
  
  const url = `/roleauth/getManagementData/${idParam}/${branchParam}/${roleParam}/${number}/${offset}`;
  try {
    const response = await apiGet(url, { withAuth: true });
    return response;
  } catch (error) {
    console.error("getManagementUsers error:", error);
    return { count: 0, data: [] };
  }
}

export async function getAdminCars(includeAll = true) {
  try {
    const response = await apiGet("/roleauth/getAllData", { withAuth: true });
    return response;
  } catch (error) {
    console.error("Failed to fetch cars:", error);
    return { totalCars: 0, pendingCars: 0, totalBranches: 0, carsUsedToday: 0, verifiedUsers: 0, totalOwners: 0 };
  }
}

export async function getAdminBookings(page = 0, limit = 100, search = "") {
  return apiGet("/roleauth/adminBookings", { withAuth: true, query: { page, limit, search } });
}

export async function getAdminOwners() {
  const response = await getUsers(null, "owner", 1000, 0);
  return response?.data || [];
}

export async function getAdminStaff() {
  const response = await getManagementUsers("null", "null", "staff", 1000, 0);
  return response?.data || [];
}

export async function getAdminPayments() {
  const response = await getUsers(null, "owner", 1000, 0);
  return response?.data || [];
}

export async function updateUserStatus(userId, status) {
  return apiPut(`/admin/users/${userId}/status`, { status }, { withAuth: true });
}

export async function updateBookingStatus(bookingId, status) {
  return apiPut(`/admin/bookings/${bookingId}/status`, { status }, { withAuth: true });
}

export async function deleteUser(userId) {
  return apiDelete(`/admin/users/${userId}`, { withAuth: true });
}

export async function createStaff(data) {
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
    const response = await apiGet("/roleauth/getAllData", { withAuth: true });
    return response;
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
      ? branches.reduce((sum, b) => sum + (Number(b.total_volume) || 0), 0)
      : 0;
    
    return {
      totalRevenue,
      branches: branches || [],
      period
    };
  } catch (error) {
    return { totalRevenue: 0, branches: [], period };
  }
}

export async function getAdminCarAnalytics() {
  try {
    const stats = await getAdminDashboardStats();
    return {
      total: stats.totalCars || 0,
      pending: stats.pendingCars || 0
    };
  } catch (error) {
    console.error("Failed to get car analytics:", error);
    return { total: 0, pending: 0 };
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
export async function getBranchDashboardStats(branchId = null) {
  if (!branchId) {
    const token = getToken();
    const decoded = decodeToken(token);
    branchId = decoded?.branch_id || decoded?.branchId || decoded?.branch;
  }

  if (!branchId) throw new Error("Branch ID missing");

  return apiGet(`/roleauth/branch_dashboard/${branchId}`, {
    withAuth: true,
  });
}

export async function getBranchHeadProfile() {
  return apiGet("/roleauth/getManagementProfile", { withAuth: true });
}

export async function getBranchCars(branchId = null, filters = {}) {
  if (!branchId) {
    const token = getToken();
    const decoded = decodeToken(token);
    branchId = decoded?.branch_id || decoded?.branchId || decoded?.branch;
  }

  if (!branchId) throw new Error("Branch ID missing");

  return apiGet(`/roleauth/branch_cars/${branchId}`, {
    withAuth: true,
    query: filters,
  });
}

export async function getBranchBookings(statusFilter = "all") {
  return apiGet("/branch/bookings", { withAuth: true, query: { status: statusFilter } });
}

export async function getBranchStaff() {
  const token = getToken();
  const decoded = decodeToken(token);
  const branchId = decoded?.branch_id || decoded?.branchId || decoded?.branch;

  return getManagementUsers("null", branchId, "staff", 1000, 0);
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

// ── Financial ──────────────────────────────────────────────
export async function getFinancialData(filters = {}) {
  return apiGet("/roleauth/getFinancial", { withAuth: true, query: filters });
}

export async function getSuperAdminFinances() {
  return apiGet("/roleauth/getSuperAdminFinances", { withAuth: true });
}

export async function getPaymentHistory(branchId, date) {
  return apiGet("/roleauth/getPaymentHistory", { withAuth: true, query: { branchid: branchId, date } });
}

export async function getOwnerPaidBreakdown(ownerId, paidAt) {
  return apiPost("/roleauth/getOwnerPaidBreakdown", { ownerId, paidAt }, { withAuth: true });
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

// ── Reviews ────────────────────────────────────────────────
export async function addReview(reviewData) {
  return apiPost("/reviews/add_review", reviewData, { withAuth: true });
}

export async function getCarReviews(carId) {
  return apiGet(`/reviews/car_reviews/${carId}`);
}

// ── Update Car Images ──────────────────────────────────────
export async function updateCarImages(carId, formData) {
  return apiPut(`/roleauth/updateCarImages/${carId}`, formData, { 
    withAuth: true,
    headers: formData instanceof FormData ? {} : {}
  });
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

  const platformFee = Math.ceil(totalPrice * 0.0236);
  return totalPrice + platformFee;
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
  updateCarStatus,
  updateCarImages,
  
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
  updateBookingStatus,
  deleteUser,
  createStaff,
  deleteStaff,
  verifyStaffRegister,
  getSettings,
  updateSettings,
  adminChangePassword,
  
  // Financial
  getFinancialData,
  getSuperAdminFinances,
  getPaymentHistory,
  getOwnerPaidBreakdown,
  getOwnerPendingBreakdown,
  markOwnerPaid,
  updateBranch,
  
  // Bookings
  getMyBookings,
  getMyCredits,
  bookCar,
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

// Fix for AdminDashboard import
export { getAdminDashboardStats as getAllData };

