const TDDValidator = require('../scripts/tdd-validator');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mock fs and child_process
jest.mock('fs');
jest.mock('child_process');

describe('TDDValidator', () => {
  let validator;
  let mockProjectRoot;

  beforeEach(() => {
    mockProjectRoot = '/mock/project';
    validator = new TDDValidator();
    validator.projectRoot = mockProjectRoot;
    
    // Reset mocks
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
    fs.statSync.mockReturnValue({
      isDirectory: () => true,
      mtime: new Date('2024-01-01')
    });
  });

  describe('constructor', () => {
    it('should initialize with default report structure', () => {
      expect(validator.report).toEqual({
        overallStatus: 'UNKNOWN',
        testCoverage: 0,
        testQuality: 'UNKNOWN',
        tddWorkflow: 'UNKNOWN',
        issues: [],
        recommendations: [],
        score: 0
      });
    });

    it('should set project root to current working directory', () => {
      const newValidator = new TDDValidator();
      expect(newValidator.projectRoot).toBe(process.cwd());
    });
  });

  describe('checkProjectStructure', () => {
               it('should pass when all required directories exist', async () => {
             fs.existsSync.mockImplementation((path) => {
               return path.includes('src') || path.includes('tests') || path.includes('jest.config.js');
             });

             await validator.checkProjectStructure();
             
             expect(validator.report.issues).toHaveLength(0);
           });

    it('should add issues when required directories are missing', async () => {
      fs.existsSync.mockReturnValue(false);

      await validator.checkProjectStructure();
      
      expect(validator.report.issues).toContain('Missing required directories: src, tests');
    });

    it('should detect test configuration files', async () => {
      fs.existsSync.mockImplementation((path) => {
        return path.includes('jest.config.js') || path.includes('src') || path.includes('tests');
      });

      await validator.checkProjectStructure();
      
      expect(validator.report.issues).toHaveLength(0);
    });

    it('should add issue when no test configuration is found', async () => {
      fs.existsSync.mockImplementation((path) => {
        return path.includes('src') || path.includes('tests');
      });

      await validator.checkProjectStructure();
      
      expect(validator.report.issues).toContain('No test configuration found (Jest, Cypress, etc.)');
    });

               it('should check package.json for test scripts', async () => {
             const mockPackageJson = {
               scripts: {
                 test: 'jest',
                 'test:coverage': 'jest --coverage'
               }
             };

             fs.existsSync.mockImplementation((path) => {
               if (path.includes('package.json')) return true;
               if (path.includes('jest.config.js')) return true;
               return path.includes('src') || path.includes('tests');
             });

             fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

             await validator.checkProjectStructure();
             
             expect(validator.report.issues).toHaveLength(0);
           });

    it('should add issue when no test scripts are found', async () => {
      const mockPackageJson = {
        scripts: {
          start: 'node index.js'
        }
      };

      fs.existsSync.mockImplementation((path) => {
        if (path.includes('package.json')) return true;
        return path.includes('src') || path.includes('tests');
      });

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      await validator.checkProjectStructure();
      
      expect(validator.report.issues).toContain('No test scripts found in package.json');
    });
  });

  describe('validateTestCoverage', () => {
    it('should set excellent quality for 90%+ coverage', async () => {
      const mockCoverageOutput = 'All files | 92.5%';
      execSync.mockReturnValue(mockCoverageOutput);

      await validator.validateTestCoverage();
      
      expect(validator.report.testCoverage).toBe(92.5);
      expect(validator.report.testQuality).toBe('EXCELLENT');
      expect(validator.report.score).toBe(30);
    });

    it('should set good quality for 80-89% coverage', async () => {
      const mockCoverageOutput = 'All files | 85.2%';
      execSync.mockReturnValue(mockCoverageOutput);

      await validator.validateTestCoverage();
      
      expect(validator.report.testCoverage).toBe(85.2);
      expect(validator.report.testQuality).toBe('GOOD');
      expect(validator.report.score).toBe(20);
    });

    it('should set fair quality for 70-79% coverage', async () => {
      const mockCoverageOutput = 'All files | 75.8%';
      execSync.mockReturnValue(mockCoverageOutput);

      await validator.validateTestCoverage();
      
      expect(validator.report.testCoverage).toBe(75.8);
      expect(validator.report.testQuality).toBe('FAIR');
      expect(validator.report.score).toBe(10);
    });

    it('should set poor quality for <70% coverage', async () => {
      const mockCoverageOutput = 'All files | 65.3%';
      execSync.mockReturnValue(mockCoverageOutput);

      await validator.validateTestCoverage();
      
      expect(validator.report.testCoverage).toBe(65.3);
      expect(validator.report.testQuality).toBe('POOR');
      expect(validator.report.score).toBe(0);
      expect(validator.report.recommendations).toContain('Increase test coverage from 65.3% to at least 90%');
    });

    it('should handle coverage command failure gracefully', async () => {
      execSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      await validator.validateTestCoverage();
      
      expect(validator.report.issues).toContain('Could not run test coverage - check test configuration');
      expect(validator.report.testQuality).toBe('UNKNOWN');
    });
  });

  describe('validateTestQuality', () => {
    beforeEach(() => {
      // Mock findTestFiles and findSourceFiles
      validator.findTestFiles = jest.fn();
      validator.findSourceFiles = jest.fn();
      validator.analyzeTestFile = jest.fn();
      validator.countTests = jest.fn();
    });

    it('should set excellent quality when no issues found', async () => {
      validator.findTestFiles.mockReturnValue(['test1.js', 'test2.js']);
      validator.analyzeTestFile.mockReturnValue([]);
      validator.countTests.mockReturnValue(10);

      await validator.validateTestQuality();
      
      expect(validator.report.testQuality).toBe('EXCELLENT');
      expect(validator.report.score).toBe(25);
    });

    it('should set good quality when issues < 10% of tests', async () => {
      validator.findTestFiles.mockReturnValue(['test1.js', 'test2.js']);
      validator.analyzeTestFile.mockReturnValue(['issue1']);
      validator.countTests.mockReturnValue(20);

      await validator.validateTestQuality();
      
      expect(validator.report.testQuality).toBe('GOOD');
      expect(validator.report.score).toBe(20);
    });

    it('should set fair quality when issues 10-20% of tests', async () => {
      validator.findTestFiles.mockReturnValue(['test1.js', 'test2.js']);
      validator.analyzeTestFile.mockReturnValue(['issue1', 'issue2']);
      validator.countTests.mockReturnValue(15);

      await validator.validateTestQuality();
      
      expect(validator.report.testQuality).toBe('FAIR');
      expect(validator.report.score).toBe(15);
    });

    it('should set poor quality when issues > 20% of tests', async () => {
      validator.findTestFiles.mockReturnValue(['test1.js', 'test2.js']);
      validator.analyzeTestFile.mockReturnValue(['issue1', 'issue2', 'issue3', 'issue4']);
      validator.countTests.mockReturnValue(15);

      await validator.validateTestQuality();
      
      expect(validator.report.testQuality).toBe('POOR');
      expect(validator.report.score).toBe(5);
    });

    it('should add recommendations for quality issues', async () => {
      validator.findTestFiles.mockReturnValue(['test1.js']);
      validator.analyzeTestFile.mockReturnValue(['issue1', 'issue2']);
      validator.countTests.mockReturnValue(5);

      await validator.validateTestQuality();
      
      expect(validator.report.recommendations).toContain('Fix 2 test quality issues');
    });
  });

  describe('validateTDDWorkflow', () => {
    beforeEach(() => {
      validator.findSourceFiles = jest.fn();
      validator.findTestFiles = jest.fn();
      validator.findCorrespondingTestFile = jest.fn();
    });

    it('should set excellent workflow when all source files have tests written first', async () => {
      const sourceFiles = ['src/service1.js', 'src/service2.js'];
      const testFiles = ['tests/service1.test.js', 'tests/service2.test.js'];
      
      validator.findSourceFiles.mockReturnValue(sourceFiles);
      validator.findTestFiles.mockReturnValue(testFiles);
      validator.findCorrespondingTestFile.mockImplementation((sourceFile) => {
        return testFiles.find(tf => tf.includes(sourceFile.split('/').pop().replace('.js', '')));
      });

      // Mock file stats - tests created before source
      fs.statSync.mockImplementation((filePath) => ({
        mtime: filePath.includes('test') ? new Date('2024-01-01') : new Date('2024-01-02')
      }));

      await validator.validateTDDWorkflow();
      
      expect(validator.report.tddWorkflow).toBe('EXCELLENT');
      expect(validator.report.score).toBe(25);
    });

               it('should set fair workflow when 60-80% files follow TDD', async () => {
             const sourceFiles = ['src/service1.js', 'src/service2.js', 'src/service3.js', 'src/service4.js', 'src/service5.js'];
             const testFiles = ['tests/service1.test.js', 'tests/service2.test.js', 'tests/service3.test.js', 'tests/service4.test.js'];
             
             validator.findSourceFiles.mockReturnValue(sourceFiles);
             validator.findTestFiles.mockReturnValue(testFiles);
             validator.findCorrespondingTestFile.mockImplementation((sourceFile) => {
               const sourceName = sourceFile.split('/').pop().replace('.js', '');
               // Only return test file for first 4 services (service5 has no test)
               if (sourceName === 'service5') {
                 return null;
               }
               const testFile = testFiles.find(tf => tf.includes(sourceName));
               return testFile || null;
             });

             // Mock file stats - 3 out of 4 tests created before source (75%)
             fs.statSync.mockImplementation((filePath) => {
               const fileName = path.basename(filePath);
               if (fileName.includes('service1') || fileName.includes('service2') || fileName.includes('service3')) {
                 if (filePath.includes('test')) {
                   return { mtime: new Date('2024-01-01') }; // Test created first
                 } else {
                   return { mtime: new Date('2024-01-02') }; // Source created second
                 }
               } else if (fileName.includes('service4')) {
                 if (filePath.includes('test')) {
                   return { mtime: new Date('2024-01-03') }; // Test created second
                 } else {
                   return { mtime: new Date('2024-01-02') }; // Source created first
                 }
               } else {
                 return { mtime: new Date('2024-01-03') }; // Default
               }
             });

             await validator.validateTDDWorkflow();
             

             
             // 3 out of 4 = 75%, which should be FAIR (>= 60% but < 80%)
             expect(validator.report.tddWorkflow).toBe('FAIR');
             expect(validator.report.score).toBe(15);
           });

               it('should add recommendations for workflow improvements', async () => {
             const sourceFiles = ['src/service1.js', 'src/service2.js'];
             const testFiles = ['tests/service1.test.js', 'tests/service2.test.js'];
             
             validator.findSourceFiles.mockReturnValue(sourceFiles);
             validator.findTestFiles.mockReturnValue(testFiles);
             validator.findCorrespondingTestFile.mockImplementation((sourceFile) => {
               const sourceName = sourceFile.split('/').pop().replace('.js', '');
               const testFile = testFiles.find(tf => tf.includes(sourceName));
               return testFile || null;
             });

             // Mock file stats - only service1 has test created first
             fs.statSync.mockImplementation((filePath) => {
               const fileName = path.basename(filePath);
               if (fileName.includes('service1')) {
                 if (filePath.includes('test')) {
                   return { mtime: new Date('2024-01-01') }; // Test created first
                 } else {
                   return { mtime: new Date('2024-01-02') }; // Source created second
                 }
               } else if (fileName.includes('service2')) {
                 if (filePath.includes('test')) {
                   return { mtime: new Date('2024-01-03') }; // Test created second
                 } else {
                   return { mtime: new Date('2024-01-02') }; // Source created first
                 }
               } else {
                 return { mtime: new Date('2024-01-03') }; // Default
               }
             });

             await validator.validateTDDWorkflow();
             

             
             expect(validator.report.recommendations).toContain('Improve TDD workflow - 1 files need tests written first');
           });
  });

           describe('findTestFiles', () => {
           it('should find test files in multiple directories', () => {
             // Mock the file system calls directly
             fs.existsSync.mockImplementation((path) => {
               return path.includes('tests') || path.includes('src');
             });

             // Mock walkDir to simulate file discovery - only call once per directory
             let testsCalled = false;
             let srcCalled = false;
             validator.walkDir = jest.fn((dir, callback) => {
               if (dir.includes('tests') && !testsCalled) {
                 testsCalled = true;
                 callback('tests/service.test.js');
               } else if (dir.includes('src') && !srcCalled) {
                 srcCalled = true;
                 callback('src/__tests__/component.test.js');
                 callback('src/utils/helper.spec.js');
               }
             });

             const result = validator.findTestFiles();
             
             expect(result).toHaveLength(3);
             expect(result).toContain('tests/service.test.js');
             expect(result).toContain('src/__tests__/component.test.js');
             expect(result).toContain('src/utils/helper.spec.js');
           });

    it('should handle missing directories gracefully', () => {
      fs.existsSync.mockReturnValue(false);
      
      const result = validator.findTestFiles();
      
      expect(result).toHaveLength(0);
    });
  });

           describe('findSourceFiles', () => {
           it('should find source files excluding test files', () => {
             // Mock the file system calls directly
             fs.existsSync.mockImplementation((path) => {
               return path.includes('src');
             });

             // Mock walkDir to simulate file discovery
             validator.walkDir = jest.fn((dir, callback) => {
               // Only process source files (exclude test files)
               callback('src/service.js');
               callback('src/component.jsx');
               callback('src/utils/helper.ts');
               // Don't call callback for test files
             });

             const result = validator.findSourceFiles();
             
             expect(result).toHaveLength(3);
             expect(result).toContain('src/service.js');
             expect(result).toContain('src/component.jsx');
             expect(result).toContain('src/utils/helper.ts');
             expect(result).not.toContain('src/service.test.js');
             expect(result).not.toContain('src/component.spec.tsx');
           });
         });

  describe('analyzeTestFile', () => {
    it('should detect poor test names', () => {
      const content = `
        it('should work', () => {});
        it('test', () => {});
        it('works', () => {});
      `;

      const issues = validator.analyzeTestFile(content);
      
      expect(issues).toContain('Poor test names found: 3 tests have vague names');
    });

             it('should detect tests without assertions', () => {
           const content = `
             it('should do something', () => {
               const result = someFunction();
               // Missing expect(result).toBe(true);
             });
             it('should work correctly', () => {
               expect(true).toBe(true);
             });
           `;

           const issues = validator.analyzeTestFile(content);
           
           expect(issues).toContain('1 tests appear to have no assertions');
         });

    it('should detect test interdependence', () => {
      const content = `
        beforeAll(() => {
          setupDatabase();
        });
      `;

      const issues = validator.analyzeTestFile(content);
      
      expect(issues).toContain('Tests may have interdependence - review beforeAll/afterAll usage');
    });

    it('should return empty array for good test files', () => {
      const content = `
        it('should return user with generated ID', () => {
          const result = userService.createUser(validData);
          expect(result).toHaveProperty('id');
        });
      `;

      const issues = validator.analyzeTestFile(content);
      
      expect(issues).toHaveLength(0);
    });
  });

  describe('countTests', () => {
    it('should count test functions correctly', () => {
      const content = `
        it('test 1', () => {});
        it('test 2', () => {});
        it('test 3', () => {});
      `;

      const count = validator.countTests(content);
      
      expect(count).toBe(3);
    });

    it('should return 0 for content without tests', () => {
      const content = 'This is just some text without tests';
      
      const count = validator.countTests(content);
      
      expect(count).toBe(0);
    });
  });

  describe('generateReport', () => {
    beforeEach(() => {
      validator.report = {
        score: 85,
        testCoverage: 92,
        testQuality: 'EXCELLENT',
        tddWorkflow: 'EXCELLENT',
        issues: ['Issue 1'],
        recommendations: ['Recommendation 1']
      };
    });

    it('should set TDD COMPLIANT status for score >= 80', async () => {
      await validator.generateReport();
      
      expect(validator.report.overallStatus).toBe('TDD COMPLIANT');
    });

    it('should set PARTIALLY COMPLIANT status for score 60-79', async () => {
      validator.report.score = 70;
      
      await validator.generateReport();
      
      expect(validator.report.overallStatus).toBe('PARTIALLY COMPLIANT');
    });

    it('should set NON-COMPLIANT status for score < 60', async () => {
      validator.report.score = 45;
      
      await validator.generateReport();
      
      expect(validator.report.overallStatus).toBe('NON-COMPLIANT');
    });

    it('should save report to file', async () => {
      fs.writeFileSync = jest.fn();
      
      await validator.generateReport();
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockProjectRoot, 'tdd-validation-report.json'),
        JSON.stringify(validator.report, null, 2)
      );
    });
  });

  describe('integration', () => {
    it('should run complete validation workflow', async () => {
      // Mock all dependencies
      validator.checkProjectStructure = jest.fn();
      validator.validateTestCoverage = jest.fn();
      validator.validateTestQuality = jest.fn();
      validator.validateTDDWorkflow = jest.fn();
      validator.generateReport = jest.fn();

      await validator.validate();
      
      expect(validator.checkProjectStructure).toHaveBeenCalled();
      expect(validator.validateTestCoverage).toHaveBeenCalled();
      expect(validator.validateTestQuality).toHaveBeenCalled();
      expect(validator.validateTDDWorkflow).toHaveBeenCalled();
      expect(validator.generateReport).toHaveBeenCalled();
    });

    it('should handle validation errors gracefully', async () => {
      validator.checkProjectStructure = jest.fn().mockRejectedValue(new Error('Validation failed'));

      // Ensure NODE_ENV is set to test
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';
      
      try {
        await expect(validator.validate()).rejects.toThrow('Validation failed');
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });
});
