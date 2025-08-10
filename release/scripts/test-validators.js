#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class ValidatorTester {
  constructor() {
    this.testResults = [];
    this.testsDir = path.join(__dirname, '../tests/validators/scenarios');
  }

  async runAllTests() {
    console.log('🧪 Starting Validator Tests\n');
    
    try {
      const testScenarios = this.getTestScenarios();
      
      for (const scenario of testScenarios) {
        console.log(`\n📋 Running test: ${scenario}`);
        const result = await this.runTest(scenario);
        this.testResults.push(result);
        this.displayTestResult(result);
      }
      
      this.displaySummary();
    } catch (error) {
      console.error('❌ Test runner failed:', error.message);
      process.exit(1);
    }
  }

  getTestScenarios() {
    if (!fs.existsSync(this.testsDir)) {
      throw new Error(`Tests directory not found: ${this.testsDir}`);
    }
    
    return fs.readdirSync(this.testsDir)
      .filter(item => fs.statSync(path.join(this.testsDir, item)).isDirectory())
      .filter(item => item.startsWith('test-'));
  }

  async runTest(scenarioName) {
    const scenarioDir = path.join(this.testsDir, scenarioName);
    const inputDir = path.join(scenarioDir, 'input');
    const expectedOutputFile = path.join(scenarioDir, 'expected-output.json');
    
    // Check if test files exist
    if (!fs.existsSync(inputDir)) {
      return {
        name: scenarioName,
        status: 'ERROR',
        message: 'Input directory not found',
        details: `Missing: ${inputDir}`
      };
    }
    
    if (!fs.existsSync(expectedOutputFile)) {
      return {
        name: scenarioName,
        status: 'ERROR', 
        message: 'Expected output file not found',
        details: `Missing: ${expectedOutputFile}`
      };
    }
    
    // Load expected results
    const expectedOutput = JSON.parse(fs.readFileSync(expectedOutputFile, 'utf8'));
    
    // Run the actual validation
    const actualOutput = this.runPostSpecValidation(inputDir);
    
    // Compare results
    const comparison = this.compareResults(expectedOutput, actualOutput);
    
    return {
      name: scenarioName,
      status: comparison.matches ? 'PASS' : 'FAIL',
      expected: expectedOutput,
      actual: actualOutput,
      comparison: comparison,
      details: comparison.differences
    };
  }

  runPostSpecValidation(inputDir) {
    // Find the spec directory
    const agentOsDir = path.join(inputDir, '.agent-os');
    const specsDir = path.join(agentOsDir, 'specs');
    
    if (!fs.existsSync(specsDir)) {
      return {
        validation_status: 'FAIL',
        error: 'No .agent-os/specs directory found'
      };
    }
    
    const specDirs = fs.readdirSync(specsDir)
      .filter(item => fs.statSync(path.join(specsDir, item)).isDirectory());
    
    if (specDirs.length === 0) {
      return {
        validation_status: 'FAIL',
        error: 'No spec directories found'
      };
    }
    
    // Validate the first (should be only) spec directory
    const specDir = specDirs[0];
    const specPath = path.join(specsDir, specDir);
    
    return this.validateSpecDirectory(specDir, specPath);
  }

  validateSpecDirectory(specDirName, specPath) {
    const result = {
      validation_status: 'PASS',
      spec_directory: specDirName,
      timestamp: new Date().toISOString(),
      validations: {
        directory_structure: this.validateDirectoryStructure(specDirName),
        required_files: this.validateRequiredFiles(specPath),
        content_structure: { status: 'SKIP', checks: [] },
        content_quality: { status: 'SKIP', checks: [] }
      },
      summary: { total_checks: 0, passed_checks: 0, failed_checks: 0, warnings: 0 },
      recommendations: []
    };
    
    // Only validate content if required files exist
    const requiredFilesPass = result.validations.required_files.status === 'PASS';
    
    if (requiredFilesPass) {
      result.validations.content_structure = this.validateContentStructure(specPath);
      result.validations.content_quality = this.validateContentQuality(specPath);
    }
    
    // Calculate summary
    this.calculateSummary(result);
    
    // Determine overall status
    const hasFailures = result.summary.failed_checks > 0;
    result.validation_status = hasFailures ? 'FAIL' : 'PASS';
    
    // Generate recommendations for failures
    if (hasFailures) {
      result.recommendations = this.generateRecommendations(result.validations);
    }
    
    return result;
  }

  validateDirectoryStructure(specDirName) {
    const checks = [];
    let status = 'PASS';
    
    // Check date prefix format (YYYY-MM-DD)
    const dateRegex = /^(\d{4}-\d{2}-\d{2})-(.+)$/;
    const match = specDirName.match(dateRegex);
    
    if (match) {
      checks.push({
        check: 'Directory exists with proper YYYY-MM-DD- prefix',
        result: 'PASS',
        details: `Directory name '${specDirName}' follows correct format`
      });
      
      const [, datePart, namePart] = match;
      
      // Validate date format
      const dateValid = !isNaN(Date.parse(datePart));
      checks.push({
        check: 'Date format is valid (YYYY-MM-DD)',
        result: dateValid ? 'PASS' : 'FAIL',
        details: dateValid ? `Date '${datePart}' is valid ISO format` : `Invalid date format: ${datePart}`
      });
      
      // Check spec name format (kebab-case, ≤5 words)
      const words = namePart.split('-');
      const isKebabCase = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(namePart);
      const wordCount = words.length;
      
      const nameValid = isKebabCase && wordCount <= 5;
      checks.push({
        check: 'Spec name is kebab-case and ≤5 words',
        result: nameValid ? 'PASS' : 'FAIL',
        details: nameValid ? 
          `Spec name '${namePart}' is ${wordCount} words in kebab-case` :
          `Spec name '${namePart}' violates naming rules (kebab-case, max 5 words)`
      });
      
      if (!dateValid || !nameValid) status = 'FAIL';
      
    } else {
      checks.push({
        check: 'Directory exists with proper YYYY-MM-DD- prefix',
        result: 'FAIL',
        details: `Directory name '${specDirName}' does not follow YYYY-MM-DD-spec-name format`
      });
      status = 'FAIL';
    }
    
    checks.push({
      check: 'Directory is in .agent-os/specs/',
      result: 'PASS',
      details: `Correct location: .agent-os/specs/${specDirName}/`
    });
    
    return { status, checks };
  }

  validateRequiredFiles(specPath) {
    const requiredFiles = [
      'spec.md',
      'spec-lite.md', 
      'tasks.md',
      'status.md',
      'sub-specs/technical-spec.md'
    ];
    
    const conditionalFiles = [
      'sub-specs/database-schema.md',
      'sub-specs/api-spec.md'
    ];
    
    const checks = [];
    let status = 'PASS';
    
    // Check required files
    for (const file of requiredFiles) {
      const filePath = path.join(specPath, file);
      const exists = fs.existsSync(filePath);
      
      checks.push({
        check: `${file} exists`,
        result: exists ? 'PASS' : 'FAIL',
        details: exists ? 'File found and readable' : `Required file ${file} is missing`
      });
      
      if (!exists) status = 'FAIL';
    }
    
    // Check conditional files (info only)
    const conditionalFound = conditionalFiles.filter(file => 
      fs.existsSync(path.join(specPath, file))
    );
    
    if (conditionalFound.length > 0) {
      checks.push({
        check: 'Conditional files present when needed',
        result: 'PASS',
        details: `${conditionalFound.join(', ')} found as expected`
      });
    }
    
    return { status, checks };
  }

  validateContentStructure(specPath) {
    const checks = [];
    let status = 'PASS';
    
    // Validate spec.md structure
    const specContent = this.readFileContent(path.join(specPath, 'spec.md'));
    const requiredSections = ['Overview', 'User Stories', 'Spec Scope', 'Out of Scope', 'Expected Deliverable'];
    const hasAllSections = requiredSections.every(section => specContent.includes(`## ${section}`));
    
    checks.push({
      check: 'spec.md has required sections',
      result: hasAllSections ? 'PASS' : 'FAIL',
      details: hasAllSections ? 
        'All sections present: ' + requiredSections.join(', ') :
        'Missing sections in spec.md'
    });
    
    // Validate spec-lite.md
    const specLiteContent = this.readFileContent(path.join(specPath, 'spec-lite.md'));
    const hasSpecLiteHeader = specLiteContent.includes('# Spec Summary (Lite)');
    const specLiteLength = specLiteContent.split('\n').filter(line => line.trim() && !line.startsWith('#')).length;
    const specLiteValid = hasSpecLiteHeader && specLiteLength >= 1 && specLiteLength <= 3;
    
    checks.push({
      check: 'spec-lite.md has proper summary',
      result: specLiteValid ? 'PASS' : 'FAIL',
      details: specLiteValid ? 
        'Contains 1-3 sentence summary for AI context' :
        'spec-lite.md format is invalid'
    });
    
    // Validate technical-spec.md
    const techSpecPath = path.join(specPath, 'sub-specs/technical-spec.md');
    if (fs.existsSync(techSpecPath)) {
      const techSpecContent = this.readFileContent(techSpecPath);
      const hasTechHeader = techSpecContent.includes('# Technical Specification');
      const hasTechRequirements = techSpecContent.includes('## Technical Requirements');
      
      checks.push({
        check: 'technical-spec.md has required structure',
        result: hasTechHeader && hasTechRequirements ? 'PASS' : 'FAIL',
        details: hasTechHeader && hasTechRequirements ?
          'Has header, spec reference, technical requirements, and external dependencies' :
          'Missing required sections in technical-spec.md'
      });
    }
    
    // Validate tasks.md structure  
    const tasksContent = this.readFileContent(path.join(specPath, 'tasks.md'));
    const hasTasksHeader = tasksContent.includes('# Spec Tasks');
    const hasChecklistFormat = tasksContent.includes('- [ ]');
    const hasDecimalNotation = /- \[ \] \d+\.\d+/.test(tasksContent);
    
    checks.push({
      check: 'tasks.md has proper task structure',
      result: hasTasksHeader && hasChecklistFormat ? 'PASS' : 'FAIL',
      details: hasTasksHeader && hasChecklistFormat ?
        'Numbered checklist with subtasks in decimal notation, TDD approach' :
        'tasks.md does not follow proper checklist format'
    });
    
    // Validate status.md
    const statusContent = this.readFileContent(path.join(specPath, 'status.md'));
    const statusFields = ['**Spec Name**:', '**Created**:', '**Current Status**:', '**Last Updated**:'];
    const hasAllStatusFields = statusFields.every(field => statusContent.includes(field));
    
    checks.push({
      check: 'status.md has required fields',
      result: hasAllStatusFields ? 'PASS' : 'FAIL', 
      details: hasAllStatusFields ?
        'All required fields present: spec name, dates, status, history, actions' :
        'Missing required fields in status.md'
    });
    
    const failedChecks = checks.filter(check => check.result === 'FAIL');
    if (failedChecks.length > 0) status = 'FAIL';
    
    return { status, checks };
  }

  validateContentQuality(specPath) {
    const checks = [];
    let status = 'PASS';
    
    const specContent = this.readFileContent(path.join(specPath, 'spec.md'));
    
    // Check overview section length
    const overviewMatch = specContent.match(/## Overview\s*\n\s*(.+?)(?=\n## |\n\n|$)/s);
    if (overviewMatch) {
      const overviewText = overviewMatch[1].trim();
      const sentences = overviewText.split('.').filter(s => s.trim().length > 0);
      const overviewValid = sentences.length >= 1 && sentences.length <= 2;
      
      checks.push({
        check: 'Overview section length (1-2 sentences)',
        result: overviewValid ? 'PASS' : 'FAIL',
        details: overviewValid ?
          `Overview is ${sentences.length} sentence${sentences.length > 1 ? 's' : ''} with clear goal and objective` :
          `Overview has ${sentences.length} sentences, should be 1-2`
      });
    }
    
    // Check user stories format and count
    const userStoriesMatch = specContent.match(/## User Stories\s*\n(.*?)(?=\n## |\n\n|$)/s);
    if (userStoriesMatch) {
      const userStoriesText = userStoriesMatch[1];
      const storyCount = (userStoriesText.match(/### /g) || []).length;
      const hasProperFormat = userStoriesText.includes('As a ') && userStoriesText.includes('I want');
      
      checks.push({
        check: 'User stories format and count (1-3)',
        result: storyCount >= 1 && storyCount <= 3 && hasProperFormat ? 'PASS' : 'FAIL',
        details: storyCount >= 1 && storyCount <= 3 && hasProperFormat ?
          `${storyCount} user stories with proper format and workflow descriptions` :
          `User stories validation failed: ${storyCount} stories, format check: ${hasProperFormat}`
      });
    }
    
    // Check spec scope
    const specScopeMatch = specContent.match(/## Spec Scope\s*\n(.*?)(?=\n## |\n\n|$)/s);
    if (specScopeMatch) {
      const specScopeText = specScopeMatch[1];
      const numberedItems = (specScopeText.match(/^\d+\./gm) || []).length;
      const scopeValid = numberedItems >= 1 && numberedItems <= 5;
      
      checks.push({
        check: 'Spec scope count and format (1-5 features)',
        result: scopeValid ? 'PASS' : 'FAIL',
        details: scopeValid ?
          `${numberedItems} features in numbered list with one-sentence descriptions` :
          `Spec scope has ${numberedItems} items, should be 1-5`
      });
    }
    
    // Check expected deliverables
    const deliverablesMatch = specContent.match(/## Expected Deliverable\s*\n(.*?)(?=\n## |\n\n|$)/s);
    if (deliverablesMatch) {
      const deliverablesText = deliverablesMatch[1];
      const deliverableCount = (deliverablesText.match(/^\d+\./gm) || []).length;
      const deliverablesValid = deliverableCount >= 1 && deliverableCount <= 3;
      
      checks.push({
        check: 'Expected deliverables are testable (1-3)',
        result: deliverablesValid ? 'PASS' : 'FAIL',
        details: deliverablesValid ?
          `${deliverableCount} browser-testable outcomes specified` :
          `Expected deliverables has ${deliverableCount} items, should be 1-3`
      });
    }
    
    // Check TDD approach in tasks
    const tasksContent = this.readFileContent(path.join(specPath, 'tasks.md'));
    const hasWriteTests = tasksContent.includes('Write tests');
    const hasVerifyTests = tasksContent.includes('Verify') && tasksContent.includes('tests pass');
    
    checks.push({
      check: 'Tasks follow TDD approach',
      result: hasWriteTests && hasVerifyTests ? 'PASS' : 'FAIL',
      details: hasWriteTests && hasVerifyTests ?
        'Each major task starts with \'Write tests\' and ends with \'Verify tests pass\'' :
        'Tasks do not follow TDD approach'
    });
    
    const failedChecks = checks.filter(check => check.result === 'FAIL');
    if (failedChecks.length > 0) status = 'FAIL';
    
    return { status, checks };
  }

  readFileContent(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      return '';
    }
  }

  calculateSummary(result) {
    let totalChecks = 0;
    let passedChecks = 0;
    let failedChecks = 0;
    let warnings = 0;
    
    Object.values(result.validations).forEach(validation => {
      if (validation.checks) {
        validation.checks.forEach(check => {
          totalChecks++;
          if (check.result === 'PASS') passedChecks++;
          else if (check.result === 'FAIL') failedChecks++;
          else if (check.result === 'WARN') warnings++;
        });
      }
    });
    
    result.summary = {
      total_checks: totalChecks,
      passed_checks: passedChecks, 
      failed_checks: failedChecks,
      warnings: warnings,
      overall_status: failedChecks > 0 ? 'FAIL' : 'PASS'
    };
  }

  generateRecommendations(validations) {
    const recommendations = [];
    
    Object.values(validations).forEach(validation => {
      if (validation.checks) {
        validation.checks.forEach(check => {
          if (check.result === 'FAIL') {
            if (check.check.includes('spec-lite.md exists')) {
              recommendations.push({
                type: 'CRITICAL',
                message: 'Create missing file: spec-lite.md',
                action: 'Use @~/.agent-os/instructions/core/create-spec.md to generate proper spec-lite.md'
              });
            } else if (check.check.includes('tasks.md exists')) {
              recommendations.push({
                type: 'CRITICAL',
                message: 'Create missing file: tasks.md',
                action: 'Use @~/.agent-os/instructions/core/create-spec.md to generate proper tasks.md'
              });
            } else if (check.check.includes('technical-spec.md exists')) {
              recommendations.push({
                type: 'CRITICAL',
                message: 'Create missing file: sub-specs/technical-spec.md',
                action: 'Use @~/.agent-os/instructions/core/create-spec.md to generate technical specification'
              });
            }
          }
        });
      }
    });
    
    return recommendations;
  }

  compareResults(expected, actual) {
    const differences = [];
    let matches = true;
    
    // Compare overall status
    if (expected.validation_status !== actual.validation_status) {
      differences.push(`Status mismatch: expected ${expected.validation_status}, got ${actual.validation_status}`);
      matches = false;
    }
    
    // Compare summary counts
    if (expected.summary && actual.summary) {
      if (expected.summary.failed_checks !== actual.summary.failed_checks) {
        differences.push(`Failed checks mismatch: expected ${expected.summary.failed_checks}, got ${actual.summary.failed_checks}`);
        matches = false;
      }
      
      if (expected.summary.passed_checks !== actual.summary.passed_checks) {
        differences.push(`Passed checks mismatch: expected ${expected.summary.passed_checks}, got ${actual.summary.passed_checks}`);
        matches = false;
      }
    }
    
    // Compare specific validation results
    if (expected.validations && actual.validations) {
      Object.keys(expected.validations).forEach(validationType => {
        const expectedValidation = expected.validations[validationType];
        const actualValidation = actual.validations[validationType];
        
        if (expectedValidation.status !== actualValidation.status) {
          differences.push(`${validationType} status mismatch: expected ${expectedValidation.status}, got ${actualValidation.status}`);
          matches = false;
        }
      });
    }
    
    return { matches, differences };
  }

  displayTestResult(result) {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${result.name}: ${result.status}`);
    
    if (result.comparison && result.comparison.differences.length > 0) {
      console.log('   Differences:');
      result.comparison.differences.forEach(diff => {
        console.log(`   - ${diff}`);
      });
    }
    
    if (result.details) {
      console.log(`   Details: ${result.details}`);
    }
  }

  displaySummary() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    const errorTests = this.testResults.filter(r => r.status === 'ERROR').length;
    
    console.log('\n📊 Test Summary');
    console.log('================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⚠️ Errors: ${errorTests}`);
    console.log(`\nSuccess Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    if (failedTests > 0 || errorTests > 0) {
      console.log('\n🔍 Failed/Error Test Details:');
      this.testResults
        .filter(r => r.status === 'FAIL' || r.status === 'ERROR')
        .forEach(result => {
          console.log(`\n${result.name} (${result.status}):`);
          if (result.comparison && result.comparison.differences) {
            result.comparison.differences.forEach(diff => {
              console.log(`  - ${diff}`);
            });
          }
          if (result.details) {
            console.log(`  Details: ${result.details}`);
          }
        });
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new ValidatorTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = ValidatorTester;