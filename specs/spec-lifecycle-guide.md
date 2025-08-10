# Spec Lifecycle Management Guide

## Quick Reference

### Status Categories
- **Planning**: Specs ready for implementation
- **Active**: Specs currently being implemented
- **Completed**: Specs finished and tested
- **Archived**: Specs cleaned up and archived

### Folder Naming Convention
- `planning-YYYY-MM-DD-spec-name` (backlog)
- `active-YYYY-MM-DD-spec-name` (in progress)
- `completed-YYYY-MM-DD-spec-name` (done)
- `archived/YYYY-MM-DD-spec-name` (archived)

### Commands
```bash
# Generate dashboard
npm run dashboard

# Move spec to active
mv .agent-os/specs/planning-YYYY-MM-DD-spec-name .agent-os/specs/active-YYYY-MM-DD-spec-name

# Move spec to completed
mv .agent-os/specs/active-YYYY-MM-DD-spec-name .agent-os/specs/completed-YYYY-MM-DD-spec-name

# Archive completed spec
mv .agent-os/specs/completed-YYYY-MM-DD-spec-name .agent-os/specs/archived/YYYY-MM-DD-spec-name
```

## Status File Template
Each spec should have a `status.md` file:
```markdown
# Spec Status

**Spec Name**: [SPEC_NAME]
**Created**: [YYYY-MM-DD]
**Current Status**: [planning|active|completed|archived]
**Last Updated**: [YYYY-MM-DD]

## Status History
- [YYYY-MM-DD] - Created (planning)

## Current Phase
[DESCRIPTION_OF_CURRENT_PHASE]

## Next Actions
- [ ] [NEXT_ACTION_1]
- [ ] [NEXT_ACTION_2]

## Notes
[ANY_RELEVANT_NOTES]
```

---

> Type: Guide
> Agent-OS Version: 2.0.0
> Created: 2025-08-10
> Last Updated: 2025-08-10
> Status: Planning
> Author: Agent-OS
> Reviewers: TBD