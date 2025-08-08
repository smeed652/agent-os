/**
 * Commit Message Validation Logic
 * Validates conventional commit format according to Agent OS standards
 */

const VALID_TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore'];
const MAX_DESCRIPTION_LENGTH = 72;

/**
 * Validates a commit message against conventional commit format
 * @param {string} commitMessage - The commit message to validate
 * @returns {object} - Validation result with isValid, type, scope, description, and error
 */
function validateCommitMessage(commitMessage) {
  // Handle invalid inputs
  if (commitMessage === null || commitMessage === undefined) {
    return {
      isValid: false,
      type: null,
      scope: null,
      description: null,
      error: 'Invalid input'
    };
  }

  if (typeof commitMessage !== 'string') {
    return {
      isValid: false,
      type: null,
      scope: null,
      description: null,
      error: 'Invalid input'
    };
  }

  // Handle empty or whitespace-only messages
  const trimmedMessage = commitMessage.trim();
  if (!trimmedMessage) {
    return {
      isValid: false,
      type: null,
      scope: null,
      description: null,
      error: 'Empty commit message'
    };
  }

  // Parse the commit message
  const result = parseCommitMessage(trimmedMessage);
  
  if (!result.isValid) {
    return result;
  }

  // Validate description length
  if (result.description && result.description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      isValid: false,
      type: result.type,
      scope: result.scope,
      description: result.description,
      error: 'Description too long (max 72 characters)'
    };
  }

  // Validate description format
  if (result.description) {
    const descriptionValidation = validateDescription(result.description);
    if (!descriptionValidation.isValid) {
      return {
        isValid: false,
        type: result.type,
        scope: result.scope,
        description: result.description,
        error: descriptionValidation.error
      };
    }
  }

  return result;
}

/**
 * Parses the commit message to extract type, scope, and description
 * @param {string} message - The commit message to parse
 * @returns {object} - Parsed result
 */
function parseCommitMessage(message) {
  // Check for conventional commit format: type(scope): description
  const conventionalPattern = /^([a-z]+)(?:\(([^)]+)\))?:\s*(.+)$/;
  const match = message.match(conventionalPattern);

  if (!match) {
    // Check if it's missing the colon
    if (message.includes('(') && !message.includes(':')) {
      return {
        isValid: false,
        type: null,
        scope: null,
        description: null,
        error: 'Missing colon separator'
      };
    }

    // Check if it's missing the type
    if (!message.includes(':')) {
      return {
        isValid: false,
        type: null,
        scope: null,
        description: null,
        error: 'Missing commit type'
      };
    }

    // Check for missing description cases
    if (message.match(/^([a-z]+)(?:\(([^)]+)\))?:\s*$/)) {
      return {
        isValid: false,
        type: null,
        scope: null,
        description: null,
        error: 'Missing description'
      };
    }

    return {
      isValid: false,
      type: null,
      scope: null,
      description: null,
      error: 'Invalid conventional commit format'
    };
  }

  const [, type, scope, description] = match;

  // Validate commit type
  if (!VALID_TYPES.includes(type)) {
    return {
      isValid: false,
      type: type,
      scope: scope || null,
      description: description,
      error: 'Invalid commit type. Must be one of: ' + VALID_TYPES.join(', ')
    };
  }

  // Validate scope format if present
  if (scope && !isValidScope(scope)) {
    return {
      isValid: false,
      type: type,
      scope: scope,
      description: description,
      error: 'Invalid scope format. Use lowercase letters, numbers, hyphens, or underscores only'
    };
  }

  // Validate description
  if (!description || !description.trim()) {
    return {
      isValid: false,
      type: type,
      scope: scope || null,
      description: description,
      error: 'Missing description'
    };
  }

  return {
    isValid: true,
    type: type,
    scope: scope || null,
    description: description.trim()
  };
}

/**
 * Validates the description format
 * @param {string} description - The description to validate
 * @returns {object} - Validation result
 */
function validateDescription(description) {
  const trimmed = description.trim();

  // Check if description ends with period first
  if (trimmed.endsWith('.')) {
    return {
      isValid: false,
      error: 'Description should not end with period'
    };
  }

  // Check if description starts with lowercase letter
  if (trimmed.length > 0 && trimmed[0] !== trimmed[0].toLowerCase()) {
    return {
      isValid: false,
      error: 'Description must start with lowercase letter'
    };
  }

  return {
    isValid: true
  };
}

/**
 * Validates scope format
 * @param {string} scope - The scope to validate
 * @returns {boolean} - Whether the scope is valid
 */
function isValidScope(scope) {
  // Scope should contain only lowercase letters, numbers, hyphens, and underscores
  const scopePattern = /^[a-z0-9_-]+$/;
  return scopePattern.test(scope);
}

module.exports = {
  validateCommitMessage,
  parseCommitMessage,
  validateDescription,
  isValidScope,
  VALID_TYPES,
  MAX_DESCRIPTION_LENGTH
}; 