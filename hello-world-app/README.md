# Hello World App

> **Agent-OS Hello World Test Application - Repeatable Development Process**

A simple, production-ready Hello World application built with Express.js that serves as a validation framework for our development workflow. This application can be reset, rebuilt, and tested repeatedly to ensure process consistency and quality.

## 🎯 Overview

This Hello World application is designed to be a repeatable process for building and testing web applications. It includes:

- **Core Application**: Express.js server with Hello World endpoints
- **Comprehensive Testing**: Unit, integration, performance, and security tests
- **Build Automation**: Scripts for building, testing, and deployment
- **Reset Capability**: Ability to completely reset and rebuild from scratch
- **Process Validation**: Tools to verify the entire development workflow

## 🚀 Quick Start

### Prerequisites

- Node.js 16.0.0 or higher
- npm 8.0.0 or higher

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd hello-world-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 📚 Available Scripts

### Development
- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server

### Testing
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:unit` - Run only unit tests
- `npm run test:integration` - Run only integration tests
- `npm run test:performance` - Run only performance tests
- `npm run test:security` - Run only security tests

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

### Build and Deployment
- `npm run build` - Build application for production
- `npm run validate` - Run comprehensive validation

### Process Management
- `npm run reset` - Reset project to clean state
- `npm run rebuild` - Reset and rebuild from scratch

## 🏗️ Project Structure

```
hello-world-app/
├── src/                          # Source code
│   ├── index.js                  # Main Express server
│   ├── config.js                 # Configuration management
│   ├── utils.js                  # Utility functions
│   └── middleware/               # Custom middleware
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   ├── performance/              # Performance tests
│   ├── security/                 # Security tests
│   └── setup.js                  # Test setup
├── scripts/                      # Automation scripts
│   ├── build.js                  # Build script
│   ├── reset.js                  # Reset script
│   ├── rebuild.js                # Rebuild script
│   └── validate.js               # Validation script
├── docs/                         # Documentation
├── package.json                  # Dependencies and scripts
├── jest.config.js                # Jest configuration
└── README.md                     # This file
```

## 🌐 API Endpoints

### Root Endpoint
- **GET /** - Returns Hello World HTML page
- **Response**: HTML page with "Hello World" message

### Status Endpoint
- **GET /api/status** - Returns application status
- **Response**: JSON with application status and metadata

### User Endpoint
- **GET /api/user/:id** - Returns personalized greeting
- **Parameters**: `id` - User identifier
- **Response**: JSON with personalized greeting message

## 🧪 Testing

### Test Categories

1. **Unit Tests** (`tests/unit/`)
   - Test individual functions and modules
   - Fast execution, isolated testing
   - Covers utility functions and configuration

2. **Integration Tests** (`tests/integration/`)
   - Test API endpoints and middleware
   - Uses supertest for HTTP testing
   - Validates complete request/response cycles

3. **Performance Tests** (`tests/performance/`)
   - Response time validation
   - Concurrent request handling
   - Memory usage monitoring
   - Load testing scenarios

4. **Security Tests** (`tests/security/`)
   - Input validation testing
   - XSS prevention
   - SQL injection protection
   - Path traversal prevention
   - Security header validation

### Running Tests

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:unit
npm run test:integration
npm run test:performance
npm run test:security

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Test Coverage

The project maintains a minimum of 90% test coverage across:
- Branches: 90%
- Functions: 90%
- Lines: 90%
- Statements: 90%

## 🔧 Development Process

### 1. Project Setup
- Initialize project structure
- Install dependencies
- Configure development tools

### 2. Core Development
- Implement Express.js server
- Create API endpoints
- Add middleware and utilities

### 3. Testing Implementation
- Set up Jest testing framework
- Write comprehensive test suites
- Ensure high test coverage

### 4. Build Automation
- Create build scripts
- Implement testing automation
- Add quality checks

### 5. Process Validation
- Test reset and rebuild capabilities
- Validate development workflow
- Document process steps

## 🔄 Repeatable Process

This application is designed to be a repeatable development process. You can:

1. **Reset**: Run `npm run reset` to clean the project completely
2. **Rebuild**: Run `npm run rebuild` to reset and rebuild from scratch
3. **Validate**: Run `npm run validate` to ensure all standards are met

This process validates our development workflow and ensures consistency across multiple iterations.

## 📊 Validation

The application includes comprehensive validation against Agent-OS standards:

- **Code Quality**: ESLint compliance, file structure validation
- **Security**: Vulnerability scanning, input validation testing
- **Testing**: Test coverage, test execution validation
- **Documentation**: README completeness, documentation structure
- **Spec Adherence**: Requirements compliance verification

Run validation with:
```bash
npm run validate
```

## 🚀 Deployment

### Production Build

```bash
# Create production build
npm run build

# The build directory contains the production-ready application
cd build
npm start
```

### Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production/test)
- `LOG_LEVEL` - Logging level (default: info)
- `ENABLE_REQUEST_LOGGING` - Enable request logging (default: true)

## 🤝 Contributing

1. Follow the established development process
2. Ensure all tests pass before submitting
3. Maintain test coverage above 90%
4. Follow code quality standards
5. Update documentation as needed

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the port in environment variables
   - Kill existing processes using the port

2. **Tests failing**
   - Ensure all dependencies are installed
   - Check test environment configuration
   - Verify test data and mocks

3. **Build failures**
   - Check for linting errors
   - Ensure all tests pass
   - Verify file permissions

### Getting Help

- Check the test output for specific error messages
- Review the validation results
- Consult the development process documentation
- Use the reset/rebuild scripts to start fresh

## 🔗 Related Documentation

- [Agent-OS Development Process](./docs/development-process.md)
- [Testing Guidelines](./docs/testing.md)
- [Build Process](./docs/build-process.md)
- [Security Guidelines](./docs/security.md)

---

**Built with ❤️ by the Agent-OS Development Team**

This application serves as a foundation for validating our development workflow and ensuring consistent quality across all projects.
