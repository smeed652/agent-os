#!/usr/bin/env node

/**
 * Security Validator
 * 
 * Validates security best practices, detects common vulnerabilities,
 * and ensures secure coding patterns are followed.
 */

const fs = require('fs');
const path = require('path');

class SecurityValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      validations: []
    };

    this.securityPatterns = {
      // Hardcoded secrets patterns
      secrets: [
        /password\s*=\s*['"][^'"]+['"]/i,
        /api_key\s*=\s*['"][^'"]+['"]/i,
        /secret\s*=\s*['"][^'"]+['"]/i,
        /token\s*=\s*['"][^'"]+['"]/i,
        /private[_]?key\s*=\s*['"][^'"]+['"]/i,
        /database_url\s*=\s*['"].*:\/\/.*:.*@/i,
        /mongodb:\/\/.*:.*@/i,
        /postgres:\/\/.*:.*@/i,
        /mysql:\/\/.*:.*@/i
      ],

      // Insecure patterns
      insecurePatterns: [
        /eval\s*\(/i,
        /innerHTML\s*=/i,
        /document\.write\s*\(/i,
        /dangerouslySetInnerHTML/i,
        /exec\s*\(/i,
        /system\s*\(/i,
        /shell_exec\s*\(/i
      ],

      // SQL injection patterns
      sqlInjection: [
        // String concatenation with SQL keywords
        /(SELECT|INSERT|UPDATE|DELETE).*"\s*\+/i,
        /"\s*\+.*\w+.*\+.*".*(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|SET)/i,
        /`.*\$\{.*\}.*`.*(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|SET)/i,
        // Template literals with SQL injection risks
        /\$\{.*\}.*(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|SET)/i,
        /(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|SET).*\$\{.*\}/i,
        // Classic patterns
        /SELECT\s+.*\+.*FROM/i,
        /INSERT\s+.*\+.*INTO/i,
        /UPDATE\s+.*\+.*SET/i,
        /DELETE\s+.*\+.*FROM/i
      ],

      // XSS patterns
      xssPatterns: [
        /innerHTML\s*=\s*(?!['"])/i,  // innerHTML = variable (not string literal)
        /innerHTML\s*=.*(?:req\.query|req\.params|req\.body)/i,
        /document\.write\s*\(.*\+/i,  // document.write with concatenation
        /\$\{.*\}.*innerHTML/i,
        /innerHTML.*\$\{.*\}/i,
        /\.html\(.*(?:req\.query|req\.params|req\.body)/i
      ],

      // Authentication patterns (good)
      authPatterns: [
        /bcrypt/i,
        /passport/i,
        /jwt/i,
        /authenticate/i,
        /authorization/i,
        /auth.*middleware/i
      ],

      // Input validation patterns (good)
      validationPatterns: [
        /validator\./i,
        /joi\./i,
        /yup\./i,
        /express-validator/i,
        /validate\(/i,
        /sanitize\(/i
      ],

      // HTTPS/TLS patterns (good)
      httpsPatterns: [
        /https:/i,
        /ssl/i,
        /tls/i,
        /cert/i,
        /secure:\s*true/i
      ]
    };
  }

  async validateDirectory(dirPath) {
    const results = [];
    const files = this.getAllFiles(dirPath);
    
    for (const file of files) {
      if (this.shouldValidateFile(file)) {
        const result = await this.validateFile(file);
        results.push(result);
      }
    }

    return this.aggregateResults(results);
  }

  async validateFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return this.createResult(filePath, 'FAIL', 'File does not exist');
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const validations = [];

    // Core security validations
    validations.push(this.validateHardcodedSecrets(content, filePath));
    validations.push(this.validateInsecurePatterns(content, filePath));
    validations.push(this.validateSQLInjection(content, filePath));
    validations.push(this.validateXSS(content, filePath));
    validations.push(this.validateInputValidation(content, filePath));
    validations.push(this.validateAuthentication(content, filePath));
    validations.push(this.validateHTTPS(content, filePath));

    // File-specific validations
    if (this.isConfigFile(filePath)) {
      validations.push(this.validateConfigSecurity(content, filePath));
    }

    if (this.isPackageFile(filePath)) {
      validations.push(this.validateDependencySecurity(content, filePath));
    }

    if (this.isEnvFile(filePath)) {
      validations.push(this.validateEnvironmentSecurity(content, filePath));
    }

    const overallResult = this.aggregateValidations(validations);
    
    return {
      file: filePath,
      status: overallResult.status,
      validations: validations,
      summary: overallResult.summary,
      recommendations: overallResult.recommendations
    };
  }

  validateHardcodedSecrets(content, filePath) {
    const violations = [];
    
    this.securityPatterns.secrets.forEach(pattern => {
      const matches = content.match(new RegExp(pattern.source, 'gi'));
      if (matches) {
        matches.forEach(match => {
          violations.push({
            type: 'Hardcoded Secret',
            pattern: match.substring(0, 50) + (match.length > 50 ? '...' : ''),
            line: this.getLineNumber(content, match),
            severity: 'HIGH'
          });
        });
      }
    });

    // Check for common secret variable names
    const secretVariables = [
      'PASSWORD', 'API_KEY', 'SECRET_KEY', 'PRIVATE_KEY', 'ACCESS_TOKEN',
      'REFRESH_TOKEN', 'DATABASE_PASSWORD', 'JWT_SECRET'
    ];

    secretVariables.forEach(varName => {
      const pattern = new RegExp(`${varName}\\s*=\\s*['"][^'"]+['"]`, 'i');
      const matches = content.match(pattern);
      if (matches) {
        violations.push({
          type: 'Potential Hardcoded Secret',
          pattern: `${varName} = "***"`,
          line: this.getLineNumber(content, matches[0]),
          severity: 'HIGH'
        });
      }
    });

    const status = violations.length === 0 ? 'PASS' : 'FAIL';
    const message = violations.length === 0 
      ? 'No hardcoded secrets detected'
      : `Found ${violations.length} potential hardcoded secrets`;

    return this.createValidation('Hardcoded Secrets', status, message, {
      violationCount: violations.length,
      violations: violations,
      recommendation: violations.length > 0 
        ? 'Move secrets to environment variables or secure configuration'
        : null
    });
  }

  validateInsecurePatterns(content, filePath) {
    const violations = [];
    
    this.securityPatterns.insecurePatterns.forEach(pattern => {
      const matches = content.match(new RegExp(pattern.source, 'gi'));
      if (matches) {
        matches.forEach(match => {
          violations.push({
            type: 'Insecure Pattern',
            pattern: match,
            line: this.getLineNumber(content, match),
            severity: 'HIGH',
            description: this.getInsecurePatternDescription(match)
          });
        });
      }
    });

    const status = violations.length === 0 ? 'PASS' : 'FAIL';
    const message = violations.length === 0 
      ? 'No insecure patterns detected'
      : `Found ${violations.length} insecure patterns`;

    return this.createValidation('Insecure Patterns', status, message, {
      violationCount: violations.length,
      violations: violations,
      recommendation: violations.length > 0 
        ? 'Replace insecure patterns with safe alternatives'
        : null
    });
  }

  validateSQLInjection(content, filePath) {
    const violations = [];
    
    this.securityPatterns.sqlInjection.forEach(pattern => {
      const matches = content.match(new RegExp(pattern.source, 'gi'));
      if (matches) {
        matches.forEach(match => {
          violations.push({
            type: 'SQL Injection Risk',
            pattern: match.substring(0, 100) + (match.length > 100 ? '...' : ''),
            line: this.getLineNumber(content, match),
            severity: 'HIGH'
          });
        });
      }
    });

    // Check for parameterized queries (good patterns)
    const parameterizedPatterns = [
      /\?\s*,/g, // ? parameters
      /\$\d+/g,  // $1, $2 parameters
      /:\w+/g    // :name parameters
    ];

    let hasParameterizedQueries = false;
    parameterizedPatterns.forEach(pattern => {
      if (content.match(pattern)) {
        hasParameterizedQueries = true;
      }
    });

    const status = violations.length === 0 ? 'PASS' : 'FAIL';
    const message = violations.length === 0 
      ? 'No SQL injection risks detected'
      : `Found ${violations.length} potential SQL injection risks`;

    return this.createValidation('SQL Injection Prevention', status, message, {
      violationCount: violations.length,
      violations: violations,
      hasParameterizedQueries: hasParameterizedQueries,
      recommendation: violations.length > 0 
        ? 'Use parameterized queries or prepared statements'
        : null
    });
  }

  validateXSS(content, filePath) {
    const violations = [];
    
    this.securityPatterns.xssPatterns.forEach(pattern => {
      const matches = content.match(new RegExp(pattern.source, 'gi'));
      if (matches) {
        matches.forEach(match => {
          violations.push({
            type: 'XSS Risk',
            pattern: match,
            line: this.getLineNumber(content, match),
            severity: 'HIGH'
          });
        });
      }
    });

    // Check for XSS protection patterns
    const xssProtectionPatterns = [
      /escape\(/i,
      /sanitize\(/i,
      /xss.*filter/i,
      /helmet/i
    ];

    let hasXSSProtection = false;
    xssProtectionPatterns.forEach(pattern => {
      if (content.match(pattern)) {
        hasXSSProtection = true;
      }
    });

    const status = violations.length === 0 ? 'PASS' : 'FAIL';
    const message = violations.length === 0 
      ? 'No XSS risks detected'
      : `Found ${violations.length} potential XSS risks`;

    return this.createValidation('XSS Prevention', status, message, {
      violationCount: violations.length,
      violations: violations,
      hasXSSProtection: hasXSSProtection,
      recommendation: violations.length > 0 
        ? 'Sanitize user input and use safe DOM manipulation methods'
        : null
    });
  }

  validateInputValidation(content, filePath) {
    let hasValidation = false;
    const validationEvidence = [];

    this.securityPatterns.validationPatterns.forEach(pattern => {
      const matches = content.match(new RegExp(pattern.source, 'gi'));
      if (matches) {
        hasValidation = true;
        validationEvidence.push(...matches);
      }
    });

    // Check for user input handling
    const userInputPatterns = [
      /req\.body/i,
      /req\.query/i,
      /req\.params/i,
      /req\.headers/i
    ];

    let hasUserInput = false;
    userInputPatterns.forEach(pattern => {
      if (content.match(pattern)) {
        hasUserInput = true;
      }
    });

    let status = 'PASS';
    let message = 'Input validation not applicable';

    if (hasUserInput) {
      status = hasValidation ? 'PASS' : 'WARNING';
      message = hasValidation 
        ? 'Input validation patterns detected'
        : 'User input handling detected but no validation patterns found';
    }

    return this.createValidation('Input Validation', status, message, {
      hasUserInput: hasUserInput,
      hasValidation: hasValidation,
      validationEvidence: validationEvidence,
      recommendation: hasUserInput && !hasValidation 
        ? 'Add input validation for all user-provided data'
        : null
    });
  }

  validateAuthentication(content, filePath) {
    let hasAuth = false;
    const authEvidence = [];

    this.securityPatterns.authPatterns.forEach(pattern => {
      const matches = content.match(new RegExp(pattern.source, 'gi'));
      if (matches) {
        hasAuth = true;
        authEvidence.push(...matches);
      }
    });

    // Check for route protection patterns
    const routeProtectionPatterns = [
      /authenticate/i,
      /isAuthenticated/i,
      /requireAuth/i,
      /protected/i,
      /middleware.*auth/i
    ];

    let hasRouteProtection = false;
    routeProtectionPatterns.forEach(pattern => {
      if (content.match(pattern)) {
        hasRouteProtection = true;
      }
    });

    // Check if file contains routes that might need authentication
    const routePatterns = [
      /router\.(get|post|put|delete)/i,
      /app\.(get|post|put|delete)/i,
      /\/api\//i
    ];

    let hasRoutes = false;
    routePatterns.forEach(pattern => {
      if (content.match(pattern)) {
        hasRoutes = true;
      }
    });

    let status = 'PASS';
    let message = 'Authentication not applicable';

    if (hasRoutes) {
      if (hasAuth || hasRouteProtection) {
        status = 'PASS';
        message = 'Authentication patterns detected for routes';
      } else {
        status = 'WARNING';
        message = 'Routes detected but no authentication patterns found';
      }
    }

    return this.createValidation('Authentication', status, message, {
      hasRoutes: hasRoutes,
      hasAuth: hasAuth,
      hasRouteProtection: hasRouteProtection,
      authEvidence: authEvidence,
      recommendation: hasRoutes && !hasAuth && !hasRouteProtection 
        ? 'Consider adding authentication for protected routes'
        : null
    });
  }

  validateHTTPS(content, filePath) {
    let hasHTTPS = false;
    let hasInsecureHTTP = false;
    const httpsEvidence = [];
    const httpViolations = [];

    this.securityPatterns.httpsPatterns.forEach(pattern => {
      const matches = content.match(new RegExp(pattern.source, 'gi'));
      if (matches) {
        hasHTTPS = true;
        httpsEvidence.push(...matches);
      }
    });

    // Check for insecure HTTP usage
    const httpPattern = /http:\/\/(?!localhost|127\.0\.0\.1)/gi;
    const httpMatches = content.match(httpPattern);
    if (httpMatches) {
      hasInsecureHTTP = true;
      httpViolations.push(...httpMatches);
    }

    let status = 'PASS';
    let message = 'HTTPS/TLS configuration appropriate';

    if (hasInsecureHTTP) {
      status = 'WARNING';
      message = `Found ${httpViolations.length} insecure HTTP URLs`;
    } else if (hasHTTPS) {
      status = 'PASS';
      message = 'HTTPS/TLS patterns detected';
    }

    return this.createValidation('HTTPS/TLS', status, message, {
      hasHTTPS: hasHTTPS,
      hasInsecureHTTP: hasInsecureHTTP,
      httpsEvidence: httpsEvidence,
      httpViolations: httpViolations,
      recommendation: hasInsecureHTTP 
        ? 'Replace HTTP URLs with HTTPS for external services'
        : null
    });
  }

  validateConfigSecurity(content, filePath) {
    const violations = [];

    // Check for sensitive data in config files
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /key.*=.*['"]/i,
      /token/i
    ];

    sensitivePatterns.forEach(pattern => {
      const matches = content.match(new RegExp(pattern.source, 'gi'));
      if (matches) {
        matches.forEach(match => {
          violations.push({
            type: 'Sensitive Data in Config',
            pattern: match,
            line: this.getLineNumber(content, match)
          });
        });
      }
    });

    const status = violations.length === 0 ? 'PASS' : 'WARNING';
    const message = violations.length === 0 
      ? 'Configuration file security appropriate'
      : `Found ${violations.length} potential security issues in config`;

    return this.createValidation('Config Security', status, message, {
      violations: violations,
      recommendation: violations.length > 0 
        ? 'Move sensitive configuration to environment variables'
        : null
    });
  }

  validateDependencySecurity(content, filePath) {
    let packageData;
    try {
      packageData = JSON.parse(content);
    } catch (e) {
      return this.createValidation('Dependency Security', 'WARNING', 
        'Could not parse package file');
    }

    const issues = [];
    const dependencies = { ...packageData.dependencies, ...packageData.devDependencies };

    // Check for known vulnerable packages (simplified list)
    const vulnerablePackages = [
      'lodash', 'moment', 'request', 'node-sass'
    ];

    Object.keys(dependencies).forEach(dep => {
      if (vulnerablePackages.includes(dep)) {
        issues.push({
          type: 'Potentially Vulnerable Dependency',
          package: dep,
          version: dependencies[dep]
        });
      }
    });

    // Check for wildcard versions
    Object.keys(dependencies).forEach(dep => {
      const version = dependencies[dep];
      if (version.includes('*') || version.includes('x')) {
        issues.push({
          type: 'Wildcard Version',
          package: dep,
          version: version,
          description: 'Wildcard versions can introduce security risks'
        });
      }
    });

    const status = issues.length === 0 ? 'PASS' : 'WARNING';
    const message = issues.length === 0 
      ? 'No obvious dependency security issues'
      : `Found ${issues.length} potential dependency security issues`;

    return this.createValidation('Dependency Security', status, message, {
      issues: issues,
      recommendation: issues.length > 0 
        ? 'Review dependencies for security vulnerabilities and pin versions'
        : null
    });
  }

  validateEnvironmentSecurity(content, filePath) {
    const violations = [];

    // Check for actual values in .env files (should be examples)
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (value && value.trim() !== '' && !value.includes('your_') && !value.includes('example')) {
          violations.push({
            type: 'Actual Value in Environment File',
            line: index + 1,
            key: key.trim(),
            description: 'Environment files should contain examples, not actual values'
          });
        }
      }
    });

    const status = violations.length === 0 ? 'PASS' : 'WARNING';
    const message = violations.length === 0 
      ? 'Environment file security appropriate'
      : `Found ${violations.length} potential issues in environment file`;

    return this.createValidation('Environment Security', status, message, {
      violations: violations,
      recommendation: violations.length > 0 
        ? 'Replace actual values with example placeholders'
        : null
    });
  }

  // Utility methods
  getInsecurePatternDescription(pattern) {
    const descriptions = {
      'eval': 'eval() can execute arbitrary code and is a security risk',
      'innerHTML': 'innerHTML can lead to XSS attacks, use textContent or proper sanitization',
      'document.write': 'document.write can be exploited for XSS attacks',
      'dangerouslySetInnerHTML': 'Dangerous HTML injection, ensure content is properly sanitized',
      'exec': 'exec() can execute arbitrary system commands',
      'system': 'system() can execute arbitrary system commands',
      'shell_exec': 'shell_exec() can execute arbitrary shell commands'
    };

    for (const [key, desc] of Object.entries(descriptions)) {
      if (pattern.toLowerCase().includes(key.toLowerCase())) {
        return desc;
      }
    }

    return 'Potentially insecure pattern detected';
  }

  getLineNumber(content, searchString) {
    const lines = content.substring(0, content.indexOf(searchString)).split('\n');
    return lines.length;
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

  shouldValidateFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath).toLowerCase();
    
    const validExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.rb', '.php', '.java', '.cs', '.json', '.yaml', '.yml'];
    const validFiles = ['.env', '.env.example', '.env.local', '.env.production'];
    
    return validExtensions.includes(ext) || validFiles.includes(fileName) || fileName.startsWith('.env');
  }

  isConfigFile(filePath) {
    const fileName = path.basename(filePath).toLowerCase();
    const configFiles = ['config.json', 'config.js', 'config.ts', 'app.json', 'settings.json'];
    return configFiles.includes(fileName) || fileName.includes('config');
  }

  isPackageFile(filePath) {
    const fileName = path.basename(filePath).toLowerCase();
    return fileName === 'package.json';
  }

  isEnvFile(filePath) {
    const fileName = path.basename(filePath).toLowerCase();
    return fileName.startsWith('.env');
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

  aggregateResults(results) {
    const allValidations = results.flatMap(result => result.validations);
    const overallSummary = this.aggregateValidations(allValidations);

    return {
      files: results,
      overallStatus: overallSummary.status,
      summary: {
        totalFiles: results.length,
        passedFiles: results.filter(r => r.status === 'PASS').length,
        warningFiles: results.filter(r => r.status === 'WARNING').length,
        failedFiles: results.filter(r => r.status === 'FAIL').length,
        totalValidations: overallSummary.summary.total,
        passedValidations: overallSummary.summary.passed,
        warningValidations: overallSummary.summary.warnings,
        failedValidations: overallSummary.summary.failed
      },
      recommendations: overallSummary.recommendations
    };
  }

  displayResults(results) {
    console.log('\n🔒 Security Validation Results');
    console.log('==============================\n');

    const statusIcon = results.overallStatus === 'PASS' ? '✅' : 
                      results.overallStatus === 'WARNING' ? '⚠️' : '❌';
    
    console.log(`${statusIcon} Overall Security Status: ${results.overallStatus}\n`);

    // Show file-by-file results
    results.files.forEach(result => {
      const fileIcon = result.status === 'PASS' ? '✅' : 
                      result.status === 'WARNING' ? '⚠️' : '❌';
      
      console.log(`${fileIcon} ${path.basename(result.file)} (${result.status})`);
      
      result.validations.forEach(validation => {
        if (validation.status !== 'PASS') {
          const icon = validation.status === 'WARNING' ? '  ⚠' : '  ✗';
          console.log(`${icon} ${validation.name}: ${validation.message}`);
          
          if (validation.details.violations && validation.details.violations.length > 0) {
            validation.details.violations.slice(0, 3).forEach(violation => {
              console.log(`     - ${violation.type}: ${violation.pattern || violation.description}`);
            });
            if (validation.details.violations.length > 3) {
              console.log(`     - ... and ${validation.details.violations.length - 3} more`);
            }
          }
        }
      });
      console.log('');
    });

    // Show recommendations
    if (results.recommendations.length > 0) {
      console.log('💡 Security Recommendations:');
      [...new Set(results.recommendations)].forEach(rec => {
        console.log(`   - ${rec}`);
      });
      console.log('');
    }

    // Summary
    console.log('📊 Security Summary');
    console.log('-------------------');
    console.log(`Total Files Scanned: ${results.summary.totalFiles}`);
    console.log(`✅ Secure Files: ${results.summary.passedFiles}`);
    console.log(`⚠️ Files with Warnings: ${results.summary.warningFiles}`);
    console.log(`❌ Files with Issues: ${results.summary.failedFiles}`);
    console.log(`Security Score: ${Math.round((results.summary.passedFiles / results.summary.totalFiles) * 100)}%\n`);
  }
}

// CLI usage
if (require.main === module) {
  const validator = new SecurityValidator();
  const target = process.argv[2] || '.';

  (async () => {
    try {
      let results;
      
      if (fs.statSync(target).isFile()) {
        const result = await validator.validateFile(target);
        results = validator.aggregateResults([result]);
      } else {
        results = await validator.validateDirectory(target);
      }
      
      validator.displayResults(results);
      
      const hasFailures = results.overallStatus === 'FAIL';
      process.exit(hasFailures ? 1 : 0);
      
    } catch (error) {
      console.error('❌ Security validation failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = SecurityValidator;
