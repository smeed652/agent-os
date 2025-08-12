---
description: Create an Architecture Decision Record (ADR) following industry best practices
globs: ["**/*.md", "**/*.txt"]
alwaysApply: false
---

# Create Architecture Decision Record (ADR)

**WORKFLOW**: Execute steps 1-7 automatically (ADR creation and review request), then PAUSE for user approval before continuing with steps 8-10 (implementation plan and status). This allows users to review and approve the ADR before creating implementation details.

## Overview

This instruction creates a comprehensive Architecture Decision Record (ADR) that documents important architectural decisions, their rationale, and consequences. ADRs follow industry best practices and provide traceability for technical decisions.

## Step 1: Determine ADR Type

**ASK**: "What type of architecture decision are we documenting?"

- **Technology Choice**: Framework, language, tool selection
- **System Design**: Architecture pattern, component design
- **Integration Decision**: API design, data flow, interfaces
- **Infrastructure**: Deployment, scaling, security decisions
- **Process Decision**: Development methodology, workflow changes

## Step 2: Gather Decision Context

**ASK**: "What is the decision context and alternatives considered?"

- Current situation and problem statement
- Alternatives evaluated
- Decision criteria
- Stakeholders involved

## Step 3: Create ADR Document

Create file: `@~/.agent-os/architecture/YYYY-MM-DD-adr-###-[decision-name]/adr.md`

Use template: `@~/.agent-os/instructions/core/templates/adr-template.md`

## Step 4: Create ADR Summary

Create file: `@~/.agent-os/architecture/YYYY-MM-DD-adr-###-[decision-name]/adr-lite.md`

Use template: `@~/.agent-os/instructions/core/templates/adr-lite-template.md`

## Step 5: Create Technical Specification

Create file: `@~/.agent-os/architecture/YYYY-MM-DD-adr-###-[decision-name]/technical-spec.md`

Use template: `@~/.agent-os/instructions/core/templates/adr-technical-spec-template.md`

## Step 6: Create Status Tracking

Create file: `@~/.agent-os/architecture/YYYY-MM-DD-adr-###-[decision-name]/status.md`

Use template: `@~/.agent-os/instructions/core/templates/adr-status-template.md`

## Step 7: User Review and Approval

✅ **ADR Creation Complete!** I've created the architecture decision files:

- **ADR Document**: @~/.agent-os/architecture/YYYY-MM-DD-adr-###-[decision-name]/adr.md
- **ADR Summary**: @~/.agent-os/architecture/YYYY-MM-DD-adr-###-[decision-name]/adr-lite.md
- **Technical Spec**: @~/.agent-os/architecture/YYYY-MM-DD-adr-###-[decision-name]/technical-spec.md
- **Status Tracking**: @~/.agent-os/architecture/YYYY-MM-DD-adr-###-[decision-name]/status.md

📋 **Next Steps:**

1. **Review** the ADR documents above
2. **If approved**: Reply with "approved" or "continue" to create implementation plan and update status
3. **If changes needed**: Let me know what to modify

⚠️ **Note**: I'm pausing here so you can review the ADR before I create the implementation details.

**To continue after approval**: I'll automatically proceed with creating the implementation plan and updating the status.

## Step 8: Create Implementation Plan

**TRIGGER**: User approval from Step 7 (keywords: "approved", "continue", "yes", or "proceed")

Create file: `@~/.agent-os/architecture/YYYY-MM-DD-adr-###-[decision-name]/implementation-plan.md`

Use template: `@~/.agent-os/instructions/core/templates/adr-implementation-template.md`

## Step 9: Create Impact Analysis

Create file: `@~/.agent-os/architecture/YYYY-MM-DD-adr-###-[decision-name]/impact-analysis.md`

Use template: `@~/.agent-os/instructions/core/templates/adr-impact-template.md`

## Step 10: Update Status and Create Traceability

Update status.md to reflect approval and create traceability links to related strategic and product documents.

## Final Integration

Link this ADR to relevant strategic documents and create cross-references for future traceability.

---

**Note**: This ADR will be referenced by product requirements and technical specifications to ensure architectural decisions are properly implemented.
