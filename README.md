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