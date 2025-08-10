#!/usr/bin/env node

/**
 * Agent-OS CLI
 * Main command-line interface for Agent-OS operations
 */

const DocumentVersioner = require('./document-versioner.js');
const ComprehensiveSpecCreator = require('./comprehensive-spec-creator.js');
const TaskUpdater = require('./task-updater.js');
const SpecsDashboardUpdater = require('./specs-dashboard-updater.js');
const path = require('path');
const fs = require('fs');

class AgentOsCLI {
  constructor() {
    this.versioner = new DocumentVersioner();
    this.specCreator = new ComprehensiveSpecCreator();
    this.taskUpdater = new TaskUpdater();
    this.dashboardUpdater = new SpecsDashboardUpdater();
    this.agentOsVersion = this.versioner.agentOsVersion;
  }

  showHelp() {
    console.log(`
🤖 Agent-OS v${this.agentOsVersion} - Command Line Interface

USAGE:
  agent-os <command> [options]

COMMANDS:
  spec create <name> <title>     Create a new specification with all supporting files
  spec create-full <name> <title> Create complete spec ecosystem (spec.md, tasks.md, etc.)
  spec update <path>             Update an existing specification
  task update <spec-path> <task> <status> [notes] Update task status in tasks.md
  task stats <spec-path>         Show task completion statistics
  dashboard update [dir]          Update specs dashboard with current spec status
  dashboard move <spec-path> <status> Move spec to different status category
  doc version                    Show Agent-OS version
  doc batch <dir> [pattern]     Batch update documents in directory
  help                          Show this help message

EXAMPLES:
  # Create a new spec from any directory
  agent-os spec create my-feature "My Feature Implementation"
  
  # Create complete spec ecosystem with all supporting files
  agent-os spec create-full my-feature "My Feature Implementation"
  
  # Update an existing spec
  agent-os spec update path/to/spec.md
  
  # Update task status
  agent-os task update ./specs/my-feature 1 complete
  agent-os task update ./specs/my-feature 2.1 blocked "Waiting for API"
  
  # Show task statistics
  agent-os task stats ./specs/my-feature
  
  # Update specs dashboard
  agent-os dashboard update
  agent-os dashboard update ./my-project
  
  # Move spec to different status
  agent-os dashboard move ./specs/my-feature active
  agent-os dashboard move ./specs/my-feature completed
  
  # Batch update all specs in current directory
  agent-os doc batch . "**/*.md"
  
  # Show Agent-OS version
  agent-os doc version

TIPS:
  • Run from any project directory
  • Specs are created with date prefixes (YYYY-MM-DD-name)
  • All documents automatically include Agent-OS version info
  • Use 'agent-os help' for more information
`);
  }

  async createSpec(args) {
    if (args.length < 2) {
      console.error('❌ Usage: agent-os spec create <name> <title>');
      console.log('Example: agent-os spec create my-feature "My Feature Title"');
      process.exit(1);
    }

    const specName = args[0];
    const title = args[1];
    
    // Create directory name with date prefix
    const today = new Date().toISOString().split('T')[0];
    const dirName = `${today}-${specName}`;
    
    // Determine if we're in a specs directory or need to create one
    let specDir;
    if (fs.existsSync('specs')) {
      specDir = path.join('specs', dirName);
    } else {
      specDir = dirName;
    }
    
    const specFile = path.join(specDir, 'spec.md');
    
    // Create directory
    if (!fs.existsSync(specDir)) {
      fs.mkdirSync(specDir, { recursive: true });
      console.log(`📁 Created directory: ${specDir}`);
    }
    
    // Create spec file with versioning
    const success = this.versioner.createNewDocument(specFile, title, 'spec');
    
    if (success) {
      console.log('\n🎉 Spec created successfully!');
      console.log(`📄 File: ${specFile}`);
      console.log(`🔗 Agent-OS Version: ${this.agentOsVersion}`);
      console.log('\nNext steps:');
      console.log('1. Edit the spec file to add your project details');
      console.log('2. Update the status as you progress');
      console.log(`3. Use 'agent-os spec update ${specFile}' to update version info`);
      console.log('\n💡 Tip: Use \'agent-os spec create-full\' to create all supporting files automatically');
    } else {
      console.error('❌ Failed to create spec');
      process.exit(1);
    }
  }

  async createFullSpec(args) {
    if (args.length < 2) {
      console.error('❌ Usage: agent-os spec create-full <name> <title>');
      console.log('Example: agent-os spec create-full my-feature "My Feature Title"');
      process.exit(1);
    }

    const specName = args[0];
    const title = args[1];
    
    try {
      console.log(`🚀 Creating complete spec ecosystem for: ${title}`);
      const result = await this.specCreator.createCompleteSpec(specName, title);
      
      if (result.success) {
        console.log('\n🎉 Complete spec ecosystem created successfully!');
        console.log(`📁 Directory: ${result.specDir}`);
        console.log('📄 Files created:');
        result.files.forEach(file => {
          console.log(`   • ${file}`);
        });
        console.log(`🔗 Agent-OS Version: ${this.agentOsVersion}`);
        console.log('\nNext steps:');
        console.log('1. Review the generated spec files');
        console.log('2. Customize requirements and tasks as needed');
        console.log('3. Begin implementation using the task breakdown');
      } else {
        console.error(`❌ Failed to create complete spec: ${result.error}`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Error creating complete spec: ${error.message}`);
      process.exit(1);
    }
  }

  async updateSpec(args) {
    if (args.length < 1) {
      console.error('❌ Usage: agent-os spec update <path>');
      console.log('Example: agent-os spec update path/to/spec.md');
      process.exit(1);
    }

    const filePath = args[0];
    const success = this.versioner.updateExistingDocument(filePath);
    
    if (success) {
      console.log('✅ Spec updated successfully!');
    } else {
      console.log('ℹ️  Spec already has current version info');
    }
  }

  async updateTask(args) {
    if (args.length < 3) {
      console.error('❌ Usage: agent-os task update <spec-path> <task-number> <status> [notes]');
      console.log('Example: agent-os task update ./specs/my-feature 1 complete');
      console.log('Status options: complete, blocked, in-progress');
      process.exit(1);
    }

    const specPath = args[0];
    const taskNumber = args[1];
    const status = args[2];
    const notes = args[3] || '';

    try {
      const success = this.taskUpdater.updateTaskStatus(specPath, taskNumber, status, notes);
      
      if (success) {
        // Update last modified timestamp
        this.taskUpdater.updateLastModified(specPath);
        
        // Show task statistics
        const stats = this.taskUpdater.getTaskStats(specPath);
        if (stats) {
          console.log('\n📊 Task Statistics:');
          console.log(`   Total: ${stats.total}`);
          console.log(`   Completed: ${stats.completed} (${stats.completionPercentage}%)`);
          console.log(`   In Progress: ${stats.inProgress}`);
          console.log(`   Blocked: ${stats.blocked}`);
          console.log(`   Pending: ${stats.pending}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error updating task: ${error.message}`);
      process.exit(1);
    }
  }

  async showTaskStats(args) {
    if (args.length < 1) {
      console.error('❌ Usage: agent-os task stats <spec-path>');
      console.log('Example: agent-os task stats ./specs/my-feature');
      process.exit(1);
    }

    const specPath = args[0];
    
    try {
      const stats = this.taskUpdater.getTaskStats(specPath);
      if (stats) {
        console.log(`\n📊 Task Statistics for ${specPath}:`);
        console.log(`   Total: ${stats.total}`);
        console.log(`   Completed: ${stats.completed} (${stats.completionPercentage}%)`);
        console.log(`   In Progress: ${stats.inProgress}`);
        console.log(`   Blocked: ${stats.blocked}`);
        console.log(`   Pending: ${stats.pending}`);
        
        // Show progress bar
        const progressBar = this.generateProgressBar(stats.completionPercentage);
        console.log(`\n   Progress: ${progressBar} ${stats.completionPercentage}%`);
      } else {
        console.error(`❌ Could not get task statistics for ${specPath}`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Error getting task stats: ${error.message}`);
      process.exit(1);
    }
  }

  generateProgressBar(percentage) {
    const width = 20;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    const filledBar = '█'.repeat(filled);
    const emptyBar = '░'.repeat(empty);
    
    return filledBar + emptyBar;
  }

  async batchUpdate(args) {
    if (args.length < 1) {
      console.error('❌ Usage: agent-os doc batch <directory> [pattern]');
      console.log('Example: agent-os doc batch . "**/*.md"');
      process.exit(1);
    }

    const directory = args[0];
    const pattern = args[1] || '**/*.md';
    
    console.log(`🔄 Batch updating documents in ${directory} with pattern ${pattern}`);
    await this.versioner.batchUpdateDocuments(directory, pattern);
  }

  async updateDashboard(args) {
    const specsDir = args[0] || '.';
    
    try {
      console.log(`🔄 Updating specs dashboard for: ${specsDir}`);
      const success = await this.dashboardUpdater.updateDashboard(specsDir);
      
      if (success) {
        console.log('🎉 Dashboard updated successfully!');
      } else {
        console.log('ℹ️  Dashboard update completed with warnings');
      }
    } catch (error) {
      console.error(`❌ Error updating dashboard: ${error.message}`);
      process.exit(1);
    }
  }

  async moveSpec(args) {
    if (args.length < 2) {
      console.error('❌ Usage: agent-os dashboard move <spec-path> <new-status>');
      console.log('Example: agent-os dashboard move ./specs/my-feature active');
      console.log('Status options: planning, active, completed, archived');
      process.exit(1);
    }

    const specPath = args[0];
    const newStatus = args[1];
    
    try {
      console.log(`🔄 Moving spec ${specPath} to status: ${newStatus}`);
      const success = await this.dashboardUpdater.moveSpec(specPath, newStatus);
      
      if (success) {
        // Update dashboard after moving spec
        const specsDir = path.dirname(path.dirname(specPath)); // Go up two levels from spec to specs
        await this.dashboardUpdater.updateDashboard(specsDir);
        console.log('🎉 Spec moved and dashboard updated successfully!');
      } else {
        console.error(`❌ Failed to move spec to ${newStatus}`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Error moving spec: ${error.message}`);
      process.exit(1);
    }
  }

  showVersion() {
    console.log(`🤖 Agent-OS Version: ${this.agentOsVersion}`);
    console.log(`📅 Current Date: ${new Date().toISOString().split('T')[0]}`);
  }

  async run() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === 'help') {
      this.showHelp();
      return;
    }

    const command = args[0];
    const subCommand = args[1];
    const commandArgs = args.slice(2);

    try {
      switch (command) {
      case 'spec':
        switch (subCommand) {
        case 'create':
          await this.createSpec(commandArgs);
          break;
        case 'create-full':
          await this.createFullSpec(commandArgs);
          break;
        case 'update':
          await this.updateSpec(commandArgs);
          break;
        default:
          console.error(`❌ Unknown spec command: ${subCommand}`);
          console.log('Use: agent-os spec create|create-full|update');
          process.exit(1);
        }
        break;

      case 'task':
        switch (subCommand) {
        case 'update':
          await this.updateTask(commandArgs);
          break;
        case 'stats':
          await this.showTaskStats(commandArgs);
          break;
        default:
          console.error(`❌ Unknown task command: ${subCommand}`);
          console.log('Use: agent-os task update|stats');
          process.exit(1);
        }
        break;

      case 'dashboard':
        switch (subCommand) {
        case 'update':
          await this.updateDashboard(commandArgs);
          break;
        case 'move':
          await this.moveSpec(commandArgs);
          break;
        default:
          console.error(`❌ Unknown dashboard command: ${subCommand}`);
          console.log('Use: agent-os dashboard update|move');
          process.exit(1);
        }
        break;

      case 'doc':
        switch (subCommand) {
        case 'version':
          this.showVersion();
          break;
        case 'batch':
          await this.batchUpdate(commandArgs);
          break;
        default:
          console.error(`❌ Unknown doc command: ${subCommand}`);
          console.log('Use: agent-os doc version|batch');
          process.exit(1);
        }
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        this.showHelp();
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const cli = new AgentOsCLI();
  cli.run().catch(console.error);
}

module.exports = AgentOsCLI;
