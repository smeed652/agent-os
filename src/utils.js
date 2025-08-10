/**
 * Utility Functions for Hello World Application
 *
 * This file contains various utility functions with intentional quality variations
 * to test different aspects of the Agent OS validator suite:
 * - Good practices and bad practices
 * - Complex functions for complexity testing
 * - Duplicate code for duplication detection
 * - Poor naming conventions
 * - Various comment quality levels
 */

const path = require("path");

/**
 * Formats a personalized greeting message for a user
 * @param {string} userId - The user identifier
 * @returns {string} Formatted greeting message
 */
function formatMessage(userId) {
  return `Hello ${userId}! Welcome to our Hello World app.`;
}

/**
 * Validates user ID format according to our application rules
 * @param {string} userId - User ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateUserId(userId) {
  // Check if userId is null, undefined, or empty
  if (!userId || typeof userId !== "string") {
    return false;
  }

  // Check length constraints (3-50 characters)
  if (userId.length < 3 || userId.length > 50) {
    return false;
  }

  // Check format: alphanumeric with dashes and underscores only
  const validFormat = /^[a-zA-Z0-9_-]+$/;
  return validFormat.test(userId);
}

/**
 * Calculates application uptime in seconds
 * @param {number} startTime - Application start timestamp
 * @returns {number} Uptime in seconds
 */
function calculateUptime(startTime) {
  if (!startTime || typeof startTime !== "number") {
    return 0;
  }

  const currentTime = Date.now();
  const uptimeMs = currentTime - startTime;

  // Return 0 if start time is in the future (invalid)
  if (uptimeMs < 0) {
    return 0;
  }

  return Math.floor(uptimeMs / 1000);
}

/**
 * Enhanced input sanitization to prevent various injection attacks
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeInput(input) {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Remove HTML tags and script content
  let sanitized = input.replace(/<[^>]*>/g, "");
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=/gi, "");

  // Remove path traversal attempts
  sanitized = sanitized.replace(/\.\./g, "");
  sanitized = sanitized.replace(/\/+/g, "/");

  // Remove null bytes and control characters
  sanitized = sanitized.replace(/\0/g, "");
  // Filter out control characters using a function
  sanitized = sanitized
    .split("")
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("");

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length to prevent buffer overflow
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }

  return sanitized;
}

/**
 * Validates and sanitizes file paths to prevent path traversal attacks
 * @param {string} filePath - File path to validate
 * @returns {string|null} Sanitized path or null if invalid
 */
function validateFilePath(filePath) {
  if (!filePath || typeof filePath !== "string") {
    return null;
  }

  // Normalize path and remove any path traversal attempts
  const normalized = path.normalize(filePath);

  // Check for path traversal patterns
  if (normalized.includes("..") || normalized.includes("//")) {
    return null;
  }

  // Ensure path is within allowed directory
  const resolved = path.resolve(normalized);
  const allowedDir = path.resolve(__dirname, "../public");

  if (!resolved.startsWith(allowedDir)) {
    return null;
  }

  return normalized;
}

/**
 * Generates an ISO timestamp string
 * @returns {string} ISO formatted timestamp
 */
function generateTimestamp() {
  return new Date().toISOString();
}

// INTENTIONAL QUALITY ISSUES BELOW - FOR VALIDATOR TESTING

/**
 * Complex calculation function with high cyclomatic complexity
 * This function intentionally violates complexity rules to test the Code Quality Validator
 */
function complexCalculation(a, b, operation) {
  let result = 0;

  // Intentionally complex nested conditions for testing
  if (operation === "add") {
    if (a > 0) {
      if (b > 0) {
        result = a + b;
      } else if (b === 0) {
        result = a;
      } else {
        if (a > Math.abs(b)) {
          result = a + b;
        } else {
          result = a + b;
        }
      }
    } else if (a === 0) {
      if (b > 0) {
        result = b;
      } else if (b === 0) {
        result = 0;
      } else {
        result = b;
      }
    } else {
      if (b > 0) {
        if (b > Math.abs(a)) {
          result = a + b;
        } else {
          result = a + b;
        }
      } else if (b === 0) {
        result = a;
      } else {
        result = a + b;
      }
    }
  } else if (operation === "subtract") {
    if (a > 0) {
      if (b > 0) {
        result = a - b;
      } else if (b === 0) {
        result = a;
      } else {
        result = a - b;
      }
    } else if (a === 0) {
      if (b > 0) {
        result = -b;
      } else if (b === 0) {
        result = 0;
      } else {
        result = -b;
      }
    } else {
      if (b > 0) {
        result = a - b;
      } else if (b === 0) {
        result = a;
      } else {
        result = a - b;
      }
    }
  } else if (operation === "multiply") {
    if (a === 0 || b === 0) {
      result = 0;
    } else if (a > 0) {
      if (b > 0) {
        result = a * b;
      } else {
        result = a * b;
      }
    } else {
      if (b > 0) {
        result = a * b;
      } else {
        result = a * b;
      }
    }
  } else if (operation === "divide") {
    if (b === 0) {
      throw new Error("Division by zero");
    } else if (a === 0) {
      result = 0;
    } else if (a > 0) {
      if (b > 0) {
        result = a / b;
      } else {
        result = a / b;
      }
    } else {
      if (b > 0) {
        result = a / b;
      } else {
        result = a / b;
      }
    }
  } else {
    throw new Error("Invalid operation");
  }

  return result;
}

// Poor naming convention - intentional for testing
function xyz() {
  return "This function has a poor name for testing naming conventions";
}

// Alias with better name for the same function
const poorlyNamedFunction = xyz;

// DUPLICATE CODE - INTENTIONAL FOR TESTING
function duplicateLogic1(input) {
  if (!input) {
    return "";
  }
  const processed = input.toString().trim();
  const capitalized = processed.charAt(0).toUpperCase() + processed.slice(1);
  const withSuffix = capitalized + " - processed by function 1";
  return withSuffix;
}

function duplicateLogic2(input) {
  if (!input) {
    return "";
  }
  const processed = input.toString().trim();
  const capitalized = processed.charAt(0).toUpperCase() + processed.slice(1);
  const withSuffix = capitalized + " - processed by function 2";
  return withSuffix;
}

// Function with minimal comments (poor comment quality)
function processData(data) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i] !== null) {
      result.push(data[i] * 2);
    }
  }
  return result;
}

// Function with excessive comments (testing comment quality detection)
/**
 * This function adds two numbers together
 * @param {number} num1 - The first number to add
 * @param {number} num2 - The second number to add
 * @returns {number} The sum of num1 and num2
 */
function addNumbers(num1, num2) {
  // Check if first number is provided
  if (typeof num1 !== "number") {
    // If not a number, convert to number
    num1 = parseFloat(num1) || 0;
  }

  // Check if second number is provided
  if (typeof num2 !== "number") {
    // If not a number, convert to number
    num2 = parseFloat(num2) || 0;
  }

  // Perform the addition operation
  const sum = num1 + num2;

  // Return the calculated sum
  return sum;
}

// Export all functions
module.exports = {
  formatMessage,
  validateUserId,
  calculateUptime,
  sanitizeInput,
  validateFilePath,
  generateTimestamp,
  complexCalculation,
  poorlyNamedFunction,
  duplicateLogic1,
  duplicateLogic2,
  processData,
  addNumbers,
};
