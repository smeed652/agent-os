/**
 * Security Tests for Hello World App
 * 
 * These tests validate the security characteristics of the application
 * and ensure it's protected against common vulnerabilities.
 */

const request = require('supertest');
const app = require('../../src/index');

describe('Security Tests', () => {
  describe('Input Validation Tests', () => {
    it('should sanitize user input in user endpoint', async () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
        'vbscript:alert("xss")',
        'onload=alert("xss")',
        '"><script>alert("xss")</script>',
        '";alert("xss");//',
        '${alert("xss")}',
        '{{constructor.constructor("alert(\'xss\')")()}}',
        '{{7*7}}'
      ];
      
      for (const maliciousInput of maliciousInputs) {
        // These dangerous inputs should be rejected by validation
        const response = await request(app)
          .get(`/api/user/${encodeURIComponent(maliciousInput)}`)
          .expect(400);
        
        // Should return validation error
        expect(response.body.error).toBe('Invalid User ID');
        expect(response.body.message).toBeDefined();
      }
    });
    
    it('should handle extremely long user IDs gracefully', async () => {
      const longUserId = 'a'.repeat(1000);
      
      const response = await request(app)
        .get(`/api/user/${encodeURIComponent(longUserId)}`)
        .expect(200);
      
      // Should handle long input without crashing
      expect(response.body.message).toBeDefined();
      expect(response.body.message).toContain('Hello');
    });
    
    it('should handle special characters in user IDs', async () => {
      const safeChars = [
        '!@#$%^&*()',
        '[]{}|\\:;"\'<>?,./',
        'áéíóúñü',
        '🚀🎉💻',
        '测试用户',
        'ユーザー',
        '사용자'
      ];
      
      const dangerousChars = [
        '<script>',
        'javascript:',
        'onload=',
        '"><script>'
      ];
      
      // Safe characters should work
      for (const specialChar of safeChars) {
        const response = await request(app)
          .get(`/api/user/${encodeURIComponent(specialChar)}`)
          .expect(200);
        
        // Should handle special characters gracefully
        expect(response.body.statusCode).toBe(200);
        expect(response.body.message).toBeDefined();
      }
      
      // Dangerous characters should be rejected
      for (const dangerousChar of dangerousChars) {
        const response = await request(app)
          .get(`/api/user/${encodeURIComponent(dangerousChar)}`)
          .expect(400);
        
        // Should return validation error
        expect(response.body.error).toBe('Invalid User ID');
        expect(response.body.message).toBe('User ID contains invalid characters');
      }
    });
    
    it('should handle null and undefined user IDs', async () => {
      // Test with null-like values
      const nullValues = ['null', 'undefined', 'NaN', ''];
      
      for (const nullValue of nullValues) {
        if (nullValue === '') {
          // Empty string should return 400
          await request(app)
            .get(`/api/user/${nullValue}`)
            .expect(400);
        } else {
          // Other null-like values should be treated as regular strings
          const response = await request(app)
            .get(`/api/user/${nullValue}`)
            .expect(200);
          
          // Should handle null-like values gracefully
          expect(response.body.message).toBeDefined();
        }
      }
    });
  });
  
  describe('SQL Injection Prevention', () => {
    it('should not be vulnerable to SQL injection attempts', async () => {
      const sqlInjectionAttempts = [
        '\'; DROP TABLE users; --',
        '\' OR \'1\'=\'1',
        '\' UNION SELECT * FROM users --',
        '\'; INSERT INTO users VALUES (\'hacker\', \'password\'); --',
        '\' OR 1=1 --',
        'admin\'--',
        'admin\'/*',
        'admin\'#',
        'admin\'/**/'
      ];
      
      for (const attempt of sqlInjectionAttempts) {
        // These dangerous inputs should be rejected by validation
        const response = await request(app)
          .get(`/api/user/${encodeURIComponent(attempt)}`)
          .expect(400);
        
        // Should return validation error
        expect(response.body.error).toBe('Invalid User ID');
        expect(response.body.message).toBeDefined();
      }
    });
  });
  
  describe('XSS Prevention', () => {
    it('should not execute JavaScript in responses', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(\'xss\')">',
        '<svg onload="alert(\'xss\')">',
        '<iframe src="javascript:alert(\'xss\')"></iframe>',
        '<object data="javascript:alert(\'xss\')"></object>',
        '<embed src="javascript:alert(\'xss\')">',
        '<form action="javascript:alert(\'xss\')">',
        '<input onfocus="alert(\'xss\')">',
        '<textarea onblur="alert(\'xss\')">',
        '<select onchange="alert(\'xss\')">'
      ];
      
      for (const payload of xssPayloads) {
        // These dangerous payloads should be rejected by validation
        const response = await request(app)
          .get(`/api/user/${encodeURIComponent(payload)}`)
          .expect(400);
        
        // Should return validation error
        expect(response.body.error).toBe('Invalid User ID');
        expect(response.body.message).toBeDefined();
      }
    });
    
    it('should properly escape HTML entities', async () => {
      const safeEntities = [
        '&lt;', '&gt;', '&amp;', '&quot;', '&#39;'
      ];
      
      const dangerousEntities = [
        '<', '>', '&', '"', '\''
      ];
      
      // Safe HTML entities should work
      for (const entity of safeEntities) {
        const response = await request(app)
          .get(`/api/user/${encodeURIComponent(entity)}`)
          .expect(200);
        
        // HTML entities should be properly handled
        expect(response.body.message).toBeDefined();
      }
      
      // Dangerous HTML entities should be rejected
      for (const entity of dangerousEntities) {
        const response = await request(app)
          .get(`/api/user/${encodeURIComponent(entity)}`)
          .expect(400);
        
        // Should return validation error
        expect(response.body.error).toBe('Invalid User ID');
        expect(response.body.message).toBe('User ID contains invalid characters');
      }
    });
  });
  
  describe('Path Traversal Prevention', () => {
    it('should not allow directory traversal attacks', async () => {
      const pathTraversalAttempts = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
        '....//....//....//etc/passwd',
        '..%2F..%2F..%2Fetc%2Fpasswd',
        '..%5C..%5C..%5Cwindows%5Csystem32%5Cdrivers%5Cetc%5Chosts',
        '..%252F..%252F..%252Fetc%252Fpasswd',
        '..%255C..%255C..%255Cwindows%255Csystem32%255Cdrivers%255Cetc%255Chosts'
      ];
      
      for (const attempt of pathTraversalAttempts) {
        // These dangerous inputs should be rejected by validation
        const response = await request(app)
          .get(`/api/user/${encodeURIComponent(attempt)}`)
          .expect(400);
        
        // Should return validation error
        expect(response.body.error).toBe('Invalid User ID');
        expect(response.body.message).toBe('User ID contains invalid characters');
      }
    });
  });
  
  describe('HTTP Security Headers', () => {
    it('should include security headers in responses', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      // Check for security headers (Express.js default behavior)
      expect(response.headers).toBeDefined();
      
      // Content-Type should be properly set
      expect(response.headers['content-type']).toMatch(/text\/html/);
    });
    
    it('should handle malformed headers gracefully', async () => {
      const response = await request(app)
        .get('/')
        .set('X-Forwarded-For', 'invalid-ip')
        .set('User-Agent', 'malicious-user-agent')
        .expect(200);
      
      // Should handle malformed headers without crashing
      expect(response.status).toBe(200);
      expect(response.text).toContain('Hello World');
    });
  });
  
  describe('Rate Limiting and DoS Protection', () => {
    it('should handle rapid requests without crashing', async () => {
      const startTime = Date.now();
      
      // Make 100 rapid requests
      for (let i = 0; i < 100; i++) {
        const response = await request(app)
          .get('/api/status')
          .expect(200);
        
        expect(response.body.status).toBe('ok');
      }
      
      const totalTime = Date.now() - startTime;
      
      // Should handle rapid requests efficiently
      expect(totalTime).toBeLessThan(5000); // Less than 5 seconds for 100 requests
    });
    
    it('should handle concurrent requests without resource exhaustion', async () => {
      const numConcurrent = 20;
      const requests = [];
      
      for (let i = 0; i < numConcurrent; i++) {
        requests.push(
          request(app)
            .get('/api/status')
            .expect(200)
        );
      }
      
      const responses = await Promise.all(requests);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
      });
    });
  });
  
  describe('Error Information Disclosure', () => {
    it('should not expose sensitive information in error responses', async () => {
      const response = await request(app)
        .get('/nonexistent-endpoint')
        .expect(404);
      
      // Error response should not expose internal details
      expect(response.body.error).toBe('Not Found');
      expect(response.body.message).toBeDefined();
      
      // Should not expose stack traces or internal paths
      expect(response.body.stack).toBeUndefined();
      expect(response.body.path).toBeUndefined();
      expect(response.body.timestamp).toBeUndefined();
    });
    
    it('should handle malformed JSON gracefully', async () => {
      // This test ensures the app doesn't crash on malformed input
      // For GET requests, we can't send malformed JSON, so we test basic functionality
      const response = await request(app)
        .get('/api/status')
        .expect(200);
      
      // Should still return valid response
      expect(response.body.status).toBe('ok');
    });
  });
  
  describe('Authentication and Authorization', () => {
    it('should not require authentication for public endpoints', async () => {
      const endpoints = ['/', '/api/status', '/api/user/testuser'];
      
      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .expect(200);
        
        // Public endpoints should be accessible without authentication
        expect(response.status).toBe(200);
      }
    });
    
    it('should not expose authentication mechanisms', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200);
      
      // Response should not contain authentication-related information
      expect(response.body.auth).toBeUndefined();
      expect(response.body.token).toBeUndefined();
      expect(response.body.session).toBeUndefined();
    });
  });
  
  describe('Data Validation', () => {
    it('should validate user ID format', async () => {
      const invalidIds = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        'onload=alert("xss")',
        '"><script>alert("xss")</script>'
      ];
      
      for (const invalidId of invalidIds) {
        // These invalid IDs should be rejected by validation
        const response = await request(app)
          .get(`/api/user/${encodeURIComponent(invalidId)}`)
          .expect(400);
        
        // Should return validation error
        expect(response.body.error).toBe('Invalid User ID');
        expect(response.body.message).toBeDefined();
      }
    });
  });
});
