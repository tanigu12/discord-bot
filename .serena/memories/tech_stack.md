# Technology Stack

## Core Technologies
- **Node.js**: 18.x+ (ES modules, modern features)
- **TypeScript**: 5.9.2 with strict configuration
- **Discord.js**: v14.21.0 (latest Discord API v10)
- **Package Manager**: npm (8.0.0+)

## AI & External Services
- **OpenAI**: v5.12.2 (GPT-4o-mini model)
- **Google Generative AI**: v0.24.1 (Gemini for video analysis)
- **Google Cloud Translate**: v9.2.0
- **Asana**: v1.0.4 (task management)
- **Bluesky AT Protocol**: v0.16.2
- **GitHub API**: v22.0.0 (Obsidian integration)

## Development Tools
- **Runtime**: tsx v4.20.3 (TypeScript execution with watch mode)
- **Testing**: Vitest v3.2.4 with UI support
- **Linting**: ESLint v9.33.0 with TypeScript plugin
- **Formatting**: Prettier v3.6.2
- **Code Quality**: Knip v5.62.0 (unused code detection)
- **Security**: better-npm-audit v3.11.0

## Configuration Files
- **tsconfig.json**: ES2022 target, ESNext modules, strict mode
- **eslint.config.js**: TypeScript-focused with Prettier integration
- **vitest.config.ts**: Node environment with globals enabled
- **.prettierrc**: 100 char width, single quotes, 2-space tabs

## Key Dependencies
```json
{
  "runtime": {
    "discord.js": "^14.21.0",
    "openai": "^5.12.2", 
    "dotenv": "^17.2.1",
    "axios": "^1.11.0"
  },
  "development": {
    "typescript": "^5.9.2",
    "tsx": "^4.20.3",
    "vitest": "^3.2.4",
    "eslint": "^9.33.0",
    "prettier": "^3.6.2"
  }
}
```

## System Requirements
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- macOS/Linux/Windows support
- Internet connection for AI services