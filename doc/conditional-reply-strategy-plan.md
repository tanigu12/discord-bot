# Conditional Reply Strategy Implementation Plan

## Overview
Implement dynamic reply strategy that sends content as direct message (≤1500 characters) or as file attachment (>1500 characters). This improves user experience by avoiding unnecessary file downloads for short content while preserving file attachments for longer content.

## Current State Analysis

### Files Currently Using File Attachments:
1. **src/features/analysisService.ts**:
   - `sendAsFileAttachment()` - Search command results (always file)
   - `sendAsFileAttachmentReply()` - Larry consult results (always file) 
   - `sendAsMessageReply()` - Larry consult results (always message)

2. **src/features/translation/translationFormatter.ts**:
   - `createFeedbackResponse()` - Larry's diary feedback (always file)

3. **src/features/commands/format.ts**:
   - Thread formatting results (always file)

### Current Reply Patterns:
- **Always File**: Search analysis, thread formatting
- **Always Message**: Simple Larry replies  
- **Always File**: Larry diary feedback, Larry consult with file option

## Requirements Analysis

### Character Limit Decision Logic:
- **≤1500 characters**: Send as direct Discord message
- **>1500 characters**: Send as file attachment
- **Threshold**: Configurable constant (default: 1500)

### Content Types to Apply Logic:
1. **Larry Consult Replies** (`AnalysisService.sendAsFileAttachmentReply`)
2. **Larry Diary Feedback** (`TranslationFormatter.createFeedbackResponse`)
3. **Potentially**: Search command results (but likely always >1500)

### Content Types to Keep As-Is:
1. **Thread formatting** - Always file (structured markdown)
2. **Search command** - Always file (structured analysis)

## Implementation Plan

### Step 1: Create ReplyStrategyService
Create `src/services/replyStrategyService.ts` with:
- Character limit constants and configuration
- Content length evaluation logic  
- Conditional reply methods for both Interaction and Message contexts
- Integration with AttachmentService for file attachments

### Step 2: Define Reply Strategy Interface
```typescript
interface ReplyOptions {
  content: string;
  filename?: string;
  embedOptions?: EmbedOptions;
}

interface ReplyResult {
  strategy: 'message' | 'attachment';
  characterCount: number;
  sent: boolean;
}
```

### Step 3: Refactor AnalysisService
- Update `sendAsFileAttachmentReply()` to use conditional logic
- Keep `sendAsFileAttachment()` for search commands (always file)
- Keep `sendAsMessageReply()` for simple messages

### Step 4: Refactor TranslationFormatter
- Update `createFeedbackResponse()` to use conditional logic
- Handle both embedded message replies and file attachment replies

### Step 5: Add Configuration
- Add character limit constants to configuration
- Make threshold configurable via environment variable

## Files to Modify

### New Files:
- `src/services/replyStrategyService.ts` - **NEW**: Conditional reply logic
- `src/services/__tests__/replyStrategyService.test.ts` - **NEW**: Unit tests

### Modified Files:
- `src/features/analysisService.ts` - Update Larry consult file replies
- `src/features/translation/translationFormatter.ts` - Update diary feedback replies
- `src/constants/index.ts` - Add character limit constants (if not exists)

## ReplyStrategyService Interface Design

```typescript
export class ReplyStrategyService {
  // Character limit constants
  static readonly DEFAULT_CHARACTER_LIMIT = 1500;
  static readonly CHARACTER_LIMIT = parseInt(process.env.REPLY_CHARACTER_LIMIT || '1500');
  
  // Evaluate content length and determine strategy
  static shouldUseAttachment(content: string): boolean;
  
  // Send conditional reply for Message context (Larry consult)
  static async sendConditionalReply(
    message: Message,
    options: ReplyOptions
  ): Promise<ReplyResult>;
  
  // Send conditional reply for Interaction context (commands)
  static async sendConditionalInteractionReply(
    interaction: ChatInputCommandInteraction,
    options: ReplyOptions
  ): Promise<ReplyResult>;
  
  // Send conditional reply with embedded content
  static async sendConditionalEmbedReply(
    message: Message,
    embed: EmbedBuilder,
    content: string,
    filename?: string
  ): Promise<ReplyResult>;
}
```

## Implementation Details

### Content Length Calculation:
- Use content string length directly
- Include embed content in calculation for embedded replies
- Consider Discord's message limits (2000 characters max per message)

### Error Handling:
- Fallback to file attachment if message sending fails due to length
- Preserve existing error handling patterns
- Log strategy decisions for debugging

### Backwards Compatibility:
- Keep existing method signatures where possible
- Add new conditional methods alongside existing ones
- Gradual migration approach

## Testing Approach

### Unit Tests for ReplyStrategyService:
- Test character limit evaluation
- Test strategy decision logic
- Test both message and attachment sending
- Test error handling and fallbacks
- Test edge cases (exactly 1500 characters, empty content)

### Integration Tests:
- Test AnalysisService with short/long content
- Test TranslationFormatter with short/long diary feedback
- Manual testing with actual Discord messages

### Test Data:
- Short content (500 characters)
- Medium content (exactly 1500 characters) 
- Long content (2000+ characters)
- Very long content (5000+ characters)

## Benefits

### User Experience:
- **Faster reading**: Short content appears directly in chat
- **Reduced friction**: No unnecessary file downloads
- **Better mobile experience**: Direct messages easier to read on mobile
- **Context preservation**: Short replies stay in conversation flow

### Performance:
- **Reduced server load**: Fewer temporary file operations
- **Faster responses**: Direct messages send faster than file uploads
- **Less storage**: Fewer temporary files created and cleaned up

## Potential Risks

### Discord Limitations:
- **2000 character limit**: Must ensure content under 1500 fits in Discord messages
- **Embed limits**: Consider embed character limits in total calculation
- **Rate limiting**: File uploads and messages have different rate limits

### Content Formatting:
- **Loss of structure**: Long formatted content better as file
- **Line breaking**: May need content formatting for direct messages
- **Markdown support**: Discord has limited markdown support vs files

### User Expectations:
- **Consistency**: Users might expect consistent reply format
- **File preservation**: Some users prefer files for record-keeping

## Mitigation Strategies

### Content Formatting:
- Apply line breaking for direct messages using existing utilities
- Preserve essential formatting (bold, italic) in direct messages
- Include fallback message explaining content was sent directly

### User Communication:
- Add subtle indicators about reply strategy in responses
- Provide option to request file format explicitly
- Document new behavior in user guides

### Monitoring:
- Log strategy decisions for analytics
- Track user engagement with different reply types
- Monitor for formatting issues or complaints