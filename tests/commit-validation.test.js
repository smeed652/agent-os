const { validateCommitMessage } = require('../scripts/commit-validation');

describe('Commit Message Validation', () => {
  describe('Valid Conventional Commits', () => {
    test('should accept valid feat commit', () => {
      const result = validateCommitMessage('feat(auth): add OAuth2 authentication');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('feat');
      expect(result.scope).toBe('auth');
      expect(result.description).toBe('add OAuth2 authentication');
    });

    test('should accept valid fix commit', () => {
      const result = validateCommitMessage('fix(dashboard): resolve quarterly metrics display issue');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('fix');
      expect(result.scope).toBe('dashboard');
      expect(result.description).toBe('resolve quarterly metrics display issue');
    });

    test('should accept valid docs commit', () => {
      const result = validateCommitMessage('docs(workflow): update deployment guide');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('docs');
      expect(result.scope).toBe('workflow');
      expect(result.description).toBe('update deployment guide');
    });

    test('should accept valid style commit', () => {
      const result = validateCommitMessage('style(ui): improve button spacing');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('style');
      expect(result.scope).toBe('ui');
      expect(result.description).toBe('improve button spacing');
    });

    test('should accept valid refactor commit', () => {
      const result = validateCommitMessage('refactor(api): simplify user authentication logic');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('refactor');
      expect(result.scope).toBe('api');
      expect(result.description).toBe('simplify user authentication logic');
    });

    test('should accept valid perf commit', () => {
      const result = validateCommitMessage('perf(database): optimize query performance');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('perf');
      expect(result.scope).toBe('database');
      expect(result.description).toBe('optimize query performance');
    });

    test('should accept valid test commit', () => {
      const result = validateCommitMessage('test(auth): add unit tests for login flow');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('test');
      expect(result.scope).toBe('auth');
      expect(result.description).toBe('add unit tests for login flow');
    });

    test('should accept valid chore commit', () => {
      const result = validateCommitMessage('chore(deps): update dependencies');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('chore');
      expect(result.scope).toBe('deps');
      expect(result.description).toBe('update dependencies');
    });

    test('should accept commit without scope', () => {
      const result = validateCommitMessage('feat: add new feature');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('feat');
      expect(result.scope).toBe(null);
      expect(result.description).toBe('add new feature');
    });
  });

  describe('Invalid Conventional Commits', () => {
    test('should reject commit without type', () => {
      const result = validateCommitMessage('add new feature');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Missing commit type');
    });

    test('should reject invalid commit type', () => {
      const result = validateCommitMessage('invalid(auth): add feature');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid commit type');
    });

    test('should reject commit without description', () => {
      const result = validateCommitMessage('feat(auth):');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Missing description');
    });

    test('should reject commit with empty description', () => {
      const result = validateCommitMessage('feat(auth): ');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Missing description');
    });

    test('should reject commit without colon', () => {
      const result = validateCommitMessage('feat(auth) add feature');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Missing colon separator');
    });

    test('should reject commit with uppercase first letter in description', () => {
      const result = validateCommitMessage('feat(auth): Add feature');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Description must start with lowercase letter');
    });

    test('should reject commit with period at end', () => {
      const result = validateCommitMessage('feat(auth): Add feature.');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Description should not end with period');
    });

    test('should reject commit that is too long', () => {
      const longDescription = 'a'.repeat(73);
      const result = validateCommitMessage(`feat(auth): ${longDescription}`);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Description too long');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string', () => {
      const result = validateCommitMessage('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Empty commit message');
    });

    test('should handle null input', () => {
      const result = validateCommitMessage(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid input');
    });

    test('should handle undefined input', () => {
      const result = validateCommitMessage(undefined);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid input');
    });

    test('should handle whitespace-only input', () => {
      const result = validateCommitMessage('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Empty commit message');
    });
  });

  describe('Scope Validation', () => {
    test('should accept valid scope with hyphens', () => {
      const result = validateCommitMessage('feat(user-auth): add login functionality');
      expect(result.isValid).toBe(true);
      expect(result.scope).toBe('user-auth');
    });

    test('should accept valid scope with underscores', () => {
      const result = validateCommitMessage('feat(user_auth): add login functionality');
      expect(result.isValid).toBe(true);
      expect(result.scope).toBe('user_auth');
    });

    test('should reject scope with spaces', () => {
      const result = validateCommitMessage('feat(user auth): add login functionality');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid scope format');
    });

    test('should reject scope with special characters', () => {
      const result = validateCommitMessage('feat(user@auth): add login functionality');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid scope format');
    });
  });
}); 