---
description: Post-Spec Creation Validator for Agent OS
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Post-Spec Creation Validator

## Overview

Validates that spec creation followed @~/.agent-os/instructions/core/create-spec.md v2.0 requirements and all expected files/directories exist with proper content, including standardized Agent-OS headers and template compliance.

<validation_flow>

<step number="1" name="directory_structure_validation">

### Step 1: Directory Structure Validation

Verify the spec directory exists and follows proper naming conventions.

<directory_checks>
<spec_directory> - path: .agent-os/specs/YYYY-MM-DD-spec-name/ - naming: date prefix in YYYY-MM-DD format - spec_name: kebab-case, max 5 words
</spec_directory>
<sub_specs_directory> - path: .agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/ - conditional: only if sub-specs were needed
</sub_specs_directory>
</directory_checks>

<validation_criteria>
✅ Directory exists with proper YYYY-MM-DD- prefix
✅ Spec name is kebab-case and ≤5 words
✅ Directory is in .agent-os/specs/
✅ Date format is valid (YYYY-MM-DD)
</validation_criteria>

</step>

<step number="2" name="required_files_validation">

### Step 2: Required Files Validation

Check that all mandatory files exist per create-spec.md requirements.

<required_files>
<always_required> - spec.md - spec-lite.md - tasks.md - status.md - sub-specs/technical-spec.md
</always_required>
<conditional_files> - sub-specs/database-schema.md (if database changes needed) - sub-specs/api-spec.md (if API changes needed)
</conditional_files>
</required_files>

<validation_criteria>
✅ spec.md exists
✅ spec-lite.md exists
✅ tasks.md exists
✅ status.md exists
✅ sub-specs/technical-spec.md exists
ℹ️ sub-specs/api-spec.md exists (if API changes needed)
ℹ️ sub-specs/database-schema.md exists (if database changes needed)
</validation_criteria>

</step>

<step number="3" name="content_structure_validation">

### Step 3: Content Structure Validation

Validate that each file contains the required sections per create-spec.md templates.

<spec_md_validation>
<required_sections> - "# Spec Requirements Document" header - "Overview" section - "User Stories" section - "Spec Scope" section - "Out of Scope" section - "Expected Deliverable" section
</required_sections>
<standardized_header_requirements> - "> Agent-OS: v2.2.0" line - "> Spec: [SPEC_NAME]" line - "> Created: [YYYY-MM-DD]" line - "> Status: Planning" line
</standardized_header_requirements>
<template_compliance> - must follow @~/.agent-os/instructions/core/templates/spec-template.md - all placeholder values replaced with actual content
</template_compliance>
</spec_md_validation>

<spec_lite_md_validation>
<content_requirements> - "# Spec Summary (Lite)" header - 1-3 sentence summary of spec goal - condensed for AI context usage
</content_requirements>
<standardized_header_requirements> - "> Agent-OS: v2.2.0" line - "> Spec: [SPEC_NAME]" line - "> Created: [YYYY-MM-DD]" line - "> Status: Planning" line
</standardized_header_requirements>
<template_compliance> - must follow @~/.agent-os/instructions/core/templates/spec-lite-template.md
</template_compliance>
</spec_lite_md_validation>

<technical_spec_validation>
<required_sections> - "# Technical Specification" header - reference to main spec file - "Technical Requirements" section - "External Dependencies" (conditional)
</required_sections>
<standardized_header_requirements> - "> Agent-OS: v2.2.0" line - "> Spec: [SPEC_NAME]" line - "> Created: [YYYY-MM-DD]" line - "> Status: Planning" line
</standardized_header_requirements>
<template_compliance> - must follow @~/.agent-os/instructions/core/templates/technical-spec-template.md
</template_compliance>
</technical_spec_validation>

<tasks_md_validation>
<structure_requirements> - "# Spec Tasks" header - numbered checklist format - 1-5 major tasks - subtasks in decimal notation (1.1, 1.2) - first subtask typically "Write tests" - last subtask typically "Verify all tests pass"
</structure_requirements>
<standardized_header_requirements> - "> Agent-OS: v2.2.0" line - "> Spec: [SPEC_NAME]" line - "> Created: [YYYY-MM-DD]" line - "> Status: Planning" line
</standardized_header_requirements>
<template_compliance> - must follow @~/.agent-os/instructions/core/templates/tasks-template.md
</template_compliance>
</tasks_md_validation>

<status_md_validation>
<required_fields> - status history - current phase description - next actions checklist
</required_fields>
<standardized_header_requirements> - "> Agent-OS: v2.2.0" line - "> Spec: [SPEC_NAME]" line - "> Created: [YYYY-MM-DD]" line - "> Status: Planning" line - "> Last Updated: [YYYY-MM-DD]" line
</standardized_header_requirements>
<template_compliance> - must follow @~/.agent-os/instructions/core/templates/status-template.md - no duplicate information (header contains all metadata)
</template_compliance>
</status_md_validation>

<api_spec_validation>
<conditional_requirements> - only validate if sub-specs/api-spec.md exists
</conditional_requirements>
<required_sections> - "# API Specification" header - reference to main spec file - "Endpoints" section - "Controllers" section (optional) - "Middleware Integration" section (optional)
</required_sections>
<standardized_header_requirements> - "> Agent-OS: v2.2.0" line - "> Spec: [SPEC_NAME]" line - "> Created: [YYYY-MM-DD]" line - "> Status: Planning" line
</standardized_header_requirements>
<template_compliance> - must follow @~/.agent-os/instructions/core/templates/api-spec-template.md
</template_compliance>
</api_spec_validation>

<database_schema_validation>
<conditional_requirements> - only validate if sub-specs/database-schema.md exists
</conditional_requirements>
<required_sections> - "# Database Schema" header - reference to main spec file - "Schema Changes" section - "Migration Scripts" section (optional) - "Rationale" section
</required_sections>
<standardized_header_requirements> - "> Agent-OS: v2.2.0" line - "> Spec: [SPEC_NAME]" line - "> Created: [YYYY-MM-DD]" line - "> Status: Planning" line
</standardized_header_requirements>
<template_compliance> - must follow @~/.agent-os/instructions/core/templates/database-schema-template.md
</template_compliance>
</database_schema_validation>

</step>

<step number="4" name="lifecycle_integration_validation">

### Step 4: Lifecycle Integration Validation

Verify lifecycle management files were created/updated properly.

<lifecycle_files_check>
<specs_dashboard> - file: .agent-os/specs/specs-dashboard.md - should exist for first spec creation - auto-generated template
</specs_dashboard>
<lifecycle_guide> - file: .agent-os/spec-lifecycle-guide.md - should exist for first spec creation - contains usage instructions
</lifecycle_guide>
<package_json_scripts> - check for dashboard generation scripts - npm run dashboard command
</package_json_scripts>
</lifecycle_files_check>

</step>

<step number="5" name="content_quality_validation">

### Step 5: Content Quality Validation

Validate content meets quality standards from create-spec.md.

<quality_checks>
<overview_section> - length: 1-2 sentences - contains goal and objective
</overview_section>
<user_stories> - count: 1-3 stories - proper format: "As a [USER], I want [ACTION], so that [BENEFIT]" - includes workflow descriptions
</user_stories>
<spec_scope> - count: 1-5 features - numbered list format - one sentence descriptions
</spec_scope>
<expected_deliverables> - count: 1-3 expectations - browser-testable outcomes
</expected_deliverables>
<tasks_breakdown> - follows TDD approach - reasonable task count - proper subtask organization
</tasks_breakdown>
</quality_checks>

</step>

</validation_flow>

## Validation Execution

<execution_process>
<automated_checks> 1. Run directory structure validation 2. Check required files exist 3. Validate file content structure 4. Verify lifecycle integration 5. Assess content quality
</automated_checks>
<reporting> - ✅ Passed validations - ❌ Failed validations with specific issues - ℹ️ Warnings for optional items - 🔧 Actionable fix suggestions
</reporting>
</execution_process>

## Validation Report Template

```markdown
# Spec Creation Validation Report

**Spec:** [SPEC_NAME]
**Validated:** [TIMESTAMP]
**Status:** [PASS/FAIL/WARNINGS]

## ✅ Passed Validations

- Directory structure correct
- All required files present
- Content structure valid
- Agent-OS headers standardized
- Template compliance verified
- [OTHER_PASSED_CHECKS]

## ❌ Failed Validations

- [SPECIFIC_FAILURE_1]: [DESCRIPTION_AND_FIX]
- [SPECIFIC_FAILURE_2]: [DESCRIPTION_AND_FIX]

## ℹ️ Warnings

- [WARNING_1]: [DESCRIPTION]

## 🔧 Recommended Actions

1. [ACTION_1]
2. [ACTION_2]

## Summary

[OVERALL_ASSESSMENT]
```

## Usage Instructions

To run this validator after spec creation:

```bash
@~/.agent-os/instructions/validators/post-spec-creation.md [SPEC_DIRECTORY_PATH]
```

The validator will automatically detect the most recently created spec if no path is provided.
