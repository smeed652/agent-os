---
description: Deployment Workflow Instructions for Agent OS
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Deployment Workflow Instructions

## Overview

Execute production deployments following the release branch workflow with automatic changelog generation.

<pre_flight_check>
  EXECUTE: @~/.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="1" name="pre_deployment_checks">

### Step 1: Pre-Deployment Checks

Verify all requirements are met before deployment:

<checklist>
  - [ ] All tests passing (unit + E2E)
  - [ ] Conventional commits used throughout
  - [ ] Main branch is up to date with remote
  - [ ] No uncommitted changes
  - [ ] Version updated in package.json
</checklist>

<conditional_logic>
  IF any checks fail:
    FIX issues before proceeding
    RE-RUN checks
  ELSE:
    PROCEED to release creation
</conditional_logic>

</step>

<step number="2" name="release_creation">

### Step 2: Release Creation

Create a release with automatic changelog generation:

<commands>
  ```bash
  # Create release with changelog
  npm run release:create
  ```
</commands>

<expected_output>
  - Release branch created (e.g., release/v1.2.0)
  - Changelog generated from conventional commits
  - Version updated in package.json
  - Git tag created
  - Release notes generated
</expected_output>

<error_handling>
  IF release creation fails:
    CHECK error messages
    FIX issues (usually test failures)
    RE-RUN release creation
</error_handling>

</step>

<step number="3" name="production_deployment">

### Step 3: Production Deployment

Deploy the release to production:

<commands>
  ```bash
  # Deploy release to production
  npm run deploy:production:release
  ```
</commands>

<expected_output>
  - Release branch deployed to production
  - All tests pass in production environment
  - AWS Amplify deployment triggered
  - Changelog and release notes published
</expected_output>

<error_handling>
  IF deployment fails:
    CHECK deployment logs
    IDENTIFY root cause
    FIX issues in development
    CREATE new release with fixes
</error_handling>

</step>

<step number="4" name="verification">

### Step 4: Post-Deployment Verification

Verify deployment success:

<checklist>
  - [ ] Production environment is accessible
  - [ ] All functionality working as expected
  - [ ] No console errors in browser
  - [ ] Performance metrics are acceptable
  - [ ] Monitoring alerts are not triggered
</checklist>

<conditional_logic>
  IF verification fails:
    ASSESS severity of issues
    IF critical: ROLLBACK to previous version
    IF minor: MONITOR and plan hotfix
  ELSE:
    PROCEED to cleanup
</conditional_logic>

</step>

<step number="5" name="cleanup">

### Step 5: Cleanup and Documentation

Complete deployment process:

<actions>
  - Switch back to main branch
  - Update project documentation if needed
  - Archive release notes
  - Monitor production for 24-48 hours
</actions>

<commands>
  ```bash
  # Switch back to main branch
  git checkout main
  ```
</commands>

</step>

</process_flow>

## Rollback Strategy

### If Production Issues Occur:

<rollback_process>
  1. **Identify Issue**: Determine if rollback is necessary
  2. **Revert to Previous Release**: `git checkout v1.1.0`
  3. **Deploy Previous Version**: `npm run deploy:production:release`
  4. **Investigate and Fix**: Address issues in development
  5. **Create New Release**: `npm run release:create`
  6. **Deploy Fixed Version**: `npm run deploy:production:release`
</rollback_process>

## Best Practices

### Before Deployment:
- **Test Thoroughly**: Ensure all tests pass locally
- **Review Changes**: Check conventional commit format
- **Update Documentation**: Keep changelog and release notes current
- **Backup Data**: Ensure production data is backed up

### During Deployment:
- **Monitor Closely**: Watch deployment logs and metrics
- **Have Rollback Plan**: Know how to quickly revert if needed
- **Communicate**: Notify team of deployment status

### After Deployment:
- **Verify Functionality**: Test critical user paths
- **Monitor Performance**: Check for performance regressions
- **Document Issues**: Record any problems for future reference

## Troubleshooting

### Common Issues:

1. **Test Failures During Release Creation**
   - Fix failing tests before creating release
   - Ensure all tests pass locally first

2. **Deployment Failures**
   - Check AWS Amplify logs
   - Verify environment variables are set
   - Ensure build process completes successfully

3. **Production Issues After Deployment**
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Monitor application logs

4. **Rollback Issues**
   - Ensure previous version is properly tagged
   - Verify rollback deployment completes successfully
   - Test rollback version thoroughly

## Integration with Agent OS

This deployment workflow integrates with Agent OS standards:

- **Follows Conventional Commits**: Enables automatic changelog generation
- **Uses Test-Driven Development**: Ensures quality before deployment
- **Implements Release Branch Workflow**: Maintains main branch stability
- **Supports Semantic Versioning**: Proper version management
- **Enables Rollback Capability**: Production safety net

