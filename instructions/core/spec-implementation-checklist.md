---
description: Spec Implementation Checklist for Agent OS
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Spec Implementation Checklist

## Pre-Implementation Checklist

### Feature Branch Creation (Mandatory)
- [ ] Created feature branch for spec implementation
- [ ] Verified branch naming follows convention: feature/spec-name
- [ ] Confirmed we're working on the correct feature branch
- [ ] Ensured clean working directory
- [ ] Verified branch was created from main branch
- [ ] Confirmed with user that branch setup is correct

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

### User Approval Process
- [ ] Presented complete implementation plan to user
- [ ] Showed exactly what files will be modified
- [ ] Showed exactly what changes will be made
- [ ] Asked: "Should I proceed with this implementation plan?"
- [ ] Received explicit user approval before proceeding
- [ ] If user suggested changes: Updated plan and got re-approval

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
- [ ] If changes differed from approved plan: Asked user for approval

### Collaboration Checkpoints
- [ ] If multiple approaches existed: Presented options to user and let them choose
- [ ] If spec was unclear: Asked for clarification before proceeding
- [ ] If scope expansion needed: Got explicit user approval
- [ ] If unexpected issues arose: Stopped and asked user how to proceed
- [ ] Before final implementation: Confirmed with user that approach was correct

## Post-Implementation Checklist

### Verification
- [ ] All spec requirements have been implemented
- [ ] No unauthorized changes have been made
- [ ] All tests pass
- [ ] No scope creep has occurred
- [ ] Implementation matches spec description
- [ ] Implementation matches user expectations

### Scope Audit
- [ ] Listed all changes made
- [ ] Verified each change is in the spec
- [ ] Identified any changes not in spec
- [ ] If unauthorized changes found: Reverted them
- [ ] Confirmed reversion with user
- [ ] Presented audit results to user

### Testing
- [ ] Updated existing tests to match spec changes
- [ ] Created new tests only for new functionality specified in spec
- [ ] Ensured all tests pass
- [ ] Did not add tests for functionality not in spec
- [ ] If test changes were significant: Presented test plan to user and got approval

### User Confirmation
- [ ] Presented final implementation to user
- [ ] Showed what was implemented vs. what was in spec
- [ ] Asked: "Does this implementation match your expectations?"
- [ ] If user was satisfied: Completed implementation
- [ ] If user wanted changes: Made adjustments and got re-approval

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

### If User Wants Changes
- [ ] Stopped implementation
- [ ] Presented options to user
- [ ] Got user choice
- [ ] Updated implementation plan
- [ ] Got re-approval from user
- [ ] Continued with user-approved approach

## Refactoring Checklist (Post-UI Approval)

### Pre-Refactoring Analysis
- [ ] Analyzed codebase for optimization opportunities
- [ ] Identified code duplication and common patterns
- [ ] Reviewed file sizes and identified large files (>300 lines)
- [ ] Assessed performance bottlenecks and optimization targets
- [ ] Checked for proper design pattern implementation
- [ ] Reviewed error handling and edge case coverage
- [ ] Documented specific refactoring opportunities

### Refactoring Planning
- [ ] Created detailed refactoring plan with specific improvements
- [ ] Identified files that need restructuring or splitting
- [ ] Planned extraction of reusable components and functions
- [ ] Designed improved error handling strategies
- [ ] Planned performance optimizations
- [ ] Presented refactoring plan to user for approval
- [ ] Received explicit user approval before proceeding

### Refactoring Implementation
- [ ] Extracted common functionality into reusable modules
- [ ] Split large files into smaller, focused components
- [ ] Implemented proper error handling and validation
- [ ] Optimized performance-critical sections
- [ ] Improved code documentation and comments
- [ ] Ensured all tests continue to pass during refactoring
- [ ] Maintained exact functionality and UI behavior

### Post-Refactoring Validation
- [ ] Verified all functionality remains unchanged
- [ ] Confirmed UI/UX is preserved exactly as before
- [ ] Ran comprehensive test suite (100% pass rate)
- [ ] Checked for any performance regressions
- [ ] Validated code quality improvements
- [ ] Confirmed file sizes are under 300 lines where appropriate
- [ ] Verified DRY principles are followed
- [ ] Got user confirmation that refactoring is successful
- [ ] Documented any lessons learned for future refactoring

### Refactoring Quality Gates
- [ ] **No Functional Changes**: All existing functionality works exactly the same
- [ ] **No UI Changes**: User interface remains identical
- [ ] **No API Changes**: External interfaces are preserved
- [ ] **Test Preservation**: All existing tests continue to pass
- [ ] **Performance Maintained**: No performance regressions introduced
- [ ] **Code Quality Improved**: Readability, maintainability, and structure enhanced

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
- [ ] Confirmed with user that documentation is accurate

### User Satisfaction
- [ ] Asked user: "Does this implementation meet your needs?"
- [ ] Confirmed user is satisfied with the approach taken
- [ ] Verified user understands what was implemented
- [ ] Got final user approval before marking complete 