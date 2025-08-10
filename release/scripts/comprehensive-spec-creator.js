#!/usr/bin/env node

/**
 * Agent-OS Comprehensive Spec Creator
 * Creates complete spec ecosystems with all supporting files as specified in the instructions
 */

const DocumentVersioner = require('./document-versioner.js');
const fs = require('fs');
const path = require('path');

class ComprehensiveSpecCreator {
  constructor() {
    this.versioner = new DocumentVersioner();
    this.creationDate = new Date().toISOString().split('T')[0];
  }

  async createCompleteSpec(specName, title) {
    try {
      // Step 1: Create spec directory with date prefix
      const dirName = `${this.creationDate}-${specName}`;
      let specDir;
      
      if (fs.existsSync('specs')) {
        specDir = path.join('specs', dirName);
      } else {
        specDir = dirName;
      }
      
      if (!fs.existsSync(specDir)) {
        fs.mkdirSync(specDir, { recursive: true });
        console.log(`📁 Created directory: ${specDir}`);
      }

      // Step 2: Create sub-specs directory
      const subSpecsDir = path.join(specDir, 'sub-specs');
      if (!fs.existsSync(subSpecsDir)) {
        fs.mkdirSync(subSpecsDir, { recursive: true });
        console.log(`📁 Created sub-specs directory: ${subSpecsDir}`);
      }

      const createdFiles = [];

      // Step 3: Create spec.md
      const specFile = path.join(specDir, 'spec.md');
      const specContent = this.generateSpecMd(title, specName);
      fs.writeFileSync(specFile, specContent);
      createdFiles.push('spec.md');
      console.log(`📄 Created: ${specFile}`);

      // Step 4: Create spec-lite.md
      const specLiteFile = path.join(specDir, 'spec-lite.md');
      const specLiteContent = this.generateSpecLiteMd(title);
      fs.writeFileSync(specLiteFile, specLiteContent);
      createdFiles.push('spec-lite.md');
      console.log(`📄 Created: ${specLiteFile}`);

      // Step 5: Create technical-spec.md
      const technicalSpecFile = path.join(subSpecsDir, 'technical-spec.md');
      const technicalSpecContent = this.generateTechnicalSpecMd(title, specName);
      fs.writeFileSync(technicalSpecFile, technicalSpecContent);
      createdFiles.push('sub-specs/technical-spec.md');
      console.log(`📄 Created: ${technicalSpecFile}`);

      // Step 6: Create tasks.md
      const tasksFile = path.join(specDir, 'tasks.md');
      const tasksContent = this.generateTasksMd(title);
      fs.writeFileSync(tasksFile, tasksContent);
      createdFiles.push('tasks.md');
      console.log(`📄 Created: ${tasksFile}`);

      // Step 7: Create status.md
      const statusFile = path.join(specDir, 'status.md');
      const statusContent = this.generateStatusMd(specName, title);
      fs.writeFileSync(statusFile, statusContent);
      createdFiles.push('status.md');
      console.log(`📄 Created: ${statusFile}`);

      // Step 8: Create lifecycle management files
      await this.createLifecycleFiles(specDir);

      return {
        success: true,
        specDir: specDir,
        files: createdFiles
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateSpecMd(title, specName) {
    return `# Spec Requirements Document

> Spec: ${specName}
> Created: ${this.creationDate}
> Status: Planning

## Overview

[1-2_SENTENCE_GOAL_AND_OBJECTIVE]

## User Stories

### [STORY_TITLE]

As a [USER_TYPE], I want to [ACTION], so that [BENEFIT].

[DETAILED_WORKFLOW_DESCRIPTION]

## Spec Scope

1. **[FEATURE_NAME]** - [ONE_SENTENCE_DESCRIPTION]
2. **[FEATURE_NAME]** - [ONE_SENTENCE_DESCRIPTION]

## Out of Scope

- [EXCLUDED_FUNCTIONALITY_1]
- [EXCLUDED_FUNCTIONALITY_2]

## Expected Deliverable

1. [TESTABLE_OUTCOME_1]
2. [TESTABLE_OUTCOME_2]

---

> Type: Technical Specification
> Agent-OS Version: ${this.versioner.agentOsVersion}
> Created: ${this.creationDate}
> Last Updated: ${this.creationDate}
> Status: Planning
> Author: Agent-OS
> Reviewers: TBD`;
  }

  generateSpecLiteMd(title) {
    return `# Spec Summary (Lite)

[1-3_SENTENCES_SUMMARIZING_SPEC_GOAL_AND_OBJECTIVE]

---

> Type: Document
> Agent-OS Version: ${this.versioner.agentOsVersion}
> Created: ${this.creationDate}
> Last Updated: ${this.creationDate}
> Status: Planning
> Author: Agent-OS
> Reviewers: TBD`;
  }

  generateTechnicalSpecMd(title, specName) {
    return `# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/${this.creationDate}-${specName}/spec.md

## Technical Requirements

- [SPECIFIC_TECHNICAL_REQUIREMENT]
- [SPECIFIC_TECHNICAL_REQUIREMENT]

## External Dependencies (Conditional)

[ONLY_IF_NEW_DEPENDENCIES_NEEDED]
- **[LIBRARY_NAME]** - [PURPOSE]
- **Justification:** [REASON_FOR_INCLUSION]

---

> Type: Technical Specification
> Agent-OS Version: ${this.versioner.agentOsVersion}
> Created: ${this.creationDate}
> Last Updated: ${this.creationDate}
> Status: Planning
> Author: Agent-OS
> Reviewers: TBD`;
  }

  generateTasksMd(title) {
    return `# Spec Tasks

## Tasks

- [ ] 1. [MAJOR_TASK_DESCRIPTION]
  - [ ] 1.1 Write tests for [COMPONENT]
  - [ ] 1.2 [IMPLEMENTATION_STEP]
  - [ ] 1.3 [IMPLEMENTATION_STEP]
  - [ ] 1.4 Verify all tests pass

- [ ] 2. [MAJOR_TASK_DESCRIPTION]
  - [ ] 2.1 Write tests for [COMPONENT]
  - [ ] 2.2 [IMPLEMENTATION_STEP]

- [ ] 3. Code Refactoring and Optimization (Post-UI Approval)
  - [ ] 3.1 Analyze codebase for optimization opportunities
  - [ ] 3.2 Create refactoring plan and get user approval
  - [ ] 3.3 Extract common functionality and split large files
  - [ ] 3.4 Optimize performance and improve error handling
  - [ ] 3.5 Verify all functionality and UI remain unchanged
  - [ ] 3.6 Confirm all tests pass and code quality improved

---

> Type: Document
> Agent-OS Version: ${this.versioner.agentOsVersion}
> Created: ${this.creationDate}
> Last Updated: ${this.creationDate}
> Status: Planning
> Author: Agent-OS
> Reviewers: TBD`;
  }

  generateStatusMd(specName, title) {
    return `# Spec Status

**Spec Name**: ${title}
**Created**: ${this.creationDate}
**Current Status**: planning
**Last Updated**: ${this.creationDate}

## Status History
- ${this.creationDate} - Created (planning)

## Current Phase
Spec is in planning phase. Ready for implementation when resources are available.

## Next Actions
- [ ] Review spec requirements
- [ ] Prioritize against other specs
- [ ] Begin implementation when approved

## Notes
[ANY_RELEVANT_NOTES_FROM_SPEC_CREATION]

---

> Type: Document
> Agent-OS Version: ${this.versioner.agentOsVersion}
> Created: ${this.creationDate}
> Last Updated: ${this.creationDate}
> Status: Planning
> Author: Agent-OS
> Reviewers: TBD`;
  }

  async createLifecycleFiles(specDir) {
    try {
      // Create specs dashboard if it doesn't exist
      const specsDashboardPath = path.join(path.dirname(specDir), 'specs-dashboard.md');
      if (!fs.existsSync(specsDashboardPath)) {
        const dashboardContent = this.generateSpecsDashboard();
        fs.writeFileSync(specsDashboardPath, dashboardContent);
        console.log(`📄 Created: specs-dashboard.md`);
      }

      // Create lifecycle guide if it doesn't exist
      const lifecycleGuidePath = path.join(path.dirname(specDir), 'spec-lifecycle-guide.md');
      if (!fs.existsSync(lifecycleGuidePath)) {
        const guideContent = this.generateLifecycleGuide();
        fs.writeFileSync(lifecycleGuidePath, guideContent);
        console.log(`📄 Created: spec-lifecycle-guide.md`);
      }
    } catch (error) {
      console.warn(`⚠️  Warning: Could not create lifecycle files: ${error.message}`);
    }
  }

  generateSpecsDashboard() {
    return `# Specs Dashboard

> Auto-generated dashboard for spec lifecycle management
> Last updated: ${this.creationDate}

## 📋 Planning (Backlog)
*No planning specs*

## 🔄 Active (In Progress)
*No active specs*

## ✅ Completed (Done)
*No completed specs*

## 🗄️ Archived
*No archived specs*

## 📊 Summary
- **Planning**: 0 specs
- **Active**: 0 specs
- **Completed**: 0 specs
- **Archived**: 0 specs
- **Total**: 0 specs

---

> Type: Document
> Agent-OS Version: ${this.versioner.agentOsVersion}
> Created: ${this.creationDate}
> Last Updated: ${this.creationDate}
> Status: Planning
> Author: Agent-OS
> Reviewers: TBD

---
*Dashboard generated automatically. Update spec status files to refresh this dashboard.*`;
  }

  generateLifecycleGuide() {
    return `# Spec Lifecycle Management Guide

## Quick Reference

### Status Categories
- **Planning**: Specs ready for implementation
- **Active**: Specs currently being implemented
- **Completed**: Specs finished and tested
- **Archived**: Specs cleaned up and archived

### Folder Naming Convention
- \`planning-YYYY-MM-DD-spec-name\` (backlog)
- \`active-YYYY-MM-DD-spec-name\` (in progress)
- \`completed-YYYY-MM-DD-spec-name\` (done)
- \`archived/YYYY-MM-DD-spec-name\` (archived)

### Commands
\`\`\`bash
# Generate dashboard
npm run dashboard

# Move spec to active
mv .agent-os/specs/planning-YYYY-MM-DD-spec-name .agent-os/specs/active-YYYY-MM-DD-spec-name

# Move spec to completed
mv .agent-os/specs/active-YYYY-MM-DD-spec-name .agent-os/specs/completed-YYYY-MM-DD-spec-name

# Archive completed spec
mv .agent-os/specs/completed-YYYY-MM-DD-spec-name .agent-os/specs/archived/YYYY-MM-DD-spec-name
\`\`\`

## Status File Template
Each spec should have a \`status.md\` file:
\`\`\`markdown
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
\`\`\`

---

> Type: Guide
> Agent-OS Version: ${this.versioner.agentOsVersion}
> Created: ${this.creationDate}
> Last Updated: ${this.creationDate}
> Status: Planning
> Author: Agent-OS
> Reviewers: TBD`;
  }
}

// CLI interface
if (require.main === module) {
  const creator = new ComprehensiveSpecCreator();
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Agent-OS Comprehensive Spec Creator');
    console.log('Usage:');
    console.log('  node comprehensive-spec-creator.js <spec-name> <title>');
    console.log('');
    console.log('Example:');
    console.log('  node comprehensive-spec-creator.js my-new-feature "My New Feature Implementation"');
    console.log('');
    console.log('This will create a complete spec ecosystem with all supporting files.');
    process.exit(1);
  }
  
  const specName = args[0];
  const title = args[1];
  
  creator.createCompleteSpec(specName, title)
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Complete spec ecosystem created successfully!');
        console.log(`📁 Directory: ${result.specDir}`);
        console.log(`📄 Files created: ${result.files.join(', ')}`);
      } else {
        console.error(`❌ Failed to create spec: ${result.error}`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    });
}

module.exports = ComprehensiveSpecCreator;
