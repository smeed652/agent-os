#!/usr/bin/env node

/**
 * Validator Runner
 * 
 * Orchestrates multiple validators and provides unified reporting.
 */

const fs = require('fs');
const path = require('path');

// Import all validators
const CodeQualityValidator = require('./code-quality-validator');
const SpecAdherenceValidator = require('./spec-adherence-validator');
const SecurityValidator = require('./security-validator');
const BranchStrategyValidator = require('./branch-strategy-validator');
const TestingCompletenessValidator = require('./testing-completeness-validator');
const DocumentationValidator = require('./documentation-validator');

class ValidatorRunner {
  constructor() {
    this.validators = {
      'code-quality': {
        class: CodeQualityValidator,
        name: 'Code Quality',
        description: 'File size, complexity, duplication, naming conventions',
        tier: 1
      },
      'spec-adherence': {
        class: SpecAdherenceValidator,
        name: 'Spec Adherence',
        description: 'Implementation matches specification requirements',
        tier: 1
      },
      'security': {
        class: SecurityValidator,
        name: 'Security',
        description: 'Security vulnerabilities and best practices',
        tier: 2
      },
      'branch-strategy': {
        class: BranchStrategyValidator,
        name: 'Branch Strategy',
        description: 'Git workflow and branching conventions',
        tier: 2
      },
      'testing': {
        class: TestingCompletenessValidator,
        name: 'Testing Completeness',
        description: 'Test coverage and TDD approach',
        tier: 2
      },
      'documentation': {
        class: DocumentationValidator,
        name: 'Documentation',
        description: 'Documentation completeness and quality',
        tier: 2
      }
    };
  }

  async runAll(projectPath = '.', options = {}) {
    const startTime = Date.now();
    console.log('🚀 Running All Validators');
    console.log('========================\n');

    const results = {};
    const summary = {
      total: 0,
      passed: 0,
      warnings: 0,
      failed: 0,
      skipped: 0
    };

    // Run validators by tier
    const tiers = [1, 2];
    
    for (const tier of tiers) {
      const tierValidators = Object.entries(this.validators)
        .filter(([_, config]) => config.tier === tier);
      
      if (tierValidators.length > 0) {
        console.log(`\n🎯 Tier ${tier} Validators`);
        console.log('─'.repeat(20));
        
        for (const [key, config] of tierValidators) {
          if (options.skip && options.skip.includes(key)) {
            console.log(`⏭️  Skipping ${config.name}`);
            summary.skipped++;
            continue;
          }

          try {
            console.log(`\n🔍 Running ${config.name}...`);
            const result = await this.runValidator(key, projectPath, options);
            results[key] = result;
            
            const statusIcon = result.status === 'PASS' ? '✅' : 
              result.status === 'WARNING' ? '⚠️' : '❌';
            console.log(`${statusIcon} ${config.name}: ${result.status}`);
            
            summary.total++;
            if (result.status === 'PASS') summary.passed++;
            else if (result.status === 'WARNING') summary.warnings++;
            else if (result.status === 'FAIL') summary.failed++;
            
          } catch (error) {
            console.log(`❌ ${config.name}: ERROR - ${error.message}`);
            results[key] = {
              status: 'ERROR',
              error: error.message
            };
            summary.total++;
            summary.failed++;
          }
        }
      }
    }

    const duration = Date.now() - startTime;
    const overallStatus = this.calculateOverallStatus(summary);
    
    return {
      overallStatus: overallStatus,
      summary: summary,
      results: results,
      duration: duration,
      projectPath: projectPath
    };
  }

  async runValidator(validatorKey, projectPath = '.', options = {}) {
    const validatorConfig = this.validators[validatorKey];
    if (!validatorConfig) {
      throw new Error(`Unknown validator: ${validatorKey}`);
    }

    const ValidatorClass = validatorConfig.class;
    const validator = new ValidatorClass();

    // Different validators have different method signatures
    switch (validatorKey) {
    case 'code-quality':
      if (options.target) {
        return await validator.validateFile(path.resolve(projectPath, options.target));
      } else {
        return await validator.validateDirectory(projectPath);
      }
      
    case 'spec-adherence':
      const specPath = options.specPath || this.findSpecPath(projectPath);
      const implementationPath = options.implementationPath || projectPath;
      return await validator.validateSpecAdherence(specPath, implementationPath);
      
    case 'security':
      return await validator.validateDirectory(projectPath);
      
    case 'branch-strategy':
      return await validator.validateProject(projectPath);
      
    case 'testing':
      return await validator.validateProject(projectPath);
      
    case 'documentation':
      return await validator.validateProject(projectPath);
      
    default:
      throw new Error(`No runner implementation for validator: ${validatorKey}`);
    }
  }

  async runSpecific(validators, projectPath = '.', options = {}) {
    const results = {};
    const summary = { total: 0, passed: 0, warnings: 0, failed: 0, skipped: 0 };

    console.log(`🎯 Running Specific Validators: ${validators.join(', ')}`);
    console.log('='.repeat(50));

    for (const validatorKey of validators) {
      if (!this.validators[validatorKey]) {
        console.log(`❌ Unknown validator: ${validatorKey}`);
        continue;
      }

      try {
        console.log(`\n🔍 Running ${this.validators[validatorKey].name}...`);
        const result = await this.runValidator(validatorKey, projectPath, options);
        results[validatorKey] = result;
        
        const statusIcon = result.status === 'PASS' ? '✅' : 
          result.status === 'WARNING' ? '⚠️' : '❌';
        console.log(`${statusIcon} ${this.validators[validatorKey].name}: ${result.status}`);
        
        summary.total++;
        if (result.status === 'PASS') summary.passed++;
        else if (result.status === 'WARNING') summary.warnings++;
        else if (result.status === 'FAIL') summary.failed++;
        
      } catch (error) {
        console.log(`❌ ${this.validators[validatorKey].name}: ERROR - ${error.message}`);
        results[validatorKey] = {
          status: 'ERROR',
          error: error.message
        };
        summary.total++;
        summary.failed++;
      }
    }

    return {
      overallStatus: this.calculateOverallStatus(summary),
      summary: summary,
      results: results,
      projectPath: projectPath
    };
  }

  findSpecPath(projectPath) {
    const specsDir = path.join(projectPath, '.agent-os', 'specs');
    if (!fs.existsSync(specsDir)) {
      return null;
    }

    // Find the most recent spec directory
    const specs = fs.readdirSync(specsDir)
      .filter(item => fs.statSync(path.join(specsDir, item)).isDirectory())
      .filter(item => /^\d{4}-\d{2}-\d{2}-/.test(item))
      .sort()
      .reverse();

    return specs.length > 0 ? path.join(specsDir, specs[0]) : null;
  }

  calculateOverallStatus(summary) {
    if (summary.failed > 0) return 'FAIL';
    if (summary.warnings > 0) return 'WARNING';
    if (summary.passed > 0) return 'PASS';
    return 'UNKNOWN';
  }

  displayResults(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 VALIDATION RESULTS SUMMARY');
    console.log('='.repeat(60));

    const statusIcon = results.overallStatus === 'PASS' ? '✅' : 
      results.overallStatus === 'WARNING' ? '⚠️' : '❌';
    
    console.log(`\n${statusIcon} Overall Status: ${results.overallStatus}`);
    console.log(`📁 Project: ${path.basename(results.projectPath)}`);
    console.log(`⏱️  Duration: ${(results.duration / 1000).toFixed(1)}s\n`);

    // Summary statistics
    console.log('📈 Summary Statistics:');
    console.log(`   Total Validators: ${results.summary.total}`);
    console.log(`   ✅ Passed: ${results.summary.passed}`);
    console.log(`   ⚠️ Warnings: ${results.summary.warnings}`);
    console.log(`   ❌ Failed: ${results.summary.failed}`);
    if (results.summary.skipped > 0) {
      console.log(`   ⏭️  Skipped: ${results.summary.skipped}`);
    }

    // Detailed results by tier
    console.log('\n🎯 Detailed Results by Tier:');
    
    const tiers = [1, 2];
    tiers.forEach(tier => {
      const tierValidators = Object.entries(this.validators)
        .filter(([_, config]) => config.tier === tier)
        .filter(([key, _]) => results.results[key]);

      if (tierValidators.length > 0) {
        console.log(`\n   Tier ${tier} - ${tier === 1 ? 'Critical Quality' : 'Development Workflow'}:`);
        
        tierValidators.forEach(([key, config]) => {
          const result = results.results[key];
          if (result) {
            const icon = result.status === 'PASS' ? '     ✅' : 
              result.status === 'WARNING' ? '     ⚠️' : '     ❌';
            console.log(`${icon} ${config.name}: ${result.status}`);
            
            // Show key metrics if available
            if (result.summary) {
              const metrics = [];
              if (result.summary.passedFiles !== undefined) {
                metrics.push(`${result.summary.passedFiles}/${result.summary.totalFiles} files`);
              }
              if (result.summary.coverageRatio !== undefined) {
                metrics.push(`${result.summary.coverageRatio.toFixed(0)}% coverage`);
              }
              if (result.summary.completenessScore !== undefined) {
                metrics.push(`${result.summary.completenessScore.toFixed(0)}% complete`);
              }
              if (metrics.length > 0) {
                console.log(`          (${metrics.join(', ')})`);
              }
            }
          }
        });
      }
    });

    // Collect all recommendations
    const allRecommendations = [];
    Object.values(results.results).forEach(result => {
      if (result.recommendations) {
        allRecommendations.push(...result.recommendations);
      }
      if (result.validations) {
        result.validations.forEach(validation => {
          if (validation.details && validation.details.recommendation) {
            allRecommendations.push(validation.details.recommendation);
          }
        });
      }
    });

    // Show top recommendations
    if (allRecommendations.length > 0) {
      console.log('\n💡 Top Recommendations:');
      const uniqueRecommendations = [...new Set(allRecommendations)];
      uniqueRecommendations.slice(0, 5).forEach(rec => {
        console.log(`   - ${rec}`);
      });
      if (uniqueRecommendations.length > 5) {
        console.log(`   ... and ${uniqueRecommendations.length - 5} more recommendations`);
      }
    }

    // Quality score
    const qualityScore = results.summary.total > 0 
      ? Math.round(((results.summary.passed + results.summary.warnings * 0.5) / results.summary.total) * 100)
      : 0;
    
    console.log(`\n🏆 Overall Quality Score: ${qualityScore}%`);
    
    if (qualityScore >= 90) {
      console.log('   🌟 Excellent! Your project meets high quality standards.');
    } else if (qualityScore >= 75) {
      console.log('   👍 Good quality with room for improvement.');
    } else if (qualityScore >= 60) {
      console.log('   ⚠️  Moderate quality - consider addressing key issues.');
    } else {
      console.log('   🔧 Significant improvements needed for production readiness.');
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }

  listValidators() {
    console.log('\n🔍 Available Validators');
    console.log('======================\n');

    const tiers = [1, 2];
    tiers.forEach(tier => {
      console.log(`🎯 Tier ${tier} - ${tier === 1 ? 'Critical Quality' : 'Development Workflow'}:`);
      
      Object.entries(this.validators)
        .filter(([_, config]) => config.tier === tier)
        .forEach(([key, config]) => {
          console.log(`   ${key.padEnd(20)} - ${config.description}`);
        });
      console.log('');
    });

    console.log('Usage Examples:');
    console.log('   npm run validate:all                    # Run all validators');
    console.log('   npm run validate:tier1                  # Run only Tier 1 validators');
    console.log('   npm run validate:tier2                  # Run only Tier 2 validators');
    console.log('   npm run validate:specific security,testing  # Run specific validators');
    console.log('');
  }
}

// CLI usage
if (require.main === module) {
  const runner = new ValidatorRunner();
  const args = process.argv.slice(2);
  const command = args[0];

  (async () => {
    try {
      let results;

      switch (command) {
      case 'list':
        runner.listValidators();
        return;

      case 'all':
        results = await runner.runAll(args[1] || '.');
        break;

      case 'tier1':
        const tier1Validators = Object.keys(runner.validators)
          .filter(key => runner.validators[key].tier === 1);
        results = await runner.runSpecific(tier1Validators, args[1] || '.');
        break;

      case 'tier2':
        const tier2Validators = Object.keys(runner.validators)
          .filter(key => runner.validators[key].tier === 2);
        results = await runner.runSpecific(tier2Validators, args[1] || '.');
        break;

      case 'specific':
        if (!args[1]) {
          console.error('Usage: validator-runner specific <validator1,validator2,...> [project-path]');
          process.exit(1);
        }
        const validators = args[1].split(',');
        results = await runner.runSpecific(validators, args[2] || '.');
        break;

      default:
        console.log('Usage: validator-runner <command> [options]');
        console.log('Commands:');
        console.log('  list                    - List all available validators');
        console.log('  all [path]             - Run all validators');
        console.log('  tier1 [path]           - Run Tier 1 validators only');
        console.log('  tier2 [path]           - Run Tier 2 validators only');
        console.log('  specific <list> [path] - Run specific validators (comma-separated)');
        process.exit(1);
      }

      if (results) {
        runner.displayResults(results);
        const hasFailures = results.overallStatus === 'FAIL';
        process.exit(hasFailures ? 1 : 0);
      }

    } catch (error) {
      console.error('❌ Validator runner failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = ValidatorRunner;
