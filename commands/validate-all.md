# Validate All Command

Command to run all Agent OS validators for comprehensive quality assessment.

## Usage
`@validate-all [project-path]`

## Parameters
- `project-path`: Path to project directory (defaults to current directory)

## Validation Tiers

### 🎯 Tier 1 - Critical Quality
- **Code Quality**: File size, complexity, duplication, naming conventions
- **Spec Adherence**: Implementation matches specification requirements

### 🎯 Tier 2 - Development Workflow  
- **Security**: Vulnerability detection and security best practices
- **Branch Strategy**: Git workflow and branching conventions
- **Testing Completeness**: Test coverage and TDD approach
- **Documentation**: Documentation completeness and quality

## Quality Scoring
- **90-100%**: Excellent - Meets high quality standards
- **75-89%**: Good - Quality with room for improvement  
- **60-74%**: Moderate - Consider addressing key issues
- **<60%**: Significant improvements needed

## Output Format
- Overall quality status and score
- Tier-by-tier validation results
- Summary statistics (passed/warnings/failed)
- Top recommendations for improvement
- Execution time and performance metrics

## Alternative Commands
- `@validate-tier1` - Run only critical quality validators
- `@validate-tier2` - Run only workflow validators
- `@validate-specific security,testing` - Run specific validators

## Example
```bash
# Validate entire current project
@validate-all

# Validate specific project
@validate-all ./my-project

# Run with detailed output
@validate-all . --verbose
```
