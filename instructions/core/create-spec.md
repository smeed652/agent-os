---
description: Spec Creation Rules for Agent OS
globs:
alwaysApply: false
version: 2.1
encoding: UTF-8
---

# Spec Creation Rules

## Overview

Generate detailed feature specifications aligned with product roadmap and mission using modular templates for consistency and maintainability.

<pre_flight_check>
EXECUTE: @~/.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

**WORKFLOW**: Execute steps 1-11 automatically (spec creation and review request), then PAUSE for user approval before continuing with steps 12-16 (tasks and status files). This allows users to review and approve the specification before task breakdown.

<step number="1" name="spec_initiation">

### Step 1: Spec Initiation

Identify spec initiation method by either finding the next uncompleted roadmap item when user asks "what's next?" or accepting a specific spec idea from the user.

<directory_selection>
<spec_types> - **Framework Testing**: Use `.agent-os/specs/` for testing the Agent-OS framework itself - **Project Features**: Use `.agent-os/project-specs/` for actual project feature specifications
</spec_types>
<selection_process> 1. ASK user: "Is this a framework test spec or a project feature spec?" 2. IF framework test: SET target_directory = ".agent-os/specs/" 3. IF project feature: SET target_directory = ".agent-os/project-specs/" 4. STORE target_directory for use in subsequent steps
</selection_process>
</directory_selection>

<option_a_flow>
<trigger_phrases> - "what's next?"
</trigger_phrases>
<actions> 1. CHECK @.agent-os/product/roadmap.md 2. FIND next uncompleted item 3. SUGGEST item to user 4. WAIT for approval
</actions>
</option_a_flow>

<option_b_flow>
<trigger>user describes specific spec idea</trigger>
<accept>any format, length, or detail level</accept>
<proceed>to context gathering</proceed>
</option_b_flow>

</step>

<step number="2" name="context_gathering">

### Step 2: Context Gathering (Conditional)

Read @.agent-os/product/mission-lite.md and @.agent-os/product/tech-stack.md only if not already in context to ensure minimal context for spec alignment.

<conditional_logic>
IF both mission-lite.md AND tech-stack.md already read in current context:
SKIP this entire step
PROCEED to step 3
ELSE:
READ only files not already in context: - mission-lite.md (if not in context) - tech-stack.md (if not in context)
CONTINUE with context analysis
</conditional_logic>

</step>

<step number="3" name="requirements_clarification">

### Step 3: Requirements Clarification

Clarify scope boundaries and technical considerations by asking numbered questions as needed to ensure clear requirements before proceeding.

<clarification_areas>
<scope> - in_scope: what is included - out_of_scope: what is excluded (optional)
</scope>
<technical> - functionality specifics - UI/UX requirements - integration points
</technical>
</clarification_areas>

</step>

<step number="4" name="date_determination">

### Step 4: Date Determination

Determine accurate date for folder naming by creating a temporary file to extract timestamp in YYYY-MM-DD format, falling back to asking user if needed.

<date_determination_process>
<primary_method> 1. CREATE directory if not exists: [target_directory] (from step 1) 2. CREATE temporary file: [target_directory]/.date-check 3. READ file creation timestamp from filesystem 4. EXTRACT date in YYYY-MM-DD format 5. DELETE temporary file 6. STORE date in variable for folder naming
</primary_method>
<fallback_method> 1. STATE: "I need to confirm today's date for the spec folder" 2. ASK: "What is today's date? (YYYY-MM-DD format)" 3. WAIT for user response 4. VALIDATE format matches YYYY-MM-DD 5. STORE date for folder naming
</fallback_method>
</date_determination_process>

</step>

<step number="5" name="spec_folder_creation">

### Step 5: Spec Folder Creation

Create directory: [target_directory]/YYYY-MM-DD-spec-name/ using the date from step 4 and target_directory from step 1.

<folder_naming>
<format>YYYY-MM-DD-spec-name</format>
<name_constraints> - max_words: 5 - style: kebab-case - descriptive: true
</name_constraints>
</folder_naming>

</step>

<step number="6" name="create_spec_md">

### Step 6: Create spec.md

Create the file: [target_directory]/YYYY-MM-DD-spec-name/spec.md using the template: @~/.agent-os/instructions/core/templates/spec-template.md

<template_guidelines>
<overview> - length: 1-2 sentences - content: goal and objective
</overview>
<user_stories> - count: 1-3 stories - include: workflow and problem solved - format: title + story + details
</user_stories>
<spec_scope> - count: 1-5 features - format: numbered list - description: one sentence each
</spec_scope>
<expected_deliverable> - count: 1-3 expectations - focus: browser-testable outcomes
</expected_deliverable>
</template_guidelines>



</step>

<step number="7" name="create_spec_lite_md">

### Step 7: Create spec-lite.md

Create the file: [target_directory]/YYYY-MM-DD-spec-name/spec-lite.md using the template: @~/.agent-os/instructions/core/templates/spec-lite-template.md

<content_guidelines>
- length: 1-3 sentences
- content: core goal and objective of the feature
- source: Step 6 spec.md overview section
</content_guidelines>



</step>

<step number="8" name="create_technical_spec">

### Step 8: Create Technical Specification

Create the file: sub-specs/technical-spec.md using the template: @~/.agent-os/instructions/core/templates/technical-spec-template.md

<conditional_logic>
IF spec_requires_new_external_dependencies:
INCLUDE "External Dependencies" section
ELSE:
OMIT section entirely
</conditional_logic>

</step>

<step number="9" name="create_database_schema">

### Step 9: Create Database Schema (Conditional)

Create the file: sub-specs/database-schema.md ONLY IF database changes needed for this task using the template: @~/.agent-os/instructions/core/templates/database-schema-template.md

<decision_tree>
IF spec_requires_database_changes:
CREATE sub-specs/database-schema.md
ELSE:
SKIP this_step
</decision_tree>

</step>

<step number="10" name="create_api_spec">

### Step 10: Create API Specification (Conditional)

Create file: sub-specs/api-spec.md ONLY IF API changes needed using the template: @~/.agent-os/instructions/core/templates/api-spec-template.md

<decision_tree>
IF spec_requires_api_changes:
CREATE sub-specs/api-spec.md
ELSE:
SKIP this_step
</decision_tree>

</step>

<step number="11" name="user_review">

### Step 11: User Review

AFTER completing steps 6-10 (creating all spec files), request user review of spec.md and all sub-specs files, waiting for approval or revision requests before proceeding to task creation.

<review_request>
✅ **Spec Creation Complete!** I've created the specification files:

- **Spec Requirements**: @[target_directory]/YYYY-MM-DD-spec-name/spec.md
- **Spec Summary**: @[target_directory]/YYYY-MM-DD-spec-name/spec-lite.md  
- **Technical Spec**: @[target_directory]/YYYY-MM-DD-spec-name/sub-specs/technical-spec.md
[LIST_OTHER_CREATED_SPECS]

📋 **Next Steps:**
1. **Review** the specification files above
2. **If approved**: Reply with "approved" or "continue" to create tasks.md and status.md
3. **If changes needed**: Let me know what to modify

⚠️ **Note**: I'm pausing here so you can review the spec before I create the task breakdown and status files.

**To continue after approval**: I'll automatically proceed with creating tasks.md and status.md, then present the first implementation task.
</review_request>

</step>

<step number="12" name="create_tasks">

### Step 12: Create tasks.md

**TRIGGER**: User approval from Step 11 (keywords: "approved", "continue", "yes", or "proceed")

Create file: tasks.md using the template: @~/.agent-os/instructions/core/templates/tasks-template.md

<task_guidelines>
<major_tasks> - count: 1-5 - format: numbered checklist - grouping: by feature or component
</major_tasks>
<subtasks> - count: up to 8 per major task - format: decimal notation (1.1, 1.2) - first_subtask: typically write tests - last_subtask: verify all tests pass
</subtasks>
<ordering_principles> - Consider technical dependencies - Follow TDD approach - Group related functionality - Build incrementally
</ordering_principles>
</task_guidelines>

</step>

<step number="13" name="create_status">

### Step 13: Create status.md

Create file: status.md for lifecycle management using the template: @~/.agent-os/instructions/core/templates/status-template.md

<lifecycle_integration>
<status_tracking> - planning: Spec created, ready for implementation - active: Implementation in progress - completed: Implementation finished, ready for cleanup - archived: Spec archived, minimal maintenance
</status_tracking>

<folder_naming> - planning-YYYY-MM-DD-spec-name (backlog) - active-YYYY-MM-DD-spec-name (in progress) - completed-YYYY-MM-DD-spec-name (done) - archived/YYYY-MM-DD-spec-name (archived)
</folder_naming>
</lifecycle_integration>

</step>

<step number="14" name="create_lifecycle_files">

### Step 14: Create Lifecycle Management Files (Conditional)

Use the file-creator subagent to create lifecycle management files ONLY if this is the first spec in the project.

<conditional_creation>
<if_first_spec> - Create specs-dashboard.md if it doesn't exist - Create spec-lifecycle-guide.md if it doesn't exist - Add dashboard generation script to package.json if it doesn't exist
</if_first_spec>

<if_not_first_spec> - Skip creating dashboard and guide files - Only create status.md for current spec
</if_not_first_spec>
</conditional_creation>

</step>

<step number="15" name="decision_documentation">

### Step 15: Decision Documentation (Conditional)

Evaluate strategic impact without loading decisions.md and update it only if there's significant deviation from mission/roadmap and user approves.

<decision_analysis>
<criteria> - significantly deviates from mission in mission-lite.md - significantly changes or conflicts with roadmap.md
</criteria>
</decision_analysis>

<decision_tree>
IF spec_does_NOT_significantly_deviate:
SKIP this entire step
STATE "Spec aligns with mission and roadmap"
PROCEED to step 16
ELSE IF spec_significantly_deviates:
EXPLAIN the significant deviation
ASK user: "This spec significantly deviates from our mission/roadmap. Should I draft a decision entry?"
IF user_approves:
DRAFT decision entry
UPDATE decisions.md
ELSE:
SKIP updating decisions.md
PROCEED to step 16
</decision_tree>

</step>

<step number="16" name="execution_readiness">

### Step 16: Execution Readiness Check

Evaluate readiness to begin implementation after completing all previous steps, presenting the first task summary and requesting user confirmation to proceed.

<execution_prompt>
PROMPT: "The spec planning is complete. The first task is:

**Task 1:** [FIRST_TASK_TITLE]
[BRIEF_DESCRIPTION_OF_TASK_1_AND_SUBTASKS]

**Note:** I will create a feature branch for this implementation to keep the main branch clean and enable proper code review.

Would you like me to proceed with implementing Task 1? I will focus only on this first task and its subtasks unless you specify otherwise.

Type 'yes' to proceed with Task 1, or let me know if you'd like to review or modify the plan first."
</execution_prompt>

<execution_flow>
IF user_confirms_yes:
EXECUTE: @~/.agent-os/instructions/validators/post-spec-creation.md
REFERENCE: @~/.agent-os/instructions/core/execute-tasks.md
FOCUS: Only Task 1 and its subtasks
CONSTRAINT: Do not proceed to additional tasks without explicit user request
ELSE:
WAIT: For user clarification or modifications
</execution_flow>

</step>

</process_flow>

## Execution Standards

<standards>
  <follow>
    - @.agent-os/product/code-style.md
    - @.agent-os/product/dev-best-practices.md
    - @.agent-os/product/tech-stack.md
  </follow>
  <maintain>
    - Consistency with product mission
    - Alignment with roadmap
    - Technical coherence
  </maintain>
  <create>
    - Comprehensive documentation
    - Clear implementation path
    - Testable outcomes
  </create>
</standards>

<final_checklist>
<verify> - [ ] Accurate date determined via file system - [ ] Spec folder created with correct date prefix - [ ] spec.md contains all required sections - [ ] All applicable sub-specs created - [ ] User approved documentation - [ ] tasks.md created with TDD approach - [ ] Cross-references added to spec.md - [ ] Strategic decisions evaluated
</verify>
</final_checklist>
