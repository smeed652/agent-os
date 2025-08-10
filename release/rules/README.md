# Agent-OS Universal Rules

This directory contains universal development rules that apply across all projects. These rules were extracted from successful project implementations and represent best practices for software development.

## Rule Categories

### 🏗️ **Foundation Rules (Tier 1)**
Critical universal rules that form the foundation of any project:

- **`documentation-standards.mdc`** - Universal documentation patterns and standards
- **`modular-documentation.mdc`** - DRY documentation principles with modular components
- **`typescript-standards.mdc`** - TypeScript coding standards and best practices
- **`file-organization.mdc`** - File size limits, naming conventions, and directory structures
- **`git-workflow.mdc`** - Git workflow patterns and branch management
- **`commit-standards.mdc`** - Conventional commits and safe commit practices

### 🔧 **Process Rules (Tier 2)**
Valuable universal patterns for development processes:

- **`testing-standards.mdc`** - Testing strategies and quality standards
- **`test-organization.mdc`** - Test file organization and coverage management
- **`cicd-basic.mdc`** - CI/CD pipeline patterns and automation
- **`deployment-safety.mdc`** - Safe deployment practices and rollback procedures

### 🏛️ **Architecture Rules (Tier 3)**
Specialized but reusable patterns for system design:

- **`tech-stack-selection.mdc`** - Framework for selecting technologies
- **`tech-stack-documentation.mdc`** - Modular tech stack documentation patterns
- **`architecture-patterns.mdc`** - Software architecture patterns and principles
- **`code-organization.mdc`** - Code organization and business logic separation

## Usage

These rules are designed to be:

- **Universal**: Apply to any software project regardless of specific technology
- **Modular**: Can be used independently or combined as needed
- **Actionable**: Provide specific, implementable guidance
- **Maintainable**: Easy to update and evolve over time

## Integration

Rules marked with `alwaysApply: true` are automatically applied to all projects. Others can be selectively applied based on project needs.

## Local Development

These rules are also available in individual project `agent-os/rules/` directories for testing and project-specific customization.

## Last Updated

Generated during Phase 4: Agent-OS Integration - January 2025
