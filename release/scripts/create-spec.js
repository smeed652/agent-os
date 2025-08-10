#!/usr/bin/env node

/**
 * Agent-OS Spec Creator
 * Creates new specifications with proper Agent-OS versioning
 */

const DocumentVersioner = require('./document-versioner.js');
const fs = require('fs');
const path = require('path');

async function createSpec() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Agent-OS Spec Creator');
    console.log('Usage: node create-spec.js <spec-name> <title>');
    console.log('');
    console.log('Example:');
    console.log('  node create-spec.js my-new-feature "My New Feature Implementation"');
    console.log('');
    console.log('This will create: specs/YYYY-MM-DD-my-new-feature/spec.md');
    process.exit(1);
  }
  
  const specName = args[0];
  const title = args[1];
  
  // Create directory name with date prefix
  const today = new Date().toISOString().split('T')[0];
  const dirName = `${today}-${specName}`;
  const specDir = path.join('specs', dirName);
  const specFile = path.join(specDir, 'spec.md');
  
  // Create directory
  if (!fs.existsSync(specDir)) {
    fs.mkdirSync(specDir, { recursive: true });
    console.log(`📁 Created directory: ${specDir}`);
  }
  
  // Create spec file with versioning
  const versioner = new DocumentVersioner();
  const success = versioner.createNewDocument(specFile, title, 'spec');
  
  if (success) {
    console.log('\n🎉 Spec created successfully!');
    console.log(`📄 File: ${specFile}`);
    console.log(`🔗 Agent-OS Version: ${versioner.agentOsVersion}`);
    console.log('\nNext steps:');
    console.log('1. Edit the spec file to add your project details');
    console.log('2. Update the status as you progress');
    console.log(`3. Use 'npm run doc:update ${specFile}' to update version info`);
  } else {
    console.error('❌ Failed to create spec');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createSpec().catch(console.error);
}

module.exports = createSpec;
