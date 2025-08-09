# Validator Test Scenarios

## Post-Spec Creation Validator Test Scenarios

### Scenario 1: Valid Complete Spec
**Test:** `test-valid-complete-spec`
**Expected Result:** ✅ All validations pass
**Structure:**
```
.agent-os/specs/2025-08-09-user-authentication/
├── spec.md (complete with all sections)
├── spec-lite.md (proper summary)
├── tasks.md (proper task structure)
├── status.md (correct status format)
└── sub-specs/
    ├── technical-spec.md (complete technical requirements)
    ├── database-schema.md (database changes)
    └── api-spec.md (API endpoints)
```

### Scenario 2: Missing Required Files
**Test:** `test-missing-required-files`
**Expected Result:** ❌ Validation fails - missing spec-lite.md and tasks.md
**Structure:**
```
.agent-os/specs/2025-08-09-missing-files/
├── spec.md
└── status.md
```

### Scenario 3: Invalid Directory Naming
**Test:** `test-invalid-directory-naming`
**Expected Result:** ❌ Validation fails - improper date format and naming
**Structure:**
```
.agent-os/specs/aug-9-2025-This_Is_Too_Many_Words_For_Spec_Name/
├── spec.md
├── spec-lite.md
├── tasks.md
└── status.md
```

### Scenario 4: Missing Required Sections in spec.md
**Test:** `test-incomplete-spec-content`
**Expected Result:** ❌ Validation fails - missing Overview and User Stories sections
**Structure:**
```
.agent-os/specs/2025-08-09-incomplete-content/
├── spec.md (missing Overview and User Stories sections)
├── spec-lite.md
├── tasks.md
└── status.md
```

### Scenario 5: Invalid Task Structure
**Test:** `test-invalid-task-structure`
**Expected Result:** ❌ Validation fails - improper task formatting
**Structure:**
```
.agent-os/specs/2025-08-09-bad-tasks/
├── spec.md
├── spec-lite.md
├── tasks.md (tasks not in checklist format, missing subtasks)
└── status.md
```

## Parent Task Completion Validator Test Scenarios

### Scenario 6: Valid Completed Task
**Test:** `test-valid-completed-task`
**Expected Result:** ✅ All validations pass
**Setup:**
- Task 1 with all subtasks marked [x] 
- Expected code files exist
- Tests pass
- Implementation matches spec

### Scenario 7: Incomplete Task (Missing Subtasks)
**Test:** `test-incomplete-task`
**Expected Result:** ❌ Validation fails - subtasks not marked complete
**Setup:**
- Task 1 with some subtasks marked [ ] incomplete
- Missing expected deliverables

### Scenario 8: Blocked Task
**Test:** `test-blocked-task`
**Expected Result:** ❌ Validation fails - task has blocking issue
**Setup:**
- Task 1 marked with ⚠️ blocking issue
- Blocking reason documented

### Scenario 9: Tests Fail
**Test:** `test-failing-tests`
**Expected Result:** ❌ Validation fails - test execution failures
**Setup:**
- Task marked complete but tests fail
- Implementation has bugs

### Scenario 10: Implementation Doesn't Match Spec
**Test:** `test-spec-deviation`
**Expected Result:** ❌ Validation fails - implementation differs from technical spec
**Setup:**
- Task marked complete
- Code exists but doesn't implement required features

## Test Data Structure

Each test scenario will have:
```
tests/validators/scenarios/[scenario-name]/
├── input/                    # Test spec structure
│   └── .agent-os/specs/...  
├── expected-output.json      # Expected validation results
├── setup.sh                 # Setup script if needed
└── teardown.sh              # Cleanup script
```

## Test Execution Flow

1. **Setup Phase:** Create test spec structure
2. **Execution Phase:** Run validator against test structure  
3. **Validation Phase:** Compare results to expected output
4. **Cleanup Phase:** Remove test files
5. **Report Phase:** Generate test results summary