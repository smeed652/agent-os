#!/usr/bin/env node

/**
 * Testing Completeness Validator
 * 
 * Validates test coverage, TDD approach, and testing best practices
 * according to Agent OS standards.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestingCompletenessValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      validations: []
    };
  }

  async validateProject(projectPath = '.') {
    const validations = [];
    
    // Core testing validations
    validations.push(await this.validateTestCoverage(projectPath));
    validations.push(await this.validateTestStructure(projectPath));
    validations.push(await this.validateTDDApproach(projectPath));
    validations.push(await this.validateTestTypes(projectPath));
    validations.push(await this.validateTestNaming(projectPath));
    validations.push(await this.validateTestRunner(projectPath));
    
    const overallResult = this.aggregateValidations(validations);
    
    return {
      projectPath: projectPath,
      status: overallResult.status,
      validations: validations,
      summary: overallResult.summary,
      recommendations: overallResult.recommendations,
      testStats: await this.getTestStatistics(projectPath)
    };
  }

  async validateTestCoverage(projectPath) {
    const codeFiles = this.getCodeFiles(projectPath);
    const testFiles = this.getTestFiles(projectPath);
    
    const coverageData = {
      totalCodeFiles: codeFiles.length,
      totalTestFiles: testFiles.length,
      coveredFiles: 0,
      uncoveredFiles: [],
      coverageRatio: 0
    };

    // Simple coverage check - test file exists for code file
    codeFiles.forEach(codeFile => {
      const hasTest = this.hasCorrespondingTest(codeFile, testFiles);
      if (hasTest) {
        coverageData.coveredFiles++;
      } else {
        coverageData.uncoveredFiles.push(path.relative(projectPath, codeFile));
      }
    });

    coverageData.coverageRatio = codeFiles.length > 0 
      ? (coverageData.coveredFiles / codeFiles.length) * 100 
      : 100;

    const status = coverageData.coverageRatio >= 80 ? 'PASS' : 
                  coverageData.coverageRatio >= 60 ? 'WARNING' : 'FAIL';
    
    const message = `Test coverage: ${coverageData.coverageRatio.toFixed(1)}% (${coverageData.coveredFiles}/${codeFiles.length} files)`;

    return this.createValidation('Test Coverage', status, message, {
      ...coverageData,
      recommendation: coverageData.coverageRatio < 80 
        ? 'Add tests for uncovered files to reach 80% coverage target'
        : null
    });
  }

  async validateTestStructure(projectPath) {
    const testFiles = this.getTestFiles(projectPath);
    const structureIssues = [];
    
    testFiles.forEach(testFile => {
      const content = fs.readFileSync(testFile, 'utf8');
      const relativePath = path.relative(projectPath, testFile);
      
      // Check for describe blocks
      const hasDescribe = /describe\s*\(/.test(content);
      if (!hasDescribe) {
        structureIssues.push({
          file: relativePath,
          issue: 'Missing describe blocks for test organization'
        });
      }

      // Check for it/test blocks
      const hasTests = /(?:it|test)\s*\(/.test(content);
      if (!hasTests) {
        structureIssues.push({
          file: relativePath,
          issue: 'No test cases found'
        });
      }

      // Check for setup/teardown
      const hasSetup = /(?:beforeEach|beforeAll|setUp)\s*\(/.test(content);
      const hasTeardown = /(?:afterEach|afterAll|tearDown)\s*\(/.test(content);
      
      if (!hasSetup && content.length > 500) {
        structureIssues.push({
          file: relativePath,
          issue: 'Consider adding setup blocks for complex tests'
        });
      }
    });

    const status = structureIssues.length === 0 ? 'PASS' : 'WARNING';
    const message = structureIssues.length === 0
      ? `All ${testFiles.length} test files well-structured`
      : `${structureIssues.length} test structure issues found`;

    return this.createValidation('Test Structure', status, message, {
      totalTestFiles: testFiles.length,
      issueCount: structureIssues.length,
      issues: structureIssues,
      recommendation: structureIssues.length > 0
        ? 'Organize tests with describe blocks and add setup/teardown as needed'
        : null
    });
  }

  async validateTDDApproach(projectPath) {
    // Check if specs exist and have corresponding tasks
    const specsDir = path.join(projectPath, '.agent-os', 'specs');
    if (!fs.existsSync(specsDir)) {
      return this.createValidation('TDD Approach', 'PASS', 
        'No specs directory - TDD validation not applicable');
    }

    const specs = fs.readdirSync(specsDir)
      .filter(item => fs.statSync(path.join(specsDir, item)).isDirectory());

    const tddIssues = [];
    
    specs.forEach(spec => {
      const tasksFile = path.join(specsDir, spec, 'tasks.md');
      if (fs.existsSync(tasksFile)) {
        const tasksContent = fs.readFileSync(tasksFile, 'utf8');
        
        // Check for TDD patterns in tasks
        const hasWriteTests = /write.*tests?/i.test(tasksContent);
        const hasTestFirst = /test.*first|tdd/i.test(tasksContent);
        const hasVerifyTests = /verify.*tests?.*pass/i.test(tasksContent);
        
        if (!hasWriteTests || !hasVerifyTests) {
          tddIssues.push({
            spec: spec,
            issue: 'Tasks do not follow TDD approach (missing write/verify test steps)'
          });
        }
      }
    });

    const status = tddIssues.length === 0 ? 'PASS' : 'WARNING';
    const message = tddIssues.length === 0
      ? `All ${specs.length} specs follow TDD approach`
      : `${tddIssues.length} specs missing TDD patterns in tasks`;

    return this.createValidation('TDD Approach', status, message, {
      totalSpecs: specs.length,
      tddCompliantSpecs: specs.length - tddIssues.length,
      issues: tddIssues,
      recommendation: tddIssues.length > 0
        ? 'Update task templates to include "write tests" and "verify tests pass" steps'
        : null
    });
  }

  async validateTestTypes(projectPath) {
    const testFiles = this.getTestFiles(projectPath);
    const testTypes = {
      unit: 0,
      integration: 0,
      e2e: 0,
      other: 0
    };

    testFiles.forEach(testFile => {
      const fileName = path.basename(testFile).toLowerCase();
      const content = fs.readFileSync(testFile, 'utf8').toLowerCase();
      
      if (fileName.includes('unit') || content.includes('unit test')) {
        testTypes.unit++;
      } else if (fileName.includes('integration') || content.includes('integration test')) {
        testTypes.integration++;
      } else if (fileName.includes('e2e') || fileName.includes('end-to-end') || 
                 content.includes('e2e') || content.includes('end-to-end')) {
        testTypes.e2e++;
      } else {
        testTypes.other++;
      }
    });

    const totalTests = Object.values(testTypes).reduce((sum, count) => sum + count, 0);
    const issues = [];

    // Check for balanced test types
    if (totalTests > 5) {
      if (testTypes.unit === 0) {
        issues.push('No unit tests found - consider adding unit tests for individual functions');
      }
      if (testTypes.integration === 0) {
        issues.push('No integration tests found - consider adding tests for component interactions');
      }
      if (testTypes.e2e === 0 && this.hasUserInterface(projectPath)) {
        issues.push('No E2E tests found - consider adding end-to-end tests for user workflows');
      }
    }

    const status = issues.length === 0 ? 'PASS' : 'WARNING';
    const message = issues.length === 0
      ? `Good test type distribution: ${testTypes.unit} unit, ${testTypes.integration} integration, ${testTypes.e2e} E2E`
      : `${issues.length} test type coverage issues`;

    return this.createValidation('Test Types', status, message, {
      testTypes: testTypes,
      totalTests: totalTests,
      issues: issues,
      recommendation: issues.length > 0
        ? 'Add missing test types for comprehensive coverage'
        : null
    });
  }

  async validateTestNaming(projectPath) {
    const testFiles = this.getTestFiles(projectPath);
    const namingIssues = [];

    testFiles.forEach(testFile => {
      const fileName = path.basename(testFile);
      const relativePath = path.relative(projectPath, testFile);
      
      // Check naming conventions
      const validPatterns = [
        /\.test\.(js|ts|jsx|tsx)$/,
        /\.spec\.(js|ts|jsx|tsx)$/,
        /_test\.(js|ts|jsx|tsx)$/,
        /_spec\.(js|ts|jsx|tsx)$/
      ];

      const hasValidNaming = validPatterns.some(pattern => pattern.test(fileName));
      if (!hasValidNaming) {
        namingIssues.push({
          file: relativePath,
          issue: 'Does not follow test file naming convention'
        });
      }

      // Check test descriptions
      const content = fs.readFileSync(testFile, 'utf8');
      const testDescriptions = content.match(/(?:it|test)\s*\(\s*['"`]([^'"`]+)['"`]/g) || [];
      
      testDescriptions.forEach(desc => {
        const description = desc.match(/['"`]([^'"`]+)['"`]/)[1];
        if (description.length < 10) {
          namingIssues.push({
            file: relativePath,
            issue: `Test description too short: "${description}"`
          });
        }
      });
    });

    const status = namingIssues.length === 0 ? 'PASS' : 'WARNING';
    const message = namingIssues.length === 0
      ? `All ${testFiles.length} test files follow naming conventions`
      : `${namingIssues.length} test naming issues found`;

    return this.createValidation('Test Naming', status, message, {
      totalTestFiles: testFiles.length,
      issueCount: namingIssues.length,
      issues: namingIssues,
      validPatterns: ['.test.js', '.spec.js', '_test.js', '_spec.js'],
      recommendation: namingIssues.length > 0
        ? 'Follow test naming conventions and use descriptive test descriptions'
        : null
    });
  }

  async validateTestRunner(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      return this.createValidation('Test Runner', 'WARNING', 
        'No package.json found - cannot validate test runner setup');
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const issues = [];

    // Check for test script
    if (!packageJson.scripts || !packageJson.scripts.test) {
      issues.push('No test script defined in package.json');
    }

    // Check for testing dependencies
    const testingDeps = [
      'jest', 'mocha', 'jasmine', 'vitest', 'cypress', 'playwright'
    ];
    
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    const hasTestingFramework = testingDeps.some(dep => allDeps[dep]);
    if (!hasTestingFramework) {
      issues.push('No testing framework found in dependencies');
    }

    // Check for test configuration
    const configFiles = [
      'jest.config.js', 'jest.config.json', '.jestrc',
      'mocha.opts', '.mocharc.json',
      'vitest.config.js', 'vitest.config.ts'
    ];

    const hasConfig = configFiles.some(config => 
      fs.existsSync(path.join(projectPath, config))
    );

    if (!hasConfig && hasTestingFramework) {
      issues.push('Testing framework found but no configuration file');
    }

    const status = issues.length === 0 ? 'PASS' : 'WARNING';
    const message = issues.length === 0
      ? 'Test runner properly configured'
      : `${issues.length} test runner configuration issues`;

    return this.createValidation('Test Runner', status, message, {
      hasTestScript: !!(packageJson.scripts && packageJson.scripts.test),
      hasTestingFramework: hasTestingFramework,
      hasConfig: hasConfig,
      issues: issues,
      recommendation: issues.length > 0
        ? 'Set up test script and testing framework with proper configuration'
        : null
    });
  }

  // Utility methods
  getCodeFiles(projectPath) {
    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.rb'];
    return this.getAllFiles(projectPath)
      .filter(file => {
        const ext = path.extname(file);
        return codeExtensions.includes(ext) && !this.isTestFile(file);
      });
  }

  getTestFiles(projectPath) {
    const testExtensions = ['.js', '.ts', '.jsx', '.tsx'];
    return this.getAllFiles(projectPath)
      .filter(file => {
        const ext = path.extname(file);
        return testExtensions.includes(ext) && this.isTestFile(file);
      });
  }

  getAllFiles(dirPath, files = []) {
    if (!fs.existsSync(dirPath)) return files;
    
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !this.shouldSkipDirectory(item)) {
        this.getAllFiles(fullPath, files);
      } else if (stat.isFile()) {
        files.push(fullPath);
      }
    });

    return files;
  }

  shouldSkipDirectory(dirName) {
    const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
    return skipDirs.includes(dirName);
  }

  isTestFile(filePath) {
    const fileName = path.basename(filePath).toLowerCase();
    const testPatterns = [
      /\.test\./,
      /\.spec\./,
      /_test\./,
      /_spec\./,
      /test.*\.js$/,
      /spec.*\.js$/
    ];
    
    return testPatterns.some(pattern => pattern.test(fileName));
  }

  hasCorrespondingTest(codeFile, testFiles) {
    const baseName = path.basename(codeFile, path.extname(codeFile));
    const codeDir = path.dirname(codeFile);
    
    return testFiles.some(testFile => {
      const testBaseName = path.basename(testFile)
        .replace(/\.(test|spec)\./, '.')
        .replace(/_(test|spec)\./, '.')
        .replace(path.extname(testFile), '');
      
      const testDir = path.dirname(testFile);
      
      // Same name and nearby location
      return testBaseName === baseName && (
        testDir === codeDir || 
        testDir.includes('test') || 
        testDir.includes('spec') ||
        codeDir.includes(testDir.split('/').pop())
      );
    });
  }

  hasUserInterface(projectPath) {
    const uiFiles = this.getAllFiles(projectPath)
      .filter(file => {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        return content.includes('render') || 
               content.includes('component') ||
               content.includes('html') ||
               file.includes('component');
      });
    
    return uiFiles.length > 0;
  }

  async getTestStatistics(projectPath) {
    const testFiles = this.getTestFiles(projectPath);
    let totalTests = 0;
    
    testFiles.forEach(testFile => {
      const content = fs.readFileSync(testFile, 'utf8');
      const testMatches = content.match(/(?:it|test)\s*\(/g) || [];
      totalTests += testMatches.length;
    });

    return {
      testFiles: testFiles.length,
      totalTests: totalTests,
      averageTestsPerFile: testFiles.length > 0 ? (totalTests / testFiles.length).toFixed(1) : 0
    };
  }

  createValidation(name, status, message, details = {}) {
    return {
      name: name,
      status: status,
      message: message,
      details: details
    };
  }

  aggregateValidations(validations) {
    const failed = validations.filter(v => v.status === 'FAIL').length;
    const warnings = validations.filter(v => v.status === 'WARNING').length;
    const passed = validations.filter(v => v.status === 'PASS').length;

    const overallStatus = failed > 0 ? 'FAIL' : warnings > 0 ? 'WARNING' : 'PASS';
    
    const recommendations = validations
      .filter(v => v.details && v.details.recommendation)
      .map(v => v.details.recommendation);

    return {
      status: overallStatus,
      summary: {
        total: validations.length,
        passed: passed,
        warnings: warnings,
        failed: failed
      },
      recommendations: recommendations
    };
  }

  displayResults(result) {
    console.log('\n🧪 Testing Completeness Validation Results');
    console.log('==========================================\n');

    const statusIcon = result.status === 'PASS' ? '✅' : 
                      result.status === 'WARNING' ? '⚠️' : '❌';
    
    console.log(`${statusIcon} Overall Testing Status: ${result.status}\n`);
    console.log(`📁 Project: ${path.basename(result.projectPath)}`);
    console.log(`📊 Test Files: ${result.testStats.testFiles}`);
    console.log(`🧪 Total Tests: ${result.testStats.totalTests}`);
    console.log(`📈 Avg Tests/File: ${result.testStats.averageTestsPerFile}\n`);

    result.validations.forEach(validation => {
      const icon = validation.status === 'PASS' ? '  ✓' : 
                  validation.status === 'WARNING' ? '  ⚠' : '  ✗';
      console.log(`${icon} ${validation.name}: ${validation.message}`);
      
      if (validation.details.uncoveredFiles && validation.details.uncoveredFiles.length > 0) {
        console.log('    Uncovered files:');
        validation.details.uncoveredFiles.slice(0, 5).forEach(file => {
          console.log(`      - ${file}`);
        });
        if (validation.details.uncoveredFiles.length > 5) {
          console.log(`      - ... and ${validation.details.uncoveredFiles.length - 5} more`);
        }
      }
    });

    if (result.recommendations.length > 0) {
      console.log('\n💡 Testing Recommendations:');
      result.recommendations.forEach(rec => {
        console.log(`   - ${rec}`);
      });
    }

    console.log('\n📊 Summary');
    console.log('----------');
    console.log(`Total Validations: ${result.summary.total}`);
    console.log(`✅ Passed: ${result.summary.passed}`);
    console.log(`⚠️ Warnings: ${result.summary.warnings}`);
    console.log(`❌ Failed: ${result.summary.failed}\n`);
  }
}

// CLI usage
if (require.main === module) {
  const validator = new TestingCompletenessValidator();
  const projectPath = process.argv[2] || '.';

  (async () => {
    try {
      const result = await validator.validateProject(projectPath);
      validator.displayResults(result);
      
      const hasFailures = result.status === 'FAIL';
      process.exit(hasFailures ? 1 : 0);
      
    } catch (error) {
      console.error('❌ Testing completeness validation failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = TestingCompletenessValidator;
