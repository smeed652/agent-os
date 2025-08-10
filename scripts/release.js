#!/usr/bin/env node

/**
 * Agent-OS Release Script
 * 
 * This script handles the complete release process for Agent-OS framework:
 * 1. Validates the current state
 * 2. Builds the Hello World app
 * 3. Updates version information
 * 4. Creates release package
 * 5. Updates documentation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Agent-OS Release Process...\n');

// Configuration
const RELEASE_DIR = 'release';
const HELLO_WORLD_DIR = 'hello-world-app';
const FRAMEWORK_DIR = '.';
const CLI_ARGS = process.argv.slice(2);
const IS_DRY_RUN = CLI_ARGS.includes('--dry-run') || process.env.DRY_RUN === '1';
const NO_PUSH = IS_DRY_RUN || CLI_ARGS.includes('--no-push');
const SKIP_GIT = IS_DRY_RUN || CLI_ARGS.includes('--no-git');
const RUN_CHAOS = !CLI_ARGS.includes('--no-chaos');
const CHAOS_MODE = (() => {
  const arg = CLI_ARGS.find(a => a.startsWith('--chaos='));
  return arg ? arg.split('=')[1] : 'quick';
})();
const NO_LINT = CLI_ARGS.includes('--no-lint');
const NO_TESTS = CLI_ARGS.includes('--no-tests');
const NO_VALIDATORS = CLI_ARGS.includes('--no-validators');

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

// Git helpers
function runGit(command, description) {
  return runCommand(command, description);
}

function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { stdio: 'pipe' }).toString().trim();
  } catch (e) {
    return null;
  }
}

function isGitRepo() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function getLatestTag() {
  try {
    return execSync('git describe --tags --abbrev=0', { stdio: 'pipe' }).toString().trim();
  } catch (e) {
    return null;
  }
}

function tagExists(tagName) {
  try {
    execSync(`git rev-parse -q --verify refs/tags/${tagName}`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function deriveTagFromVersion(version) {
  const baseTag = `v${version}`;
  if (!tagExists(baseTag)) return baseTag;
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  return `${baseTag}+build.${timestamp}`;
}

function generateChangelogSince(tagOrNull, newTag) {
  try {
    const range = tagOrNull ? `${tagOrNull}..HEAD` : '';
    const logCmd = range ? `git log ${range} --pretty=format:"- %s (%h)"` : 'git log --pretty=format:"- %s (%h)" -n 50';
    const logOutput = execSync(logCmd, { stdio: 'pipe' }).toString();
    const date = new Date().toISOString().slice(0, 10);
    const header = `\n## ${newTag} - ${date}\n`;
    return header + (logOutput ? logOutput + '\n' : '- No commits found\n');
  } catch (e) {
    return `\n## ${newTag}\n- Changelog generation failed: ${e.message}\n`;
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

function updateVersionInFile(filePath, oldVersion, newVersion) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(new RegExp(oldVersion, 'g'), newVersion);
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      logInfo(`Updated version in ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    logWarning(`Could not update version in ${filePath}: ${error.message}`);
    return false;
  }
}

// Release process
async function release() {
  const startTime = Date.now();
  
  try {
    log('🏗️  Agent-OS Framework Release Process', 'bright');
    log('==========================================\n', 'bright');

    // Preflight: ensure git and dependencies
    logStep('🛫', 'Preflight checks');
    if (!isGitRepo()) {
      logWarning('Not a git repository; git operations will be skipped');
    } else {
      runGit('git fetch --all --tags', 'Fetching from git remotes');
    }
    if (!runCommand('npm ci', 'Installing root dependencies')) {
      logError('Dependency installation failed');
      process.exit(1);
    }

    // Step 1: Validate current state
    logStep('🔍', 'Validating current state');
    
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
    
    logSuccess('Current state validated');

    // Step 2: Run framework validation (must pass)
    logStep('🧪', 'Running framework validation');
    if (NO_LINT) {
      logInfo('Skipping root lint (--no-lint)');
    } else {
      if (!runCommand('npm run lint', 'Running lint')) {
        logError('Linting failed; aborting release');
        process.exit(1);
      }
    }
    // Early lint for Hello World app to fail fast before heavier steps
    if (NO_LINT) {
      logInfo('Skipping hello-world-app dependency install and lint (--no-lint)');
    } else {
      if (!runCommand('npm ci', 'Installing hello-world-app dependencies', HELLO_WORLD_DIR)) {
        logError('Hello World app dependency installation failed; aborting release');
        process.exit(1);
      }
      if (!runCommand('npm run lint', 'Running hello-world-app lint', HELLO_WORLD_DIR)) {
        logError('Hello World app linting failed; aborting release');
        process.exit(1);
      }
    }

    if (NO_TESTS) {
      logInfo('Skipping root tests (--no-tests)');
    } else {
      if (!runCommand('npm test', 'Running root test suite')) {
        logError('Root tests failed; aborting release');
        process.exit(1);
      }
    }
    if (NO_VALIDATORS) {
      logInfo('Skipping framework validators (--no-validators)');
    } else {
      if (!runCommand('npm run validate:all', 'Running comprehensive validation')) {
        logError('Framework validators failed; aborting release');
        process.exit(1);
      }
    }

    // Step 2.5: Chaos testing (quick by default)
    if (RUN_CHAOS) {
      const mode = CHAOS_MODE;
      logStep('🦍', `Running chaos tests (${mode})`);
      const chaosCmd = mode === 'full' ? 'npm run chaos' : mode === 'security' ? 'npm run chaos:security' : 'npm run chaos:quick';
      if (!runCommand(chaosCmd, 'Chaos monkey tests')) {
        logError('Chaos tests failed; aborting release');
        process.exit(1);
      }
    } else {
      logInfo('Skipping chaos tests (--no-chaos)');
    }

    // Step 3: Build Hello World app
    logStep('🏗️', 'Building Hello World app');
    
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

    // Step 4: Create release directory
    logStep('📁', 'Creating release directory');
    
    if (fs.existsSync(RELEASE_DIR)) {
      fs.rmSync(RELEASE_DIR, { recursive: true, force: true });
      logInfo('Cleaned previous release directory');
    }
    
    createDirectory(RELEASE_DIR);
    logSuccess('Release directory created');

    // Step 5: Copy framework files
    logStep('📦', 'Copying framework files');
    
    const frameworkFiles = [
      'src',
      'scripts',
      'rules',
      'standards',
      'docs',
      'instructions',
      'package.json',
      'README.md',
      'AGENT-OS-SETUP-GUIDE.md',
      'CHANGELOG.md'
    ];
    
    for (const file of frameworkFiles) {
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
    
    logSuccess('Framework files copied to release directory');

    // Step 6: Copy built Hello World app
    logStep('🌍', 'Copying built Hello World app');
    
    const helloWorldReleaseDir = path.join(RELEASE_DIR, 'hello-world-app');
    copyDirectory(buildDir, helloWorldReleaseDir);
    
    logSuccess('Built Hello World app copied to release directory');

    // Step 6.5: Generate/update CHANGELOG.md
    logStep('📝', 'Updating CHANGELOG.md');
    const newTag = deriveTagFromVersion(currentVersion);
    const lastTag = getLatestTag();
    try {
      const changelogPath = path.join(FRAMEWORK_DIR, 'CHANGELOG.md');
      let existing = '';
      if (fs.existsSync(changelogPath)) {
        existing = fs.readFileSync(changelogPath, 'utf8');
      }
      const section = generateChangelogSince(lastTag, newTag);
      const updated = existing + section;
      fs.writeFileSync(changelogPath, updated);
      // copy updated changelog into release too
      copyFile(changelogPath, path.join(RELEASE_DIR, 'CHANGELOG.md'));
      logSuccess('CHANGELOG.md updated');
    } catch (e) {
      logWarning(`Failed to update CHANGELOG.md: ${e.message}`);
    }

    // Step 7: Create release package.json
    logStep('📋', 'Creating release package.json');
    
    const packageJsonPath = path.join(FRAMEWORK_DIR, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Create production-ready package.json
    const releasePackage = {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      main: packageJson.main,
      bin: packageJson.bin,
      scripts: {
        start: packageJson.scripts.start,
        test: packageJson.scripts.test,
        validate: packageJson.scripts.validate,
        'validate:all': packageJson.scripts['validate:all'],
        'doc:version': packageJson.scripts['doc:version'],
        'create:spec': packageJson.scripts['create:spec']
      },
      keywords: packageJson.keywords,
      author: packageJson.author,
      license: packageJson.license,
      dependencies: packageJson.dependencies,
      engines: packageJson.engines,
      repository: packageJson.repository,
      bugs: packageJson.bugs,
      homepage: packageJson.homepage
    };
    
    fs.writeFileSync(
      path.join(RELEASE_DIR, 'package.json'),
      JSON.stringify(releasePackage, null, 2)
    );
    
    logSuccess('Release package.json created');

    // Step 8: Create release info
    logStep('📊', 'Creating release information');
    
    const releaseInfo = {
      version: currentVersion,
      releaseTime: new Date().toISOString(),
      nodeVersion: process.version,
      frameworkFiles: frameworkFiles.length,
      helloWorldApp: {
        included: true,
        buildTime: fs.statSync(buildDir).mtime.toISOString(),
        buildSize: fs.statSync(buildDir).size
      },
      releaseId: `release-${Date.now()}`
    };
    
    fs.writeFileSync(
      path.join(RELEASE_DIR, 'release-info.json'),
      JSON.stringify(releaseInfo, null, 2)
    );
    
    logSuccess('Release information created');

    // Step 9: Update documentation with release info
    logStep('📚', 'Updating documentation');
    
    // Update README with release info
    const readmePath = path.join(RELEASE_DIR, 'README.md');
    if (fs.existsSync(readmePath)) {
      let readmeContent = fs.readFileSync(readmePath, 'utf8');
      
      const releaseHeader = `\n## Release Information\n\n- **Version**: ${currentVersion}\n- **Release Date**: ${new Date().toLocaleDateString()}\n- **Hello World App**: Included (Built)\n- **Node.js Version**: ${process.version}\n\n`;
      
      if (readmeContent.includes('## Release Information')) {
        readmeContent = readmeContent.replace(
          /## Release Information[\s\S]*?(?=\n## |$)/,
          releaseHeader
        );
      } else {
        readmeContent = readmeContent.replace(
          /(## Installation)/,
          `${releaseHeader}$1`
        );
      }
      
      fs.writeFileSync(readmePath, readmeContent);
      logSuccess('README updated with release information');
    }

    // Step 10: Create release summary
    logStep('📋', 'Creating release summary');
    
    const releaseSummary = `# Agent-OS Framework Release ${currentVersion}

## Release Summary

**Version**: ${currentVersion}  
**Release Date**: ${new Date().toLocaleDateString()}  
**Release Time**: ${new Date().toLocaleTimeString()}  
**Node.js Version**: ${process.version}

## Components Included

### Framework Core
- Source code (src/)
- Scripts (scripts/)
- Rules and standards (rules/, standards/)
- Documentation (docs/, instructions/)
- Configuration files

### Hello World App
- **Status**: Built and included
- **Build Time**: ${fs.statSync(buildDir).mtime.toLocaleString()}
- **Location**: hello-world-app/

## Installation

\`\`\`bash
cd release
npm install
\`\`\`

## Usage

\`\`\`bash
# Start the framework
npm start

# Run validation
npm run validate:all

# Check version
npm run doc:version

# Create a new spec
npm run create:spec
\`\`\`

## Release Notes

This release includes the complete Agent-OS framework with a built Hello World application demonstrating the development process and testing capabilities.

## Build Information

- **Framework Validation**: ✅ Passed
- **Hello World App Build**: ✅ Successful
- **Release Package**: ✅ Created
- **Documentation**: ✅ Updated

---
*Generated by Agent-OS Release Script*
`;
    
    fs.writeFileSync(
      path.join(RELEASE_DIR, 'RELEASE-SUMMARY.md'),
      releaseSummary
    );
    
    logSuccess('Release summary created');

    // Step 11: Git stage/commit/tag/push
    logStep('🧷', 'Committing and tagging release');
    if (SKIP_GIT) {
      logInfo('Skipping git operations due to --dry-run/--no-git');
    } else if (isGitRepo()) {
      const branch = getCurrentBranch();
      logInfo(`Current git branch: ${branch || 'unknown'}`);
      if (!runGit('git add -A', 'Staging changes')) {
        logError('Failed to stage changes');
        process.exit(1);
      }
      if (!runGit(`git commit -m "chore(release): ${newTag}"`, 'Committing release changes')) {
        logWarning('Nothing to commit or commit failed');
      }
      if (!runGit(`git tag -a ${newTag} -m "Release ${newTag}"`, 'Creating annotated tag')) {
        logWarning('Tag creation failed (might already exist)');
      }
      if (NO_PUSH) {
        logInfo('Skipping push due to --dry-run/--no-push');
      } else {
        runGit('git push origin HEAD', 'Pushing branch');
        runGit('git push origin --tags', 'Pushing tags');
      }
    } else {
      logWarning('Skipping git commit/tag/push (not a git repository)');
    }

    // Release completed successfully
    const releaseTime = Date.now() - startTime;
    log('\n🎉 Release completed successfully!', 'bright');
    log(`⏱️  Total release time: ${releaseTime}ms`, 'green');
    log(`📁 Release output: ${RELEASE_DIR}/`, 'green');
    
    // Display release summary
    log('\n📊 Release Summary:', 'bright');
    log('==================');
    log(`📦 Framework Version: ${currentVersion}`);
    log(`🌍 Hello World App: Built and included`);
    log(`📁 Framework Files: ${frameworkFiles.length} components`);
    log(`📚 Documentation: Updated with release info`);
    log(`🔧 Scripts: Production-ready versions`);
    
    log('\n🚀 Ready for distribution!', 'bright');
    log(`The release package is available in the '${RELEASE_DIR}/' directory.`, 'cyan');
    log('Users can install it with "npm install" in the release directory.', 'cyan');

  } catch (error) {
    logError(`Release failed: ${error.message}`);
    process.exit(1);
  }
}

// Run release if this script is executed directly
if (require.main === module) {
  release().catch(error => {
    logError(`Release process failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { release };

