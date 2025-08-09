# Validate Spec Adherence Command

Command to validate that implementation matches specification requirements exactly.

## Usage
`@validate-spec-adherence [spec-path] [implementation-path]`

## Parameters
- `spec-path`: Path to the spec directory (defaults to most recent spec in .agent-os/specs/)
- `implementation-path`: Path to implementation directory (defaults to current directory)

## Validation Checks
- **Spec Requirements**: All requirements in spec scope are implemented
- **User Stories**: All user stories are satisfied with acceptance criteria
- **Scope Compliance**: No unauthorized features or scope creep
- **Expected Deliverables**: All specified deliverables are present
- **Technical Requirements**: Technical specifications are met

## Output
Returns detailed validation results showing:
- Requirements coverage analysis
- User story satisfaction status
- Scope compliance issues
- Missing deliverables
- Technical requirement gaps

## Example
```bash
# Validate current implementation against latest spec
@validate-spec-adherence

# Validate specific spec and implementation
@validate-spec-adherence .agent-os/specs/2025-01-15-user-auth ./src/auth
```
