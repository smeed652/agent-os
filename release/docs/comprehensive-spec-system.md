# Agent-OS Comprehensive Spec System

> **Agent-OS v2.0.0** - Complete specification lifecycle management system

## Overview

The Agent-OS Comprehensive Spec System automatically creates and manages complete specification ecosystems with all supporting files as specified in the instructions. This system follows the 14-step process to create a fully functional spec management environment.

## 🚀 Quick Start

### Create Complete Spec Ecosystem

```bash
# Using the CLI (recommended)
agent-os spec create-full my-feature "My Feature Implementation"

# Using npm scripts
npm run create:spec:full my-feature "My Feature Implementation"

# Direct script execution
node scripts/comprehensive-spec-creator.js my-feature "My Feature Implementation"
```

### Test the System

```bash
# Run comprehensive test suite
npm run test:spec:system

# Or run directly
node scripts/test-comprehensive-spec-system.js
```

## 📁 What Gets Created

When you create a complete spec ecosystem, the system automatically generates:

### Core Spec Files
- **`spec.md`** - Main specification requirements document
- **`spec-lite.md`** - Summary version for quick reference
- **`technical-spec.md`** - Technical implementation details (in `sub-specs/` folder)
- **`tasks.md`** - Task breakdown with checkboxes and status tracking
- **`status.md`** - Current status and lifecycle management

### Lifecycle Management Files
- **`specs-dashboard.md`** - Overview of all specs and their statuses
- **`spec-lifecycle-guide.md`** - Instructions for managing spec lifecycle

### Directory Structure
```
specs/
├── YYYY-MM-DD-spec-name/
│   ├── spec.md
│   ├── spec-lite.md
│   ├── tasks.md
│   ├── status.md
│   └── sub-specs/
│       └── technical-spec.md
├── specs-dashboard.md
└── spec-lifecycle-guide.md
```

## 🛠️ CLI Commands

### Spec Management

```bash
# Create basic spec
agent-os spec create <name> <title>

# Create complete spec ecosystem
agent-os spec create-full <name> <title>

# Update existing spec
agent-os spec update <path>
```

### Task Management

```bash
# Update task status
agent-os task update <spec-path> <task-number> <status> [notes]

# Show task statistics
agent-os task stats <spec-path>

# Examples
agent-os task update ./specs/my-feature 1 complete
agent-os task update ./specs/my-feature 2.1 blocked "Waiting for API"
agent-os task update ./specs/my-feature 3 in-progress
```

### Dashboard Management

```bash
# Update specs dashboard
agent-os dashboard update [directory]

# Move spec between statuses
agent-os dashboard move <spec-path> <new-status>

# Examples
agent-os dashboard update
agent-os dashboard update ./my-project
agent-os dashboard move ./specs/my-feature active
agent-os dashboard move ./specs/my-feature completed
```

### Document Management

```bash
# Show Agent-OS version
agent-os doc version

# Batch update documents
agent-os doc batch <directory> [pattern]
```

## 📊 Task Status Options

The system supports the following task statuses:

- **`complete`** - Task is finished ✅
- **`blocked`** - Task is blocked ⚠️
- **`in-progress`** - Task is currently being worked on 🔄

### Task Status Examples

```bash
# Mark task 1 as complete
agent-os task update ./specs/my-feature 1 complete

# Mark subtask 2.1 as blocked with notes
agent-os task update ./specs/my-feature 2.1 blocked "Waiting for external dependency"

# Mark task 3 as in-progress
agent-os task update ./specs/my-feature 3 in-progress
```

## 🔄 Spec Lifecycle Management

### Status Categories

1. **Planning** - Specs ready for implementation (backlog)
2. **Active** - Specs currently being implemented
3. **Completed** - Specs finished and tested
4. **Archived** - Specs cleaned up and archived

### Moving Specs Between Statuses

```bash
# Move spec to active
agent-os dashboard move ./specs/my-feature active

# Move spec to completed
agent-os dashboard move ./specs/my-feature completed

# Move spec to archived
agent-os dashboard move ./specs/my-feature archived
```

### Automatic Dashboard Updates

The dashboard automatically updates when:
- New specs are created
- Spec statuses are changed
- The `dashboard update` command is run

## 📈 Progress Tracking

### Task Statistics

Each spec provides comprehensive task statistics:

```bash
agent-os task stats ./specs/my-feature
```

Output includes:
- Total tasks count
- Completed tasks (with percentage)
- In-progress tasks
- Blocked tasks
- Pending tasks
- Visual progress bar

### Dashboard Overview

The specs dashboard provides:
- Count of specs in each status category
- List of all specs with creation and update dates
- Quick overview of project progress
- Links to individual spec files

## 🔧 Advanced Usage

### Custom Task Updates

```bash
# Update task with custom notes
agent-os task update ./specs/my-feature 1 complete "All tests passing, ready for review"

# Update multiple tasks
agent-os task update ./specs/my-feature 1 complete
agent-os task update ./specs/my-feature 2.1 in-progress
agent-os task update ./specs/my-feature 2.2 blocked "API endpoint not ready"
```

### Batch Operations

```bash
# Update all specs in directory
agent-os doc batch ./specs "**/*.md"

# Update dashboard for multiple projects
agent-os dashboard update ./project1
agent-os dashboard update ./project2
```

### Integration with Existing Workflows

The system integrates seamlessly with:
- Git workflows (all files are tracked)
- CI/CD pipelines (use npm scripts)
- Project management tools (export task data)
- Documentation systems (markdown format)

## 📋 File Templates

### spec.md Template
```markdown
# Spec Requirements Document

> Spec: [SPEC_NAME]
> Created: [YYYY-MM-DD]
> Status: Planning

## Overview
[1-2_SENTENCE_GOAL_AND_OBJECTIVE]

## User Stories
### [STORY_TITLE]
As a [USER_TYPE], I want to [ACTION], so that [BENEFIT].

## Spec Scope
1. **[FEATURE_NAME]** - [ONE_SENTENCE_DESCRIPTION]

## Expected Deliverable
1. [TESTABLE_OUTCOME_1]
```

### tasks.md Template
```markdown
# Spec Tasks

## Tasks
- [ ] 1. [MAJOR_TASK_DESCRIPTION]
  - [ ] 1.1 Write tests for [COMPONENT]
  - [ ] 1.2 [IMPLEMENTATION_STEP]

- [ ] 2. Code Refactoring and Optimization (Post-UI Approval)
  - [ ] 2.1 Analyze codebase for optimization opportunities
```

## 🧪 Testing

### Run Comprehensive Tests

```bash
# Test the entire spec system
npm run test:spec:system

# Test individual components
node scripts/comprehensive-spec-creator.js test-feature "Test Feature"
node scripts/task-updater.js ./specs/test-feature 1 complete
node scripts/specs-dashboard-updater.js
```

### Test Output

The test suite demonstrates:
- Complete spec ecosystem creation
- Task status updates and tracking
- Dashboard management
- Spec lifecycle movement
- Progress tracking and statistics

## 🔍 Troubleshooting

### Common Issues

1. **Spec directory not found**
   - Ensure you're in the correct directory
   - Check if `specs/` folder exists

2. **Task not found**
   - Verify task number format (e.g., "1", "2.1")
   - Check that `tasks.md` exists in spec directory

3. **Dashboard not updating**
   - Run `agent-os dashboard update` manually
   - Check file permissions

4. **Status not changing**
   - Verify status spelling (planning, active, completed, archived)
   - Check `status.md` file exists

### Debug Mode

```bash
# Run with verbose output
DEBUG=* agent-os spec create-full my-feature "My Feature"

# Check file contents
cat specs/YYYY-MM-DD-my-feature/status.md
cat specs/YYYY-MM-DD-my-feature/tasks.md
```

## 📚 Additional Resources

- [Agent-OS Usage Guide](../agent-os-usage-guide.md)
- [TDD Quick Start](../tdd-quick-start.md)
- [Integration Testing](../integration-testing.md)
- [Performance Testing](../performance-testing.md)

## 🤝 Contributing

The comprehensive spec system is designed to be extensible. Key areas for contribution:

- Additional task status types
- Custom dashboard views
- Integration with external tools
- Enhanced progress tracking
- Automated reporting

## 📄 License

This system is part of Agent-OS and follows the same MIT license.

---

> **Note**: This system automatically follows the 14-step process from the instructions to create complete spec ecosystems. All supporting files are generated with proper Agent-OS versioning and lifecycle management.
