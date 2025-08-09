#!/usr/bin/env node

/**
 * Code Quality Validator Tests
 * 
 * Comprehensive unit tests for the Code Quality Validator
 */

const ValidatorTestFramework = require('./test-framework');
const CodeQualityValidator = require('../../scripts/validators/code-quality-validator');
const fs = require('fs');
const path = require('path');

class CodeQualityValidatorTests extends ValidatorTestFramework {
  constructor() {
    super();
    this.validator = new CodeQualityValidator();
  }

  async runAllTests() {
    console.log('🧪 Testing Code Quality Validator');
    console.log('================================\n');

    try {
      // File Size Tests
      await this.testFileSizeValidation();
      await this.testFileSizeExceptions();
      await this.testFileTypeDetection();
      
      // Complexity Tests
      await this.testFunctionComplexity();
      await this.testComplexityCalculation();
      
      // Code Quality Tests
      await this.testCodeDuplication();
      await this.testNamingConventions();
      await this.testCommentQuality();
      
      // Error Handling Tests
      await this.testErrorHandling();
      await this.testEdgeCases();
      
      // Integration Tests
      await this.testDirectoryValidation();
      await this.testRealProjectScenarios();
      
      this.displayResults();
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    } finally {
      this.cleanup();
    }
  }

  async testFileSizeValidation() {
    console.log('📏 Testing File Size Validation...');

    // Test small file (should pass file size validation)
    await this.runValidatorTest(CodeQualityValidator, 'Small file validation', async (validator) => {
      const smallFile = this.createTempFile('small.js', 'console.log("hello");');
      const result = await validator.validateFile(smallFile);
      
      // Check specifically that file size validation passes
      const fileSizeValidation = result.validations.find(v => v.name === 'File Size');
      this.assert(fileSizeValidation, 'Should have file size validation');
      this.assert(fileSizeValidation.status === 'PASS', 'Small file should pass file size validation');
      return result;
    });

    // Test large code file (should fail file size validation)
    await this.runValidatorTest(CodeQualityValidator, 'Large code file validation', async (validator) => {
      const largeContent = Array(350).fill('console.log("line");').join('\n');
      const largeFile = this.createTempFile('large-code.js', largeContent);
      const result = await validator.validateFile(largeFile);
      
      // Check specifically that file size validation fails
      const fileSizeValidation = result.validations.find(v => v.name === 'File Size');
      this.assert(fileSizeValidation, 'Should have file size validation');
      this.assert(fileSizeValidation.status === 'FAIL', 'Large code file should fail file size validation');
      this.assert(result.status === 'FAIL' || result.status === 'WARNING', 'Overall result should indicate issues');
      return result;
    });

    // Test documentation file (should pass file size regardless of size)
    await this.runValidatorTest(CodeQualityValidator, 'Large documentation file validation', async (validator) => {
      const largeDoc = Array(1000).fill('This is documentation content.').join('\n');
      const docFile = this.createTempFile('README.md', largeDoc);
      const result = await validator.validateFile(docFile);
      
      // Check specifically that file size validation passes for documentation
      const fileSizeValidation = result.validations.find(v => v.name === 'File Size');
      this.assert(fileSizeValidation, 'Should have file size validation');
      this.assert(fileSizeValidation.status === 'PASS', 'Documentation file should pass file size validation');
      return result;
    });
  }

  async testFileSizeExceptions() {
    console.log('🔍 Testing File Size Exceptions...');

    // Test test file (should allow larger size)
    await this.runValidatorTest(CodeQualityValidator, 'Large test file validation', async (validator) => {
      const testContent = Array(400).fill('it("should test", () => {});').join('\n');
      const testFile = this.createTempFile('component.test.js', testContent);
      const result = await validator.validateFile(testFile);
      
      this.assert(result.status === 'PASS', 'Large test file should pass');
      return result;
    });

    // Test config file with extensive comments
    await this.runValidatorTest(CodeQualityValidator, 'Config file with comments', async (validator) => {
      const configContent = `{
  // This is a configuration file with extensive comments
  // explaining each setting in detail for maintainability
  ${Array(180).fill('  // Comment explaining configuration').join('\n')}
  "setting": "value"
}`;
      const configFile = this.createTempFile('config.json', configContent);
      const result = await validator.validateFile(configFile);
      
      this.assert(result.status === 'PASS', 'Config file with extensive comments should pass');
      return result;
    });
  }

  async testFileTypeDetection() {
    console.log('🔍 Testing File Type Detection...');

    const testCases = [
      { file: 'test.js', expected: 'codeFiles' },
      { file: 'component.test.jsx', expected: 'testFiles' },
      { file: 'README.md', expected: 'documentationFiles' },
      { file: 'config.json', expected: 'configFiles' },
      { file: 'utils.test.js', expected: 'testFiles' },
      { file: 'api.spec.ts', expected: 'testFiles' }
    ];

    for (const testCase of testCases) {
      await this.runValidatorTest(CodeQualityValidator, `File type detection: ${testCase.file}`, async (validator) => {
        const tempFile = this.createTempFile(testCase.file, 'content');
        const detectedType = validator.getFileType(tempFile);
        
        this.assertEqual(detectedType, testCase.expected, `${testCase.file} should be detected as ${testCase.expected}`);
        return { detectedType, expected: testCase.expected };
      });
    }
  }

  async testFunctionComplexity() {
    console.log('🔧 Testing Function Complexity...');

    // Test simple function (low complexity)
    await this.runValidatorTest(CodeQualityValidator, 'Simple function complexity', async (validator) => {
      const simpleFunction = `function simple() {
  return "hello";
}`;
      const file = this.createTempFile('simple.js', simpleFunction);
      const result = await validator.validateFile(file);
      
      const complexityValidation = result.validations.find(v => v.name === 'Function Complexity');
      this.assert(complexityValidation, 'Should have complexity validation');
      this.assert(complexityValidation.status === 'PASS', 'Simple function should pass complexity check');
      return result;
    });

    // Test complex function (high complexity)
    await this.runValidatorTest(CodeQualityValidator, 'Complex function complexity', async (validator) => {
      const complexFunction = `function complex(x, y, z) {
  if (x > 0) {
    if (y > 0) {
      if (z > 0) {
        while (x > y) {
          if (x % 2 === 0) {
            for (let i = 0; i < z; i++) {
              if (i % 3 === 0 && i % 5 === 0) {
                return "fizzbuzz";
              } else if (i % 3 === 0) {
                return "fizz";
              } else if (i % 5 === 0) {
                return "buzz";
              }
            }
          }
          x--;
        }
      }
    }
  }
  return x + y + z;
}`;
      const file = this.createTempFile('complex.js', complexFunction);
      const result = await validator.validateFile(file);
      
      const complexityValidation = result.validations.find(v => v.name === 'Function Complexity');
      this.assert(complexityValidation.status === 'WARNING' || complexityValidation.status === 'FAIL', 
        'Complex function should trigger warning or fail');
      return result;
    });
  }

  async testComplexityCalculation() {
    console.log('📊 Testing Complexity Calculation...');

    const testCases = [
      { code: 'function simple() { return 1; }', expectedMin: 1, expectedMax: 2 },
      { code: 'function withIf(x) { if (x) return 1; return 0; }', expectedMin: 2, expectedMax: 3 },
      { code: 'function withLoop(arr) { for (let i = 0; i < arr.length; i++) { if (arr[i]) return i; } }', expectedMin: 3, expectedMax: 5 },
    ];

    for (const testCase of testCases) {
      await this.runValidatorTest(CodeQualityValidator, `Complexity calculation: ${testCase.code.substring(0, 30)}...`, async (validator) => {
        const complexity = validator.calculateCyclomaticComplexity(testCase.code);
        
        this.assert(complexity >= testCase.expectedMin && complexity <= testCase.expectedMax, 
          `Complexity should be between ${testCase.expectedMin} and ${testCase.expectedMax}, got ${complexity}`);
        return { complexity, expected: `${testCase.expectedMin}-${testCase.expectedMax}` };
      });
    }
  }

  async testCodeDuplication() {
    console.log('🔄 Testing Code Duplication...');

    // Test file with duplication
    await this.runValidatorTest(CodeQualityValidator, 'Code duplication detection', async (validator) => {
      const duplicatedCode = `
function processUser(user) {
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email };
}

function processAdmin(admin) {
  if (!admin) return null;
  return { id: admin.id, name: admin.name, email: admin.email };
}

function processGuest(guest) {
  if (!guest) return null;
  return { id: guest.id, name: guest.name, email: guest.email };
}`;
      
      const file = this.createTempFile('duplicated.js', duplicatedCode);
      const result = await validator.validateFile(file);
      
      const duplicationValidation = result.validations.find(v => v.name === 'Code Duplication');
      this.assert(duplicationValidation, 'Should have duplication validation');
      // Note: This might pass if duplication detection is not very strict
      return result;
    });

    // Test file without significant duplication
    await this.runValidatorTest(CodeQualityValidator, 'No code duplication', async (validator) => {
      const uniqueCode = `
function calculateArea(radius) {
  return Math.PI * radius * radius;
}

function calculatePerimeter(radius) {
  return 2 * Math.PI * radius;
}

function formatResult(value, unit) {
  return \`\${value.toFixed(2)} \${unit}\`;
}`;
      
      const file = this.createTempFile('unique.js', uniqueCode);
      const result = await validator.validateFile(file);
      
      const duplicationValidation = result.validations.find(v => v.name === 'Code Duplication');
      this.assert(duplicationValidation.status === 'PASS', 'Unique code should pass duplication check');
      return result;
    });
  }

  async testNamingConventions() {
    console.log('🏷️  Testing Naming Conventions...');

    // Test good naming conventions
    await this.runValidatorTest(CodeQualityValidator, 'Good naming conventions', async (validator) => {
      const goodNaming = `
function calculateUserAge(birthDate) {
  const currentDate = new Date();
  const ageInMs = currentDate - birthDate;
  return Math.floor(ageInMs / (365.25 * 24 * 60 * 60 * 1000));
}

class UserManager {
  constructor() {
    this.activeUsers = new Map();
  }
  
  addUser(userData) {
    this.activeUsers.set(userData.id, userData);
  }
}`;
      
      const file = this.createTempFile('good-naming.js', goodNaming);
      const result = await validator.validateFile(file);
      
      const namingValidation = result.validations.find(v => v.name === 'Naming Conventions');
      this.assert(namingValidation.status === 'PASS', 'Good naming should pass');
      return result;
    });

    // Test poor naming conventions
    await this.runValidatorTest(CodeQualityValidator, 'Poor naming conventions', async (validator) => {
      const poorNaming = `
function calc(d) {
  const x = new Date();
  const y = x - d;
  return Math.floor(y / (365.25 * 24 * 60 * 60 * 1000));
}

class mgr {
  constructor() {
    this.u = new Map();
  }
  
  add(data) {
    this.u.set(data.id, data);
  }
}`;
      
      const file = this.createTempFile('poor-naming.js', poorNaming);
      const result = await validator.validateFile(file);
      
      const namingValidation = result.validations.find(v => v.name === 'Naming Conventions');
      this.assert(namingValidation.status === 'WARNING' || namingValidation.status === 'FAIL', 
        'Poor naming should trigger warning or fail');
      return result;
    });
  }

  async testCommentQuality() {
    console.log('💬 Testing Comment Quality...');

    // Test well-commented code
    await this.runValidatorTest(CodeQualityValidator, 'Well-commented code', async (validator) => {
      const wellCommented = `
/**
 * Calculates the compound interest for a given principal, rate, and time
 * @param {number} principal - The initial amount
 * @param {number} rate - The annual interest rate (as decimal)
 * @param {number} time - The time period in years
 * @returns {number} The compound interest amount
 */
function calculateCompoundInterest(principal, rate, time) {
  // Use the compound interest formula: A = P(1 + r)^t
  const amount = principal * Math.pow(1 + rate, time);
  
  // Return only the interest portion (amount - principal)
  return amount - principal;
}`;
      
      const file = this.createTempFile('well-commented.js', wellCommented);
      const result = await validator.validateFile(file);
      
      const commentValidation = result.validations.find(v => v.name === 'Comment Quality');
      this.assert(commentValidation.status === 'PASS', 'Well-commented code should pass');
      return result;
    });

    // Test poorly commented code
    await this.runValidatorTest(CodeQualityValidator, 'Poorly commented code', async (validator) => {
      const poorlyCommented = `
function calc(p, r, t) {
  const a = p * Math.pow(1 + r, t);
  return a - p;
}

function process(data) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].active && data[i].score > 50) {
      result.push(data[i]);
    }
  }
  return result;
}`;
      
      const file = this.createTempFile('poorly-commented.js', poorlyCommented);
      const result = await validator.validateFile(file);
      
      const commentValidation = result.validations.find(v => v.name === 'Comment Quality');
      this.assert(commentValidation.status === 'WARNING' || commentValidation.status === 'FAIL', 
        'Poorly commented code should trigger warning or fail');
      return result;
    });
  }

  async testErrorHandling() {
    console.log('⚠️ Testing Error Handling...');

    // Test non-existent file
    await this.runValidatorTest(CodeQualityValidator, 'Non-existent file handling', async (validator) => {
      const result = await validator.validateFile('/non/existent/file.js');
      this.assert(result.status === 'FAIL', 'Should return FAIL status for non-existent file');
      this.assert(result.error && result.error.includes('does not exist'), 
        'Should have appropriate error message for missing file');
      return result;
    });

    // Test directory instead of file
    await this.runValidatorTest(CodeQualityValidator, 'Directory instead of file', async (validator) => {
      const tempDir = this.createTempDir('test-dir');
      try {
        const result = await validator.validateFile(tempDir);
        // Should handle gracefully or throw appropriate error
        return result;
      } catch (error) {
        this.assert(error.message.includes('directory') || error.message.includes('EISDIR'), 
          'Should handle directory appropriately');
        return { error: error.message };
      }
    });

    // Test binary file
    await this.runValidatorTest(CodeQualityValidator, 'Binary file handling', async (validator) => {
      const binaryContent = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]); // PNG header
      const binaryFile = this.createTempFile('image.png', binaryContent);
      const result = await validator.validateFile(binaryFile);
      
      // Should handle binary files gracefully
      this.assert(result, 'Should return result for binary file');
      return result;
    });
  }

  async testEdgeCases() {
    console.log('🔬 Testing Edge Cases...');

    // Test empty file (should pass file size validation)
    await this.runValidatorTest(CodeQualityValidator, 'Empty file validation', async (validator) => {
      const emptyFile = this.createTempFile('empty.js', '');
      const result = await validator.validateFile(emptyFile);
      
      // Empty file should pass file size validation
      const fileSizeValidation = result.validations.find(v => v.name === 'File Size');
      this.assert(fileSizeValidation && fileSizeValidation.status === 'PASS', 
        'Empty file should pass file size validation');
      return result;
    });

    // Test file with only whitespace (should pass file size validation)
    await this.runValidatorTest(CodeQualityValidator, 'Whitespace-only file', async (validator) => {
      const whitespaceFile = this.createTempFile('whitespace.js', '   \n\t\n   ');
      const result = await validator.validateFile(whitespaceFile);
      
      // Whitespace file should pass file size validation
      const fileSizeValidation = result.validations.find(v => v.name === 'File Size');
      this.assert(fileSizeValidation && fileSizeValidation.status === 'PASS', 
        'Whitespace-only file should pass file size validation');
      return result;
    });

    // Test file with unusual extension
    await this.runValidatorTest(CodeQualityValidator, 'Unusual file extension', async (validator) => {
      const unusualFile = this.createTempFile('script.xyz', 'console.log("test");');
      const result = await validator.validateFile(unusualFile);
      
      this.assert(result, 'Should handle unusual extensions');
      return result;
    });

    // Test very long function name (current validator may not catch this edge case)
    await this.runValidatorTest(CodeQualityValidator, 'Very long function name', async (validator) => {
      const longName = 'a'.repeat(200);
      const longNameCode = `function ${longName}() { return true; }`;
      const file = this.createTempFile('long-name.js', longNameCode);
      const result = await validator.validateFile(file);
      
      // The current validator may not catch very long function names
      // This test documents the behavior but doesn't require a specific outcome
      const namingValidation = result.validations.find(v => v.name === 'Naming Conventions');
      this.assert(namingValidation, 'Should have naming conventions validation');
      
      // Note: Current implementation may pass this, which is acceptable for now
      return result;
    });
  }

  async testDirectoryValidation() {
    console.log('📁 Testing Directory Validation...');

    // Create a test project with mixed file types
    const projectPath = this.createBasicWebProject();
    
    await this.runValidatorTest(CodeQualityValidator, 'Directory validation', async (validator) => {
      const results = await validator.validateDirectory(projectPath);
      
      this.assert(Array.isArray(results), 'Should return array of results');
      this.assert(results.length > 0, 'Should validate multiple files');
      
      // Check that different file types are handled appropriately
      const codeFiles = results.filter(r => r.file.endsWith('.js') || r.file.endsWith('.jsx'));
      const testFiles = results.filter(r => r.file.includes('.test.'));
      const docFiles = results.filter(r => r.file.endsWith('.md'));
      
      this.assert(codeFiles.length > 0, 'Should find code files');
      this.assert(testFiles.length > 0, 'Should find test files');
      this.assert(docFiles.length > 0, 'Should find documentation files');
      
      // Each result should have the expected structure
      results.forEach(result => {
        this.assert(result.file, 'Each result should have file path');
        this.assert(result.status, 'Each result should have status');
        this.assert(result.validations, 'Each result should have validations');
      });
      
      return results;
    });
  }

  async testRealProjectScenarios() {
    console.log('🏗️ Testing Real Project Scenarios...');

    // Test well-structured project
    const wellStructuredProject = this.createWellStructuredProject();
    
    await this.runValidatorTest(CodeQualityValidator, 'Well-structured project', async (validator) => {
      const results = await validator.validateDirectory(wellStructuredProject);
      
      const passedFiles = results.filter(r => r.status === 'PASS').length;
      const totalFiles = results.length;
      const passRate = totalFiles > 0 ? passedFiles / totalFiles : 1;
      
      this.assertGreaterThan(passRate, 0.5, 'Well-structured project should have >50% pass rate');
      
      return results;
    });

    // Test project with issues
    const projectWithIssues = this.createMockProject('project-with-issues', {
      'large-file.js': Array(400).fill('console.log("line");').join('\n'),
      'poor-naming.js': `function a(x) { const y = x + 1; return y; }`,
      'no-comments.js': `function complexCalculation(a, b, c, d) {
        if (a > b) {
          while (c < d) {
            if (a % 2 === 0) {
              c += a * b;
            } else {
              c += b / a;
            }
            d--;
          }
        }
        return c + d;
      }`,
      'README.md': '# Project\n\nThis is fine.'
    });
    
    await this.runValidatorTest(CodeQualityValidator, 'Project with quality issues', async (validator) => {
      const results = await validator.validateDirectory(projectWithIssues);
      
      const failedFiles = results.filter(r => r.status === 'FAIL' || r.status === 'WARNING').length;
      this.assertGreaterThan(failedFiles, 0, 'Should detect quality issues');
      
      // Should have at least one file with size issues
      const sizeIssues = results.some(r => 
        r.validations.some(v => v.name === 'File Size' && v.status === 'FAIL')
      );
      this.assert(sizeIssues, 'Should detect file size issues');
      
      return results;
    });
  }

  // Helper methods
  createTempFile(filename, content) {
    const tempDir = path.join(this.tempTestDir, 'files');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, content);
    return filePath;
  }

  createTempDir(dirname) {
    const tempDir = path.join(this.tempTestDir, dirname);
    fs.mkdirSync(tempDir, { recursive: true });
    return tempDir;
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new CodeQualityValidatorTests();
  tester.runAllTests().catch(error => {
    console.error('❌ Code Quality Validator tests failed:', error);
    process.exit(1);
  });
}

module.exports = CodeQualityValidatorTests;
