# Project Structure

## Root Directory Layout
```
discord-bot/
├── .serena/                 # Serena MCP server cache
├── .claude/                 # Claude Code configuration  
├── docs/                    # Planning documents
├── doc/                     # Implementation plans
├── data/                    # Static data files
├── src/                     # Main source code
├── .env.example            # Environment template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vitest.config.ts        # Test configuration
├── eslint.config.js        # Linting rules
├── .prettierrc             # Code formatting
└── CLAUDE.md               # Development instructions
```

## Source Code Organization (`src/`)

### Package by Feature Architecture
```
src/
├── features/               # Feature-based modules
│   ├── translation/       # Translation functionality
│   ├── memory/            # Memory/vocabulary system
│   ├── search/            # Content analysis
│   ├── blog/              # Blog formatting
│   ├── commands/          # Slash commands
│   ├── reactions/         # Emoji reaction system
│   ├── ai-partner/        # Larry AI personality
│   └── [feature]/         # Other feature modules
├── services/              # Shared infrastructure
│   ├── baseAIService.ts   # Common AI functionality
│   ├── asanaService.ts    # Task management
│   ├── blueskyService.ts  # Social media
│   └── githubService.ts   # Repository integration
├── utils/                 # Shared utilities
├── constants/             # Application constants
└── index.ts               # Main bot entry point
```

### Feature Module Structure
Each feature follows consistent internal organization:
```
src/features/[feature]/
├── index.ts               # Feature exports
├── [feature]Handler.ts    # Main coordinator
├── [feature]Service.ts    # Business logic
├── [feature]Formatter.ts  # UI/output formatting
├── types.ts               # Feature-specific types
└── __tests__/             # Co-located tests
```

## Key Files by Function

### Core Bot Files
- `src/index.ts` - Main Discord client and event handlers
- `src/deploy-commands.ts` - Slash command registration
- `src/services/baseAIService.ts` - Common AI functionality

### Feature Handlers
- `src/features/reactions/reactionHandler.ts` - Emoji reaction system
- `src/features/commands/index.ts` - Slash command implementations  
- `src/features/translation/translationHandler.ts` - Translation coordination
- `src/features/memory/memoryHandler.ts` - Vocabulary saving
- `src/features/search/contentAnalysisService.ts` - Content analysis
- `src/features/ai-partner/larryAIService.ts` - Larry AI personality

### External Integrations
- `src/services/asanaService.ts` - Task management API
- `src/services/blueskyService.ts` - Social media posting
- `src/services/githubService.ts` - Obsidian repository sync
- `src/features/translation/googleTranslationService.ts` - Google Translate

### Configuration Files
- `.env` - Environment variables (create from .env.example)
- `tsconfig.json` - TypeScript: ES2022, strict mode, ESNext modules
- `eslint.config.js` - ESLint: TypeScript + Prettier integration
- `vitest.config.ts` - Testing: Node environment with globals
- `.prettierrc` - Formatting: 100 width, single quotes, 2 spaces

## Testing Structure
```
src/features/[feature]/__tests__/
├── [feature]Service.test.ts      # Business logic tests
├── [feature]Formatter.test.ts    # Formatting tests
└── integration.test.ts           # Feature integration tests
```

## Documentation Structure  
```
docs/                      # Planning documents (required before coding)
├── [feature]-implementation-plan.md
└── [analysis]-document.md

doc/                       # Legacy documentation
```

## Build Output
```
dist/                      # TypeScript compilation output
├── features/              # Compiled feature modules
├── services/              # Compiled services
└── index.js               # Main entry point
```

## Environment Configuration
Required environment variables in `.env`:
```
DISCORD_TOKEN=             # Discord bot token
CLIENT_ID=                 # Discord application ID
OPENAI_API_KEY=            # OpenAI API key
GOOGLE_API_KEY=            # Google Gemini API
BLUESKY_USERNAME=          # Bluesky handle
BLUESKY_PASSWORD=          # Bluesky app password
ASANA_PERSONAL_ACCESS_TOKEN= # Asana API token
GITHUB_PAT=                # GitHub Personal Access Token
GUILD_ID=                  # Discord server ID (development)
```

## Architecture Principles
1. **Feature-based organization** over technical layers
2. **Co-located tests** with source code
3. **Single responsibility** per module
4. **Dependency injection** for external services
5. **Graceful error handling** throughout
6. **Comprehensive testing** with Vitest
7. **Type safety** with strict TypeScript