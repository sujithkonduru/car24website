// src/utils/formatters.js

/**
 * Format number as Indian Rupees
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount (e.g., ₹1,23,456)
 */
export function formatINR(amount) {
  if (amount === null || amount === undefined) return "₹0";
  
  const num = Number(amount);
  if (isNaN(num)) return "₹0";
  
  // Convert to number with 2 decimal places for currency
  const formatted = num.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  
  return `₹${formatted}`;
}

/**
 * Format date string to readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (e.g., "Jan 15, 2024")
 */
export function formatDate(dateString) {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "N/A";
  }
}

/**
 * Format date and time string to readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date and time (e.g., "Jan 15, 2024, 3:30 PM")
 */
export function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "N/A";
  }
}

/**
 * Format time string (HH:MM) to readable format
 * @param {string} timeString - Time string (e.g., "14:30:00")
 * @returns {string} Formatted time (e.g., "2:30 PM")
 */
export function formatTime(timeString) {
  if (!timeString) return "N/A";
  
  try {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    return timeString;
  }
}

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number (e.g., "1,23,456")
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return "0";
  
  const number = Number(num);
  if (isNaN(number)) return "0";
  
  return number.toLocaleString("en-IN");
}

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage (e.g., "75.5%")
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined) return "0%";
  
  const num = Number(value);
  if (isNaN(num)) return "0%";
  
  return `${num.toFixed(decimals)}%`;
}

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number (e.g., "+91 98765 43210")
 */
export function formatPhoneNumber(phone) {
  if (!phone) return "N/A";
  
  const cleaned = phone.toString().replace(/\D/g, "");
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.length === 13 && cleaned.startsWith("91")) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
}

/**
 * Truncate text to a specific length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, length = 50) {
  if (!text) return "";
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
}

/**
 * Format duration in hours to readable format
 * @param {number} hours - Duration in hours
 * @returns {string} Formatted duration (e.g., "2h 30m" or "3 days")
 */
export function formatDuration(hours) {
  if (!hours || hours === 0) return "0h";
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (days > 0) {
    if (remainingHours > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${days} day${days > 1 ? "s" : ""}`;
  }
  
  if (remainingHours < 1) {
    const minutes = Math.round(remainingHours * 60);
    return `${minutes}m`;
  }
  
  return `${remainingHours}h`;
}

/**
 * Format vehicle number plate
 * @param {string} plate - License plate number
 * @returns {string} Formatted plate
 */
export function formatLicensePlate(plate) {
  if (!plate) return "N/A";
  return plate.toUpperCase();
}

/**
 * Get status color for UI
 * @param {string} status - Status string
 * @returns {string} Color code
 */
export function getStatusColor(status) {
  const colors = {
    pending: "#f59e0b",
    confirmed: "#10b981",
    ongoing: "#3b82f6",
    completed: "#6b7280",
    cancelled: "#ef4444",
    approved: "#10b981",
    rejected: "#ef4444",
    active: "#10b981",
    inactive: "#ef4444",
    available: "#10b981",
    unavailable: "#ef4444",
  };
  return colors[status?.toLowerCase()] || "#6b7280";
}

/**
 * Get status text for display
 * @param {string} status - Status string
 * @returns {string} Display text
 */
export function getStatusText(status) {
  const texts = {
    pending: "Pending",
    confirmed: "Confirmed",
    ongoing: "Ongoing",
    completed: "Completed",
    cancelled: "Cancelled",
    approved: "Approved",
    rejected: "Rejected",
    active: "Active",
    inactive: "Inactive",
    available: "Available",
    unavailable: "Unavailable",
  };
  return texts[status?.toLowerCase()] || status || "N/A";
}

/**
 * Format relative time (e.g., "2 hours ago", "just now")
 * @param {string} dateString - Date to format
 * @returns {string} Relative time
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffSeconds = Math.floor((now - date) / 1000);
  
  if (diffSeconds < 60) return "just now";
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)} days ago`;
  
  return formatDate(dateString);
}