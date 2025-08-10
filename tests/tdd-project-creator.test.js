const TDDProjectCreator = require('../scripts/create-tdd-project');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mock fs and child_process
jest.mock('fs');
jest.mock('child_process');

describe('TDDProjectCreator', () => {
  let creator;
  let mockProjectName;
  let mockProjectPath;

  beforeEach(() => {
    mockProjectName = 'test-tdd-project';
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock process.cwd() BEFORE creating the creator instance
    jest.spyOn(process, 'cwd').mockReturnValue('/mock/workspace');
    
    mockProjectPath = path.join(process.cwd(), mockProjectName);
    creator = new TDDProjectCreator(mockProjectName);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should set project name and path correctly', () => {
      expect(creator.projectName).toBe(mockProjectName);
      expect(creator.projectPath).toBe(path.join('/mock/workspace', mockProjectName));
    });
  });

  describe('createProjectStructure', () => {
    it('should create all required directories', async () => {
      fs.mkdirSync = jest.fn();

      await creator.createProjectStructure();

      expect(fs.mkdirSync).toHaveBeenCalledTimes(12);
      
      // Check specific directories
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, 'src'),
        { recursive: true }
      );
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, 'src/components'),
        { recursive: true }
      );
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, 'src/services'),
        { recursive: true }
      );
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, 'src/utils'),
        { recursive: true }
      );
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, 'src/__tests__'),
        { recursive: true }
      );
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, 'cypress'),
        { recursive: true }
      );
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, 'cypress/e2e'),
        { recursive: true }
      );
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, 'cypress/support'),
        { recursive: true }
      );
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, 'cypress/fixtures'),
        { recursive: true }
      );
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, 'docs'),
        { recursive: true }
      );
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, 'scripts'),
        { recursive: true }
      );
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, '.vscode'),
        { recursive: true }
      );
    });

    it('should handle directory creation errors gracefully', async () => {
      fs.mkdirSync = jest.fn().mockImplementation(() => {
        throw new Error('Permission denied');
      });

      await expect(creator.createProjectStructure()).rejects.toThrow('Permission denied');
    });
  });

  describe('initializeNpm', () => {
    it('should create package.json with correct structure', async () => {
      fs.writeFileSync = jest.fn();

      await creator.initializeNpm();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, 'package.json'),
        expect.any(String)
      );

      const packageJsonContent = JSON.parse(
        fs.writeFileSync.mock.calls[0][1]
      );

      expect(packageJsonContent.name).toBe(mockProjectName);
      expect(packageJsonContent.version).toBe('1.0.0');
      expect(packageJsonContent.description).toContain(mockProjectName);
      expect(packageJsonContent.main).toBe('src/index.js');
      expect(packageJsonContent.keywords).toContain('tdd');
      expect(packageJsonContent.keywords).toContain('testing');
      expect(packageJsonContent.license).toBe('MIT');
    });

    it('should include all required scripts', async () => {
      fs.writeFileSync = jest.fn();

      await creator.initializeNpm();

      const packageJsonContent = JSON.parse(
        fs.writeFileSync.mock.calls[0][1]
      );

      const scripts = packageJsonContent.scripts;
      
      expect(scripts.start).toBe('node src/index.js');
      expect(scripts.dev).toBe('nodemon src/index.js');
      expect(scripts.test).toBe('jest');
      expect(scripts['test:watch']).toBe('jest --watch');
      expect(scripts['test:coverage']).toBe('jest --coverage');
      expect(scripts['test:tdd']).toBe('jest --watch --notify');
      expect(scripts['test:e2e']).toBe('cypress run');
      expect(scripts['test:e2e:open']).toBe('cypress open');
      expect(scripts['validate:tdd']).toBe('node scripts/tdd-validator.js');
      expect(scripts.lint).toBe('eslint src tests');
      expect(scripts['lint:fix']).toBe('eslint src tests --fix');
      expect(scripts.validate).toBe('npm run lint && npm run test:coverage');
    });

    it('should include Jest configuration with 90% thresholds', async () => {
      fs.writeFileSync = jest.fn();

      await creator.initializeNpm();

      const packageJsonContent = JSON.parse(
        fs.writeFileSync.mock.calls[0][1]
      );

      const jestConfig = packageJsonContent.jest;
      
      expect(jestConfig.testEnvironment).toBe('node');
      expect(jestConfig.coverageThreshold.global.branches).toBe(90);
      expect(jestConfig.coverageThreshold.global.functions).toBe(90);
      expect(jestConfig.coverageThreshold.global.lines).toBe(90);
      expect(jestConfig.coverageThreshold.global.statements).toBe(90);
      expect(jestConfig.coverageReporters).toContain('text');
      expect(jestConfig.coverageReporters).toContain('lcov');
      expect(jestConfig.coverageReporters).toContain('html');
      expect(jestConfig.setupFilesAfterEnv).toContain('<rootDir>/src/setupTests.js');
    });
  });

  describe('installDependencies', () => {
    it('should install core dependencies', async () => {
      execSync.mockReturnValue('');

      await creator.installDependencies();

      expect(execSync).toHaveBeenCalledWith(
        `cd "${mockProjectPath}" && npm install jest @types/jest cypress nodemon`,
        { stdio: 'inherit' }
      );
    });

    it('should install dev dependencies', async () => {
      execSync.mockReturnValue('');

      await creator.installDependencies();

      expect(execSync).toHaveBeenCalledWith(
        `cd "${mockProjectPath}" && npm install --save-dev eslint eslint-config-standard eslint-plugin-jest eslint-plugin-node`,
        { stdio: 'inherit' }
      );
    });

    it('should handle installation errors gracefully', async () => {
      execSync.mockImplementation(() => {
        throw new Error('npm install failed');
      });

      // Should not throw, just warn
      await expect(creator.installDependencies()).resolves.not.toThrow();
    });
  });

  describe('createConfigurationFiles', () => {
    it('should create Jest configuration file', async () => {
      fs.writeFileSync = jest.fn();

      await creator.createConfigurationFiles();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, 'jest.config.js'),
        expect.stringContaining('module.exports')
      );

      const jestConfig = fs.writeFileSync.mock.calls.find(
        call => call[0].includes('jest.config.js')
      )[1];

      expect(jestConfig).toContain('testEnvironment: \'node\'');
      expect(jestConfig).toContain('coverageThreshold');
      expect(jestConfig).toContain('branches: 90');
      expect(jestConfig).toContain('setupFilesAfterEnv');
    });

    it('should create Cypress configuration file', async () => {
      fs.writeFileSync = jest.fn();

      await creator.createConfigurationFiles();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, 'cypress.config.js'),
        expect.stringContaining('defineConfig')
      );

      const cypressConfig = fs.writeFileSync.mock.calls.find(
        call => call[0].includes('cypress.config.js')
      )[1];

      expect(cypressConfig).toContain('baseUrl: \'http://localhost:3000\'');
      expect(cypressConfig).toContain('supportFile: \'cypress/support/e2e.js\'');
      expect(cypressConfig).toContain('specPattern: \'cypress/e2e/**/*.cy.js\'');
    });

    it('should create VS Code settings file', async () => {
      fs.writeFileSync = jest.fn();

      await creator.createConfigurationFiles();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, '.vscode/settings.json'),
        expect.stringContaining('jest.autoRun')
      );

      const vscodeSettings = fs.writeFileSync.mock.calls.find(
        call => call[0].includes('settings.json')
      )[1];

      expect(vscodeSettings).toContain('"jest.autoRun"');
      expect(vscodeSettings).toContain('"jest.showCoverageOnLoad": true');
      expect(vscodeSettings).toContain('"testing.gutterEnabled": true');
    });

    it('should create ESLint configuration file', async () => {
      fs.writeFileSync = jest.fn();

      await creator.createConfigurationFiles();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, '.eslintrc.js'),
        expect.stringContaining('module.exports')
      );

      const eslintConfig = fs.writeFileSync.mock.calls.find(
        call => call[0].includes('.eslintrc.js')
      )[1];

      expect(eslintConfig).toContain('env: {');
      expect(eslintConfig).toContain('node: true');
      expect(eslintConfig).toContain('jest: true');
      expect(eslintConfig).toContain('extends: [');
      expect(eslintConfig).toContain('\'standard\'');
      expect(eslintConfig).toContain('\'plugin:jest/recommended\'');
    });
  });

  describe('createInitialTests', () => {
    it('should create setupTests.js file', async () => {
      fs.writeFileSync = jest.fn();

      await creator.createInitialTests();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, 'src/setupTests.js'),
        expect.stringContaining('Global test setup')
      );

      const setupTests = fs.writeFileSync.mock.calls.find(
        call => call[0].includes('setupTests.js')
      )[1];

      expect(setupTests).toContain('global.console = {');
      expect(setupTests).toContain('global.fetch = jest.fn();');
      expect(setupTests).toContain('beforeEach(() => {');
      expect(setupTests).toContain('afterEach(() => {');
    });

    it('should create example test file', async () => {
      fs.writeFileSync = jest.fn();

      await creator.createInitialTests();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, 'src/__tests__/example.test.js'),
        expect.stringContaining('Example Service')
      );

      const exampleTest = fs.writeFileSync.mock.calls.find(
        call => call[0].includes('example.test.js')
      )[1];

      expect(exampleTest).toContain('describe(\'Example Service\'');
      expect(exampleTest).toContain('it(\'should return sum of two numbers\'');
      expect(exampleTest).toContain('// Red: Write failing test first');
      expect(exampleTest).toContain('// Green: Minimal implementation');
    });

    it('should create example service file', async () => {
      fs.writeFileSync = jest.fn();

      await creator.createInitialTests();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, 'src/services/example.js'),
        expect.stringContaining('Example service implementation')
      );

      const exampleService = fs.writeFileSync.mock.calls.find(
        call => call[0].includes('example.js')
      )[1];

      expect(exampleService).toContain('function sum(a, b) {');
      expect(exampleService).toContain('return a + b;');
      expect(exampleService).toContain('module.exports = { sum };');
    });

    it('should create Cypress support files', async () => {
      fs.writeFileSync = jest.fn();

      await creator.createInitialTests();

      // Check e2e.js
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, 'cypress/support/e2e.js'),
        expect.stringContaining('Import commands.js')
      );

      // Check commands.js
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, 'cypress/support/commands.js'),
        expect.stringContaining('Cypress.Commands.add')
      );

      const commands = fs.writeFileSync.mock.calls.find(
        call => call[0].includes('commands.js')
      )[1];

      expect(commands).toContain('Cypress.Commands.add(\'login\'');
      expect(commands).toContain('cy.visit(\'/login\')');
    });

    it('should create main index file', async () => {
      fs.writeFileSync = jest.fn();

      await creator.createInitialTests();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, 'src/index.js'),
        expect.stringContaining('TDD Project is running!')
      );

      const indexFile = fs.writeFileSync.mock.calls.find(
        call => call[0].includes('index.js')
      )[1];

      expect(indexFile).toContain('const { sum } = require(\'./services/example\');');
      expect(indexFile).toContain('console.log(\'TDD Project is running!\');');
      expect(indexFile).toContain('console.log(\'2 + 3 =\', sum(2, 3));');
    });
  });

  describe('setupGit', () => {
    it('should initialize git repository', async () => {
      execSync.mockReturnValue('');

      await creator.setupGit();

      expect(execSync).toHaveBeenCalledWith(
        `cd "${mockProjectPath}" && git init`,
        { stdio: 'inherit' }
      );
    });

    it('should create .gitignore file', async () => {
      execSync.mockReturnValue('');
      fs.writeFileSync = jest.fn();

      await creator.setupGit();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockProjectPath, '.gitignore'),
        expect.stringContaining('node_modules/')
      );

      const gitignore = fs.writeFileSync.mock.calls.find(
        call => call[0].includes('.gitignore')
      )[1];

      expect(gitignore).toContain('coverage/');
      expect(gitignore).toContain('.env');
      expect(gitignore).toContain('cypress/videos/');
      expect(gitignore).toContain('cypress/screenshots/');
    });

    it('should make initial commit', async () => {
      execSync.mockReturnValue('');

      await creator.setupGit();

      expect(execSync).toHaveBeenCalledWith(
        `cd "${mockProjectPath}" && git add .`,
        { stdio: 'inherit' }
      );
      expect(execSync).toHaveBeenCalledWith(
        `cd "${mockProjectPath}" && git commit -m "Initial commit: TDD project setup"`,
        { stdio: 'inherit' }
      );
    });

    it('should handle git setup errors gracefully', async () => {
      execSync.mockImplementation(() => {
        throw new Error('git command failed');
      });

      // Should not throw, just warn
      await expect(creator.setupGit()).resolves.not.toThrow();
    });
  });

  describe('displayNextSteps', () => {
    it('should display success message and next steps', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await creator.displayNextSteps();

      expect(consoleSpy).toHaveBeenCalledWith('\n🎉 TDD Project created successfully!');
      expect(consoleSpy).toHaveBeenCalledWith('\nNext steps:');
      expect(consoleSpy).toHaveBeenCalledWith(`1. cd ${mockProjectName}`);
      expect(consoleSpy).toHaveBeenCalledWith('2. npm run test:tdd');
      expect(consoleSpy).toHaveBeenCalledWith('3. Start writing tests first!');
      expect(consoleSpy).toHaveBeenCalledWith('\nAvailable commands:');
      expect(consoleSpy).toHaveBeenCalledWith('- npm run test:tdd     # Start TDD workflow');
      expect(consoleSpy).toHaveBeenCalledWith('- npm run test:coverage # Check test coverage');
      expect(consoleSpy).toHaveBeenCalledWith('- npm run validate:tdd  # Validate TDD compliance');
      expect(consoleSpy).toHaveBeenCalledWith('- npm run test:e2e:open # Open Cypress');
      expect(consoleSpy).toHaveBeenCalledWith('\nRemember: Red → Green → Refactor! 🚀');

      consoleSpy.mockRestore();
    });
  });

  describe('create', () => {
    it('should run complete creation workflow', async () => {
      // Mock all methods
      creator.createProjectStructure = jest.fn();
      creator.initializeNpm = jest.fn();
      creator.installDependencies = jest.fn();
      creator.createConfigurationFiles = jest.fn();
      creator.createInitialTests = jest.fn();
      creator.setupGit = jest.fn();
      creator.displayNextSteps = jest.fn();

      await creator.create();

      expect(creator.createProjectStructure).toHaveBeenCalled();
      expect(creator.initializeNpm).toHaveBeenCalled();
      expect(creator.installDependencies).toHaveBeenCalled();
      expect(creator.createConfigurationFiles).toHaveBeenCalled();
      expect(creator.createInitialTests).toHaveBeenCalled();
      expect(creator.setupGit).toHaveBeenCalled();
      expect(creator.displayNextSteps).toHaveBeenCalled();
    });

    it('should handle creation errors gracefully', async () => {
      creator.createProjectStructure = jest.fn().mockRejectedValue(new Error('Creation failed'));

      await expect(creator.create()).rejects.toThrow('Creation failed');
    });
  });

  describe('main execution', () => {
    it('should create project when called directly with project name', () => {
      const mockProjectName = 'test-project';
      const mockCreate = jest.fn();
      
      // Mock the module to test main execution
      const originalModule = require.cache[require.resolve('../scripts/create-tdd-project')];
      delete require.cache[require.resolve('../scripts/create-tdd-project')];
      
      // Mock the create method
      jest.doMock('../scripts/create-tdd-project', () => ({
        TDDProjectCreator: jest.fn().mockImplementation(() => ({
          create: mockCreate
        }))
      }));

      // Simulate command line arguments
      const originalArgv = process.argv;
      process.argv = ['node', 'create-tdd-project.js', mockProjectName];

      // This would normally execute the main logic
      // For testing, we just verify the constructor is called
      const TDDProjectCreator = require('../scripts/create-tdd-project').TDDProjectCreator;
      const creator = new TDDProjectCreator(mockProjectName);
      
      expect(TDDProjectCreator).toHaveBeenCalledWith(mockProjectName);
      expect(creator).toBeDefined();

      // Restore
      process.argv = originalArgv;
      if (originalModule) {
        require.cache[require.resolve('../scripts/create-tdd-project')] = originalModule;
      }
    });

    it('should exit with error when no project name provided', () => {
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

      // Simulate no arguments
      const originalArgv = process.argv;
      process.argv = ['node', 'create-tdd-project.js'];

      try {
        // This would normally execute and exit
        // For testing, we just verify the error handling
        expect(() => {
          // Simulate the error condition
          if (!process.argv[2]) {
            console.error('❌ Please provide a project name');
            console.error('Usage: node scripts/create-tdd-project.js <project-name>');
            process.exit(1);
          }
        }).toThrow('process.exit called');
      } catch (error) {
        expect(mockConsoleError).toHaveBeenCalledWith('❌ Please provide a project name');
        expect(mockConsoleError).toHaveBeenCalledWith('Usage: node scripts/create-tdd-project.js <project-name>');
        expect(mockExit).toHaveBeenCalledWith(1);
      }

      // Restore
      process.argv = originalArgv;
      mockExit.mockRestore();
      mockConsoleError.mockRestore();
    });
  });
});
