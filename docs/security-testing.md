# Security Testing Guide

## Overview

This guide covers the comprehensive security testing implemented in the Hello World test project, including automated vulnerability detection, security best practices, and testing methodologies.

## Security Features Implemented

### 1. Input Validation & Sanitization

#### Input Sanitization
```javascript
// src/utils.js - sanitizeInput function
function sanitizeInput(input) {
  // Remove HTML tags and script content
  let sanitized = input.replace(/<[^>]*>/g, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Remove path traversal attempts
  sanitized = sanitized.replace(/\.\./g, '');
  sanitized = sanitized.replace(/\/+/g, '/');
  
  // Remove null bytes and control characters
  sanitized = sanitized.replace(/\0/g, '');
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Trim whitespace and limit length
  sanitized = sanitized.trim();
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }
  
  return sanitized;
}
```

#### Path Validation
```javascript
// src/utils.js - validateFilePath function
function validateFilePath(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    return null;
  }
  
  const normalized = path.normalize(filePath);
  
  // Check for path traversal patterns
  if (normalized.includes('..') || normalized.includes('//')) {
    return null;
  }
  
  // Ensure path is within allowed directory
  const resolved = path.resolve(normalized);
  const allowedDir = path.resolve(__dirname, '../public');
  
  if (!resolved.startsWith(allowedDir)) {
    return null;
  }
  
  return normalized;
}
```

### 2. Security Headers & Middleware

#### Helmet.js Configuration
```javascript
// src/index.js
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
```

#### CORS Configuration
```javascript
// src/config.js
cors: {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

### 3. Request Size Limits

#### Body Parser Limits
```javascript
// src/index.js
app.use(express.json({ 
  limit: '1mb', // Reduced from 10mb to prevent large payload attacks
  strict: true 
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb',
  parameterLimit: 10 // Limit number of parameters
}));
```

#### Header Limits
```javascript
// src/index.js - Custom middleware
app.use((req, res, next) => {
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
```

### 4. Error Handling Security

#### Information Disclosure Prevention
```javascript
// src/index.js - Error handling middleware
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
```

## Security Testing Scenarios

### 1. SQL Injection Testing
```javascript
// scripts/security-chaos.js
async testSqlInjection() {
  const payloads = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT * FROM users --",
    "admin'--",
    "1' OR '1' = '1' --"
  ];
  
  for (const payload of payloads) {
    const result = await this.makeRequest(`/api/user/${payload}`);
    // Analyze response for vulnerabilities
  }
}
```

### 2. XSS Attack Testing
```javascript
// scripts/security-chaos.js
async testXssAttacks() {
  const payloads = [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "javascript:alert('XSS')",
    "<svg onload=alert('XSS')>"
  ];
  
  for (const payload of payloads) {
    const result = await this.makeRequest(`/api/user/${payload}`);
    // Check if payload is reflected in response
  }
}
```

### 3. Path Traversal Testing
```javascript
// scripts/security-chaos.js
async testPathTraversal() {
  const payloads = [
    "../../../etc/passwd",
    "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
    "....//....//....//etc/passwd",
    "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd"
  ];
  
  for (const payload of payloads) {
    const result = await this.makeRequest(`/api/user/${payload}`);
    // Check for unauthorized file access
  }
}
```

### 4. Buffer Overflow Testing
```javascript
// scripts/security-chaos.js
async testBufferOverflow() {
  const payloadSizes = [1000, 10000, 100000];
  
  for (const size of payloadSizes) {
    const payload = 'A'.repeat(size);
    const result = await this.makeRequest(`/api/user/${payload}`);
    // Check for system crashes or memory issues
  }
}
```

## Security Configuration

### Environment Variables
```bash
# .env
NODE_ENV=production
PORT=3000
HOST=localhost
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Rate Limiting
```javascript
// src/config.js
rateLimit: {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
}
```

### Validation Limits
```javascript
// src/config.js
validation: {
  maxInputLength: 1000,
  maxRequestBodySize: '1mb',
  maxUrlLength: 2048,
  maxParameters: 10,
  maxHeaders: 50
}
```

## Running Security Tests

### Individual Security Tests
```bash
# Run security chaos monkey tests
npm run chaos:security

# Run specific security test categories
node scripts/security-chaos.js --test=sql-injection
node scripts/security-chaos.js --test=xss
node scripts/security-chaos.js --test=path-traversal
```

### Comprehensive Security Testing
```bash
# Run all security tests
npm run test:integration:security

# Run with detailed reporting
node scripts/test-integration.js security --verbose
```

## Security Best Practices

### 1. Input Validation
- Always validate and sanitize user input
- Use whitelist approach for allowed characters
- Implement length limits to prevent buffer overflow
- Validate file paths and prevent traversal attacks

### 2. Output Encoding
- Encode all user-generated content
- Use appropriate encoding for different contexts (HTML, JavaScript, CSS)
- Implement Content Security Policy headers

### 3. Error Handling
- Never expose internal system information
- Log errors securely without sensitive data
- Use generic error messages in production
- Implement proper HTTP status codes

### 4. Authentication & Authorization
- Implement proper session management
- Use secure password hashing (bcrypt, Argon2)
- Implement rate limiting and account lockout
- Validate all authentication tokens

### 5. Secure Headers
- Use Helmet.js for security headers
- Implement HSTS for HTTPS enforcement
- Set appropriate Content Security Policy
- Disable information disclosure headers

## Security Monitoring

### Log Analysis
```javascript
// Monitor for suspicious patterns
const suspiciousPatterns = [
  /\.\.\/\.\.\//,           // Path traversal
  /<script[^>]*>/i,        // XSS attempts
  /['"]\s*(?:OR|AND)\s*['"]/, // SQL injection
  /javascript:/i,           // JavaScript injection
  /on\w+\s*=/i             // Event handler injection
];

// Log security events
function logSecurityEvent(pattern, request, ip) {
  console.warn(`Security Alert: ${pattern} detected from ${ip}`);
  // Send to security monitoring system
}
```

### Vulnerability Reporting
```javascript
// Generate security report
function generateSecurityReport(results) {
  const vulnerabilities = results.filter(r => r.vulnerability);
  const riskLevel = vulnerabilities.length > 0 ? 'HIGH' : 'LOW';
  
  return {
    timestamp: new Date().toISOString(),
    riskLevel,
    vulnerabilityCount: vulnerabilities.length,
    details: vulnerabilities,
    recommendations: generateRecommendations(vulnerabilities)
  };
}
```

## Continuous Security Testing

### CI/CD Integration
```yaml
# .github/workflows/security-test.yml
name: Security Testing
on: [push, pull_request]
jobs:
  security-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Security Tests
        run: npm run chaos:security
      - name: Upload Security Report
        uses: actions/upload-artifact@v2
        with:
          name: security-report
          path: security-chaos-report.json
```

### Automated Scanning
```bash
# Daily security scan
0 2 * * * cd /path/to/project && npm run chaos:security > /var/log/security-scan.log 2>&1

# Weekly comprehensive scan
0 3 * * 0 cd /path/to/project && npm run test:comprehensive > /var/log/comprehensive-scan.log 2>&1
```

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practices-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
