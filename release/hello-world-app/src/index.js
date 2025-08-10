#!/usr/bin/env node

/**
 * Hello World Express Application
 * 
 * This is a simple Hello World application built with Express.js
 * that demonstrates proper error handling, logging, and API design.
 * 
 * Features:
 * - Basic Hello World endpoint
 * - Status endpoint for health checks
 * - User greeting endpoint with parameter validation
 * - Comprehensive error handling
 * - Request logging
 */

const express = require('express');
const config = require('./config');
const utils = require('./utils');

// Create Express application
const app = express();
const PORT = config.port || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Routes

/**
 * Root endpoint - Returns Hello World HTML page
 * @route GET /
 * @returns {string} HTML Hello World page
 */
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hello World - Test Project</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .container {
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 3rem;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }
        .endpoints {
          background: rgba(255, 255, 255, 0.2);
          padding: 1.5rem;
          border-radius: 10px;
          margin-top: 2rem;
        }
        .endpoint {
          margin: 0.5rem 0;
          font-family: monospace;
          background: rgba(0, 0, 0, 0.2);
          padding: 0.5rem;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Hello World!</h1>
        <p>Welcome to the Agent-OS Hello World Test Application</p>
        <p>This application demonstrates our development workflow and validation process.</p>
        
        <div class="endpoints">
          <h3>Available Endpoints:</h3>
          <div class="endpoint">GET / - This page</div>
          <div class="endpoint">GET /api/status - Application status</div>
          <div class="endpoint">GET /api/user/:id - Personalized greeting</div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

/**
 * Status endpoint - Returns application status
 * @route GET /api/status
 * @returns {Object} Application status information
 */
app.get('/api/status', (req, res) => {
  const status = {
    status: 'ok',
    message: 'Hello World API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: config.version,
    environment: config.environment
  };
  
  res.json(status);
});

/**
 * User greeting endpoint - Returns personalized greeting
 * @route GET /api/user/:id
 * @param {string} id - User identifier
 * @returns {Object} Personalized greeting message
 */
app.get('/api/user/:id', (req, res) => {
  const userId = req.params.id;
  
  // Enhanced validation
  if (!userId || userId.trim() === '') {
    return res.status(400).json({
      error: 'User ID is required',
      message: 'Please provide a valid user ID'
    });
  }
  
  // Check for dangerous patterns before sanitization
  const dangerousPatterns = [
    /<script/i, 
    /(javascript|vbscript|data):/i,  // Script protocols
    /on\w+=/i, 
    /\.\./,  // Path traversal
    /[\u0000-\u001f\u007f-\u009f]/,  // Control characters
    /{{.*}}/,  // Template injection patterns
    /\$\{.*\}/,  // Template literal injection
    /["'][;].*alert/i,  // Script injection attempts
    /['"];\s*(drop|insert|delete|update|select)\s/i,  // SQL injection
    /['"](\s*or\s+['"]?1['"]?\s*=\s*['"]?1|--|\*\/|#)/i,  // SQL injection patterns with #
    /['"]>\s*<script/i,  // XSS with quote escaping
    /&[lg]t;.*script/i,  // HTML entity based XSS
    /^<\s*$|^>\s*$|^&\s*$|^['"]\s*$/,  // Raw dangerous characters
    /(drop|insert|delete|update|select)[\s]+/i,  // SQL keywords
    /['"][\s]*--/,  // SQL comment injection
    /\/\*|\*\//,  // SQL comment blocks
    /constructor\.constructor/i,  // Prototype pollution
    /\d+\*\d+/  // Math operations for template injection
  ];
  
  const hasDangerousPattern = dangerousPatterns.some(pattern => pattern.test(userId));
  if (hasDangerousPattern) {
    return res.status(400).json({
      error: 'Invalid User ID',
      message: 'User ID contains invalid characters'
    });
  }
  
  // Sanitize and validate user ID
  const sanitizedUserId = utils.sanitizeInput(userId);
  const validationResult = utils.validateUserId(sanitizedUserId);
  
  if (!validationResult.isValid) {
    return res.status(400).json({
      error: 'Invalid User ID',
      message: validationResult.errors?.[0] || 'User ID contains invalid characters',
      sanitizedValue: validationResult.sanitizedValue
    });
  }
  
  // Truncate if too long
  const finalUserId = sanitizedUserId.length > 100 ? sanitizedUserId.substring(0, 100) : sanitizedUserId;
  
  const greeting = utils.generateUserGreeting(finalUserId);
  
  res.json({
    message: greeting,
    userId: finalUserId,
    timestamp: new Date().toISOString(),
    statusCode: 200
  });
});

// Catch malformed user endpoint (missing ID parameter)
app.get('/api/user', (req, res) => {
  res.status(400).json({
    error: 'User ID is required',
    message: 'Please provide a user ID parameter'
  });
});

// 404 handler for non-existent routes
app.use((req, res) => {
  const notFoundResponse = {
    error: 'Not Found',
    message: `Route ${req.originalUrl} does not exist`
  };
  
  // Only add timestamp in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    notFoundResponse.timestamp = new Date().toISOString();
  }
  
  res.status(404).json(notFoundResponse);
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Error:', err);
  
  const errorResponse = {
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong'
  };
  
  // Only add timestamp in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    errorResponse.timestamp = new Date().toISOString();
  }
  
  res.status(err.status || 500).json(errorResponse);
});

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log('🚀 Hello World server started successfully!');
    console.log(`   📍 Server running on port ${PORT}`);
    console.log(`   🌍 Environment: ${config.environment}`);
    console.log(`   📅 Started at: ${new Date().toISOString()}`);
    console.log('');
    console.log('   Available endpoints:');
    console.log('   - GET /                 - Hello World page');
    console.log('   - GET /api/status       - Application status');
    console.log('   - GET /api/user/:id     - User greeting');
    console.log('');
    console.log('   Press Ctrl+C to stop the server');
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server gracefully...');
    server.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    server.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });
  });
}

module.exports = app;
