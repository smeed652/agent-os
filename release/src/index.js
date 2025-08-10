/**
 * Hello World Express Application
 * 
 * This is a simple Hello World application built with Express.js
 * designed to test the Agent OS validator suite and workflow.
 * 
 * Features:
 * - Basic Hello World endpoint
 * - API status endpoint
 * - User greeting endpoint
 * - Error handling middleware
 * - Security middleware
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { formatMessage, validateUserId, calculateUptime, sanitizeInput } = require('./utils');
const config = require('./config');

const app = express();

// Application start time for uptime calculation
const startTime = Date.now();

// Security middleware
app.use(helmet({
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
  }
}));
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials
}));

// Request size limits to prevent buffer overflow attacks
app.use(express.json({ 
  limit: '1mb', // Reduced from 10mb to prevent large payload attacks
  strict: true 
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb', // Reduced from 10mb
  parameterLimit: 10 // Limit number of parameters
}));

// Additional security middleware
app.use((req, res, next) => {
  // Prevent path traversal attacks
  const sanitizedPath = req.path.replace(/\.\./g, '').replace(/\/+/g, '/');
  if (sanitizedPath !== req.path) {
    return res.status(400).json({
      error: 'Invalid request path',
      message: 'Path contains invalid characters'
    });
  }
  
  // Limit request headers to prevent header injection
  const headerCount = Object.keys(req.headers).length;
  if (headerCount > 50) {
    return res.status(431).json({
      error: 'Too many headers',
      message: 'Request contains too many headers'
    });
  }
  
  next();
});

// Static file serving (for potential future assets)
app.use('/static', express.static(path.join(__dirname, '../public')));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  // Sanitize logged path to prevent log injection
  const safePath = req.path.replace(/[^\w\/\-\.]/g, '');
  console.log(`[${timestamp}] ${req.method} ${safePath} - ${req.ip}`);
  next();
});

// Routes

/**
 * Root endpoint - Returns Hello World HTML page
 * @route GET /
 * @returns {string} HTML Hello World page
 */
app.get('/', (req, res) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hello World - Test Project</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 50px auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                text-align: center;
            }
            h1 {
                color: #333;
                margin-bottom: 20px;
            }
            .subtitle {
                color: #666;
                font-size: 18px;
                margin-bottom: 30px;
            }
            .api-links {
                margin-top: 30px;
            }
            .api-links a {
                display: inline-block;
                margin: 10px;
                padding: 10px 20px;
                background: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
            }
            .api-links a:hover {
                background: #0056b3;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Hello World!</h1>
            <p class="subtitle">Welcome to our Agent OS Test Project</p>
            <p>This is a comprehensive test application designed to validate the Agent OS validator suite.</p>
            <div class="api-links">
                <a href="/api/status">API Status</a>
                <a href="/api/user/testuser123">Test User API</a>
            </div>
        </div>
    </body>
    </html>
  `;
  
  res.send(htmlContent);
});

/**
 * API Status endpoint - Returns application status information
 * @route GET /api/status
 * @returns {Object} Status information including uptime
 */
app.get('/api/status', (req, res) => {
  const uptime = calculateUptime(startTime);
  
  res.json({
    status: 'ok',
    message: 'Hello World API is running',
    timestamp: new Date().toISOString(),
    uptime: uptime,
    version: require('../package.json').version,
    environment: process.env.NODE_ENV || 'development',
    port: config.port
  });
});

/**
 * User greeting endpoint - Returns personalized greeting
 * @route GET /api/user/:id
 * @param {string} id - User ID
 * @returns {Object} Personalized greeting message
 */
app.get('/api/user/:id', (req, res) => {
  const userId = req.params.id;
  
  // Sanitize and validate user ID
  const sanitizedUserId = sanitizeInput(userId);
  
  if (!validateUserId(sanitizedUserId)) {
    return res.status(400).json({
      error: 'Invalid user ID format',
      message: 'User ID must be 3-50 characters, alphanumeric with dashes and underscores only'
      // Removed detailed userId exposure and validation rules
    });
  }
  
  // Generate personalized message
  const message = formatMessage(sanitizedUserId);
  
  res.json({
    message: message,
    userId: sanitizedUserId,
    timestamp: new Date().toISOString(),
    requestId: Math.random().toString(36).substr(2, 9)
  });
});

/**
 * Health check endpoint
 * @route GET /health
 * @returns {Object} Health status
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: calculateUptime(startTime)
  });
});

// Error handling middleware - Fixed information disclosure
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  
  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  let errorResponse = {
    error: 'Internal Server Error',
    message: 'Something went wrong',
    timestamp: new Date().toISOString()
  };
  
  // Only expose detailed error information in development
  if (isDevelopment) {
    errorResponse.message = err.message;
    errorResponse.stack = err.stack;
  }
  
  // Handle specific error types
  if (err.type === 'entity.parse.failed') {
    errorResponse.error = 'Invalid Request Format';
    errorResponse.message = 'The request body could not be parsed';
    res.status(400);
  } else if (err.status) {
    res.status(err.status);
  } else {
    res.status(500);
  }
  
  res.json(errorResponse);
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    timestamp: new Date().toISOString()
    // Removed detailed route information and available routes
  });
});

// Start server function
function startServer() {
  const port = config.port;
  
  const server = app.listen(port, () => {
    console.log('🚀 Hello World server started successfully!');
    console.log(`📡 Server running at http://localhost:${port}`);
    console.log(`🌟 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('📊 API endpoints available:');
    console.log('   - GET /                 - Hello World page');
    console.log('   - GET /api/status       - API status');
    console.log('   - GET /api/user/:id     - User greeting');
    console.log('   - GET /health           - Health check');
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
  
  return server;
}

// Export app for testing, start server if run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
