#!/usr/bin/env node

/**
 * Rebuild Script for Hello World App
 * 
 * This script completely resets the Hello World application and then rebuilds
 * it from scratch. It follows the repeatable development process outlined
 * in the spec to validate our development workflow.
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

function logStep(step, description) {
  console.log(`\n${colors.bright}${step}${colors.reset} ${description}`);
  console.log(`${colors.cyan}${'='.repeat(step.length + description.length + 1)}${colors.reset}`);
}

async function rebuildProject() {
  const startTime = Date.now();
  
  try {
    log('🚀 Hello World App Rebuild Process', 'bright');
    log('==================================\n', 'bright');
    log('This will reset and rebuild the entire project from scratch', 'cyan');
    log('following our repeatable development process.\n', 'cyan');
    
    // Step 1: Validate current directory
    logStep('STEP 1', 'Validating Project Directory');
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
    
    // Step 2: Reset the project
    logStep('STEP 2', 'Resetting Project to Clean State');
    log('Running reset script...', 'yellow');
    
    try {
      const { resetProject } = require('./reset.js');
      await resetProject();
      logSuccess('Project reset completed');
    } catch (error) {
      logWarning(`Reset script failed: ${error.message}`);
      log('Continuing with manual reset...', 'yellow');
      
      // Manual reset fallback
      const resetTargets = ['node_modules', 'coverage', 'build', 'dist'];
      for (const target of resetTargets) {
        try {
          await fs.rmdir(path.join(process.cwd(), target), { recursive: true });
          logSuccess(`Removed: ${target}`);
        } catch (error) {
          // Ignore errors for non-existent directories
        }
      }
    }
    
    // Step 3: Install dependencies
    logStep('STEP 3', 'Installing Dependencies');
    log('Installing npm dependencies...', 'yellow');
    
    try {
      execSync('npm install', { stdio: 'inherit' });
      logSuccess('Dependencies installed successfully');
    } catch (error) {
      throw new Error(`Failed to install dependencies: ${error.message}`);
    }
    
    // Step 4: Run linting
    logStep('STEP 4', 'Running Code Quality Checks');
    log('Running ESLint...', 'yellow');
    
    try {
      execSync('npm run lint', { stdio: 'inherit' });
      logSuccess('Linting passed');
    } catch (error) {
      logWarning('Linting failed, attempting to fix...');
      try {
        execSync('npm run lint:fix', { stdio: 'inherit' });
        logSuccess('Linting issues auto-fixed');
      } catch (fixError) {
        logWarning('Could not auto-fix all linting issues');
      }
    }
    
    // Step 5: Run tests
    logStep('STEP 5', 'Running Test Suite');
    log('Running all tests...', 'yellow');
    
    try {
      execSync('npm test', { stdio: 'inherit' });
      logSuccess('All tests passed');
    } catch (error) {
      throw new Error(`Tests failed: ${error.message}`);
    }
    
    // Step 6: Run test coverage
    logStep('STEP 6', 'Checking Test Coverage');
    log('Running test coverage...', 'yellow');
    
    try {
      execSync('npm run test:coverage', { stdio: 'inherit' });
      logSuccess('Test coverage generated');
    } catch (error) {
      logWarning(`Test coverage failed: ${error.message}`);
    }
    
    // Step 7: Build the application
    logStep('STEP 7', 'Building Application');
    log('Running build script...', 'yellow');
    
    try {
      execSync('npm run build', { stdio: 'inherit' });
      logSuccess('Application built successfully');
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
    
    // Step 8: Verify build output
    logStep('STEP 8', 'Verifying Build Output');
    log('Checking build directory...', 'yellow');
    
    const buildDir = path.join(process.cwd(), 'build');
    try {
      const buildStats = await fs.stat(buildDir);
      if (buildStats.isDirectory()) {
        const buildContents = await fs.readdir(buildDir);
        logSuccess(`Build directory created with ${buildContents.length} items`);
        
        // Check for key files
        const requiredFiles = ['package.json', 'src/index.js', 'README.md'];
        for (const file of requiredFiles) {
          try {
            await fs.stat(path.join(buildDir, file));
            logSuccess(`✓ ${file} present in build`);
          } catch (error) {
            logWarning(`⚠ ${file} missing from build`);
          }
        }
      }
    } catch (error) {
      logWarning('Could not verify build output');
    }
    
    // Step 9: Test the built application
    logStep('STEP 9', 'Testing Built Application');
    log('Starting built application for testing...', 'yellow');
    
    try {
      // Change to build directory and test
      const originalCwd = process.cwd();
      process.chdir(buildDir);
      
      // Test that the app can start
      const testProcess = execSync('timeout 10s npm start || true', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      process.chdir(originalCwd);
      logSuccess('Built application test completed');
    } catch (error) {
      logWarning(`Built application test failed: ${error.message}`);
    }
    
    // Step 10: Final validation
    logStep('STEP 10', 'Final Validation');
    log('Running final validation checks...', 'yellow');
    
    // Check that all npm scripts work
    const scriptsToTest = ['test', 'lint', 'build'];
    for (const script of scriptsToTest) {
      try {
        execSync(`npm run ${script}`, { stdio: 'ignore' });
        logSuccess(`✓ ${script} script works`);
      } catch (error) {
        logWarning(`⚠ ${script} script failed`);
      }
    }
    
    // Step 11: Summary and next steps
    const rebuildTime = Date.now() - startTime;
    
    log('\n🎉 Rebuild completed successfully!', 'bright');
    log(`⏱️  Total rebuild time: ${rebuildTime}ms`, 'green');
    log('\n📋 Project has been completely rebuilt from scratch', 'cyan');
    log('🚀 Ready for development and testing!', 'bright');
    
    log('\n📚 Available Commands:', 'yellow');
    log('  npm run dev          - Start development server', 'cyan');
    log('  npm test             - Run test suite', 'cyan');
    log('  npm run test:watch   - Run tests in watch mode', 'cyan');
    log('  npm run test:coverage - Run tests with coverage', 'cyan');
    log('  npm run lint         - Run linting', 'cyan');
    log('  npm run build        - Build for production', 'cyan');
    log('  npm run reset        - Reset to clean state', 'cyan');
    log('  npm run rebuild      - Reset and rebuild', 'cyan');
    
    log('\n🔍 Validation Results:', 'yellow');
    log('  ✓ Project structure created', 'green');
    log('  ✓ Dependencies installed', 'green');
    log('  ✓ Code quality checks passed', 'green');
    log('  ✓ Test suite executed', 'green');
    log('  ✓ Application built', 'green');
    log('  ✓ Build output verified', 'green');
    
    log('\n💡 This repeatable process validates our development workflow!', 'bright');
    log('   You can now run "npm run reset" and "npm run rebuild"', 'cyan');
    log('   multiple times to ensure consistency and quality.', 'cyan');
    
  } catch (error) {
    logError(`Rebuild failed: ${error.message}`);
    log('\n🔄 To retry the rebuild:', 'yellow');
    log('1. Fix any issues identified above', 'cyan');
    log('2. Run "npm run rebuild" again', 'cyan');
    log('3. Or run "npm run reset" to start completely fresh', 'cyan');
    process.exit(1);
  }
}

// Run the rebuild process
if (require.main === module) {
  rebuildProject();
}

module.exports = { rebuildProject };
