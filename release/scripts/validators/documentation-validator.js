#!/usr/bin/env node

/**
 * Documentation Validator
 * 
 * Validates documentation completeness, quality, and adherence to standards.
 */

const fs = require('fs');
const path = require('path');

class DocumentationValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      validations: []
    };
  }

  async validateProject(projectPath = '.') {
    const validations = [];
    
    // Core documentation validations
    validations.push(await this.validateReadmeCompleteness(projectPath));
    validations.push(await this.validateAPIDocumentation(projectPath));
    validations.push(await this.validateCodeComments(projectPath));
    validations.push(await this.validateSetupInstructions(projectPath));
    validations.push(await this.validateSpecDocumentation(projectPath));
    validations.push(await this.validateDocumentationStructure(projectPath));
    
    const overallResult = this.aggregateValidations(validations);
    
    return {
      projectPath: projectPath,
      status: overallResult.status,
      validations: validations,
      summary: overallResult.summary,
      recommendations: overallResult.recommendations,
      docStats: await this.getDocumentationStatistics(projectPath)
    };
  }

  async validateReadmeCompleteness(projectPath) {
    const readmePath = path.join(projectPath, 'README.md');
    
    if (!fs.existsSync(readmePath)) {
      return this.createValidation('README Completeness', 'FAIL', 
        'README.md file not found', {
          recommendation: 'Create a comprehensive README.md file'
        });
    }

    const content = fs.readFileSync(readmePath, 'utf8');
    const requiredSections = [
      { name: 'Title/Project Name', pattern: /^#\s+.+/m },
      { name: 'Description', pattern: /description|what|overview/i },
      { name: 'Installation', pattern: /install|setup|getting started/i },
      { name: 'Usage', pattern: /usage|how to|example/i },
      { name: 'Features', pattern: /features|functionality/i }
    ];

    const optionalSections = [
      { name: 'Contributing', pattern: /contribut/i },
      { name: 'License', pattern: /license/i },
      { name: 'API Documentation', pattern: /api|endpoints/i },
      { name: 'Testing', pattern: /test|testing/i },
      { name: 'Deployment', pattern: /deploy|production/i }
    ];

    const missingSections = [];
    const presentSections = [];

    requiredSections.forEach(section => {
      if (section.pattern.test(content)) {
        presentSections.push(section.name);
      } else {
        missingSections.push(section.name);
      }
    });

    const optionalPresent = optionalSections.filter(section => 
      section.pattern.test(content)
    );

    const completenessScore = (presentSections.length / requiredSections.length) * 100;
    const status = completenessScore >= 80 ? 'PASS' : 
      completenessScore >= 60 ? 'WARNING' : 'FAIL';

    const message = `README completeness: ${completenessScore.toFixed(0)}% (${presentSections.length}/${requiredSections.length} required sections)`;

    return this.createValidation('README Completeness', status, message, {
      completenessScore: completenessScore,
      requiredSections: requiredSections.length,
      presentSections: presentSections.length,
      missingSections: missingSections,
      optionalPresent: optionalPresent.map(s => s.name),
      wordCount: content.split(/\s+/).length,
      recommendation: missingSections.length > 0
        ? `Add missing sections: ${missingSections.join(', ')}`
        : null
    });
  }

  async validateAPIDocumentation(projectPath) {
    const apiFiles = this.findAPIFiles(projectPath);
    const docFiles = this.findDocumentationFiles(projectPath);
    
    if (apiFiles.length === 0) {
      return this.createValidation('API Documentation', 'PASS', 
        'No API files found - documentation not applicable');
    }

    const apiDocIssues = [];
    
    // Check for API documentation files
    const hasApiDocs = docFiles.some(file => 
      /api|endpoint|swagger|openapi/i.test(path.basename(file))
    );

    if (!hasApiDocs) {
      apiDocIssues.push({
        type: 'Missing API Documentation',
        description: 'No dedicated API documentation found'
      });
    }

    // Check individual API files for documentation
    apiFiles.forEach(apiFile => {
      const content = fs.readFileSync(apiFile, 'utf8');
      const relativePath = path.relative(projectPath, apiFile);
      
      // Check for route documentation
      const routes = this.extractRoutes(content);
      const undocumentedRoutes = routes.filter(route => 
        !this.hasRouteDocumentation(route, content)
      );

      if (undocumentedRoutes.length > 0) {
        apiDocIssues.push({
          type: 'Undocumented Routes',
          file: relativePath,
          routes: undocumentedRoutes.slice(0, 3),
          count: undocumentedRoutes.length
        });
      }
    });

    const status = apiDocIssues.length === 0 ? 'PASS' : 'WARNING';
    const message = apiDocIssues.length === 0
      ? `All ${apiFiles.length} API files properly documented`
      : `${apiDocIssues.length} API documentation issues found`;

    return this.createValidation('API Documentation', status, message, {
      totalApiFiles: apiFiles.length,
      hasApiDocs: hasApiDocs,
      issueCount: apiDocIssues.length,
      issues: apiDocIssues,
      recommendation: apiDocIssues.length > 0
        ? 'Add API documentation and document all routes with parameters and responses'
        : null
    });
  }

  async validateCodeComments(projectPath) {
    const codeFiles = this.getCodeFiles(projectPath);
    const commentAnalysis = {
      totalFiles: codeFiles.length,
      wellCommentedFiles: 0,
      poorlyCommentedFiles: 0,
      issues: []
    };

    codeFiles.forEach(codeFile => {
      const content = fs.readFileSync(codeFile, 'utf8');
      const relativePath = path.relative(projectPath, codeFile);
      const analysis = this.analyzeCodeComments(content, relativePath);
      
      if (analysis.commentRatio >= 10 && analysis.hasGoodComments) {
        commentAnalysis.wellCommentedFiles++;
      } else {
        commentAnalysis.poorlyCommentedFiles++;
        commentAnalysis.issues.push(analysis);
      }
    });

    const commentScore = codeFiles.length > 0 
      ? (commentAnalysis.wellCommentedFiles / codeFiles.length) * 100 
      : 100;

    const status = commentScore >= 70 ? 'PASS' : 
      commentScore >= 50 ? 'WARNING' : 'FAIL';

    const message = `Code comment quality: ${commentScore.toFixed(0)}% (${commentAnalysis.wellCommentedFiles}/${codeFiles.length} files well-commented)`;

    return this.createValidation('Code Comments', status, message, {
      ...commentAnalysis,
      commentScore: commentScore,
      recommendation: commentAnalysis.poorlyCommentedFiles > 0
        ? 'Add meaningful comments to complex functions and unclear code sections'
        : null
    });
  }

  async validateSetupInstructions(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const readmePath = path.join(projectPath, 'README.md');
    
    const setupIssues = [];
    
    // Check if setup instructions exist
    if (!fs.existsSync(readmePath)) {
      setupIssues.push({
        type: 'Missing README',
        description: 'No README.md with setup instructions'
      });
    } else {
      const readmeContent = fs.readFileSync(readmePath, 'utf8');
      
      // Check for installation instructions
      const hasInstallInstructions = /install|npm|yarn|setup|getting started/i.test(readmeContent);
      if (!hasInstallInstructions) {
        setupIssues.push({
          type: 'Missing Installation Instructions',
          description: 'README does not contain installation/setup instructions'
        });
      }

      // Check for usage examples
      const hasUsageExamples = /usage|example|how to|run|start/i.test(readmeContent);
      if (!hasUsageExamples) {
        setupIssues.push({
          type: 'Missing Usage Examples',
          description: 'README does not contain usage examples'
        });
      }
    }

    // Check package.json scripts
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (!packageJson.scripts) {
        setupIssues.push({
          type: 'Missing Scripts',
          description: 'No npm scripts defined in package.json'
        });
      } else {
        const importantScripts = ['start', 'dev', 'build', 'test'];
        const missingScripts = importantScripts.filter(script => 
          !packageJson.scripts[script]
        );
        
        if (missingScripts.length > 0) {
          setupIssues.push({
            type: 'Missing Important Scripts',
            scripts: missingScripts,
            description: 'Important npm scripts are missing'
          });
        }
      }
    }

    const status = setupIssues.length === 0 ? 'PASS' : 'WARNING';
    const message = setupIssues.length === 0
      ? 'Setup instructions are complete and clear'
      : `${setupIssues.length} setup instruction issues found`;

    return this.createValidation('Setup Instructions', status, message, {
      issueCount: setupIssues.length,
      issues: setupIssues,
      recommendation: setupIssues.length > 0
        ? 'Add comprehensive setup instructions with installation and usage examples'
        : null
    });
  }

  async validateSpecDocumentation(projectPath) {
    const specsDir = path.join(projectPath, '.agent-os', 'specs');
    
    if (!fs.existsSync(specsDir)) {
      return this.createValidation('Spec Documentation', 'PASS', 
        'No specs directory - spec documentation not applicable');
    }

    const specs = fs.readdirSync(specsDir)
      .filter(item => fs.statSync(path.join(specsDir, item)).isDirectory());

    const specDocIssues = [];
    
    specs.forEach(spec => {
      const specDir = path.join(specsDir, spec);
      const requiredFiles = ['spec.md', 'tasks.md'];
      const optionalFiles = ['status.md', 'sub-specs'];
      
      const missingFiles = requiredFiles.filter(file => 
        !fs.existsSync(path.join(specDir, file))
      );

      if (missingFiles.length > 0) {
        specDocIssues.push({
          spec: spec,
          type: 'Missing Required Files',
          files: missingFiles
        });
      }

      // Check spec.md completeness
      const specFile = path.join(specDir, 'spec.md');
      if (fs.existsSync(specFile)) {
        const specContent = fs.readFileSync(specFile, 'utf8');
        const requiredSections = ['Overview', 'User Stories', 'Spec Scope'];
        const missingSections = requiredSections.filter(section => 
          !new RegExp(`## ${section}`, 'i').test(specContent)
        );

        if (missingSections.length > 0) {
          specDocIssues.push({
            spec: spec,
            type: 'Incomplete Spec Structure',
            sections: missingSections
          });
        }
      }
    });

    const status = specDocIssues.length === 0 ? 'PASS' : 'WARNING';
    const message = specDocIssues.length === 0
      ? `All ${specs.length} specs properly documented`
      : `${specDocIssues.length} spec documentation issues found`;

    return this.createValidation('Spec Documentation', status, message, {
      totalSpecs: specs.length,
      issueCount: specDocIssues.length,
      issues: specDocIssues,
      recommendation: specDocIssues.length > 0
        ? 'Complete missing spec files and required sections'
        : null
    });
  }

  async validateDocumentationStructure(projectPath) {
    const docFiles = this.findDocumentationFiles(projectPath);
    const structureIssues = [];
    
    // Check for docs directory
    const docsDir = path.join(projectPath, 'docs');
    const hasDocsDir = fs.existsSync(docsDir);
    
    if (docFiles.length > 3 && !hasDocsDir) {
      structureIssues.push({
        type: 'Missing Docs Directory',
        description: 'Multiple documentation files but no organized docs/ directory'
      });
    }

    // Check documentation file organization
    const rootDocFiles = docFiles.filter(file => 
      path.dirname(file) === projectPath
    ).length;

    if (rootDocFiles > 5) {
      structureIssues.push({
        type: 'Too Many Root Documentation Files',
        count: rootDocFiles,
        description: 'Too many documentation files in project root'
      });
    }

    // Check for orphaned documentation
    const orphanedDocs = docFiles.filter(file => {
      const content = fs.readFileSync(file, 'utf8');
      return content.length < 100; // Very short files might be orphaned
    });

    if (orphanedDocs.length > 0) {
      structureIssues.push({
        type: 'Potential Orphaned Documentation',
        files: orphanedDocs.slice(0, 3),
        count: orphanedDocs.length,
        description: 'Very short documentation files that might be incomplete'
      });
    }

    const status = structureIssues.length === 0 ? 'PASS' : 'WARNING';
    const message = structureIssues.length === 0
      ? 'Documentation structure is well-organized'
      : `${structureIssues.length} documentation structure issues`;

    return this.createValidation('Documentation Structure', status, message, {
      totalDocFiles: docFiles.length,
      hasDocsDir: hasDocsDir,
      rootDocFiles: rootDocFiles,
      issueCount: structureIssues.length,
      issues: structureIssues,
      recommendation: structureIssues.length > 0
        ? 'Organize documentation files into a docs/ directory structure'
        : null
    });
  }

  // Utility methods
  findAPIFiles(projectPath) {
    return this.getAllFiles(projectPath)
      .filter(file => {
        const content = fs.readFileSync(file, 'utf8');
        const fileName = path.basename(file).toLowerCase();
        
        return (
          fileName.includes('api') ||
          fileName.includes('router') ||
          fileName.includes('controller') ||
          /app\.(get|post|put|delete)/.test(content) ||
          /router\.(get|post|put|delete)/.test(content) ||
          /express/.test(content)
        );
      });
  }

  findDocumentationFiles(projectPath) {
    return this.getAllFiles(projectPath)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.md', '.txt', '.rst', '.adoc'].includes(ext);
      });
  }

  getCodeFiles(projectPath) {
    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.rb'];
    return this.getAllFiles(projectPath)
      .filter(file => {
        const ext = path.extname(file);
        return codeExtensions.includes(ext) && !this.isTestFile(file);
      });
  }

  getAllFiles(dirPath, files = []) {
    if (!fs.existsSync(dirPath)) return files;
    
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !this.shouldSkipDirectory(item)) {
        this.getAllFiles(fullPath, files);
      } else if (stat.isFile()) {
        files.push(fullPath);
      }
    });

    return files;
  }

  shouldSkipDirectory(dirName) {
    const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
    return skipDirs.includes(dirName);
  }

  isTestFile(filePath) {
    const fileName = path.basename(filePath).toLowerCase();
    return fileName.includes('.test.') || fileName.includes('.spec.') || 
           fileName.startsWith('test-') || fileName.includes('_test.');
  }

  extractRoutes(content) {
    const routes = [];
    const routePattern = /(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
    let match;
    
    while ((match = routePattern.exec(content)) !== null) {
      routes.push({
        method: match[1].toUpperCase(),
        path: match[2]
      });
    }
    
    return routes;
  }

  hasRouteDocumentation(route, content) {
    // Look for comments above the route definition
    const routePattern = new RegExp(`${route.method.toLowerCase()}.*['"\`]${route.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`, 'i');
    const routeIndex = content.search(routePattern);
    
    if (routeIndex === -1) return false;
    
    // Check for comments in the 200 characters before the route
    const beforeRoute = content.substring(Math.max(0, routeIndex - 200), routeIndex);
    const hasComment = /\/\*[\s\S]*?\*\/|\/\/.*$/m.test(beforeRoute);
    
    return hasComment;
  }

  analyzeCodeComments(content, filePath) {
    const lines = content.split('\n');
    const codeLines = lines.filter(line => line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('/*'));
    const commentLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
    });

    const commentRatio = codeLines.length > 0 ? (commentLines.length / codeLines.length) * 100 : 0;
    
    // Check for function documentation
    const functions = content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:\([^)]*\)|[^=])\s*=>)/g) || [];
    const documentedFunctions = functions.filter(func => {
      const funcIndex = content.indexOf(func);
      const beforeFunc = content.substring(Math.max(0, funcIndex - 200), funcIndex);
      return /\/\*\*[\s\S]*?\*\//.test(beforeFunc) || /\/\/.*/.test(beforeFunc);
    });

    const hasGoodComments = functions.length === 0 || (documentedFunctions.length / functions.length) >= 0.5;

    return {
      file: filePath,
      commentRatio: commentRatio,
      totalFunctions: functions.length,
      documentedFunctions: documentedFunctions.length,
      hasGoodComments: hasGoodComments,
      issues: []
    };
  }

  async getDocumentationStatistics(projectPath) {
    const docFiles = this.findDocumentationFiles(projectPath);
    let totalWords = 0;
    
    docFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      totalWords += content.split(/\s+/).length;
    });

    return {
      documentationFiles: docFiles.length,
      totalWords: totalWords,
      averageWordsPerFile: docFiles.length > 0 ? Math.round(totalWords / docFiles.length) : 0
    };
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
    console.log('\n📚 Documentation Validation Results');
    console.log('===================================\n');

    const statusIcon = result.status === 'PASS' ? '✅' : 
      result.status === 'WARNING' ? '⚠️' : '❌';
    
    console.log(`${statusIcon} Overall Documentation Status: ${result.status}\n`);
    console.log(`📁 Project: ${path.basename(result.projectPath)}`);
    console.log(`📄 Documentation Files: ${result.docStats.documentationFiles}`);
    console.log(`📝 Total Words: ${result.docStats.totalWords.toLocaleString()}`);
    console.log(`📊 Avg Words/File: ${result.docStats.averageWordsPerFile}\n`);

    result.validations.forEach(validation => {
      const icon = validation.status === 'PASS' ? '  ✓' : 
        validation.status === 'WARNING' ? '  ⚠' : '  ✗';
      console.log(`${icon} ${validation.name}: ${validation.message}`);
      
      if (validation.details.missingSections && validation.details.missingSections.length > 0) {
        console.log('    Missing sections:');
        validation.details.missingSections.forEach(section => {
          console.log(`      - ${section}`);
        });
      }
    });

    if (result.recommendations.length > 0) {
      console.log('\n💡 Documentation Recommendations:');
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
  const validator = new DocumentationValidator();
  const projectPath = process.argv[2] || '.';

  (async () => {
    try {
      const result = await validator.validateProject(projectPath);
      validator.displayResults(result);
      
      const hasFailures = result.status === 'FAIL';
      process.exit(hasFailures ? 1 : 0);
      
    } catch (error) {
      console.error('❌ Documentation validation failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = DocumentationValidator;
