#!/usr/bin/env node

/**
 * Implementation-Spec Adherence Validator
 * 
 * Validates that implementation matches specification requirements exactly,
 * prevents scope creep, and ensures all user stories are satisfied.
 */

const fs = require('fs');
const path = require('path');

class SpecAdherenceValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      validations: []
    };
  }

  async validateSpecAdherence(specPath, implementationPath) {
    if (!fs.existsSync(specPath)) {
      throw new Error(`Spec directory not found: ${specPath}`);
    }

    if (!fs.existsSync(implementationPath)) {
      throw new Error(`Implementation directory not found: ${implementationPath}`);
    }

    const validations = [];

    // Parse spec requirements
    const specData = await this.parseSpecification(specPath);
    
    // Analyze implementation
    const implementationData = await this.analyzeImplementation(implementationPath);

    // Validate spec requirements are met
    validations.push(await this.validateSpecRequirements(specData, implementationData));
    
    // Validate user stories are satisfied
    validations.push(await this.validateUserStories(specData, implementationData));
    
    // Check for scope creep
    validations.push(await this.validateScopeCompliance(specData, implementationData));
    
    // Validate expected deliverables
    validations.push(await this.validateExpectedDeliverables(specData, implementationData));
    
    // Check technical requirements
    validations.push(await this.validateTechnicalRequirements(specData, implementationData));

    const overallResult = this.aggregateValidations(validations);
    
    return {
      specPath: specPath,
      implementationPath: implementationPath,
      status: overallResult.status,
      validations: validations,
      summary: overallResult.summary,
      recommendations: overallResult.recommendations,
      specData: specData,
      implementationData: implementationData
    };
  }

  async parseSpecification(specPath) {
    const specFile = path.join(specPath, 'spec.md');
    const tasksFile = path.join(specPath, 'tasks.md');
    const techSpecFile = path.join(specPath, 'sub-specs', 'technical-spec.md');
    
    if (!fs.existsSync(specFile)) {
      throw new Error('spec.md not found in spec directory');
    }

    const specContent = fs.readFileSync(specFile, 'utf8');
    const tasksContent = fs.existsSync(tasksFile) ? fs.readFileSync(tasksFile, 'utf8') : '';
    const techSpecContent = fs.existsSync(techSpecFile) ? fs.readFileSync(techSpecFile, 'utf8') : '';

    return {
      overview: this.extractSection(specContent, 'Overview'),
      userStories: this.extractUserStories(specContent),
      specScope: this.extractSpecScope(specContent),
      outOfScope: this.extractSection(specContent, 'Out of Scope'),
      expectedDeliverables: this.extractExpectedDeliverables(specContent),
      tasks: this.extractTasks(tasksContent),
      technicalRequirements: this.extractTechnicalRequirements(techSpecContent),
      specName: this.extractSpecName(specPath)
    };
  }

  async analyzeImplementation(implementationPath) {
    const implementation = {
      files: [],
      components: [],
      functions: [],
      classes: [],
      tests: [],
      apis: [],
      features: [],
      routes: []
    };

    const files = this.getAllFiles(implementationPath);
    
    for (const file of files) {
      if (this.shouldAnalyzeFile(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(implementationPath, file);
        
        implementation.files.push({
          path: relativePath,
          fullPath: file,
          content: content,
          type: this.getFileType(file)
        });

        // Extract code elements
        if (this.isCodeFile(file)) {
          implementation.components.push(...this.extractComponents(content, relativePath));
          implementation.functions.push(...this.extractFunctions(content, relativePath));
          implementation.classes.push(...this.extractClasses(content, relativePath));
          implementation.routes.push(...this.extractRoutes(content, relativePath));
        }

        // Extract tests
        if (this.isTestFile(file)) {
          implementation.tests.push(...this.extractTests(content, relativePath));
        }

        // Extract API definitions
        if (this.isApiFile(file)) {
          implementation.apis.push(...this.extractAPIs(content, relativePath));
        }
      }
    }

    return implementation;
  }

  async validateSpecRequirements(specData, implementationData) {
    const requirements = this.parseSpecScope(specData.specScope);
    const missingRequirements = [];
    const implementedRequirements = [];

    for (const requirement of requirements) {
      const isImplemented = this.checkRequirementImplementation(requirement, implementationData);
      
      if (isImplemented.implemented) {
        implementedRequirements.push({
          requirement: requirement,
          evidence: isImplemented.evidence
        });
      } else {
        missingRequirements.push({
          requirement: requirement,
          reason: isImplemented.reason
        });
      }
    }

    const status = missingRequirements.length === 0 ? 'PASS' : 'FAIL';
    const message = missingRequirements.length === 0 
      ? `All ${requirements.length} spec requirements implemented`
      : `${missingRequirements.length} of ${requirements.length} requirements missing`;

    return this.createValidation('Spec Requirements', status, message, {
      totalRequirements: requirements.length,
      implementedCount: implementedRequirements.length,
      missingCount: missingRequirements.length,
      implemented: implementedRequirements,
      missing: missingRequirements,
      recommendation: missingRequirements.length > 0 
        ? 'Implement missing requirements as specified in spec scope'
        : null
    });
  }

  async validateUserStories(specData, implementationData) {
    const userStories = specData.userStories;
    const satisfiedStories = [];
    const unsatisfiedStories = [];

    for (const story of userStories) {
      const isSatisfied = this.checkUserStorySatisfaction(story, implementationData);
      
      if (isSatisfied.satisfied) {
        satisfiedStories.push({
          story: story,
          evidence: isSatisfied.evidence
        });
      } else {
        unsatisfiedStories.push({
          story: story,
          reason: isSatisfied.reason
        });
      }
    }

    const status = unsatisfiedStories.length === 0 ? 'PASS' : 'FAIL';
    const message = unsatisfiedStories.length === 0
      ? `All ${userStories.length} user stories satisfied`
      : `${unsatisfiedStories.length} of ${userStories.length} user stories not satisfied`;

    return this.createValidation('User Stories', status, message, {
      totalStories: userStories.length,
      satisfiedCount: satisfiedStories.length,
      unsatisfiedCount: unsatisfiedStories.length,
      satisfied: satisfiedStories,
      unsatisfied: unsatisfiedStories,
      recommendation: unsatisfiedStories.length > 0
        ? 'Implement missing functionality to satisfy all user stories'
        : null
    });
  }

  async validateScopeCompliance(specData, implementationData) {
    const scopeViolations = [];
    const outOfScopeItems = this.parseOutOfScope(specData.outOfScope);
    
    // Check for unauthorized features
    const unauthorizedFeatures = this.detectUnauthorizedFeatures(
      specData.specScope, 
      outOfScopeItems, 
      implementationData
    );

    scopeViolations.push(...unauthorizedFeatures);

    // Check for unspecified modifications
    const unspecifiedChanges = this.detectUnspecifiedChanges(specData, implementationData);
    scopeViolations.push(...unspecifiedChanges);

    const status = scopeViolations.length === 0 ? 'PASS' : 'WARNING';
    const message = scopeViolations.length === 0
      ? 'No scope creep detected - implementation stays within spec boundaries'
      : `Found ${scopeViolations.length} potential scope violations`;

    return this.createValidation('Scope Compliance', status, message, {
      violationCount: scopeViolations.length,
      violations: scopeViolations,
      recommendation: scopeViolations.length > 0
        ? 'Review implementation for unauthorized features or changes not in spec'
        : null
    });
  }

  async validateExpectedDeliverables(specData, implementationData) {
    const deliverables = this.parseExpectedDeliverables(specData.expectedDeliverables);
    const missingDeliverables = [];
    const presentDeliverables = [];

    for (const deliverable of deliverables) {
      const isPresent = this.checkDeliverablePresence(deliverable, implementationData);
      
      if (isPresent.present) {
        presentDeliverables.push({
          deliverable: deliverable,
          evidence: isPresent.evidence
        });
      } else {
        missingDeliverables.push({
          deliverable: deliverable,
          reason: isPresent.reason
        });
      }
    }

    const status = missingDeliverables.length === 0 ? 'PASS' : 'FAIL';
    const message = missingDeliverables.length === 0
      ? `All ${deliverables.length} expected deliverables present`
      : `${missingDeliverables.length} of ${deliverables.length} deliverables missing`;

    return this.createValidation('Expected Deliverables', status, message, {
      totalDeliverables: deliverables.length,
      presentCount: presentDeliverables.length,
      missingCount: missingDeliverables.length,
      present: presentDeliverables,
      missing: missingDeliverables,
      recommendation: missingDeliverables.length > 0
        ? 'Create missing deliverables as specified in the spec'
        : null
    });
  }

  async validateTechnicalRequirements(specData, implementationData) {
    if (!specData.technicalRequirements || specData.technicalRequirements.length === 0) {
      return this.createValidation('Technical Requirements', 'PASS', 
        'No technical requirements specified');
    }

    const techReqs = specData.technicalRequirements;
    const missingTechReqs = [];
    const implementedTechReqs = [];

    for (const techReq of techReqs) {
      const isImplemented = this.checkTechnicalRequirement(techReq, implementationData);
      
      if (isImplemented.implemented) {
        implementedTechReqs.push({
          requirement: techReq,
          evidence: isImplemented.evidence
        });
      } else {
        missingTechReqs.push({
          requirement: techReq,
          reason: isImplemented.reason
        });
      }
    }

    const status = missingTechReqs.length === 0 ? 'PASS' : 'FAIL';
    const message = missingTechReqs.length === 0
      ? `All ${techReqs.length} technical requirements met`
      : `${missingTechReqs.length} of ${techReqs.length} technical requirements missing`;

    return this.createValidation('Technical Requirements', status, message, {
      totalRequirements: techReqs.length,
      implementedCount: implementedTechReqs.length,
      missingCount: missingTechReqs.length,
      implemented: implementedTechReqs,
      missing: missingTechReqs,
      recommendation: missingTechReqs.length > 0
        ? 'Implement missing technical requirements from technical spec'
        : null
    });
  }

  // Parsing helper methods
  extractSection(content, sectionName) {
    const regex = new RegExp(`## ${sectionName}\\s*\\n([\\s\\S]*?)(?=\\n## |\\n# |$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  }

  extractUserStories(content) {
    const userStoriesSection = this.extractSection(content, 'User Stories');
    const stories = [];
    
    // Extract individual user stories (### Story Title format)
    const storyMatches = userStoriesSection.match(/### (.+?)\n([\s\S]*?)(?=\n### |\n## |$)/g);
    
    if (storyMatches) {
      storyMatches.forEach(storyMatch => {
        const titleMatch = storyMatch.match(/### (.+)/);
        const title = titleMatch ? titleMatch[1].trim() : 'Untitled Story';
        const content = storyMatch.replace(/### .+\n/, '').trim();
        
        stories.push({
          title: title,
          content: content,
          acceptanceCriteria: this.extractAcceptanceCriteria(content)
        });
      });
    }

    return stories;
  }

  extractAcceptanceCriteria(storyContent) {
    const criteria = [];
    const lines = storyContent.split('\n');
    
    lines.forEach(line => {
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        criteria.push(line.trim().substring(2));
      }
    });

    return criteria;
  }

  extractSpecScope(content) {
    return this.extractSection(content, 'Spec Scope');
  }

  extractExpectedDeliverables(content) {
    return this.extractSection(content, 'Expected Deliverable');
  }

  extractTasks(tasksContent) {
    const tasks = [];
    const taskMatches = tasksContent.match(/- \[ \] \d+\.\d+.+/g);
    
    if (taskMatches) {
      taskMatches.forEach(taskMatch => {
        tasks.push(taskMatch.replace('- [ ] ', '').trim());
      });
    }

    return tasks;
  }

  extractTechnicalRequirements(techSpecContent) {
    if (!techSpecContent) return [];
    
    const techReqSection = this.extractSection(techSpecContent, 'Technical Requirements');
    const requirements = [];
    
    const reqMatches = techReqSection.match(/- .+/g);
    if (reqMatches) {
      reqMatches.forEach(req => {
        requirements.push(req.replace('- ', '').trim());
      });
    }

    return requirements;
  }

  extractSpecName(specPath) {
    const dirName = path.basename(specPath);
    return dirName.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  }

  parseSpecScope(scopeContent) {
    const requirements = [];
    const numberedItems = scopeContent.match(/\d+\..+/g);
    
    if (numberedItems) {
      numberedItems.forEach(item => {
        requirements.push(item.replace(/^\d+\.\s*/, '').trim());
      });
    }

    return requirements;
  }

  parseOutOfScope(outOfScopeContent) {
    const items = [];
    const lines = outOfScopeContent.split('\n');
    
    lines.forEach(line => {
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        items.push(line.trim().substring(2));
      }
    });

    return items;
  }

  parseExpectedDeliverables(deliverablesContent) {
    const deliverables = [];
    const numberedItems = deliverablesContent.match(/\d+\..+/g);
    
    if (numberedItems) {
      numberedItems.forEach(item => {
        deliverables.push(item.replace(/^\d+\.\s*/, '').trim());
      });
    }

    return deliverables;
  }

  // Implementation analysis methods
  checkRequirementImplementation(requirement, implementationData) {
    const evidence = [];
    let implemented = false;

    // Check for keyword matches in implementation
    const keywords = this.extractKeywords(requirement);
    
    for (const file of implementationData.files) {
      if (this.isCodeFile(file.fullPath)) {
        const matches = this.findKeywordMatches(keywords, file.content);
        if (matches.length > 0) {
          evidence.push({
            file: file.path,
            matches: matches
          });
          implemented = true;
        }
      }
    }

    // Check for related functions/components
    const relatedElements = this.findRelatedElements(requirement, implementationData);
    if (relatedElements.length > 0) {
      evidence.push(...relatedElements);
      implemented = true;
    }

    return {
      implemented: implemented,
      evidence: evidence,
      reason: implemented ? null : `No implementation found for: ${requirement}`
    };
  }

  checkUserStorySatisfaction(story, implementationData) {
    const evidence = [];
    let satisfied = false;

    // Check acceptance criteria
    const criteriaResults = story.acceptanceCriteria.map(criteria => {
      return this.checkAcceptanceCriteria(criteria, implementationData);
    });

    const satisfiedCriteria = criteriaResults.filter(result => result.satisfied);
    
    if (satisfiedCriteria.length === story.acceptanceCriteria.length) {
      satisfied = true;
      evidence.push(...satisfiedCriteria.map(result => result.evidence).flat());
    }

    return {
      satisfied: satisfied,
      evidence: evidence,
      reason: satisfied ? null : `User story "${story.title}" not fully satisfied`
    };
  }

  checkAcceptanceCriteria(criteria, implementationData) {
    // Simple keyword-based matching for acceptance criteria
    const keywords = this.extractKeywords(criteria);
    const evidence = [];
    let satisfied = false;

    for (const file of implementationData.files) {
      const matches = this.findKeywordMatches(keywords, file.content);
      if (matches.length > 0) {
        evidence.push({
          file: file.path,
          criteria: criteria,
          matches: matches
        });
        satisfied = true;
      }
    }

    return {
      satisfied: satisfied,
      evidence: evidence
    };
  }

  detectUnauthorizedFeatures(specScope, outOfScopeItems, implementationData) {
    const violations = [];
    
    // Look for features that might be out of scope
    for (const outOfScopeItem of outOfScopeItems) {
      const keywords = this.extractKeywords(outOfScopeItem);
      
      for (const file of implementationData.files) {
        const matches = this.findKeywordMatches(keywords, file.content);
        if (matches.length > 0) {
          violations.push({
            type: 'Out of scope feature detected',
            item: outOfScopeItem,
            file: file.path,
            evidence: matches
          });
        }
      }
    }

    return violations;
  }

  detectUnspecifiedChanges(specData, implementationData) {
    // This is a simplified implementation
    // In practice, this would compare against a baseline or previous implementation
    return [];
  }

  checkDeliverablePresence(deliverable, implementationData) {
    const evidence = [];
    let present = false;

    // Check for deliverable-related files or functionality
    const keywords = this.extractKeywords(deliverable);
    
    for (const file of implementationData.files) {
      const matches = this.findKeywordMatches(keywords, file.content);
      if (matches.length > 0) {
        evidence.push({
          file: file.path,
          matches: matches
        });
        present = true;
      }
    }

    // Check for specific deliverable patterns
    if (deliverable.toLowerCase().includes('test')) {
      present = implementationData.tests.length > 0;
      if (present) {
        evidence.push({
          type: 'tests',
          count: implementationData.tests.length
        });
      }
    }

    return {
      present: present,
      evidence: evidence,
      reason: present ? null : `Deliverable not found: ${deliverable}`
    };
  }

  checkTechnicalRequirement(techReq, implementationData) {
    const evidence = [];
    let implemented = false;

    const keywords = this.extractKeywords(techReq);
    
    for (const file of implementationData.files) {
      const matches = this.findKeywordMatches(keywords, file.content);
      if (matches.length > 0) {
        evidence.push({
          file: file.path,
          matches: matches
        });
        implemented = true;
      }
    }

    return {
      implemented: implemented,
      evidence: evidence,
      reason: implemented ? null : `Technical requirement not met: ${techReq}`
    };
  }

  // Utility methods
  extractKeywords(text) {
    // Extract meaningful keywords from text
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word));
    
    return [...new Set(words)]; // Remove duplicates
  }

  findKeywordMatches(keywords, content) {
    const matches = [];
    const contentLower = content.toLowerCase();
    
    keywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        matches.push(keyword);
      }
    });

    return matches;
  }

  findRelatedElements(requirement, implementationData) {
    const elements = [];
    const keywords = this.extractKeywords(requirement);
    
    // Check functions
    implementationData.functions.forEach(func => {
      const nameMatches = this.findKeywordMatches(keywords, func.name.toLowerCase());
      if (nameMatches.length > 0) {
        elements.push({
          type: 'function',
          name: func.name,
          file: func.file,
          matches: nameMatches
        });
      }
    });

    // Check components
    implementationData.components.forEach(comp => {
      const nameMatches = this.findKeywordMatches(keywords, comp.name.toLowerCase());
      if (nameMatches.length > 0) {
        elements.push({
          type: 'component',
          name: comp.name,
          file: comp.file,
          matches: nameMatches
        });
      }
    });

    return elements;
  }

  // File analysis methods (simplified versions from code-quality-validator)
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

  shouldAnalyzeFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.rb', '.py', '.php', '.java', '.cs'];
    const testExtensions = ['.test.ts', '.test.js', '.spec.ts', '.spec.js'];
    const apiExtensions = ['.json', '.yaml', '.yml'];
    
    return [...codeExtensions, ...testExtensions, ...apiExtensions].includes(ext);
  }

  getFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath).toLowerCase();
    
    if (this.isTestFile(filePath)) return 'test';
    if (this.isApiFile(filePath)) return 'api';
    if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) return 'code';
    
    return 'other';
  }

  isCodeFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return ['.ts', '.tsx', '.js', '.jsx', '.rb', '.py', '.php', '.java', '.cs'].includes(ext) && !this.isTestFile(filePath);
  }

  isTestFile(filePath) {
    const fileName = path.basename(filePath).toLowerCase();
    return fileName.includes('.test.') || fileName.includes('.spec.') || 
           fileName.startsWith('test-') || fileName.includes('_test.');
  }

  isApiFile(filePath) {
    const fileName = path.basename(filePath).toLowerCase();
    return fileName.includes('api') || fileName.includes('swagger') || fileName.includes('openapi');
  }

  extractComponents(content, filePath) {
    const components = [];
    
    // React components
    const reactComponentMatches = content.match(/(?:export\s+(?:default\s+)?(?:const|function)\s+|const\s+)(\w+)\s*=\s*\(/g);
    if (reactComponentMatches) {
      reactComponentMatches.forEach(match => {
        const nameMatch = match.match(/(\w+)\s*=/);
        if (nameMatch) {
          components.push({
            name: nameMatch[1],
            file: filePath,
            type: 'react-component'
          });
        }
      });
    }

    return components;
  }

  extractFunctions(content, filePath) {
    const functions = [];
    
    // Function declarations
    const functionMatches = content.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/g);
    if (functionMatches) {
      functionMatches.forEach(match => {
        const nameMatch = match.match(/function\s+(\w+)/);
        if (nameMatch) {
          functions.push({
            name: nameMatch[1],
            file: filePath,
            type: 'function'
          });
        }
      });
    }

    // Arrow functions
    const arrowFunctionMatches = content.match(/(?:export\s+)?const\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=])\s*=>/g);
    if (arrowFunctionMatches) {
      arrowFunctionMatches.forEach(match => {
        const nameMatch = match.match(/const\s+(\w+)/);
        if (nameMatch) {
          functions.push({
            name: nameMatch[1],
            file: filePath,
            type: 'arrow-function'
          });
        }
      });
    }

    return functions;
  }

  extractClasses(content, filePath) {
    const classes = [];
    
    const classMatches = content.match(/(?:export\s+)?class\s+(\w+)/g);
    if (classMatches) {
      classMatches.forEach(match => {
        const nameMatch = match.match(/class\s+(\w+)/);
        if (nameMatch) {
          classes.push({
            name: nameMatch[1],
            file: filePath,
            type: 'class'
          });
        }
      });
    }

    return classes;
  }

  extractRoutes(content, filePath) {
    const routes = [];
    
    // Express.js routes
    const routeMatches = content.match(/(?:router|app)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g);
    if (routeMatches) {
      routeMatches.forEach(match => {
        const routeMatch = match.match(/\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
        if (routeMatch) {
          routes.push({
            method: routeMatch[1].toUpperCase(),
            path: routeMatch[2],
            file: filePath,
            type: 'express-route'
          });
        }
      });
    }

    return routes;
  }

  extractTests(content, filePath) {
    const tests = [];
    
    // Jest/Mocha tests
    const testMatches = content.match(/(?:it|test|describe)\s*\(\s*['"`]([^'"`]+)['"`]/g);
    if (testMatches) {
      testMatches.forEach(match => {
        const testMatch = match.match(/(?:it|test|describe)\s*\(\s*['"`]([^'"`]+)['"`]/);
        if (testMatch) {
          tests.push({
            description: testMatch[1],
            file: filePath,
            type: 'test'
          });
        }
      });
    }

    return tests;
  }

  extractAPIs(content, filePath) {
    const apis = [];
    
    // OpenAPI/Swagger definitions
    if (content.includes('openapi:') || content.includes('swagger:')) {
      apis.push({
        type: 'openapi-spec',
        file: filePath
      });
    }

    return apis;
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
    console.log('\n🔍 Spec Adherence Validation Results');
    console.log('====================================\n');

    const statusIcon = result.status === 'PASS' ? '✅' : 
                      result.status === 'WARNING' ? '⚠️' : '❌';
    
    console.log(`${statusIcon} Overall Status: ${result.status}\n`);
    console.log(`📁 Spec: ${path.basename(result.specPath)}`);
    console.log(`📂 Implementation: ${path.basename(result.implementationPath)}\n`);

    result.validations.forEach(validation => {
      const icon = validation.status === 'PASS' ? '  ✓' : 
                  validation.status === 'WARNING' ? '  ⚠' : '  ✗';
      console.log(`${icon} ${validation.name}: ${validation.message}`);
      
      if (validation.details && validation.details.missing && validation.details.missing.length > 0) {
        console.log('    Missing:');
        validation.details.missing.forEach(missing => {
          console.log(`      - ${missing.requirement || missing.deliverable || missing.story?.title}`);
        });
      }
    });

    if (result.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
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
  const validator = new SpecAdherenceValidator();
  const specPath = process.argv[2];
  const implementationPath = process.argv[3] || '.';

  if (!specPath) {
    console.error('Usage: node spec-adherence-validator.js <spec-path> [implementation-path]');
    process.exit(1);
  }

  (async () => {
    try {
      const result = await validator.validateSpecAdherence(specPath, implementationPath);
      validator.displayResults(result);
      
      const hasFailures = result.status === 'FAIL';
      process.exit(hasFailures ? 1 : 0);
      
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = SpecAdherenceValidator;
