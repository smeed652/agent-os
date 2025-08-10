/**
 * Jest Test Setup File
 * 
 * This file runs before all tests and sets up the testing environment.
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3002'; // Changed from 3001 to avoid conflicts
process.env.LOG_LEVEL = 'error';

// Global test utilities
global.testUtils = {
  // Generate test data
  generateTestUserId: (length = 8) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  // Wait for specified time
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Generate random test data
  randomString: (length = 10) => {
    return Math.random().toString(36).substring(2, length + 2);
  },
  
  // Mock request object
  mockRequest: (overrides = {}) => ({
    method: 'GET',
    path: '/',
    ip: '127.0.0.1',
    params: {},
    query: {},
    body: {},
    headers: {},
    ...overrides
  }),
  
  // Mock response object
  mockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  }
};

// Console mock for tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Process mock for tests
global.process = {
  ...process,
  exit: jest.fn(),
  on: jest.fn()
};

// Test timeout configuration
jest.setTimeout(10000);

// Global beforeAll hook
beforeAll(() => {
  // Setup any global test environment
  console.log('🧪 Setting up test environment...');
});

// Global afterAll hook
afterAll(() => {
  // Cleanup any global test environment
  console.log('🧹 Cleaning up test environment...');
});

// Global beforeEach hook
beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

// Global afterEach hook
afterEach(() => {
  // Cleanup after each test
  jest.restoreAllMocks();
});
