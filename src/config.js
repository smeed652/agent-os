/**
 * Configuration Module for Hello World Application
 * 
 * This file contains configuration settings and intentional security patterns
 * for testing the Security Validator.
 * 
 * SECURITY NOTE: This file contains commented examples of security anti-patterns
 * for testing purposes only. These should never be used in production.
 */

require("dotenv").config();

// Good configuration practices
const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  host: process.env.HOST || "localhost",
  
  // Environment
  nodeEnv: process.env.NODE_ENV || "development",
  
  // Security settings
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true
  },
  
  // Enhanced rate limiting to prevent abuse
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later",
    standardHeaders: true,
    legacyHeaders: false
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.LOG_FORMAT || "combined"
  }
};

// SECURITY TEST PATTERNS - COMMENTED OUT FOR SAFETY
// These examples are for testing the Security Validator only

/*
// HARDCODED SECRETS - BAD PRACTICE (for testing)
const badSecrets = {
  apiKey: 'sk-1234567890abcdef1234567890abcdef',
  databasePassword: 'super_secret_password_123',
  privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...',
  awsSecretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  jwtSecret: 'my-super-secret-jwt-key-that-should-be-in-env'
};

// SQL INJECTION VULNERABLE CODE (for testing)
function vulnerableDatabaseQuery(userId) {
  const query = "SELECT * FROM users WHERE id = '" + userId + "'";
  return database.query(query);
}

// XSS VULNERABLE CODE (for testing)
function vulnerableHtmlGeneration(userInput) {
  document.getElementById('content').innerHTML = userInput;
  return '<div>' + userInput + '</div>';
}

// INSECURE RANDOM GENERATION (for testing)
function insecureTokenGeneration() {
  return Math.random().toString(36).substring(2);
}

// WEAK PASSWORD VALIDATION (for testing)
function weakPasswordCheck(password) {
  return password.length >= 6; // Too weak!
}
*/

// DEPENDENCY SECURITY TEST
// These commented dependencies have known vulnerabilities (for testing)
/*
package.json should include for testing:
"lodash": "4.17.20",  // Has known vulnerabilities
"express": "4.16.0",  // Older version with vulnerabilities
"mongoose": "5.7.0"   // Older version with vulnerabilities
*/

// ENVIRONMENT VARIABLE SECURITY PATTERNS
function getSecretFromEnv(key) {
  const secret = process.env[key];
  
  if (!secret) {
    console.warn(`Warning: Environment variable ${key} is not set`);
    return null;
  }
  
  // Good practice: Don't log secrets
  console.log(`Loaded configuration for ${key.replace(/./g, "*")}`);
  return secret;
}

// Secure configuration loading
const secureConfig = {
  // Load secrets from environment variables
  databaseUrl: getSecretFromEnv("DATABASE_URL"),
  apiKey: getSecretFromEnv("API_KEY"),
  jwtSecret: getSecretFromEnv("JWT_SECRET"),
  
  // Security headers configuration
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"]
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      xssFilter: true,
      frameguard: {
        action: "deny"
      }
    }
  },
  
  // Enhanced input validation patterns to prevent buffer overflow
  validation: {
    maxInputLength: 1000, // Reduced from previous value
    maxRequestBodySize: "1mb", // Reduced from 10mb
    maxUrlLength: 2048,
    allowedFileTypes: [".jpg", ".png", ".gif", ".pdf"],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxParameters: 10,
    maxHeaders: 50
  },
  
  // Request size limits to prevent buffer overflow attacks
  limits: {
    json: "1mb",
    urlencoded: "1mb",
    text: "1mb",
    raw: "1mb"
  }
};

// Configuration validation
function validateConfig() {
  const requiredEnvVars = ["NODE_ENV"];
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.warn("Missing environment variables:", missing);
  }
  
  // Validate port range
  if (config.port < 1 || config.port > 65535) {
    throw new Error("Invalid port number");
  }
  
  // Validate security limits
  if (secureConfig.validation.maxInputLength > 10000) {
    throw new Error("Input length limit too high - security risk");
  }
  
  if (secureConfig.validation.maxRequestBodySize.includes("mb") && 
      parseInt(secureConfig.validation.maxRequestBodySize) > 10) {
    throw new Error("Request body size limit too high - security risk");
  }
  
  return true;
}

// Initialize configuration
try {
  validateConfig();
  console.log("✅ Configuration loaded successfully");
} catch (error) {
  console.error("❌ Configuration error:", error.message);
  process.exit(1);
}

module.exports = {
  ...config,
  ...secureConfig,
  validateConfig
};
