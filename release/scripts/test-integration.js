#!/usr/bin/env node

/**
 * Test Integration Script
 * 
 * This script integrates regular testing with chaos monkey testing to provide
 * a comprehensive testing solution for the Hello World application.
 * 
 * Features:
 * - Runs regular Jest tests
 * - Executes chaos monkey tests
 * - Generates comprehensive reports
 * - Provides risk assessment
 * - Suggests improvements
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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
    
    this.reportPath = path.join(__dirname, '..', 'test-integration-report.json');
  }

  /**
   * Run all tests and generate comprehensive report
   */
  async runAllTests() {
    console.log('🚀 Starting comprehensive test suite...\n');
    
    try {
      // Step 1: Run regular Jest tests
      await this.runRegularTests();
      
      // Step 2: Run chaos monkey tests
      await this.runChaosTests();
      
      // Step 3: Run security tests
      await this.runSecurityTests();
      
      // Step 4: Analyze results
      this.analyzeResults();
      
      // Step 5: Generate report
      this.generateReport();
      
      // Step 6: Display summary
      this.displaySummary();
      
    } catch (error) {
      console.error('❌ Test integration failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Run regular Jest tests
   */
  async runRegularTests() {
    console.log('📋 Running regular Jest tests...');
    
    try {
      // Run Jest directly instead of through npm to get clean JSON output
      const output = execSync('npx jest --json --silent', { 
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      this.results.regularTests = JSON.parse(output);
      console.log(`✅ Regular tests completed: ${this.results.regularTests.numPassedTests} passed, ${this.results.regularTests.numFailedTests} failed`);
      
    } catch (error) {
      console.log('⚠️  Regular tests failed or no output');
      this.results.regularTests = { error: error.message };
    }
  }

  /**
   * Run chaos monkey tests
   */
  async runChaosTests() {
    console.log('🐒 Running chaos monkey tests...');
    
    try {
      // Check if chaos monkey script exists
      const chaosScript = path.join(__dirname, 'chaos-monkey.js');
      if (!fs.existsSync(chaosScript)) {
        console.log('⚠️  Chaos monkey script not found, skipping');
        this.results.chaosTests = { error: 'Script not found' };
        return;
      }
      
      const output = execSync('node scripts/chaos-monkey.js', { 
        encoding: 'utf8',
        cwd: process.cwd(),
        timeout: 60000 // 1 minute timeout
      });
      
      // Try to parse the report file
      const reportPath = path.join(__dirname, '..', 'chaos-monkey-report.json');
      if (fs.existsSync(reportPath)) {
        this.results.chaosTests = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        console.log(`✅ Chaos tests completed: ${this.results.chaosTests.length} scenarios tested`);
      } else {
        this.results.chaosTests = { output, error: 'No report generated' };
      }
      
    } catch (error) {
      console.log('⚠️  Chaos tests failed or timed out');
      this.results.chaosTests = { error: error.message };
    }
  }

  /**
   * Run security tests
   */
  async runSecurityTests() {
    console.log('🔒 Running security tests...');
    
    try {
      // Check if security chaos script exists
      const securityScript = path.join(__dirname, 'security-chaos.js');
      if (!fs.existsSync(securityScript)) {
        console.log('⚠️  Security chaos script not found, skipping');
        this.results.securityTests = { error: 'Script not found' };
        return;
      }
      
      const output = execSync('node scripts/security-chaos.js', { 
        encoding: 'utf8',
        cwd: process.cwd(),
        timeout: 60000 // 1 minute timeout
      });
      
      // Try to parse the report file
      const reportPath = path.join(__dirname, '..', 'security-chaos-report.json');
      if (fs.existsSync(reportPath)) {
        this.results.securityTests = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        console.log(`✅ Security tests completed: ${this.results.securityTests.length} tests executed`);
      } else {
        this.results.securityTests = { output, error: 'No report generated' };
      }
      
    } catch (error) {
      console.log('⚠️  Security tests failed or timed out');
      this.results.securityTests = { error: error.message };
    }
  }

  /**
   * Analyze all test results
   */
  analyzeResults() {
    console.log('\n🔍 Analyzing test results...');
    
    let score = 0;
    let vulnerabilities = 0;
    const recommendations = [];
    
    // Analyze regular tests
    if (this.results.regularTests && !this.results.regularTests.error) {
      const totalTests = this.results.regularTests.numTotalTests;
      const passedTests = this.results.regularTests.numPassedTests;
      
      if (totalTests > 0) {
        const testScore = (passedTests / totalTests) * 40; // 40% weight
        score += testScore;
        
        if (this.results.regularTests.numFailedTests > 0) {
          recommendations.push('Fix failing unit tests to improve code quality');
        }
      }
    } else {
      recommendations.push('Ensure Jest tests are properly configured and running');
    }
    
    // Analyze chaos tests
    if (this.results.chaosTests && !this.results.chaosTests.error) {
      const totalScenarios = this.results.chaosTests.length;
      const successfulScenarios = this.results.chaosTests.filter(s => s.status === 'completed').length;
      
      if (totalScenarios > 0) {
        const chaosScore = (successfulScenarios / totalScenarios) * 30; // 30% weight
        score += chaosScore;
        
        if (successfulScenarios < totalScenarios) {
          recommendations.push('Improve application resilience under stress conditions');
        }
      }
    } else {
      recommendations.push('Implement chaos monkey testing for resilience validation');
    }
    
    // Analyze security tests
    if (this.results.securityTests && !this.results.securityTests.error) {
      const totalSecurityTests = this.results.securityTests.length;
      const vulnerabilitiesFound = this.results.securityTests.filter(t => t.vulnerability).length;
      
      vulnerabilities = vulnerabilitiesFound;
      
      if (totalSecurityTests > 0) {
        const securityScore = Math.max(0, (1 - vulnerabilitiesFound / totalSecurityTests)) * 30; // 30% weight
        score += securityScore;
        
        if (vulnerabilitiesFound > 0) {
          recommendations.push(`Address ${vulnerabilitiesFound} identified security vulnerabilities`);
        }
      }
    } else {
      recommendations.push('Implement security testing to identify vulnerabilities');
    }
    
    // Determine overall status
    let status = 'unknown';
    if (score >= 90) status = 'excellent';
    else if (score >= 80) status = 'good';
    else if (score >= 70) status = 'fair';
    else if (score >= 60) status = 'poor';
    else status = 'critical';
    
    this.results.overall = {
      status,
      score: Math.round(score),
      vulnerabilities,
      recommendations
    };
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.results.overall,
      details: {
        regularTests: this.results.regularTests,
        chaosTests: this.results.chaosTests,
        securityTests: this.results.securityTests
      },
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cwd: process.cwd()
      }
    };
    
    fs.writeFileSync(this.reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Report generated: ${this.reportPath}`);
  }

  /**
   * Display test summary
   */
  displaySummary() {
    console.log('\n📋 TEST INTEGRATION SUMMARY');
    console.log('=' .repeat(50));
    
    const { status, score, vulnerabilities, recommendations } = this.results.overall;
    
    console.log(`Overall Status: ${status.toUpperCase()}`);
    console.log(`Overall Score: ${score}/100`);
    console.log(`Vulnerabilities Found: ${vulnerabilities}`);
    
    if (recommendations.length > 0) {
      console.log('\n🔧 Recommendations:');
      recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
    
    console.log('\n📁 Detailed reports:');
    console.log(`  - Test Integration: ${this.reportPath}`);
    
    if (this.results.chaosTests && !this.results.chaosTests.error) {
      console.log('  - Chaos Monkey: chaos-monkey-report.json');
    }
    
    if (this.results.securityTests && !this.results.securityTests.error) {
      console.log('  - Security Tests: security-chaos-report.json');
    }
    
    console.log('\n🎯 Next Steps:');
    if (score < 80) {
      console.log('  - Review and fix failing tests');
      console.log('  - Address security vulnerabilities');
      console.log('  - Improve application resilience');
    } else {
      console.log('  - Maintain current quality standards');
      console.log('  - Consider adding more test scenarios');
      console.log('  - Plan for production deployment');
    }
  }

  /**
   * Run tests with specific focus
   */
  async runFocusedTests(focus) {
    switch (focus) {
    case 'regular':
      await this.runRegularTests();
      break;
    case 'chaos':
      await this.runChaosTests();
      break;
    case 'security':
      await this.runSecurityTests();
      break;
    default:
      console.log('Invalid focus. Use: regular, chaos, or security');
      return;
    }
    
    this.analyzeResults();
    this.generateReport();
    this.displaySummary();
  }
}

// CLI interface
if (require.main === module) {
  const integration = new TestIntegration();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
  case 'all':
    integration.runAllTests();
    break;
  case 'regular':
    integration.runFocusedTests('regular');
    break;
  case 'chaos':
    integration.runFocusedTests('chaos');
    break;
  case 'security':
    integration.runFocusedTests('security');
    break;
  case 'help':
    console.log(`
Test Integration Script

Usage:
  node scripts/test-integration.js [command]

Commands:
  all       Run all tests (default)
  regular   Run only regular Jest tests
  chaos     Run only chaos monkey tests
  security  Run only security tests
  help      Show this help message

Examples:
  node scripts/test-integration.js all
  node scripts/test-integration.js security
  node scripts/test-integration.js chaos
      `);
    break;
  default:
    integration.runAllTests();
  }
}

module.exports = TestIntegration;
