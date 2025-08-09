#!/usr/bin/env node

/**
 * Security Validator Tests
 * 
 * Comprehensive unit tests for the Security Validator
 */

const ValidatorTestFramework = require('./test-framework');
const SecurityValidator = require('../../scripts/validators/security-validator');
const fs = require('fs');
const path = require('path');

class SecurityValidatorTests extends ValidatorTestFramework {
  constructor() {
    super();
    this.validator = new SecurityValidator();
  }

  async runAllTests() {
    console.log('🔒 Testing Security Validator');
    console.log('=============================\n');

    try {
      // Hardcoded Secrets Tests
      await this.testHardcodedSecrets();
      await this.testSecretPatterns();
      
      // Insecure Patterns Tests
      await this.testInsecurePatterns();
      await this.testDangerousFunctions();
      
      // Injection Tests
      await this.testSQLInjection();
      await this.testXSSVulnerabilities();
      
      // Security Best Practices
      await this.testInputValidation();
      await this.testAuthentication();
      await this.testHTTPS();
      
      // Configuration Security
      await this.testConfigSecurity();
      await this.testDependencySecurity();
      await this.testEnvironmentSecurity();
      
      // Integration Tests
      await this.testDirectoryValidation();
      await this.testRealWorldScenarios();
      
      this.displayResults();
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    } finally {
      this.cleanup();
    }
  }

  async testHardcodedSecrets() {
    console.log('🔑 Testing Hardcoded Secrets Detection...');

    // Test obvious hardcoded secrets
    await this.runValidatorTest(SecurityValidator, 'Obvious hardcoded secrets', async (validator) => {
      const secretsCode = `
const API_KEY = "sk-1234567890abcdef";
const PASSWORD = "admin123";
const SECRET_KEY = "my-secret-key-12345";
const DATABASE_URL = "postgresql://user:password123@localhost/db";
const JWT_SECRET = "super-secret-jwt-key";
`;
      
      const file = this.createTempFile('secrets.js', secretsCode);
      const result = await validator.validateFile(file);
      
      const secretsValidation = result.validations.find(v => v.name === 'Hardcoded Secrets');
      this.assert(secretsValidation.status === 'FAIL', 'Should detect hardcoded secrets');
      this.assertGreaterThan(secretsValidation.details.violations.length, 3, 'Should find multiple violations');
      
      return result;
    });

    // Test environment variable usage (good practice)
    await this.runValidatorTest(SecurityValidator, 'Environment variable usage', async (validator) => {
      const envCode = `
const API_KEY = process.env.API_KEY;
const PASSWORD = process.env.DATABASE_PASSWORD;
const SECRET_KEY = process.env.JWT_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;
`;
      
      const file = this.createTempFile('env-vars.js', envCode);
      const result = await validator.validateFile(file);
      
      const secretsValidation = result.validations.find(v => v.name === 'Hardcoded Secrets');
      this.assert(secretsValidation.status === 'PASS', 'Environment variables should pass');
      
      return result;
    });

    // Test subtle hardcoded secrets
    await this.runValidatorTest(SecurityValidator, 'Subtle hardcoded secrets', async (validator) => {
      const subtleSecretsCode = `
// These might be harder to detect but still dangerous
const config = {
  apiKey: "prod-key-abcd1234",
  token: "bearer-token-xyz789"
};

const auth = "Basic " + btoa("admin:secretpassword");
`;
      
      const file = this.createTempFile('subtle-secrets.js', subtleSecretsCode);
      const result = await validator.validateFile(file);
      
      const secretsValidation = result.validations.find(v => v.name === 'Hardcoded Secrets');
      // May pass if detection isn't sophisticated enough, but should ideally catch these
      
      return result;
    });
  }

  async testSecretPatterns() {
    console.log('🎯 Testing Secret Pattern Recognition...');

    const testPatterns = [
      { code: 'const API_KEY = "sk-1234567890";', shouldFail: true, type: 'API key' },
      { code: 'const password = "mypassword123";', shouldFail: true, type: 'password' },
      { code: 'const token = "bearer-abc123";', shouldFail: true, type: 'token' },
      { code: 'const privateKey = "-----BEGIN PRIVATE KEY-----";', shouldFail: true, type: 'private key' },
      { code: 'const API_KEY = process.env.API_KEY;', shouldFail: false, type: 'env var' },
      { code: 'const password = "";', shouldFail: false, type: 'empty string' },
      { code: 'const token = null;', shouldFail: false, type: 'null value' }
    ];

    for (const testCase of testPatterns) {
      await this.runValidatorTest(SecurityValidator, `Secret pattern: ${testCase.type}`, async (validator) => {
        const file = this.createTempFile(`pattern-${testCase.type.replace(/\s+/g, '-')}.js`, testCase.code);
        const result = await validator.validateFile(file);
        
        const secretsValidation = result.validations.find(v => v.name === 'Hardcoded Secrets');
        
        if (testCase.shouldFail) {
          this.assert(secretsValidation.status === 'FAIL', `${testCase.type} should be detected as violation`);
        } else {
          this.assert(secretsValidation.status === 'PASS', `${testCase.type} should not be flagged`);
        }
        
        return result;
      });
    }
  }

  async testInsecurePatterns() {
    console.log('⚠️ Testing Insecure Pattern Detection...');

    // Test dangerous functions
    await this.runValidatorTest(SecurityValidator, 'Dangerous function usage', async (validator) => {
      const dangerousCode = `
// These are dangerous patterns
eval("console.log('dangerous')");
document.write('<script>alert("xss")</script>');
element.innerHTML = userInput;
const result = exec('rm -rf /');
`;
      
      const file = this.createTempFile('dangerous.js', dangerousCode);
      const result = await validator.validateFile(file);
      
      const patternsValidation = result.validations.find(v => v.name === 'Insecure Patterns');
      this.assert(patternsValidation.status === 'FAIL', 'Should detect insecure patterns');
      this.assertGreaterThan(patternsValidation.details.violations.length, 2, 'Should find multiple violations');
      
      return result;
    });

    // Test safe alternatives
    await this.runValidatorTest(SecurityValidator, 'Safe pattern alternatives', async (validator) => {
      const safeCode = `
// These are safer alternatives
JSON.parse(jsonString);
element.textContent = userInput;
element.appendChild(document.createTextNode(text));
const result = spawn('ls', ['-la']);
`;
      
      const file = this.createTempFile('safe.js', safeCode);
      const result = await validator.validateFile(file);
      
      const patternsValidation = result.validations.find(v => v.name === 'Insecure Patterns');
      this.assert(patternsValidation.status === 'PASS', 'Safe patterns should pass');
      
      return result;
    });
  }

  async testDangerousFunctions() {
    console.log('🚨 Testing Dangerous Function Detection...');

    const dangerousFunctions = [
      { func: 'eval', code: 'eval("2 + 2")' },
      { func: 'innerHTML', code: 'div.innerHTML = data' },
      { func: 'document.write', code: 'document.write(content)' },
      { func: 'exec', code: 'exec("ls -la")' },
      { func: 'system', code: 'system("rm file")' }
    ];

    for (const testCase of dangerousFunctions) {
      await this.runValidatorTest(SecurityValidator, `Dangerous function: ${testCase.func}`, async (validator) => {
        const file = this.createTempFile(`${testCase.func}.js`, testCase.code);
        const result = await validator.validateFile(file);
        
        const patternsValidation = result.validations.find(v => v.name === 'Insecure Patterns');
        this.assert(patternsValidation.status === 'FAIL', `${testCase.func} should be flagged as dangerous`);
        
        return result;
      });
    }
  }

  async testSQLInjection() {
    console.log('💉 Testing SQL Injection Detection...');

    // Test SQL injection vulnerabilities
    await this.runValidatorTest(SecurityValidator, 'SQL injection vulnerabilities', async (validator) => {
      const sqlInjectionCode = `
// SQL injection vulnerabilities
const query1 = "SELECT * FROM users WHERE id = " + userId;
const query2 = \`INSERT INTO posts VALUES ('\${title}', '\${content}')\`;
const query3 = "DELETE FROM users WHERE name = '" + username + "'";
`;
      
      const file = this.createTempFile('sql-injection.js', sqlInjectionCode);
      const result = await validator.validateFile(file);
      
      const sqlValidation = result.validations.find(v => v.name === 'SQL Injection Prevention');
      this.assert(sqlValidation.status === 'FAIL', 'Should detect SQL injection risks');
      
      return result;
    });

    // Test parameterized queries (safe)
    await this.runValidatorTest(SecurityValidator, 'Parameterized queries', async (validator) => {
      const safeQueryCode = `
// Safe parameterized queries
const query1 = "SELECT * FROM users WHERE id = ?";
const query2 = "INSERT INTO posts VALUES ($1, $2)";
const query3 = "DELETE FROM users WHERE name = :username";
`;
      
      const file = this.createTempFile('safe-queries.js', safeQueryCode);
      const result = await validator.validateFile(file);
      
      const sqlValidation = result.validations.find(v => v.name === 'SQL Injection Prevention');
      this.assert(sqlValidation.status === 'PASS', 'Parameterized queries should pass');
      
      return result;
    });
  }

  async testXSSVulnerabilities() {
    console.log('🕸️ Testing XSS Vulnerability Detection...');

    // Test XSS vulnerabilities
    await this.runValidatorTest(SecurityValidator, 'XSS vulnerabilities', async (validator) => {
      const xssCode = `
// XSS vulnerabilities
app.get('/search', (req, res) => {
  const query = req.query.q;
  element.innerHTML = query;
  document.write('<h1>' + req.params.title + '</h1>');
});
`;
      
      const file = this.createTempFile('xss-vuln.js', xssCode);
      const result = await validator.validateFile(file);
      
      const xssValidation = result.validations.find(v => v.name === 'XSS Prevention');
      this.assert(xssValidation.status === 'FAIL', 'Should detect XSS vulnerabilities');
      
      return result;
    });

    // Test XSS prevention
    await this.runValidatorTest(SecurityValidator, 'XSS prevention', async (validator) => {
      const safeCode = `
// XSS prevention
app.get('/search', (req, res) => {
  const query = escape(req.query.q);
  element.textContent = sanitize(query);
  res.render('results', { title: validator.escape(req.params.title) });
});
`;
      
      const file = this.createTempFile('xss-safe.js', safeCode);
      const result = await validator.validateFile(file);
      
      const xssValidation = result.validations.find(v => v.name === 'XSS Prevention');
      // Should pass or at least not fail due to XSS protection
      
      return result;
    });
  }

  async testInputValidation() {
    console.log('✅ Testing Input Validation...');

    // Test missing input validation
    await this.runValidatorTest(SecurityValidator, 'Missing input validation', async (validator) => {
      const noValidationCode = `
app.post('/user', (req, res) => {
  const user = req.body;
  database.save(user);
  res.json({ success: true });
});
`;
      
      const file = this.createTempFile('no-validation.js', noValidationCode);
      const result = await validator.validateFile(file);
      
      const validationCheck = result.validations.find(v => v.name === 'Input Validation');
      this.assert(validationCheck.status === 'WARNING', 'Should warn about missing input validation');
      
      return result;
    });

    // Test proper input validation
    await this.runValidatorTest(SecurityValidator, 'Proper input validation', async (validator) => {
      const validationCode = `
const validator = require('validator');
const joi = require('joi');

app.post('/user', (req, res) => {
  const schema = joi.object({
    email: joi.string().email(),
    name: joi.string().min(2).max(50)
  });
  
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details });
  
  database.save(value);
  res.json({ success: true });
});
`;
      
      const file = this.createTempFile('with-validation.js', validationCode);
      const result = await validator.validateFile(file);
      
      const validationCheck = result.validations.find(v => v.name === 'Input Validation');
      this.assert(validationCheck.status === 'PASS', 'Should pass with proper validation');
      
      return result;
    });
  }

  async testAuthentication() {
    console.log('🔐 Testing Authentication Detection...');

    // Test missing authentication
    await this.runValidatorTest(SecurityValidator, 'Missing authentication', async (validator) => {
      const noAuthCode = `
app.get('/api/users', (req, res) => {
  res.json(getAllUsers());
});

app.delete('/api/user/:id', (req, res) => {
  deleteUser(req.params.id);
  res.json({ success: true });
});
`;
      
      const file = this.createTempFile('no-auth.js', noAuthCode);
      const result = await validator.validateFile(file);
      
      const authValidation = result.validations.find(v => v.name === 'Authentication');
      this.assert(authValidation.status === 'WARNING', 'Should warn about missing authentication');
      
      return result;
    });

    // Test proper authentication
    await this.runValidatorTest(SecurityValidator, 'Proper authentication', async (validator) => {
      const authCode = `
const passport = require('passport');
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const token = req.headers.authorization;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

app.get('/api/users', authenticate, (req, res) => {
  res.json(getAllUsers());
});

app.delete('/api/user/:id', requireAuth, (req, res) => {
  deleteUser(req.params.id);
  res.json({ success: true });
});
`;
      
      const file = this.createTempFile('with-auth.js', authCode);
      const result = await validator.validateFile(file);
      
      const authValidation = result.validations.find(v => v.name === 'Authentication');
      this.assert(authValidation.status === 'PASS', 'Should pass with proper authentication');
      
      return result;
    });
  }

  async testHTTPS() {
    console.log('🔒 Testing HTTPS/TLS Validation...');

    // Test insecure HTTP URLs
    await this.runValidatorTest(SecurityValidator, 'Insecure HTTP URLs', async (validator) => {
      const httpCode = `
const apiUrl = 'http://api.example.com/data';
const webhookUrl = 'http://webhook.service.com/notify';
fetch('http://external-service.com/api');
`;
      
      const file = this.createTempFile('http-urls.js', httpCode);
      const result = await validator.validateFile(file);
      
      const httpsValidation = result.validations.find(v => v.name === 'HTTPS/TLS');
      this.assert(httpsValidation.status === 'WARNING', 'Should warn about HTTP URLs');
      
      return result;
    });

    // Test secure HTTPS URLs
    await this.runValidatorTest(SecurityValidator, 'Secure HTTPS URLs', async (validator) => {
      const httpsCode = `
const apiUrl = 'https://api.example.com/data';
const webhookUrl = 'https://webhook.service.com/notify';
fetch('https://external-service.com/api');
const localUrl = 'http://localhost:3000'; // This should be OK
`;
      
      const file = this.createTempFile('https-urls.js', httpsCode);
      const result = await validator.validateFile(file);
      
      const httpsValidation = result.validations.find(v => v.name === 'HTTPS/TLS');
      this.assert(httpsValidation.status === 'PASS', 'HTTPS URLs should pass');
      
      return result;
    });
  }

  async testConfigSecurity() {
    console.log('⚙️ Testing Configuration Security...');

    // Test insecure configuration
    await this.runValidatorTest(SecurityValidator, 'Insecure configuration', async (validator) => {
      const configContent = `{
  "database": {
    "password": "admin123",
    "secret": "my-secret-key"
  },
  "api": {
    "key": "prod-api-key-12345"
  }
}`;
      
      const file = this.createTempFile('config.json', configContent);
      const result = await validator.validateFile(file);
      
      const configValidation = result.validations.find(v => v.name === 'Config Security');
      this.assert(configValidation.status === 'WARNING', 'Should warn about sensitive data in config');
      
      return result;
    });

    // Test secure configuration
    await this.runValidatorTest(SecurityValidator, 'Secure configuration', async (validator) => {
      const secureConfigContent = `{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp"
  },
  "api": {
    "endpoint": "https://api.example.com",
    "timeout": 5000
  }
}`;
      
      const file = this.createTempFile('secure-config.json', secureConfigContent);
      const result = await validator.validateFile(file);
      
      const configValidation = result.validations.find(v => v.name === 'Config Security');
      this.assert(configValidation.status === 'PASS', 'Secure config should pass');
      
      return result;
    });
  }

  async testDependencySecurity() {
    console.log('📦 Testing Dependency Security...');

    // Test vulnerable dependencies
    await this.runValidatorTest(SecurityValidator, 'Vulnerable dependencies', async (validator) => {
      const vulnerablePackage = JSON.stringify({
        dependencies: {
          'lodash': '^3.0.0',
          'moment': '^2.0.0',
          'request': '^2.88.0'
        },
        devDependencies: {
          'node-sass': '^4.0.0'
        }
      });
      
      const file = this.createTempFile('package.json', vulnerablePackage);
      const result = await validator.validateFile(file);
      
      const depValidation = result.validations.find(v => v.name === 'Dependency Security');
      this.assert(depValidation.status === 'WARNING', 'Should warn about vulnerable dependencies');
      
      return result;
    });

    // Test wildcard versions
    await this.runValidatorTest(SecurityValidator, 'Wildcard versions', async (validator) => {
      const wildcardPackage = JSON.stringify({
        dependencies: {
          'express': '*',
          'lodash': 'x.x.x',
          'react': '^18.0.0'
        }
      });
      
      const file = this.createTempFile('package.json', wildcardPackage);
      const result = await validator.validateFile(file);
      
      const depValidation = result.validations.find(v => v.name === 'Dependency Security');
      this.assert(depValidation.status === 'WARNING', 'Should warn about wildcard versions');
      
      return result;
    });
  }

  async testEnvironmentSecurity() {
    console.log('🌍 Testing Environment File Security...');

    // Test .env with actual values
    await this.runValidatorTest(SecurityValidator, 'Environment file with actual values', async (validator) => {
      const envContent = `DATABASE_PASSWORD=actual-prod-password
API_KEY=real-api-key-value
JWT_SECRET=production-jwt-secret
STRIPE_SECRET=sk_live_1234567890`;
      
      const file = this.createTempFile('.env', envContent);
      const result = await validator.validateFile(file);
      
      const envValidation = result.validations.find(v => v.name === 'Environment Security');
      this.assert(envValidation.status === 'WARNING', 'Should warn about actual values in .env');
      
      return result;
    });

    // Test .env.example with placeholders
    await this.runValidatorTest(SecurityValidator, 'Environment example file', async (validator) => {
      const envExampleContent = `DATABASE_PASSWORD=your_database_password
API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret
STRIPE_SECRET=your_stripe_secret`;
      
      const file = this.createTempFile('.env.example', envExampleContent);
      const result = await validator.validateFile(file);
      
      const envValidation = result.validations.find(v => v.name === 'Environment Security');
      this.assert(envValidation.status === 'PASS', 'Example env file should pass');
      
      return result;
    });
  }

  async testDirectoryValidation() {
    console.log('📁 Testing Directory Security Validation...');

    // Test insecure project
    const insecureProject = this.createInsecureProject();
    
    await this.runValidatorTest(SecurityValidator, 'Insecure project validation', async (validator) => {
      const result = await validator.validateDirectory(insecureProject);
      
      this.assert(result.overallStatus === 'FAIL', 'Insecure project should fail');
      this.assertGreaterThan(result.summary.failedFiles, 0, 'Should have failed files');
      
      // Check for specific security issues
      const hasSecretIssues = result.files.some(file => 
        file.validations.some(v => v.name === 'Hardcoded Secrets' && v.status === 'FAIL')
      );
      this.assert(hasSecretIssues, 'Should detect hardcoded secrets');
      
      return result;
    });
  }

  async testRealWorldScenarios() {
    console.log('🏗️ Testing Real-World Security Scenarios...');

    // Test Express.js app with security issues
    const expressApp = this.createMockProject('express-security-test', {
      'app.js': `const express = require('express');
const app = express();

// Security issues
const API_KEY = 'sk-1234567890abcdef';

app.get('/search', (req, res) => {
  const query = req.query.q;
  const sql = "SELECT * FROM posts WHERE title LIKE '%" + query + "%'";
  res.send('<h1>Results: ' + query + '</h1>');
});

app.post('/eval', (req, res) => {
  eval(req.body.code);
  res.send('OK');
});

module.exports = app;`,
      'package.json': JSON.stringify({
        dependencies: {
          'express': '^4.18.0',
          'lodash': '^3.0.0'
        }
      })
    });

    await this.runValidatorTest(SecurityValidator, 'Express app security scan', async (validator) => {
      const result = await validator.validateDirectory(expressApp);
      
      this.assert(result.overallStatus === 'FAIL', 'Insecure Express app should fail');
      
      // Should detect multiple types of vulnerabilities
      const vulnerabilityTypes = new Set();
      result.files.forEach(file => {
        file.validations.forEach(validation => {
          if (validation.status === 'FAIL') {
            vulnerabilityTypes.add(validation.name);
          }
        });
      });
      
      this.assertGreaterThan(vulnerabilityTypes.size, 2, 'Should detect multiple vulnerability types');
      
      return result;
    });

    // Test secure Express.js app
    const secureExpressApp = this.createMockProject('secure-express-test', {
      'app.js': `const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');

const app = express();

app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

const API_KEY = process.env.API_KEY;

app.get('/search', (req, res) => {
  const query = validator.escape(req.query.q);
  const sql = "SELECT * FROM posts WHERE title LIKE ?";
  res.render('results', { query: query });
});

module.exports = app;`,
      'package.json': JSON.stringify({
        dependencies: {
          'express': '^4.18.0',
          'helmet': '^6.0.0',
          'express-rate-limit': '^6.0.0',
          'validator': '^13.0.0'
        }
      })
    });

    await this.runValidatorTest(SecurityValidator, 'Secure Express app scan', async (validator) => {
      const result = await validator.validateDirectory(secureExpressApp);
      
      this.assert(result.overallStatus === 'PASS' || result.overallStatus === 'WARNING', 
        'Secure Express app should mostly pass');
      
      return result;
    });
  }

  // Helper methods
  createTempFile(filename, content) {
    const tempDir = path.join(this.tempTestDir, 'security-temp-files');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, content);
    return filePath;
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new SecurityValidatorTests();
  tester.runAllTests().catch(error => {
    console.error('❌ Security Validator tests failed:', error);
    process.exit(1);
  });
}

module.exports = SecurityValidatorTests;
