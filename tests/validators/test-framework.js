#!/usr/bin/env node

/**
 * Validator Test Framework
 * 
 * Comprehensive testing framework for all Agent OS validators
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ValidatorTestFramework {
  constructor() {
    this.testResults = [];
    this.mockDataDir = path.join(__dirname, 'mock-data');
    this.tempTestDir = path.join(__dirname, 'temp-projects');
  }

  // Test result tracking
  createTestResult(testName, validator, status, details = {}) {
    return {
      testName,
      validator,
      status,
      timestamp: new Date().toISOString(),
      details,
      duration: details.duration || 0
    };
  }

  recordTest(result) {
    this.testResults.push(result);
  }

  // Mock data creation helpers
  createMockProject(projectName, structure = {}) {
    const projectPath = path.join(this.tempTestDir, projectName);
    
    // Clean up existing
    if (fs.existsSync(projectPath)) {
      this.cleanupMockProject(projectName);
    }
    
    fs.mkdirSync(projectPath, { recursive: true });
    
    // Create directory structure
    this.createDirectoryStructure(projectPath, structure);
    
    return projectPath;
  }

  createDirectoryStructure(basePath, structure) {
    Object.entries(structure).forEach(([name, content]) => {
      const itemPath = path.join(basePath, name);
      
      if (typeof content === 'string') {
        // It's a file
        fs.mkdirSync(path.dirname(itemPath), { recursive: true });
        fs.writeFileSync(itemPath, content);
      } else if (typeof content === 'object' && content !== null) {
        // It's a directory
        fs.mkdirSync(itemPath, { recursive: true });
        this.createDirectoryStructure(itemPath, content);
      }
    });
  }

  cleanupMockProject(projectName) {
    const projectPath = path.join(this.tempTestDir, projectName);
    if (fs.existsSync(projectPath)) {
      fs.rmSync(projectPath, { recursive: true, force: true });
    }
  }

  cleanupAllMockProjects() {
    if (fs.existsSync(this.tempTestDir)) {
      fs.rmSync(this.tempTestDir, { recursive: true, force: true });
    }
  }

  // Mock project templates
  createBasicWebProject() {
    return this.createMockProject('basic-web-project', {
      'package.json': JSON.stringify({
        name: 'test-project',
        version: '1.0.0',
        scripts: {
          start: 'node server.js',
          test: 'jest'
        },
        dependencies: {
          express: '^4.18.0',
          bcrypt: '^5.1.0'
        },
        devDependencies: {
          jest: '^29.0.0'
        }
      }, null, 2),
      'README.md': `# Test Project

This is a test project for validation.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`bash
npm start
\`\`\`

## Features

- User authentication
- Data management
- API endpoints
`,
      'src/': {
        'index.js': `const express = require('express');
const bcrypt = require('bcrypt');

const app = express();

// Authentication middleware
function authenticate(req, res, next) {
  // TODO: Implement authentication
  next();
}

app.get('/api/users', authenticate, (req, res) => {
  res.json({ users: [] });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // This is a security issue - hardcoded password
  if (password === 'admin123') {
    res.json({ token: 'hardcoded-token' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

module.exports = app;`,
        'auth/': {
          'login.js': `// Login functionality
function validateLogin(username, password) {
  // SQL injection vulnerability
  const query = "SELECT * FROM users WHERE username = '" + username + "'";
  return executeQuery(query);
}

function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

module.exports = { validateLogin, hashPassword };`,
          'middleware.js': `function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  // Verify token logic here
  next();
}`
        },
        'components/': {
          'UserCard.jsx': `import React from 'react';

// This component is over 300 lines - file size violation
function UserCard({ user }) {
  // XSS vulnerability - using dangerouslySetInnerHTML
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <div dangerouslySetInnerHTML={{ __html: user.bio }} />
      <p>{user.email}</p>
    </div>
  );
}

export default UserCard;

// Adding padding to make this file over 300 lines
${Array(280).fill('// Padding comment').join('\n')}`
        }
      },
      'tests/': {
        'auth.test.js': `const { validateLogin } = require('../src/auth/login');

describe('Authentication', () => {
  it('should validate user login', () => {
    const result = validateLogin('testuser', 'password');
    expect(result).toBeDefined();
  });

  it('should hash passwords securely', () => {
    // Test password hashing
    expect(true).toBe(true);
  });
});`,
        'components/': {
          'UserCard.test.jsx': `import { render } from '@testing-library/react';
import UserCard from '../../src/components/UserCard';

describe('UserCard', () => {
  it('renders user information', () => {
    const user = { name: 'Test User', email: 'test@example.com', bio: 'Test bio' };
    render(<UserCard user={user} />);
  });
});`
        }
      },
      '.agent-os/': {
        'specs/': {
          '2025-01-15-user-authentication/': {
            'spec.md': `# User Authentication Spec

## Overview
Implement secure user authentication system with login, registration, and session management.

## User Stories

### Story 1: User Login
As a user, I want to log in securely so that I can access my account.

- User can enter username and password
- System validates credentials against database
- User receives authentication token on success

### Story 2: Password Security
As a user, I want my password to be stored securely so that my account is protected.

- Passwords are hashed using bcrypt
- No plain text password storage
- Secure password validation

## Spec Scope

1. User login with username/password
2. Password hashing and validation
3. JWT token generation
4. Authentication middleware
5. Secure session management

## Out of Scope

- Social media login
- Two-factor authentication
- Password reset functionality

## Expected Deliverable

1. Working login API endpoint
2. Secure password storage system
3. Authentication middleware for protected routes`,
            'tasks.md': `# Spec Tasks

## 1. Authentication Setup
- [ ] 1.1 Write tests for authentication functions
- [ ] 1.2 Create user model with password hashing
- [ ] 1.3 Implement bcrypt password hashing
- [ ] 1.4 Verify tests pass for password hashing

## 2. Login API
- [ ] 2.1 Write tests for login endpoint
- [ ] 2.2 Create POST /api/login endpoint
- [ ] 2.3 Implement credential validation
- [ ] 2.4 Add JWT token generation
- [ ] 2.5 Verify tests pass for login functionality

## 3. Authentication Middleware
- [ ] 3.1 Write tests for auth middleware
- [ ] 3.2 Create authentication middleware
- [ ] 3.3 Add token validation logic
- [ ] 3.4 Verify tests pass for middleware`,
            'status.md': `# User Authentication Status

**Spec Name**: User Authentication
**Created**: 2025-01-15
**Current Status**: Active
**Last Updated**: 2025-01-15

## Status History
- 2025-01-15: Spec created and development started

## Next Actions
- Complete authentication implementation
- Add comprehensive tests
- Security validation`,
            'sub-specs/': {
              'technical-spec.md': `# Technical Specification

## Spec Reference
This technical specification supports the User Authentication spec.

## Technical Requirements

- Node.js with Express framework
- bcrypt for password hashing
- jsonwebtoken for JWT tokens
- Input validation middleware
- Rate limiting for login attempts
- Secure HTTP headers

## External Dependencies

- bcrypt: ^5.1.0
- jsonwebtoken: ^9.0.0
- express-rate-limit: ^6.0.0
- helmet: ^6.0.0

## Security Considerations

- Password hashing with salt rounds >= 10
- JWT tokens with reasonable expiration
- Input sanitization and validation
- Protection against timing attacks`
            }
          }
        }
      }
    });
  }

  createInsecureProject() {
    return this.createMockProject('insecure-project', {
      'app.js': `const express = require('express');
const app = express();

// Multiple security vulnerabilities for testing
const API_KEY = 'sk-1234567890abcdef'; // Hardcoded secret
const DATABASE_URL = 'postgresql://user:password123@localhost/db'; // Hardcoded credentials

app.get('/search', (req, res) => {
  const query = req.query.q;
  // SQL injection vulnerability
  const sql = "SELECT * FROM posts WHERE title LIKE '%" + query + "%'";
  
  // XSS vulnerability
  res.send('<h1>Results for: ' + query + '</h1>');
});

app.post('/admin', (req, res) => {
  const code = req.body.code;
  // Code injection vulnerability
  eval(code);
  res.send('Code executed');
});

module.exports = app;`,
      'config.json': `{
  "database": {
    "password": "super-secret-password",
    "apiKey": "prod-api-key-12345"
  },
  "jwt": {
    "secret": "my-jwt-secret-key"
  }
}`,
      '.env': `# Production environment variables
DATABASE_PASSWORD=actual-prod-password
API_KEY=real-api-key-value
JWT_SECRET=production-jwt-secret`,
      'package.json': JSON.stringify({
        name: 'insecure-project',
        dependencies: {
          'lodash': '^3.0.0', // Vulnerable version
          'moment': '^2.0.0'  // Vulnerable package
        }
      })
    });
  }

  createWellStructuredProject() {
    return this.createMockProject('well-structured-project', {
      'README.md': `# Well Structured Project

## Description
A well-organized project following best practices.

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
\`\`\`bash
npm start
\`\`\`

## Features
- Clean architecture
- Comprehensive testing
- Security best practices
- Good documentation

## API Documentation
See \`/docs/api.md\` for API endpoints.

## Contributing
Please read CONTRIBUTING.md for guidelines.

## License
MIT License`,
      'package.json': JSON.stringify({
        name: 'well-structured-project',
        scripts: {
          start: 'node server.js',
          dev: 'nodemon server.js',
          test: 'jest',
          build: 'webpack'
        },
        dependencies: {
          express: '^4.18.0'
        },
        devDependencies: {
          jest: '^29.0.0',
          nodemon: '^2.0.0'
        }
      }),
      'src/': {
        'server.js': `const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

/**
 * User authentication endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.post('/api/auth', (req, res) => {
  // Proper input validation and authentication
  res.json({ message: 'Authenticated' });
});

module.exports = app;`,
        'utils/': {
          'validator.js': `/**
           * Input validation utilities
           */
          function validateEmail(email) {
            const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
            return emailRegex.test(email);
          }
          
          function sanitizeInput(input) {
            return input.replace(/[<>]/g, '');
          }
          
          module.exports = { validateEmail, sanitizeInput };`
        }
      },
      'tests/': {
        'server.test.js': `const request = require('supertest');
const app = require('../src/server');

describe('Server', () => {
  it('should handle authentication', async () => {
    const response = await request(app)
      .post('/api/auth')
      .send({ username: 'test', password: 'test' });
    
    expect(response.status).toBe(200);
  });
});`,
        'utils/': {
          'validator.test.js': `const { validateEmail, sanitizeInput } = require('../../src/utils/validator');

describe('Validator', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });
    
    it('should reject invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false);
    });
  });
  
  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>'))
        .toBe('scriptalert("xss")/script');
    });
  });
});`
        }
      },
      'docs/': {
        'api.md': `# API Documentation

## Authentication

### POST /api/auth
Authenticate user with username and password.

**Request:**
\`\`\`json
{
  "username": "string",
  "password": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "token": "string",
  "user": {
    "id": "string",
    "username": "string"
  }
}
\`\`\``
      }
    });
  }

  createGitProject() {
    const projectPath = this.createMockProject('git-project', {
      'README.md': '# Git Test Project',
      'src/': {
        'main.js': 'console.log("Hello World");'
      }
    });

    // Initialize git repository
    try {
      const originalCwd = process.cwd();
      process.chdir(projectPath);
      
      execSync('git init', { stdio: 'ignore' });
      execSync('git config user.email "test@example.com"', { stdio: 'ignore' });
      execSync('git config user.name "Test User"', { stdio: 'ignore' });
      execSync('git add .', { stdio: 'ignore' });
      execSync('git commit -m "feat: initial commit"', { stdio: 'ignore' });
      
      // Create feature branch
      execSync('git checkout -b feature/user-auth', { stdio: 'ignore' });
      fs.writeFileSync(path.join(projectPath, 'src/auth.js'), 'module.exports = {};');
      execSync('git add .', { stdio: 'ignore' });
      execSync('git commit -m "feat(auth): add authentication module"', { stdio: 'ignore' });
      
      // Create another branch with bad naming
      execSync('git checkout -b badBranchName', { stdio: 'ignore' });
      
      process.chdir(originalCwd);
    } catch (error) {
      console.warn('Could not initialize git repository for testing:', error.message);
    }

    return projectPath;
  }

  // Test execution helpers
  async runValidatorTest(validatorClass, testName, testFunction) {
    const startTime = Date.now();
    
    try {
      const validator = new validatorClass();
      const result = await testFunction(validator);
      const duration = Date.now() - startTime;
      
      this.recordTest(this.createTestResult(
        testName, 
        validatorClass.name, 
        'PASS', 
        { result, duration }
      ));
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.recordTest(this.createTestResult(
        testName, 
        validatorClass.name, 
        'FAIL', 
        { error: error.message, duration }
      ));
      
      throw error;
    }
  }

  // Assertion helpers
  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`Assertion failed: ${message}. Expected: ${expected}, Actual: ${actual}`);
    }
  }

  assertContains(array, item, message = '') {
    if (!array.includes(item)) {
      throw new Error(`Assertion failed: ${message}. Array does not contain: ${item}`);
    }
  }

  assertGreaterThan(actual, expected, message = '') {
    if (actual <= expected) {
      throw new Error(`Assertion failed: ${message}. Expected ${actual} > ${expected}`);
    }
  }

  // Result reporting
  displayResults() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    
    console.log('\n🧪 Validator Test Framework Results');
    console.log('===================================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(result => {
          console.log(`   ${result.validator}: ${result.testName}`);
          console.log(`      Error: ${result.details.error}`);
        });
    }
    
    // Performance summary
    const totalDuration = this.testResults.reduce((sum, r) => sum + r.details.duration, 0);
    console.log(`\n⏱️  Total Execution Time: ${totalDuration}ms`);
    console.log(`   Average Test Time: ${Math.round(totalDuration / totalTests)}ms`);
  }

  // Cleanup
  cleanup() {
    this.cleanupAllMockProjects();
  }
}

module.exports = ValidatorTestFramework;
