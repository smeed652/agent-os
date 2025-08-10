/**
 * Configuration Module for Hello World Application
 * 
 * This module provides centralized configuration management
 * with environment-based settings and validation.
 */

const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  
  // Application metadata
  name: 'Hello World App',
  version: process.env.APP_VERSION || '1.0.0',
  description: 'Agent-OS Hello World Test Application',
  
  // Environment configuration
  environment: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // Logging configuration
  logLevel: process.env.LOG_LEVEL || 'info',
  enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== 'false',
  
  // Security configuration
  enableCors: process.env.ENABLE_CORS === 'true',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Performance configuration
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
  maxPayloadSize: process.env.MAX_PAYLOAD_SIZE || '1mb',
  
  // Validation configuration
  maxUserIdLength: parseInt(process.env.MAX_USER_ID_LENGTH) || 100,
  minUserIdLength: parseInt(process.env.MIN_USER_ID_LENGTH) || 1,
  
  // Health check configuration
  healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000,
  enableHealthChecks: process.env.ENABLE_HEALTH_CHECKS !== 'false'
};

/**
 * Validate configuration values
 * @returns {Object} Validation results
 */
function validateConfig() {
  const errors = [];
  const warnings = [];
  
  // Port validation
  if (config.port < 1 || config.port > 65535) {
    errors.push('Port must be between 1 and 65535');
  }
  
  // Environment validation
  if (!['development', 'production', 'test'].includes(config.environment)) {
    warnings.push(`Unknown environment: ${config.environment}, defaulting to development`);
    config.environment = 'development';
  }
  
  // Log level validation
  const validLogLevels = ['error', 'warn', 'info', 'debug'];
  if (!validLogLevels.includes(config.logLevel)) {
    warnings.push(`Invalid log level: ${config.logLevel}, defaulting to info`);
    config.logLevel = 'info';
  }
  
  // Timeout validation
  if (config.requestTimeout < 1000) {
    warnings.push('Request timeout too low, defaulting to 30 seconds');
    config.requestTimeout = 30000;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get configuration for specific environment
 * @param {string} env - Environment name
 * @returns {Object} Environment-specific configuration
 */
function getEnvironmentConfig(env) {
  const envConfigs = {
    development: {
      logLevel: 'debug',
      enableRequestLogging: true,
      enableHealthChecks: true
    },
    production: {
      logLevel: 'warn',
      enableRequestLogging: false,
      enableHealthChecks: true
    },
    test: {
      logLevel: 'error',
      enableRequestLogging: false,
      enableHealthChecks: false
    }
  };
  
  return envConfigs[env] || envConfigs.development;
}

// Apply environment-specific configuration
const envConfig = getEnvironmentConfig(config.environment);
Object.assign(config, envConfig);

// Validate configuration on startup
const validation = validateConfig();
if (validation.warnings.length > 0) {
  console.warn('Configuration warnings:', validation.warnings);
}

if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
  process.exit(1);
}

module.exports = config;
