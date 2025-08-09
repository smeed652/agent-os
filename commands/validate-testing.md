# Validate Testing Completeness Command

Command to validate test coverage and TDD approach compliance.

## Usage
`@validate-testing [project-path]`

## Parameters
- `project-path`: Path to project directory (defaults to current directory)

## Testing Validation Checks
- **Test Coverage**: File-by-file test coverage analysis
- **Test Structure**: Proper test organization with describe/it blocks
- **TDD Approach**: Validates specs include test-first methodology
- **Test Types**: Balanced unit, integration, and E2E tests
- **Test Naming**: Conventional test file naming and descriptions
- **Test Runner**: Proper testing framework configuration

## Coverage Standards
- **Target**: 80% test coverage minimum
- **Warning**: 60-79% coverage
- **Fail**: Below 60% coverage

## Test Types Expected
- **Unit Tests**: Individual function testing
- **Integration Tests**: Component interaction testing
- **E2E Tests**: End-to-end user workflow testing (for UI projects)

## Output
Returns testing completeness analysis with:
- Coverage percentage and uncovered files
- Test structure quality assessment
- TDD compliance in specs
- Test type distribution
- Configuration recommendations

## Example
```bash
# Validate current project testing
@validate-testing

# Validate specific project
@validate-testing ./my-app
```
