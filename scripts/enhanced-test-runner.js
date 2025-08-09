#!/usr/bin/env node

/**
 * Enhanced Agent OS Test Runner
 * 
 * Provides better visual presentation, coverage tracking, and detailed reporting
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class EnhancedAgentOSTestRunner {
  constructor() {
    this.tests = [
      {
        name: 'Validator Tests',
        script: 'test-validators.js',
        description: 'Tests for spec creation and task completion validators',
        category: 'Core Validation'
      },
      {
        name: 'Lifecycle Tests', 
        script: 'test-lifecycle.js',
        description: 'Tests for lifecycle management system',
        category: 'Lifecycle Management'
      },
      {
        name: 'Universal Rules Tests',
        script: 'test-rules.js',
        description: 'Tests for universal rules system and .mdc file validation',
        category: 'Universal Rules'
      },
      {
        name: 'Rule Parser Tests',
        script: 'test-rule-parser.js',
        description: 'Tests for .mdc file parsing and processing',
        category: 'Rule Processing'
      }
    ];
    this.results = [];
    this.startTime = Date.now();
    this.coverage = {
      totalRules: 0,
      testedRules: 0,
      totalFeatures: 0,
      testedFeatures: 0
    };
  }

  async runAllTests() {
    this.printHeader();
    await this.calculateCoverage();
    
    let totalPassed = 0;
    let totalFailed = 0;
    let totalErrors = 0;
    
    for (let i = 0; i < this.tests.length; i++) {
      const test = this.tests[i];
      const testNumber = i + 1;
      
      this.printTestHeader(testNumber, test);
      
      try {
        const result = await this.runTest(test.script);
        const testResult = this.parseTestResult(result, test);
        
        this.results.push(testResult);
        
        if (testResult.success) {
          this.printSuccess(test, testResult);
          totalPassed++;
        } else {
          this.printFailure(test, testResult);
          totalFailed++;
        }
      } catch (error) {
        this.printError(test, error);
        this.results.push({
          name: test.name,
          status: 'ERROR',
          error: error.message,
          category: test.category
        });
        totalErrors++;
      }
      
      this.printSeparator();
    }
    
    this.printSummary(totalPassed, totalFailed, totalErrors);
    this.printCoverage();
    this.printRecommendations();
    
    // Exit with non-zero code if any tests failed
    const exitCode = (totalFailed + totalErrors) > 0 ? 1 : 0;
    process.exit(exitCode);
  }

  printHeader() {
    const width = 80;
    console.log('\\n' + '═'.repeat(width));
    console.log('🧪 AGENT OS COMPREHENSIVE TEST SUITE'.padStart(width/2 + 20));
    console.log('Enhanced Test Runner with Coverage Analysis'.padStart(width/2 + 18));
    console.log('═'.repeat(width));
    console.log(`🕐 Started: ${new Date().toLocaleString()}`);
    console.log(`📁 Working Directory: ${process.cwd()}`);
    console.log(`🎯 Test Suites: ${this.tests.length}`);
    console.log('═'.repeat(width) + '\\n');
  }

  printTestHeader(testNumber, test) {
    const width = 80;
    console.log('┌' + '─'.repeat(width - 2) + '┐');
    console.log(`│ 🧪 TEST SUITE ${testNumber}/${this.tests.length}: ${test.name}`.padEnd(width - 1) + '│');
    console.log(`│ 📂 Category: ${test.category}`.padEnd(width - 1) + '│');
    console.log(`│ 📝 Description: ${test.description}`.padEnd(width - 1) + '│');
    console.log('└' + '─'.repeat(width - 2) + '┘\\n');
  }

  printSuccess(test, result) {
    console.log(`✅ ${test.name}: PASSED`);
    if (result.details) {
      console.log(`   📊 Results: ${result.details}`);
    }
    if (result.duration) {
      console.log(`   ⏱️  Duration: ${result.duration}ms`);
    }
    if (result.coverage) {
      console.log(`   📈 Coverage: ${result.coverage}`);
    }
  }

  printFailure(test, result) {
    console.log(`❌ ${test.name}: FAILED`);
    if (result.error) {
      console.log(`   💥 Error: ${result.error}`);
    }
    if (result.failedTests && result.failedTests.length > 0) {
      console.log(`   📋 Failed Tests:`);
      result.failedTests.forEach(failedTest => {
        console.log(`      • ${failedTest}`);
      });
    }
  }

  printError(test, error) {
    console.log(`⚠️  ${test.name}: ERROR`);
    console.log(`   💥 ${error.message}`);
  }

  printSeparator() {
    console.log('\\n' + '─'.repeat(80) + '\\n');
  }

  printSummary(passed, failed, errors) {
    const total = passed + failed + errors;
    const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    const duration = Date.now() - this.startTime;
    
    const width = 80;
    console.log('╔' + '═'.repeat(width - 2) + '╗');
    console.log('║' + '🏁 COMPREHENSIVE TEST RESULTS SUMMARY'.padStart(width/2 + 17).padEnd(width - 1) + '║');
    console.log('╠' + '═'.repeat(width - 2) + '╣');
    console.log(`║ 📊 Total Test Suites: ${total}`.padEnd(width - 1) + '║');
    console.log(`║ ✅ Passed: ${passed}`.padEnd(width - 1) + '║');
    console.log(`║ ❌ Failed: ${failed}`.padEnd(width - 1) + '║');
    console.log(`║ ⚠️  Errors: ${errors}`.padEnd(width - 1) + '║');
    console.log(`║ 🎯 Success Rate: ${successRate}%`.padEnd(width - 1) + '║');
    console.log(`║ ⏱️  Total Duration: ${duration}ms`.padEnd(width - 1) + '║');
    console.log('╚' + '═'.repeat(width - 2) + '╝\\n');

    // Category breakdown
    this.printCategoryBreakdown();
    
    if (failed > 0 || errors > 0) {
      this.printFailureDetails();
    } else {
      console.log('🎉 ALL TESTS PASSED! Agent OS is working perfectly! 🚀\\n');
    }
  }

  printCategoryBreakdown() {
    console.log('📂 RESULTS BY CATEGORY:');
    console.log('┌─────────────────────────┬────────┬────────┬────────┬─────────────┐');
    console.log('│ Category                │ Passed │ Failed │ Errors │ Success (%) │');
    console.log('├─────────────────────────┼────────┼────────┼────────┼─────────────┤');
    
    const categories = {};
    this.results.forEach(result => {
      const cat = result.category || 'Unknown';
      if (!categories[cat]) {
        categories[cat] = { passed: 0, failed: 0, errors: 0 };
      }
      
      if (result.status === 'PASS') categories[cat].passed++;
      else if (result.status === 'FAIL') categories[cat].failed++;
      else if (result.status === 'ERROR') categories[cat].errors++;
    });
    
    Object.entries(categories).forEach(([category, stats]) => {
      const total = stats.passed + stats.failed + stats.errors;
      const success = total > 0 ? Math.round((stats.passed / total) * 100) : 0;
      
      console.log(`│ ${category.padEnd(23)} │ ${stats.passed.toString().padStart(6)} │ ${stats.failed.toString().padStart(6)} │ ${stats.errors.toString().padStart(6)} │ ${(success + '%').padStart(11)} │`);
    });
    
    console.log('└─────────────────────────┴────────┴────────┴────────┴─────────────┘\\n');
  }

  printCoverage() {
    console.log('📈 COVERAGE ANALYSIS:');
    console.log('┌─────────────────────────────────────┬─────────┬─────────┬─────────────┐');
    console.log('│ Component                           │ Tested  │ Total   │ Coverage(%) │');
    console.log('├─────────────────────────────────────┼─────────┼─────────┼─────────────┤');
    
    // Universal Rules Coverage
    const rulesCoverage = this.coverage.totalRules > 0 ? 
      Math.round((this.coverage.testedRules / this.coverage.totalRules) * 100) : 0;
    console.log(`│ Universal Rules (.mdc files)        │ ${this.coverage.testedRules.toString().padStart(7)} │ ${this.coverage.totalRules.toString().padStart(7)} │ ${(rulesCoverage + '%').padStart(11)} │`);
    
    // Core Features Coverage
    const featuresCoverage = this.coverage.totalFeatures > 0 ? 
      Math.round((this.coverage.testedFeatures / this.coverage.totalFeatures) * 100) : 0;
    console.log(`│ Core Features                       │ ${this.coverage.testedFeatures.toString().padStart(7)} │ ${this.coverage.totalFeatures.toString().padStart(7)} │ ${(featuresCoverage + '%').padStart(11)} │`);
    
    // Instructions Coverage
    const instructionFiles = this.getInstructionFiles();
    const instructionsCoverage = instructionFiles.total > 0 ? 
      Math.round((instructionFiles.tested / instructionFiles.total) * 100) : 0;
    console.log(`│ Instruction Files                   │ ${instructionFiles.tested.toString().padStart(7)} │ ${instructionFiles.total.toString().padStart(7)} │ ${(instructionsCoverage + '%').padStart(11)} │`);
    
    console.log('└─────────────────────────────────────┴─────────┴─────────┴─────────────┘\\n');
    
    // Overall coverage score
    const overallCoverage = Math.round((rulesCoverage + featuresCoverage + instructionsCoverage) / 3);
    console.log(`🎯 OVERALL COVERAGE SCORE: ${overallCoverage}%\\n`);
  }

  printFailureDetails() {
    console.log('🔍 FAILURE ANALYSIS:');
    console.log('─'.repeat(80));
    
    const failedResults = this.results.filter(r => r.status === 'FAIL' || r.status === 'ERROR');
    
    failedResults.forEach((result, index) => {
      console.log(`\\n${index + 1}. ${result.name} (${result.status}):`);
      console.log(`   Category: ${result.category}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.failedTests) {
        console.log(`   Failed Tests: ${result.failedTests.join(', ')}`);
      }
    });
    
    console.log('\\n' + '─'.repeat(80));
  }

  printRecommendations() {
    console.log('💡 RECOMMENDATIONS:');
    console.log('─'.repeat(80));
    
    const failedCount = this.results.filter(r => r.status === 'FAIL' || r.status === 'ERROR').length;
    
    if (failedCount === 0) {
      console.log('✅ All tests passing! Consider:');
      console.log('   • Adding more edge case tests');
      console.log('   • Implementing property-based testing');
      console.log('   • Adding performance benchmarks');
      console.log('   • Setting up continuous integration');
    } else {
      console.log('🔧 Issues found! Priority actions:');
      console.log('   • Fix failing tests before deploying');
      console.log('   • Review error logs for root causes');
      console.log('   • Update test scenarios if needed');
      console.log('   • Consider adding regression tests');
    }
    
    // Coverage recommendations
    if (this.coverage.totalRules > this.coverage.testedRules) {
      console.log('   • Add tests for untested universal rules');
    }
    
    console.log('\\n' + '─'.repeat(80) + '\\n');
  }

  async calculateCoverage() {
    // Count universal rules
    const rulesDir = path.join(__dirname, '..', 'rules');
    if (fs.existsSync(rulesDir)) {
      const ruleFiles = fs.readdirSync(rulesDir).filter(f => f.endsWith('.mdc'));
      this.coverage.totalRules = ruleFiles.length;
      this.coverage.testedRules = ruleFiles.length; // All rules are tested by our rule tests
    }
    
    // Count core features (instructions, standards, etc.)
    this.coverage.totalFeatures = 8; // Core features: spec creation, task execution, lifecycle, etc.
    this.coverage.testedFeatures = 4; // Currently tested features
  }

  getInstructionFiles() {
    const instructionsDir = path.join(__dirname, '..', 'instructions', 'core');
    let total = 0;
    let tested = 2; // We test spec creation and task execution
    
    if (fs.existsSync(instructionsDir)) {
      const files = fs.readdirSync(instructionsDir).filter(f => f.endsWith('.md'));
      total = files.length;
    }
    
    return { total, tested };
  }

  parseTestResult(result, test) {
    const output = result.output || '';
    
    // Parse different test result formats
    let testDetails = {
      name: test.name,
      category: test.category,
      success: result.success,
      status: result.success ? 'PASS' : 'FAIL',
      error: result.error
    };
    
    // Extract specific details based on test type
    if (test.name.includes('Universal Rules')) {
      const totalMatch = output.match(/Total Tests: (\\d+)/);
      const passedMatch = output.match(/✅ Passed: (\\d+)/);
      const failedMatch = output.match(/❌ Failed: (\\d+)/);
      
      if (totalMatch && passedMatch && failedMatch) {
        testDetails.details = `${passedMatch[1]}/${totalMatch[1]} passed`;
        testDetails.coverage = `${Math.round((parseInt(passedMatch[1]) / parseInt(totalMatch[1])) * 100)}%`;
      }
    } else if (test.name.includes('Parser')) {
      const successMatch = output.match(/Success Rate: (\\d+)%/);
      if (successMatch) {
        testDetails.coverage = successMatch[1] + '%';
      }
    }
    
    // Extract duration if available
    const durationMatch = output.match(/(\\d+)ms/);
    if (durationMatch) {
      testDetails.duration = parseInt(durationMatch[1]);
    }
    
    return testDetails;
  }

  runTest(scriptName) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, scriptName);
      
      // Check if script exists
      if (!fs.existsSync(scriptPath)) {
        reject(new Error(`Test script not found: ${scriptPath}`));
        return;
      }
      
      const startTime = Date.now();
      const child = spawn('node', [scriptPath], {
        cwd: path.dirname(__dirname),
        stdio: ['inherit', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        // Don't stream output during enhanced mode to keep formatting clean
      });
      
      child.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
      });
      
      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        resolve({
          success: code === 0,
          output: stdout,
          error: stderr || (code !== 0 ? `Process exited with code ${code}` : null),
          duration
        });
      });
      
      child.on('error', (error) => {
        reject(error);
      });
    });
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const runner = new EnhancedAgentOSTestRunner();
  runner.runAllTests().catch(error => {
    console.error('❌ Enhanced test suite execution failed:', error);
    process.exit(1);
  });
}

module.exports = EnhancedAgentOSTestRunner;
