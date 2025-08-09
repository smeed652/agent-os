# Validate Security Command

Command to validate security best practices and detect vulnerabilities.

## Usage
`@validate-security [file-or-directory]`

## Parameters
- `file-or-directory`: Target to validate (defaults to current directory)

## Security Checks
- **Hardcoded Secrets**: Detects passwords, API keys, tokens in code
- **Insecure Patterns**: Identifies dangerous functions (eval, innerHTML, etc.)
- **SQL Injection**: Finds potential SQL injection vulnerabilities
- **XSS Prevention**: Validates cross-site scripting protection
- **Input Validation**: Checks for proper input sanitization
- **Authentication**: Verifies authentication patterns for routes
- **HTTPS/TLS**: Ensures secure communication protocols
- **Dependency Security**: Reviews package vulnerabilities
- **Configuration Security**: Validates secure configuration practices

## Output
Returns comprehensive security analysis with:
- Vulnerability severity ratings
- Specific code locations with issues
- Security best practice recommendations
- Overall security score

## Example
```bash
# Validate entire project
@validate-security

# Validate specific directory
@validate-security ./src/api

# Validate single file
@validate-security ./src/auth/login.js
```
