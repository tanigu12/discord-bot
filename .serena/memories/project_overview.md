# Discord Bot - AI Language Assistant Project Overview

## Purpose
This is an AI-powered Discord bot designed to support English learning through various interactive features. The bot serves as a comprehensive language learning assistant with translation, grammar checking, vocabulary explanations, and content analysis capabilities.

## Core Features
1. **Slash Commands**: Traditional `/command` interface for explicit actions
   - `/search` - Content analysis with URL fetching and detailed explanations
   - `/random` - Daily diary topic suggestions based on news
   - `/format` - Thread formatting for Obsidian blog posts (bilingual JP/EN)
   - `/bsky` - Bluesky social media posting
   - `/asana` - Task management integration

2. **Emoji Reaction System**: Frictionless AI interactions through emoji reactions
   - 🧙‍♂️ Larry consultation (expert advice with web search)
   - 💡 Idea thread creation (idea channel specific)
   - 🧠 Memory functionality for saving vocabulary to Obsidian Git repository

3. **AI Integration**: Multiple AI services for different use cases
   - OpenAI GPT-4o-mini for cost-efficient responses
   - Google Gemini for video analysis
   - Web search capabilities for up-to-date information

## Target Users
English learners who want to improve their language skills through:
- Regular writing practice with diary prompts
- Instant translation and grammar checking
- Vocabulary building and retention
- Content analysis and comprehension
- Expert consultation on various topics

## Technical Architecture
- **Framework**: Discord.js v14 with TypeScript 5.x
- **Architecture**: Modular "package by feature" organization
- **Testing**: Vitest with comprehensive unit tests
- **AI Services**: Centralized BaseAIService with lazy initialization
- **External Integrations**: Asana, Bluesky, GitHub (Obsidian), Google APIs

## Development Philosophy
- Low-friction interactions (emoji reactions)
- Thread-based responses for organization
- Graceful error handling and user feedback
- Cost-efficient AI model usage
- Comprehensive testing and quality checks