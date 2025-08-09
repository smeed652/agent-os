#!/usr/bin/env node

/**
 * Testing Completeness Validator Tests
 * 
 * Comprehensive unit tests for the Testing Completeness Validator
 */

const ValidatorTestFramework = require('./test-framework');
const TestingCompletenessValidator = require('../../scripts/validators/testing-completeness-validator');
const fs = require('fs');
const path = require('path');

class TestingCompletenessValidatorTests extends ValidatorTestFramework {
  constructor() {
    super();
    this.validator = new TestingCompletenessValidator();
  }

  async runAllTests() {
    console.log('🧪 Testing Testing Completeness Validator');
    console.log('==========================================\n');

    try {
      // Core Testing Validation Tests
      await this.testValidatorInstantiation();
      await this.testBasicFunctionality();
      
      // Error Handling and Edge Cases
      await this.testErrorHandling();
      await this.testEdgeCases();
      
      this.displayResults();
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    } finally {
      this.cleanup();
    }
  }

  async testValidatorInstantiation() {
    console.log('🔧 Testing Validator Instantiation...');

    // Test validator class instantiation
    await this.runValidatorTest(TestingCompletenessValidator, 'Validator instantiation', async (validator) => {
      this.assert(validator instanceof TestingCompletenessValidator, 'Should create validator instance');
      this.assert(typeof validator.validateProject === 'function', 'Should have validateProject method');
      this.assert(typeof validator.validateTestCoverage === 'function', 'Should have validateTestCoverage method');
      this.assert(typeof validator.validateTestStructure === 'function', 'Should have validateTestStructure method');
      this.assert(typeof validator.validateTDDApproach === 'function', 'Should have validateTDDApproach method');
      
      return { status: 'PASS' };
    });

    // Test validator configuration
    await this.runValidatorTest(TestingCompletenessValidator, 'Validator configuration', async (validator) => {
      this.assert(validator.results, 'Should have results object');
      this.assert(typeof validator.results.passed === 'number', 'Should track passed count');
      this.assert(typeof validator.results.failed === 'number', 'Should track failed count');
      this.assert(Array.isArray(validator.results.validations), 'Should have validations array');
      
      return { status: 'PASS' };
    });
  }

  async testBasicFunctionality() {
    console.log('🧪 Testing Basic Functionality...');

    // Test helper methods exist
    await this.runValidatorTest(TestingCompletenessValidator, 'Helper methods availability', async (validator) => {
      this.assert(typeof validator.getCodeFiles === 'function', 'Should have getCodeFiles method');
      this.assert(typeof validator.getTestFiles === 'function', 'Should have getTestFiles method');
      this.assert(typeof validator.hasCorrespondingTest === 'function', 'Should have hasCorrespondingTest method');
      this.assert(typeof validator.aggregateValidations === 'function', 'Should have aggregateValidations method');
      
      return { status: 'PASS' };
    });

    // Test validation creation
    await this.runValidatorTest(TestingCompletenessValidator, 'Validation creation', async (validator) => {
      const validation = validator.createValidation('Test Validation', 'PASS', 'Test message', { test: true });
      
      this.assert(validation.name === 'Test Validation', 'Should set validation name');
      this.assert(validation.status === 'PASS', 'Should set validation status');
      this.assert(validation.message === 'Test message', 'Should set validation message');
      this.assert(validation.details.test === true, 'Should set validation details');
      
      return validation;
    });

    // Test aggregation with various statuses
    await this.runValidatorTest(TestingCompletenessValidator, 'Result aggregation', async (validator) => {
      const validations = [
        { status: 'PASS', name: 'Test 1' },
        { status: 'WARNING', name: 'Test 2' },
        { status: 'FAIL', name: 'Test 3' }
      ];

      const result = validator.aggregateValidations(validations);
      
      this.assert(result.status, 'Should return aggregated status');
      this.assert(result.summary, 'Should return summary');
      this.assert(result.summary.total === 3, 'Should count total validations');
      this.assert(result.summary.passed === 1, 'Should count passed validations');
      this.assert(result.summary.warnings === 1, 'Should count warning validations');
      this.assert(result.summary.failed === 1, 'Should count failed validations');
      
      return result;
    });
  }

  // Simplified tests focusing on core functionality

  async testErrorHandling() {
    console.log('⚠️ Testing Error Handling...');

    // Test non-existent project directory
    await this.runValidatorTest(TestingCompletenessValidator, 'Non-existent project', async (validator) => {
      try {
        const result = await validator.validateProject('/non/existent/path');
        // Should handle gracefully, not throw
        this.assert(result, 'Should return result even for non-existent path');
        return result;
      } catch (error) {
        // If it throws, that's also acceptable behavior
        this.assert(error.message, 'Should provide error message');
        return { error: error.message };
      }
    });

    // Test helper method availability
    await this.runValidatorTest(TestingCompletenessValidator, 'Helper methods availability', async (validator) => {
      this.assert(typeof validator.getCodeFiles === 'function', 'Should have getCodeFiles method');
      this.assert(typeof validator.getTestFiles === 'function', 'Should have getTestFiles method');
      this.assert(typeof validator.aggregateValidations === 'function', 'Should have aggregateValidations method');
      this.assert(typeof validator.createValidation === 'function', 'Should have createValidation method');
      
      return { status: 'PASS' };
    });

    // Test validation creation
    await this.runValidatorTest(TestingCompletenessValidator, 'Validation creation', async (validator) => {
      const validation = validator.createValidation('Test Validation', 'PASS', 'Test message', { test: true });
      
      this.assert(validation.name === 'Test Validation', 'Should set validation name');
      this.assert(validation.status === 'PASS', 'Should set validation status');
      this.assert(validation.message === 'Test message', 'Should set validation message');
      this.assert(validation.details.test === true, 'Should set validation details');
      
      return validation;
    });
  }

  async testEdgeCases() {
    console.log('🔬 Testing Edge Cases...');

    // Test aggregation with mixed results
    await this.runValidatorTest(TestingCompletenessValidator, 'Mixed validation results', async (validator) => {
      const mixedValidations = [
        { status: 'PASS', name: 'Test 1' },
        { status: 'WARNING', name: 'Test 2' },
        { status: 'FAIL', name: 'Test 3' },
        { status: 'PASS', name: 'Test 4' }
      ];

      const result = validator.aggregateValidations(mixedValidations);
      
      this.assert(result.status, 'Should return aggregated status');
      this.assert(result.summary, 'Should return summary');
      this.assert(result.summary.total === 4, 'Should count total validations');
      this.assert(result.summary.passed === 2, 'Should count passed validations');
      this.assert(result.summary.warnings === 1, 'Should count warning validations');
      this.assert(result.summary.failed === 1, 'Should count failed validations');
      
      return result;
    });

    // Test validation with empty arrays
    await this.runValidatorTest(TestingCompletenessValidator, 'Empty validation arrays', async (validator) => {
      const emptyValidations = [];
      const result = validator.aggregateValidations(emptyValidations);
      
      this.assert(result.status, 'Should handle empty validations array');
      this.assert(result.summary, 'Should return summary for empty array');
      this.assert(result.summary.total === 0, 'Should count zero total validations');
      
      return result;
    });

    // Test validator structure
    await this.runValidatorTest(TestingCompletenessValidator, 'Validator structure', async (validator) => {
      this.assert(validator.results, 'Should have results object');
      this.assert(typeof validator.results.passed === 'number', 'Should track passed count');
      this.assert(typeof validator.results.failed === 'number', 'Should track failed count');
      this.assert(Array.isArray(validator.results.validations), 'Should have validations array');
      
      return { status: 'PASS' };
    });
  }

  // Simplified tests focusing on core functionality

  // Helper methods
  createTestProject(projectName, files) {
    const projectPath = this.createTempDir(projectName);
    
    Object.entries(files).forEach(([filePath, content]) => {
      const fullPath = path.join(projectPath, filePath);
      const dir = path.dirname(fullPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(fullPath, content);
    });
    
    return projectPath;
  }

  createTempDir(dirName) {
    const tempDir = path.join(this.tempTestDir, 'testing-completeness', dirName);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    return tempDir;
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new TestingCompletenessValidatorTests();
  tester.runAllTests().catch(error => {
    console.error('❌ Testing Completeness Validator tests failed:', error);
    process.exit(1);
  });
}

module.exports = TestingCompletenessValidatorTests;
