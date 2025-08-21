# Attachment Service Refactor Plan

## Overview
Refactor duplicated file attachment logic across the codebase into a centralized attachment service. Multiple files currently implement similar patterns for creating Discord AttachmentBuilder instances with file content.

## Current State Analysis
### Files Using AttachmentBuilder Pattern:
1. **src/features/analysisService.ts** (lines 198-201, 245-248)
   - Creates text file attachments for search analysis results
   - Uses `TextAggregator.generateFileName()` and `TextAggregator.aggregateSearchResults()`
   - Pattern: `Buffer.from(content, 'utf8')` → `AttachmentBuilder`

2. **src/features/translation/translationFormatter.ts** (lines 40, 283-284)
   - Creates temporary file attachments for Larry's diary feedback
   - Uses filesystem operations (writeFileSync/unlinkSync) with temp files
   - Pattern: File path → `AttachmentBuilder` → cleanup

3. **src/features/commands/format.ts** (lines 62-64)
   - Creates markdown file attachments for formatted thread content
   - Uses dynamic filename generation with sanitization
   - Pattern: `Buffer.from(content, 'utf8')` → `AttachmentBuilder`

### Common Patterns Identified:
1. **Buffer-based attachments**: Direct content → Buffer → AttachmentBuilder
2. **File-based attachments**: Content → temp file → AttachmentBuilder → cleanup
3. **Filename generation**: Query/title sanitization and timestamp addition
4. **Content aggregation**: Structured text formatting with separators/headers

## Implementation Plan

### Step 1: Create AttachmentService
- Create `src/services/attachmentService.ts`
- Implement methods for both buffer-based and file-based attachment creation
- Include filename sanitization utilities
- Add proper error handling and cleanup

### Step 2: Refactor AnalysisService
- Replace duplicate attachment creation logic in:
  - `sendAsFileAttachment()` method (lines 198-201)
  - `sendAsFileAttachmentReply()` method (lines 245-248)
- Use new AttachmentService methods

### Step 3: Refactor TranslationFormatter  
- Replace file-based attachment logic in:
  - `createFeedbackResponse()` method (lines 36-50)
  - Private methods `createMessageFile()` and `cleanupFile()`
- Migrate to AttachmentService with automatic cleanup

### Step 4: Refactor Format Command
- Replace attachment creation in `execute()` method (lines 62-64)
- Use AttachmentService for consistent filename handling

## Files to Modify
- `src/services/attachmentService.ts` - **NEW**: Centralized attachment service
- `src/features/analysisService.ts` - Update attachment creation methods
- `src/features/translation/translationFormatter.ts` - Replace file operations with service
- `src/features/commands/format.ts` - Update attachment creation

## AttachmentService Interface Design
```typescript
export class AttachmentService {
  // Create attachment from text content
  static createTextAttachment(content: string, filename: string): AttachmentBuilder

  // Create attachment from formatted content with auto-generated filename
  static createFormattedAttachment(content: string, baseFilename: string, extension: string): AttachmentBuilder
  
  // Create temporary file attachment with automatic cleanup
  static async createTempFileAttachment(content: string, filename: string): Promise<{
    attachment: AttachmentBuilder;
    cleanup: () => void;
  }>
  
  // Sanitize filename for safe file operations
  static sanitizeFilename(filename: string, maxLength?: number): string
  
  // Generate timestamped filename
  static generateTimestampedFilename(base: string, extension: string): string
}
```

## Testing Approach
- Write unit tests for AttachmentService methods
- Test filename sanitization edge cases
- Test buffer vs file-based attachment creation
- Test cleanup functionality for temporary files
- Manual testing of each refactored feature to ensure functionality preservation

## Potential Risks
- **Breaking changes**: Ensure all attachment creation maintains exact same behavior
- **File cleanup**: Temporary file cleanup must be handled properly to prevent file system clutter
- **Discord limits**: Maintain filename and content size restrictions
- **Error handling**: Preserve existing error handling patterns while centralizing logic
- **Dependencies**: Ensure proper import paths and service instantiation

## Benefits
- **DRY principle**: Eliminate code duplication across 3+ files
- **Maintainability**: Single place to update attachment logic
- **Consistency**: Standardized filename sanitization and content handling
- **Testability**: Centralized logic easier to unit test
- **Error handling**: Consistent error handling across all attachment operations