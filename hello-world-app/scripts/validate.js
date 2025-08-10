#!/usr/bin/env node

/**
 * Validation Script for Hello World App
 * 
 * This script runs all Agent-OS validators to ensure the Hello World
 * application meets all standards and requirements. It validates code
 * quality, security, testing, documentation, and adherence to specs.
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Validation results
const validationResults = {
  codeQuality: { passed: false, score: 0, issues: [] },
  security: { passed: false, score: 0, issues: [] },
  testing: { passed: false, score: 0, issues: [] },
  documentation: { passed: false, score: 0, issues: [] },
  specAdherence: { passed: false, score: 0, issues: [] },
  overall: { passed: false, score: 0, totalIssues: 0 }
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  console.error(`${colors.red}❌ ${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.cyan}ℹ️  ${message}${colors.reset}`);
}

function logHeader(message) {
  console.log(`\n${colors.bright}${message}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(message.length)}${colors.reset}`);
}

function logSection(message) {
  console.log(`\n${colors.yellow}${message}${colors.reset}`);
  console.log(`${colors.blue}${'-'.repeat(message.length)}${colors.reset}`);
}

async function validateCodeQuality() {
  logSection('Code Quality Validation');
  
  try {
    // Run ESLint
    log('Running ESLint...', 'cyan');
    execSync('npm run lint', { stdio: 'pipe' });
    logSuccess('ESLint passed - no code quality issues found');
    validationResults.codeQuality.passed = true;
    validationResults.codeQuality.score = 100;
  } catch (error) {
    const output = error.stdout?.toString() || error.stderr?.toString() || '';
    const issues = output.split('\n').filter(line => line.includes('error') || line.includes('warning'));
    
    validationResults.codeQuality.issues = issues;
    validationResults.codeQuality.score = Math.max(0, 100 - (issues.length * 10));
    
    if (issues.length > 0) {
      logWarning(`ESLint found ${issues.length} issues`);
      issues.forEach(issue => logWarning(`  ${issue}`));
    }
  }
  
  // Check file structure
  try {
    const requiredFiles = [
      'src/index.js',
      'src/config.js', 
      'src/utils.js',
      'package.json',
      'README.md'
    ];
    
    let missingFiles = 0;
    for (const file of requiredFiles) {
      try {
        await fs.stat(file);
      } catch (error) {
        missingFiles++;
        validationResults.codeQuality.issues.push(`Missing required file: ${file}`);
      }
    }
    
    if (missingFiles === 0) {
      logSuccess('All required files present');
    } else {
      logWarning(`${missingFiles} required files missing`);
    }
  } catch (error) {
    logWarning('Could not verify file structure');
  }
}

async function validateSecurity() {
  logSection('Security Validation');
  
  try {
    // Check for common security issues in source code
    const sourceFiles = ['src/index.js', 'src/config.js', 'src/utils.js'];
    let securityIssues = 0;
    
    for (const file of sourceFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        
        // Check for potential security vulnerabilities
        const securityChecks = [
          { pattern: /eval\s*\(/, name: 'eval() usage', severity: 'high' },
          { pattern: /process\.env\.\w+/, name: 'Environment variable usage', severity: 'info' },
          { pattern: /<script>/, name: 'Potential XSS', severity: 'medium' },
          { pattern: /innerHTML/, name: 'innerHTML usage', severity: 'medium' },
          { pattern: /document\.write/, name: 'document.write usage', severity: 'high' }
        ];
        
        for (const check of securityChecks) {
          if (check.pattern.test(content)) {
            securityIssues++;
            validationResults.security.issues.push(`${check.name} found in ${file} (${check.severity})`);
          }
        }
      } catch (error) {
        logWarning(`Could not read ${file} for security analysis`);
      }
    }
    
    if (securityIssues === 0) {
      logSuccess('No security vulnerabilities detected');
      validationResults.security.passed = true;
      validationResults.security.score = 100;
    } else {
      logWarning(`${securityIssues} potential security issues found`);
      validationResults.security.score = Math.max(0, 100 - (securityIssues * 20));
    }
    
    // Check package.json for known vulnerable dependencies
    try {
      const packageJson = await fs.readFile('package.json', 'utf8');
      const packageData = JSON.parse(packageJson);
      
      // Check for known vulnerable packages (basic check)
      const vulnerablePatterns = [
        /lodash\s*[<]?\s*4\.17\.15/, // Known vulnerable lodash versions
        /express\s*[<]?\s*4\.17\.0/, // Known vulnerable express versions
      ];
      
      let vulnerableDeps = 0;
      for (const pattern of vulnerablePatterns) {
        if (pattern.test(packageJson)) {
          vulnerableDeps++;
          validationResults.security.issues.push(`Potentially vulnerable dependency detected`);
        }
      }
      
      if (vulnerableDeps === 0) {
        logSuccess('No known vulnerable dependencies detected');
      } else {
        logWarning(`${vulnerableDeps} potentially vulnerable dependencies found`);
      }
    } catch (error) {
      logWarning('Could not check package.json for vulnerabilities');
    }
    
  } catch (error) {
    logWarning(`Security validation failed: ${error.message}`);
  }
}

async function validateTesting() {
  logSection('Testing Validation');
  
  try {
    // Run tests
    log('Running test suite...', 'cyan');
    execSync('npm test', { stdio: 'pipe' });
    logSuccess('All tests passed');
    
    // Check test coverage
    log('Checking test coverage...', 'cyan');
    try {
      execSync('npm run test:coverage', { stdio: 'pipe' });
      
      // Check if coverage directory exists and has reports
      const coverageDir = path.join(process.cwd(), 'coverage');
      try {
        const coverageStats = await fs.stat(coverageDir);
        if (coverageStats.isDirectory()) {
          const coverageFiles = await fs.readdir(coverageDir);
          if (coverageFiles.length > 0) {
            logSuccess('Test coverage generated successfully');
            validationResults.testing.passed = true;
            validationResults.testing.score = 100;
          } else {
            logWarning('Coverage directory is empty');
          }
        }
      } catch (error) {
        logWarning('Could not verify coverage output');
      }
    } catch (error) {
      logWarning('Test coverage generation failed');
    }
    
    // Check test file structure
    const testDirs = ['tests/unit', 'tests/integration', 'tests/performance', 'tests/security'];
    let missingTestDirs = 0;
    
    for (const testDir of testDirs) {
      try {
        await fs.stat(testDir);
      } catch (error) {
        missingTestDirs++;
        validationResults.testing.issues.push(`Missing test directory: ${testDir}`);
      }
    }
    
    if (missingTestDirs === 0) {
      logSuccess('All test directories present');
    } else {
      logWarning(`${missingTestDirs} test directories missing`);
    }
    
    // Check for test files
    const testFiles = ['tests/unit/utils.test.js', 'tests/integration/app.test.js'];
    let missingTestFiles = 0;
    
    for (const testFile of testFiles) {
      try {
        await fs.stat(testFile);
      } catch (error) {
        missingTestFiles++;
        validationResults.testing.issues.push(`Missing test file: ${testFile}`);
      }
    }
    
    if (missingTestFiles === 0) {
      logSuccess('All test files present');
    } else {
      logWarning(`${missingTestFiles} test files missing`);
    }
    
  } catch (error) {
    logError(`Testing validation failed: ${error.message}`);
    validationResults.testing.issues.push(`Test execution failed: ${error.message}`);
  }
}

async function validateDocumentation() {
  logSection('Documentation Validation');
  
  try {
    const requiredDocs = [
      'README.md',
      'CHANGELOG.md',
      'docs/'
    ];
    
    let missingDocs = 0;
    for (const doc of requiredDocs) {
      try {
        await fs.stat(doc);
      } catch (error) {
        missingDocs++;
        validationResults.documentation.issues.push(`Missing documentation: ${doc}`);
      }
    }
    
    if (missingDocs === 0) {
      logSuccess('All required documentation present');
    } else {
      logWarning(`${missingDocs} documentation items missing`);
    }
    
    // Check README content quality
    try {
      const readme = await fs.readFile('README.md', 'utf8');
      const readmeChecks = [
        { pattern: /# Hello World App/, name: 'Project title' },
        { pattern: /## Installation/, name: 'Installation section' },
        { pattern: /## Usage/, name: 'Usage section' },
        { pattern: /## Testing/, name: 'Testing section' },
        { pattern: /## Scripts/, name: 'Scripts section' }
      ];
      
      let missingSections = 0;
      for (const check of readmeChecks) {
        if (!check.pattern.test(readme)) {
          missingSections++;
          validationResults.documentation.issues.push(`Missing README section: ${check.name}`);
        }
      }
      
      if (missingSections === 0) {
        logSuccess('README contains all required sections');
      } else {
        logWarning(`${missingSections} README sections missing`);
      }
      
      validationResults.documentation.score = Math.max(0, 100 - (missingSections * 20));
      if (missingSections === 0) {
        validationResults.documentation.passed = true;
      }
      
    } catch (error) {
      logWarning('Could not analyze README content');
    }
    
  } catch (error) {
    logWarning(`Documentation validation failed: ${error.message}`);
  }
}

async function validateSpecAdherence() {
  logSection('Spec Adherence Validation');
  
  try {
    // Check if we're following the spec requirements
    const specRequirements = [
      'Project setup completed',
      'Core application implemented',
      'Testing framework implemented',
      'Build automation created',
      'Reset capability implemented',
      'Process documentation created'
    ];
    
    // Basic checks for spec adherence
    let specIssues = 0;
    
    // Check for core application files
    try {
      await fs.stat('src/index.js');
      await fs.stat('src/config.js');
      await fs.stat('src/utils.js');
    } catch (error) {
      specIssues++;
      validationResults.specAdherence.issues.push('Core application files missing');
    }
    
    // Check for testing framework
    try {
      await fs.stat('jest.config.js');
      await fs.stat('tests/setup.js');
    } catch (error) {
      specIssues++;
      validationResults.specAdherence.issues.push('Testing framework not properly set up');
    }
    
    // Check for build automation
    try {
      await fs.stat('scripts/build.js');
      await fs.stat('scripts/reset.js');
      await fs.stat('scripts/rebuild.js');
    } catch (error) {
      specIssues++;
      validationResults.specAdherence.issues.push('Build automation scripts missing');
    }
    
    // Check for process documentation
    try {
      await fs.stat('README.md');
    } catch (error) {
      specIssues++;
      validationResults.specAdherence.issues.push('Process documentation missing');
    }
    
    if (specIssues === 0) {
      logSuccess('All spec requirements met');
      validationResults.specAdherence.passed = true;
      validationResults.specAdherence.score = 100;
    } else {
      logWarning(`${specIssues} spec requirements not met`);
      validationResults.specAdherence.score = Math.max(0, 100 - (specIssues * 16));
    }
    
  } catch (error) {
    logWarning(`Spec adherence validation failed: ${error.message}`);
  }
}

function calculateOverallScore() {
  const scores = [
    validationResults.codeQuality.score,
    validationResults.security.score,
    validationResults.testing.score,
    validationResults.documentation.score,
    validationResults.specAdherence.score
  ];
  
  validationResults.overall.score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  validationResults.overall.passed = validationResults.overall.score >= 80;
  
  // Count total issues
  validationResults.overall.totalIssues = 
    validationResults.codeQuality.issues.length +
    validationResults.security.issues.length +
    validationResults.testing.issues.length +
    validationResults.documentation.issues.length +
    validationResults.specAdherence.issues.length;
}

function displayResults() {
  logHeader('Validation Results Summary');
  
  const categories = [
    { name: 'Code Quality', result: validationResults.codeQuality },
    { name: 'Security', result: validationResults.security },
    { name: 'Testing', result: validationResults.testing },
    { name: 'Documentation', result: validationResults.documentation },
    { name: 'Spec Adherence', result: validationResults.specAdherence }
  ];
  
  for (const category of categories) {
    const status = category.result.passed ? '✅ PASS' : '❌ FAIL';
    const color = category.result.passed ? 'green' : 'red';
    log(`${status} ${category.name}: ${category.result.score}/100`, color);
    
    if (category.result.issues.length > 0) {
      log(`  Issues found: ${category.result.issues.length}`, 'yellow');
      category.result.issues.forEach(issue => {
        log(`    - ${issue}`, 'yellow');
      });
    }
  }
  
  log('\n' + '='.repeat(50), 'cyan');
  
  const overallStatus = validationResults.overall.passed ? '✅ PASSED' : '❌ FAILED';
  const overallColor = validationResults.overall.passed ? 'green' : 'red';
  
  log(`Overall Score: ${validationResults.overall.score}/100`, overallColor);
  log(`Status: ${overallStatus}`, overallColor);
  log(`Total Issues: ${validationResults.overall.totalIssues}`, 'yellow');
  
  if (validationResults.overall.passed) {
    log('\n🎉 Validation successful! Your Hello World app meets Agent-OS standards.', 'bright');
  } else {
    log('\n⚠️  Validation failed. Please address the issues above to meet Agent-OS standards.', 'yellow');
  }
}

async function runValidation() {
  const startTime = Date.now();
  
  try {
    logHeader('Agent-OS Hello World App Validation');
    log('Running comprehensive validation against Agent-OS standards...\n', 'cyan');
    
    // Step 1: Validate current directory
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    try {
      const packageJson = await fs.readFile(packageJsonPath, 'utf8');
      const packageData = JSON.parse(packageJson);
      
      if (packageData.name !== 'hello-world-app') {
        throw new Error('This script must be run from the hello-world-app directory');
      }
      
      logSuccess('Project directory validated as hello-world-app');
    } catch (error) {
      throw new Error('package.json not found or invalid. Make sure you\'re in the hello-world-app directory.');
    }
    
    // Step 2: Run all validations
    await validateCodeQuality();
    await validateSecurity();
    await validateTesting();
    await validateDocumentation();
    await validateSpecAdherence();
    
    // Step 3: Calculate overall results
    calculateOverallScore();
    
    // Step 4: Display results
    displayResults();
    
    // Step 5: Summary
    const validationTime = Date.now() - startTime;
    log(`\n⏱️  Total validation time: ${validationTime}ms`, 'cyan');
    
    if (validationResults.overall.passed) {
      log('\n🚀 Your Hello World app is ready for production!', 'bright');
      log('   All Agent-OS standards have been met.', 'green');
    } else {
      log('\n🔧 Please fix the issues above and run validation again.', 'yellow');
      log('   You can use "npm run rebuild" to start fresh.', 'cyan');
    }
    
  } catch (error) {
    logError(`Validation failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the validation process
if (require.main === module) {
  runValidation();
}

module.exports = { 
  runValidation,
  validateCodeQuality,
  validateSecurity,
  validateTesting,
  validateDocumentation,
  validateSpecAdherence
};
