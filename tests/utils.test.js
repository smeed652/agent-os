/**
 * Tests for Utility Functions
 * 
 * This test suite validates utility functions and demonstrates
 * various testing patterns for the Testing Completeness Validator.
 */

const {
  formatMessage,
  validateUserId,
  calculateUptime,
  sanitizeInput,
  generateTimestamp,
  complexCalculation,
  poorlyNamedFunction,
  duplicateLogic1,
  duplicateLogic2
} = require("../src/utils");

describe("Utility Functions", () => {
  describe("formatMessage", () => {
    it("should format message with user ID", () => {
      const result = formatMessage("john123");
      expect(result).toBe("Hello john123! Welcome to our Hello World app.");
    });

    it("should handle empty user ID", () => {
      const result = formatMessage("");
      expect(result).toBe("Hello ! Welcome to our Hello World app.");
    });

    it("should handle null user ID", () => {
      const result = formatMessage(null);
      expect(result).toBe("Hello null! Welcome to our Hello World app.");
    });

    it("should handle undefined user ID", () => {
      const result = formatMessage(undefined);
      expect(result).toBe("Hello undefined! Welcome to our Hello World app.");
    });
  });

  describe("validateUserId", () => {
    it("should validate correct user ID format", () => {
      expect(validateUserId("user123")).toBe(true);
      expect(validateUserId("john_doe")).toBe(true);
      expect(validateUserId("test-user")).toBe(true);
    });

    it("should reject invalid user ID formats", () => {
      expect(validateUserId("")).toBe(false);
      expect(validateUserId(null)).toBe(false);
      expect(validateUserId(undefined)).toBe(false);
      expect(validateUserId("user@domain")).toBe(false);
      expect(validateUserId("user with spaces")).toBe(false);
    });

    it("should reject user IDs that are too short", () => {
      expect(validateUserId("a")).toBe(false);
      expect(validateUserId("ab")).toBe(false);
    });

    it("should reject user IDs that are too long", () => {
      const longUserId = "a".repeat(51);
      expect(validateUserId(longUserId)).toBe(false);
    });
  });

  describe("calculateUptime", () => {
    it("should calculate uptime in seconds", () => {
      const startTime = Date.now() - 5000; // 5 seconds ago
      const uptime = calculateUptime(startTime);
      expect(uptime).toBeGreaterThan(4);
      expect(uptime).toBeLessThan(6);
    });

    it("should handle invalid start time", () => {
      const uptime = calculateUptime(null);
      expect(uptime).toBe(0);
    });

    it("should handle future start time", () => {
      const futureTime = Date.now() + 1000;
      const uptime = calculateUptime(futureTime);
      expect(uptime).toBe(0);
    });
  });

  describe("sanitizeInput", () => {
    it("should remove HTML tags", () => {
      const input = "<script>alert(\"xss\")</script>hello";
      const result = sanitizeInput(input);
      expect(result).toBe("alert(\"xss\")hello");
    });

    it("should trim whitespace", () => {
      const input = "  hello world  ";
      const result = sanitizeInput(input);
      expect(result).toBe("hello world");
    });

    it("should handle empty input", () => {
      expect(sanitizeInput("")).toBe("");
      expect(sanitizeInput(null)).toBe("");
      expect(sanitizeInput(undefined)).toBe("");
    });

    it("should handle special characters", () => {
      const input = "hello & goodbye < > \" ' /";
      const result = sanitizeInput(input);
      expect(result).toBe("hello & goodbye  \" ' /");
    });
  });

  describe("generateTimestamp", () => {
    it("should generate valid ISO timestamp", () => {
      const timestamp = generateTimestamp();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it("should generate different timestamps when called multiple times", async () => {
      const timestamp1 = generateTimestamp();
      // Add a longer delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      const timestamp2 = generateTimestamp();
      expect(timestamp1).not.toBe(timestamp2);
    });
  });

  // Tests for functions with quality issues (for validator testing)
  describe("Complex Calculation (High Complexity)", () => {
    it("should perform complex calculation", () => {
      const result = complexCalculation(10, 5, "add");
      expect(result).toBe(15);
    });

    it("should handle different operations", () => {
      expect(complexCalculation(10, 5, "subtract")).toBe(5);
      expect(complexCalculation(10, 5, "multiply")).toBe(50);
      expect(complexCalculation(10, 5, "divide")).toBe(2);
    });

    // Note: This function intentionally has high cyclomatic complexity
    // to test the Code Quality Validator
  });

  describe("Poorly Named Function (Naming Convention Test)", () => {
    it("should execute poorly named function", () => {
      const result = poorlyNamedFunction();
      expect(typeof result).toBe("string");
    });
  });

  describe("Duplicate Logic Tests", () => {
    it("should test duplicate logic function 1", () => {
      const result = duplicateLogic1("test");
      expect(result).toContain("Test");
    });

    it("should test duplicate logic function 2", () => {
      const result = duplicateLogic2("test");
      expect(result).toContain("Test");
    });

    // Note: These functions intentionally contain duplicate code
    // to test the Code Quality Validator's duplication detection
  });
});

// Integration tests
describe("Utility Integration Tests", () => {
  it("should work together in user greeting workflow", () => {
    const userId = "testuser123";
    
    if (validateUserId(userId)) {
      const message = formatMessage(userId);
      const sanitized = sanitizeInput(message);
      
      expect(sanitized).toContain("testuser123");
      expect(sanitized).toContain("Hello");
    }
  });

  it("should handle complete user interaction flow", () => {
    const userId = "john_doe";
    const timestamp = generateTimestamp();
    
    expect(validateUserId(userId)).toBe(true);
    expect(formatMessage(userId)).toContain("john_doe");
    expect(timestamp).toBeTruthy();
  });
});

// Edge case tests for better coverage
describe("Edge Cases and Error Handling", () => {
  it("should handle extreme inputs", () => {
    const extremeUserId = "x".repeat(100);
    expect(validateUserId(extremeUserId)).toBe(false);
  });

  it("should handle special Unicode characters", () => {
    const unicodeInput = "🚀 hello world 🌟";
    const sanitized = sanitizeInput(unicodeInput);
    expect(sanitized).toContain("🚀");
    expect(sanitized).toContain("🌟");
  });

  it("should handle numeric inputs as strings", () => {
    const numericUserId = "12345";
    expect(validateUserId(numericUserId)).toBe(true);
    expect(formatMessage(numericUserId)).toContain("12345");
  });
});

// Performance tests
describe("Performance Tests", () => {
  it("should handle large number of validations efficiently", () => {
    const start = Date.now();
    
    for (let i = 0; i < 1000; i++) {
      validateUserId(`user${i}`);
    }
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });
});

// Mock and spy tests (advanced testing patterns)
describe("Advanced Testing Patterns", () => {
  it("should demonstrate mocking capabilities", () => {
    const originalConsoleLog = console.log;
    console.log = jest.fn();
    
    // Test function that uses console.log (if any)
    const timestamp = generateTimestamp();
    
    expect(timestamp).toBeTruthy();
    console.log = originalConsoleLog;
  });
});
