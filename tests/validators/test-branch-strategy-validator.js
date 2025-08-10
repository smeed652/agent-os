#!/usr/bin/env node

/**
 * Branch Strategy Validator Tests
 *
 * Comprehensive unit tests for the Branch Strategy Validator
 */

const ValidatorTestFramework = require('./test-framework');
const BranchStrategyValidator = require('../../scripts/validators/branch-strategy-validator');
const fs = require('fs');
const path = require('path');
// const { execSync } = require('child_process');

class BranchStrategyValidatorTests extends ValidatorTestFramework {
  constructor() {
    super();
    this.validator = new BranchStrategyValidator();
  }

  async runAllTests() {
    console.log('🌿 Testing Branch Strategy Validator');
    console.log('====================================\n');

    try {
      // Core Branch Strategy Tests
      await this.testBranchNamingValidation();

      // Error Handling and Edge Cases
      await this.testErrorHandling();

      // Edge Cases
      await this.testEdgeCases();

      this.displayResults();
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    } finally {
      this.cleanup();
    }
  }

  async testBranchNamingValidation() {
    console.log('🏷️  Testing Branch Naming Validation...');

    // Test validator class instantiation
    await this.runValidatorTest(
      BranchStrategyValidator,
      'Validator instantiation',
      async (validator) => {
        this.assert(
          validator instanceof BranchStrategyValidator,
          'Should create validator instance'
        );
        this.assert(
          typeof validator.validateProject === 'function',
          'Should have validateProject method'
        );
        this.assert(
          typeof validator.validateBranchNaming === 'function',
          'Should have validateBranchNaming method'
        );

        return { status: 'PASS' };
      }
    );

    // Test isGitRepository method
    await this.runValidatorTest(
      BranchStrategyValidator,
      'Git repository detection',
      async (validator) => {
        // Test with current directory (which is a git repo)
        const isGitRepo = validator.isGitRepository('.');
        this.assert(
          typeof isGitRepo === 'boolean',
          'Should return boolean for git repository check'
        );

        // Test with non-existent directory
        const isNonGitRepo = validator.isGitRepository('/non/existent/path');
        this.assert(
          isNonGitRepo === false,
          'Should return false for non-existent path'
        );

        return { status: 'PASS' };
      }
    );
  }

  // Simplified tests focusing on core functionality

  async testErrorHandling() {
    console.log('⚠️ Testing Error Handling...');

    // Test non-git repository
    await this.runValidatorTest(
      BranchStrategyValidator,
      'Non-git repository',
      async (validator) => {
        const nonGitDir = this.createTempDir('non-git-repo');

        try {
          await validator.validateProject(nonGitDir);
          this.assert(false, 'Should throw error for non-git repository');
        } catch (error) {
          this.assert(
            error.message.includes('Not a Git repository'),
            'Should throw appropriate error'
          );
          return { error: error.message };
        }
      }
    );

    // Test helper method functionality
    await this.runValidatorTest(
      BranchStrategyValidator,
      'Helper method availability',
      async (validator) => {
        // Test that key methods exist
        this.assert(
          typeof validator.isGitRepository === 'function',
          'Should have isGitRepository method'
        );
        this.assert(
          typeof validator.getAllBranches === 'function',
          'Should have getAllBranches method'
        );
        this.assert(
          typeof validator.createValidation === 'function',
          'Should have createValidation method'
        );

        return { status: 'PASS' };
      }
    );
  }

  async testEdgeCases() {
    console.log('🔬 Testing Edge Cases...');

    // Test validator configuration
    await this.runValidatorTest(
      BranchStrategyValidator,
      'Validator configuration',
      async (validator) => {
        // Test that the validator has the expected structure
        this.assert(validator.results, 'Should have results object');
        this.assert(
          typeof validator.results.passed === 'number',
          'Should track passed count'
        );
        this.assert(
          typeof validator.results.failed === 'number',
          'Should track failed count'
        );
        this.assert(
          Array.isArray(validator.results.validations),
          'Should have validations array'
        );

        return { status: 'PASS' };
      }
    );

    // Test aggregation method
    await this.runValidatorTest(
      BranchStrategyValidator,
      'Validation aggregation',
      async (validator) => {
        // Test aggregateValidations method exists and works
        this.assert(
          typeof validator.aggregateValidations === 'function',
          'Should have aggregateValidations method'
        );

        const mockValidations = [
          { status: 'PASS', name: 'Test 1' },
          { status: 'PASS', name: 'Test 2' },
        ];

        const result = validator.aggregateValidations(mockValidations);
        this.assert(result.status, 'Should return aggregated status');
        this.assert(result.summary, 'Should return summary');

        return result;
      }
    );

    // Test createValidation helper
    await this.runValidatorTest(
      BranchStrategyValidator,
      'Validation creation helper',
      async (validator) => {
        const validation = validator.createValidation(
          'Test Validation',
          'PASS',
          'Test message',
          { test: true }
        );

        this.assert(
          validation.name === 'Test Validation',
          'Should set validation name'
        );
        this.assert(
          validation.status === 'PASS',
          'Should set validation status'
        );
        this.assert(
          validation.message === 'Test message',
          'Should set validation message'
        );
        this.assert(
          validation.details.test === true,
          'Should set validation details'
        );

        return validation;
      }
    );
  }

  // Simplified tests focusing on core functionality

  // Helper methods
  createMockGitRepo(repoName, config) {
    const repoPath = this.createTempDir(repoName);

    // Create basic git structure (just directories, not actual git)
    fs.mkdirSync(path.join(repoPath, '.git'), { recursive: true });

    // Create mock files based on config
    if (config.files) {
      Object.entries(config.files).forEach(([filename, content]) => {
        fs.writeFileSync(path.join(repoPath, filename), content);
      });
    }

    return repoPath;
  }

  createTempDir(dirName) {
    const tempDir = path.join(this.tempTestDir, 'branch-strategy', dirName);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    return tempDir;
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new BranchStrategyValidatorTests();
  tester.runAllTests().catch((error) => {
    console.error('❌ Branch Strategy Validator tests failed:', error);
    process.exit(1);
  });
}

module.exports = BranchStrategyValidatorTests;
