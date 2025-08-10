/**
 * Unit Tests for Utility Functions
 * 
 * Tests the utility functions module with comprehensive coverage
 */

const utils = require('../../src/utils');

describe('Utility Functions', () => {
  describe('generateUserGreeting', () => {
    it('should generate greeting for valid user ID', () => {
      const result = utils.generateUserGreeting('john123');
      expect(result).toBe('Hello john123! Welcome to our Hello World app.');
    });

    it('should handle empty user ID', () => {
      const result = utils.generateUserGreeting('');
      expect(result).toBe('Hello Guest! Welcome to our Hello World app.');
    });

    it('should handle null user ID', () => {
      const result = utils.generateUserGreeting(null);
      expect(result).toBe('Hello Guest! Welcome to our Hello World app.');
    });

    it('should handle undefined user ID', () => {
      const result = utils.generateUserGreeting(undefined);
      expect(result).toBe('Hello Guest! Welcome to our Hello World app.');
    });

    it('should handle non-string user ID', () => {
      const result = utils.generateUserGreeting(123);
      expect(result).toBe('Hello Guest! Welcome to our Hello World app.');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      const input = '<script>alert("xss")</script>';
      const result = utils.sanitizeInput(input);
      expect(result).toBe('scriptalert("xss")/script');
    });

    it('should remove javascript protocol', () => {
      const input = 'javascript:alert("xss")';
      const result = utils.sanitizeInput(input);
      expect(result).toBe('alert("xss")');
    });

    it('should remove event handlers', () => {
      const input = 'onclick=alert("xss")';
      const result = utils.sanitizeInput(input);
      expect(result).toBe('alert("xss")');
    });

    it('should trim whitespace', () => {
      const input = '  hello world  ';
      const result = utils.sanitizeInput(input);
      expect(result).toBe('hello world');
    });

    it('should handle empty string', () => {
      const result = utils.sanitizeInput('');
      expect(result).toBe('');
    });

    it('should handle non-string input', () => {
      const result = utils.sanitizeInput(123);
      expect(result).toBe('');
    });

    it('should limit length to maxUserIdLength', () => {
      const longInput = 'a'.repeat(200);
      const result = utils.sanitizeInput(longInput);
      expect(result.length).toBeLessThanOrEqual(100);
    });
  });

  describe('validateUserId', () => {
    it('should validate correct user ID', () => {
      const result = utils.validateUserId('john123');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('User ID is valid');
      expect(result.sanitizedValue).toBe('john123');
    });

    it('should reject empty user ID', () => {
      const result = utils.validateUserId('');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('User ID cannot be empty');
      expect(result.sanitizedValue).toBe('');
    });

    it('should reject whitespace-only user ID', () => {
      const result = utils.validateUserId('   ');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('User ID cannot be empty');
      expect(result.sanitizedValue).toBe('');
    });

    it('should reject null user ID', () => {
      const result = utils.validateUserId(null);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('User ID is required');
      expect(result.sanitizedValue).toBe('');
    });

    it('should reject non-string user ID', () => {
      const result = utils.validateUserId(123);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('User ID must be a string');
      expect(result.sanitizedValue).toBe('');
    });

    it('should accept user ID with special characters (dangerous pattern detection moved to route handler)', () => {
      const result = utils.validateUserId('<script>');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('User ID is valid');
    });
  });

  describe('formatTimestamp', () => {
    it('should format valid date', () => {
      const date = new Date('2023-01-01T00:00:00Z');
      const result = utils.formatTimestamp(date);
      expect(result).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should handle ISO string', () => {
      const result = utils.formatTimestamp('2023-01-01T00:00:00Z');
      expect(result).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should handle null input', () => {
      const result = utils.formatTimestamp(null);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle invalid date', () => {
      const result = utils.formatTimestamp('invalid-date');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('generateRandomUserId', () => {
    it('should generate user ID of specified length', () => {
      const result = utils.generateRandomUserId(10);
      expect(result).toHaveLength(10);
    });

    it('should generate user ID of default length', () => {
      const result = utils.generateRandomUserId();
      expect(result).toHaveLength(8);
    });

    it('should generate alphanumeric characters only', () => {
      const result = utils.generateRandomUserId(20);
      expect(result).toMatch(/^[a-z0-9]+$/);
    });

    it('should generate different IDs on multiple calls', () => {
      const id1 = utils.generateRandomUserId();
      const id2 = utils.generateRandomUserId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('isSafeString', () => {
    it('should identify safe strings', () => {
      expect(utils.isSafeString('hello world')).toBe(true);
      expect(utils.isSafeString('user123')).toBe(true);
      expect(utils.isSafeString('')).toBe(true);
    });

    it('should identify dangerous strings', () => {
      expect(utils.isSafeString('<script>alert("xss")</script>')).toBe(false);
      expect(utils.isSafeString('javascript:alert("xss")')).toBe(false);
      expect(utils.isSafeString('onclick=alert("xss")')).toBe(false);
      expect(utils.isSafeString('<iframe src="evil.com">')).toBe(false);
    });

    it('should handle non-string input', () => {
      expect(utils.isSafeString(123)).toBe(false);
      expect(utils.isSafeString(null)).toBe(false);
      expect(utils.isSafeString(undefined)).toBe(false);
    });
  });

  describe('truncateString', () => {
    it('should truncate long strings', () => {
      const result = utils.truncateString('hello world', 5);
      expect(result).toBe('he...');
    });

    it('should not truncate short strings', () => {
      const result = utils.truncateString('hello', 10);
      expect(result).toBe('hello');
    });

    it('should handle empty string', () => {
      const result = utils.truncateString('', 5);
      expect(result).toBe('');
    });

    it('should handle non-string input', () => {
      const result = utils.truncateString(123, 5);
      expect(result).toBe('');
    });
  });

  describe('toTitleCase', () => {
    it('should convert to title case', () => {
      expect(utils.toTitleCase('hello world')).toBe('Hello World');
      expect(utils.toTitleCase('JOHN DOE')).toBe('John Doe');
      expect(utils.toTitleCase('user123')).toBe('User123');
    });

    it('should handle single word', () => {
      expect(utils.toTitleCase('hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(utils.toTitleCase('')).toBe('');
    });

    it('should handle non-string input', () => {
      expect(utils.toTitleCase(123)).toBe('');
    });
  });

  describe('generateHealthCheck', () => {
    it('should generate health check data', () => {
      const result = utils.generateHealthCheck();
      
      expect(result).toHaveProperty('status', 'healthy');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('memory');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('environment');
    });

    it('should include valid timestamp', () => {
      const result = utils.generateHealthCheck();
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include uptime', () => {
      const result = utils.generateHealthCheck();
      expect(typeof result.uptime).toBe('number');
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });
  });
});
