---
description: Spec Implementation Checklist for Agent OS
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Spec Implementation Checklist

## Pre-Implementation Checklist

### Spec Analysis
- [ ] Read the complete spec document from start to finish
- [ ] Identified all requirements in "Spec Scope" section
- [ ] Noted all exclusions in "Out of Scope" section
- [ ] Highlighted any ambiguous or unclear requirements
- [ ] Listed all files that need to be modified
- [ ] Documented any assumptions or questions

### Scope Validation
- [ ] Confirmed each requirement is clear and unambiguous
- [ ] Asked for clarification on any unclear requirements
- [ ] Received explicit confirmation for any assumptions
- [ ] Verified scope boundaries with user

### Implementation Planning
- [ ] Listed only files that need modification according to spec
- [ ] For each file, listed only specific changes required
- [ ] Identified any new files to be created (if specified)
- [ ] Noted existing functionality that should NOT be changed
- [ ] Planned test updates only for specific changes

## During Implementation Checklist

### Before Each Code Change
- [ ] Asked: "Is this change explicitly required by the spec?"
- [ ] If yes: Proceeded with change
- [ ] If no: Skipped the change
- [ ] If uncertain: Asked user for clarification

### File Modification Process
- [ ] Read current file content
- [ ] Identified only specific changes required by spec
- [ ] Made minimal changes to achieve spec requirements
- [ ] Did not refactor or improve unrelated code
- [ ] Did not add features not specified in spec

### Change Validation
- [ ] Verified each change is in the spec
- [ ] Confirmed no unauthorized modifications
- [ ] Ensured changes are minimal and focused
- [ ] Documented any deviations from plan

## Post-Implementation Checklist

### Verification
- [ ] All spec requirements have been implemented
- [ ] No unauthorized changes have been made
- [ ] All tests pass
- [ ] No scope creep has occurred
- [ ] Implementation matches spec description

### Scope Audit
- [ ] Listed all changes made
- [ ] Verified each change is in the spec
- [ ] Identified any changes not in spec
- [ ] If unauthorized changes found: Reverted them
- [ ] Confirmed reversion with user

### Testing
- [ ] Updated existing tests to match spec changes
- [ ] Created new tests only for new functionality specified in spec
- [ ] Ensured all tests pass
- [ ] Did not add tests for functionality not in spec

## Common Scope Creep Prevention

### UI/UX Changes
- [ ] Only changed navigation specified in spec
- [ ] Did not improve unrelated styling
- [ ] Only modified layout sections specified
- [ ] Did not add features not requested

### Code Quality
- [ ] Only refactored code explicitly mentioned
- [ ] Did not add performance optimizations not requested
- [ ] Only added error handling specified in spec
- [ ] Only updated documentation mentioned in spec

### Testing
- [ ] Only tested functionality specified in spec
- [ ] Did not improve unrelated tests
- [ ] Only added tests for new functionality
- [ ] Did not refactor existing tests unless specified

## Error Recovery Checklist

### If Scope Creep is Detected
- [ ] Identified unauthorized changes
- [ ] Listed what was changed outside spec
- [ ] Reverted unauthorized changes
- [ ] Documented what caused scope creep
- [ ] Continued with spec requirements only
- [ ] Got user approval for reversion

### If Spec is Unclear
- [ ] Documented ambiguities
- [ ] Asked for clarification
- [ ] Waited for response
- [ ] Did not make assumptions
- [ ] Proceeded only after clarification

## Final Validation

### Before Completion
- [ ] Reviewed implementation against original spec
- [ ] Confirmed all requirements met
- [ ] Verified no scope creep occurred
- [ ] Got user approval for implementation
- [ ] Documented any lessons learned

### Documentation
- [ ] Updated spec documentation to reflect actual implementation
- [ ] Updated task list with completion status
- [ ] Documented any scope corrections applied
- [ ] Noted any deviations from original plan 