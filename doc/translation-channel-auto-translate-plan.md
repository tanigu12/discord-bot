# Translation Channel Auto-Translate Implementation Plan

## Overview
Implement automatic Japanese to English translation for messages posted in a translation channel using Google Cloud Translation API.

## Current State Analysis
- Bot has existing OpenAI integration for AI features
- Bot listens to message events and reactions
- Environment variables are already configured via .env
- GOOGLE_API_KEY is available in environment

## Implementation Plan
1. Install @google-cloud/translate npm package
2. Create GoogleTranslationService in src/services/
3. Add Japanese language detection utility
4. Modify main message event handler to detect translation channel messages
5. Integrate automatic translation for Japanese messages
6. Add error handling and logging

## Files to Modify
- `package.json` - Add @google-cloud/translate dependency
- `src/services/googleTranslation.ts` - New service for Google Translation API
- `src/index.ts` - Add message event handler for translation channel
- `.env.example` - Document GOOGLE_API_KEY requirement (already exists)

## Implementation Details
- Use Google Cloud Translation API v2 with API key authentication
- Detect Japanese text using language detection
- Translate Japanese messages to English automatically
- Post translation as bot reply in same channel
- Handle rate limits and API errors gracefully

## Testing Approach
- Unit tests for GoogleTranslationService
- Manual testing in Discord translation channel
- Test Japanese text detection accuracy
- Test translation quality and error handling

## Potential Risks
- API rate limits and costs
- False positive language detection
- Network errors and API failures
- Message spam if translation fails repeatedly