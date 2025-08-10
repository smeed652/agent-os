#!/usr/bin/env node

/**
 * Agent-OS Task Updater
 * Updates tasks.md files during task execution to track progress
 */

const fs = require('fs');
const path = require('path');

class TaskUpdater {
  constructor() {
    this.updateDate = new Date().toISOString().split('T')[0];
  }

  /**
   * Mark a task as complete in tasks.md
   * @param {string} specPath - Path to the spec directory
   * @param {string} taskNumber - Task number (e.g., "1", "2.1")
   * @param {string} status - Status to set ("complete", "blocked", "in-progress")
   * @param {string} notes - Optional notes about the task
   */
  updateTaskStatus(specPath, taskNumber, status, notes = '') {
    try {
      const tasksFile = path.join(specPath, 'tasks.md');
      
      if (!fs.existsSync(tasksFile)) {
        throw new Error(`Tasks file not found: ${tasksFile}`);
      }

      let content = fs.readFileSync(tasksFile, 'utf8');
      const updatedContent = this.updateTaskInContent(content, taskNumber, status, notes);
      
      if (content !== updatedContent) {
        fs.writeFileSync(tasksFile, updatedContent);
        console.log(`✅ Updated task ${taskNumber} to ${status} in ${tasksFile}`);
        return true;
      } else {
        console.log(`ℹ️  Task ${taskNumber} already has status: ${status}`);
        return false;
      }

    } catch (error) {
      console.error(`❌ Error updating task ${taskNumber}: ${error.message}`);
      return false;
    }
  }

  /**
   * Update task status in the content
   * @param {string} content - Current tasks.md content
   * @param {string} taskNumber - Task number to update
   * @param {string} status - New status
   * @param {string} notes - Optional notes
   * @returns {string} Updated content
   */
  updateTaskInContent(content, taskNumber, status, notes = '') {
    const lines = content.split('\n');
    const updatedLines = [];
    
    let inTargetTask = false;
    let taskFound = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this is the target task
      if (this.isTaskLine(line, taskNumber)) {
        inTargetTask = true;
        taskFound = true;
        
        // Update the task line based on status
        const updatedLine = this.updateTaskLine(line, status, notes);
        updatedLines.push(updatedLine);
        
        // If it's a parent task, continue until we find the next parent task
        if (this.isParentTask(taskNumber)) {
          continue;
        }
      } else if (inTargetTask && this.isParentTask(line)) {
        // We've reached the next parent task, stop updating
        inTargetTask = false;
        updatedLines.push(line);
      } else if (inTargetTask && this.isSubtask(line)) {
        // We're in a subtask of the target task, continue updating
        updatedLines.push(line);
      } else {
        // Not in target task, keep line as is
        updatedLines.push(line);
      }
    }

    if (!taskFound) {
      console.warn(`⚠️  Warning: Task ${taskNumber} not found in tasks.md`);
    }

    return updatedLines.join('\n');
  }

  /**
   * Check if a line represents the target task
   * @param {string} line - Line to check
   * @param {string} taskNumber - Task number to match
   * @returns {boolean} True if this is the target task
   */
  isTaskLine(line, taskNumber) {
    const trimmedLine = line.trim();
    
    // Match parent tasks (e.g., "1.", "2.")
    if (this.isParentTask(taskNumber)) {
      return trimmedLine.match(new RegExp(`^- \\[.\\] ${taskNumber.replace(/\.$/, '')}\\.`));
    }
    
    // Match subtasks (e.g., "1.1", "2.3")
    return trimmedLine.match(new RegExp(`^- \\[.\\] ${taskNumber.replace(/\./g, '\\.')}`));
  }

  /**
   * Check if a task number represents a parent task
   * @param {string} taskNumber - Task number to check
   * @returns {boolean} True if this is a parent task
   */
  isParentTask(taskNumber) {
    return !taskNumber.includes('.');
  }

  /**
   * Check if a line represents a parent task
   * @param {string} line - Line to check
   * @returns {boolean} True if this is a parent task
   */
  isParentTaskLine(line) {
    const trimmedLine = line.trim();
    return trimmedLine.match(/^- \[.\] \d+\./);
  }

  /**
   * Check if a line represents a subtask
   * @param {string} line - Line to check
   * @returns {boolean} True if this is a subtask
   */
  isSubtask(line) {
    const trimmedLine = line.trim();
    return trimmedLine.match(/^- \[.\] \d+\.\d+/);
  }

  /**
   * Update a task line with new status
   * @param {string} line - Original task line
   * @param {string} status - New status
   * @param {string} notes - Optional notes
   * @returns {string} Updated task line
   */
  updateTaskLine(line, status, notes = '') {
    const trimmedLine = line.trim();
    
    // Extract the task description
    const match = trimmedLine.match(/^- \[.\] (.+)/);
    if (!match) return line;
    
    const taskDescription = match[1];
    
    // Update checkbox based on status
    let checkbox = '[ ]';
    let statusText = '';
    
    switch (status.toLowerCase()) {
      case 'complete':
      case 'completed':
      case 'done':
        checkbox = '[x]';
        break;
      case 'blocked':
        checkbox = '[ ]';
        statusText = ' ⚠️ Blocked';
        break;
      case 'in-progress':
      case 'progress':
        checkbox = '[ ]';
        statusText = ' 🔄 In Progress';
        break;
      default:
        checkbox = '[ ]';
    }
    
    // Add notes if provided
    if (notes) {
      statusText += ` - ${notes}`;
    }
    
    return `- ${checkbox} ${taskDescription}${statusText}`;
  }

  /**
   * Get task completion statistics
   * @param {string} specPath - Path to the spec directory
   * @returns {object} Task statistics
   */
  getTaskStats(specPath) {
    try {
      const tasksFile = path.join(specPath, 'tasks.md');
      
      if (!fs.existsSync(tasksFile)) {
        throw new Error(`Tasks file not found: ${tasksFile}`);
      }

      const content = fs.readFileSync(tasksFile, 'utf8');
      const lines = content.split('\n');
      
      let totalTasks = 0;
      let completedTasks = 0;
      let blockedTasks = 0;
      let inProgressTasks = 0;

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (this.isParentTaskLine(trimmedLine) || this.isSubtask(trimmedLine)) {
          totalTasks++;
          
          if (trimmedLine.includes('[x]')) {
            completedTasks++;
          } else if (trimmedLine.includes('⚠️ Blocked')) {
            blockedTasks++;
          } else if (trimmedLine.includes('🔄 In Progress')) {
            inProgressTasks++;
          }
        }
      }

      const pendingTasks = totalTasks - completedTasks - blockedTasks - inProgressTasks;
      const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        total: totalTasks,
        completed: completedTasks,
        blocked: blockedTasks,
        inProgress: inProgressTasks,
        pending: pendingTasks,
        completionPercentage: completionPercentage
      };

    } catch (error) {
      console.error(`❌ Error getting task stats: ${error.message}`);
      return null;
    }
  }

  /**
   * Update the last updated timestamp in tasks.md
   * @param {string} specPath - Path to the spec directory
   * @returns {boolean} Success status
   */
  updateLastModified(specPath) {
    try {
      const tasksFile = path.join(specPath, 'tasks.md');
      
      if (!fs.existsSync(tasksFile)) {
        throw new Error(`Tasks file not found: ${tasksFile}`);
      }

      let content = fs.readFileSync(tasksFile, 'utf8');
      
      // Update the last updated timestamp
      if (content.includes('> Last Updated:')) {
        content = content.replace(
          /> Last Updated: .*/,
          `> Last Updated: ${this.updateDate}`
        );
      }
      
      fs.writeFileSync(tasksFile, content);
      return true;

    } catch (error) {
      console.error(`❌ Error updating last modified: ${error.message}`);
      return false;
    }
  }
}

// CLI interface
if (require.main === module) {
  const updater = new TaskUpdater();
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Agent-OS Task Updater');
    console.log('Usage:');
    console.log('  node task-updater.js <spec-path> <task-number> <status> [notes]');
    console.log('');
    console.log('Examples:');
    console.log('  node task-updater.js ./specs/my-feature 1 complete');
    console.log('  node task-updater.js ./specs/my-feature 2.1 blocked "Waiting for API"');
    console.log('  node task-updater.js ./specs/my-feature 3 in-progress');
    console.log('');
    console.log('Status options: complete, blocked, in-progress');
    process.exit(1);
  }
  
  const specPath = args[0];
  const taskNumber = args[1];
  const status = args[2];
  const notes = args[3] || '';
  
  const success = updater.updateTaskStatus(specPath, taskNumber, status, notes);
  
  if (success) {
    // Update last modified timestamp
    updater.updateLastModified(specPath);
    
    // Show task statistics
    const stats = updater.getTaskStats(specPath);
    if (stats) {
      console.log(`\n📊 Task Statistics:`);
      console.log(`   Total: ${stats.total}`);
      console.log(`   Completed: ${stats.completed} (${stats.completionPercentage}%)`);
      console.log(`   In Progress: ${stats.inProgress}`);
      console.log(`   Blocked: ${stats.blocked}`);
      console.log(`   Pending: ${stats.pending}`);
    }
  }
}

module.exports = TaskUpdater;
