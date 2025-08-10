<img width="1280" height="640" alt="agent-os-og" src="https://github.com/user-attachments/assets/e897628e-7063-4bab-a69a-7bb6d7ac8403" />

## Your system for spec-driven agentic development.

[Agent OS](https://buildermethods.com/agent-os) transforms AI coding agents from confused interns into productive developers. With structured workflows that capture your standards, your stack, and the unique details of your codebase, Agent OS gives your agents the specs they need to ship quality code on the first try—not the fifth.

Use it with:

✅ Claude Code, Cursor, or any other AI coding tool.

✅ New products or established codebases.

✅ Big features, small fixes, or anything in between.

✅ Any language or framework.

---

### Documentation & Installation

📖 **Complete Setup Guide**: See [SETUP-GUIDE.md](SETUP-GUIDE.md) for detailed installation and configuration instructions.

🚀 **Quick Start**: 
```bash
# Global installation (recommended)
git clone https://github.com/buildermethods/agent-os ~/.agent-os
cd ~/.agent-os && npm install

# Start with project analysis
@~/.agent-os/instructions/core/analyze-product.md
```

🔧 **New Features**:
- **Lifecycle Management**: Track and manage spec progress with automated dashboards
- **Universal Rules System**: 15 comprehensive development rules with full validation
- **Enhanced Testing Suite**: 96+ automated tests with coverage analysis
- **Comprehensive Validator Suite**: 6 validators across 2 tiers for complete quality assurance
- **Test Command**: `@~/.agent-os/instructions/core/test-lifecycle.md` to set up lifecycle management
- **Dashboard Generation**: `npm run dashboard` to generate spec status dashboards

📚 **Full Documentation**: [buildermethods.com/agent-os](https://buildermethods.com/agent-os)

## 🧪 Testing & Quality Assurance

Agent OS includes a comprehensive testing suite with 100% success rate:

```bash
# Run all tests with enhanced presentation
npm test

# Run detailed coverage analysis  
npm run coverage

# Run specific test suites
npm run test:rules        # Universal rules validation
npm run test:lifecycle    # Lifecycle management tests
npm run test:validators   # Spec and task validation

# Run comprehensive validation suite
npm run validate:all              # Run all validators (comprehensive quality check)
npm run validate:tier1            # Run Tier 1 validators (critical quality)
npm run validate:tier2            # Run Tier 2 validators (development workflow)
npm run validate:list             # List all available validators

# Run individual validators
npm run validate:code-quality     # File size, complexity, naming conventions
npm run validate:spec-adherence   # Implementation matches spec requirements
npm run validate:security         # Security vulnerabilities and best practices
npm run validate:branch-strategy  # Git workflow and branching conventions
npm run validate:testing          # Test coverage and TDD approach
npm run validate:documentation    # Documentation completeness and quality
```

**Test Coverage**:
- ✅ **14 Universal Rules** - 100% coverage with structure, content & integration tests
- ✅ **6 Core Features** - Comprehensive test suites for critical functionality  
- ✅ **96+ Individual Tests** - Automated validation across all components
- ✅ **Performance Benchmarks** - Ensures system scales efficiently

## ⚙️ Universal Rules System

Agent OS includes 15 universal development rules that apply across all projects:

**Foundation Rules (Tier 1)**:
- Documentation Standards, Modular Documentation, TypeScript Standards
- File Organization, Git Workflow, Commit Standards

**Process Rules (Tier 2)**:  
- Testing Standards, Test Organization, CI/CD Basic, Deployment Safety

**Architecture Rules (Tier 3)**:
- Tech Stack Selection, Tech Stack Documentation, Architecture Patterns, Code Organization

📖 **See [rules/README.md](rules/README.md)** for complete universal development standards.

## 🔍 Comprehensive Validation System
Agent OS includes a 6-validator quality assurance system organized into 2 tiers:

**Tier 1 - Critical Quality**:
- **Code Quality**: File size (300-line standard), complexity, duplication, naming conventions
- **Spec Adherence**: Implementation matches specification requirements exactly

**Tier 2 - Development Workflow**:
- **Security**: Vulnerability detection, hardcoded secrets, insecure patterns, OWASP compliance
- **Branch Strategy**: Git workflow, naming conventions, feature branch alignment with specs
- **Testing Completeness**: Coverage analysis (80% target), TDD approach, test type distribution
- **Documentation**: README completeness, API docs, code comments, setup instructions

**Quality Scoring**: 90%+ Excellent | 75-89% Good | 60-74% Moderate | <60% Needs Work

---

### Created by Brian Casel @ Builder Methods

Created by Brian Casel, the creator of [Builder Methods](https://buildermethods.com), where Brian helps professional software developers and teams build with AI.

Get Brian's free resources on building with AI:
- [Builder Briefing newsletter](https://buildermethods.com)
- [YouTube](https://youtube.com/@briancasel)

# Hello World Test Project

A comprehensive test application designed to validate the Agent OS validator suite and workflow, featuring advanced chaos monkey testing capabilities.

## 🚀 Features

- **Hello World Application**: Simple Express.js app for testing
- **Comprehensive Testing**: Jest-based unit and integration tests
- **Chaos Monkey Testing**: Advanced resilience and security testing
- **Security Validation**: Automated vulnerability detection
- **Performance Testing**: Load and stress testing capabilities
- **Integration Framework**: Unified testing and reporting

## 🏗️ Architecture

```
hello-world-app/
├── src/                    # Application source code
│   ├── index.js           # Main Express application
│   ├── utils.js           # Utility functions
│   └── config.js          # Configuration management
├── tests/                  # Jest test suite
│   ├── index.test.js      # Application tests
│   └── utils.test.js      # Utility function tests
├── scripts/                # Testing and automation scripts
│   ├── chaos-monkey.js    # General chaos testing
│   ├── security-chaos.js  # Security vulnerability testing
│   └── test-integration.js # Unified testing framework
├── docs/                   # Documentation
│   └── chaos-monkey-framework.md
├── reports/                # Test reports (generated)
└── package.json            # Dependencies and scripts
```

## 🛠️ Installation

### Prerequisites
- Node.js 14+
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd hello-world-app

# Install dependencies
npm install

# Start the application
npm start
```

## 🧪 Testing Framework

### Regular Testing (Jest)
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### Chaos Monkey Testing
```bash
# Run full chaos testing
npm run chaos

# Run quick chaos testing (15 seconds)
npm run chaos:quick

# Run security-focused testing
npm run chaos:security
```

### Comprehensive Testing
```bash
# Run all tests including chaos monkey
npm run test:comprehensive

# Run specific test categories
npm run test:integration:regular    # Jest tests only
npm run test:integration:chaos      # Chaos tests only
npm run test:integration:security   # Security tests only
npm run test:integration:all        # All integration tests
```

## 🐒 Chaos Monkey Framework

The Chaos Monkey Testing Framework provides comprehensive testing capabilities:

### General Chaos Testing
- **Memory Pressure**: Tests memory handling under stress
- **CPU Spikes**: Validates performance under high CPU load
- **Network Latency**: Tests timeout and retry mechanisms
- **Random Errors**: Injects various error conditions
- **Resource Exhaustion**: Tests system limits
- **Load Testing**: Validates performance under load
- **Extreme Load**: Tests under very high load conditions
- **Memory Leaks**: Detects memory leak vulnerabilities

### Security Testing
- **SQL Injection**: Tests input validation
- **XSS Attacks**: Validates output sanitization
- **Path Traversal**: Tests file access controls
- **Command Injection**: Validates command execution
- **Buffer Overflow**: Tests input size limits
- **Authentication Bypass**: Tests auth mechanisms
- **Header Injection**: Validates HTTP header handling
- **Content Type Bypass**: Tests content validation

### Configuration
```javascript
const chaosConfig = {
  baseUrl: 'http://localhost:3000',
  testDuration: 30000,        // 30 seconds
  concurrentRequests: 10,
  memoryLeakSize: 1024 * 1024, // 1MB per leak
  cpuIntensity: 1000,         // iterations
  networkDelay: 1000          // milliseconds
};
```

## 🔒 Security Features

### Input Validation
- Comprehensive input sanitization
- Path traversal protection
- Buffer overflow prevention
- Content type validation

### Error Handling
- Information disclosure prevention
- Secure error messages
- Proper HTTP status codes
- Log injection protection

### Security Headers
- Helmet.js integration
- Content Security Policy
- HSTS configuration
- XSS protection

## 📊 Reporting

### Test Reports
- **Jest Reports**: Standard Jest output with coverage
- **Chaos Monkey Reports**: JSON-based resilience testing results
- **Security Reports**: Vulnerability findings and risk assessment
- **Integration Reports**: Comprehensive testing overview

### Report Formats
- JSON (machine-readable)
- Console output (human-readable)
- Coverage reports (HTML)
- Integration summaries

### Metrics
- Test pass/fail rates
- Vulnerability counts
- Performance metrics
- Risk assessments

## 🚀 Development

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Validate code quality
npm run validate
```

### Environment Variables
Create a `.env` file based on `env.example`:
```bash
# Copy example environment file
cp env.example .env

# Edit environment variables
nano .env
```

### Adding New Tests
```javascript
// tests/new-feature.test.js
describe('New Feature', () => {
  it('should work correctly', () => {
    expect(newFeature()).toBe('expected result');
  });
});
```

### Extending Chaos Testing
```javascript
// scripts/custom-chaos.js
class CustomChaosMonkey extends ChaosMonkey {
  async runCustomTest() {
    // Custom test implementation
    console.log('Running custom test...');
  }
}
```

## 🔧 Configuration

### Application Configuration
```javascript
// src/config.js
const config = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development'
};
```

### Testing Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.js'],
  coverageDirectory: 'coverage'
};
```

### Chaos Testing Configuration
```javascript
// scripts/chaos-monkey.js
const config = {
  baseUrl: 'http://localhost:3000',
  testDuration: 30000,
  concurrentRequests: 10
};
```

## 📚 Documentation

### API Endpoints
- `GET /` - Hello World page
- `GET /api/status` - Application status
- `GET /api/user/:id` - User greeting
- `GET /health` - Health check

### Testing Documentation
- [Chaos Monkey Framework](docs/chaos-monkey-framework.md)
- [Security Testing Guide](docs/security-testing.md)
- [Performance Testing](docs/performance-testing.md)
- [Integration Testing](docs/integration-testing.md)

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

### Testing Requirements
- All new code must have tests
- Chaos monkey tests for new features
- Security validation for user inputs
- Performance testing for critical paths

### Code Standards
- Follow ESLint configuration
- Use consistent naming conventions
- Add comprehensive documentation
- Follow security best practices

## 🚨 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check if port is in use
lsof -i :3000

# Check environment variables
echo $NODE_ENV

# Check dependencies
npm install
```

#### Tests Failing
```bash
# Clear Jest cache
npm run test -- --clearCache

# Check test environment
npm run test:ci

# Verify dependencies
npm ls
```

#### Chaos Tests Not Working
```bash
# Ensure app is running
curl http://localhost:3000/health

# Check script permissions
chmod +x scripts/*.js

# Verify Node.js version
node --version
```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=chaos-monkey:*

# Run with verbose output
npm run chaos -- --debug
```

## 📈 Performance

### Benchmarks
- **Response Time**: < 100ms under normal load
- **Throughput**: 1000+ requests/second
- **Memory Usage**: < 100MB under load
- **CPU Usage**: < 80% under stress

### Optimization
- Efficient input validation
- Optimized error handling
- Minimal memory allocations
- Fast response processing

## 🔮 Future Enhancements

### Planned Features
- Machine learning-based testing
- Real-time monitoring dashboard
- Integration with CI/CD pipelines
- Automated vulnerability scanning
- Performance benchmarking tools

### Community Features
- Plugin architecture
- Community test scenarios
- Shared payload libraries
- Best practice sharing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Express.js team for the web framework
- Jest team for the testing framework
- Chaos engineering community for inspiration
- Security testing community for best practices

---

**Note**: This application is designed for testing and validation purposes. Do not use in production without proper security review and hardening.