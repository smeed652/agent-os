#!/usr/bin/env node

/**
 * TDD Validator
 *
 * Validates that projects follow Test-Driven Development practices correctly.
 * Checks test coverage, test quality, and TDD workflow compliance.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TDDValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.report = {
      overallStatus: 'UNKNOWN',
      testCoverage: 0,
      testQuality: 'UNKNOWN',
      tddWorkflow: 'UNKNOWN',
      issues: [],
      recommendations: [],
      score: 0,
    };
  }

  async validate() {
    console.log('🧪 TDD Validation Starting...\n');

    try {
      await this.checkProjectStructure();
      await this.validateTestCoverage();
      await this.validateTestQuality();
      await this.validateTDDWorkflow();
      await this.generateReport();
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      // Only exit if not in test environment
      if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
      }
      throw error; // Re-throw for testing
    }
  }

  async checkProjectStructure() {
    console.log('📁 Checking project structure...');

    const requiredDirs = ['src', 'tests'];
    const missingDirs = requiredDirs.filter(
      (dir) => !fs.existsSync(path.join(this.projectRoot, dir))
    );

    if (missingDirs.length > 0) {
      this.report.issues.push(
        `Missing required directories: ${missingDirs.join(', ')}`
      );
    }

    // Check for test configuration files
    const testConfigs = [
      'jest.config.js',
      'jest.config.ts',
      'cypress.config.js',
      'cypress.config.ts',
    ];
    const hasTestConfig = testConfigs.some((config) =>
      fs.existsSync(path.join(this.projectRoot, config))
    );

    if (!hasTestConfig) {
      this.report.issues.push(
        'No test configuration found (Jest, Cypress, etc.)'
      );
    }

    // Check package.json for test scripts
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const testScripts = packageJson.scripts
        ? Object.keys(packageJson.scripts).filter((key) => key.includes('test'))
        : [];

      if (testScripts.length === 0) {
        this.report.issues.push('No test scripts found in package.json');
      }
    }
  }

  async validateTestCoverage() {
    console.log('📊 Validating test coverage...');

    try {
      // Try to run test coverage
      const coverageOutput = execSync('npm run test:coverage', {
        cwd: this.projectRoot,
        encoding: 'utf8',
        stdio: 'pipe',
      });

      // Parse coverage output (this is a simplified version)
      const coverageMatch = coverageOutput.match(
        /All files\s+\|\s+(\d+\.\d+)%/
      );
      if (coverageMatch) {
        this.report.testCoverage = parseFloat(coverageMatch[1]);

        if (this.report.testCoverage >= 90) {
          this.report.testQuality = 'EXCELLENT';
          this.report.score += 30;
        } else if (this.report.testCoverage >= 80) {
          this.report.testQuality = 'GOOD';
          this.report.score += 20;
        } else if (this.report.testCoverage >= 70) {
          this.report.testQuality = 'FAIR';
          this.report.score += 10;
        } else {
          this.report.testQuality = 'POOR';
          this.report.recommendations.push(
            `Increase test coverage from ${this.report.testCoverage}% to at least 90%`
          );
        }
      }
    } catch (error) {
      this.report.issues.push(
        'Could not run test coverage - check test configuration'
      );
      this.report.testQuality = 'UNKNOWN';
    }
  }

  async validateTestQuality() {
    console.log('🔍 Analyzing test quality...');

    const testFiles = this.findTestFiles();
    let qualityIssues = 0;
    let totalTests = 0;

    testFiles.forEach((testFile) => {
      const content = fs.readFileSync(testFile, 'utf8');
      const issues = this.analyzeTestFile(content);
      qualityIssues += issues.length;
      totalTests += this.countTests(content);
    });

    if (qualityIssues === 0 && totalTests > 0) {
      this.report.testQuality = 'EXCELLENT';
      this.report.score += 25;
    } else if (qualityIssues < totalTests * 0.1) {
      this.report.testQuality = 'GOOD';
      this.report.score += 20;
    } else if (qualityIssues < totalTests * 0.2) {
      this.report.testQuality = 'FAIR';
      this.report.score += 15;
    } else {
      this.report.testQuality = 'POOR';
      this.report.score += 5;
    }

    if (qualityIssues > 0) {
      this.report.recommendations.push(
        `Fix ${qualityIssues} test quality issues`
      );
    }
  }

  async validateTDDWorkflow() {
    console.log('🔄 Validating TDD workflow...');

    const sourceFiles = this.findSourceFiles();
    const testFiles = this.findTestFiles();

    let tddCompliance = 0;
    let totalSourceFiles = 0;

    sourceFiles.forEach((sourceFile) => {
      const correspondingTestFile = this.findCorrespondingTestFile(
        sourceFile,
        testFiles
      );

      if (correspondingTestFile) {
        const sourceStats = fs.statSync(sourceFile);
        const testStats = fs.statSync(correspondingTestFile);

        // Check if test file was created before or around the same time as source
        if (testStats.mtime <= sourceStats.mtime) {
          tddCompliance++;
        }
        totalSourceFiles++;
      }
    });

    if (tddCompliance === totalSourceFiles && totalSourceFiles > 0) {
      this.report.tddWorkflow = 'EXCELLENT';
      this.report.score += 25;
    } else if (tddCompliance >= totalSourceFiles * 0.8) {
      this.report.tddWorkflow = 'GOOD';
      this.report.score += 20;
    } else if (tddCompliance >= totalSourceFiles * 0.6) {
      this.report.tddWorkflow = 'FAIR';
      this.report.score += 15;
    } else {
      this.report.tddWorkflow = 'POOR';
      this.report.score += 5;
    }

    if (tddCompliance < totalSourceFiles) {
      this.report.recommendations.push(
        `Improve TDD workflow - ${totalSourceFiles - tddCompliance} files need tests written first`
      );
    }
  }

  findTestFiles() {
    const testFiles = [];
    const searchDirs = ['tests', 'src', '__tests__'];

    searchDirs.forEach((dir) => {
      if (fs.existsSync(path.join(this.projectRoot, dir))) {
        this.walkDir(path.join(this.projectRoot, dir), (filePath) => {
          if (
            filePath.includes('.test.') ||
            filePath.includes('.spec.') ||
            filePath.includes('Test')
          ) {
            testFiles.push(filePath);
          }
        });
      }
    });

    return testFiles;
  }

  findSourceFiles() {
    const sourceFiles = [];
    const searchDirs = ['src', 'lib', 'app'];

    searchDirs.forEach((dir) => {
      if (fs.existsSync(path.join(this.projectRoot, dir))) {
        this.walkDir(path.join(this.projectRoot, dir), (filePath) => {
          if (
            filePath.match(/\.(js|ts|jsx|tsx)$/) &&
            !filePath.includes('.test.') &&
            !filePath.includes('.spec.')
          ) {
            sourceFiles.push(filePath);
          }
        });
      }
    });

    return sourceFiles;
  }

  walkDir(dir, callback) {
    if (fs.statSync(dir).isDirectory()) {
      fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          this.walkDir(filePath, callback);
        } else {
          callback(filePath);
        }
      });
    }
  }

  findCorrespondingTestFile(sourceFile, testFiles) {
    const sourceName = path.basename(sourceFile, path.extname(sourceFile));
    const sourceDir = path.dirname(sourceFile);

    // Look for test file in same directory
    const sameDirTest = testFiles.find(
      (testFile) =>
        path.dirname(testFile) === sourceDir && testFile.includes(sourceName)
    );

    if (sameDirTest) return sameDirTest;

    // Look for test file in tests directory
    const testsDirTest = testFiles.find(
      (testFile) =>
        testFile.includes(sourceName) &&
        (testFile.includes('tests/') || testFile.includes('__tests__/'))
    );

    return testsDirTest;
  }

  analyzeTestFile(content) {
    const issues = [];

    // Check for poor test names
    const poorTestNames = content.match(
      /it\s*\(\s*['"`](should work|test|works?|ok)['"`]/gi
    );
    if (poorTestNames) {
      issues.push(
        `Poor test names found: ${poorTestNames.length} tests have vague names`
      );
    }

    // Check for tests without assertions - count approach excluding comments
    const testCount = this.countTests(content);

    // Remove commented lines before counting assertions
    const contentWithoutComments = content
      .split('\n')
      .filter((line) => !line.trim().startsWith('//'))
      .join('\n');

    const linesWithExpect = (contentWithoutComments.match(/expect\s*\(/g) || [])
      .length;
    const linesWithAssert = (contentWithoutComments.match(/assert\s*\(/g) || [])
      .length;
    const totalAssertions = linesWithExpect + linesWithAssert;

    if (testCount > 0 && totalAssertions < testCount) {
      const testsWithoutAssertions = testCount - totalAssertions;
      issues.push(
        `${testsWithoutAssertions} tests appear to have no assertions`
      );
    }

    // Check for test interdependence
    if (content.includes('beforeAll') || content.includes('afterAll')) {
      issues.push(
        'Tests may have interdependence - review beforeAll/afterAll usage'
      );
    }

    return issues;
  }

  countTests(content) {
    const testMatches = content.match(/it\s*\(/g);
    return testMatches ? testMatches.length : 0;
  }

  async generateReport() {
    console.log('📋 Generating TDD validation report...\n');

    // Determine overall status
    if (this.report.score >= 80) {
      this.report.overallStatus = 'TDD COMPLIANT';
    } else if (this.report.score >= 60) {
      this.report.overallStatus = 'PARTIALLY COMPLIANT';
    } else {
      this.report.overallStatus = 'NON-COMPLIANT';
    }

    // Display report
    console.log('TDD Validation Report');
    console.log('====================\n');

    console.log(`Overall Status: ${this.report.overallStatus}`);
    console.log(`TDD Score: ${this.report.score}/80\n`);

    console.log('Detailed Results:');
    console.log(`- Test Coverage: ${this.report.testCoverage}%`);
    console.log(`- Test Quality: ${this.report.testQuality}`);
    console.log(`- TDD Workflow: ${this.report.tddWorkflow}\n`);

    if (this.report.issues.length > 0) {
      console.log('Issues Found:');
      this.report.issues.forEach((issue) => console.log(`❌ ${issue}`));
      console.log();
    }

    if (this.report.recommendations.length > 0) {
      console.log('Recommendations:');
      this.report.recommendations.forEach((rec) => console.log(`💡 ${rec}`));
      console.log();
    }

    // Final status
    if (this.report.overallStatus === 'TDD COMPLIANT') {
      console.log(
        '🎉 Congratulations! Your project follows TDD practices correctly.'
      );
    } else if (this.report.overallStatus === 'PARTIALLY COMPLIANT') {
      console.log(
        '⚠️  Your project has some TDD compliance issues that should be addressed.'
      );
    } else {
      console.log(
        '🚨 Your project needs significant improvements to follow TDD practices.'
      );
    }

    // Save report to file (only if not in test environment)
    if (process.env.NODE_ENV !== 'test') {
      const reportPath = path.join(
        this.projectRoot,
        'tdd-validation-report.json'
      );
      fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
      console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    } else {
      console.log(
        `\n📄 Report would be saved to: ${path.join(this.projectRoot, 'tdd-validation-report.json')} (skipped in test environment)`
      );
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new TDDValidator();
  validator.validate().catch(console.error);
}

module.exports = TDDValidator;
