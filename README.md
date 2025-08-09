# Agent OS - AI Development Workflow System

This repository contains the Agent OS configuration files for managing AI coding agents across multiple projects.

## Quick Start

### 1. Install Agent OS Globally
```bash
git clone https://github.com/your-username/agent-os ~/.agent-os
```

### 2. Set Up Your Project
```bash
# In your project directory
@~/.agent-os/instructions/core/analyze-product.md
```

### 3. Create Your First Spec
```bash
@~/.agent-os/instructions/core/create-spec.md
```

## Structure

- `standards/` - Core development standards (best practices, tech stack, code style)
- `instructions/` - Agent instructions for different workflows
  - `core/` - Main instruction files (create-spec, execute-tasks, etc.)
  - `meta/` - Meta instructions (pre-flight checks)
- `scripts/` - Utility scripts for lifecycle management

## Usage

### For New Projects
Use `@~/.agent-os/instructions/core/plan-product.md` to set up Agent OS in a new project.

### For Existing Projects  
Use `@~/.agent-os/instructions/core/analyze-product.md` to install Agent OS in existing codebases.

### Available Commands
- `@~/.agent-os/instructions/core/create-spec.md` - Create new feature specifications
- `@~/.agent-os/instructions/core/execute-tasks.md [SPEC_PATH]` - Execute spec tasks
- `@~/.agent-os/instructions/core/test-lifecycle.md` - Test lifecycle management system

## Backup Strategy

- All changes are version controlled
- Each major update should be committed
- Use conventional commits for changes
- Tag releases for important updates

## Deployment Integration

This repository will be updated to include deployment workflow standards
that apply across all projects.
