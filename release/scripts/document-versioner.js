#!/usr/bin/env node

/**
 * Agent-OS Document Versioner
 * Automatically injects Agent-OS version information into documents
 */

const fs = require('fs');
const path = require('path');

class DocumentVersioner {
  constructor() {
    this.agentOsVersion = this.getAgentOsVersion();
    this.creationDate = new Date().toISOString().split('T')[0];
  }

  getAgentOsVersion() {
    try {
      const packageJsonPath = path.join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return packageJson.version;
    } catch (error) {
      console.warn('Warning: Could not read Agent-OS version from package.json');
      return 'unknown';
    }
  }

  injectVersionInfo(content, documentType = 'spec') {
    const versionHeader = this.generateVersionHeader(documentType);
    
    // If content already has version info, update it
    if (content.includes('> Agent-OS Version:')) {
      return content.replace(
        /> Agent-OS Version: .*/,
        `> Agent-OS Version: ${this.agentOsVersion}`
      ).replace(
        /> Created: .*/,
        `> Created: ${this.creationDate}`
      );
    }
    
    // Add version info after the title
    const lines = content.split('\n');
    const titleIndex = lines.findIndex(line => line.startsWith('# '));
    
    if (titleIndex !== -1) {
      // Insert version header after title
      lines.splice(titleIndex + 1, 0, '', versionHeader);
      return lines.join('\n');
    }
    
    // If no title found, prepend version header
    return versionHeader + '\n\n' + content;
  }

  generateVersionHeader(documentType) {
    const typeMap = {
      'spec': 'Technical Specification',
      'doc': 'Documentation',
      'rule': 'Rule',
      'standard': 'Standard',
      'guide': 'Guide'
    };
    
    const docType = typeMap[documentType] || 'Document';
    
    return `> Type: ${docType}
> Agent-OS Version: ${this.agentOsVersion}
> Created: ${this.creationDate}
> Last Updated: ${this.creationDate}
> Status: Planning
> Author: Agent-OS
> Reviewers: TBD`;
  }

  updateExistingDocument(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const updatedContent = this.injectVersionInfo(content);
      
      if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent);
        console.log(`✅ Updated ${filePath} with Agent-OS version ${this.agentOsVersion}`);
        return true;
      } else {
        console.log(`ℹ️  ${filePath} already has current version info`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error updating ${filePath}:`, error.message);
      return false;
    }
  }

  createNewDocument(filePath, title, documentType = 'spec') {
    try {
      const content = `# ${title}

${this.generateVersionHeader(documentType)}

## Overview

*[Add overview here]*

## Goals & Objectives

*[Add goals and objectives here]*

## Implementation Steps

*[Add implementation steps here]*

## Technical Requirements

*[Add technical requirements here]*

## Success Criteria

*[Add success criteria here]*

## Risk Assessment

*[Add risk assessment here]*

## Dependencies

*[Add dependencies here]*`;

      fs.writeFileSync(filePath, content);
      console.log(`✅ Created ${filePath} with Agent-OS version ${this.agentOsVersion}`);
      return true;
    } catch (error) {
      console.error(`❌ Error creating ${filePath}:`, error.message);
      return false;
    }
  }

  async batchUpdateDocuments(directory, pattern = '**/*.md') {
    const { glob } = await import('glob');
    const files = await glob(pattern, { cwd: directory });
    
    let updatedCount = 0;
    for (const file of files) {
      const fullPath = path.join(directory, file);
      if (this.updateExistingDocument(fullPath)) {
        updatedCount++;
      }
    }
    
    console.log(`\n📊 Batch update complete: ${updatedCount} documents updated`);
    return updatedCount;
  }
}

// CLI interface
if (require.main === module) {
  const versioner = new DocumentVersioner();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Agent-OS Document Versioner');
    console.log('Usage:');
    console.log('  node document-versioner.js create <filepath> <title> [type]');
    console.log('  node document-versioner.js update <filepath>');
    console.log('  node document-versioner.js batch <directory> [pattern]');
    console.log('  node document-versioner.js version');
    console.log('');
    console.log('Types: spec, doc, rule, standard, guide');
    process.exit(0);
  }
  
  const command = args[0];
  
  switch (command) {
    case 'create':
      if (args.length < 3) {
        console.error('❌ Usage: create <filepath> <title> [type]');
        process.exit(1);
      }
      const filePath = args[1];
      const title = args[2];
      const type = args[3] || 'spec';
      versioner.createNewDocument(filePath, title, type);
      break;
      
    case 'update':
      if (args.length < 2) {
        console.error('❌ Usage: update <filepath>');
        process.exit(1);
      }
      versioner.updateExistingDocument(args[1]);
      break;
      
    case 'batch':
      if (args.length < 2) {
        console.error('❌ Usage: batch <directory> [pattern]');
        process.exit(1);
      }
      const pattern = args[2] || '**/*.md';
      versioner.batchUpdateDocuments(args[1], pattern);
      break;
      
    case 'version':
      console.log(`Agent-OS Version: ${versioner.agentOsVersion}`);
      break;
      
    default:
      console.error(`❌ Unknown command: ${command}`);
      process.exit(1);
  }
}

module.exports = DocumentVersioner;
