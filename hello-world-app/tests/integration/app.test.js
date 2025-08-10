/**
 * Integration Tests for Hello World Application
 * 
 * Tests the Express application endpoints and middleware
 */

const request = require('supertest');
const app = require('../../src/index');

describe('Hello World Application Integration Tests', () => {
  let server;

  beforeAll((done) => {
    // Start server for testing
    server = app.listen(0, () => {
      done();
    });
  });

  afterAll((done) => {
    // Close server after tests
    server.close(done);
  });

  describe('GET /', () => {
    it('should return Hello World HTML page', async () => {
      const response = await request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /html/);

      expect(response.text).toContain('Hello World');
      expect(response.text).toContain('Agent-OS Hello World Test Application');
      expect(response.text).toContain('Available Endpoints');
    });

    it('should include all endpoint information', async () => {
      const response = await request(app).get('/');
      
      expect(response.text).toContain('GET / - This page');
      expect(response.text).toContain('GET /api/status - Application status');
      expect(response.text).toContain('GET /api/user/:id - Personalized greeting');
    });

    it('should have proper HTML structure', async () => {
      const response = await request(app).get('/');
      
      expect(response.text).toContain('<!DOCTYPE html>');
      expect(response.text).toContain('<html lang="en">');
      expect(response.text).toContain('<head>');
      expect(response.text).toContain('<body>');
      expect(response.text).toContain('</html>');
    });
  });

  describe('GET /api/status', () => {
    it('should return application status', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('message', 'Hello World API is running');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
    });

    it('should have valid timestamp format', async () => {
      const response = await request(app).get('/api/status');
      
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should have numeric uptime', async () => {
      const response = await request(app).get('/api/status');
      
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should have valid environment', async () => {
      const response = await request(app).get('/api/status');
      
      expect(['development', 'production', 'test']).toContain(response.body.environment);
    });
  });

  describe('GET /api/user/:id', () => {
    it('should return personalized greeting for valid user ID', async () => {
      const userId = 'john123';
      const response = await request(app)
        .get(`/api/user/${userId}`)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Hello john123');
      expect(response.body).toHaveProperty('userId', userId);
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should handle empty user ID', async () => {
      const response = await request(app)
        .get('/api/user/')
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error', 'User ID is required');
      expect(response.body).toHaveProperty('message', 'Please provide a user ID parameter');
    });

    it('should handle whitespace-only user ID', async () => {
      const response = await request(app)
        .get('/api/user/   ')
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error', 'User ID is required');
      expect(response.body).toHaveProperty('message', 'Please provide a user ID parameter');
    });

    it('should sanitize dangerous input', async () => {
      const dangerousUserId = '<script>alert("xss")</script>';
      const response = await request(app)
        .get(`/api/user/${encodeURIComponent(dangerousUserId)}`)
        .expect(400);

      expect(response.body.error).toBe('Invalid User ID');
      expect(response.body.message).toBe('User ID contains invalid characters');
      expect(response.body.userId).toBeUndefined(); // Should not have userId in error response
    });

    it('should handle very long user ID', async () => {
      const longUserId = 'a'.repeat(200);
      const response = await request(app)
        .get(`/api/user/${longUserId}`)
        .expect(200);

      expect(response.body.userId.length).toBeLessThanOrEqual(100);
    });

    it('should handle special characters in user ID', async () => {
      const specialUserId = 'user@domain.com';
      const response = await request(app)
        .get(`/api/user/${encodeURIComponent(specialUserId)}`)
        .expect(200);

      expect(response.body.message).toContain('user@domain.com');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body).toHaveProperty('message');
      // Timestamp not present in test mode for security
    });

    it('should handle malformed user endpoint gracefully', async () => {
      const response = await request(app)
        .get('/api/user')
        .expect(400);
      
      expect(response.body.error).toBe('User ID is required');
      expect(response.body.message).toBe('Please provide a user ID parameter');
    });
  });

  describe('Request Logging', () => {
    it('should log requests with timestamp and method', async () => {
      // Mock console.log to capture logging
      const originalLog = console.log;
      const logs = [];
      console.log = jest.fn((...args) => logs.push(args.join(' ')));

      await request(app).get('/api/status');

      // Restore console.log
      console.log = originalLog;

      // Check if request was logged
      const requestLog = logs.find(log => log.includes('GET') && log.includes('/api/status'));
      expect(requestLog).toBeDefined();
      // Check for ISO timestamp format in the log
      expect(requestLog).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('Response Headers', () => {
    it('should set proper content type for HTML responses', async () => {
      const response = await request(app).get('/');
      expect(response.headers['content-type']).toContain('text/html');
    });

    it('should set proper content type for JSON responses', async () => {
      const response = await request(app).get('/api/status');
      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  describe('Performance', () => {
    it('should respond to status endpoint within reasonable time', async () => {
      const startTime = Date.now();
      
      await request(app).get('/api/status');
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = Array(5).fill().map(() => 
        request(app).get('/api/status')
      );
      
      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
      });
    });
  });
});
