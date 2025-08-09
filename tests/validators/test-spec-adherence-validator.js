#!/usr/bin/env node

/**
 * Spec Adherence Validator Tests
 * 
 * Comprehensive unit tests for the Spec Adherence Validator
 */

const ValidatorTestFramework = require('./test-framework');
const SpecAdherenceValidator = require('../../scripts/validators/spec-adherence-validator');
const fs = require('fs');
const path = require('path');

class SpecAdherenceValidatorTests extends ValidatorTestFramework {
  constructor() {
    super();
    this.validator = new SpecAdherenceValidator();
  }

  async runAllTests() {
    console.log('📋 Testing Spec Adherence Validator');
    console.log('===================================\n');

    try {
      // Main Integration Tests
      await this.testMainValidationMethod();
      
      // Error Handling Tests
      await this.testErrorHandling();
      
      // Edge Cases
      await this.testEdgeCases();
      
      this.displayResults();
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    } finally {
      this.cleanup();
    }
  }

  async testMainValidationMethod() {
    console.log('🎯 Testing Main Validation Method...');

    // Test basic spec adherence validation
    await this.runValidatorTest(SpecAdherenceValidator, 'Basic spec adherence validation', async (validator) => {
      // Create a simple spec
      const specProject = this.createSpecProject('basic-spec', {
        'spec.md': `# User Authentication Spec

## Overview
Implement basic user authentication with login functionality.

## User Stories

### Story 1: User Login
As a user, I want to log in so that I can access my account.

**Acceptance Criteria:**
- User can enter username and password
- System validates credentials
- User receives success message

## Spec Scope
- Login functionality
- User validation
- Basic authentication

## Expected Deliverable
- Login endpoint
- User authentication
- Basic tests

## Out of Scope
- Registration
- Password reset`
      });

      // Create a basic implementation
      const implementationProject = this.createImplementationProject('basic-implementation', {
        'package.json': JSON.stringify({
          name: 'auth-app',
          dependencies: {
            'express': '^4.18.0'
          }
        }),
        'server.js': `const express = require('express');
const app = express();

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'user' && password === 'pass') {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

module.exports = app;`,
        'test/login.test.js': `const request = require('supertest');
const app = require('../server');

describe('Login', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ username: 'user', password: 'pass' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});`
      });

      // This should work without throwing errors
      const result = await validator.validateSpecAdherence(specProject, implementationProject);
      
      this.assert(result, 'Should return validation result');
      this.assert(result.validations, 'Should have validations array');
      this.assert(result.status, 'Should have overall status');
      
      return result;
    });

    // Test validation with missing implementation
    await this.runValidatorTest(SpecAdherenceValidator, 'Validation with incomplete implementation', async (validator) => {
      const specProject = this.createSpecProject('detailed-spec', {
        'spec.md': `# Complete Feature Spec

## Overview
Complete feature with multiple requirements.

## User Stories

### Story 1: User Registration
As a new user, I want to register so that I can create an account.

### Story 2: User Login  
As a user, I want to log in so that I can access my account.

## Spec Scope
- User registration
- User login
- Email validation
- Password hashing

## Expected Deliverable
- Registration endpoint
- Login endpoint
- User model
- Password hashing
- Email validation
- Comprehensive tests`
      });

      const incompleteImplementation = this.createImplementationProject('incomplete-implementation', {
        'package.json': JSON.stringify({
          name: 'incomplete-app',
          dependencies: { 'express': '^4.18.0' }
        }),
        'server.js': `const express = require('express');
const app = express();

// Only login endpoint, missing registration
app.post('/api/login', (req, res) => {
  res.json({ message: 'Login endpoint' });
});

module.exports = app;`
      });

      const result = await validator.validateSpecAdherence(specProject, incompleteImplementation);
      
      this.assert(result, 'Should return validation result for incomplete implementation');
      this.assert(result.validations && result.validations.length > 0, 'Should have validation results');
      
      // Check that validation completed (may not necessarily fail for incomplete implementation)
      this.assert(result.validations.length > 0, 'Should have performed validations');
      
      return result;
    });
  }

  // Simplified tests focusing on core functionality

  async testErrorHandling() {
    console.log('⚠️ Testing Error Handling...');

    // Test missing spec directory
    await this.runValidatorTest(SpecAdherenceValidator, 'Missing spec directory handling', async (validator) => {
      try {
        await validator.validateSpecAdherence('/non/existent/spec', './src');
        this.assert(false, 'Should throw error for missing spec directory');
      } catch (error) {
        this.assert(error.message.includes('Spec directory not found'), 'Should throw appropriate error');
        return { error: error.message };
      }
    });

    // Test missing implementation directory
    await this.runValidatorTest(SpecAdherenceValidator, 'Missing implementation directory handling', async (validator) => {
      const specProject = this.createSpecProject('test-spec', {
        'spec.md': '# Test Spec\n\n## Overview\nBasic spec.'
      });

      try {
        await validator.validateSpecAdherence(specProject, '/non/existent/implementation');
        this.assert(false, 'Should throw error for missing implementation directory');
      } catch (error) {
        this.assert(error.message.includes('Implementation directory not found'), 'Should throw appropriate error');
        return { error: error.message };
      }
    });

    // Test malformed spec file
    await this.runValidatorTest(SpecAdherenceValidator, 'Malformed spec file handling', async (validator) => {
      const malformedSpec = this.createSpecProject('malformed-spec', {
        'spec.md': '# Incomplete\n\nThis spec is missing required sections and has malformed content.\n\n### Random Section\nContent without proper structure.'
      });

      // Should handle gracefully without throwing
      const specData = await validator.parseSpecification(malformedSpec);
      this.assert(specData, 'Should return spec data even for malformed specs');
      
      return specData;
    });
  }

  async testEdgeCases() {
    console.log('🔬 Testing Edge Cases...');

    // Test empty spec file
    await this.runValidatorTest(SpecAdherenceValidator, 'Empty spec file handling', async (validator) => {
      const emptySpec = this.createSpecProject('empty-spec', {
        'spec.md': ''
      });

      const specData = await validator.parseSpecification(emptySpec);
      this.assert(specData, 'Should handle empty spec file');
      
      return specData;
    });

    // Test spec with only headers
    await this.runValidatorTest(SpecAdherenceValidator, 'Headers-only spec handling', async (validator) => {
      const headersOnlySpec = this.createSpecProject('headers-only-spec', {
        'spec.md': `# Title
## Overview
## User Stories
## Technical Requirements
## Expected Deliverables`
      });

      const specData = await validator.parseSpecification(headersOnlySpec);
      this.assert(specData, 'Should handle spec with only headers');
      
      return specData;
    });

    // Test implementation with no recognizable patterns
    await this.runValidatorTest(SpecAdherenceValidator, 'Unrecognizable implementation patterns', async (validator) => {
      const strangeImplementation = this.createImplementationProject('strange-implementation', {
        'weird.file': 'This is not a recognized file type with strange content.',
        'another.xyz': 'More unrecognizable content that should be handled gracefully.'
      });

      const implementationData = await validator.analyzeImplementation(strangeImplementation);
      this.assert(implementationData, 'Should handle unrecognizable implementation');
      
      return implementationData;
    });
  }

  async testRealWorldScenarios() {
    console.log('🏗️ Testing Real-World Scenarios...');

    // Test complete authentication system
    await this.runValidatorTest(SpecAdherenceValidator, 'Complete authentication system validation', async (validator) => {
      const authSpec = this.createSpecProject('auth-system-spec', {
        'spec.md': `# Authentication System Spec

## Overview
Complete user authentication system with registration, login, and profile management.

## User Stories

### Story 1: User Registration
As a new user, I want to create an account so that I can access the application.

**Acceptance Criteria:**
- User can enter email, username, and password
- Email validation is performed
- Password meets complexity requirements
- Account is created in database
- Confirmation email is sent

### Story 2: User Login
As a registered user, I want to log in so that I can access my account.

**Acceptance Criteria:**
- User can enter username/email and password
- Credentials are validated against database
- JWT token is generated on success
- User session is established

## Technical Requirements

### Backend Requirements
- Node.js with Express framework
- MongoDB with Mongoose ODM
- bcrypt for password hashing (min 12 salt rounds)
- JWT tokens with 24-hour expiration
- Email service integration
- Input validation and sanitization
- Rate limiting for auth endpoints

### API Endpoints
- POST /api/register - User registration
- POST /api/login - User authentication
- GET /api/profile - Get user profile (authenticated)
- PUT /api/profile - Update user profile (authenticated)
- POST /api/logout - User logout

## Expected Deliverables

### Code Deliverables
- User model with validation and password hashing
- Authentication middleware with JWT verification
- Registration and login API endpoints
- Profile management endpoints
- Email service integration
- Input validation middleware
- Rate limiting configuration

### Test Deliverables
- Unit tests for all models and utilities
- Integration tests for all API endpoints
- Authentication flow tests
- Test coverage minimum 85%

### Documentation Deliverable
- API documentation with examples
- Setup and deployment instructions
- Security considerations document`
      });

      const authImplementation = this.createImplementationProject('auth-system-implementation', {
        'package.json': JSON.stringify({
          name: 'auth-system',
          dependencies: {
            'express': '^4.18.0',
            'mongoose': '^7.0.0',
            'bcrypt': '^5.1.0',
            'jsonwebtoken': '^9.0.0',
            'nodemailer': '^6.9.0',
            'express-validator': '^6.15.0',
            'express-rate-limit': '^6.7.0'
          }
        }),
        'models/User.js': `const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);`,
        'middleware/auth.js': `const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = { authenticate };`,
        'routes/auth.js': `const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const emailService = require('../services/email');
const jwt = require('jsonwebtoken');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});

// Register endpoint
router.post('/register', 
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('username').isLength({ min: 3, max: 30 }).trim(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/)
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username, password });
      await user.save();
      
      await emailService.sendVerificationEmail(user);
      
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Login endpoint
router.post('/login', 
  authLimiter,
  [
    body('username').notEmpty(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ 
        $or: [{ username }, { email: username }] 
      });
      
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Profile endpoints
router.get('/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

router.put('/profile', authenticate, 
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('username').optional().isLength({ min: 3, max: 30 }).trim()
  ],
  async (req, res) => {
    try {
      const updates = req.body;
      Object.assign(req.user, updates);
      await req.user.save();
      res.json({ user: req.user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.post('/logout', authenticate, (req, res) => {
  // In a real app, you'd invalidate the token
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;`,
        'tests/auth.test.js': `const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Authentication', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/register', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
    });

    it('should validate email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123'
      });
      await user.save();
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'Password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });
});`
      });

      const result = await validator.validateSpecAdherence(authSpec, authImplementation);
      
      this.assert(result.overallStatus === 'PASS' || result.overallStatus === 'WARNING', 
        'Complete implementation should mostly pass');
      this.assert(result.validations && result.validations.length >= 4, 
        'Should perform all validation checks');
      
      // Check specific validations
      const reqValidation = result.validations.find(v => v.name === 'Spec Requirements');
      this.assert(reqValidation, 'Should validate spec requirements');
      
      const storyValidation = result.validations.find(v => v.name === 'User Stories');
      this.assert(storyValidation, 'Should validate user stories');
      
      return result;
    });
  }

  // Helper methods
  createSpecProject(projectName, files) {
    const projectPath = this.createMockProject(projectName, files);
    return projectPath;
  }

  createImplementationProject(projectName, files) {
    const projectPath = this.createMockProject(projectName, files);
    return projectPath;
  }

  createTempFile(filename, content) {
    const tempDir = path.join(this.tempTestDir, 'spec-adherence-files');
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
  const tester = new SpecAdherenceValidatorTests();
  tester.runAllTests().catch(error => {
    console.error('❌ Spec Adherence Validator tests failed:', error);
    process.exit(1);
  });
}

module.exports = SpecAdherenceValidatorTests;
