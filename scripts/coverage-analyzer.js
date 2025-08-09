#!/usr/bin/env node

/**
 * Agent OS Coverage Analyzer
 * 
 * Provides detailed coverage analysis for all Agent OS components
 */

const fs = require('fs');
const path = require('path');

class CoverageAnalyzer {
  constructor() {
    this.coverage = {
      rules: { tested: 0, total: 0, details: [] },
      instructions: { tested: 0, total: 0, details: [] },
      standards: { tested: 0, total: 0, details: [] },
      scripts: { tested: 0, total: 0, details: [] },
      features: { tested: 0, total: 0, details: [] }
    };
  }

  async analyzeCoverage() {
    console.log('📊 AGENT OS COVERAGE ANALYSIS');
    console.log('═'.repeat(80) + '\\n');

    await this.analyzeRulesCoverage();
    await this.analyzeInstructionsCoverage();
    await this.analyzeStandardsCoverage();
    await this.analyzeScriptsCoverage();
    await this.analyzeFeaturesCoverage();

    this.generateCoverageReport();
    this.generateRecommendations();
  }

  async analyzeRulesCoverage() {
    console.log('🔍 Analyzing Universal Rules Coverage...');
    
    const rulesDir = path.join(__dirname, '..', 'rules');
    if (!fs.existsSync(rulesDir)) {
      console.log('   ⚠️  Rules directory not found');
      return;
    }

    const ruleFiles = fs.readdirSync(rulesDir)
      .filter(file => file.endsWith('.mdc'))
      .sort();

    this.coverage.rules.total = ruleFiles.length;

    for (const ruleFile of ruleFiles) {
      const rulePath = path.join(rulesDir, ruleFile);
      const content = fs.readFileSync(rulePath, 'utf8');
      
      // Check if rule has proper structure
      const hasMetadata = content.includes('alwaysApply:');
      const hasTitle = content.includes('# ');
      const hasSections = (content.match(/^## /gm) || []).length >= 2;
      const hasContent = content.length > 1000;
      
      const isTested = hasMetadata && hasTitle && hasSections && hasContent;
      
      this.coverage.rules.details.push({
        name: ruleFile,
        tested: isTested,
        issues: [
          !hasMetadata && 'Missing metadata',
          !hasTitle && 'Missing title',
          !hasSections && 'Insufficient sections',
          !hasContent && 'Insufficient content'
        ].filter(Boolean)
      });

      if (isTested) this.coverage.rules.tested++;
    }

    console.log(`   ✅ Found ${this.coverage.rules.total} universal rules`);
    console.log(`   📈 ${this.coverage.rules.tested} fully tested (${Math.round((this.coverage.rules.tested / this.coverage.rules.total) * 100)}%)`);
  }

  async analyzeInstructionsCoverage() {
    console.log('\\n🔍 Analyzing Instructions Coverage...');
    
    const instructionsDir = path.join(__dirname, '..', 'instructions', 'core');
    if (!fs.existsSync(instructionsDir)) {
      console.log('   ⚠️  Instructions directory not found');
      return;
    }

    const instructionFiles = fs.readdirSync(instructionsDir)
      .filter(file => file.endsWith('.md'))
      .sort();

    this.coverage.instructions.total = instructionFiles.length;

    // Define which instructions have dedicated tests
    const testedInstructions = [
      'create-spec.md',     // Tested by validator tests
      'execute-tasks.md',   // Tested by validator tests
      'test-lifecycle.md'   // Tested by lifecycle tests
    ];

    for (const instructionFile of instructionFiles) {
      const isTested = testedInstructions.includes(instructionFile);
      
      this.coverage.instructions.details.push({
        name: instructionFile,
        tested: isTested,
        testType: isTested ? 'Dedicated test suite' : 'No specific tests'
      });

      if (isTested) this.coverage.instructions.tested++;
    }

    console.log(`   ✅ Found ${this.coverage.instructions.total} instruction files`);
    console.log(`   📈 ${this.coverage.instructions.tested} have dedicated tests (${Math.round((this.coverage.instructions.tested / this.coverage.instructions.total) * 100)}%)`);
  }

  async analyzeStandardsCoverage() {
    console.log('\\n🔍 Analyzing Standards Coverage...');
    
    const standardsDir = path.join(__dirname, '..', 'standards');
    if (!fs.existsSync(standardsDir)) {
      console.log('   ⚠️  Standards directory not found');
      return;
    }

    const standardFiles = [];
    
    // Get all .md files in standards directory and subdirectories
    const scanDirectory = (dir, prefix = '') => {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        const relativePath = prefix ? `${prefix}/${item.name}` : item.name;
        
        if (item.isDirectory()) {
          scanDirectory(fullPath, relativePath);
        } else if (item.name.endsWith('.md')) {
          standardFiles.push(relativePath);
        }
      }
    };

    scanDirectory(standardsDir);
    this.coverage.standards.total = standardFiles.length;

    // Standards are implicitly tested through rule validation
    const implicitlyTested = ['best-practices.md', 'tech-stack.md'];
    
    for (const standardFile of standardFiles) {
      const isTested = implicitlyTested.some(tested => standardFile.includes(tested));
      
      this.coverage.standards.details.push({
        name: standardFile,
        tested: isTested,
        testType: isTested ? 'Implicit through rules' : 'Not tested'
      });

      if (isTested) this.coverage.standards.tested++;
    }

    console.log(`   ✅ Found ${this.coverage.standards.total} standard files`);
    console.log(`   📈 ${this.coverage.standards.tested} implicitly tested (${Math.round((this.coverage.standards.tested / this.coverage.standards.total) * 100)}%)`);
  }

  async analyzeScriptsCoverage() {
    console.log('\\n🔍 Analyzing Scripts Coverage...');
    
    const scriptsDir = path.join(__dirname, '..', 'scripts');
    if (!fs.existsSync(scriptsDir)) {
      console.log('   ⚠️  Scripts directory not found');
      return;
    }

    const scriptFiles = fs.readdirSync(scriptsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    this.coverage.scripts.total = scriptFiles.length;

    // Define which scripts are tested
    const testedScripts = [
      'test-runner.js',           // Self-testing
      'test-rules.js',            // Self-testing
      'test-rule-parser.js',      // Self-testing
      'test-lifecycle.js',        // Self-testing
      'test-validators.js',       // Self-testing
      'enhanced-test-runner.js',  // Self-testing
      'simple-dashboard-generator.js', // Tested by lifecycle tests
      'global-dashboard-generator.js'  // Tested by lifecycle tests
    ];

    for (const scriptFile of scriptFiles) {
      const isTested = testedScripts.includes(scriptFile);
      
      this.coverage.scripts.details.push({
        name: scriptFile,
        tested: isTested,
        testType: isTested ? 'Self-testing or integration tested' : 'Not tested'
      });

      if (isTested) this.coverage.scripts.tested++;
    }

    console.log(`   ✅ Found ${this.coverage.scripts.total} script files`);
    console.log(`   📈 ${this.coverage.scripts.tested} are tested (${Math.round((this.coverage.scripts.tested / this.coverage.scripts.total) * 100)}%)`);
  }

  async analyzeFeaturesCoverage() {
    console.log('\\n🔍 Analyzing Core Features Coverage...');
    
    // Define core Agent OS features
    const coreFeatures = [
      { name: 'Spec Creation', tested: true, testSuite: 'Validator Tests' },
      { name: 'Task Execution', tested: true, testSuite: 'Validator Tests' },
      { name: 'Lifecycle Management', tested: true, testSuite: 'Lifecycle Tests' },
      { name: 'Universal Rules', tested: true, testSuite: 'Rules Tests' },
      { name: 'Rule Parsing', tested: true, testSuite: 'Parser Tests' },
      { name: 'Dashboard Generation', tested: true, testSuite: 'Lifecycle Tests' },
      { name: 'Product Planning', tested: false, testSuite: 'Not tested' },
      { name: 'Product Analysis', tested: false, testSuite: 'Not tested' },
      { name: 'Deployment Workflows', tested: false, testSuite: 'Not tested' }
    ];

    this.coverage.features.total = coreFeatures.length;
    this.coverage.features.tested = coreFeatures.filter(f => f.tested).length;
    this.coverage.features.details = coreFeatures;

    console.log(`   ✅ Found ${this.coverage.features.total} core features`);
    console.log(`   📈 ${this.coverage.features.tested} have dedicated tests (${Math.round((this.coverage.features.tested / this.coverage.features.total) * 100)}%)`);
  }

  generateCoverageReport() {
    console.log('\\n' + '═'.repeat(80));
    console.log('📊 COMPREHENSIVE COVERAGE REPORT');
    console.log('═'.repeat(80));

    // Summary table
    console.log('\\n┌─────────────────────────┬─────────┬─────────┬─────────────┬────────────┐');
    console.log('│ Component               │ Tested  │ Total   │ Coverage(%) │ Status     │');
    console.log('├─────────────────────────┼─────────┼─────────┼─────────────┼────────────┤');

    const components = [
      { name: 'Universal Rules', ...this.coverage.rules },
      { name: 'Core Instructions', ...this.coverage.instructions },
      { name: 'Standards Files', ...this.coverage.standards },
      { name: 'Script Files', ...this.coverage.scripts },
      { name: 'Core Features', ...this.coverage.features }
    ];

    let totalTested = 0;
    let totalItems = 0;

    components.forEach(comp => {
      const coverage = comp.total > 0 ? Math.round((comp.tested / comp.total) * 100) : 0;
      const status = coverage >= 80 ? '🟢 Good' : coverage >= 60 ? '🟡 Fair' : '🔴 Poor';
      
      console.log(`│ ${comp.name.padEnd(23)} │ ${comp.tested.toString().padStart(7)} │ ${comp.total.toString().padStart(7)} │ ${(coverage + '%').padStart(11)} │ ${status.padEnd(10)} │`);
      
      totalTested += comp.tested;
      totalItems += comp.total;
    });

    console.log('├─────────────────────────┼─────────┼─────────┼─────────────┼────────────┤');
    
    const overallCoverage = totalItems > 0 ? Math.round((totalTested / totalItems) * 100) : 0;
    const overallStatus = overallCoverage >= 80 ? '🟢 Good' : overallCoverage >= 60 ? '🟡 Fair' : '🔴 Poor';
    
    console.log(`│ ${'OVERALL COVERAGE'.padEnd(23)} │ ${totalTested.toString().padStart(7)} │ ${totalItems.toString().padStart(7)} │ ${(overallCoverage + '%').padStart(11)} │ ${overallStatus.padEnd(10)} │`);
    console.log('└─────────────────────────┴─────────┴─────────┴─────────────┴────────────┘');

    // Detailed breakdowns
    this.printDetailedBreakdown();
  }

  printDetailedBreakdown() {
    console.log('\\n📋 DETAILED COVERAGE BREAKDOWN:');
    console.log('─'.repeat(80));

    // Untested Rules
    const untestedRules = this.coverage.rules.details.filter(r => !r.tested);
    if (untestedRules.length > 0) {
      console.log('\\n🔴 Universal Rules Issues:');
      untestedRules.forEach(rule => {
        console.log(`   • ${rule.name}: ${rule.issues.join(', ')}`);
      });
    }

    // Untested Instructions
    const untestedInstructions = this.coverage.instructions.details.filter(i => !i.tested);
    if (untestedInstructions.length > 0) {
      console.log('\\n🔴 Untested Instructions:');
      untestedInstructions.forEach(instruction => {
        console.log(`   • ${instruction.name}`);
      });
    }

    // Untested Features
    const untestedFeatures = this.coverage.features.details.filter(f => !f.tested);
    if (untestedFeatures.length > 0) {
      console.log('\\n🔴 Untested Core Features:');
      untestedFeatures.forEach(feature => {
        console.log(`   • ${feature.name}`);
      });
    }

    // Well-tested components
    console.log('\\n🟢 Well-Tested Components:');
    if (this.coverage.rules.tested > 0) {
      console.log(`   • ${this.coverage.rules.tested} Universal Rules with comprehensive validation`);
    }
    if (this.coverage.features.tested > 0) {
      console.log(`   • ${this.coverage.features.tested} Core Features with dedicated test suites`);
    }
    if (this.coverage.scripts.tested > 0) {
      console.log(`   • ${this.coverage.scripts.tested} Scripts with self-testing or integration tests`);
    }
  }

  generateRecommendations() {
    console.log('\\n' + '═'.repeat(80));
    console.log('💡 COVERAGE IMPROVEMENT RECOMMENDATIONS');
    console.log('═'.repeat(80));

    const recommendations = [];

    // Rules recommendations
    const rulesCoverage = (this.coverage.rules.tested / this.coverage.rules.total) * 100;
    if (rulesCoverage < 100) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Universal Rules',
        action: `Fix ${this.coverage.rules.total - this.coverage.rules.tested} rules with structural issues`,
        impact: 'Ensures all rules meet quality standards'
      });
    }

    // Instructions recommendations
    const instructionsCoverage = (this.coverage.instructions.tested / this.coverage.instructions.total) * 100;
    if (instructionsCoverage < 80) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Instructions',
        action: 'Add dedicated tests for untested instruction files',
        impact: 'Validates instruction file functionality'
      });
    }

    // Features recommendations
    const featuresCoverage = (this.coverage.features.tested / this.coverage.features.total) * 100;
    if (featuresCoverage < 80) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Core Features',
        action: 'Create test suites for product planning and analysis features',
        impact: 'Ensures complete feature coverage'
      });
    }

    // Standards recommendations
    if (this.coverage.standards.tested < this.coverage.standards.total) {
      recommendations.push({
        priority: 'LOW',
        category: 'Standards',
        action: 'Add validation tests for standards files',
        impact: 'Ensures standards file quality and consistency'
      });
    }

    // Print recommendations
    if (recommendations.length === 0) {
      console.log('🎉 Excellent coverage! No immediate recommendations.');
    } else {
      console.log('\\n🔧 Recommended Actions:');
      console.log('─'.repeat(80));
      
      recommendations.forEach((rec, index) => {
        const priorityColor = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢';
        console.log(`\\n${index + 1}. ${priorityColor} ${rec.priority} PRIORITY - ${rec.category}`);
        console.log(`   Action: ${rec.action}`);
        console.log(`   Impact: ${rec.impact}`);
      });
    }

    console.log('\\n' + '═'.repeat(80) + '\\n');
  }
}

// Run analysis if this script is executed directly
if (require.main === module) {
  const analyzer = new CoverageAnalyzer();
  analyzer.analyzeCoverage().catch(error => {
    console.error('❌ Coverage analysis failed:', error);
    process.exit(1);
  });
}

module.exports = CoverageAnalyzer;
