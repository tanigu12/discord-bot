# Code Style and Conventions

## Code Organization

### Package by Feature Architecture

**Follow "package by feature" pattern, not technical layers:**

```
✅ Good - Feature-based organization:
src/features/translation/
├── translationHandler.ts      # Main coordinator
├── translationService.ts      # Business logic
├── googleTranslationService.ts # External API
├── translationFormatter.ts    # UI formatting
├── types.ts                   # Feature types
└── __tests__/                 # Co-located tests

❌ Bad - Technical layer organization:
src/services/              # Generic technical services
src/handlers/             # All handlers together
src/formatters/           # All formatters together
```

### When to Use `src/services/`

- ✅ **Shared infrastructure**: Database, HTTP clients
- ✅ **Cross-cutting concerns**: Logging, auth, caching
- ✅ **Framework utilities**: Discord.js helpers, base classes
- ❌ **Feature-specific logic**: Translation, memory, blog functionality

## Programming Principles

### Single Responsibility Principle

**Each function should have ONE clear purpose:**

```typescript
// ✅ Good - Single responsibility
function validateMessageInput(message: string, userId: string): void {
  if (!message || !userId) throw new Error('Invalid input');
}

async function translateUserMessage(message: string): Promise<string> {
  return await translateText(message);
}

// ❌ Bad - Multiple responsibilities
function processUserMessage(message: string, userId: string) {
  // validates, translates, saves, notifies, tracks analytics
}
```

### Function Guidelines

- **Max 20 lines per function** (excluding blanks/comments)
- **Max 3 parameters** - use objects for complex data
- **One level of abstraction per function**
- **Use early returns over nested conditions**

```typescript
// ✅ Good - Early returns
function processUser(user: User): ProcessedUser {
  if (!user) return null;
  if (!user.email) return null;
  if (!user.isActive) return null;

  const processedUser = transformUser(user);
  return enhanceUserData(processedUser);
}

// ❌ Bad - Nested conditions
function processUser(user: User): ProcessedUser {
  if (user) {
    if (user.email) {
      if (user.isActive) {
        // deep nesting...
      }
    }
  }
}
```

## Naming Conventions

### Functions

- **Use verbs**: `translateText()`, `validateInput()`, `sendNotification()`
- **Booleans ask questions**: `isValidEmail()`, `hasPermission()`, `shouldRetry()`
- **Be descriptive**: `calculateMonthlySubscriptionTotal()` not `calc()`

### Classes and Interfaces

- **PascalCase**: `TranslationService`, `AIPartnerIntegration`
- **Descriptive suffixes**: `*Service`, `*Handler`, `*Formatter`, `*Integration`

### Variables and Properties

- **camelCase**: `userMessage`, `translationResult`, `openaiClient`
- **Constants**: `UPPER_SNAKE_CASE` for module-level constants

## TypeScript Configuration

### Strict Mode Settings

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true
}
```

### ESLint Rules

- `@typescript-eslint/no-unused-vars`: Error with underscore ignore pattern
- `@typescript-eslint/no-explicit-any`: Warning
- `prefer-const`: Error
- `no-var`: Error

### Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

## Error Handling

### Fail Fast Principle

```typescript
function processPayment(amount: number, currency: string, userId: string) {
  // Validate early - fail fast
  if (amount <= 0) throw new Error('Amount must be positive');
  if (!currency) throw new Error('Currency is required');
  if (!userId) throw new Error('User ID is required');

  // Process only after validation
  return executePayment({ amount, currency, userId });
}
```

### Custom Error Types

```typescript
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

## Testing Standards

### Test File Structure

- Place tests in `src/[feature]/__tests__/` directories
- Use descriptive test names explaining what is tested
- Group related tests with `describe` blocks
- Use `beforeEach` for setup code

### Example Test Pattern

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(() => {
    service = new TranslationService();
  });

  it('should translate Japanese to English correctly', () => {
    const result = service.translate('こんにちは', 'ja', 'en');
    expect(result).toBe('Hello');
  });
});
```

## Comments and Documentation

### Comment Guidelines

- **Avoid obvious comments** - code should be self-documenting
- **Explain WHY, not WHAT** when comments are needed
- **Use JSDoc for public APIs** and complex functions
- **NO comments unless explicitly requested by user**

## Import/Export Patterns

### Module Exports

```typescript
// Feature index.ts - central export point
export { TranslationHandler } from './translationHandler';
export { TranslationService } from './translationService';
export type { TranslationRequest, TranslationResult } from './types';
```

### Import Organization

```typescript
// External dependencies first
import { Client, GatewayIntentBits } from 'discord.js';
import OpenAI from 'openai';

// Internal imports - relative paths
import { TranslationHandler } from './features/translation';
import { BaseAIService } from './services/baseAIService';
```
