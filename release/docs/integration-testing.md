# Integration Testing Guide

## Overview

This guide covers the unified integration testing framework that combines regular Jest tests, chaos monkey testing, and security validation into a comprehensive testing solution.

## Framework Architecture

### Test Integration Class
```javascript
// scripts/test-integration.js
class TestIntegration {
  constructor() {
    this.results = {
      regularTests: null,
      chaosTests: null,
      securityTests: null,
      overall: {
        status: 'unknown',
        score: 0,
        vulnerabilities: 0,
        recommendations: []
      }
    };
  }
  
  async runAllTests() {
    await this.runRegularTests();
    await this.runChaosTests();
    await this.runSecurityTests();
    this.analyzeResults();
    this.generateReport();
    this.displaySummary();
  }
}
```

## Test Categories

### 1. Regular Tests (Jest)
- Unit tests for individual functions
- Integration tests for API endpoints
- Coverage reporting and analysis
- Standard Jest output and assertions

### 2. Chaos Tests
- Memory pressure testing
- CPU spike simulation
- Network latency testing
- Resource exhaustion scenarios
- Load and stress testing
- Memory leak detection

### 3. Security Tests
- SQL injection attempts
- XSS attack vectors
- Path traversal testing
- Command injection
- Buffer overflow testing
- Authentication bypass
- Header injection
- Content type bypass

## Running Integration Tests

### Basic Commands
```bash
# Run all integration tests
npm run test:integration

# Run specific test categories
npm run test:integration:regular    # Jest tests only
npm run test:integration:chaos      # Chaos tests only
npm run test:integration:security   # Security tests only
npm run test:integration:all        # All integration tests

# Comprehensive testing
npm run test:comprehensive
```

### CLI Interface
```bash
# Direct script execution
node scripts/test-integration.js all
node scripts/test-integration.js regular
node scripts/test-integration.js chaos
node scripts/test-integration.js security
```

## Test Results Analysis

### Scoring System
- **EXCELLENT**: 90-100 points, 0 vulnerabilities
- **GOOD**: 80-89 points, 0-2 vulnerabilities
- **FAIR**: 70-79 points, 3-5 vulnerabilities
- **POOR**: 60-69 points, 6-10 vulnerabilities
- **CRITICAL**: Below 60 points, 10+ vulnerabilities

### Metrics Calculation
```javascript
// Overall score calculation
const score = (
  (regularTests.passRate * 0.4) +      // 40% weight
  (chaosTests.successRate * 0.3) +     // 30% weight
  (securityTests.securityScore * 0.3)   // 30% weight
);
```

## Report Generation

### JSON Reports
- `test-integration-report.json` - Comprehensive results
- `chaos-monkey-report.json` - Chaos testing results
- `security-chaos-report.json` - Security testing results

### Console Output
- Real-time test progress
- Summary statistics
- Risk assessment
- Improvement recommendations

## Configuration

### Test Parameters
```javascript
const testConfig = {
  regularTests: {
    timeout: 30000,
    coverage: true,
    verbose: false
  },
  chaosTests: {
    duration: 30000,
    concurrentRequests: 10,
    memoryLeakSize: 1024 * 1024
  },
  securityTests: {
    payloadCount: 50,
    timeout: 5000,
    retryAttempts: 3
  }
};
```

### Environment Variables
```bash
# .env
NODE_ENV=production
TEST_TIMEOUT=30000
CHAOS_TEST_DURATION=30000
SECURITY_TEST_PAYLOADS=50
```

## Continuous Integration

### GitHub Actions
```yaml
# .github/workflows/integration-test.yml
name: Integration Testing
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run integration tests
        run: npm run test:integration:all
      - name: Upload test reports
        uses: actions/upload-artifact@v2
        with:
          name: test-reports
          path: |
            test-integration-report.json
            chaos-monkey-report.json
            security-chaos-report.json
```

### Scheduled Testing
```bash
# Daily comprehensive testing
0 2 * * * cd /path/to/project && npm run test:comprehensive

# Weekly security testing
0 3 * * 0 cd /path/to/project && npm run test:integration:security
```

## Best Practices

### 1. Test Organization
- Group related tests logically
- Use descriptive test names
- Implement proper test isolation
- Clean up resources after tests

### 2. Error Handling
- Graceful failure handling
- Meaningful error messages
- Proper cleanup on failures
- Retry mechanisms for flaky tests

### 3. Performance Considerations
- Optimize test execution time
- Use appropriate timeouts
- Implement test parallelization
- Monitor resource usage

### 4. Security Testing
- Use realistic attack payloads
- Test edge cases thoroughly
- Validate security headers
- Check for information disclosure

## Troubleshooting

### Common Issues
1. **Test Timeouts**: Increase timeout values or optimize slow tests
2. **Memory Issues**: Reduce test payload sizes or implement cleanup
3. **Network Errors**: Check target application availability
4. **Permission Issues**: Verify file access and execution permissions

### Debug Mode
```bash
# Enable verbose output
DEBUG=true npm run test:integration

# Run with additional logging
node scripts/test-integration.js all --verbose --debug
```

## Extending the Framework

### Adding New Test Types
```javascript
// Add new test category
async runCustomTests() {
  console.log('🔧 Running custom tests...');
  
  try {
    // Implement custom test logic
    const results = await this.executeCustomTests();
    this.results.customTests = results;
    
  } catch (error) {
    console.error('Custom tests failed:', error.message);
    this.results.customTests = { error: error.message };
  }
}
```

### Custom Validators
```javascript
// Create custom validation logic
class CustomValidator {
  static validateResults(results) {
    // Implement custom validation
    return {
      isValid: true,
      score: 100,
      issues: []
    };
  }
}
```

## Resources

- [Jest Testing Framework](https://jestjs.io/)
- [Node.js Testing Best Practices](https://nodejs.org/en/docs/guides/testing-and-debugging/)
- [Integration Testing Strategies](https://martinfowler.com/articles/microservice-testing/)
- [Chaos Engineering Principles](https://principlesofchaos.org/)
