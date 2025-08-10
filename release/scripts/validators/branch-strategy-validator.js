#!/usr/bin/env node

/**
 * Branch Strategy Validator
 * 
 * Validates Git branching strategy, naming conventions, and workflow compliance
 * according to Agent OS standards.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BranchStrategyValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      validations: []
    };
  }

  async validateProject(projectPath = '.') {
    if (!this.isGitRepository(projectPath)) {
      throw new Error('Not a Git repository');
    }

    const validations = [];
    
    // Change to project directory for git commands
    const originalCwd = process.cwd();
    process.chdir(projectPath);

    try {
      // Core branch strategy validations
      validations.push(await this.validateBranchNaming());
      validations.push(await this.validateBranchStructure());
      validations.push(await this.validateFeatureBranches());
      validations.push(await this.validateCommitHistory());
      validations.push(await this.validateMainBranchProtection());
      validations.push(await this.validateSpecBranchAlignment());
      
      const overallResult = this.aggregateValidations(validations);
      
      return {
        projectPath: projectPath,
        status: overallResult.status,
        validations: validations,
        summary: overallResult.summary,
        recommendations: overallResult.recommendations,
        gitInfo: this.getGitInfo()
      };
      
    } finally {
      process.chdir(originalCwd);
    }
  }

  async validateBranchNaming() {
    const branches = this.getAllBranches();
    const namingViolations = [];
    const validPatterns = [
      /^main$/,
      /^master$/,
      /^develop$/,
      /^feature\/[a-z0-9-]+$/,
      /^hotfix\/[a-z0-9-]+$/,
      /^release\/[a-z0-9.-]+$/,
      /^bugfix\/[a-z0-9-]+$/
    ];

    branches.forEach(branch => {
      const branchName = branch.replace('origin/', '').trim();
      const isValid = validPatterns.some(pattern => pattern.test(branchName));
      
      if (!isValid) {
        namingViolations.push({
          branch: branchName,
          issue: 'Does not follow naming convention',
          suggestion: this.suggestBranchName(branchName)
        });
      }
    });

    const status = namingViolations.length === 0 ? 'PASS' : 'WARNING';
    const message = namingViolations.length === 0
      ? `All ${branches.length} branches follow naming conventions`
      : `${namingViolations.length} of ${branches.length} branches have naming issues`;

    return this.createValidation('Branch Naming', status, message, {
      totalBranches: branches.length,
      violationCount: namingViolations.length,
      violations: namingViolations,
      validPatterns: [
        'main/master',
        'feature/feature-name',
        'hotfix/issue-description',
        'release/version-number',
        'bugfix/bug-description'
      ],
      recommendation: namingViolations.length > 0
        ? 'Rename branches to follow Agent OS naming conventions'
        : null
    });
  }

  async validateBranchStructure() {
    const branches = this.getAllBranches();
    const localBranches = branches.filter(b => !b.startsWith('origin/'));
    const remoteBranches = branches.filter(b => b.startsWith('origin/'));
    
    const issues = [];
    
    // Check for main/master branch
    const hasMainBranch = branches.some(b => b.includes('main') || b.includes('master'));
    if (!hasMainBranch) {
      issues.push({
        type: 'Missing Main Branch',
        description: 'No main or master branch found'
      });
    }

    // Check for untracked local branches
    const untrackedBranches = localBranches.filter(local => {
      const remoteName = `origin/${local}`;
      return !remoteBranches.includes(remoteName) && local !== 'main' && local !== 'master';
    });

    if (untrackedBranches.length > 0) {
      issues.push({
        type: 'Untracked Local Branches',
        branches: untrackedBranches,
        description: 'Local branches not pushed to remote'
      });
    }

    // Check for stale branches
    const staleBranches = await this.findStaleBranches();
    if (staleBranches.length > 0) {
      issues.push({
        type: 'Stale Branches',
        branches: staleBranches,
        description: 'Branches with no recent commits'
      });
    }

    const status = issues.length === 0 ? 'PASS' : 'WARNING';
    const message = issues.length === 0
      ? 'Branch structure is well-organized'
      : `Found ${issues.length} branch structure issues`;

    return this.createValidation('Branch Structure', status, message, {
      localBranches: localBranches.length,
      remoteBranches: remoteBranches.length,
      issues: issues,
      recommendation: issues.length > 0
        ? 'Clean up stale branches and push local branches to remote'
        : null
    });
  }

  async validateFeatureBranches() {
    const featureBranches = this.getAllBranches().filter(b => 
      b.includes('feature/') || b.includes('feat/')
    );

    const branchAnalysis = [];
    
    for (const branch of featureBranches) {
      const branchName = branch.replace('origin/', '');
      const analysis = await this.analyzeFeatureBranch(branchName);
      branchAnalysis.push(analysis);
    }

    // Check for Agent OS spec alignment
    const specAlignedBranches = branchAnalysis.filter(b => b.hasSpecAlignment);
    const unalignedBranches = branchAnalysis.filter(b => !b.hasSpecAlignment);

    const status = unalignedBranches.length === 0 ? 'PASS' : 'WARNING';
    const message = featureBranches.length === 0
      ? 'No feature branches to validate'
      : `${specAlignedBranches.length} of ${featureBranches.length} feature branches aligned with specs`;

    return this.createValidation('Feature Branches', status, message, {
      totalFeatureBranches: featureBranches.length,
      alignedBranches: specAlignedBranches.length,
      unalignedBranches: unalignedBranches.length,
      branchAnalysis: branchAnalysis,
      recommendation: unalignedBranches.length > 0
        ? 'Ensure feature branches correspond to specs in .agent-os/specs/'
        : null
    });
  }

  async validateCommitHistory() {
    const currentBranch = this.getCurrentBranch();
    const commits = this.getRecentCommits(10);
    
    const commitIssues = [];
    const conventionalCommitPattern = /^(feat|fix|docs|style|refactor|test|chore|perf)(\(.+\))?: .+/;

    commits.forEach(commit => {
      const message = commit.message.split('\n')[0]; // First line only
      
      // Check conventional commit format
      if (!conventionalCommitPattern.test(message)) {
        commitIssues.push({
          hash: commit.hash,
          message: message,
          issue: 'Does not follow conventional commit format',
          type: 'format'
        });
      }

      // Check commit message length
      if (message.length > 72) {
        commitIssues.push({
          hash: commit.hash,
          message: message.substring(0, 50) + '...',
          issue: 'Commit message too long (>72 characters)',
          type: 'length'
        });
      }

      // Check for merge commits on feature branches
      if (commit.message.startsWith('Merge') && currentBranch.includes('feature/')) {
        commitIssues.push({
          hash: commit.hash,
          message: message,
          issue: 'Merge commit on feature branch (prefer rebase)',
          type: 'merge'
        });
      }
    });

    const status = commitIssues.length === 0 ? 'PASS' : 'WARNING';
    const message = commitIssues.length === 0
      ? `All ${commits.length} recent commits follow conventions`
      : `${commitIssues.length} of ${commits.length} commits have issues`;

    return this.createValidation('Commit History', status, message, {
      totalCommits: commits.length,
      issueCount: commitIssues.length,
      issues: commitIssues,
      currentBranch: currentBranch,
      recommendation: commitIssues.length > 0
        ? 'Follow conventional commit format and keep messages under 72 characters'
        : null
    });
  }

  async validateMainBranchProtection() {
    const mainBranch = this.getMainBranch();
    if (!mainBranch) {
      return this.createValidation('Main Branch Protection', 'FAIL', 
        'No main branch found');
    }

    // Check if current branch is main and has uncommitted changes
    const currentBranch = this.getCurrentBranch();
    const hasUncommittedChanges = this.hasUncommittedChanges();
    
    const issues = [];

    if (currentBranch === mainBranch && hasUncommittedChanges) {
      issues.push({
        type: 'Direct Main Branch Changes',
        description: 'Uncommitted changes detected on main branch'
      });
    }

    // Check for direct commits to main (simplified check)
    const mainCommits = this.getRecentCommits(5, mainBranch);
    const directCommits = mainCommits.filter(commit => 
      !commit.message.startsWith('Merge') && 
      !commit.message.includes('pull request') &&
      !commit.message.includes('PR #')
    );

    if (directCommits.length > 0) {
      issues.push({
        type: 'Direct Commits to Main',
        count: directCommits.length,
        description: 'Direct commits to main branch detected'
      });
    }

    const status = issues.length === 0 ? 'PASS' : 'WARNING';
    const message = issues.length === 0
      ? 'Main branch protection practices followed'
      : `${issues.length} main branch protection issues found`;

    return this.createValidation('Main Branch Protection', status, message, {
      mainBranch: mainBranch,
      currentBranch: currentBranch,
      issues: issues,
      recommendation: issues.length > 0
        ? 'Use feature branches for all changes, merge via pull requests'
        : null
    });
  }

  async validateSpecBranchAlignment() {
    const specsDir = path.join('.agent-os', 'specs');
    if (!fs.existsSync(specsDir)) {
      return this.createValidation('Spec Branch Alignment', 'PASS', 
        'No specs directory found - alignment not applicable');
    }

    const specs = fs.readdirSync(specsDir)
      .filter(item => fs.statSync(path.join(specsDir, item)).isDirectory())
      .filter(item => /^\d{4}-\d{2}-\d{2}-/.test(item));

    const featureBranches = this.getAllBranches()
      .filter(b => b.includes('feature/'))
      .map(b => b.replace('origin/', '').replace('feature/', ''));

    const alignmentIssues = [];
    const alignedSpecs = [];

    specs.forEach(spec => {
      const specName = spec.replace(/^\d{4}-\d{2}-\d{2}-/, '');
      const hasMatchingBranch = featureBranches.some(branch => 
        branch.includes(specName) || specName.includes(branch)
      );

      if (hasMatchingBranch) {
        alignedSpecs.push(spec);
      } else {
        // Check if spec has active status
        const statusFile = path.join(specsDir, spec, 'status.md');
        if (fs.existsSync(statusFile)) {
          const statusContent = fs.readFileSync(statusFile, 'utf8');
          if (statusContent.includes('**Current Status**: Active') || 
              statusContent.includes('**Current Status**: In Progress')) {
            alignmentIssues.push({
              spec: spec,
              issue: 'Active spec without corresponding feature branch'
            });
          }
        }
      }
    });

    const status = alignmentIssues.length === 0 ? 'PASS' : 'WARNING';
    const message = alignmentIssues.length === 0
      ? `All ${specs.length} specs properly aligned with branches`
      : `${alignmentIssues.length} specs missing corresponding feature branches`;

    return this.createValidation('Spec Branch Alignment', status, message, {
      totalSpecs: specs.length,
      alignedSpecs: alignedSpecs.length,
      alignmentIssues: alignmentIssues,
      recommendation: alignmentIssues.length > 0
        ? 'Create feature branches for active specs following naming convention'
        : null
    });
  }

  // Utility methods
  isGitRepository(projectPath) {
    return fs.existsSync(path.join(projectPath, '.git'));
  }

  getAllBranches() {
    try {
      const output = execSync('git branch -a', { encoding: 'utf8' });
      return output.split('\n')
        .map(line => line.replace(/^\*?\s*/, '').trim())
        .filter(line => line && !line.includes('HEAD'));
    } catch (error) {
      return [];
    }
  }

  getCurrentBranch() {
    try {
      return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch (error) {
      return 'unknown';
    }
  }

  getMainBranch() {
    const branches = this.getAllBranches();
    return branches.find(b => b === 'main' || b === 'master') || 
           branches.find(b => b === 'origin/main' || b === 'origin/master');
  }

  hasUncommittedChanges() {
    try {
      const output = execSync('git status --porcelain', { encoding: 'utf8' });
      return output.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  getRecentCommits(count = 10, branch = null) {
    try {
      const branchArg = branch ? ` ${branch}` : '';
      const output = execSync(`git log --oneline -n ${count}${branchArg}`, { encoding: 'utf8' });
      return output.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [hash, ...messageParts] = line.split(' ');
          return {
            hash: hash,
            message: messageParts.join(' ')
          };
        });
    } catch (error) {
      return [];
    }
  }

  async findStaleBranches() {
    try {
      // Find branches with no commits in last 30 days
      const output = execSync('git for-each-ref --format="%(refname:short) %(committerdate)" refs/heads/', { encoding: 'utf8' });
      const branches = output.split('\n').filter(line => line.trim());
      const staleBranches = [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      branches.forEach(branchLine => {
        const [branchName, ...dateParts] = branchLine.split(' ');
        const commitDate = new Date(dateParts.join(' '));
        
        if (commitDate < thirtyDaysAgo && branchName !== 'main' && branchName !== 'master') {
          staleBranches.push({
            name: branchName,
            lastCommit: commitDate.toISOString().split('T')[0]
          });
        }
      });

      return staleBranches;
    } catch (error) {
      return [];
    }
  }

  async analyzeFeatureBranch(branchName) {
    const specName = branchName.replace('feature/', '');
    const specsDir = path.join('.agent-os', 'specs');
    
    // Look for matching spec
    let hasSpecAlignment = false;
    let matchingSpec = null;

    if (fs.existsSync(specsDir)) {
      const specs = fs.readdirSync(specsDir);
      matchingSpec = specs.find(spec => 
        spec.includes(specName) || specName.includes(spec.replace(/^\d{4}-\d{2}-\d{2}-/, ''))
      );
      hasSpecAlignment = !!matchingSpec;
    }

    // Get branch commit info
    let commitCount = 0;
    let lastCommitDate = null;
    
    try {
      const commitOutput = execSync(`git rev-list --count ${branchName}`, { encoding: 'utf8' });
      commitCount = parseInt(commitOutput.trim());
      
      const dateOutput = execSync(`git log -1 --format="%ci" ${branchName}`, { encoding: 'utf8' });
      lastCommitDate = new Date(dateOutput.trim());
    } catch (error) {
      // Branch might not exist locally
    }

    return {
      name: branchName,
      hasSpecAlignment: hasSpecAlignment,
      matchingSpec: matchingSpec,
      commitCount: commitCount,
      lastCommitDate: lastCommitDate
    };
  }

  suggestBranchName(branchName) {
    // Simple suggestion logic
    if (branchName.includes('feat') || branchName.includes('feature')) {
      return `feature/${branchName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    }
    if (branchName.includes('fix') || branchName.includes('bug')) {
      return `bugfix/${branchName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    }
    if (branchName.includes('hot')) {
      return `hotfix/${branchName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    }
    
    return `feature/${branchName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  }

  getGitInfo() {
    try {
      return {
        currentBranch: this.getCurrentBranch(),
        totalBranches: this.getAllBranches().length,
        hasUncommittedChanges: this.hasUncommittedChanges(),
        recentCommits: this.getRecentCommits(5).length
      };
    } catch (error) {
      return {};
    }
  }

  createValidation(name, status, message, details = {}) {
    return {
      name: name,
      status: status,
      message: message,
      details: details
    };
  }

  aggregateValidations(validations) {
    const failed = validations.filter(v => v.status === 'FAIL').length;
    const warnings = validations.filter(v => v.status === 'WARNING').length;
    const passed = validations.filter(v => v.status === 'PASS').length;

    const overallStatus = failed > 0 ? 'FAIL' : warnings > 0 ? 'WARNING' : 'PASS';
    
    const recommendations = validations
      .filter(v => v.details && v.details.recommendation)
      .map(v => v.details.recommendation);

    return {
      status: overallStatus,
      summary: {
        total: validations.length,
        passed: passed,
        warnings: warnings,
        failed: failed
      },
      recommendations: recommendations
    };
  }

  displayResults(result) {
    console.log('\n🌿 Branch Strategy Validation Results');
    console.log('====================================\n');

    const statusIcon = result.status === 'PASS' ? '✅' : 
                      result.status === 'WARNING' ? '⚠️' : '❌';
    
    console.log(`${statusIcon} Overall Branch Strategy: ${result.status}\n`);
    console.log(`📁 Project: ${path.basename(result.projectPath)}`);
    console.log(`🌿 Current Branch: ${result.gitInfo.currentBranch}`);
    console.log(`📊 Total Branches: ${result.gitInfo.totalBranches}\n`);

    result.validations.forEach(validation => {
      const icon = validation.status === 'PASS' ? '  ✓' : 
                  validation.status === 'WARNING' ? '  ⚠' : '  ✗';
      console.log(`${icon} ${validation.name}: ${validation.message}`);
      
      if (validation.details.violations && validation.details.violations.length > 0) {
        console.log('    Issues:');
        validation.details.violations.slice(0, 3).forEach(violation => {
          console.log(`      - ${violation.branch || violation.spec}: ${violation.issue || violation.description}`);
        });
        if (validation.details.violations.length > 3) {
          console.log(`      - ... and ${validation.details.violations.length - 3} more`);
        }
      }
    });

    if (result.recommendations.length > 0) {
      console.log('\n💡 Branch Strategy Recommendations:');
      result.recommendations.forEach(rec => {
        console.log(`   - ${rec}`);
      });
    }

    console.log('\n📊 Summary');
    console.log('----------');
    console.log(`Total Validations: ${result.summary.total}`);
    console.log(`✅ Passed: ${result.summary.passed}`);
    console.log(`⚠️ Warnings: ${result.summary.warnings}`);
    console.log(`❌ Failed: ${result.summary.failed}\n`);
  }
}

// CLI usage
if (require.main === module) {
  const validator = new BranchStrategyValidator();
  const projectPath = process.argv[2] || '.';

  (async () => {
    try {
      const result = await validator.validateProject(projectPath);
      validator.displayResults(result);
      
      const hasFailures = result.status === 'FAIL';
      process.exit(hasFailures ? 1 : 0);
      
    } catch (error) {
      console.error('❌ Branch strategy validation failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = BranchStrategyValidator;
