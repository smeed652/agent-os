# Development Best Practices

## Context

Global development guidelines for Agent OS projects.

<conditional-block context-check="core-principles">
IF this Core Principles section already read in current context:
  SKIP: Re-reading this section
  NOTE: "Using Core Principles already in context"
ELSE:
  READ: The following principles

## Core Principles

### Keep It Simple
- Implement code in the fewest lines possible
- Avoid over-engineering solutions
- Choose straightforward approaches over clever ones

### Optimize for Readability
- Prioritize code clarity over micro-optimizations
- Write self-documenting code with clear variable names
- Add comments for "why" not "what"

### DRY (Don't Repeat Yourself)
- Extract repeated business logic to private methods
- Extract repeated UI markup to reusable components
- Create utility functions for common operations

### File Structure
- Keep files focused on a single responsibility
- Group related functionality together
- Use consistent naming conventions
</conditional-block>

<conditional-block context-check="spec-adherence" task-condition="implementation-task">
IF current task involves implementing features or changes:
  IF Spec Adherence section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using Spec Adherence guidelines already in context"
  ELSE:
    READ: The following guidelines
ELSE:
  SKIP: Spec Adherence section not relevant to current task

## Spec Adherence

### Collaborative Decision Making
When implementing features or changes:
- **Always Ask First**: Never implement changes without explicit user approval
- **Present Options**: When multiple approaches exist, present them and let user choose
- **Clarify Ambiguities**: When spec is unclear, ask for clarification before proceeding
- **Get Confirmation**: For any deviation from spec, get explicit user approval

### Strict Scope Management
When implementing features or changes:
- **Read Spec Literally**: Only implement what is explicitly stated in the spec
- **No Scope Creep**: Do not add features, change existing functionality, or modify unrelated components unless explicitly requested
- **Ask Before Expanding**: If something seems missing or unclear, ask for clarification instead of making assumptions
- **Validate Against Original Requirements**: Before implementing, verify each change against the original spec

### Implementation Approval Process
Before starting implementation:
1. **Scan Existing Code**: Analyze current codebase to understand existing implementation patterns and avoid duplicating functionality
2. **Read Spec**: Understand requirements completely
3. **Present Plan**: Show user exactly what will be implemented
4. **Get Approval**: Wait for user confirmation before proceeding
5. **Implement**: Only after explicit approval
6. **Verify**: Confirm implementation matches user expectations

### Refactoring Phase (Post-UI Approval)
After user approval of the implementation, perform code optimization while preserving functionality:
1. **UI Approval First**: Only refactor after UI/UX has been approved
2. **Analyze Codebase**: Identify optimization opportunities and code duplication
3. **Plan Refactoring**: Create detailed plan and get user approval
4. **Extract Common Code**: Eliminate duplication and create reusable modules
5. **Split Large Files**: Keep files under 300 lines for maintainability
6. **Optimize Performance**: Improve efficiency without changing behavior
7. **Validate Changes**: Ensure all tests pass and functionality remains identical
8. **User Confirmation**: Get final approval that refactoring is successful

### Feature Branch Creation (Mandatory)
Always create a feature branch for spec implementation to ensure proper isolation:
1. **Branch Naming**: Use format `feature/spec-name` (exclude date prefix)
2. **Create from Main**: Always branch from the main branch
3. **Clean Working Directory**: Ensure no uncommitted changes before branching
4. **User Confirmation**: Verify branch creation with user before proceeding
5. **Isolation**: Keep all spec work isolated on the feature branch
6. **Code Review**: Enable proper review process through pull requests

### Implementation Checklist
Before starting implementation:
- [ ] Scan existing codebase to understand current implementation patterns
- [ ] Read the complete spec document thoroughly
- [ ] Identify exactly what needs to be changed
- [ ] List any assumptions or unclear requirements
- [ ] Ask for clarification on any ambiguous points
- [ ] Present implementation plan to user
- [ ] Get explicit user approval before proceeding
- [ ] Confirm scope boundaries with the user

### Scope Validation Process
During implementation:
- **Before Each Change**: Ask "Is this explicitly required by the spec?"
- **For Each File**: Verify "Am I only changing what the spec requires?"
- **For Each Feature**: Confirm "Is this within the stated scope?"
- **When Uncertain**: Stop and ask for clarification
- **Before Implementation**: Get user approval for approach

### Collaboration Checkpoints
At key decision points, always ask for user input:
- **Before Implementation**: "Should I proceed with this approach?"
- **When Multiple Options**: Present alternatives and let user choose
- **When Spec is Unclear**: Ask for clarification before proceeding
- **When Scope Expansion Needed**: Get explicit approval before expanding
- **Before Final Implementation**: Confirm with user that approach is correct

### Common Scope Creep Pitfalls
Avoid these common mistakes:
- **Over-engineering**: Adding features not in the spec
- **UI Improvements**: Changing unrelated navigation or styling
- **Code Refactoring**: Modifying existing functionality not mentioned in spec
- **Performance Optimizations**: Adding optimizations not requested
- **Error Handling**: Adding extensive error handling not specified
- **Making Assumptions**: Implementing without user approval

### When Scope Expansion is Needed
If you believe the spec is incomplete:
1. **Document the Gap**: Clearly state what seems to be missing
2. **Present Options**: Show user different approaches to address the gap
3. **Ask for Permission**: Request explicit approval before expanding scope
4. **Propose Minimal Changes**: Suggest the smallest possible addition
5. **Get Confirmation**: Wait for user approval before implementing
6. **Verify Understanding**: Confirm user's choice before proceeding
</conditional-block>

<conditional-block context-check="dependencies" task-condition="choosing-external-library">
IF current task involves choosing an external library:
  IF Dependencies section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using Dependencies guidelines already in context"
  ELSE:
    READ: The following guidelines
ELSE:
  SKIP: Dependencies section not relevant to current task

## Dependencies

### Choose Libraries Wisely
When adding third-party dependencies:
- Select the most popular and actively maintained option
- Check the library's GitHub repository for:
  - Recent commits (within last 6 months)
  - Active issue resolution
  - Number of stars/downloads
  - Clear documentation
</conditional-block>

<conditional-block context-check="deployment-workflow" task-condition="production-deployment">
IF current task involves production deployment or release management:
  IF Deployment Workflow section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using Deployment Workflow guidelines already in context"
  ELSE:
    READ: The following guidelines
ELSE:
  SKIP: Deployment Workflow section not relevant to current task

## Deployment Workflow

### Conventional Commits
All commits must follow conventional commit format for automatic changelog generation:
```bash
<type>(<scope>): <description>
```
**Types:** feat, fix, docs, style, refactor, perf, test, chore
**Examples:**
- `feat(auth): add OAuth2 authentication`
- `fix(dashboard): resolve quarterly metrics display issue`
- `docs(workflow): update deployment guide`

### Release Branch Workflow
Follow the proven workflow: Feature Branch → Main → Release Branch → Production
1. **Development**: Work on main branch with conventional commits
2. **Release Creation**: `npm run release:create` - creates release branch with automatic changelog
3. **Production Deployment**: `npm run deploy:production:release` - deploys release branch
4. **Version Management**: Use semantic versioning (major.minor.patch)

### Test-Driven Development
- **Bug Fixes**: Write tests first to detect issues, then implement fixes
- **Failing Tests First**: When bugs are found but tests are passing, first update tests to detect the issue, then fix the bug
- **Documentation Updates**: Update project documentation to reflect this workflow
- **Quality Gates**: All tests must pass before release creation
- **Comprehensive Testing**: Unit tests + E2E tests before deployment
- **Test Coverage**: Aim for high coverage, especially for critical paths

### Deployment Best Practices
- **Rollback Strategy**: Always have a rollback plan for production issues
- **Environment Parity**: Keep staging and production environments as similar as possible
- **Monitoring**: Monitor production after deployment for issues
- **Documentation**: Update changelog and release notes for user communication
</conditional-block>

<conditional-block context-check="testing-practices" task-condition="feature-implementation">
IF current task involves implementing features or changes:
  IF Testing Practices section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using Testing Practices guidelines already in context"
  ELSE:
    READ: The following guidelines
ELSE:
  SKIP: Testing Practices section not relevant to current task

## Testing Best Practices

### Pre-Push Testing Requirements
Before pushing any changes to remote branches:
1. **Run Full Test Suite**: Always run `npm test` locally before pushing
2. **Test Affected Components**: Run tests for any components you modified
3. **Test New Dependencies**: If adding new context providers or hooks, test all components that might use them
4. **Environment Parity**: Ensure local test environment matches CI/CD as closely as possible

### Context Provider Testing
When adding new React Context providers:
1. **Identify All Consumers**: Find all components that use the new context
2. **Update Test Wrappers**: Add provider wrappers to all test files for affected components
3. **Test Integration**: Verify that components work correctly with the new context
4. **Check for Missing Providers**: Look for "must be used within a Provider" errors

### Test Environment Differences
Be aware of differences between local and CI/CD environments:
- **Local**: May have more permissive context or shared state between tests
- **CI/CD**: Stricter isolation, requires explicit provider wrapping
- **Solution**: Always wrap test components with required providers, even if they work locally

### Systematic Testing Approach
When implementing features that affect multiple components:
1. **Map Dependencies**: Identify all components that might be affected
2. **Test Each Component**: Run tests for each affected component individually
3. **Test Integration**: Run integration tests that use multiple components together
4. **Full Suite**: Run the complete test suite before pushing

### Common Testing Pitfalls
Avoid these common mistakes:
- **Assuming Local Works**: Just because it works locally doesn't mean it will work in CI/CD
- **Missing Provider Wrappers**: Not wrapping test components with required context providers
- **Incomplete Test Coverage**: Not testing all affected components
- **Environment Assumptions**: Assuming test environment behavior without verification

### Testing Checklist
Before pushing changes:
- [ ] Run `npm test` (full test suite)
- [ ] Test any new context providers with all consumer components
- [ ] Verify test wrappers include required providers
- [ ] Check for "must be used within a Provider" errors
- [ ] Test affected components individually
- [ ] Run integration tests if applicable
- [ ] Verify CI/CD environment compatibility
</conditional-block>
