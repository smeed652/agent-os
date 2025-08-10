#!/usr/bin/env node

/**
 * TDD Project Creator
 * 
 * Automatically creates new projects with TDD configuration and structure.
 * Usage: node scripts/create-tdd-project.js <project-name>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TDDProjectCreator {
  constructor(projectName) {
    this.projectName = projectName;
    this.projectPath = path.join(process.cwd(), projectName);
  }

  async create() {
    console.log(`🚀 Creating TDD project: ${this.projectName}\n`);
    
    try {
      await this.createProjectStructure();
      await this.initializeNpm();
      await this.installDependencies();
      await this.createConfigurationFiles();
      await this.createInitialTests();
      await this.setupGit();
      await this.displayNextSteps();
    } catch (error) {
      console.error('❌ Project creation failed:', error.message);
      // Only exit if not in test environment
      if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
      }
      throw error; // Re-throw for testing
    }
  }

  async createProjectStructure() {
    console.log('📁 Creating project structure...');
    
    const directories = [
      'src',
      'src/components',
      'src/services',
      'src/utils',
      'src/__tests__',
      'cypress',
      'cypress/e2e',
      'cypress/support',
      'cypress/fixtures',
      'docs',
      'scripts',
      '.vscode'
    ];

    directories.forEach(dir => {
      const fullPath = path.join(this.projectPath, dir);
      fs.mkdirSync(fullPath, { recursive: true });
    });

    console.log('✅ Project structure created');
  }

  async initializeNpm() {
    console.log('📦 Initializing npm project...');
    
    const packageJson = {
      name: this.projectName,
      version: '1.0.0',
      description: `A TDD-focused ${this.projectName} project`,
      main: 'src/index.js',
      scripts: {
        start: 'node src/index.js',
        dev: 'nodemon src/index.js',
        test: 'jest',
        'test:watch': 'jest --watch',
        'test:coverage': 'jest --coverage',
        'test:tdd': 'jest --watch --notify',
        'test:e2e': 'cypress run',
        'test:e2e:open': 'cypress open',
        'validate:tdd': 'node scripts/tdd-validator.js',
        lint: 'eslint src tests',
        'lint:fix': 'eslint src tests --fix',
        validate: 'npm run lint && npm run test:coverage'
      },
      keywords: ['tdd', 'testing', 'jest', 'cypress'],
      author: 'Your Name',
      license: 'MIT',
      devDependencies: {},
      jest: {
        testEnvironment: 'node',
        collectCoverageFrom: [
          'src/**/*.js',
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
          '<rootDir>/src/**/__tests__/**/*.js',
          '<rootDir>/src/**/*.{test,spec}.js'
        ],
        setupFilesAfterEnv: ['<rootDir>/src/setupTests.js']
      }
    };

    fs.writeFileSync(
      path.join(this.projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    console.log('✅ Package.json created');
  }

  async installDependencies() {
    console.log('📥 Installing dependencies...');
    
    const dependencies = [
      'jest',
      '@types/jest',
      'cypress',
      'nodemon'
    ];

    const devDependencies = [
      'eslint',
      'eslint-config-standard',
      'eslint-plugin-jest',
      'eslint-plugin-node'
    ];

    try {
      // Install dependencies
      execSync(`cd "${this.projectPath}" && npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });
      
      // Install dev dependencies
      execSync(`cd "${this.projectPath}" && npm install --save-dev ${devDependencies.join(' ')}`, { stdio: 'inherit' });
      
      console.log('✅ Dependencies installed');
    } catch (error) {
      console.warn('⚠️  Some dependencies may not have installed correctly. You can run npm install manually.');
    }
  }

  async createConfigurationFiles() {
    console.log('⚙️  Creating configuration files...');
    
    // Jest configuration
    const jestConfig = `module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
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
    '<rootDir>/src/**/__tests__/**/*.js',
    '<rootDir>/src/**/*.{test,spec}.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js']
};`;

    fs.writeFileSync(path.join(this.projectPath, 'jest.config.js'), jestConfig);

    // Cypress configuration
    const cypressConfig = `const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
  },
});`;

    fs.writeFileSync(path.join(this.projectPath, 'cypress.config.js'), cypressConfig);

    // VS Code settings
    const vscodeSettings = `{
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
}`;

    fs.writeFileSync(path.join(this.projectPath, '.vscode/settings.json'), vscodeSettings);

    // ESLint configuration
    const eslintConfig = `module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'standard',
    'plugin:jest/recommended'
  ],
  plugins: ['jest'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error'
  }
};`;

    fs.writeFileSync(path.join(this.projectPath, '.eslintrc.js'), eslintConfig);

    console.log('✅ Configuration files created');
  }

  async createInitialTests() {
    console.log('🧪 Creating initial test files...');
    
    // Setup tests
    const setupTests = `// Global test setup
global.console = {
  ...console,
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  fetch.mockClear();
});

afterEach(() => {
  jest.resetAllMocks();
});`;

    fs.writeFileSync(path.join(this.projectPath, 'src/setupTests.js'), setupTests);

    // Example test
    const exampleTest = `describe('Example Service', () => {
  describe('when calculating sum', () => {
    it('should return sum of two numbers', () => {
      // Red: Write failing test first
      const result = sum(2, 3);
      expect(result).toBe(5);
    });
  });
});

// This function will be implemented in the next step
function sum(a, b) {
  // Green: Minimal implementation
  return a + b;
}

module.exports = { sum };`;

    fs.writeFileSync(path.join(this.projectPath, 'src/__tests__/example.test.js'), exampleTest);

    // Example implementation
    const exampleService = `// Example service implementation
function sum(a, b) {
  return a + b;
}

module.exports = { sum };`;

    fs.writeFileSync(path.join(this.projectPath, 'src/services/example.js'), exampleService);

    // Cypress support file
    const cypressSupport = `// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')`;

    fs.writeFileSync(path.join(this.projectPath, 'cypress/support/e2e.js'), cypressSupport);

    // Cypress commands
    const cypressCommands = `// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/dashboard');
});`;

    fs.writeFileSync(path.join(this.projectPath, 'cypress/support/commands.js'), cypressCommands);

    // Main index file
    const indexFile = `const { sum } = require('./services/example');

console.log('TDD Project is running!');
console.log('2 + 3 =', sum(2, 3));

module.exports = { sum };`;

    fs.writeFileSync(path.join(this.projectPath, 'src/index.js'), indexFile);

    console.log('✅ Initial test files created');
  }

  async setupGit() {
    console.log('🔧 Setting up Git repository...');
    
    try {
      execSync(`cd "${this.projectPath}" && git init`, { stdio: 'inherit' });
      
      // Create .gitignore
      const gitignore = `node_modules/
coverage/
.nyc_output/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
cypress/videos/
cypress/screenshots/
.vscode/
*.log`;

      fs.writeFileSync(path.join(this.projectPath, '.gitignore'), gitignore);
      
      // Initial commit
      execSync(`cd "${this.projectPath}" && git add .`, { stdio: 'inherit' });
      execSync(`cd "${this.projectPath}" && git commit -m "Initial commit: TDD project setup"`, { stdio: 'inherit' });
      
      console.log('✅ Git repository initialized');
    } catch (error) {
      console.warn('⚠️  Git setup failed. You can initialize manually with: git init');
    }
  }

  async displayNextSteps() {
    console.log('\n🎉 TDD Project created successfully!');
    console.log('\nNext steps:');
    console.log(`1. cd ${this.projectName}`);
    console.log('2. npm run test:tdd');
    console.log('3. Start writing tests first!');
    console.log('\nAvailable commands:');
    console.log('- npm run test:tdd     # Start TDD workflow');
    console.log('- npm run test:coverage # Check test coverage');
    console.log('- npm run validate:tdd  # Validate TDD compliance');
    console.log('- npm run test:e2e:open # Open Cypress');
    console.log('\nRemember: Red → Green → Refactor! 🚀');
  }
}

// Main execution
if (require.main === module) {
  const projectName = process.argv[2];
  
  if (!projectName) {
    console.error('❌ Please provide a project name');
    console.error('Usage: node scripts/create-tdd-project.js <project-name>');
    process.exit(1);
  }
  
  const creator = new TDDProjectCreator(projectName);
  creator.create().catch(console.error);
}

module.exports = TDDProjectCreator;
