# Agent OS Test Suite

Comprehensive testing system for Agent OS validation and lifecycle management.

## Quick Start

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:validators
npm run test:lifecycle
```

## Test Structure

### 🧪 Test Suites

**1. Validator Tests** (`test:validators`)
- Tests post-spec creation validation
- Tests parent task completion validation  
- Validates error detection and reporting
- Located: `tests/validators/`

**2. Lifecycle Tests** (`test:lifecycle`)
- Tests lifecycle management system
- Validates dashboard generation
- Tests spec categorization
- Located: integrated in `scripts/test-lifecycle.js`

### 📊 Test Results

```
🧪 Agent OS Test Suite
======================

📋 Running Validator Tests...
✅ test-missing-required-files: PASS
✅ test-valid-complete-spec: PASS
Success Rate: 100%

📋 Running Lifecycle Tests...
✅ Lifecycle Management Test Complete!

🏁 Test Suite Summary
====================
Total Test Suites: 2
✅ Passed: 2
Success Rate: 100%
```

## Test Coverage

### Validator Testing
- ✅ **Directory Structure Validation**
  - YYYY-MM-DD-spec-name format
  - Kebab-case naming (≤5 words)
  - Proper location validation

- ✅ **Required Files Validation**
  - spec.md, spec-lite.md, tasks.md, status.md
  - sub-specs/technical-spec.md
  - Conditional files (database-schema.md, api-spec.md)

- ✅ **Content Structure Validation**
  - Required sections in each file
  - Proper header formats
  - Content organization

- ✅ **Content Quality Validation**
  - Overview length (1-2 sentences)
  - User stories format and count
  - Spec scope validation
  - TDD task structure

### Lifecycle Testing
- ✅ **Project Analysis**
  - Specs directory detection
  - Existing spec categorization

- ✅ **Setup Validation**
  - Dashboard file creation
  - Guide file generation
  - Directory structure setup

- ✅ **Dashboard Generation**
  - Status tracking
  - Summary calculations
  - File organization

## Configuration

### Test Configuration (`test-config.json`)
```json
{
  "testSuites": [
    {
      "name": "Validator Tests",
      "script": "test-validators.js",
      "enabled": true,
      "timeout": 30000
    }
  ],
  "reporting": {
    "verbose": true,
    "exitOnFailure": true
  }
}
```

### Test Scripts

**Master Test Runner** (`scripts/test-runner.js`)
- Orchestrates all test suites
- Provides unified output formatting
- Handles error reporting and exit codes

**Validator Tests** (`scripts/test-validators.js`)
- Comprehensive validation logic testing
- JSON-based expected output comparison
- Detailed error reporting

**Lifecycle Tests** (`scripts/test-lifecycle.js`)
- Tests lifecycle management functionality
- Dashboard generation validation
- Setup and configuration testing

## Adding Tests

### New Validator Tests

1. **Create test scenario:**
   ```
   tests/validators/scenarios/test-new-scenario/
   ├── input/
   │   └── .agent-os/specs/2025-08-09-test-spec/
   └── expected-output.json
   ```

2. **Define expected output:**
   ```json
   {
     "validation_status": "PASS",
     "summary": {
       "total_checks": 10,
       "passed_checks": 10,
       "failed_checks": 0
     }
   }
   ```

3. **Run tests:** `npm run test:validators`

### New Test Suites

1. **Create test script:** `scripts/test-[name].js`
2. **Update configuration:** Add to `test-config.json`
3. **Update test runner:** Add to `scripts/test-runner.js`
4. **Add npm script:** Update `package.json`

## Continuous Integration

### Exit Codes
- `0` - All tests passed
- `1` - One or more tests failed

### CI/CD Integration
```yaml
# Example GitHub Actions
- name: Run Agent OS Tests
  run: npm test
```

### Pre-commit Hook
```bash
#!/bin/sh
npm test
if [ $? -ne 0 ]; then
  echo "Tests failed. Commit aborted."
  exit 1
fi
```

## Debugging Failed Tests

### Individual Test Suites
```bash
# Debug validator tests
npm run test:validators

# Debug lifecycle tests  
npm run test:lifecycle
```

### Verbose Output
Tests automatically show detailed output including:
- Individual test results
- Error messages and stack traces
- Validation comparison details
- Fix recommendations

### Common Issues

**Test Directory Missing:**
```
Error: Tests directory not found: /path/to/tests/validators/scenarios
```
*Solution:* Ensure test scenarios exist in correct directory

**Expected Output Mismatch:**
```
Status mismatch: expected FAIL, got PASS
```
*Solution:* Update expected-output.json or fix validation logic

**Script Not Found:**
```
Test script not found: /path/to/script.js
```
*Solution:* Verify script exists and is executable

## Test Maintenance

### Regular Updates
- Update test scenarios when validators change
- Add tests for new validation rules
- Update expected outputs for format changes

### Coverage Goals
- ✅ 100% validator logic coverage
- ✅ All error conditions tested
- ✅ Edge cases validated
- ✅ Integration scenarios covered

## Benefits

### Quality Assurance
- Automated validation of Agent OS functionality
- Regression prevention for core workflows
- Consistent behavior verification

### Developer Confidence  
- Safe refactoring with test coverage
- Quick feedback on changes
- Reliable deployment validation

### Documentation
- Tests serve as executable specifications
- Clear examples of expected behavior
- Integration patterns demonstrated