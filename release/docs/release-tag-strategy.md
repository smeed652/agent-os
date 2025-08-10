# Release Tag Strategy for Agent OS

## Overview

This document defines the comprehensive release tag strategy for Agent OS, optimized for frequent releases while maintaining clear versioning, traceability, and deployment capabilities.

## Current State Analysis

**Current Version:** `v2.0.0`  
**Existing Tags:** `v2.0.0`, `v1.3.0`, `v1.2.0`, `v1.1`  
**Release Frequency:** High (multiple releases expected)  
**Current Strategy:** Semantic versioning with `v` prefix

## Recommended Release Tag Strategy

### 1. Semantic Versioning (SemVer) Foundation

```
v{MAJOR}.{MINOR}.{PATCH}[-{PRE-RELEASE}][+{BUILD}]
```

**Examples:**

- `v2.1.0` - Minor release
- `v2.1.1` - Patch release
- `v3.0.0` - Major release
- `v2.1.0-beta.1` - Pre-release
- `v2.1.0+build.20250131` - Build metadata

### 2. Tag Categories for Frequent Releases

#### Production Release Tags

```bash
v2.1.0          # Stable production release
v2.1.1          # Hotfix/patch release
v2.2.0          # Feature release
```

#### Pre-Release Tags (for testing/staging)

```bash
v2.1.0-alpha.1  # Early development
v2.1.0-beta.1   # Feature complete, testing
v2.1.0-rc.1     # Release candidate
```

#### Development Tags (optional, for CI/CD)

```bash
v2.1.0-dev.20250131.1234  # Development builds
v2.1.0-nightly.20250131   # Nightly builds
```

### 3. Release Branch Strategy

#### For Major/Minor Releases

```bash
# Create release branch
git checkout main
git pull origin main
git checkout -b release/v2.1.0

# Prepare release
npm version 2.1.0
git add .
git commit -m "chore(release): prepare v2.1.0"

# Tag the release
git tag -a v2.1.0 -m "Release v2.1.0

Features:
- New feature A
- Enhancement B
- Bug fix C"

# Push
git push origin release/v2.1.0
git push origin v2.1.0
```

#### For Hotfix/Patch Releases

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/v2.1.1

# Make fixes and prepare
npm version patch
git add .
git commit -m "fix: critical bug fix for production"

# Tag the hotfix
git tag -a v2.1.1 -m "Hotfix v2.1.1

Fixes:
- Critical security patch
- Production stability fix"

# Push
git push origin hotfix/v2.1.1
git push origin v2.1.1
```

### 4. Automated Tagging Strategy

#### Current Implementation Enhancement

Your existing `scripts/release.js` has good tagging logic. Recommended improvements:

```javascript
// Enhanced tag creation with conflict resolution
function deriveTagFromVersion(version) {
  const baseTag = `v${version}`;

  // Check if tag exists
  if (!tagExists(baseTag)) {
    return baseTag;
  }

  // For frequent releases, use timestamp suffix
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  return `${baseTag}+build.${timestamp}`;
}

// Enhanced tag message with changelog
function createReleaseTag(version, changelog) {
  const tag = deriveTagFromVersion(version);
  const message = `Release ${tag}\n\n${changelog}`;

  execSync(`git tag -a ${tag} -m "${message}"`);
  return tag;
}
```

### 5. Tag Naming Conventions

#### Standard Tags

- ✅ `v2.1.0` - Production releases
- ✅ `v2.1.0-beta.1` - Pre-releases
- ✅ `v2.1.0+build.20250131` - Build metadata

#### Special Purpose Tags

- `v2.1.0-hotfix` - Emergency fixes
- `v2.1.0-lts` - Long-term support versions
- `v2.1.0-experimental` - Experimental features

### 6. Release Frequency Optimizations

#### For Daily/Weekly Releases

```bash
# Use patch versions for frequent updates
v2.1.1, v2.1.2, v2.1.3...

# Group features into minor releases
v2.2.0 (monthly), v2.3.0 (monthly)

# Reserve major versions for breaking changes
v3.0.0 (quarterly/yearly)
```

#### Automated Release Pipeline

```bash
# npm scripts optimization
"release:patch": "npm version patch && npm run release",
"release:minor": "npm version minor && npm run release",
"release:major": "npm version major && npm run release",
"release:beta": "npm version prerelease --preid=beta && npm run release",
"release:hotfix": "npm run release:patch"
```

### 7. Git Tag Management

#### List Recent Tags

```bash
git tag --sort=-version:refname | head -10
```

#### Delete Tags (if needed)

```bash
# Delete local tag
git tag -d v2.1.0

# Delete remote tag
git push origin :refs/tags/v2.1.0
```

#### Tag Information

```bash
# Show tag details
git show v2.1.0

# List tags with messages
git tag -n5
```

### 8. Integration with CI/CD

#### GitHub Actions Example

```yaml
name: Release
on:
  push:
    tags:
      - "v*"

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Get tag
        id: tag
        run: echo "tag=${GITHUB_REF#refs/tags/}" >> $GITHUB_OUTPUT

      - name: Create Release
        uses: actions/create-release@v1
        with:
          tag_name: ${{ steps.tag.outputs.tag }}
          release_name: Release ${{ steps.tag.outputs.tag }}
```

### 9. Best Practices for Frequent Releases

#### DO:

- ✅ Use semantic versioning consistently
- ✅ Include meaningful release notes
- ✅ Automate tag creation via scripts
- ✅ Use annotated tags (not lightweight)
- ✅ Push tags to remote immediately
- ✅ Include changelog in tag messages

#### DON'T:

- ❌ Skip version numbers arbitrarily
- ❌ Use non-semantic tag names
- ❌ Create tags without testing
- ❌ Forget to push tags to remote
- ❌ Use lightweight tags for releases

### 10. Emergency Procedures

#### Rollback Strategy

```bash
# Revert to previous stable tag
git checkout v2.0.0
git checkout -b hotfix/rollback-v2.1.0

# Create rollback release
npm version 2.0.1
git tag -a v2.0.1 -m "Rollback from v2.1.0 - critical issues"
```

#### Tag Correction

```bash
# If wrong tag was created
git tag -d v2.1.0
git push origin :refs/tags/v2.1.0

# Create correct tag
git tag -a v2.1.0 -m "Correct release v2.1.0"
git push origin v2.1.0
```

## Implementation Checklist

- [ ] Update `scripts/release.js` with enhanced tagging
- [ ] Add release scripts to `package.json`
- [ ] Configure CI/CD for tag-based deployments
- [ ] Document release procedures for team
- [ ] Set up automated changelog generation
- [ ] Test rollback procedures
- [ ] Monitor tag naming consistency

## Monitoring and Maintenance

### Weekly Review

- Check tag naming consistency
- Verify all tags are pushed to remote
- Review release frequency patterns

### Monthly Review

- Analyze version progression
- Update release documentation
- Optimize automation scripts

---

**Next Steps:** Implement enhanced tagging in release scripts and establish team release procedures.
