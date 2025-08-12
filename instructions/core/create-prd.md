---
description: Create a Product Requirements Document (PRD) following industry best practices
globs: ["**/*.md", "**/*.txt"]
alwaysApply: false
---

# Create Product Requirements Document (PRD)

**WORKFLOW**: Execute steps 1-8 automatically (PRD creation and review request), then PAUSE for user approval before continuing with steps 9-12 (roadmap, implementation timeline, and status). This allows users to review and approve the PRD before creating planning documents.

## Overview

This instruction creates a comprehensive Product Requirements Document (PRD) that bridges strategic vision with technical implementation. The PRD follows industry best practices and provides clear product direction for development teams.

## Step 1: Determine Product Scope

**ASK**: "What is the scope of this product requirements document?"

- **New Product**: Complete new product development
- **Feature Addition**: New feature for existing product
- **Product Enhancement**: Major improvement to existing product
- **Product Migration**: Moving to new technology/platform

## Step 2: Gather Strategic Context

**ASK**: "What strategic objectives does this product support?"

- Strategic vision alignment
- Market opportunity
- Business goals
- Success metrics

## Step 3: Create PRD Document

Create file: `@~/.agent-os/product/YYYY-MM-DD-prd-[product-name]/prd.md`

Use template: `@~/.agent-os/instructions/core/templates/prd-template.md`

## Step 4: Create PRD Summary

Create file: `@~/.agent-os/product/YYYY-MM-DD-prd-[product-name]/prd-lite.md`

Use template: `@~/.agent-os/instructions/core/templates/prd-lite-template.md`

## Step 5: Create User Stories

Create file: `@~/.agent-os/product/YYYY-MM-DD-prd-[product-name]/user-stories.md`

Use template: `@~/.agent-os/instructions/core/templates/user-stories-template.md`

## Step 6: Create Acceptance Criteria

Create file: `@~/.agent-os/product/YYYY-MM-DD-prd-[product-name]/acceptance-criteria.md`

Use template: `@~/.agent-os/instructions/core/templates/acceptance-criteria-template.md`

## Step 7: Create Status Tracking

Create file: `@~/.agent-os/product/YYYY-MM-DD-prd-[product-name]/status.md`

Use template: `@~/.agent-os/instructions/core/templates/prd-status-template.md`

## Step 8: User Review and Approval

✅ **PRD Creation Complete!** I've created the product requirements files:

- **PRD Document**: @~/.agent-os/product/YYYY-MM-DD-prd-[product-name]/prd.md
- **PRD Summary**: @~/.agent-os/product/YYYY-MM-DD-prd-[product-name]/prd-lite.md
- **User Stories**: @~/.agent-os/product/YYYY-MM-DD-prd-[product-name]/user-stories.md
- **Acceptance Criteria**: @~/.agent-os/product/YYYY-MM-DD-prd-[product-name]/acceptance-criteria.md
- **Status Tracking**: @~/.agent-os/product/YYYY-MM-DD-prd-[product-name]/status.md

📋 **Next Steps:**

1. **Review** the PRD documents above
2. **If approved**: Reply with "approved" or "continue" to create roadmap and implementation timeline
3. **If changes needed**: Let me know what to modify

⚠️ **Note**: I'm pausing here so you can review the PRD before I create the planning documents.

**To continue after approval**: I'll automatically proceed with creating the product roadmap and implementation timeline.

## Step 9: Create Product Roadmap

**TRIGGER**: User approval from Step 8 (keywords: "approved", "continue", "yes", or "proceed")

Create file: `@~/.agent-os/product/YYYY-MM-DD-prd-[product-name]/product-roadmap.md`

Use template: `@~/.agent-os/instructions/core/templates/product-roadmap-template.md`

## Step 10: Create Implementation Timeline

Create file: `@~/.agent-os/product/YYYY-MM-DD-prd-[product-name]/implementation-timeline.md`

Use template: `@~/.agent-os/instructions/core/templates/implementation-timeline-template.md`

## Step 11: Create Feature Prioritization

Create file: `@~/.agent-os/product/YYYY-MM-DD-prd-[product-name]/feature-prioritization.md`

Use template: `@~/.agent-os/instructions/core/templates/feature-prioritization-template.md`

## Step 12: Update Status and Create Traceability

Update status.md to reflect completion and create traceability links to strategic documents and technical specifications.

## Final Integration

Link this PRD to relevant strategic documents and create cross-references for future traceability with technical specifications.

---

**Note**: This PRD will be referenced by technical specifications to ensure product requirements are properly implemented according to strategic objectives.
