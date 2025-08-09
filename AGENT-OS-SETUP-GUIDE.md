# Agent OS Setup Guide

## How Agent OS Actually Works

Agent OS is designed to be used in two ways:

### Method 1: Global Installation (Recommended)
1. Clone Agent OS to `~/.agent-os/`
2. Reference instructions from any project using `@~/.agent-os/instructions/core/...`

### Method 2: Project-Specific Copy
1. Copy Agent OS files into your project's `.agent-os/` directory
2. Reference instructions using `@.agent-os/instructions/core/...`

## Setting Up a New Project

### Step 1: Install Agent OS Globally
```bash
# Clone to home directory
git clone [AGENT_OS_REPO_URL] ~/.agent-os
```

### Step 2: Initialize Your Project
```bash
# In your project directory
@~/.agent-os/instructions/core/analyze-product.md
```

### Step 3: Verify Installation
```bash
# Check that these files were created:
ls .agent-os/product/
# Should show: mission.md, mission-lite.md, tech-stack.md, roadmap.md, decisions.md
```

## Using Agent OS Commands

### Create a New Spec
```bash
@~/.agent-os/instructions/core/create-spec.md
```

### Execute Tasks
```bash
@~/.agent-os/instructions/core/execute-tasks.md [SPEC_PATH]
```

### Test Lifecycle Management
```bash
@~/.agent-os/instructions/core/test-lifecycle.md
```

## Project Structure After Agent OS Installation

```
your-project/
├── .agent-os/
│   ├── product/
│   │   ├── mission.md
│   │   ├── mission-lite.md
│   │   ├── tech-stack.md
│   │   ├── roadmap.md
│   │   └── decisions.md
│   └── specs/
│       └── [your-specs-here]
└── [your project files]
```

## Troubleshooting

### Problem: "Cannot find @~/.agent-os/..."
**Solution**: Agent OS is not installed globally. Either:
1. Install globally: `git clone [REPO] ~/.agent-os`
2. Use project-specific paths: `@.agent-os/instructions/...`

### Problem: "Subagent not found"
**Solution**: Subagents are conceptual - ignore subagent references and execute steps directly.

### Problem: "Instructions not working"
**Solution**: Ensure your project has `.agent-os/product/` directory with required files.