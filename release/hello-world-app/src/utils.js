/**
 * Utility Functions for Hello World Application
 *
 * This module provides utility functions for common operations
 * including input validation, string processing, and helper functions.
 */

const config = require("./config");

/**
 * Generate a personalized greeting for a user
 * @param {string} userId - User identifier
 * @returns {string} Personalized greeting message
 */
function generateUserGreeting(userId) {
  if (!userId || typeof userId !== "string") {
    return "Hello Guest! Welcome to our Hello World app.";
  }

  const sanitizedUserId = sanitizeInput(userId);
  return `Hello ${sanitizedUserId}! Welcome to our Hello World app.`;
}

/**
 * Sanitize user input to prevent injection attacks
 * @param {string} input - Raw user input
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
  if (typeof input !== "string") {
    return "";
  }

  // Remove potentially dangerous characters
  let sanitized = input
    .replace(/[<>]/g, "") // Remove < and >
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();

  // Limit length
  const maxLength = config.maxUserIdLength;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate user ID format and length
 * @param {string} userId - User identifier to validate
 * @returns {Object} Validation result with isValid, message, and sanitizedValue
 */
function validateUserId(userId) {
  if (userId === null || userId === undefined) {
    return {
      isValid: false,
      message: "User ID is required",
      sanitizedValue: "",
    };
  }

  if (typeof userId !== "string") {
    return {
      isValid: false,
      message: "User ID must be a string",
      sanitizedValue: "",
    };
  }

  const trimmed = userId.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      message: "User ID cannot be empty",
      sanitizedValue: "",
    };
  }

  if (trimmed.length < config.minUserIdLength) {
    return {
      isValid: false,
      message: `User ID must be at least ${config.minUserIdLength} characters`,
      sanitizedValue: sanitizeInput(userId),
    };
  }

  if (trimmed.length > config.maxUserIdLength) {
    return {
      isValid: false,
      message: `User ID cannot exceed ${config.maxUserIdLength} characters`,
      sanitizedValue: sanitizeInput(userId),
    };
  }

  // Only reject truly dangerous patterns, not all special characters
  if (
    userId.split("").some((char) => {
      const code = char.charCodeAt(0);
      return (code >= 0 && code <= 31) || (code >= 127 && code <= 159);
    })
  ) {
    return {
      isValid: false,
      message: "User ID contains invalid characters",
      sanitizedValue: sanitizeInput(userId),
    };
  }

  return {
    isValid: true,
    message: "User ID is valid",
    sanitizedValue: sanitizeInput(userId),
  };
}

/**
 * Format timestamp for display
 * @param {Date|string} timestamp - Timestamp to format
 * @returns {string} Formatted timestamp string
 */
function formatTimestamp(timestamp) {
  if (!timestamp) {
    return new Date().toISOString();
  }

  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
}

/**
 * Generate a random user ID for testing
 * @param {number} length - Length of the generated ID
 * @returns {string} Random user ID
 */
function generateRandomUserId(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Check if a string contains only safe characters
 * @param {string} input - String to check
 * @returns {boolean} True if string is safe
 */
function isSafeString(input) {
  if (typeof input !== "string") {
    return false;
  }

  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+=/gi,
    /<iframe\b/gi,
    /<object\b/gi,
    /<embed\b/gi,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(input));
}

/**
 * Truncate string to specified length with ellipsis
 * @param {string} input - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
function truncateString(input, maxLength) {
  if (typeof input !== "string") {
    return "";
  }

  if (input.length <= maxLength) {
    return input;
  }

  return input.substring(0, maxLength - 3) + "...";
}

/**
 * Convert string to title case
 * @param {string} input - String to convert
 * @returns {string} Title case string
 */
function toTitleCase(input) {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Generate a health check response
 * @returns {Object} Health check data
 */
function generateHealthCheck() {
  return {
    status: "healthy",
    timestamp: formatTimestamp(new Date()),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: config.version,
    environment: config.environment,
  };
}

module.exports = {
  generateUserGreeting,
  sanitizeInput,
  validateUserId,
  formatTimestamp,
  generateRandomUserId,
  isSafeString,
  truncateString,
  toTitleCase,
  generateHealthCheck,
};
