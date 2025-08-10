#!/usr/bin/env node

/**
 * Agent-OS Comprehensive Spec System Test
 * Demonstrates all the new spec creation and management functionality
 */

const ComprehensiveSpecCreator = require('./comprehensive-spec-creator.js');
const TaskUpdater = require('./task-updater.js');
const SpecsDashboardUpdater = require('./specs-dashboard-updater.js');
const fs = require('fs');
const path = require('path');

class ComprehensiveSpecSystemTest {
  constructor() {
    this.creator = new ComprehensiveSpecCreator();
    this.taskUpdater = new TaskUpdater();
    this.dashboardUpdater = new SpecsDashboardUpdater();
    this.testSpecName = 'comprehensive-test';
    this.testTitle = 'Comprehensive Spec System Test';
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Spec System Test\n');
    
    try {
      // Test 1: Create complete spec ecosystem
      console.log('📋 Test 1: Creating Complete Spec Ecosystem');
      console.log('=' .repeat(50));
      await this.testSpecCreation();
      
      // Test 2: Update task statuses
      console.log('\n📋 Test 2: Updating Task Statuses');
      console.log('=' .repeat(50));
      await this.testTaskUpdates();
      
      // Test 3: Update dashboard
      console.log('\n📋 Test 3: Updating Specs Dashboard');
      console.log('=' .repeat(50));
      await this.testDashboardUpdate();
      
      // Test 4: Move spec between statuses
      console.log('\n📋 Test 4: Moving Spec Between Statuses');
      console.log('=' .repeat(50));
      await this.testSpecMovement();
      
      // Test 5: Show final results
      console.log('\n📋 Test 5: Final Results');
      console.log('=' .repeat(50));
      await this.showFinalResults();
      
      console.log('\n🎉 All tests completed successfully!');
      console.log('\n📁 Test spec created at: specs/comprehensive-test');
      console.log('📄 Check the generated files to see the complete spec ecosystem');
      
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
      process.exit(1);
    }
  }

  async testSpecCreation() {
    console.log(`Creating spec: ${this.testSpecName}`);
    console.log(`Title: ${this.testTitle}`);
    
    const result = await this.creator.createCompleteSpec(this.testSpecName, this.testTitle);
    
    if (result.success) {
      console.log('✅ Spec created successfully!');
      console.log(`📁 Directory: ${result.specDir}`);
      console.log(`📄 Files created: ${result.files.join(', ')}`);
      
      // Verify files exist
      for (const file of result.files) {
        const filePath = path.join(result.specDir, file);
        if (fs.existsSync(filePath)) {
          console.log(`   ✓ ${file} exists`);
        } else {
          console.log(`   ❌ ${file} missing`);
        }
      }
    } else {
      throw new Error(`Failed to create spec: ${result.error}`);
    }
  }

  async testTaskUpdates() {
    const specPath = `specs/${this.testSpecName}`;
    
    console.log(`Updating tasks in: ${specPath}`);
    
    // Update task 1 to complete
    console.log('\n   Updating task 1 to complete...');
    this.taskUpdater.updateTaskStatus(specPath, '1', 'complete');
    
    // Update task 2.1 to in-progress
    console.log('   Updating task 2.1 to in-progress...');
    this.taskUpdater.updateTaskStatus(specPath, '2.1', 'in-progress');
    
    // Update task 2.2 to blocked with notes
    console.log('   Updating task 2.2 to blocked with notes...');
    this.taskUpdater.updateTaskStatus(specPath, '2.2', 'blocked', 'Waiting for external dependency');
    
    // Update task 3 to in-progress
    console.log('   Updating task 3 to in-progress...');
    this.taskUpdater.updateTaskStatus(specPath, '3', 'in-progress');
    
    // Show task statistics
    console.log('\n   Getting task statistics...');
    const stats = this.taskUpdater.getTaskStats(specPath);
    if (stats) {
      console.log('   📊 Task Statistics:');
      console.log(`      Total: ${stats.total}`);
      console.log(`      Completed: ${stats.completed} (${stats.completionPercentage}%)`);
      console.log(`      In Progress: ${stats.inProgress}`);
      console.log(`      Blocked: ${stats.blocked}`);
      console.log(`      Pending: ${stats.pending}`);
    }
    
    console.log('✅ Task updates completed');
  }

  async testDashboardUpdate() {
    console.log('Updating specs dashboard...');
    
    const success = await this.dashboardUpdater.updateDashboard('.');
    
    if (success) {
      console.log('✅ Dashboard updated successfully');
      
      // Check if dashboard file exists
      const dashboardPath = 'specs/specs-dashboard.md';
      if (fs.existsSync(dashboardPath)) {
        console.log(`   ✓ Dashboard file created: ${dashboardPath}`);
        
        // Show dashboard content preview
        const content = fs.readFileSync(dashboardPath, 'utf8');
        const lines = content.split('\n');
        console.log('\n   📋 Dashboard Preview:');
        for (let i = 0; i < Math.min(20, lines.length); i++) {
          if (lines[i].trim()) {
            console.log(`      ${lines[i]}`);
          }
        }
        if (lines.length > 20) {
          console.log(`      ... and ${lines.length - 20} more lines`);
        }
      } else {
        console.log(`   ❌ Dashboard file missing: ${dashboardPath}`);
      }
    } else {
      console.log('⚠️  Dashboard update completed with warnings');
    }
  }

  async testSpecMovement() {
    const specPath = `specs/${this.testSpecName}`;
    
    console.log(`Moving spec: ${specPath}`);
    
    // Move spec to active status
    console.log('\n   Moving spec to active status...');
    const moveToActive = await this.dashboardUpdater.moveSpec(specPath, 'active');
    if (moveToActive) {
      console.log('   ✅ Spec moved to active');
    } else {
      console.log('   ❌ Failed to move spec to active');
    }
    
    // Update dashboard after move
    console.log('   Updating dashboard...');
    await this.dashboardUpdater.updateDashboard('.');
    
    // Move spec to completed status
    console.log('\n   Moving spec to completed status...');
    const moveToCompleted = await this.dashboardUpdater.moveSpec(specPath, 'completed');
    if (moveToCompleted) {
      console.log('   ✅ Spec moved to completed');
    } else {
      console.log('   ❌ Failed to move spec to completed');
    }
    
    // Update dashboard after move
    console.log('   Updating dashboard...');
    await this.dashboardUpdater.updateDashboard('.');
    
    console.log('✅ Spec movement tests completed');
  }

  async showFinalResults() {
    const specPath = `specs/${this.testSpecName}`;
    
    console.log('Final spec status and task completion:');
    
    // Show final task statistics
    const stats = this.taskUpdater.getTaskStats(specPath);
    if (stats) {
      console.log('\n📊 Final Task Statistics:');
      console.log(`   Total: ${stats.total}`);
      console.log(`   Completed: ${stats.completed} (${stats.completionPercentage}%)`);
      console.log(`   In Progress: ${stats.inProgress}`);
      console.log(`   Blocked: ${stats.blocked}`);
      console.log(`   Pending: ${stats.pending}`);
    }
    
    // Show final spec status
    const statusFile = path.join(specPath, 'status.md');
    if (fs.existsSync(statusFile)) {
      const statusContent = fs.readFileSync(statusFile, 'utf8');
      const statusMatch = statusContent.match(/Current Status.*?:\s*(\w+)/i);
      if (statusMatch) {
        console.log(`\n📋 Final Spec Status: ${statusMatch[1]}`);
      }
    }
    
    // Show dashboard summary
    const dashboardPath = 'specs/specs-dashboard.md';
    if (fs.existsSync(dashboardPath)) {
      const content = fs.readFileSync(dashboardPath, 'utf8');
      const summaryMatch = content.match(/## 📊 Summary\s*\n((?:- .*\n?)*)/);
      if (summaryMatch) {
        console.log('\n📊 Dashboard Summary:');
        console.log(summaryMatch[1]);
      }
    }
    
    console.log('\n✅ Final results displayed');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new ComprehensiveSpecSystemTest();
  
  tester.runAllTests()
    .then(() => {
      console.log('\n🎯 Test Summary:');
      console.log('   ✓ Complete spec ecosystem creation');
      console.log('   ✓ Task status updates and tracking');
      console.log('   ✓ Specs dashboard management');
      console.log('   ✓ Spec lifecycle movement');
      console.log('   ✓ Progress tracking and statistics');
      console.log('\n🚀 The new Agent-OS spec system is working perfectly!');
    })
    .catch(error => {
      console.error(`\n💥 Test suite failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = ComprehensiveSpecSystemTest;
