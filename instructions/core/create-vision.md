---
description: Create a strategic vision document following industry best practices
globs: ["**/*.md", "**/*.txt"]
alwaysApply: false
---

# Create Strategic Vision

**WORKFLOW**: Execute steps 1-8 automatically (vision creation and review request), then PAUSE for user approval before continuing with steps 9-12 (mission, values, and strategic map). This allows users to review and approve the vision before creating supporting strategic documents.

## Overview

This instruction creates a comprehensive strategic vision document that serves as the foundation for all other strategic planning. The vision document follows industry best practices and provides a clear direction for the organization.

## Step 1: Determine Vision Type

**ASK**: "What type of strategic vision are we creating?"

- **Organization Vision**: Overall company/organization direction
- **Product Vision**: Specific product or service direction
- **Department Vision**: Team or department strategic direction
- **Project Vision**: Individual project strategic direction

## Step 2: Gather Context Information

**ASK**: "What is the current state and desired future state?"

- Current market position
- Key challenges and opportunities
- Desired future outcomes
- Timeline for achievement

## Step 3: Create Vision Document

Create file: `@~/.agent-os/strategic/YYYY-MM-DD-vision-[organization-name]/vision.md`

Use template: `@~/.agent-os/instructions/core/templates/vision-template.md`

## Step 4: Create Vision Summary

Create file: `@~/.agent-os/strategic/YYYY-MM-DD-vision-[organization-name]/vision-lite.md`

Use template: `@~/.agent-os/instructions/core/templates/vision-lite-template.md`

## Step 5: Create Strategic Context

Create file: `@~/.agent-os/strategic/YYYY-MM-DD-vision-[organization-name]/strategic-context.md`

Use template: `@~/.agent-os/instructions/core/templates/strategic-context-template.md`

## Step 6: Create Status Tracking

Create file: `@~/.agent-os/strategic/YYYY-MM-DD-vision-[organization-name]/status.md`

Use template: `@~/.agent-os/instructions/core/templates/vision-status-template.md`

## Step 7: Create Strategic Map Foundation

Create file: `@~/.agent-os/strategic/YYYY-MM-DD-vision-[organization-name]/strategic-map.md`

Use template: `@~/.agent-os/instructions/core/templates/strategic-map-template.md`

## Step 8: User Review and Approval

✅ **Vision Creation Complete!** I've created the strategic vision files:

- **Vision Document**: @~/.agent-os/strategic/YYYY-MM-DD-vision-[organization-name]/vision.md
- **Vision Summary**: @~/.agent-os/strategic/YYYY-MM-DD-vision-[organization-name]/vision-lite.md
- **Strategic Context**: @~/.agent-os/strategic/YYYY-MM-DD-vision-[organization-name]/strategic-context.md
- **Status Tracking**: @~/.agent-os/strategic/YYYY-MM-DD-vision-[organization-name]/status.md
- **Strategic Map**: @~/.agent-os/strategic/YYYY-MM-DD-vision-[organization-name]/strategic-map.md

📋 **Next Steps:**

1. **Review** the vision documents above
2. **If approved**: Reply with "approved" or "continue" to create mission, values, and complete strategic map
3. **If changes needed**: Let me know what to modify

⚠️ **Note**: I'm pausing here so you can review the vision before I create the supporting strategic documents.

**To continue after approval**: I'll automatically proceed with creating mission, values, and completing the strategic map.

## Step 9: Create Mission Statement

**TRIGGER**: User approval from Step 8 (keywords: "approved", "continue", "yes", or "proceed")

Create file: `@~/.agent-os/strategic/YYYY-MM-DD-vision-[organization-name]/mission.md`

Use template: `@~/.agent-os/instructions/core/templates/mission-template.md`

## Step 10: Create Core Values

Create file: `@~/.agent-os/strategic/YYYY-MM-DD-vision-[organization-name]/values.md`

Use template: `@~/.agent-os/instructions/core/templates/values-template.md`

## Step 11: Complete Strategic Map

Update file: `@~/.agent-os/strategic/YYYY-MM-DD-vision-[organization-name]/strategic-map.md`

Add mission and values integration using template: `@~/.agent-os/instructions/core/templates/strategic-map-complete-template.md`

## Step 12: Create Strategic Roadmap

Create file: `@~/.agent-os/strategic/YYYY-MM-DD-vision-[organization-name]/strategic-roadmap.md`

Use template: `@~/.agent-os/instructions/core/templates/strategic-roadmap-template.md`

## Final Status Update

Update status.md to reflect completion and provide next steps for architecture and product planning.

---

**Note**: This instruction creates a complete strategic foundation that will be referenced by all subsequent planning documents (architecture, product, and specs).
