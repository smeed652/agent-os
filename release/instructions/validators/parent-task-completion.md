---
description: Parent Task Completion Validator for Agent OS
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Parent Task Completion Validator

## Overview

Validates that a parent task and all its subtasks have been completed according to the requirements in tasks.md, following the execute-task.md workflow.

<validation_flow>

<step number="1" name="task_identification">

### Step 1: Task Identification

Identify the parent task being validated and its subtasks from tasks.md.

<task_analysis>
  <parent_task>
    - read tasks.md file
    - identify specific parent task number
    - extract task description
    - list all subtasks (decimal notation)
  </parent_task>
  <subtask_structure>
    - typical first subtask: "Write tests for [component]"
    - middle subtasks: implementation steps
    - typical last subtask: "Verify all tests pass"
  </subtask_structure>
</task_analysis>

<validation_criteria>
  ✅ Parent task clearly identified
  ✅ All subtasks enumerated
  ✅ Task dependencies understood
</validation_criteria>

</step>

<step number="2" name="completion_status_validation">

### Step 2: Completion Status Validation

Check that all subtasks are marked as completed in tasks.md.

<status_checks>
  <completion_markers>
    - [x] for completed tasks
    - [ ] for incomplete tasks
    - ⚠️ for blocked tasks (with explanation)
  </completion_markers>
  <validation_logic>
    - all subtasks must be marked [x]
    - parent task must be marked [x]
    - no ⚠️ blocking issues for this task
  </validation_logic>
</status_checks>

<validation_criteria>
  ✅ All subtasks marked as [x] completed
  ✅ Parent task marked as [x] completed
  ✅ No blocking issues (⚠️) present
</validation_criteria>

</step>

<step number="3" name="deliverable_validation">

### Step 3: Deliverable Validation

Verify that the expected deliverables from the task actually exist and function.

<deliverable_checks>
  <code_implementation>
    - check that new code files exist
    - verify functions/classes/components implemented
    - confirm integration with existing codebase
  </code_implementation>
  <test_implementation>
    - verify test files exist (typically from first subtask)
    - check test coverage for implemented features
    - ensure tests are properly structured
  </test_implementation>
  <documentation_updates>
    - check if documentation was updated (if required)
    - verify inline code comments (if specified in standards)
    - confirm README or other docs reflect changes
  </documentation_updates>
</deliverable_checks>

<validation_criteria>
  ✅ Expected code files exist and contain implementations
  ✅ Test files exist and cover implemented functionality  
  ✅ Documentation updated where required
  ✅ Code follows project standards
</validation_criteria>

</step>

<step number="4" name="test_execution_validation">

### Step 4: Test Execution Validation

Run tests to verify the implementation works correctly.

<test_execution>
  <task_specific_tests>
    - run only tests related to this parent task
    - verify all new tests pass
    - check that existing tests still pass
  </task_specific_tests>
  <test_types>
    - unit tests for new functionality
    - integration tests (if applicable)
    - end-to-end tests (if applicable)
  </test_types>
  <failure_handling>
    - identify specific test failures
    - provide debugging information
    - suggest fixes for common issues
  </failure_handling>
</test_execution>

<validation_criteria>
  ✅ All task-specific tests pass
  ✅ No regressions in existing tests
  ✅ Test output confirms expected behavior
</validation_criteria>

</step>

<step number="5" name="technical_spec_alignment">

### Step 5: Technical Spec Alignment

Verify implementation matches the technical specifications from sub-specs/technical-spec.md.

<spec_alignment_checks>
  <technical_requirements>
    - compare implementation to technical requirements
    - verify all specified functionality implemented
    - check performance criteria met (if specified)
  </technical_requirements>
  <integration_requirements>
    - confirm proper integration with existing systems
    - verify API contracts maintained
    - check database changes applied correctly
  </integration_requirements>
  <external_dependencies>
    - verify new dependencies installed (if any)
    - check version requirements met
    - confirm dependency usage follows best practices
  </external_dependencies>
</spec_alignment_checks>

<validation_criteria>
  ✅ Implementation matches technical requirements
  ✅ Integration points working correctly
  ✅ External dependencies properly managed
</validation_criteria>

</step>

<step number="6" name="code_quality_validation">

### Step 6: Code Quality Validation

Assess code quality and adherence to project standards.

<quality_checks>
  <code_style>
    - follows @~/.agent-os/standards/code-style.md
    - proper formatting and indentation
    - consistent naming conventions
  </code_style>
  <best_practices>
    - follows @~/.agent-os/standards/best-practices.md
    - appropriate error handling
    - proper separation of concerns
  </best_practices>
  <maintainability>
    - code is readable and well-organized
    - appropriate comments where needed
    - no obvious code smells
  </maintainability>
</quality_checks>

<validation_criteria>
  ✅ Code follows established style guidelines
  ✅ Best practices implemented
  ✅ Code is maintainable and readable
</validation_criteria>

</step>

<step number="7" name="user_story_validation">

### Step 7: User Story Validation

Confirm that the implementation satisfies the user stories from spec.md.

<user_story_checks>
  <story_fulfillment>
    - read user stories from spec.md
    - test each story scenario manually or automatically
    - verify expected benefits are delivered
  </story_fulfillment>
  <acceptance_criteria>
    - check that all acceptance criteria met
    - verify edge cases handled appropriately
    - confirm error scenarios handled gracefully
  </acceptance_criteria>
</user_story_checks>

<validation_criteria>
  ✅ All user stories can be completed successfully
  ✅ Expected benefits are delivered
  ✅ Acceptance criteria satisfied
</validation_criteria>

</step>

</validation_flow>

## Validation Execution

<execution_process>
  <automated_checks>
    1. Parse tasks.md for parent task details
    2. Check completion status markers
    3. Verify deliverable files exist
    4. Run task-specific tests
    5. Compare against technical specs
    6. Assess code quality
    7. Test user story scenarios
  </automated_checks>
  <manual_verification>
    - visual inspection of implementation
    - functional testing of user workflows
    - verification of edge cases
  </manual_verification>
</execution_process>

## Validation Report Template

```markdown
# Parent Task Completion Validation Report

**Task:** [PARENT_TASK_NUMBER] - [TASK_DESCRIPTION]
**Validated:** [TIMESTAMP]
**Status:** [PASS/FAIL/PARTIAL]

## Task Overview
- **Subtasks:** [COUNT] total
- **Expected Deliverables:** [LIST]
- **Test Coverage:** [PERCENTAGE]%

## ✅ Validation Results

### Completion Status
- [x] All subtasks marked complete
- [x] Parent task marked complete
- [x] No blocking issues

### Deliverables
- [x] Code implementation: [FILES_CREATED]
- [x] Test implementation: [TEST_FILES]
- [x] Documentation: [DOCS_UPDATED]

### Tests
- [x] Task-specific tests: [PASS_COUNT]/[TOTAL_COUNT] passed
- [x] Regression tests: All passed
- [x] Manual testing: User stories verified

### Quality
- [x] Code style compliance
- [x] Best practices followed
- [x] Technical spec alignment

## ❌ Issues Found
[IF_ANY_FAILURES_LIST_THEM_HERE]

## 🔧 Recommendations
[SUGGESTIONS_FOR_IMPROVEMENT]

## Next Steps
- [ ] Proceed to next parent task
- [ ] Update status.md with progress
- [ ] Consider refactoring opportunities

## Summary
Task [TASK_NUMBER] successfully implemented and validated. Ready to proceed with remaining tasks.
```

## Common Validation Scenarios

<scenarios>
  <blocked_task>
    - task has ⚠️ marker
    - validate blocking issue is documented
    - suggest resolution approaches
  </blocked_task>
  <partial_completion>
    - some subtasks incomplete
    - identify specific gaps
    - provide completion guidance
  </partial_completion>
  <test_failures>
    - tests don't pass
    - identify failing test cases
    - suggest debugging approaches
  </test_failures>
  <spec_deviation>
    - implementation doesn't match spec
    - highlight differences
    - recommend spec update or code fix
  </spec_deviation>
</scenarios>

## Usage Instructions

To run this validator after completing a parent task:

```bash
@~/.agent-os/instructions/validators/parent-task-completion.md [TASK_NUMBER] [SPEC_DIRECTORY_PATH]
```

Example:
```bash
@~/.agent-os/instructions/validators/parent-task-completion.md 1 .agent-os/specs/2025-01-15-password-reset/
```

The validator will automatically find the current active spec if no path is provided.