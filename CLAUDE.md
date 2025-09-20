# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands

- `npm run dev` - Start development server with hot reload (uses nodemon + tsx)
- `npm run build` - Compile TypeScript to JavaScript in dist/
- `npm run start` - Run compiled JavaScript from dist/ (production)
- `npm run type-check` - Validate TypeScript without compilation
- `npm run deploy-commands` - Register slash commands with Discord API
- `npm run clean` - Remove dist/ directory

### Testing Commands

- `npm test` - Run all vitest unit tests
- `npm run test:watch` - Run tests in watch mode for development
- `npm run test:ui` - Open vitest UI for visual test management
- `npm run check:all` - Run full quality checks (type-check, lint, format-check, knip, test)

### Environment Setup

1. Copy `.env.example` to `.env`
2. Configure required environment variables:
   - `DISCORD_TOKEN` - Bot token from Discord Developer Portal
   - `CLIENT_ID` - Discord application client ID
   - `OPENAI_API_KEY` - OpenAI API key for AI features
   - `GOOGLE_API_KEY` - Google API key for Gemini AI video analysis features
   - `BLUESKY_USERNAME` - Bluesky handle (e.g., taka1415.bsky.social)
   - `BLUESKY_PASSWORD` - Bluesky app password (create in Bluesky settings)
   - `GITHUB_PAT` - GitHub Personal Access Token for blog repository access
   - `GUILD_ID` - (Optional) Guild ID for faster command deployment during development

## Architecture Overview

### Core Bot Structure

The bot follows a modular Discord.js v14 architecture with TypeScript:

- **Main Client** (`src/index.ts`) - Central bot client with dual interaction systems:

  - Traditional slash command system using command collections
  - Emoji reaction-based system for frictionless AI interactions

- **Intent Requirements** - Bot requires specific Gateway intents:
  - `Guilds`, `GuildMessages`, `GuildMessageReactions`, `MessageContent`
  - MessageContent is a privileged intent requiring approval

### Dual Interaction Paradigm

The bot implements two interaction methods for different use cases:

1. **Slash Commands** - Traditional `/command` interface for explicit actions
2. **Emoji Reactions** - React to messages with specific emojis to trigger AI responses in threads

### AI Service Layer

- **OpenAIService** (`src/services/openai.ts`) - Centralized OpenAI API integration

  - Implements lazy initialization to prevent deployment failures
  - Provides translation, grammar checking, word explanation, and text analysis
  - Uses GPT-4o-mini model for cost efficiency

- **ReactionHandler** (`src/services/reactionHandler.ts`) - Manages emoji-to-action mapping
  - Maps flag emojis (🇺🇸, 🇯🇵, etc.) to translation targets
  - Maps study emojis (✅, 📚, 💡) to learning functions
  - Automatically creates Discord threads for AI responses

### Command System

Commands are modular with consistent structure:

- Each command exports a `data` property (SlashCommandBuilder) and `execute` function
- Commands are registered in both `src/index.ts` and `src/deploy-commands.ts`
- Error handling includes graceful degradation and user feedback

### Language Learning Focus

The bot is specifically designed to improve English output habits through:

- Low-friction emoji reactions that encourage frequent use
- Thread-based responses that keep conversations organized
- Multiple AI-powered learning tools (translation, grammar, vocabulary)

## Discord Bot Permissions

### Required Permissions for Full Functionality

The bot requires these specific permissions to work properly:

**Essential Permissions:**
- `View Channels` - Read channel content and see messages
- `Send Messages` - Reply to commands and interactions  
- `Read Message History` - Access previous messages for context analysis
- `Use Slash Commands` - Execute `/` commands

**Thread & Reaction Features:**
- `Create Public Threads` - **CRITICAL** for `/search` command thread creation
- `Add Reactions` - React to messages for emoji-based AI features
- `Manage Messages` - Clean up bot reactions if needed

**AI Features:**
- `Attach Files` - For image analysis and content sharing
- `Embed Links` - Rich embed responses for better UX

### Permission Issues Troubleshooting

**"Cannot create thread in this channel" Error:**
1. Check if bot has `Create Public Threads` permission
2. Verify channel type supports threads (text channels only)
3. Ensure bot role is above @everyone with proper permissions
4. Check if channel has reached thread limit (Discord limit: 1000 active threads)

**Current Permission Integer:** `139586988096`

### Re-invite URL Template
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&permissions=139586988096&scope=bot%20applications.commands
```

Replace `YOUR_BOT_CLIENT_ID` with your actual bot's client ID.

## Testing Framework

### Vitest Configuration

The project uses **Vitest** as the testing framework with the following setup:

- **Test files**: `src/**/*.{test,spec}.{js,ts}` and `tests/**/*.{test,spec}.{js,ts}`
- **Environment**: Node.js
- **Globals**: Enabled for describe, it, expect, beforeEach, etc.
- **Configuration**: `vitest.config.ts` in project root

### Testing Guidelines

**IMPORTANT: Always write vitest unit tests instead of temporary JavaScript files when you need to test functionality.**

#### When to Write Tests:
- **New functions or methods** - Always create unit tests
- **Bug fixes** - Write tests to reproduce and verify fixes
- **Refactoring** - Ensure existing functionality is preserved
- **Complex logic** - Test edge cases and various scenarios

#### Test File Structure:
- Place tests in `src/[feature]/__tests__/` directories
- Use descriptive test names that explain what is being tested
- Group related tests using `describe` blocks
- Use `beforeEach` for setup code that runs before each test

#### Example Test Pattern:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FeatureName', () => {
  let instance: FeatureClass;

  beforeEach(() => {
    instance = new FeatureClass();
  });

  it('should handle normal case correctly', () => {
    const result = instance.method('input');
    expect(result).toBe('expected');
  });

  it('should handle edge cases', () => {
    // Test edge cases, error conditions, etc.
  });
});
```

#### Running Tests:
- **Development**: Use `npm run test:watch` for continuous testing
- **CI/CD**: Use `npm test` for one-time test runs
- **Debugging**: Use `npm run test:ui` for visual test interface
- **Quality Check**: `npm run check:all` includes tests in full validation

#### Current Test Coverage:
- ✅ **DiaryAIService**: Language detection patterns and functionality
- ✅ **DiaryFormatter**: Line breaking and text formatting functionality

## Development Notes

- The bot uses Discord.js v14 with TypeScript 5.x
- Hot reloading is configured via nodemon watching src/ directory
- Partial message/reaction handling is implemented for Discord's caching behavior
- Environment variables are loaded via dotenv in both development and command deployment

## how to auth bot

Option 2: Re-invite Bot with Proper Permissions

1. Get your Client ID from Discord Developer Portal → Your App → General Information
2. Replace YOUR_BOT_CLIENT_ID in this URL:

https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&permissions=139586988096&scope=bot%20
applications.commands

## Planning and Documentation Workflow

### Planning Documents Requirement

**IMPORTANT: Before updating any code, you MUST create a detailed planning document in the `doc/` folder.**

#### Planning Document Requirements:
1. **File naming**: Use descriptive names like `feature-name-implementation-plan.md`
2. **Location**: All planning documents go in the `doc/` folder
3. **Content structure**:
   - **Overview**: Brief description of what needs to be implemented/changed
   - **Analysis**: Current state analysis and requirements
   - **Implementation Plan**: Step-by-step breakdown of changes needed
   - **Files to modify**: List of files that will be affected
   - **Testing approach**: How the changes will be tested
   - **Potential risks**: Any concerns or edge cases to consider

#### When to Create Planning Documents:
- **New features**: Always create a plan before implementation
- **Bug fixes**: Document the root cause analysis and fix approach
- **Refactoring**: Outline the refactoring strategy and scope
- **Complex changes**: Any change affecting multiple files or systems

#### Example Planning Document Structure:
```markdown
# Feature Name Implementation Plan

## Overview
Brief description of the feature/change

## Current State Analysis
- What exists now
- What's missing or broken
- Requirements gathering

## Implementation Plan
1. Step 1: Specific action
2. Step 2: Specific action
3. Step N: Specific action

## Files to Modify
- `src/path/to/file1.ts` - What changes
- `src/path/to/file2.ts` - What changes

## Testing Approach
- Unit tests to write/update
- Integration tests needed
- Manual testing steps

## Potential Risks
- Edge cases to consider
- Backward compatibility concerns
- Performance implications
```

### Workflow Process:
1. **Plan first**: Create planning document in `doc/`
2. **Review plan**: Ensure all aspects are covered
3. **Implement**: Make code changes following the plan
4. **Test**: Run `npm run check:all` after implementation
5. **Update plan**: Mark completed or note any deviations

## Code Organization Rules

### Package by Feature Architecture

**IMPORTANT: Follow "package by feature" pattern for code organization.**

#### Principles:
1. **Group by business feature, not technical layer**
   - ✅ `src/features/translation/` - All translation-related code
   - ✅ `src/features/memory/` - All memory/storage functionality  
   - ❌ `src/services/` - Generic technical services only

2. **Keep feature code self-contained**
   - Service classes belong within their feature package
   - Feature-specific utilities stay in the feature folder
   - Tests are co-located with the code they test

3. **Simple, focused feature modules**
   - Each feature should have a clear single responsibility
   - Avoid cross-feature dependencies where possible
   - Use dependency injection for shared services

#### Example Structure:
```
src/features/translation/
├── translationHandler.ts      # Main feature coordinator
├── translationService.ts      # Business logic
├── googleTranslationService.ts # External API integration  
├── translationFormatter.ts    # UI formatting
├── types.ts                   # Feature-specific types
└── __tests__/                 # Feature tests
    ├── translationService.test.ts
    └── googleTranslation.test.ts
```

#### When to use `src/services/`:
- ✅ **Shared infrastructure**: Database connections, HTTP clients
- ✅ **Cross-cutting concerns**: Logging, authentication, caching  
- ✅ **Framework utilities**: Discord.js helpers, base classes
- ❌ **Feature-specific logic**: Translation, memory, blog functionality

### Code Style Rules

#### Avoid Nested Conditions
**IMPORTANT: Prefer early returns and guard clauses over nested if statements.**

❌ **Bad - Nested conditions:**
```typescript
if (condition1) {
  if (condition2) {
    if (condition3) {
      // do work
    }
  }
}
```

✅ **Good - Early returns:**
```typescript
if (!condition1) return;
if (!condition2) return;  
if (!condition3) return;

// do work
```

✅ **Good - Extract methods:**
```typescript
private async handleTranslation(scenario: string, text: string) {
  if (scenario === 'japanese-only') {
    return this.translateToEnglish(text);
  }
  if (scenario === 'english-only') {
    return this.translateToJapanese(text);
  }
  return null;
}
```

## Programming Framework

### Core Programming Principles

**IMPORTANT: Follow these fundamental programming principles for maintainable, readable code.**

#### 1. Single Responsibility Principle (SRP)

**Each function should have ONE clear purpose and do ONE thing well.**

❌ **Bad - Multiple responsibilities:**
```typescript
async function processUserMessage(message: string, userId: string) {
  // Validates input
  if (!message || !userId) throw new Error('Invalid input');
  
  // Translates text
  const translation = await translateText(message);
  
  // Saves to database
  await saveToDatabase(userId, translation);
  
  // Sends notification
  await sendNotification(userId, 'Translation complete');
  
  // Updates analytics
  await updateAnalytics('translation', userId);
  
  return translation;
}
```

✅ **Good - Single responsibility functions:**
```typescript
// Input validation
function validateMessageInput(message: string, userId: string): void {
  if (!message || !userId) throw new Error('Invalid input');
}

// Translation logic
async function translateUserMessage(message: string): Promise<string> {
  return await translateText(message);
}

// Data persistence
async function saveTranslation(userId: string, translation: string): Promise<void> {
  await saveToDatabase(userId, translation);
}

// Notification handling
async function notifyTranslationComplete(userId: string): Promise<void> {
  await sendNotification(userId, 'Translation complete');
}

// Analytics tracking
async function trackTranslationEvent(userId: string): Promise<void> {
  await updateAnalytics('translation', userId);
}

// Orchestration function
async function processUserMessage(message: string, userId: string): Promise<string> {
  validateMessageInput(message, userId);
  
  const translation = await translateUserMessage(message);
  await saveTranslation(userId, translation);
  await notifyTranslationComplete(userId);
  await trackTranslationEvent(userId);
  
  return translation;
}
```

#### 2. Function Design Guidelines

##### Function Size and Complexity
- **Max 20 lines per function** (excluding blank lines and comments)
- **Max 3 parameters** - Use objects for more complex data
- **One level of abstraction** per function

❌ **Bad - Too complex:**
```typescript
function processTranslationRequest(text: string, sourceLanguage: string, 
                                 targetLanguage: string, userId: string, 
                                 isUrgent: boolean, callback?: Function) {
  if (!text) return null;
  if (!sourceLanguage || !targetLanguage) return null;
  if (!userId) return null;
  
  let result;
  if (sourceLanguage === 'ja' && targetLanguage === 'en') {
    result = translateJapaneseToEnglish(text);
    if (isUrgent) {
      logUrgentTranslation(userId, text, result);
      if (callback) callback('urgent-complete');
    }
  } else if (sourceLanguage === 'en' && targetLanguage === 'ja') {
    result = translateEnglishToJapanese(text);
    if (isUrgent) {
      logUrgentTranslation(userId, text, result);
      if (callback) callback('urgent-complete');
    }
  }
  
  updateUserStats(userId);
  return result;
}
```

✅ **Good - Simple, focused functions:**
```typescript
interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  userId: string;
  isUrgent?: boolean;
  onComplete?: (status: string) => void;
}

function validateTranslationRequest(request: TranslationRequest): void {
  if (!request.text) throw new Error('Text is required');
  if (!request.sourceLanguage) throw new Error('Source language is required');
  if (!request.targetLanguage) throw new Error('Target language is required');
  if (!request.userId) throw new Error('User ID is required');
}

function getTranslationFunction(source: string, target: string) {
  if (source === 'ja' && target === 'en') return translateJapaneseToEnglish;
  if (source === 'en' && target === 'ja') return translateEnglishToJapanese;
  throw new Error(`Unsupported language pair: ${source} -> ${target}`);
}

async function executeTranslation(request: TranslationRequest): Promise<string> {
  const translateFn = getTranslationFunction(request.sourceLanguage, request.targetLanguage);
  return await translateFn(request.text);
}

function handleUrgentTranslation(request: TranslationRequest, result: string): void {
  if (!request.isUrgent) return;
  
  logUrgentTranslation(request.userId, request.text, result);
  request.onComplete?.('urgent-complete');
}

async function processTranslationRequest(request: TranslationRequest): Promise<string> {
  validateTranslationRequest(request);
  
  const result = await executeTranslation(request);
  handleUrgentTranslation(request, result);
  updateUserStats(request.userId);
  
  return result;
}
```

#### 3. Naming Conventions

##### Function Names Should Be Verbs
- ✅ `translateText()`, `validateInput()`, `sendNotification()`
- ❌ `translation()`, `validation()`, `notification()`

##### Boolean Functions Should Ask Questions
- ✅ `isValidEmail()`, `hasPermission()`, `shouldRetry()`
- ❌ `validEmail()`, `permission()`, `retry()`

##### Use Descriptive Names
- ✅ `calculateMonthlySubscriptionTotal()`
- ❌ `calc()`, `process()`, `handle()`

#### 4. Error Handling Standards

##### Fail Fast Principle
```typescript
function processPayment(amount: number, currency: string, userId: string): Promise<PaymentResult> {
  // Validate early - fail fast
  if (amount <= 0) throw new Error('Amount must be positive');
  if (!currency) throw new Error('Currency is required');
  if (!userId) throw new Error('User ID is required');
  
  // Process only after validation
  return executePayment({ amount, currency, userId });
}
```

##### Use Specific Error Types
```typescript
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class TranslationError extends Error {
  constructor(message: string, public readonly sourceLanguage: string) {
    super(message);
    this.name = 'TranslationError';
  }
}
```

#### 5. Code Organization Within Functions

##### Use Guard Clauses
```typescript
function processUser(user: User): ProcessedUser {
  // Guard clauses at the top
  if (!user) return null;
  if (!user.email) return null;
  if (!user.isActive) return null;
  
  // Main logic after guards
  const processedUser = transformUser(user);
  return enhanceUserData(processedUser);
}
```

##### Separate Setup, Processing, and Cleanup
```typescript
async function processTranslationBatch(requests: TranslationRequest[]): Promise<TranslationResult[]> {
  // Setup
  const validRequests = requests.filter(isValidRequest);
  const batchId = generateBatchId();
  
  // Processing
  const results = await Promise.all(
    validRequests.map(request => processTranslationRequest(request))
  );
  
  // Cleanup
  await logBatchCompletion(batchId, results.length);
  return results;
}
```

#### 6. Pure Functions When Possible

**Prefer pure functions that don't modify external state and always return the same output for the same input.**

✅ **Good - Pure function:**
```typescript
function calculateTranslationCost(wordCount: number, sourceLanguage: string): number {
  const baseRate = getLanguageRate(sourceLanguage);
  const wordCost = wordCount * baseRate;
  return Math.round(wordCost * 100) / 100; // Round to 2 decimal places
}
```

❌ **Bad - Impure function with side effects:**
```typescript
let totalProcessed = 0; // Global state

function calculateTranslationCost(wordCount: number, sourceLanguage: string): number {
  totalProcessed += wordCount; // Side effect - modifying global state
  console.log(`Processed ${totalProcessed} words so far`); // Side effect - logging
  
  const baseRate = getLanguageRate(sourceLanguage);
  return wordCount * baseRate;
}
```
