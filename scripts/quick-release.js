#!/usr/bin/env node

/**
 * Agent-OS Quick Release Script
 * 
 * This script provides a faster release process by skipping some validation steps:
 * 1. Builds the Hello World app
 * 2. Creates release package
 * 3. Skips comprehensive validation for speed
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('⚡ Starting Agent-OS Quick Release Process...\n');

// Configuration
const RELEASE_DIR = 'release';
const HELLO_WORLD_DIR = 'hello-world-app';
const FRAMEWORK_DIR = '.';

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
function runCommand(command, description, cwd = process.cwd()) {
  try {
    logStep('🔧', description);
    execSync(command, { stdio: 'inherit', cwd });
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

function getCurrentVersion() {
  try {
    const packageJsonPath = path.join(FRAMEWORK_DIR, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version;
  } catch (error) {
    logError('Could not read version from package.json');
    return null;
  }
}

// Quick release process
async function quickRelease() {
  const startTime = Date.now();
  
  try {
    log('⚡ Agent-OS Quick Release Process', 'bright');
    log('==================================\n', 'bright');

    // Step 1: Quick validation
    logStep('🔍', 'Quick validation');
    
    const currentVersion = getCurrentVersion();
    if (!currentVersion) {
      logError('Could not determine current version');
      process.exit(1);
    }
    
    logInfo(`Current Agent-OS version: ${currentVersion}`);
    
    // Check if Hello World app exists
    if (!fs.existsSync(HELLO_WORLD_DIR)) {
      logError('Hello World app directory not found');
      process.exit(1);
    }
    
    logSuccess('Quick validation passed');

    // Step 2: Build Hello World app (skip tests for speed)
    logStep('🏗️', 'Building Hello World app (quick mode)');
    
    // Change to Hello World directory and build
    if (!runCommand('npm run build', 'Building Hello World app', HELLO_WORLD_DIR)) {
      logError('Hello World app build failed! Release cannot continue');
      process.exit(1);
    }
    
    // Verify build output
    const buildDir = path.join(HELLO_WORLD_DIR, 'dist');
    if (!fs.existsSync(buildDir)) {
      logError('Hello World app build output not found');
      process.exit(1);
    }
    
    logSuccess('Hello World app built successfully');

    // Step 3: Create release directory
    logStep('📁', 'Creating release directory');
    
    if (fs.existsSync(RELEASE_DIR)) {
      fs.rmSync(RELEASE_DIR, { recursive: true, force: true });
      logInfo('Cleaned previous release directory');
    }
    
    createDirectory(RELEASE_DIR);
    logSuccess('Release directory created');

    // Step 4: Copy essential framework files (minimal set for speed)
    logStep('📦', 'Copying essential framework files');
    
    const essentialFiles = [
      'src',
      'scripts',
      'rules',
      'standards',
      'package.json',
      'README.md'
    ];
    
    for (const file of essentialFiles) {
      const sourcePath = path.join(FRAMEWORK_DIR, file);
      const destPath = path.join(RELEASE_DIR, file);
      
      if (fs.existsSync(sourcePath)) {
        if (fs.statSync(sourcePath).isDirectory()) {
          copyDirectory(sourcePath, destPath);
        } else {
          copyFile(sourcePath, destPath);
        }
      }
    }
    
    logSuccess('Essential framework files copied');

    // Step 5: Copy built Hello World app
    logStep('🌍', 'Copying built Hello World app');
    
    const helloWorldReleaseDir = path.join(RELEASE_DIR, 'hello-world-app');
    copyDirectory(buildDir, helloWorldReleaseDir);
    
    logSuccess('Built Hello World app copied');

    // Step 6: Create minimal release package.json
    logStep('📋', 'Creating release package.json');
    
    const packageJsonPath = path.join(FRAMEWORK_DIR, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Create minimal production package.json
    const releasePackage = {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      main: packageJson.main,
      bin: packageJson.bin,
      scripts: {
        start: packageJson.scripts.start,
        'doc:version': packageJson.scripts['doc:version'],
        'create:spec': packageJson.scripts['create:spec']
      },
      keywords: packageJson.keywords,
      author: packageJson.author,
      license: packageJson.license,
      dependencies: packageJson.dependencies,
      engines: packageJson.engines
    };
    
    fs.writeFileSync(
      path.join(RELEASE_DIR, 'package.json'),
      JSON.stringify(releasePackage, null, 2)
    );
    
    logSuccess('Release package.json created');

    // Step 7: Create quick release info
    logStep('📊', 'Creating release information');
    
    const releaseInfo = {
      version: currentVersion,
      releaseTime: new Date().toISOString(),
      nodeVersion: process.version,
      releaseType: 'quick',
      essentialFiles: essentialFiles.length,
      helloWorldApp: {
        included: true,
        buildTime: fs.statSync(buildDir).mtime.toISOString()
      },
      releaseId: `quick-release-${Date.now()}`
    };
    
    fs.writeFileSync(
      path.join(RELEASE_DIR, 'release-info.json'),
      JSON.stringify(releaseInfo, null, 2)
    );
    
    logSuccess('Release information created');

    // Quick release completed
    const releaseTime = Date.now() - startTime;
    log('\n⚡ Quick release completed!', 'bright');
    log(`⏱️  Total time: ${releaseTime}ms`, 'green');
    log(`📁 Release output: ${RELEASE_DIR}/`, 'green');
    
    log('\n📊 Quick Release Summary:', 'bright');
    log('========================');
    log(`📦 Framework Version: ${currentVersion}`);
    log('🌍 Hello World App: Built and included');
    log(`📁 Essential Files: ${essentialFiles.length} components`);
    log('⚡ Release Type: Quick (minimal validation)');
    
    log('\n🚀 Ready for distribution!', 'bright');
    log(`The quick release package is available in the '${RELEASE_DIR}/' directory.`, 'cyan');
    log('Note: This is a quick release - run "npm run release" for full validation.', 'yellow');

  } catch (error) {
    logError(`Quick release failed: ${error.message}`);
    process.exit(1);
  }
}

// Run quick release if this script is executed directly
if (require.main === module) {
  quickRelease().catch(error => {
    logError(`Quick release process failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { quickRelease };

