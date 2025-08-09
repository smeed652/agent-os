# Validate Branch Strategy Command

Command to validate Git branching strategy and workflow compliance.

## Usage
`@validate-branch-strategy [project-path]`

## Parameters
- `project-path`: Path to Git repository (defaults to current directory)

## Branch Strategy Checks
- **Branch Naming**: Validates naming conventions (feature/, hotfix/, etc.)
- **Branch Structure**: Checks for main/master branch and organization
- **Feature Branches**: Ensures feature branches align with specs
- **Commit History**: Validates conventional commit format
- **Main Branch Protection**: Prevents direct commits to main
- **Spec Alignment**: Verifies active specs have corresponding branches

## Naming Conventions
- `main` or `master` - Main development branch
- `feature/feature-name` - Feature development
- `hotfix/issue-description` - Critical fixes
- `release/version-number` - Release preparation
- `bugfix/bug-description` - Bug fixes

## Output
Returns branch strategy analysis with:
- Branch naming compliance
- Structure organization issues
- Feature branch alignment with specs
- Commit history quality
- Protection violations

## Example
```bash
# Validate current repository
@validate-branch-strategy

# Validate specific project
@validate-branch-strategy ./my-project
```
