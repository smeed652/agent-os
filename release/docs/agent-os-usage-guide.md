# Agent-OS Usage Guide - Cross-Project Validation

> Type: Documentation
> Agent-OS Version: 2.0.0
> Created: 2025-08-10
> Last Updated: 2025-08-10
> Status: Active
> Author: Agent-OS
> Reviewers: TBD

## Overview

This guide demonstrates how to validate and use Agent-OS from any project directory on your system. Agent-OS is now globally installed and can create, update, and manage documents with automatic version tracking.

## Prerequisites

- Agent-OS must be globally installed (already done)
- You can run commands from any directory
- No need to be in the `~/.agent-os` directory

## Validation Commands

### 1. **Check Global Installation**
```bash
# From any directory, verify Agent-OS is available
agent-os --version
agent-os help
```

### 2. **Show Agent-OS Version**
```bash
# Display current Agent-OS version
agent-os doc version
```

### 3. **Test Command Availability**
```bash
# Verify all commands are accessible
agent-os spec --help
agent-os doc --help
```

## Creating Documents from Other Projects

### **Basic Spec Creation**
```bash
# Navigate to any project
cd ~/my-other-project
cd ~/work/client-project
cd ~/personal/learning-project

# Create a new specification
agent-os spec create feature-name "Feature Title"
```

### **Example: Create API Documentation**
```bash
cd ~/my-api-project
agent-os spec create user-api "User Management API Specification"
```

### **Example: Create Database Schema**
```bash
cd ~/my-database-project
agent-os spec create user-schema "User Database Schema Design"
```

### **Example: Create Testing Plan**
```bash
cd ~/my-testing-project
agent-os spec create e2e-tests "End-to-End Testing Strategy"
```

## Document Management Commands

### **Update Existing Documents**
```bash
# Update a specific document
agent-os spec update path/to/spec.md

# Update by relative path
agent-os spec update specs/my-feature/spec.md
```

### **Batch Update All Documents**
```bash
# Update all markdown files in current directory
agent-os doc batch . "**/*.md"

# Update only specs
agent-os doc batch . "specs/**/*.md"

# Update with custom pattern
agent-os doc batch . "docs/**/*.md"
```

## Validation Steps for Your Other Project

### **Step 1: Navigate to Your Other Project**
```bash
cd ~/your-other-project
pwd
```

### **Step 2: Verify Agent-OS is Available**
```bash
agent-os help
```

### **Step 3: Create a Test Document**
```bash
agent-os spec create test-validation "Test Document for Agent-OS Validation"
```

### **Step 4: Check the Created Document**
```bash
ls -la
cat 2025-08-10-test-validation/spec.md | head -20
```

### **Step 5: Verify Version Information**
```bash
grep "Agent-OS Version" 2025-08-10-test-validation/spec.md
```

### **Step 6: Update the Document**
```bash
agent-os spec update 2025-08-10-test-validation/spec.md
```

### **Step 7: Clean Up (Optional)**
```bash
rm -rf 2025-08-10-test-validation
```

## Expected Results

### **Successful Validation Should Show:**
- ✅ Commands work from any directory
- ✅ Documents are created with proper structure
- ✅ Agent-OS version 2.0.0 is automatically injected
- ✅ Date stamps are current
- ✅ Directory structure is created automatically

### **Document Structure Created:**
```
2025-08-10-test-validation/
└── spec.md
    ├── Title
    ├── Agent-OS Version: 2.0.0
    ├── Creation Date
    ├── Standard Sections
    └── Placeholder Content
```

## Troubleshooting

### **Command Not Found**
```bash
# Reinstall globally from Agent-OS directory
cd ~/.agent-os
npm run install:global
```

### **Permission Issues**
```bash
# Check npm global installation
npm list -g agent-os
npm config get prefix
```

### **Version Mismatch**
```bash
# Update Agent-OS
cd ~/.agent-os
git pull
npm run install:global
```

## Advanced Usage

### **Custom Document Types**
```bash
# Create different document types
agent-os doc create my-doc "My Document" doc
agent-os doc create my-rule "My Rule" rule
agent-os doc create my-standard "My Standard" standard
```

### **Integration with Existing Projects**
```bash
# Add to existing specs directory
cd ~/existing-project
agent-os spec create new-feature "New Feature Spec"
# Will create: specs/2025-08-10-new-feature/spec.md
```

## Framework Release Process

### **Full Release (Recommended)**
```bash
# From Agent-OS directory, create complete release package
npm run release
```

This command:
- ✅ Validates the entire framework
- 🏗️ Builds the Hello World app
- 📦 Creates production-ready release package
- 📚 Updates all documentation
- 🌍 Includes built Hello World app in release

### **Quick Release (Development)**
```bash
# For faster releases during development
npm run release:quick
```

This command:
- ⚡ Skips comprehensive validation
- 🏗️ Builds the Hello World app
- 📦 Creates minimal release package
- 🌍 Includes built Hello World app

### **Release Output**
Both commands create a `release/` directory containing:
- Complete Agent-OS framework
- Built Hello World app (ready to run)
- Production-ready package.json
- Release documentation and summaries
- Installation instructions

### **Using the Release Package**
```bash
# Navigate to release directory
cd release

# Install dependencies
npm install

# Start the framework
npm start

# Run validation
npm run validate:all

# Check version
npm run doc:version

# Create specifications
npm run create:spec
```

## Success Criteria

Your validation is successful when:
1. ✅ `agent-os` command works from any directory
2. ✅ Documents are created with proper Agent-OS versioning
3. ✅ Directory structures are created automatically
4. ✅ Version information is current and accurate
5. ✅ Commands provide helpful feedback and error messages

## Next Steps

After successful validation:
1. Use Agent-OS for all new project specifications
2. Update existing documents with `agent-os doc batch`
3. Integrate into your development workflow
4. Share with team members for consistent documentation

---

**Need Help?** Run `agent-os help` from any directory for command assistance.
