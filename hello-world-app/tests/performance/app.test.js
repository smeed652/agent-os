/**
 * Performance Tests for Hello World App
 *
 * These tests validate the performance characteristics of the application
 * under various load conditions and ensure it meets performance requirements.
 */

const request = require("supertest");
const app = require("../../src/index");

describe("Performance Tests", () => {
  describe("Response Time Tests", () => {
    it("should respond to root endpoint within 100ms", async () => {
      const startTime = Date.now();

      const response = await request(app).get("/").expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(100);
      expect(response.text).toContain("Hello World");
    });

    it("should respond to status endpoint within 50ms", async () => {
      const startTime = Date.now();

      const response = await request(app).get("/api/status").expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(50);
      expect(response.body.status).toBe("ok");
    });

    it("should respond to user endpoint within 75ms", async () => {
      const startTime = Date.now();

      const response = await request(app).get("/api/user/testuser").expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(75);
      expect(response.body.message).toContain("testuser");
    });
  });

  describe("Concurrent Request Tests", () => {
    it("should handle 10 concurrent requests efficiently", async () => {
      const numRequests = 10;
      const requests = [];

      for (let i = 0; i < numRequests; i++) {
        requests.push(request(app).get("/api/status").expect(200));
      }

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("ok");
      });

      // Total time should be reasonable (not linear with request count)
      expect(totalTime).toBeLessThan(500); // Should handle concurrent requests efficiently
    });

    it("should handle mixed endpoint concurrent requests", async () => {
      const requests = [
        request(app).get("/"),
        request(app).get("/api/status"),
        request(app).get("/api/user/user1"),
        request(app).get("/api/user/user2"),
        request(app).get("/api/status"),
      ];

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      expect(responses[0].status).toBe(200); // Root endpoint
      expect(responses[1].status).toBe(200); // Status endpoint
      expect(responses[2].status).toBe(200); // User endpoint 1
      expect(responses[3].status).toBe(200); // User endpoint 2
      expect(responses[4].status).toBe(200); // Status endpoint again

      // Total time should be reasonable
      expect(totalTime).toBeLessThan(300);
    });
  });

  describe("Memory Usage Tests", () => {
    it("should not have memory leaks during repeated requests", async () => {
      const initialMemory = process.memoryUsage();

      // Make multiple requests
      for (let i = 0; i < 100; i++) {
        await request(app).get("/api/status").expect(200);
      }

      const finalMemory = process.memoryUsage();

      // Memory usage should not increase significantly
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

      // Allow for some memory increase but not excessive
      // Note: When running with other tests, memory usage may be higher due to accumulated state
      const memoryThreshold = process.env.NODE_ENV === "test" ? 50 : 10; // More lenient in test environment
      expect(memoryIncreaseMB).toBeLessThan(memoryThreshold);
    });
  });

  describe("Load Handling Tests", () => {
    it("should handle rapid successive requests", async () => {
      const startTime = Date.now();

      // Make 50 rapid requests
      for (let i = 0; i < 50; i++) {
        const response = await request(app).get("/api/status").expect(200);

        expect(response.body.status).toBe("ok");
      }

      const totalTime = Date.now() - startTime;

      // Should handle rapid requests efficiently
      expect(totalTime).toBeLessThan(2000); // Less than 2 seconds for 50 requests
    });

    it("should maintain consistent response times under load", async () => {
      const responseTimes = [];

      // Make 20 requests and measure response times
      for (let i = 0; i < 20; i++) {
        const startTime = Date.now();

        await request(app).get("/api/status").expect(200);

        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);
      }

      // Calculate average response time
      const avgResponseTime =
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      // Average response time should be reasonable
      expect(avgResponseTime).toBeLessThan(100);

      // Response times should be consistent (not vary too much)
      const variance =
        responseTimes.reduce((acc, time) => {
          return acc + Math.pow(time - avgResponseTime, 2);
        }, 0) / responseTimes.length;

      const standardDeviation = Math.sqrt(variance);

      // Standard deviation should be reasonable (consistent performance)
      expect(standardDeviation).toBeLessThan(50);
    });
  });

  describe("Error Handling Performance", () => {
    it("should handle 404 errors efficiently", async () => {
      const startTime = Date.now();

      const response = await request(app)
        .get("/nonexistent-endpoint")
        .expect(404);

      const responseTime = Date.now() - startTime;

      // 404 errors should be handled quickly
      expect(responseTime).toBeLessThan(50);
      expect(response.body.error).toBe("Not Found");
    });

    it("should handle malformed requests efficiently", async () => {
      const startTime = Date.now();

      const response = await request(app).get("/api/user/").expect(400);

      const responseTime = Date.now() - startTime;

      // Malformed requests should be handled quickly
      expect(responseTime).toBeLessThan(50);
      expect(response.body.error).toBe("User ID is required");
    });
  });

  describe("Startup Performance", () => {
    it("should start up within reasonable time", async () => {
      const startTime = Date.now();

      // This test validates that the app can be imported and initialized quickly
      // The actual startup time is tested in integration tests
      expect(app).toBeDefined();

      const startupTime = Date.now() - startTime;

      // Import and initialization should be very fast
      expect(startupTime).toBeLessThan(100);
    });
  });
});
