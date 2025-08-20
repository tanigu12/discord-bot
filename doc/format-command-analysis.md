# Format Command Implementation Analysis

## Overview
The `/format` command converts Discord thread conversations into structured, bilingual (English/Japanese) Obsidian-ready blog posts. This document provides a detailed analysis of the implementation, focusing on the AI prompt creation process.

## Key Files and Functions

### Main Command File
**File:** `src/features/commands/format.ts`
**Function:** `formatCommand.execute()`

The main command entry point that:
- Validates the command is used in a thread (lines 26-31)
- Extracts command options (`include_all`, `title`) (lines 34-35)
- Reads thread messages via `ConversationReaderService` (line 42)
- Formats content using `ContentAnalysisService` (line 57)
- Creates and returns a downloadable markdown file (lines 60-84)

### Thread Data Collection
**File:** `src/services/conversationReaderService.ts`
**Function:** `ConversationReaderService.readThreadMessages()`

Responsible for gathering and processing thread data:
- Fetches messages from Discord thread (lines 42-50)
- Filters messages based on `includeAllMessages` parameter (lines 56-58)
- Processes messages into structured `ThreadMessage` objects (lines 78-91)
- Returns comprehensive `ThreadData` with metadata (lines 93-106)

### AI Content Formatting
**File:** `src/features/search/contentAnalysisService.ts`
**Function:** `ContentAnalysisService.formatToObsidianBlog()`

The core AI processing function that transforms thread data into blog format.

## AI Prompt Creation Process

### 1. System Prompt Construction (lines 147-195)

The system prompt is meticulously crafted with specific formatting instructions:

```typescript
const systemPrompt = `You are an expert content organizer specializing in creating bilingual technical blog posts from Discord thread discussions.

Create a structured blog post with BOTH English and Japanese following this EXACT format:

1. Clean title (no quotes, technical but readable)
2. Brief definition/introduction (1-2 sentences in English, followed by Japanese translation)
3. Referenced links in brackets [URL] if any mentioned
4. Main content organized with clear hierarchy:
   - Use simple headers for main topics (English first, then Japanese)
   - Use indented bullet points (spaces) for sub-points
   - Each English section followed by Japanese translation
   - Keep explanations concise and technical
   - Focus on facts, features, and key differences
5. No frontmatter, no conclusion section, no "Key Takeaways"
6. BILINGUAL FORMAT: English content followed by Japanese translation for each section

Style Guidelines:
- Present content in both English and Japanese
- Technical but accessible language in both languages  
- Bullet points over paragraphs
- Minimal fluff, maximum information density
- Include version numbers, protocol names, technical details
- Remove personal opinions and conversational elements
- Focus on the technical substance
- Provide accurate translations of technical terms
- IGNORE administrative messages like "💡 Idea Management - Emoji Guide" as these are unrelated to blog content`;
```

### 2. User Message Preparation (lines 197-206)

The user message combines thread metadata with processed content:

```typescript
const userMessage = `Please format this Discord thread discussion into a structured blog post:

**Thread Info:**
- Title: ${threadData.threadName}
- Participants: ${threadData.participants.join(', ')}
- Messages: ${threadData.totalMessages}
- Date: ${threadData.createdAt}

**Thread Content:**
${messagesContent}`;
```

### 3. Message Content Processing (lines 141-145)

Thread messages are formatted for AI consumption:

```typescript
const messagesContent = threadData.messages
  .map(
    msg => `**${msg.author}** (${msg.timestamp.toISOString().split('T')[0]}):\n${msg.content}`
  )
  .join('\n\n---\n\n');
```

Each message includes:
- Author name in bold
- ISO date format
- Message content
- Separator lines between messages

### 4. AI Service Call (lines 208-211)

The formatted prompts are sent to OpenAI via the base AI service:

```typescript
const formattedMarkdown = await this.callOpenAI(systemPrompt, userMessage, {
  model: OPENAI_MODELS.MAIN,
  maxCompletionTokens: 4000,
});
```

**Parameters:**
- **Model:** Uses `OPENAI_MODELS.MAIN` (typically GPT-4o-mini)
- **Max Tokens:** 4000 completion tokens for comprehensive output
- **Temperature:** Default (1.0) for balanced creativity/consistency

## Base AI Service Integration

### AI Service Layer
**File:** `src/services/baseAIService.ts`
**Function:** `BaseAIService.callOpenAI()`

The base service handles:
- OpenAI client initialization with lazy loading (lines 15-25)
- Request configuration with system/user message structure (lines 56-70)
- Error handling and response processing (lines 77-84)
- Debug logging of prompts and options (lines 51-53)

### Request Structure
```typescript
const requestConfig = {
  model: options.model || OPENAI_MODELS.MAIN,
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ],
  max_completion_tokens: options.maxCompletionTokens || 1000,
};
```

## Output Processing

### Metadata Extraction (lines 214-220)
The service extracts metadata from the AI-generated content:
- **Title:** Regex pattern matching for title fields
- **Sections:** Counts markdown headers (#{1,3})
- **Word Count:** Simple whitespace-based word counting

### Response Structure (lines 222-227)
```typescript
return {
  markdown: formattedMarkdown,
  title,
  sections,
  wordCount,
};
```

### Fallback Mechanism (lines 229-232)
If AI formatting fails, the service provides a structured fallback format via `createFallbackFormat()` (lines 259-290).

## Key Design Decisions

### 1. Bilingual Output Focus
The prompt specifically requests both English and Japanese translations, making the bot suitable for international technical discussions.

### 2. Technical Documentation Style
- Emphasis on bullet points over paragraphs
- Inclusion of technical details (versions, protocols)
- Removal of conversational elements
- Structured hierarchy with clear headers

### 3. Obsidian Compatibility
The output format is specifically designed for Obsidian note-taking software:
- Clean markdown formatting
- No frontmatter metadata
- Hierarchical structure with indented bullet points

### 4. Message Filtering Intelligence
The `ConversationReaderService` includes sophisticated message filtering:
- Reply-based relationship detection
- Substantial content filtering (>10 characters)
- Attachment inclusion
- Mention-based conversation tracking
- Context preservation (first/last messages)

### 5. Error Handling and User Experience
- Graceful fallbacks if AI processing fails
- Comprehensive error messages with troubleshooting hints
- Rich response with statistics and metadata
- File attachment with timestamped naming

## Token Optimization

The implementation optimizes for token efficiency:
- **Message Limit:** Fetches last 100 messages maximum
- **Content Filtering:** Reduces noise with intelligent message selection
- **Prompt Design:** Concise but comprehensive instructions
- **Token Budget:** 4000 completion tokens for detailed output

## Integration Points

### Command Registration
The command is registered in:
- `src/features/commands/index.ts` - Command collection
- `src/deploy-commands.ts` - Discord API registration
- `src/index.ts` - Bot client command handling

### Dependencies
- **Discord.js:** Thread and message handling
- **OpenAI API:** AI content processing
- **Base AI Service:** Shared AI functionality
- **Conversation Reader:** Thread data extraction
- **Content Analysis:** AI prompt management

This implementation demonstrates a sophisticated approach to AI-powered content transformation, balancing automation with user control and providing robust error handling throughout the process.