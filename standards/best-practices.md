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
