#!/usr/bin/env node

/**
 * Agent-OS Specs Dashboard Updater
 * Automatically updates the specs dashboard to reflect current spec status
 */

const fs = require('fs');
const path = require('path');
const DocumentVersioner = require('./document-versioner.js');

class SpecsDashboardUpdater {
  constructor() {
    this.versioner = new DocumentVersioner();
    this.updateDate = new Date().toISOString().split('T')[0];
  }

  /**
   * Update the specs dashboard with current spec information
   * @param {string} specsDir - Path to the specs directory
   * @returns {boolean} Success status
   */
  async updateDashboard(specsDir = '.') {
    try {
      const specsPath = path.join(specsDir, 'specs');
      
      if (!fs.existsSync(specsPath)) {
        console.log(`ℹ️  No specs directory found at ${specsPath}`);
        return false;
      }

      const specs = await this.scanSpecs(specsPath);
      const dashboardContent = this.generateDashboardContent(specs);
      
      const dashboardPath = path.join(specsPath, 'specs-dashboard.md');
      fs.writeFileSync(dashboardPath, dashboardContent);
      
      console.log(`✅ Updated specs dashboard: ${dashboardPath}`);
      console.log(`📊 Found ${specs.total} specs across all statuses`);
      
      return true;

    } catch (error) {
      console.error(`❌ Error updating dashboard: ${error.message}`);
      return false;
    }
  }

  /**
   * Scan all specs in the specs directory
   * @param {string} specsPath - Path to specs directory
   * @returns {object} Specs organized by status
   */
  async scanSpecs(specsPath) {
    const specs = {
      planning: [],
      active: [],
      completed: [],
      archived: [],
      total: 0
    };

    try {
      const items = fs.readdirSync(specsPath);
      
      for (const item of items) {
        const itemPath = path.join(specsPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          const specInfo = await this.getSpecInfo(itemPath, item);
          if (specInfo) {
            const status = specInfo.status || 'planning';
            if (specs[status]) {
              specs[status].push(specInfo);
            }
            specs.total++;
          }
        }
      }

      // Sort specs by creation date (newest first)
      Object.keys(specs).forEach(key => {
        if (Array.isArray(specs[key])) {
          specs[key].sort((a, b) => new Date(b.created) - new Date(a.created));
        }
      });

    } catch (error) {
      console.warn(`⚠️  Warning: Could not scan specs directory: ${error.message}`);
    }

    return specs;
  }

  /**
   * Get information about a specific spec
   * @param {string} specPath - Path to spec directory
   * @param {string} specName - Name of the spec
   * @returns {object|null} Spec information
   */
  async getSpecInfo(specPath, specName) {
    try {
      // Skip non-spec directories
      if (!specName.match(/^\d{4}-\d{2}-\d{2}-/)) {
        return null;
      }

      const specInfo = {
        name: specName,
        path: specPath,
        created: this.extractDateFromName(specName),
        status: 'planning',
        title: specName,
        lastUpdated: this.extractDateFromName(specName)
      };

      // Try to read status.md
      const statusFile = path.join(specPath, 'status.md');
      if (fs.existsSync(statusFile)) {
        const statusContent = fs.readFileSync(statusFile, 'utf8');
        const statusMatch = statusContent.match(/Current Status.*?:\s*(\w+)/i);
        if (statusMatch) {
          specInfo.status = statusMatch[1].toLowerCase();
        }
        
        const titleMatch = statusContent.match(/Spec Name.*?:\s*(.+)/i);
        if (titleMatch) {
          specInfo.title = titleMatch[1].trim();
        }
        
        const lastUpdatedMatch = statusContent.match(/Last Updated.*?:\s*(\d{4}-\d{2}-\d{2})/i);
        if (lastUpdatedMatch) {
          specInfo.lastUpdated = lastUpdatedMatch[1];
        }
      }

      // Try to read spec.md for title
      const specFile = path.join(specPath, 'spec.md');
      if (fs.existsSync(specFile)) {
        const specContent = fs.readFileSync(specFile, 'utf8');
        const titleMatch = specContent.match(/^# (.+)/);
        if (titleMatch) {
          specInfo.title = titleMatch[1].trim();
        }
      }

      return specInfo;

    } catch (error) {
      console.warn(`⚠️  Warning: Could not read spec info for ${specName}: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract date from spec directory name
   * @param {string} specName - Spec directory name
   * @returns {string} Date in YYYY-MM-DD format
   */
  extractDateFromName(specName) {
    const dateMatch = specName.match(/^(\d{4}-\d{2}-\d{2})/);
    return dateMatch ? dateMatch[1] : this.updateDate;
  }

  /**
   * Generate dashboard content
   * @param {object} specs - Specs organized by status
   * @returns {string} Dashboard markdown content
   */
  generateDashboardContent(specs) {
    const planningSpecs = this.formatSpecList(specs.planning);
    const activeSpecs = this.formatSpecList(specs.active);
    const completedSpecs = this.formatSpecList(specs.completed);
    const archivedSpecs = this.formatSpecList(specs.archived);

    return `# Specs Dashboard

> Auto-generated dashboard for spec lifecycle management
> Last updated: ${this.updateDate}

## 📋 Planning (Backlog)
${planningSpecs}

## 🔄 Active (In Progress)
${activeSpecs}

## ✅ Completed (Done)
${completedSpecs}

## 🗄️ Archived
${archivedSpecs}

## 📊 Summary
- **Planning**: ${specs.planning.length} specs
- **Active**: ${specs.active.length} specs
- **Completed**: ${specs.completed.length} specs
- **Archived**: ${specs.archived.length} specs
- **Total**: ${specs.total} specs

---

> Type: Document
> Agent-OS Version: ${this.versioner.agentOsVersion}
> Created: ${this.updateDate}
> Last Updated: ${this.updateDate}
> Status: Active
> Author: Agent-OS
> Reviewers: TBD

---
*Dashboard generated automatically. Update spec status files to refresh this dashboard.*`;
  }

  /**
   * Format a list of specs for display
   * @param {Array} specList - List of specs
   * @returns {string} Formatted spec list
   */
  formatSpecList(specList) {
    if (!specList || specList.length === 0) {
      return '*No specs in this category*';
    }

    return specList.map(spec => {
      const displayName = spec.title !== spec.name ? `${spec.title} (${spec.name})` : spec.name;
      return `- **${displayName}** - Created: ${spec.created}, Last Updated: ${spec.lastUpdated}`;
    }).join('\n');
  }

  /**
   * Move a spec to a different status category
   * @param {string} specPath - Path to spec directory
   * @param {string} newStatus - New status (planning, active, completed, archived)
   * @returns {boolean} Success status
   */
  async moveSpec(specPath, newStatus) {
    try {
      const statusFile = path.join(specPath, 'status.md');
      
      if (!fs.existsSync(statusFile)) {
        console.error(`❌ Status file not found: ${statusFile}`);
        return false;
      }

      let content = fs.readFileSync(statusFile, 'utf8');
      
      // Update status
      content = content.replace(
        /Current Status.*?:\s*\w+/i,
        `Current Status: ${newStatus}`
      );
      
      // Update last updated
      content = content.replace(
        /Last Updated.*?:\s*\d{4}-\d{2}-\d{2}/i,
        `Last Updated: ${this.updateDate}`
      );
      
      // Add to status history
      const historyMatch = content.match(/(## Status History\s*\n)/);
      if (historyMatch) {
        const newHistoryEntry = `- ${this.updateDate} - Moved to ${newStatus}`;
        content = content.replace(
          historyMatch[1],
          `${historyMatch[1]}${newHistoryEntry}\n`
        );
      }
      
      fs.writeFileSync(statusFile, content);
      console.log(`✅ Updated ${specPath} status to ${newStatus}`);
      
      return true;

    } catch (error) {
      console.error(`❌ Error moving spec: ${error.message}`);
      return false;
    }
  }
}

// CLI interface
if (require.main === module) {
  const updater = new SpecsDashboardUpdater();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Agent-OS Specs Dashboard Updater');
    console.log('Usage:');
    console.log('  node specs-dashboard-updater.js [specs-directory]');
    console.log('  node specs-dashboard-updater.js move <spec-path> <new-status>');
    console.log('');
    console.log('Examples:');
    console.log('  node specs-dashboard-updater.js');
    console.log('  node specs-dashboard-updater.js ./my-project');
    console.log('  node specs-dashboard-updater.js move ./specs/my-feature active');
    console.log('');
    console.log('Status options: planning, active, completed, archived');
    process.exit(1);
  }
  
  const command = args[0];
  
  if (command === 'move') {
    if (args.length < 3) {
      console.error('❌ Usage: node specs-dashboard-updater.js move <spec-path> <new-status>');
      process.exit(1);
    }
    
    const specPath = args[1];
    const newStatus = args[2];
    
    updater.moveSpec(specPath, newStatus)
      .then(success => {
        if (success) {
          // Update dashboard after moving spec
          return updater.updateDashboard(path.dirname(specPath));
        }
      })
      .catch(error => {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
      });
  } else {
    // Update dashboard
    const specsDir = args[0] || '.';
    
    updater.updateDashboard(specsDir)
      .then(success => {
        if (success) {
          console.log('🎉 Dashboard update completed successfully!');
        } else {
          console.log('ℹ️  Dashboard update completed with warnings');
        }
      })
      .catch(error => {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
      });
  }
}

module.exports = SpecsDashboardUpdater;
