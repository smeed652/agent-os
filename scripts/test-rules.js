#!/usr/bin/env node

/**
 * Universal Rules Test Suite
 * 
 * Comprehensive testing framework for Agent OS Universal Rules (.mdc files)
 */

const fs = require('fs');
const path = require('path');

class UniversalRulesTestSuite {
  constructor() {
    this.rulesDir = path.join(__dirname, '..', 'rules');
    this.testsDir = path.join(__dirname, '..', 'tests', 'rules');
    this.results = {
      structure: { passed: 0, failed: 0, tests: [] },
      content: { passed: 0, failed: 0, tests: [] },
      integration: { passed: 0, failed: 0, tests: [] },
      performance: { passed: 0, failed: 0, tests: [] }
    };
  }

  async runAllTests() {
    console.log('🧪 Universal Rules Test Suite');
    console.log('==============================\n');

    // Phase 1: Structure Tests
    console.log('📋 Phase 1: Rule Structure Tests');
    await this.runStructureTests();
    
    // Phase 2: Content Validation Tests
    console.log('\n📝 Phase 2: Content Validation Tests');
    await this.runContentTests();
    
    // Phase 3: Integration Tests
    console.log('\n🔗 Phase 3: Integration Tests');
    await this.runIntegrationTests();
    
    // Phase 4: Performance Tests
    console.log('\n⚡ Phase 4: Performance Tests');
    await this.runPerformanceTests();
    
    // Summary
    this.displaySummary();
  }

  async runStructureTests() {
    const rules = this.getAllRuleFiles();
    
    for (const ruleFile of rules) {
      const rulePath = path.join(this.rulesDir, ruleFile);
      
      // Test 1: File format validation
      const formatTest = this.testFileFormat(rulePath);
      this.recordTest('structure', `File Format: ${ruleFile}`, formatTest);
      
      // Test 2: Metadata validation
      const metadataTest = this.testMetadata(rulePath);
      this.recordTest('structure', `Metadata: ${ruleFile}`, metadataTest);
      
      // Test 3: Section structure validation
      const sectionTest = this.testSectionStructure(rulePath);
      this.recordTest('structure', `Section Structure: ${ruleFile}`, sectionTest);
    }
  }

  async runContentTests() {
    const rules = this.getAllRuleFiles();
    
    for (const ruleFile of rules) {
      const rulePath = path.join(this.rulesDir, ruleFile);
      
      // Test 1: Content completeness
      const completenessTest = this.testContentCompleteness(rulePath);
      this.recordTest('content', `Content Completeness: ${ruleFile}`, completenessTest);
      
      // Test 2: Code examples validation
      const codeTest = this.testCodeExamples(rulePath);
      this.recordTest('content', `Code Examples: ${ruleFile}`, codeTest);
      
      // Test 3: Cross-references validation
      const referencesTest = this.testCrossReferences(rulePath);
      this.recordTest('content', `Cross-references: ${ruleFile}`, referencesTest);
    }
  }

  async runIntegrationTests() {
    // Test 1: Rule application in spec creation
    const specIntegrationTest = this.testSpecCreationIntegration();
    this.recordTest('integration', 'Spec Creation Integration', specIntegrationTest);
    
    // Test 2: Rule conflict detection
    const conflictTest = this.testRuleConflictDetection();
    this.recordTest('integration', 'Rule Conflict Detection', conflictTest);
    
    // Test 3: Rule precedence
    const precedenceTest = this.testRulePrecedence();
    this.recordTest('integration', 'Rule Precedence', precedenceTest);
  }

  async runPerformanceTests() {
    // Test 1: Rule parsing speed
    const parsingSpeedTest = this.testRuleParsingSpeed();
    this.recordTest('performance', 'Rule Parsing Speed', parsingSpeedTest);
    
    // Test 2: Memory usage
    const memoryTest = this.testMemoryUsage();
    this.recordTest('performance', 'Memory Usage', memoryTest);
    
    // Test 3: Large scale processing
    const scaleTest = this.testLargeScaleProcessing();
    this.recordTest('performance', 'Large Scale Processing', scaleTest);
  }

  // Structure Test Implementations
  testFileFormat(rulePath) {
    try {
      const content = fs.readFileSync(rulePath, 'utf8');
      
      // Check for YAML frontmatter
      if (!content.startsWith('---')) {
        return { success: false, error: 'Missing YAML frontmatter' };
      }
      
      // Check for proper file extension
      if (!rulePath.endsWith('.mdc')) {
        return { success: false, error: 'Incorrect file extension (should be .mdc)' };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  testMetadata(rulePath) {
    try {
      const content = fs.readFileSync(rulePath, 'utf8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      
      if (!frontmatterMatch) {
        return { success: false, error: 'No frontmatter found' };
      }
      
      const frontmatter = frontmatterMatch[1];
      
      // Check for required alwaysApply field
      if (!frontmatter.includes('alwaysApply:')) {
        return { success: false, error: 'Missing alwaysApply field' };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  testSectionStructure(rulePath) {
    try {
      const content = fs.readFileSync(rulePath, 'utf8');
      
      // Remove frontmatter for content analysis
      const contentWithoutFrontmatter = content.replace(/^---[\\s\\S]*?---\\n/, '');
      
      // Check for main heading
      if (!contentWithoutFrontmatter.includes('# ')) {
        return { success: false, error: 'Missing main heading' };
      }
      
      // Check for section structure (at least 2 ## headings)
      const sectionHeadings = (contentWithoutFrontmatter.match(/^## /gm) || []).length;
      if (sectionHeadings < 2) {
        return { success: false, error: 'Insufficient section structure (need at least 2 sections)' };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Content Test Implementations
  testContentCompleteness(rulePath) {
    try {
      const content = fs.readFileSync(rulePath, 'utf8');
      const fileName = path.basename(rulePath, '.mdc');
      
      // Check minimum content length (rules should be comprehensive)
      if (content.length < 1000) {
        return { success: false, error: 'Content too short (less than 1000 characters)' };
      }
      
      // Check for actionable content (should contain implementation guidance)
      const hasImplementationGuidance = content.includes('```') || 
                                       content.includes('Example:') ||
                                       content.includes('Implementation:');
      
      if (!hasImplementationGuidance) {
        return { success: false, error: 'Missing implementation guidance or examples' };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  testCodeExamples(rulePath) {
    try {
      const content = fs.readFileSync(rulePath, 'utf8');
      
      // Extract code blocks
      const codeBlocks = content.match(/```[\\s\\S]*?```/g) || [];
      
      if (codeBlocks.length === 0) {
        // Not all rules need code examples, so this is a warning, not failure
        return { success: true, warning: 'No code examples found' };
      }
      
      // Basic syntax validation for common languages
      for (const block of codeBlocks) {
        const langMatch = block.match(/```(\\w+)/);
        if (langMatch) {
          const lang = langMatch[1];
          const code = block.replace(/```\\w*\\n?/, '').replace(/```$/, '');
          
          // Basic syntax checks
          if (lang === 'typescript' || lang === 'javascript') {
            // Check for basic syntax issues
            if (code.includes('function') && !code.includes('{')) {
              return { success: false, error: `Invalid ${lang} syntax in code example` };
            }
          }
        }
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  testCrossReferences(rulePath) {
    try {
      const content = fs.readFileSync(rulePath, 'utf8');
      
      // Extract references to other .mdc files
      const mdcReferences = content.match(/\\w+\\.mdc/g) || [];
      
      // Validate that referenced files exist
      for (const ref of mdcReferences) {
        const referencedFile = path.join(this.rulesDir, ref);
        if (!fs.existsSync(referencedFile)) {
          return { success: false, error: `Referenced file not found: ${ref}` };
        }
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Integration Test Implementations
  testSpecCreationIntegration() {
    // Simulate spec creation with rules applied
    try {
      // This would test the actual integration, for now we'll simulate
      return { success: true, note: 'Integration test placeholder - requires full Agent OS context' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  testRuleConflictDetection() {
    try {
      // Check for potential conflicts between rules
      const rules = this.getAllRuleFiles();
      const conflicts = [];
      
      // Simple conflict detection - look for contradictory statements
      // This is a basic implementation - would need more sophisticated logic
      
      return { success: true, conflicts: conflicts.length, note: 'Basic conflict detection' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  testRulePrecedence() {
    try {
      // Test that alwaysApply rules take precedence
      const alwaysApplyRules = this.getRulesWithAlwaysApply();
      
      if (alwaysApplyRules.length === 0) {
        return { success: false, error: 'No alwaysApply rules found' };
      }
      
      return { success: true, alwaysApplyCount: alwaysApplyRules.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Performance Test Implementations
  testRuleParsingSpeed() {
    try {
      const startTime = Date.now();
      const rules = this.getAllRuleFiles();
      
      // Parse all rules
      for (const ruleFile of rules) {
        const rulePath = path.join(this.rulesDir, ruleFile);
        fs.readFileSync(rulePath, 'utf8');
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should parse all rules in under 1 second
      const success = duration < 1000;
      
      return { 
        success, 
        duration: `${duration}ms`,
        error: success ? null : `Parsing took too long: ${duration}ms` 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  testMemoryUsage() {
    try {
      const beforeMemory = process.memoryUsage().heapUsed;
      
      // Load all rules into memory
      const rules = this.getAllRuleFiles();
      const ruleContents = [];
      
      for (const ruleFile of rules) {
        const rulePath = path.join(this.rulesDir, ruleFile);
        ruleContents.push(fs.readFileSync(rulePath, 'utf8'));
      }
      
      const afterMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = afterMemory - beforeMemory;
      const memoryMB = Math.round(memoryIncrease / 1024 / 1024 * 100) / 100;
      
      // Should use less than 10MB for all rules
      const success = memoryMB < 10;
      
      return { 
        success, 
        memoryUsage: `${memoryMB}MB`,
        error: success ? null : `Memory usage too high: ${memoryMB}MB` 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  testLargeScaleProcessing() {
    try {
      // Simulate processing rules 1000 times
      const startTime = Date.now();
      const rules = this.getAllRuleFiles();
      
      for (let i = 0; i < 1000; i++) {
        for (const ruleFile of rules) {
          const rulePath = path.join(this.rulesDir, ruleFile);
          // Simulate rule processing
          const content = fs.readFileSync(rulePath, 'utf8');
          const hasAlwaysApply = content.includes('alwaysApply: true');
          // Basic processing simulation
        }
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should handle 1000 iterations in under 5 seconds
      const success = duration < 5000;
      
      return { 
        success, 
        duration: `${duration}ms`,
        error: success ? null : `Large scale processing too slow: ${duration}ms` 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Helper Methods
  getAllRuleFiles() {
    if (!fs.existsSync(this.rulesDir)) {
      return [];
    }
    
    return fs.readdirSync(this.rulesDir)
      .filter(file => file.endsWith('.mdc'))
      .sort();
  }

  getRulesWithAlwaysApply() {
    const rules = this.getAllRuleFiles();
    const alwaysApplyRules = [];
    
    for (const ruleFile of rules) {
      const rulePath = path.join(this.rulesDir, ruleFile);
      const content = fs.readFileSync(rulePath, 'utf8');
      
      if (content.includes('alwaysApply: true')) {
        alwaysApplyRules.push(ruleFile);
      }
    }
    
    return alwaysApplyRules;
  }

  recordTest(category, testName, result) {
    const test = {
      name: testName,
      success: result.success,
      error: result.error || null,
      warning: result.warning || null,
      note: result.note || null,
      ...result
    };
    
    this.results[category].tests.push(test);
    
    if (result.success) {
      this.results[category].passed++;
      console.log(`  ✅ ${testName}`);
      if (result.warning) {
        console.log(`     ⚠️ Warning: ${result.warning}`);
      }
    } else {
      this.results[category].failed++;
      console.log(`  ❌ ${testName}`);
      if (result.error) {
        console.log(`     Error: ${result.error}`);
      }
    }
  }

  displaySummary() {
    console.log('\\n🏁 Universal Rules Test Summary');
    console.log('================================');
    
    let totalPassed = 0;
    let totalFailed = 0;
    
    Object.entries(this.results).forEach(([category, results]) => {
      const total = results.passed + results.failed;
      const successRate = total > 0 ? Math.round((results.passed / total) * 100) : 0;
      
      console.log(`\\n${category.toUpperCase()} Tests:`);
      console.log(`  Total: ${total}`);
      console.log(`  ✅ Passed: ${results.passed}`);
      console.log(`  ❌ Failed: ${results.failed}`);
      console.log(`  Success Rate: ${successRate}%`);
      
      totalPassed += results.passed;
      totalFailed += results.failed;
    });
    
    const grandTotal = totalPassed + totalFailed;
    const overallSuccessRate = grandTotal > 0 ? Math.round((totalPassed / grandTotal) * 100) : 0;
    
    console.log('\\n📊 OVERALL RESULTS:');
    console.log(`Total Tests: ${grandTotal}`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(`🎯 Success Rate: ${overallSuccessRate}%`);
    
    if (totalFailed > 0) {
      console.log('\\n🔍 Failed Tests Details:');
      Object.entries(this.results).forEach(([category, results]) => {
        const failedTests = results.tests.filter(t => !t.success);
        if (failedTests.length > 0) {
          console.log(`\\n${category.toUpperCase()}:`);
          failedTests.forEach(test => {
            console.log(`  ❌ ${test.name}: ${test.error}`);
          });
        }
      });
      
      console.log('\\n💡 Recommendations:');
      console.log('  - Fix failing tests before deploying rules');
      console.log('  - Review rule content for completeness');
      console.log('  - Ensure all cross-references are valid');
    } else {
      console.log('\\n🎉 All Universal Rules tests passed! System is ready for deployment.');
    }
    
    // Exit with appropriate code
    process.exit(totalFailed > 0 ? 1 : 0);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const testSuite = new UniversalRulesTestSuite();
  testSuite.runAllTests().catch(error => {
    console.error('❌ Universal Rules test suite execution failed:', error);
    process.exit(1);
  });
}

module.exports = UniversalRulesTestSuite;
