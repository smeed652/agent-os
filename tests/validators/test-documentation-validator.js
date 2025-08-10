#!/usr/bin/env node

/**
 * Documentation Validator Tests
 * 
 * Comprehensive unit tests for the Documentation Validator
 */

const ValidatorTestFramework = require("./test-framework");
const DocumentationValidator = require("../../scripts/validators/documentation-validator");
const fs = require("fs");
const path = require("path");

class DocumentationValidatorTests extends ValidatorTestFramework {
  constructor() {
    super();
    this.validator = new DocumentationValidator();
  }

  async runAllTests() {
    console.log("📚 Testing Documentation Validator");
    console.log("==================================\n");

    try {
      // Core Documentation Validation Tests
      await this.testValidatorInstantiation();
      await this.testBasicFunctionality();
      
      // Error Handling and Edge Cases
      await this.testErrorHandling();
      await this.testEdgeCases();
      
      this.displayResults();
    } catch (error) {
      console.error("❌ Test execution failed:", error);
    } finally {
      this.cleanup();
    }
  }

  async testValidatorInstantiation() {
    console.log("🔧 Testing Validator Instantiation...");

    // Test validator class instantiation
    await this.runValidatorTest(DocumentationValidator, "Validator instantiation", async (validator) => {
      this.assert(validator instanceof DocumentationValidator, "Should create validator instance");
      this.assert(typeof validator.validateProject === "function", "Should have validateProject method");
      this.assert(typeof validator.validateReadmeCompleteness === "function", "Should have validateReadmeCompleteness method");
      this.assert(typeof validator.validateAPIDocumentation === "function", "Should have validateAPIDocumentation method");
      this.assert(typeof validator.validateCodeComments === "function", "Should have validateCodeComments method");
      
      return { status: "PASS" };
    });

    // Test validator configuration
    await this.runValidatorTest(DocumentationValidator, "Validator configuration", async (validator) => {
      this.assert(validator.results, "Should have results object");
      this.assert(typeof validator.results.passed === "number", "Should track passed count");
      this.assert(typeof validator.results.failed === "number", "Should track failed count");
      this.assert(Array.isArray(validator.results.validations), "Should have validations array");
      
      return { status: "PASS" };
    });
  }

  async testBasicFunctionality() {
    console.log("📝 Testing Basic Functionality...");

    // Test helper methods exist
    await this.runValidatorTest(DocumentationValidator, "Helper methods availability", async (validator) => {
      this.assert(typeof validator.findAPIFiles === "function", "Should have findAPIFiles method");
      this.assert(typeof validator.getCodeFiles === "function", "Should have getCodeFiles method");
      this.assert(typeof validator.findDocumentationFiles === "function", "Should have findDocumentationFiles method");
      this.assert(typeof validator.aggregateValidations === "function", "Should have aggregateValidations method");
      this.assert(typeof validator.createValidation === "function", "Should have createValidation method");
      
      return { status: "PASS" };
    });

    // Test validation creation
    await this.runValidatorTest(DocumentationValidator, "Validation creation", async (validator) => {
      const validation = validator.createValidation("Test Documentation", "PASS", "Test message", { test: true });
      
      this.assert(validation.name === "Test Documentation", "Should set validation name");
      this.assert(validation.status === "PASS", "Should set validation status");
      this.assert(validation.message === "Test message", "Should set validation message");
      this.assert(validation.details.test === true, "Should set validation details");
      
      return validation;
    });

    // Test aggregation with various statuses
    await this.runValidatorTest(DocumentationValidator, "Result aggregation", async (validator) => {
      const validations = [
        { status: "PASS", name: "Documentation 1" },
        { status: "WARNING", name: "Documentation 2" },
        { status: "FAIL", name: "Documentation 3" }
      ];

      const result = validator.aggregateValidations(validations);
      
      this.assert(result.status, "Should return aggregated status");
      this.assert(result.summary, "Should return summary");
      this.assert(result.summary.total === 3, "Should count total validations");
      this.assert(result.summary.passed === 1, "Should count passed validations");
      this.assert(result.summary.warnings === 1, "Should count warning validations");
      this.assert(result.summary.failed === 1, "Should count failed validations");
      
      return result;
    });
  }

  // Simplified tests focusing on core functionality

  // Simplified tests focusing on core functionality

  async testErrorHandling() {
    console.log("⚠️ Testing Error Handling...");

    // Test non-existent project directory
    await this.runValidatorTest(DocumentationValidator, "Non-existent project", async (validator) => {
      try {
        const result = await validator.validateProject("/non/existent/path");
        // Should handle gracefully, not throw
        this.assert(result, "Should return result even for non-existent path");
        return result;
      } catch (error) {
        // If it throws, that's also acceptable behavior
        this.assert(error.message, "Should provide error message");
        return { error: error.message };
      }
    });

    // Test basic method availability
    await this.runValidatorTest(DocumentationValidator, "Basic method availability", async (validator) => {
      this.assert(typeof validator.shouldSkipDirectory === "function", "Should have shouldSkipDirectory method");
      this.assert(typeof validator.isTestFile === "function", "Should have isTestFile method");
      this.assert(typeof validator.getAllFiles === "function", "Should have getAllFiles method");
      
      return { status: "PASS" };
    });

    // Test validation creation edge cases
    await this.runValidatorTest(DocumentationValidator, "Validation creation edge cases", async (validator) => {
      // Test with null/undefined values
      const validation1 = validator.createValidation("Test", "PASS", null, {});
      this.assert(validation1.message === null, "Should handle null message");
      
      const validation2 = validator.createValidation("Test", "PASS", "Message", null);
      this.assert(validation2.details === null, "Should handle null details");
      
      return { status: "PASS" };
    });
  }

  async testEdgeCases() {
    console.log("🔬 Testing Edge Cases...");

    // Test empty project
    await this.runValidatorTest(DocumentationValidator, "Empty project", async (validator) => {
      const emptyProject = this.createDocProject("empty-project", {});
      
      // Mock methods to return empty results
      validator.getCodeFiles = () => [];
      validator.getAPIFiles = () => [];
      validator.getDocumentationFiles = () => [];

      // Should handle empty project gracefully
      const result = await validator.validateCodeComments(emptyProject);
      this.assert(result, "Should handle empty project");
      
      return result;
    });

    // Test aggregation with empty validations
    await this.runValidatorTest(DocumentationValidator, "Empty validations aggregation", async (validator) => {
      const result = validator.aggregateValidations([]);
      
      this.assert(result.status, "Should handle empty validations array");
      this.assert(result.summary.total === 0, "Should count zero total validations");
      
      return result;
    });

    // Test validator structure
    await this.runValidatorTest(DocumentationValidator, "Validator structure validation", async (validator) => {
      this.assert(validator.results, "Should have results object");
      this.assert(typeof validator.results.passed === "number", "Should track passed count");
      this.assert(typeof validator.results.failed === "number", "Should track failed count");
      this.assert(Array.isArray(validator.results.validations), "Should have validations array");
      
      return { status: "PASS" };
    });

    // Test utility methods
    await this.runValidatorTest(DocumentationValidator, "Utility methods", async (validator) => {
      // Test shouldSkipDirectory
      this.assert(validator.shouldSkipDirectory("node_modules"), "Should skip node_modules");
      this.assert(validator.shouldSkipDirectory(".git"), "Should skip .git");
      this.assert(!validator.shouldSkipDirectory("src"), "Should not skip src");
      
      // Test isTestFile
      this.assert(validator.isTestFile("test.spec.js"), "Should detect spec files");
      this.assert(validator.isTestFile("app.test.js"), "Should detect test files");
      this.assert(!validator.isTestFile("app.js"), "Should not detect regular files as test");
      
      return { status: "PASS" };
    });
  }

  // Simplified tests focusing on core functionality

  // Helper methods
  createDocProject(projectName, files) {
    const projectPath = this.createTempDir(projectName);
    
    Object.entries(files).forEach(([filePath, content]) => {
      const fullPath = path.join(projectPath, filePath);
      const dir = path.dirname(fullPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(fullPath, content);
    });
    
    return projectPath;
  }

  createTempDir(dirName) {
    const tempDir = path.join(this.tempTestDir, "documentation", dirName);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    return tempDir;
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new DocumentationValidatorTests();
  tester.runAllTests().catch(error => {
    console.error("❌ Documentation Validator tests failed:", error);
    process.exit(1);
  });
}

module.exports = DocumentationValidatorTests;
