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
   - `BLUESKY_USERNAME` - Bluesky handle (e.g., taka1415.bsky.social)
   - `BLUESKY_PASSWORD` - Bluesky app password (create in Bluesky settings)
   - `ASANA_PERSONAL_ACCESS_TOKEN` - Asana Personal Access Token for task management
   - `ASANA_DEFAULT_WORKSPACE_GID` - (Optional) Default Asana workspace GID
   - `ASANA_DEFAULT_PROJECT_GID` - (Optional) Default Asana project GID for new tasks
   - `ASANA_DEFAULT_USER_GID` - (Optional) Default Asana user GID for task queries
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
