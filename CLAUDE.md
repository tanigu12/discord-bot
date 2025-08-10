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

### Environment Setup

1. Copy `.env.example` to `.env`
2. Configure required environment variables:
   - `DISCORD_TOKEN` - Bot token from Discord Developer Portal
   - `CLIENT_ID` - Discord application client ID
   - `OPENAI_API_KEY` - OpenAI API key for AI features
   - `BLUESKY_USERNAME` - Bluesky handle (e.g., taka1415.bsky.social)
   - `BLUESKY_PASSWORD` - Bluesky app password (create in Bluesky settings)
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

When re-inviting the bot, ensure these permissions are granted:

- View Channels, Send Messages, Read Message History
- Add Reactions, Create Public Threads
- Use Slash Commands (requires bot + applications.commands scopes)

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
