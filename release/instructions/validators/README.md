# Agent OS Validators

This directory contains validation instructions to ensure spec creation and task completion follow Agent OS standards.

## Available Validators

### Post-Spec Creation Validator
**File:** `post-spec-creation.md`  
**Purpose:** Validates that spec creation followed create-spec.md requirements  
**Usage:** `@~/.agent-os/instructions/validators/post-spec-creation.md`

Validates:
- Directory structure and naming conventions
- Required files exist (spec.md, spec-lite.md, tasks.md, status.md, etc.)
- Content structure matches templates
- Lifecycle integration files created
- Content quality meets standards

### Parent Task Completion Validator  
**File:** `parent-task-completion.md`  
**Purpose:** Validates that parent tasks are completed correctly per execute-task.md workflow  
**Usage:** `@~/.agent-os/instructions/validators/parent-task-completion.md [TASK_NUMBER]`

Validates:
- All subtasks marked as complete
- Expected deliverables exist and function
- Tests pass successfully  
- Implementation matches technical specifications
- Code quality standards met
- User stories satisfied

## Integration with Workflow

These validators are integrated into the core Agent OS workflow:

1. **create-spec.md** - Automatically runs post-spec creation validator before proceeding to implementation
2. **execute-task.md** - Automatically runs parent task completion validator after each parent task

## Command Shortcuts

Use these shortcuts for manual validation:

```bash
# Validate spec creation
@validate-spec

# Validate task completion  
@validate-task
```

## Manual Usage

You can also run validators manually at any time:

```bash
# Validate a specific spec
@~/.agent-os/instructions/validators/post-spec-creation.md .agent-os/specs/2025-01-15-password-reset/

# Validate a specific parent task
@~/.agent-os/instructions/validators/parent-task-completion.md 1 .agent-os/specs/2025-01-15-password-reset/
```

## Benefits

- **Quality Assurance:** Ensures consistent spec and implementation quality
- **Error Prevention:** Catches missing files, incomplete tasks, and standard violations early
- **Process Compliance:** Validates adherence to Agent OS workflows
- **Debugging Support:** Provides detailed reports with actionable fix suggestions