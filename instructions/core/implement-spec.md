---
description: Spec Implementation Instructions for Agent OS
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Spec Implementation Instructions

## Overview

Execute spec implementation with strict scope control and collaborative decision making to prevent unauthorized changes and scope creep.

<pre_flight_check>
  EXECUTE: @~/.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="1" name="spec_analysis">

### Step 1: Spec Analysis and Scope Definition

Thoroughly analyze the spec document to understand exact requirements:

<checklist>
  - [ ] Read the complete spec document from start to finish
  - [ ] Identify the "Spec Scope" section and list all requirements
  - [ ] Identify the "Out of Scope" section and note all exclusions
  - [ ] Highlight any ambiguous or unclear requirements
  - [ ] Create a list of files that will need modification
  - [ ] Document any assumptions or questions
</checklist>

<validation_process>
  FOR EACH requirement in spec:
    ASK: "Is this requirement clear and unambiguous?"
    IF unclear: DOCUMENT the question for user clarification
    IF clear: PROCEED to implementation planning
</validation_process>

<conditional_logic>
  IF any requirements are unclear:
    ASK user for clarification before proceeding
    WAIT for explicit confirmation
  ELSE:
    PROCEED to implementation planning
</conditional_logic>

</step>

<step number="2" name="implementation_planning">

### Step 2: Implementation Planning and User Approval

Create a detailed plan and get user approval before proceeding:

<planning_checklist>
  - [ ] List only the files that need to be modified according to the spec
  - [ ] For each file, list only the specific changes required
  - [ ] Identify any new files that need to be created (if specified in spec)
  - [ ] Note any existing functionality that should NOT be changed
  - [ ] Plan test updates only for the specific changes
  - [ ] Present complete implementation plan to user
  - [ ] Get explicit user approval before proceeding
</planning_checklist>

<scope_validation>
  FOR EACH planned change:
    ASK: "Is this explicitly required by the spec?"
    IF yes: INCLUDE in plan
    IF no: EXCLUDE from plan
    IF uncertain: ASK user for clarification
</scope_validation>

<user_approval_process>
  BEFORE proceeding to implementation:
    - Present complete implementation plan to user
    - Show exactly what files will be modified
    - Show exactly what changes will be made
    - Ask: "Should I proceed with this implementation plan?"
    - Wait for explicit user approval
    - If user suggests changes: Update plan and get re-approval
</user_approval_process>

<conditional_logic>
  IF any planned changes are not explicitly in spec:
    REMOVE from plan
    DOCUMENT why it was removed
    ASK user if removal is correct
  IF user approves implementation plan:
    PROCEED to implementation
  ELSE:
    REVISE plan based on user feedback
    GET re-approval
</conditional_logic>

</step>

<step number="3" name="implementation">

### Step 3: Implementation with Scope Control and User Collaboration

Implement changes with strict adherence to the spec and user approval:

<implementation_rules>
  - **Stick to Spec Literally**: Only implement what is explicitly stated
  - **No Scope Creep**: Do not add features or modify unrelated components
  - **Ask Before Expanding**: If something seems missing, ask for clarification
  - **Validate Each Change**: Before each modification, verify it's in the spec
  - **Get User Approval**: For any deviation from approved plan, ask user first
</implementation_rules>

<change_validation>
  BEFORE EACH code change:
    ASK: "Is this change explicitly required by the spec?"
    IF yes: PROCEED with change
    IF no: SKIP the change
    IF uncertain: ASK user for clarification
</change_validation>

<collaboration_checkpoints>
  DURING implementation:
    - If multiple approaches exist: Present options to user and let them choose
    - If spec is unclear: Ask for clarification before proceeding
    - If scope expansion needed: Get explicit user approval
    - If unexpected issues arise: Stop and ask user how to proceed
    - Before final implementation: Confirm with user that approach is correct
</collaboration_checkpoints>

<file_modification_process>
  FOR EACH file to be modified:
    - Read the current file content
    - Identify only the specific changes required by spec
    - Make minimal changes to achieve spec requirements
    - Do not refactor or improve unrelated code
    - Do not add features not specified in spec
    - If changes differ from approved plan: Ask user for approval
</file_modification_process>

</step>

<step number="4" name="testing">

### Step 4: Testing Implementation with User Approval

Test only the changes specified in the spec:

<testing_requirements>
  - [ ] Update existing tests to match spec changes
  - [ ] Create new tests only for new functionality specified in spec
  - [ ] Ensure all tests pass before proceeding
  - [ ] Do not add tests for functionality not in spec
  - [ ] Present test plan to user if tests need significant changes
</testing_requirements>

<test_validation>
  FOR EACH test change:
    ASK: "Is this test change required by the spec implementation?"
    IF yes: INCLUDE test change
    IF no: EXCLUDE test change
    IF uncertain: ASK user for clarification
</test_validation>

<user_approval_for_testing>
  IF test changes are significant:
    - Present test plan to user
    - Show which tests will be modified/created
    - Ask: "Should I proceed with these test changes?"
    - Wait for user approval
</user_approval_for_testing>

</step>

<step number="5" name="verification">

### Step 5: Implementation Verification and User Confirmation

Verify that implementation matches spec exactly and get user confirmation:

<verification_checklist>
  - [ ] All spec requirements have been implemented
  - [ ] No unauthorized changes have been made
  - [ ] All tests pass
  - [ ] No scope creep has occurred
  - [ ] Implementation matches spec description
  - [ ] Implementation matches user expectations
</verification_checklist>

<scope_audit>
  COMPARE implementation against original spec:
    - List all changes made
    - Verify each change is in the spec
    - Identify any changes not in spec
    - If unauthorized changes found: REVERT them
    - Present audit results to user
</scope_audit>

<user_confirmation>
  BEFORE completing implementation:
    - Present final implementation to user
    - Show what was implemented vs. what was in spec
    - Ask: "Does this implementation match your expectations?"
    - If user is satisfied: Complete implementation
    - If user wants changes: Make adjustments and get re-approval
</user_confirmation>

</step>

</process_flow>

## Collaborative Decision Making Best Practices

### Before Implementation:
- **Read Spec Multiple Times**: Ensure complete understanding
- **Highlight Requirements**: Mark exactly what needs to be done
- **List Exclusions**: Note what should NOT be changed
- **Ask Questions**: Clarify any ambiguous requirements
- **Present Plan**: Show user exactly what will be implemented
- **Get Approval**: Wait for explicit user approval before proceeding

### During Implementation:
- **Check Before Each Change**: "Is this in the spec?"
- **Stop When Uncertain**: Ask for clarification
- **Make Minimal Changes**: Only what's required
- **Document Assumptions**: Note any assumptions made
- **Ask for Approval**: For any deviation from approved plan
- **Present Options**: When multiple approaches exist

### After Implementation:
- **Review Against Spec**: Verify all requirements met
- **Check for Scope Creep**: Identify any unauthorized changes
- **Test Only Specified Functionality**: Don't add extra tests
- **Get User Approval**: Confirm implementation matches expectations
- **Present Results**: Show user what was accomplished

## Common Scope Creep Prevention

### UI/UX Changes:
- **Navigation**: Only change what's specified in spec
- **Styling**: Don't improve unrelated components
- **Layout**: Only modify specified sections
- **Functionality**: Don't add features not requested

### Code Quality:
- **Refactoring**: Only refactor code explicitly mentioned
- **Performance**: Don't add optimizations not requested
- **Error Handling**: Only add error handling specified in spec
- **Documentation**: Only update docs mentioned in spec

### Testing:
- **Test Coverage**: Only test functionality specified in spec
- **Test Improvements**: Don't improve unrelated tests
- **New Tests**: Only add tests for new functionality
- **Test Refactoring**: Don't refactor existing tests unless specified

## Error Recovery

### If Scope Creep is Detected:
1. **Identify Unauthorized Changes**: List what was changed outside spec
2. **Revert Unauthorized Changes**: Undo changes not in spec
3. **Document the Issue**: Note what caused scope creep
4. **Continue with Spec**: Focus only on spec requirements
5. **Get User Approval**: Confirm reversion is correct

### If Spec is Unclear:
1. **Document Ambiguities**: List unclear requirements
2. **Ask for Clarification**: Request specific guidance
3. **Wait for Response**: Don't make assumptions
4. **Proceed with Clarification**: Implement only after clarification

### If User Wants Changes:
1. **Stop Implementation**: Pause current work
2. **Present Options**: Show different approaches
3. **Get User Choice**: Let user decide which approach
4. **Update Plan**: Revise implementation plan
5. **Get Re-approval**: Confirm new plan with user
6. **Continue Implementation**: Proceed with user-approved approach

## Integration with Agent OS

This implementation process integrates with Agent OS standards:

- **Follows Spec Adherence Guidelines**: Prevents scope creep
- **Uses Test-Driven Development**: Ensures quality implementation
- **Maintains Code Quality**: Without unauthorized improvements
- **Supports User Communication**: Clear feedback and clarification
- **Enables Rollback**: If unauthorized changes are made
- **Promotes Collaboration**: User approval at every step 