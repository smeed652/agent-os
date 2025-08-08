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

### Strict Scope Management
When implementing features or changes:
- **Read Spec Literally**: Only implement what is explicitly stated in the spec
- **No Scope Creep**: Do not add features, change existing functionality, or modify unrelated components unless explicitly requested
- **Ask Before Expanding**: If something seems missing or unclear, ask for clarification instead of making assumptions
- **Validate Against Original Requirements**: Before implementing, verify each change against the original spec

### Implementation Checklist
Before starting implementation:
- [ ] Read the complete spec document thoroughly
- [ ] Identify exactly what needs to be changed
- [ ] List any assumptions or unclear requirements
- [ ] Ask for clarification on any ambiguous points
- [ ] Confirm scope boundaries with the user

### Scope Validation Process
During implementation:
- **Before Each Change**: Ask "Is this explicitly required by the spec?"
- **For Each File**: Verify "Am I only changing what the spec requires?"
- **For Each Feature**: Confirm "Is this within the stated scope?"
- **When Uncertain**: Stop and ask for clarification

### Common Scope Creep Pitfalls
Avoid these common mistakes:
- **Over-engineering**: Adding features not in the spec
- **UI Improvements**: Changing unrelated navigation or styling
- **Code Refactoring**: Modifying existing functionality not mentioned in spec
- **Performance Optimizations**: Adding optimizations not requested
- **Error Handling**: Adding extensive error handling not specified

### When Scope Expansion is Needed
If you believe the spec is incomplete:
1. **Document the Gap**: Clearly state what seems to be missing
2. **Ask for Permission**: Request explicit approval before expanding scope
3. **Propose Minimal Changes**: Suggest the smallest possible addition
4. **Get Confirmation**: Wait for user approval before implementing
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
- **Quality Gates**: All tests must pass before release creation
- **Comprehensive Testing**: Unit tests + E2E tests before deployment
- **Test Coverage**: Aim for high coverage, especially for critical paths

### Deployment Best Practices
- **Rollback Strategy**: Always have a rollback plan for production issues
- **Environment Parity**: Keep staging and production environments as similar as possible
- **Monitoring**: Monitor production after deployment for issues
- **Documentation**: Update changelog and release notes for user communication
</conditional-block>
