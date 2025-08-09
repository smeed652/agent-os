#!/usr/bin/env node

/**
 * Spec Dashboard Generator
 * 
 * Automatically generates a dashboard showing all specs in their lifecycle states
 * for large projects with multiple specs.
 */

const fs = require('fs');
const path = require('path');

class SpecDashboardGenerator {
  constructor(specsDir = '.agent-os/specs') {
    this.specsDir = specsDir;
    this.dashboardPath = path.join(specsDir, 'specs-dashboard.md');
  }

  /**
   * Generate the complete dashboard
   */
  async generateDashboard() {
    try {
      const dashboard = this.buildDashboard();
      await this.writeDashboard(dashboard);
      console.log('✅ Specs dashboard generated successfully');
      return dashboard;
    } catch (error) {
      console.error('❌ Error generating dashboard:', error.message);
      throw error;
    }
  }

  /**
   * Build the dashboard content
   */
  buildDashboard() {
    const specs = this.scanSpecs();
    
    return `# Specs Dashboard

> Auto-generated dashboard for spec lifecycle management
> Last updated: ${new Date().toISOString().split('T')[0]}

## 📋 Planning (Backlog)
${this.formatSpecsList(specs.planning, 'planning')}

## 🔄 Active (In Progress)
${this.formatSpecsList(specs.active, 'active')}

## ✅ Completed (Done)
${this.formatSpecsList(specs.completed, 'completed')}

## 🗄️ Archived
${this.formatSpecsList(specs.archived, 'archived')}

## 📊 Summary
- **Planning**: ${specs.planning.length} specs
- **Active**: ${specs.active.length} specs
- **Completed**: ${specs.completed.length} specs
- **Archived**: ${specs.archived.length} specs
- **Total**: ${specs.planning.length + specs.active.length + specs.completed.length + specs.archived.length} specs

---
*Dashboard generated automatically. Update spec status files to refresh this dashboard.*
`;
  }

  /**
   * Scan all specs and categorize by status
   */
  scanSpecs() {
    const specs = {
      planning: [],
      active: [],
      completed: [],
      archived: []
    };

    if (!fs.existsSync(this.specsDir)) {
      return specs;
    }

    const items = fs.readdirSync(this.specsDir, { withFileTypes: true });
    
    for (const item of items) {
      if (!item.isDirectory()) continue;
      
      const specPath = path.join(this.specsDir, item.name);
      const status = this.getSpecStatus(specPath, item.name);
      
      if (status) {
        specs[status].push({
          name: item.name,
          path: specPath,
          status: status,
          lastUpdated: this.getLastUpdated(specPath)
        });
      }
    }

    return specs;
  }

  /**
   * Determine spec status based on folder name and status.md
   */
  getSpecStatus(specPath, folderName) {
    // Check folder naming convention first
    if (folderName.startsWith('planning-')) return 'planning';
    if (folderName.startsWith('active-')) return 'active';
    if (folderName.startsWith('completed-')) return 'completed';
    if (folderName.startsWith('archived-') || folderName.includes('/archived/')) return 'archived';
    
    // Check status.md file if folder naming doesn't indicate status
    const statusPath = path.join(specPath, 'status.md');
    if (fs.existsSync(statusPath)) {
      const statusContent = fs.readFileSync(statusPath, 'utf8');
      const statusMatch = statusContent.match(/Current Status[:\s]+(\w+)/i);
      if (statusMatch) {
        return statusMatch[1].toLowerCase();
      }
    }
    
    // Default to planning if no clear status
    return 'planning';
  }

  /**
   * Get last updated date from status.md
   */
  getLastUpdated(specPath) {
    const statusPath = path.join(specPath, 'status.md');
    if (fs.existsSync(statusPath)) {
      const statusContent = fs.readFileSync(statusPath, 'utf8');
      const dateMatch = statusContent.match(/Last Updated[:\s]+(\d{4}-\d{2}-\d{2})/i);
      if (dateMatch) {
        return dateMatch[1];
      }
    }
    return null;
  }

  /**
   * Format specs list for dashboard
   */
  formatSpecsList(specs, status) {
    if (specs.length === 0) {
      return `*No ${status} specs*`;
    }

    return specs
      .sort((a, b) => {
        // Sort by last updated date, newest first
        if (a.lastUpdated && b.lastUpdated) {
          return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        }
        return 0;
      })
      .map(spec => {
        const checkbox = status === 'completed' || status === 'archived' ? '[x]' : '[ ]';
        const date = spec.lastUpdated ? ` (${spec.lastUpdated})` : '';
        const progress = this.getProgress(spec.path);
        const progressText = progress ? ` (${progress}% complete)` : '';
        
        return `- ${checkbox} ${spec.name}${date}${progressText}`;
      })
      .join('\n');
  }

  /**
   * Get completion progress from tasks.md
   */
  getProgress(specPath) {
    const tasksPath = path.join(specPath, 'tasks.md');
    if (!fs.existsSync(tasksPath)) return null;
    
    try {
      const tasksContent = fs.readFileSync(tasksPath, 'utf8');
      const totalTasks = (tasksContent.match(/- \[ \]/g) || []).length;
      const completedTasks = (tasksContent.match(/- \[x\]/g) || []).length;
      
      if (totalTasks === 0) return null;
      
      const percentage = Math.round((completedTasks / (totalTasks + completedTasks)) * 100);
      return percentage;
    } catch (error) {
      return null;
    }
  }

  /**
   * Write dashboard to file
   */
  async writeDashboard(content) {
    await fs.promises.writeFile(this.dashboardPath, content, 'utf8');
  }
}

// CLI usage
if (require.main === module) {
  const generator = new SpecDashboardGenerator();
  generator.generateDashboard()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = SpecDashboardGenerator; 