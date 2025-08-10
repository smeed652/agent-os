#!/usr/bin/env node

/**
 * Build Script for Hello World Application
 * 
 * This script prepares the application for production deployment
 * by running tests, linting, and creating production artifacts.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Hello World App Build Process...\n');

// Configuration
const BUILD_DIR = 'dist';
const SOURCE_DIR = 'src';
const TEST_DIR = 'tests';
const SKIP_LINT = process.env.SKIP_LINT === '1';
const SKIP_TESTS = process.env.SKIP_TESTS === '1';

// Colors for console output
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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${step} ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Utility functions
function runCommand(command, description) {
  try {
    logStep('🔧', description);
    execSync(command, { stdio: 'inherit' });
    logSuccess(`${description} completed successfully`);
    return true;
  } catch (error) {
    logError(`${description} failed: ${error.message}`);
    return false;
  }
}

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    logInfo(`Created directory: ${dirPath}`);
  }
}

function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    logInfo(`Copied: ${source} → ${destination}`);
  } catch (error) {
    logError(`Failed to copy ${source}: ${error.message}`);
    return false;
  }
  return true;
}

function copyDirectory(source, destination) {
  if (!fs.existsSync(destination)) {
    createDirectory(destination);
  }

  const items = fs.readdirSync(source);
  
  for (const item of items) {
    const sourcePath = path.join(source, item);
    const destPath = path.join(destination, item);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      copyFile(sourcePath, destPath);
    }
  }
}

// Build process
async function build() {
  const startTime = Date.now();
  
  try {
    log('🏗️  Hello World App Build Process', 'bright');
    log('=====================================\n', 'bright');

    // Step 1: Clean previous build
    logStep('🧹', 'Cleaning previous build artifacts');
    if (fs.existsSync(BUILD_DIR)) {
      fs.rmSync(BUILD_DIR, { recursive: true, force: true });
      logSuccess('Previous build artifacts cleaned');
    }

    // Step 2: Run linting
    if (SKIP_LINT) {
      logInfo('Skipping code linting due to SKIP_LINT=1');
    } else {
      if (!runCommand('npm run lint', 'Running code linting')) {
        logWarning('Linting issues found, but continuing with build');
      }
    }

    // Step 3: Run tests
    if (SKIP_TESTS) {
      logInfo('Skipping tests due to SKIP_TESTS=1');
    } else {
      if (!runCommand('npm run test:coverage', 'Running test suite with coverage')) {
        logError('Tests failed! Build cannot continue');
        process.exit(1);
      }
    }

    // Step 4: Create build directory
    createDirectory(BUILD_DIR);

    // Step 5: Copy source files
    logStep('📁', 'Copying source files');
    copyDirectory(SOURCE_DIR, path.join(BUILD_DIR, SOURCE_DIR));
    logSuccess('Source files copied to build directory');

    // Step 6: Copy package.json and update for production
    logStep('📦', 'Preparing package.json for production');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Remove dev dependencies and scripts for production
    const productionPackage = {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      main: packageJson.main,
      scripts: {
        start: packageJson.scripts.start
      },
      dependencies: packageJson.dependencies,
      engines: packageJson.engines,
      author: packageJson.author,
      license: packageJson.license
    };

    fs.writeFileSync(
      path.join(BUILD_DIR, 'package.json'),
      JSON.stringify(productionPackage, null, 2)
    );
    logSuccess('Production package.json created');

    // Step 7: Copy README and documentation
    logStep('📚', 'Copying documentation');
    if (fs.existsSync('README.md')) {
      copyFile('README.md', path.join(BUILD_DIR, 'README.md'));
    }
    if (fs.existsSync('docs')) {
      copyDirectory('docs', path.join(BUILD_DIR, 'docs'));
    }
    logSuccess('Documentation copied');

    // Step 8: Create build info
    logStep('📋', 'Creating build information');
    const buildInfo = {
      buildTime: new Date().toISOString(),
      version: packageJson.version,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      buildId: `build-${Date.now()}`
    };

    fs.writeFileSync(
      path.join(BUILD_DIR, 'build-info.json'),
      JSON.stringify(buildInfo, null, 2)
    );
    logSuccess('Build information created');

    // Step 9: Install production dependencies
    logStep('📥', 'Installing production dependencies');
    process.chdir(BUILD_DIR);
    
    if (!runCommand('npm install --production', 'Installing production dependencies')) {
      logError('Failed to install production dependencies');
      process.exit(1);
    }

    // Step 10: Verify build
    logStep('🔍', 'Verifying build');
    if (fs.existsSync('node_modules')) {
      logSuccess('Production dependencies installed');
    } else {
      logError('Production dependencies not found');
      process.exit(1);
    }

    // Build completed successfully
    const buildTime = Date.now() - startTime;
    log('\n🎉 Build completed successfully!', 'bright');
    log(`⏱️  Total build time: ${buildTime}ms`, 'green');
    log(`📁 Build output: ${BUILD_DIR}/`, 'green');
    
    // Display build summary
    log('\n📊 Build Summary:', 'bright');
    log('================');
    log(`📁 Source files: ${SOURCE_DIR}/`);
    log(`🧪 Tests: ${TEST_DIR}/`);
    log(`📦 Dependencies: ${Object.keys(packageJson.dependencies).length} production`);
    log(`🔧 Scripts: 1 production (start)`);
    log(`📚 Documentation: Included`);
    
    log('\n🚀 Ready for deployment!', 'bright');
    log('Run "npm start" in the build directory to start the application.', 'cyan');

  } catch (error) {
    logError(`Build failed: ${error.message}`);
    process.exit(1);
  }
}

// Run build if this script is executed directly
if (require.main === module) {
  build().catch(error => {
    logError(`Build process failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { build };
