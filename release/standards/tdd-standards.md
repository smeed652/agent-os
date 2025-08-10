# Test-Driven Development (TDD) Standards

## Overview

**Mandatory TDD adoption** for all Agent OS projects. This document defines the Red-Green-Refactor cycle and ensures consistent TDD implementation across all development work.

## TDD Philosophy

### Core Principles
- **Tests First**: Write tests before implementation code
- **Red-Green-Refactor**: Follow the three-phase TDD cycle strictly
- **Test Coverage**: Maintain high test coverage for all business logic
- **Regression Prevention**: Tests must catch regressions before they reach production

### Why TDD is Mandatory
- **Quality Assurance**: Prevents bugs from reaching production
- **Design Improvement**: Forces better code design and architecture
- **Documentation**: Tests serve as living documentation
- **Confidence**: Enables safe refactoring and changes
- **Cost Reduction**: Catches issues early in development cycle

## TDD Workflow (Red-Green-Refactor)

### Phase 1: Red (Write Failing Test)
```typescript
// 1. Write a test that describes the desired behavior
// 2. The test should FAIL initially (Red)
// 3. This defines the interface and expected behavior

describe('UserService', () => {
  it('should create a new user with valid data', async () => {
    // Arrange
    const userData = { name: 'John Doe', email: 'john@example.com' };
    
    // Act
    const result = await userService.createUser(userData);
    
    // Assert
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('John Doe');
    expect(result.email).toBe('john@example.com');
  });
});
```

**Red Phase Requirements:**
- Test must fail initially (Red)
- Test describes the desired behavior, not implementation
- Test is specific and focused on one behavior
- Test uses clear, descriptive naming

### Phase 2: Green (Write Minimal Implementation)
```typescript
// 2. Write the minimal code to make the test pass
// 3. Focus ONLY on making the test green
// 4. Don't over-engineer or add features not tested

class UserService {
  async createUser(userData: CreateUserData): Promise<User> {
    // Minimal implementation to pass the test
    return {
      id: '1', // Hardcoded for now
      name: userData.name,
      email: userData.email,
      createdAt: new Date()
    };
  }
}
```

**Green Phase Requirements:**
- Write minimal code to pass the test
- Don't add features not covered by tests
- Don't optimize or refactor yet
- Focus solely on test passing

### Phase 3: Refactor (Improve Code Quality)
```typescript
// 3. Refactor the code while keeping tests green
// 4. Improve design, remove duplication, optimize
// 5. All tests must remain passing

class UserService {
  async createUser(userData: CreateUserData): Promise<User> {
    // Refactored implementation
    const user = {
      id: this.generateUserId(),
      name: userData.name,
      email: userData.email,
      createdAt: new Date()
    };
    
    // Validate user data
    this.validateUserData(userData);
    
    return user;
  }
  
  private generateUserId(): string {
    return crypto.randomUUID();
  }
  
  private validateUserData(data: CreateUserData): void {
    if (!data.name || !data.email) {
      throw new Error('Name and email are required');
    }
  }
}
```

**Refactor Phase Requirements:**
- All tests must remain passing
- Improve code design and architecture
- Remove code duplication
- Add proper error handling
- Optimize performance if needed

## TDD Implementation Rules

### Mandatory TDD for All Features
```typescript
// ❌ WRONG: Writing implementation first
class UserService {
  async createUser(userData: any) {
    // Implementation without tests
    return await database.users.create(userData);
  }
}

// ✅ CORRECT: Writing tests first
describe('UserService.createUser', () => {
  it('should create user successfully', async () => {
    // Test first, then implementation
  });
});
```

### Test Coverage Requirements
- **Unit Tests**: 90%+ coverage for all business logic
- **Integration Tests**: 100% coverage for all workflows
- **Edge Cases**: All error conditions must be tested
- **Boundary Conditions**: Test limits and edge cases

### Test Naming Standards
```typescript
// ✅ Good TDD test names
describe('UserService', () => {
  describe('when creating a user', () => {
    describe('with valid data', () => {
      it('should return user with generated ID', () => {});
      it('should set creation timestamp', () => {});
    });
    
    describe('with invalid data', () => {
      it('should throw validation error for missing name', () => {});
      it('should throw validation error for invalid email', () => {});
    });
  });
});

// ❌ Poor test names
describe('UserService', () => {
  it('should work', () => {});
  it('test user creation', () => {});
});
```

## TDD for Different Development Scenarios

### New Feature Development
1. **Write failing test** for the feature
2. **Implement minimal code** to pass the test
3. **Add more tests** for edge cases and error conditions
4. **Refactor** implementation while maintaining all tests
5. **Repeat** for additional feature requirements

### Bug Fixes
1. **Write failing test** that reproduces the bug
2. **Verify test fails** (Red phase)
3. **Fix the bug** to make test pass (Green phase)
4. **Refactor** if needed while keeping test green
5. **Add regression tests** to prevent future occurrences

### Refactoring Existing Code
1. **Ensure comprehensive test coverage** exists
2. **Run all tests** to verify current state
3. **Make refactoring changes** incrementally
4. **Run tests after each change** to catch regressions
5. **Continue until refactoring complete**

## TDD Tools and Setup

### Required Testing Framework
```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^5.16.0",
    "cypress": "^12.0.0"
  },
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open"
  }
}
```

### IDE Configuration
```json
// .vscode/settings.json
{
  "jest.autoRun": {
    "watch": false,
    "onSave": "test-file"
  },
  "jest.showCoverageOnLoad": true,
  "testing.automaticallyOpenPeekView": "never",
  "testing.gutterEnabled": true
}
```

### Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:coverage && npm run lint",
      "pre-push": "npm run test && npm run test:e2e"
    }
  }
}
```

## TDD Validation and Enforcement

### Automated Checks
- **Pre-commit**: Tests must pass before commit
- **Pre-push**: Full test suite must pass before push
- **CI/CD**: All tests must pass before deployment
- **Coverage Reports**: Minimum coverage thresholds enforced

### Manual Validation
- **Code Reviews**: Tests reviewed alongside implementation
- **TDD Checklist**: Verify TDD workflow was followed
- **Test Quality**: Ensure tests are meaningful and maintainable

### TDD Checklist for Code Reviews
- [ ] Tests written before implementation?
- [ ] Tests cover all business logic?
- [ ] Tests include edge cases and error conditions?
- [ ] Test names clearly describe behavior?
- [ ] Tests are independent and isolated?
- [ ] Test coverage meets requirements?
- [ ] Implementation follows TDD cycle?

## Common TDD Anti-patterns

### ❌ Don't Do This
```typescript
// Writing implementation first
class UserService {
  async createUser(userData: any) {
    // Implementation without tests
    return await database.users.create(userData);
  }
}

// Adding tests after implementation
describe('UserService', () => {
  it('should work', () => {
    // Vague test that doesn't validate behavior
    expect(new UserService()).toBeDefined();
  });
});

// Testing implementation details
it('should call database.create once', () => {
  // Testing how it works, not what it does
  expect(mockDatabase.create).toHaveBeenCalledTimes(1);
});
```

### ✅ Do This Instead
```typescript
// Write tests first
describe('UserService', () => {
  describe('when creating a user', () => {
    it('should return user with generated ID', async () => {
      // Test the behavior, not the implementation
      const result = await userService.createUser(validUserData);
      expect(result).toHaveProperty('id');
      expect(typeof result.id).toBe('string');
    });
  });
});

// Test behavior, not implementation
it('should create user successfully', async () => {
  const result = await userService.createUser(validUserData);
  expect(result.name).toBe(validUserData.name);
  expect(result.email).toBe(validUserData.email);
});
```

## TDD Success Metrics

### Quality Metrics
- **Bug Rate**: Reduced production bugs
- **Test Coverage**: Maintained above 90%
- **Test Reliability**: Low flaky test rate
- **Regression Prevention**: Effective bug prevention

### Development Metrics
- **Development Speed**: Faster feature development
- **Refactoring Confidence**: Safe code improvements
- **Code Quality**: Better design and architecture
- **Documentation**: Living test documentation

### Team Metrics
- **Code Review Efficiency**: Faster, more focused reviews
- **Knowledge Transfer**: Tests serve as documentation
- **Onboarding**: New developers understand code through tests
- **Maintenance**: Easier to maintain and extend code

## Getting Started with TDD

### For New Projects
1. Set up testing framework and tools
2. Configure pre-commit hooks
3. Start with simple features to practice TDD
4. Build test coverage incrementally
5. Establish TDD culture in team

### For Existing Projects
1. Add tests for new features (TDD)
2. Gradually add tests for existing code
3. Refactor with test coverage
4. Establish TDD workflow for team
5. Set coverage targets and enforce them

### TDD Training Resources
- Practice with simple algorithms
- Use TDD katas and exercises
- Pair programming with TDD practitioners
- Regular TDD workshops and training
- Code review feedback focused on TDD

## Conclusion

TDD is not optional - it's mandatory for all Agent OS projects. Following these standards ensures:

- **Higher code quality** and fewer bugs
- **Better design** and architecture
- **Faster development** and safer refactoring
- **Living documentation** through tests
- **Confident deployments** and changes

Remember: **Red → Green → Refactor**. Always write tests first, implement minimally, then improve the code while keeping tests green.
