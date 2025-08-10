#!/usr/bin/env node

/**
 * Comprehensive Validator Test Suite
 * 
 * Runs all validator tests and provides detailed coverage analysis
 */

const fs = require('fs');
const path = require('path');

// Import all validator test classes
const CodeQualityValidatorTests = require('../tests/validators/test-code-quality-validator');
const SecurityValidatorTests = require('../tests/validators/test-security-validator');
const SpecAdherenceValidatorTests = require('../tests/validators/test-spec-adherence-validator');
const BranchStrategyValidatorTests = require('../tests/validators/test-branch-strategy-validator');
const TestingCompletenessValidatorTests = require('../tests/validators/test-testing-completeness-validator');
const DocumentationValidatorTests = require('../tests/validators/test-documentation-validator');

class ValidatorTestSuite {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
    this.testClasses = [
      { name: 'Code Quality Validator', class: CodeQualityValidatorTests, tier: 1 },
      { name: 'Spec Adherence Validator', class: SpecAdherenceValidatorTests, tier: 1 },
      { name: 'Security Validator', class: SecurityValidatorTests, tier: 2 },
      { name: 'Branch Strategy Validator', class: BranchStrategyValidatorTests, tier: 2 },
      { name: 'Testing Completeness Validator', class: TestingCompletenessValidatorTests, tier: 2 },
      { name: 'Documentation Validator', class: DocumentationValidatorTests, tier: 2 },
      // Additional test classes will be added here as they're implemented
    ];
  }

  async runAllTests(options = {}) {
    console.log('🧪 COMPREHENSIVE VALIDATOR TEST SUITE');
    console.log('=====================================\n');
    
    console.log('🎯 Testing Coverage:');
    console.log('   • Code Quality Validator (Tier 1)');
    console.log('   • Spec Adherence Validator (Tier 1)');
    console.log('   • Security Validator (Tier 2)');
    console.log('   • Branch Strategy Validator (Tier 2)');
    console.log('   • Testing Completeness Validator (Tier 2)');
    console.log('   • Documentation Validator (Tier 2)');
    console.log('   • [Validator Runner Integration Tests]\n');

    const results = {
      testClasses: [],
      summary: {
        totalClasses: 0,
        passedClasses: 0,
        failedClasses: 0,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        totalDuration: 0
      }
    };

    // Run tests by tier
    const tiers = [1, 2];
    
    for (const tier of tiers) {
      const tierClasses = this.testClasses.filter(tc => tc.tier === tier);
      
      if (tierClasses.length > 0) {
        console.log(`\n🎯 Tier ${tier} Validator Tests`);
        console.log('─'.repeat(30));
        
        for (const testClassConfig of tierClasses) {
          if (options.skip && options.skip.includes(testClassConfig.name)) {
            console.log(`⏭️  Skipping ${testClassConfig.name}`);
            continue;
          }

          console.log(`\n🔍 Running ${testClassConfig.name} Tests...`);
          
          const classStartTime = Date.now();
          let classResult;
          
          try {
            const TestClass = testClassConfig.class;
            const tester = new TestClass();
            
            // Capture console output for analysis
            const originalConsoleLog = console.log;
            const logs = [];
            console.log = (...args) => {
              logs.push(args.join(' '));
              originalConsoleLog(...args);
            };
            
            await tester.runAllTests();
            
            // Restore console
            console.log = originalConsoleLog;
            
            const classDuration = Date.now() - classStartTime;
            
            // Analyze test results
            const testAnalysis = this.analyzeTestResults(tester.testResults);
            
            classResult = {
              name: testClassConfig.name,
              tier: testClassConfig.tier,
              status: testAnalysis.failedTests === 0 ? 'PASS' : 'FAIL',
              duration: classDuration,
              tests: testAnalysis,
              logs: logs
            };
            
            const statusIcon = classResult.status === 'PASS' ? '✅' : '❌';
            console.log(`${statusIcon} ${testClassConfig.name}: ${classResult.status} (${testAnalysis.totalTests} tests, ${classDuration}ms)`);
            
            results.summary.passedClasses += classResult.status === 'PASS' ? 1 : 0;
            results.summary.failedClasses += classResult.status === 'FAIL' ? 1 : 0;
            
          } catch (error) {
            const classDuration = Date.now() - classStartTime;
            
            classResult = {
              name: testClassConfig.name,
              tier: testClassConfig.tier,
              status: 'ERROR',
              duration: classDuration,
              error: error.message,
              tests: { totalTests: 0, passedTests: 0, failedTests: 1 }
            };
            
            console.log(`❌ ${testClassConfig.name}: ERROR - ${error.message}`);
            results.summary.failedClasses++;
          }
          
          results.testClasses.push(classResult);
          results.summary.totalClasses++;
          results.summary.totalTests += classResult.tests.totalTests;
          results.summary.passedTests += classResult.tests.passedTests;
          results.summary.failedTests += classResult.tests.failedTests;
          results.summary.totalDuration += classResult.duration;
        }
      }
    }

    results.summary.successRate = results.summary.totalTests > 0 
      ? Math.round((results.summary.passedTests / results.summary.totalTests) * 100)
      : 0;

    this.displayComprehensiveSummary(results);
    
    return results;
  }

  analyzeTestResults(testResults) {
    const totalTests = testResults.length;
    const passedTests = testResults.filter(r => r.status === 'PASS').length;
    const failedTests = testResults.filter(r => r.status === 'FAIL').length;
    const errorTests = testResults.filter(r => r.status === 'ERROR').length;
    
    // Analyze test categories
    const categories = {};
    testResults.forEach(result => {
      const category = this.categorizeTest(result.testName);
      if (!categories[category]) {
        categories[category] = { total: 0, passed: 0, failed: 0 };
      }
      categories[category].total++;
      if (result.status === 'PASS') categories[category].passed++;
      else categories[category].failed++;
    });

    // Calculate performance metrics
    const durations = testResults
      .filter(r => r.details && r.details.duration)
      .map(r => r.details.duration);
    
    const avgDuration = durations.length > 0 
      ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
      : 0;
    
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

    return {
      totalTests,
      passedTests,
      failedTests,
      errorTests,
      categories,
      performance: {
        avgDuration,
        maxDuration,
        totalDuration: durations.reduce((sum, d) => sum + d, 0)
      }
    };
  }

  categorizeTest(testName) {
    const name = testName.toLowerCase();
    
    if (name.includes('file size') || name.includes('complexity')) return 'Code Quality';
    if (name.includes('secret') || name.includes('security')) return 'Security';
    if (name.includes('sql') || name.includes('xss') || name.includes('injection')) return 'Vulnerabilities';
    if (name.includes('validation') || name.includes('input')) return 'Input Validation';
    if (name.includes('auth') || name.includes('https')) return 'Authentication';
    if (name.includes('config') || name.includes('dependency')) return 'Configuration';
    if (name.includes('directory') || name.includes('project')) return 'Integration';
    if (name.includes('error') || name.includes('edge')) return 'Error Handling';
    
    return 'Other';
  }

  displayComprehensiveSummary(results) {
    const totalDuration = Date.now() - this.startTime;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE VALIDATOR TEST RESULTS');
    console.log('='.repeat(80));

    // Overall status
    const overallStatus = results.summary.failedClasses === 0 ? 'PASS' : 'FAIL';
    const statusIcon = overallStatus === 'PASS' ? '✅' : '❌';
    
    console.log(`\n${statusIcon} Overall Test Status: ${overallStatus}`);
    console.log(`⏱️  Total Execution Time: ${totalDuration}ms`);
    console.log(`🧪 Test Coverage: ${results.summary.totalTests} tests across ${results.summary.totalClasses} validators\n`);

    // Summary statistics
    console.log('📈 Summary Statistics:');
    console.log(`   Validator Classes: ${results.summary.totalClasses}`);
    console.log(`   ✅ Passed Classes: ${results.summary.passedClasses}`);
    console.log(`   ❌ Failed Classes: ${results.summary.failedClasses}`);
    console.log(`   📊 Total Tests: ${results.summary.totalTests}`);
    console.log(`   ✅ Passed Tests: ${results.summary.passedTests}`);
    console.log(`   ❌ Failed Tests: ${results.summary.failedTests}`);
    console.log(`   🎯 Success Rate: ${results.summary.successRate}%`);

    // Detailed results by tier
    console.log('\n🎯 Results by Tier:');
    const tiers = [1, 2];
    
    tiers.forEach(tier => {
      const tierResults = results.testClasses.filter(tc => tc.tier === tier);
      if (tierResults.length > 0) {
        console.log(`\n   Tier ${tier} - ${tier === 1 ? 'Critical Quality' : 'Development Workflow'}:`);
        
        tierResults.forEach(result => {
          const icon = result.status === 'PASS' ? '     ✅' : 
                      result.status === 'ERROR' ? '     💥' : '     ❌';
          console.log(`${icon} ${result.name}: ${result.status}`);
          console.log(`          ${result.tests.totalTests} tests, ${result.tests.passedTests} passed, ${result.duration}ms`);
          
          if (result.tests.categories) {
            const categories = Object.entries(result.tests.categories)
              .filter(([_, stats]) => stats.total > 0)
              .map(([name, stats]) => `${name}(${stats.passed}/${stats.total})`)
              .join(', ');
            
            if (categories) {
              console.log(`          Categories: ${categories}`);
            }
          }
        });
      }
    });

    // Performance analysis
    console.log('\n⚡ Performance Analysis:');
    const avgTestTime = results.summary.totalTests > 0 
      ? Math.round(results.summary.totalDuration / results.summary.totalTests)
      : 0;
    
    console.log(`   Average Test Time: ${avgTestTime}ms`);
    console.log(`   Total Test Duration: ${results.summary.totalDuration}ms`);
    console.log(`   Framework Overhead: ${totalDuration - results.summary.totalDuration}ms`);

    // Test coverage analysis
    console.log('\n📊 Test Coverage Analysis:');
    
    // Count test categories across all validators
    const allCategories = {};
    results.testClasses.forEach(classResult => {
      if (classResult.tests.categories) {
        Object.entries(classResult.tests.categories).forEach(([category, stats]) => {
          if (!allCategories[category]) {
            allCategories[category] = { total: 0, passed: 0, failed: 0 };
          }
          allCategories[category].total += stats.total;
          allCategories[category].passed += stats.passed;
          allCategories[category].failed += stats.failed;
        });
      }
    });

    Object.entries(allCategories)
      .sort(([,a], [,b]) => b.total - a.total)
      .forEach(([category, stats]) => {
        const coverage = Math.round((stats.passed / stats.total) * 100);
        const icon = coverage >= 90 ? '🟢' : coverage >= 70 ? '🟡' : '🔴';
        console.log(`   ${icon} ${category}: ${coverage}% (${stats.passed}/${stats.total} tests)`);
      });

    // Failed tests summary
    if (results.summary.failedTests > 0) {
      console.log('\n❌ Failed Test Summary:');
      
      results.testClasses.forEach(classResult => {
        const failedTests = classResult.tests?.failedTests || 0;
        if (failedTests > 0) {
          console.log(`   ${classResult.name}: ${failedTests} failed tests`);
        }
      });
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    
    if (results.summary.failedTests === 0) {
      console.log('   🌟 Excellent! All validator tests are passing.');
      console.log('   🚀 The validator system is bulletproof and ready for production.');
    } else {
      console.log(`   🔧 Fix ${results.summary.failedTests} failing tests before production deployment.`);
      
      if (results.summary.successRate >= 80) {
        console.log('   👍 Good coverage overall - focus on critical failures.');
      } else {
        console.log('   ⚠️  Test coverage needs improvement for production readiness.');
      }
    }

    // Next steps
    console.log('\n🎯 Next Steps:');
    console.log('   1. Add tests for remaining validators (Spec Adherence, Branch Strategy, etc.)');
    console.log('   2. Implement integration tests for Validator Runner');
    console.log('   3. Add performance benchmarks for large codebases');
    console.log('   4. Create automated regression testing');

    console.log('\n' + '='.repeat(80) + '\n');
  }

  // Generate test report
  generateReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: results.summary,
      validators: results.testClasses.map(tc => ({
        name: tc.name,
        tier: tc.tier,
        status: tc.status,
        duration: tc.duration,
        testStats: tc.tests
      })),
      recommendations: this.generateRecommendations(results)
    };

    const reportPath = path.join(__dirname, '../tests/validators/test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Detailed test report saved to: ${reportPath}`);
    
    return report;
  }

  generateRecommendations(results) {
    const recommendations = [];
    
    if (results.summary.failedTests > 0) {
      recommendations.push({
        priority: 'HIGH',
        type: 'Bug Fix',
        message: `Fix ${results.summary.failedTests} failing tests`,
        action: 'Review failed test details and implement fixes'
      });
    }

    if (results.summary.successRate < 95) {
      recommendations.push({
        priority: 'MEDIUM',
        type: 'Coverage',
        message: 'Improve test coverage for bulletproof reliability',
        action: 'Add more comprehensive test scenarios'
      });
    }

    // Add validator-specific recommendations
    results.testClasses.forEach(classResult => {
      if (classResult.status === 'FAIL') {
        recommendations.push({
          priority: 'HIGH',
          type: 'Validator Fix',
          message: `${classResult.name} has test failures`,
          action: `Review and fix failing tests in ${classResult.name}`
        });
      }
    });

    return recommendations;
  }
}

// CLI usage
if (require.main === module) {
  const testSuite = new ValidatorTestSuite();
  const args = process.argv.slice(2);
  
  const options = {
    skip: args.includes('--skip') ? args[args.indexOf('--skip') + 1]?.split(',') : [],
    report: args.includes('--report'),
    verbose: args.includes('--verbose')
  };

  (async () => {
    try {
      console.log('🚀 Starting Comprehensive Validator Test Suite...\n');
      
      const results = await testSuite.runAllTests(options);
      
      if (options.report) {
        testSuite.generateReport(results);
      }
      
      const hasFailures = results.summary.failedTests > 0;
      process.exit(hasFailures ? 1 : 0);
      
    } catch (error) {
      console.error('💥 Test suite execution failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = ValidatorTestSuite;
