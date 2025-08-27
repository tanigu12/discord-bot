# Search Command Specification

## Overview

The `/search` command is a powerful AI-powered content analysis tool that can process various types of input including text, URLs, and YouTube videos. It provides comprehensive analysis with context awareness and educational explanations optimized for language learners.

## Command Structure

```
/search <query>
```

- **Command Name**: `search`
- **Description**: Analyze and explain specified content or URL with AI
- **Required Parameter**: `query` - Text content, topic, or URL to analyze and explain

## Core Features

### 1. Multi-Type Content Processing

The command intelligently detects and processes different types of input:

#### Text Analysis
- Direct text content analysis
- Educational explanations with clear structure
- Concept extraction and simplification
- Learning-focused formatting

#### Web URL Processing  
- Automatic content fetching from web pages
- Title and source information extraction
- Comprehensive content analysis
- Fallback handling for fetch failures

#### YouTube Video Analysis
- **NEW**: Automatic caption extraction from YouTube videos
- Multi-language caption support (English, Japanese)
- Caption content analysis and explanation
- Video source information display

### 2. Context-Aware Analysis

- Collects last 30 messages from the channel for context
- Provides participant information and conversation timespan
- Enhances AI analysis with conversational context
- Falls back gracefully if context collection fails

### 3. AI-Powered Content Analysis

- Uses OpenAI GPT models for intelligent analysis
- Structured educational responses with:
  - **Overview**: Brief summary
  - **Key Points**: Main ideas and concepts  
  - **Detailed Explanation**: In-depth analysis
  - **Practical Applications**: Real-world relevance
  - **Learning Notes**: Important terms and concepts

## Technical Architecture

### Service Dependencies

1. **ContentAnalysisService**: AI analysis and explanation generation
2. **ContentFetcherService**: Web content fetching and processing  
3. **ContextCollectorService**: Channel conversation context collection
4. **YoutubeCaptionService**: YouTube video caption extraction

### Processing Flow

```
Input Query → Content Type Detection → Content Processing → Context Collection → AI Analysis → Response Formatting → Output
```

#### Content Processing Methods

- `processContent()`: Main content processing orchestrator
- `processYouTubeContent()`: YouTube-specific caption extraction
- `processWebContent()`: Web page content fetching
- `collectContext()`: Channel context gathering
- `generateAnalysis()`: AI analysis generation
- `sendResponse()`: Response formatting and delivery

## Usage Examples

### Text Analysis
```
/search Machine learning algorithms and their applications
```
**Output**: Educational analysis of ML concepts with examples and applications

### Web URL Analysis  
```
/search https://example.com/article-about-technology
```
**Output**: Comprehensive analysis of the article with key points and explanations

### YouTube Video Analysis
```
/search https://www.youtube.com/watch?v=VIDEO_ID
```
**Output**: Analysis based on video captions with multilingual support

## Response Format

### Standard Response Structure
```
✅ **Analysis complete!** [Context Status]
💬 Direct response for: `[Truncated Query]`

[AI Analysis Content]

**Source:** [URL if applicable]  
**Title/Type:** [Content source information]
**Languages:** [For YouTube videos]

**Context:** [Channel context information if available]
```

### Context Status Indicators
- `📖 Context-aware analysis using X recent messages` - When context is available
- `🔍 Standard analysis` - When context collection fails

## Error Handling

### Error Categories and Messages

#### Timeout Errors
- **Trigger**: Website response timeout, connection timeout
- **Message**: "Timeout Error: The website took too long to respond"
- **Suggestion**: "Try again later or use a different URL"

#### Access Denied  
- **Trigger**: 403 HTTP status, access denied responses
- **Message**: "Access Denied: The website blocks automated requests"  
- **Suggestion**: "This website cannot be analyzed automatically"

#### Page Not Found
- **Trigger**: 404 HTTP status, not found errors
- **Message**: "Page Not Found: The URL may be incorrect"
- **Suggestion**: "Please check the URL and try again"

#### Configuration Errors
- **Trigger**: Missing API keys, service configuration issues
- **Message**: "Configuration Error: AI service is not properly configured"
- **Suggestion**: "Please contact the bot administrator"

#### Discord Permission Errors  
- **Trigger**: Thread creation failures, permission issues
- **Message**: "Discord Error: Cannot create thread in this channel"
- **Suggestion**: "Make sure the bot has proper permissions"

#### Generic Errors
- **Trigger**: Unknown or unhandled errors
- **Message**: "Error Details: [Specific error message]"
- **Suggestion**: "Please try again or contact support if the issue persists"

## YouTube Caption Feature

### Supported Platforms
- `youtube.com`
- `www.youtube.com` 
- `youtu.be`
- `m.youtube.com`

### Caption Languages
- English (`en`)
- Japanese (`ja`)
- Automatic language detection and extraction

### Caption Processing
1. Video URL validation
2. Caption server API call via Railway internal network
3. Multi-language caption formatting
4. Error handling for unavailable captions

### Caption Response Format
```
**EN Captions:**
[English caption text]

**JA Captions:**  
[Japanese caption text]

**Source:** [YouTube URL]
**Type:** YouTube Video Captions
**Languages:** en, ja
```

## Message Handling

### Long Message Support
- Automatic message splitting for Discord's 2000 character limit
- Line-aware splitting to maintain formatting
- Sequential message delivery with rate limit protection
- 500ms delay between follow-up messages

### Response Delivery
1. First chunk sent as `editReply()`
2. Additional chunks sent as `followUp()` messages  
3. Graceful handling of oversized content
4. Preserved formatting across splits

## Performance Considerations

### Timeouts
- YouTube caption fetch: 30 seconds
- Web content fetch: Configurable per ContentFetcherService
- Context collection: Configurable per ContextCollectorService

### Network Optimization
- Railway internal network preferred for YouTube caption server
- Fallback to external URLs for development
- Connection pooling and retry mechanisms

### Rate Limiting
- Built-in delays between follow-up messages
- Graceful degradation on service failures
- Context collection fallback mechanisms

## Configuration

### Environment Variables
- `OPENAI_API_KEY`: Required for AI analysis
- `NODE_ENV`: Determines caption server endpoint selection

### Service Endpoints
- **Production**: `http://youtube-caption-server.railway.internal`
- **Development**: `https://youtube-caption-server-production.up.railway.app`

## Future Enhancements

### Potential Improvements
1. Additional video platforms (Vimeo, Dailymotion)
2. Document processing (PDF, DOCX)
3. Image analysis capabilities  
4. Audio transcription support
5. Enhanced context analysis with sentiment detection
6. Custom analysis templates per channel/user preferences

### Scalability Considerations
- Caching layer for frequently analyzed content
- Distributed processing for large content
- User preference storage and customization
- Analytics and usage tracking

## Troubleshooting

### Common Issues

1. **Captions Unavailable**
   - Video may not have captions enabled
   - Caption language may not be supported
   - Video may be private or restricted

2. **Context Collection Failures**
   - Bot may lack message history permissions
   - Channel may have message retrieval restrictions
   - Network connectivity issues

3. **AI Analysis Failures**  
   - API key configuration issues
   - OpenAI service availability
   - Content size limitations
   - Rate limit exceeded

### Debug Information
All errors include detailed logging with:
- Error message and stack trace
- Query content (first 100 characters)
- Timestamp and user information
- Service-specific error details