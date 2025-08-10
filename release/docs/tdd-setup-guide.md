# TDD Setup Guide

## Overview

This guide will help you set up Test-Driven Development (TDD) for both existing and new projects. Follow the appropriate section based on your project status.

## Quick Start

```bash
# Install TDD tools
npm install --save-dev jest @testing-library/react @testing-library/jest-dom cypress

# Run TDD validation
npm run validate:tdd

# Start TDD workflow
npm run test:tdd
```

## Setup for Existing Projects

### Step 1: Install Required Dependencies

```bash
# Core testing framework
npm install --save-dev jest @types/jest

# React testing (if using React)
npm install --save-dev @testing-library/react @testing-library/jest-dom

# E2E testing
npm install --save-dev cypress

# Additional testing utilities
npm install --save-dev @testing-library/user-event @testing-library/jest-dom
```

### Step 2: Configure Jest

Create or update `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'node', // or 'jsdom' for React
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### Step 3: Create Test Setup File

Create `src/setupTests.js`:

```javascript
// For React projects
import '@testing-library/jest-dom';

// Global test utilities
global.console = {
  ...console,
  // Uncomment to ignore console.log during tests
  // log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch globally
global.fetch = jest.fn();

// Setup and teardown
beforeEach(() => {
  jest.clearAllMocks();
  fetch.mockClear();
});

afterEach(() => {
  jest.resetAllMocks();
});
```

### Step 4: Configure Cypress (E2E Testing)

Create `cypress.config.js`:

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
```

### Step 5: Add Pre-commit Hooks

Install Husky and lint-staged:

```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npm run validate:tdd && npm run lint"
npx husky add .husky/pre-push "npm run test && npm run test:e2e"
```

Update `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "jest --bail --findRelatedTests"
    ]
  }
}
```

### Step 6: Create Initial Test Structure

```bash
# Create test directories
mkdir -p src/__tests__
mkdir -p cypress/e2e
mkdir -p cypress/support
mkdir -p cypress/fixtures

# Create basic test files
touch src/__tests__/example.test.js
touch cypress/support/e2e.js
touch cypress/support/commands.js
```

### Step 7: Write Your First TDD Test

Follow the Red-Green-Refactor cycle:

```javascript
// src/__tests__/example.test.js
describe('Example Service', () => {
  describe('when calculating sum', () => {
    it('should return sum of two numbers', () => {
      // Red: Write failing test first
      const result = sum(2, 3);
      expect(result).toBe(5);
    });
  });
});

// src/services/example.js (create this after test)
function sum(a, b) {
  return a + b; // Green: Minimal implementation
}

module.exports = { sum };
```

## Setup for New Projects

### Step 1: Project Initialization

```bash
# Create new project
mkdir my-tdd-project
cd my-tdd-project

# Initialize npm
npm init -y

# Install TDD dependencies immediately
npm install --save-dev jest @types/jest @testing-library/react @testing-library/jest-dom cypress
```

### Step 2: Create Project Structure

```bash
# Create directory structure
mkdir -p src/{components,services,utils,__tests__}
mkdir -p cypress/{e2e,support,fixtures}
mkdir -p docs
mkdir -p scripts

# Create essential files
touch src/index.js
touch src/__tests__/index.test.js
touch jest.config.js
touch cypress.config.js
touch .vscode/settings.json
```

### Step 3: Configure Package.json Scripts

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:tdd": "jest --watch --notify",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "validate:tdd": "node scripts/tdd-validator.js",
    "lint": "eslint src tests",
    "lint:fix": "eslint src tests --fix"
  }
}
```

### Step 4: Start with TDD from Day One

```javascript
// 1. Write test first (Red)
// src/__tests__/calculator.test.js
describe('Calculator', () => {
  it('should add two numbers correctly', () => {
    const calculator = new Calculator();
    const result = calculator.add(2, 3);
    expect(result).toBe(5);
  });
});

// 2. Write minimal implementation (Green)
// src/services/calculator.js
class Calculator {
  add(a, b) {
    return a + b;
  }
}

// 3. Refactor while keeping tests green
// Add error handling, validation, etc.
```

## TDD Workflow Integration

### Daily TDD Workflow

1. **Start with Test** (Red)
   ```bash
   npm run test:tdd
   # Write failing test
   ```

2. **Implement to Pass** (Green)
   ```bash
   # Write minimal code to pass test
   # Watch tests pass automatically
   ```

3. **Refactor** (Refactor)
   ```bash
   # Improve code while keeping tests green
   # Tests continue to pass
   ```

### Pre-commit Validation

```bash
# Automatic TDD validation
npm run validate:tdd

# Full validation before commit
npm run validate
```

### Continuous Integration

Create `.github/workflows/tdd-validation.yml`:

```yaml
name: TDD Validation
on: [push, pull_request]

jobs:
  tdd-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run validate:tdd
      - run: npm run test:coverage
      - run: npm run test:e2e
```

## VS Code Configuration

### Install Extensions

- Jest Runner
- Jest Snippets
- Testing Library Snippets
- Cypress Snippets

### Settings (`.vscode/settings.json`)

```json
{
  "jest.autoRun": {
    "watch": false,
    "onSave": "test-file"
  },
  "jest.showCoverageOnLoad": true,
  "testing.automaticallyOpenPeekView": "never",
  "testing.gutterEnabled": true,
  "jest.coverageColors": {
    "covered": "#4caf50",
    "uncovered": "#f44336",
    "partially-covered": "#ff9800"
  }
}
```

## TDD Best Practices

### Test Organization

```
src/
├── components/
│   ├── UserCard/
│   │   ├── UserCard.tsx
│   │   ├── UserCard.test.tsx      # Co-located tests
│   │   └── UserCard.stories.tsx
├── services/
│   ├── userService.ts
│   └── userService.test.ts        # Co-located tests
└── utils/
    ├── dateUtils.ts
    └── dateUtils.test.ts          # Co-located tests
```

### Test Naming Conventions

```javascript
// ✅ Good: Describe behavior and context
describe('UserService', () => {
  describe('when creating a user', () => {
    describe('with valid data', () => {
      it('should return user with generated ID', () => {});
      it('should set creation timestamp', () => {});
    });
    
    describe('with invalid data', () => {
      it('should throw validation error for missing name', () => {});
    });
  });
});

// ❌ Poor: Vague and unhelpful
describe('UserService', () => {
  it('should work', () => {});
  it('test user creation', () => {});
});
```

### Test Structure (AAA Pattern)

```javascript
describe('UserService.createUser', () => {
  it('should create user successfully', async () => {
    // Arrange
    const userData = { name: 'John', email: 'john@example.com' };
    const mockUser = { id: '1', ...userData };
    userRepository.create.mockResolvedValue(mockUser);
    
    // Act
    const result = await userService.createUser(userData);
    
    // Assert
    expect(result).toEqual(mockUser);
    expect(userRepository.create).toHaveBeenCalledWith(userData);
  });
});
```

## Troubleshooting

### Common Issues

1. **Tests not running**
   ```bash
   # Check Jest configuration
   npm run test -- --verbose
   
   # Verify test file patterns
   npm run test -- --listTests
   ```

2. **Coverage not meeting thresholds**
   ```bash
   # Generate detailed coverage report
   npm run test:coverage
   
   # Check which files need more tests
   open coverage/lcov-report/index.html
   ```

3. **Cypress not working**
   ```bash
   # Check if app is running
   npm start
   
   # Open Cypress in another terminal
   npm run test:e2e:open
   ```

### Performance Optimization

```javascript
// jest.config.js
module.exports = {
  // Run tests in parallel
  maxWorkers: '50%',
  
  // Cache test results
  cache: true,
  
  // Only run tests for changed files
  onlyChanged: true,
  
  // Watch mode optimizations
  watchPathIgnorePatterns: [
    'node_modules',
    'coverage',
    'dist'
  ]
};
```

## Next Steps

After setup:

1. **Run TDD validation**: `npm run validate:tdd`
2. **Start with simple features**: Practice TDD on basic functionality
3. **Build test coverage**: Gradually increase coverage to 90%+
4. **Establish team workflow**: Make TDD part of daily development
5. **Regular validation**: Run validation weekly to maintain compliance

## Resources

- [TDD Standards](./../standards/tdd-standards.md)
- [Testing Standards](./../rules/testing-standards.mdc)
- [TDD Validation Command](./../commands/validate-tdd.md)
- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Cypress Documentation](https://docs.cypress.io/)

Remember: **Red → Green → Refactor**. Always write tests first!
