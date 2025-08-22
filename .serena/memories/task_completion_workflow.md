# Task Completion Workflow

## Required Steps After Coding

### 1. Quality Check Command
**ALWAYS run this command after completing any code changes:**
```bash
npm run check:all
```

This comprehensive command runs:
- `npm run type-check` - TypeScript validation
- `npm run lint` - ESLint code quality check  
- `npm run format:check` - Prettier formatting validation
- `npm run knip` - Unused code detection
- `npm test` - All Vitest unit tests

### 2. Individual Quality Commands
If `check:all` fails, run individual commands to identify issues:

```bash
# Type checking
npm run type-check        # Fix TypeScript errors

# Linting
npm run lint             # Check for lint errors
npm run lint:fix         # Auto-fix lint issues

# Formatting  
npm run format:check     # Check formatting
npm run format           # Auto-format code

# Unused code
npm run knip             # Detect unused exports/imports
npm run knip:fix         # Auto-remove unused exports

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Visual test interface
```

## Pre-Commit Checklist

### Code Quality Requirements
- ✅ All TypeScript errors resolved (`npm run type-check`)
- ✅ All ESLint issues fixed (`npm run lint`)
- ✅ Code properly formatted (`npm run format:check`)  
- ✅ No unused code detected (`npm run knip`)
- ✅ All tests passing (`npm test`)

### Testing Requirements
**Always write Vitest unit tests instead of temporary JavaScript files:**

```typescript
// ✅ Good - Proper test file
// src/features/translation/__tests__/translationService.test.ts
import { describe, it, expect } from 'vitest';

describe('TranslationService', () => {
  it('should translate text correctly', () => {
    // Test implementation
  });
});
```

### Documentation Updates
- Update README.md if adding new features
- Update CLAUDE.md if changing development commands
- Add JSDoc comments for complex public APIs

## Development Commands Integration

### During Active Development
```bash
npm run dev              # Start with hot reload
npm run test:watch       # Run tests continuously
```

### Before Committing
```bash
npm run check:all        # Comprehensive quality check
```

### Deployment Preparation
```bash
npm run build            # Compile TypeScript
npm run deploy-commands  # Update Discord slash commands
npm run start            # Test production build
```

## Error Resolution Workflow

### TypeScript Errors
1. Run `npm run type-check`
2. Fix type annotations and imports
3. Ensure strict mode compliance
4. Re-run `npm run type-check`

### ESLint Errors  
1. Run `npm run lint`
2. Use `npm run lint:fix` for auto-fixable issues
3. Manually fix remaining issues
4. Follow code style conventions

### Test Failures
1. Run `npm run test:ui` for visual debugging
2. Check test logic and expectations
3. Update tests if business logic changed
4. Ensure proper mocking for external services

### Unused Code Issues
1. Run `npm run knip` to identify unused exports
2. Use `npm run knip:fix` for auto-removal
3. Manually review and remove unused imports
4. Update feature index files if needed

## CI/CD Integration
The `check:all` command is designed to match CI/CD pipeline requirements:
- All checks must pass for successful builds
- Security audits run separately via `npm run check:security`
- Production builds use `npm run knip:production` for stricter checking

## Quality Gates
- **No commits** without passing `npm run check:all`
- **No deploys** without successful test suite
- **No releases** without security audit clearance