#!/usr/bin/env node

/**
 * Rule Parser Test Suite
 * 
 * Tests the parsing and processing of .mdc rule files
 */

const fs = require('fs');
const path = require('path');

class RuleParser {
  constructor() {
    this.rules = new Map();
    this.errors = [];
  }

  parseRule(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const rule = this.extractRuleData(content, filePath);
      return { success: true, rule };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  extractRuleData(content, filePath) {
    const rule = {
      filePath,
      fileName: path.basename(filePath),
      alwaysApply: false,
      title: '',
      sections: [],
      codeBlocks: [],
      crossReferences: []
    };

    // Extract YAML frontmatter
    const frontmatterMatch = content.match(/^---\\n([\\s\\S]*?)\\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      rule.alwaysApply = frontmatter.includes('alwaysApply: true');
    }

    // Remove frontmatter for content analysis
    const contentWithoutFrontmatter = content.replace(/^---[\\s\\S]*?---\\n/, '');

    // Extract title
    const titleMatch = contentWithoutFrontmatter.match(/^# (.+)$/m);
    if (titleMatch) {
      rule.title = titleMatch[1];
    }

    // Extract sections
    const sectionMatches = contentWithoutFrontmatter.match(/^## (.+)$/gm) || [];
    rule.sections = sectionMatches.map(match => match.replace('## ', ''));

    // Extract code blocks
    const codeBlockMatches = contentWithoutFrontmatter.match(/```[\\s\\S]*?```/g) || [];
    rule.codeBlocks = codeBlockMatches.map(block => {
      const langMatch = block.match(/```(\\w+)/);
      const code = block.replace(/```\\w*\\n?/, '').replace(/```$/, '');
      return {
        language: langMatch ? langMatch[1] : 'unknown',
        code: code.trim()
      };
    });

    // Extract cross-references
    const refMatches = contentWithoutFrontmatter.match(/\\w+\\.mdc/g) || [];
    rule.crossReferences = [...new Set(refMatches)]; // Remove duplicates

    return rule;
  }

  validateRule(rule) {
    const errors = [];

    // Required fields
    if (!rule.title) {
      errors.push('Missing title (# heading)');
    }

    if (rule.sections.length < 2) {
      errors.push('Insufficient sections (need at least 2 ## headings)');
    }

    // Content quality checks
    const content = fs.readFileSync(rule.filePath, 'utf8');
    if (content.length < 500) {
      errors.push('Content too short (less than 500 characters)');
    }

    // Code block validation
    for (const codeBlock of rule.codeBlocks) {
      if (codeBlock.language === 'typescript' || codeBlock.language === 'javascript') {
        // Basic syntax validation
        if (codeBlock.code.includes('function') && !codeBlock.code.includes('{')) {
          errors.push(`Invalid ${codeBlock.language} syntax in code block`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      rule
    };
  }

  async testRuleParser() {
    console.log('🧪 Rule Parser Test Suite');
    console.log('=========================\\n');

    const testScenarios = [
      {
        name: 'Valid Rule Example',
        file: 'tests/rules/scenarios/valid-rule-example/architecture-patterns-test.mdc',
        shouldPass: true
      },
      {
        name: 'Invalid Rule Example',
        file: 'tests/rules/scenarios/invalid-rule-example/broken-rule.mdc',
        shouldPass: false
      }
    ];

    let passed = 0;
    let failed = 0;

    for (const scenario of testScenarios) {
      console.log(`📋 Testing: ${scenario.name}`);
      
      if (!fs.existsSync(scenario.file)) {
        console.log(`  ❌ Test file not found: ${scenario.file}\\n`);
        failed++;
        continue;
      }

      const parseResult = this.parseRule(scenario.file);
      
      if (!parseResult.success) {
        if (!scenario.shouldPass) {
          console.log(`  ✅ Correctly failed to parse invalid rule`);
          console.log(`     Error: ${parseResult.error}\\n`);
          passed++;
        } else {
          console.log(`  ❌ Failed to parse valid rule`);
          console.log(`     Error: ${parseResult.error}\\n`);
          failed++;
        }
        continue;
      }

      const validationResult = this.validateRule(parseResult.rule);
      
      if (scenario.shouldPass) {
        if (validationResult.isValid) {
          console.log(`  ✅ Valid rule parsed and validated successfully`);
          console.log(`     Title: ${parseResult.rule.title}`);
          console.log(`     Sections: ${parseResult.rule.sections.length}`);
          console.log(`     Code blocks: ${parseResult.rule.codeBlocks.length}`);
          console.log(`     Always apply: ${parseResult.rule.alwaysApply}\\n`);
          passed++;
        } else {
          console.log(`  ❌ Valid rule failed validation`);
          validationResult.errors.forEach(error => {
            console.log(`     Error: ${error}`);
          });
          console.log('');
          failed++;
        }
      } else {
        if (!validationResult.isValid) {
          console.log(`  ✅ Correctly identified invalid rule`);
          validationResult.errors.forEach(error => {
            console.log(`     Error: ${error}`);
          });
          console.log('');
          passed++;
        } else {
          console.log(`  ❌ Invalid rule passed validation (should have failed)\\n`);
          failed++;
        }
      }
    }

    console.log('🏁 Rule Parser Test Results');
    console.log('===========================');
    console.log(`Total Tests: ${passed + failed}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%\\n`);

    if (failed > 0) {
      console.log('💡 Some tests failed. Review the parser logic and test scenarios.');
      process.exit(1);
    } else {
      console.log('🎉 All rule parser tests passed!');
      process.exit(0);
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const parser = new RuleParser();
  parser.testRuleParser().catch(error => {
    console.error('❌ Rule parser test suite execution failed:', error);
    process.exit(1);
  });
}

module.exports = RuleParser;
