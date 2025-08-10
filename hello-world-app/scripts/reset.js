#!/usr/bin/env node

/**
 * Reset Script for Hello World App
 * 
 * This script completely resets the Hello World application to a clean state.
 * It removes all generated files, build artifacts, and resets the project
 * so it can be rebuilt from scratch.
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

// Directories and files to remove during reset
const RESET_TARGETS = [
  'node_modules',
  'coverage',
  'build',
  'dist',
  '.nyc_output',
  '.eslintcache',
  'npm-debug.log*',
  'yarn-debug.log*',
  'yarn-error.log*',
  '*.log',
  '.DS_Store',
  'Thumbs.db'
];

// Files to preserve (won't be deleted)
const PRESERVE_FILES = [
  'package.json',
  'package-lock.json',
  'README.md',
  'CHANGELOG.md',
  'LICENSE',
  '.gitignore',
  '.env.example'
];

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

async function resetProject() {
  const startTime = Date.now();
  
  try {
    log('🔄 Hello World App Reset Process', 'bright');
    log('================================\n', 'bright');
    
    // Step 1: Check if we're in the right directory
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    try {
      const packageJson = await fs.readFile(packageJsonPath, 'utf8');
      const packageData = JSON.parse(packageJson);
      
      if (packageData.name !== 'hello-world-app') {
        throw new Error('This script must be run from the hello-world-app directory');
      }
    } catch (error) {
      throw new Error('package.json not found or invalid. Make sure you\'re in the hello-world-app directory.');
    }
    
    log('📍 Current directory validated as hello-world-app', 'green');
    
    // Step 2: Stop any running processes
    log('\n🛑 Stopping any running processes...', 'yellow');
    try {
      // Kill any Node.js processes running on the default port
      execSync('pkill -f "node.*hello-world-app" || true', { stdio: 'ignore' });
      execSync('pkill -f "nodemon.*hello-world-app" || true', { stdio: 'ignore' });
      logSuccess('Running processes stopped');
    } catch (error) {
      logWarning('No running processes found (or couldn\'t stop them)');
    }
    
    // Step 3: Remove generated directories and files
    log('\n🗑️  Removing generated files and directories...', 'yellow');
    
    for (const target of RESET_TARGETS) {
      const targetPath = path.join(process.cwd(), target);
      
      try {
        const stats = await fs.stat(targetPath);
        
        if (stats.isDirectory()) {
          await fs.rmdir(targetPath, { recursive: true });
          logSuccess(`Removed directory: ${target}`);
        } else if (stats.isFile()) {
          await fs.unlink(targetPath);
          logSuccess(`Removed file: ${target}`);
        }
      } catch (error) {
        if (error.code === 'ENOENT') {
          logInfo(`Target not found: ${target}`);
        } else {
          logWarning(`Could not remove ${target}: ${error.message}`);
        }
      }
    }
    
    // Step 4: Clean npm cache for this project
    log('\n🧹 Cleaning npm cache...', 'yellow');
    try {
      execSync('npm cache clean --force', { stdio: 'ignore' });
      logSuccess('npm cache cleaned');
    } catch (error) {
      logWarning('Could not clean npm cache');
    }
    
    // Step 5: Reset git if this is a git repository
    const gitPath = path.join(process.cwd(), '.git');
    try {
      await fs.stat(gitPath);
      log('\n📝 Resetting git repository...', 'yellow');
      
      try {
        execSync('git reset --hard HEAD', { stdio: 'ignore' });
        execSync('git clean -fd', { stdio: 'ignore' });
        logSuccess('Git repository reset');
      } catch (error) {
        logWarning('Could not reset git repository');
      }
    } catch (error) {
      logInfo('Not a git repository, skipping git reset');
    }
    
    // Step 6: Verify reset completion
    log('\n🔍 Verifying reset completion...', 'yellow');
    
    const remainingFiles = [];
    for (const target of RESET_TARGETS) {
      const targetPath = path.join(process.cwd(), target);
      try {
        await fs.stat(targetPath);
        remainingFiles.push(target);
      } catch (error) {
        // File/directory doesn't exist, which is good
      }
    }
    
    if (remainingFiles.length === 0) {
      logSuccess('All generated files successfully removed');
    } else {
      logWarning(`Some files could not be removed: ${remainingFiles.join(', ')}`);
    }
    
    // Step 7: Create fresh .gitignore if it doesn't exist
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    try {
      await fs.stat(gitignorePath);
      logInfo('.gitignore already exists');
    } catch (error) {
      log('\n📝 Creating .gitignore file...', 'yellow');
      const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
build/
dist/
coverage/
.nyc_output/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# ESLint cache
.eslintcache

# Prettier cache
.prettiercache
`;
      
      await fs.writeFile(gitignorePath, gitignoreContent);
      logSuccess('Created .gitignore file');
    }
    
    // Step 8: Summary
    const resetTime = Date.now() - startTime;
    
    log('\n🎉 Reset completed successfully!', 'bright');
    log(`⏱️  Total reset time: ${resetTime}ms`, 'green');
    log('\n📋 Project has been reset to a clean state', 'cyan');
    log('🚀 Ready to rebuild from scratch!', 'bright');
    log('\nNext steps:', 'yellow');
    log('1. Run "npm install" to install dependencies', 'cyan');
    log('2. Run "npm run dev" to start development server', 'cyan');
    log('3. Run "npm test" to run the test suite', 'cyan');
    log('4. Run "npm run build" to create production build', 'cyan');
    
  } catch (error) {
    logError(`Reset failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the reset process
if (require.main === module) {
  resetProject();
}

module.exports = { resetProject };
