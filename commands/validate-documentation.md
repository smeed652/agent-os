# Validate Documentation Command

Command to validate documentation completeness and quality.

## Usage
`@validate-documentation [project-path]`

## Parameters
- `project-path`: Path to project directory (defaults to current directory)

## Documentation Validation Checks
- **README Completeness**: Required sections and content quality
- **API Documentation**: Route documentation and API specs
- **Code Comments**: Function documentation and inline comments
- **Setup Instructions**: Installation and usage guidance
- **Spec Documentation**: Agent OS spec file completeness
- **Documentation Structure**: Organization and file management

## README Required Sections
- **Title/Project Name**: Clear project identification
- **Description**: What the project does
- **Installation**: Setup instructions
- **Usage**: How to use the project
- **Features**: Key functionality

## README Optional Sections
- Contributing guidelines
- License information
- API documentation
- Testing instructions
- Deployment guides

## Output
Returns documentation analysis with:
- README completeness score
- API documentation coverage
- Code comment quality metrics
- Missing documentation areas
- Structure improvement recommendations

## Example
```bash
# Validate current project documentation
@validate-documentation

# Validate specific project
@validate-documentation ./my-project
```
