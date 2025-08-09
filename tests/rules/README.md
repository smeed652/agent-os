# Universal Rules Test Suite

## Overview

Comprehensive testing framework for Agent OS Universal Rules system, ensuring all `.mdc` files are valid, consistent, and properly integrated.

## Test Categories

### 1. **Rule Structure Tests**
- Validate `.mdc` file format and metadata
- Check required sections and content structure
- Verify `alwaysApply` flag consistency

### 2. **Content Validation Tests**
- Ensure rule content is actionable and specific
- Validate code examples compile/execute
- Check cross-references and links

### 3. **Integration Tests**
- Test rule application in spec creation
- Verify rule conflicts are detected
- Test rule precedence and inheritance

### 4. **Performance Tests**
- Measure rule parsing and application speed
- Test with large numbers of rules
- Memory usage validation

### 5. **Compatibility Tests**
- Test rules work across different tech stacks
- Validate universal applicability claims
- Check rule interactions with existing Agent OS

## Test Execution

```bash
# Run all rule tests
npm run test:rules

# Run specific test category
npm run test:rules:structure
npm run test:rules:content
npm run test:rules:integration
npm run test:rules:performance
```

## Test Data

Each test uses controlled scenarios in `scenarios/` directory:
- Valid rule examples
- Invalid rule examples  
- Edge cases and boundary conditions
- Real-world integration scenarios
