/**
 * errorHandler.js - Convert HTTP status codes to user-friendly messages
 * Usage: const message = getErrorMessage(error.status);
 *        const display = formatError(error.status, error.message);
 */

const STATUS_MESSAGES = {
  400: "Bad Request - Invalid input data",
  401: "Unauthorized - Please log in again", 
  403: "Forbidden - You don't have permission",
  404: "Not Found - Resource doesn't exist",
  408: "Request Timeout - Please try again",
  409: "Conflict - Data already exists",
  422: "Validation Error - Please check your input",
  429: "Too Many Requests - Please wait before retrying",
  500: "Server Error - Please try again later",
  502: "Bad Gateway - Service temporarily unavailable",
  503: "Service Unavailable - Please try again later",
  504: "Gateway Timeout - Server is taking too long"
};

/**
 * Get user-friendly message for status code
 */
export function getErrorMessage(status) {
  return STATUS_MESSAGES[status] || "An unexpected error occurred";
}

/**
 * Format full error display: "Error 400: Bad Request"
 */
export function formatError(status, customMessage = "") {
  const baseMsg = getErrorMessage(status);
  if (customMessage) {
    return `Error ${status}: ${customMessage}`;
  }
  return `Error ${status}: ${baseMsg}`;
}

/**
 * Get error type/color for UI (red/yellow/blue)
 */
export function getErrorType(status) {
  if (status >= 500) return { type: "server", color: "red" };
  if (status >= 400) return { type: "client", color: "orange" };
  return { type: "network", color: "blue" };
}

/**
 * Check if error is network-related (no status code)
 */
export function isNetworkError(error) {
  return !error.status && !error.statusCode;
}
