# Spec Lifecycle Management

## Overview

Comprehensive system for managing spec lifecycles across large projects with multiple specs in various states (backlog, active, completed, archived).

## Spec Status Categories

### 📋 Backlog (Planning)
- **Status**: `planning`
- **Description**: Specs that are defined but not yet started
- **Location**: `.agent-os/specs/YYYY-MM-DD-spec-name/`
- **Files**: `spec.md`, `spec-lite.md`, `tasks.md`, `sub-specs/`
- **Action**: Ready for implementation when resources available

### 🔄 Active (In Progress)
- **Status**: `active`
- **Description**: Specs currently being implemented
- **Location**: `.agent-os/specs/YYYY-MM-DD-spec-name/`
- **Files**: All spec files + implementation progress
- **Action**: Active development, regular updates to tasks.md

### ✅ Completed (Done)
- **Status**: `completed`
- **Description**: Specs that have been fully implemented and tested
- **Location**: `.agent-os/specs/YYYY-MM-DD-spec-name/`
- **Files**: All spec files + implementation results
- **Action**: Ready for cleanup and archiving

### 🗄️ Archived (Cleanup)
- **Status**: `archived`
- **Description**: Completed specs that have been cleaned up and archived
- **Location**: `.agent-os/specs/archived/YYYY-MM-DD-spec-name/`
- **Files**: Condensed version with key outcomes
- **Action**: Reference only, minimal maintenance

## Status Tracking Implementation

### Status File Structure
Each spec folder should contain a `status.md` file:

```markdown
# Spec Status

**Spec Name**: [SPEC_NAME]
**Created**: [YYYY-MM-DD]
**Current Status**: [planning|active|completed|archived]
**Last Updated**: [YYYY-MM-DD]

## Status History
- [YYYY-MM-DD] - Created (planning)
- [YYYY-MM-DD] - Started implementation (active)
- [YYYY-MM-DD] - Completed implementation (completed)
- [YYYY-MM-DD] - Archived (archived)

## Current Phase
[DESCRIPTION_OF_CURRENT_PHASE]

## Next Actions
- [ ] [NEXT_ACTION_1]
- [ ] [NEXT_ACTION_2]

## Notes
[ANY_RELEVANT_NOTES]
```

### Status Indicators
- **File Naming**: Add status prefix to spec folders
  - `planning-2025-01-31-admin-published-date-warnings`
  - `active-2025-01-31-deployment-process-improvement`
  - `completed-2025-01-31-documentation-synthesis`
  - `archived-2025-01-31-old-spec-name`

## Lifecycle Management Process

### 1. Spec Creation (Planning)
```bash
# Create new spec
mkdir .agent-os/specs/planning-YYYY-MM-DD-spec-name
# Generate spec files
# Update status.md
```

### 2. Spec Activation (Active)
```bash
# Move to active status
mv .agent-os/specs/planning-YYYY-MM-DD-spec-name .agent-os/specs/active-YYYY-MM-DD-spec-name
# Update status.md
# Create feature branch
git checkout -b feature/spec-name
```

### 3. Spec Completion (Completed)
```bash
# Move to completed status
mv .agent-os/specs/active-YYYY-MM-DD-spec-name .agent-os/specs/completed-YYYY-MM-DD-spec-name
# Update status.md with completion date
# Merge feature branch
git checkout main
git merge feature/spec-name
```

### 4. Spec Archiving (Archived)
```bash
# Move to archived status
mv .agent-os/specs/completed-YYYY-MM-DD-spec-name .agent-os/specs/archived/YYYY-MM-DD-spec-name
# Create summary document
# Remove implementation details
# Keep only key outcomes
```

## Automated Management Tools

### Status Dashboard
Create a `specs-dashboard.md` file that automatically tracks all specs:

```markdown
# Specs Dashboard

## Planning (Backlog)
- [ ] 2025-01-31-admin-published-date-warnings
- [ ] 2025-01-31-editable-published-date

## Active (In Progress)
- [x] 2025-01-31-deployment-process-improvement (50% complete)

## Completed (Done)
- [x] 2025-01-31-documentation-synthesis-organization
- [x] 2025-01-31-frontend-service-layer-consolidation

## Archived
- [x] 2025-01-31-old-spec-name
```

### Cleanup Scripts
Automated scripts for:
- Moving specs between statuses
- Updating status.md files
- Generating dashboard
- Archiving completed specs

## Best Practices

### 1. Regular Status Updates
- Update status.md weekly for active specs
- Review backlog monthly
- Archive completed specs quarterly

### 2. File Organization
- Keep only essential files in archived specs
- Maintain implementation history in git
- Create summary documents for archived specs

### 3. Cross-Project Consistency
- Use same status categories across all projects
- Standardize folder naming conventions
- Maintain consistent status.md format

### 4. Integration with Agent OS
- Update Agent OS instructions to include status management
- Add status tracking to spec creation process
- Include cleanup procedures in implementation workflow
```

## Implementation Priority

1. **High Priority**: Status tracking system
2. **Medium Priority**: Automated dashboard
3. **Low Priority**: Cleanup scripts

This system will help you manage multiple specs across large projects efficiently while maintaining clear visibility into what's planned, active, completed, and archived. 