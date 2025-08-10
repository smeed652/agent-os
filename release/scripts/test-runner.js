#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

class AgentOSTestRunner {
  constructor() {
    this.tests = [
      {
        name: 'Validator Tests',
        script: 'test-validators.js',
        description: 'Tests for spec creation and task completion validators'
      },
      {
        name: 'Lifecycle Tests', 
        script: 'test-lifecycle.js',
        description: 'Tests for lifecycle management system'
      },
      {
        name: 'Universal Rules Tests',
        script: 'test-rules.js',
        description: 'Tests for universal rules system and .mdc file validation'
      },
      {
        name: 'Rule Parser Tests',
        script: 'test-rule-parser.js',
        description: 'Tests for .mdc file parsing and processing'
      }
    ];
    this.results = [];
  }

  async runAllTests() {
    console.log('🧪 Agent OS Test Suite');
    console.log('======================\n');
    
    let totalPassed = 0;
    let totalFailed = 0;
    let totalErrors = 0;
    
    for (const test of this.tests) {
      console.log(`📋 Running ${test.name}...`);
      console.log(`   ${test.description}\n`);
      
      try {
        const result = await this.runTest(test.script);
        this.results.push({
          name: test.name,
          status: result.success ? 'PASS' : 'FAIL',
          output: result.output,
          error: result.error
        });
        
        if (result.success) {
          console.log(`✅ ${test.name}: PASSED\n`);
          totalPassed++;
        } else {
          console.log(`❌ ${test.name}: FAILED`);
          if (result.error) {
            console.log(`   Error: ${result.error}\n`);
          }
          totalFailed++;
        }
      } catch (error) {
        console.log(`⚠️ ${test.name}: ERROR`);
        console.log(`   ${error.message}\n`);
        this.results.push({
          name: test.name,
          status: 'ERROR',
          error: error.message
        });
        totalErrors++;
      }
    }
    
    this.displaySummary(totalPassed, totalFailed, totalErrors);
    
    // Exit with non-zero code if any tests failed
    const exitCode = (totalFailed + totalErrors) > 0 ? 1 : 0;
    process.exit(exitCode);
  }

  runTest(scriptName) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, scriptName);
      
      // Check if script exists
      const fs = require('fs');
      if (!fs.existsSync(scriptPath)) {
        reject(new Error(`Test script not found: ${scriptPath}`));
        return;
      }
      
      const child = spawn('node', [scriptPath], {
        cwd: path.dirname(__dirname),
        stdio: ['inherit', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        // Stream output in real-time but capture it too
        process.stdout.write(output);
      });
      
      child.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        process.stderr.write(output);
      });
      
      child.on('close', (code) => {
        resolve({
          success: code === 0,
          output: stdout,
          error: stderr || (code !== 0 ? `Process exited with code ${code}` : null)
        });
      });
      
      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  displaySummary(passed, failed, errors) {
    const total = passed + failed + errors;
    
    console.log('\n🏁 Test Suite Summary');
    console.log('====================');
    console.log(`Total Test Suites: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Errors: ${errors}`);
    
    if (total > 0) {
      const successRate = Math.round((passed / total) * 100);
      console.log(`\nSuccess Rate: ${successRate}%`);
    }
    
    if (failed > 0 || errors > 0) {
      console.log('\n🔍 Failed/Error Details:');
      this.results
        .filter(r => r.status === 'FAIL' || r.status === 'ERROR')
        .forEach(result => {
          console.log(`\n${result.name} (${result.status}):`);
          if (result.error) {
            console.log(`  Error: ${result.error}`);
          }
        });
      
      console.log('\n💡 Next Steps:');
      console.log('  - Review failed test output above');
      console.log('  - Run individual test suites for detailed debugging:');
      console.log('    npm run test:validators');
      console.log('    npm run test:lifecycle');
    } else {
      console.log('\n🎉 All tests passed! Agent OS is working correctly.');
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const runner = new AgentOSTestRunner();
  runner.runAllTests().catch(error => {
    console.error('❌ Test suite execution failed:', error);
    process.exit(1);
  });
}

module.exports = AgentOSTestRunner;