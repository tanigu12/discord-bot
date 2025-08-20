# Memory Icon Implementation Plan

## Overview
This plan outlines the implementation of a memory icon reaction feature that automatically sends diary knowledge to the Obsidian Git Sync repository on GitHub. When users react with a memory emoji (🧠) to Larry's diary feedback messages (which contain message.txt attachments), the bot will extract the Japanese target sentence and existing three-level English translations, format them according to the vocabulary template structure, and commit to the repository.

## Example Content from Larry's Feedback
Based on the Discord screenshot, Larry's message.txt contains:
- **Japanese Target Sentence**: イシューとは、イシューであると気づけるかが、最大のイシューなんです
- **Three-Level Translations**:
  - 🟢 BEGINNER LEVEL: [Extracted from message.txt]
  - 🟡 INTERMEDIATE LEVEL: [Extracted from message.txt]  
  - 🔴 UPPER LEVEL: [Extracted from message.txt]

## Architecture Components

### 1. Memory Reaction Handler (`src/features/memory/memoryHandler.ts`)
- **Purpose**: Handle memory emoji reactions on diary messages
- **Triggers**: React with 🧠 emoji on diary thread messages
- **Dependencies**: DiaryService, GitHubService, MemoryFormatter

```typescript
export class MemoryHandler {
  async handleMemoryReaction(reaction: MessageReaction, user: User): Promise<void>
  private extractDiaryContent(message: Message): string | null
  private validateMemoryEligibility(content: string): boolean
}
```

### 2. GitHub Service (`src/services/githubService.ts`)
- **Purpose**: Interface with GitHub API for repository operations
- **Repository**: https://github.com/tanigu12/obisidian-git-sync
- **Target Path**: `notes/10_Vocabulary/`
- **Authentication**: GitHub Personal Access Token (GITHUB_PAT)

```typescript
export class GitHubService {
  async createVocabularyFile(filename: string, content: string): Promise<void>
  async commitToRepository(filePath: string, content: string, message: string): Promise<void>
  private generateUniqueFilename(targetSentence: string): string
}
```

### 3. Memory Formatter (`src/features/memory/memoryFormatter.ts`)
- **Purpose**: Format diary content according to Obsidian vocabulary template
- **Template Structure**: Extract Japanese sentence and existing translations from message.txt
- **Data Source**: Larry's existing three-level translations from diary processing

```typescript
export class MemoryFormatter {
  async formatForObsidian(messageContent: string): Promise<string>
  private extractTranslationsFromMessage(content: string): TranslationSet
  private extractTargetSentence(content: string): string
  private extractKeyWords(sentence: string): string[]
}
```

## Vocabulary Template Structure

Based on the retrieved template from the repository:

```markdown
### [Key Concept/Word]

この文章を英語に翻訳してください。
?
1. **Formal/Academic:** [Formal English translation]
2. **Natural/Conversational:** [Natural English translation]  
3. **Alternative expression:** [Alternative way to express the same idea]

#flashcards/vocab/ja-to-en #vocabulary
```

## Implementation Flow

### 1. Reaction Detection
```typescript
// In main bot event handler
client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.emoji.name === '🧠' && !user.bot) {
    // Check if message has message.txt attachment from Larry's feedback
    if (memoryHandler.isValidMemoryReaction(reaction)) {
      await memoryHandler.handleMemoryReaction(reaction, user);
    }
  }
});
```

### 2. Content Processing Pipeline
1. **Extract Content**: Get message.txt file attachment from reacted message
2. **Parse Content**: Extract Japanese target sentence and three-level translations from Larry's feedback
3. **Validate**: Ensure content is Japanese and suitable for vocabulary learning
4. **Format**: Convert existing translations to Obsidian-compatible markdown template
5. **Commit**: Create file in GitHub repository with appropriate naming

### 3. File Naming Convention
```typescript
// Format: vocabulary-YYYYMMDD-HHMMSS-[first-few-words].md
const filename = `vocabulary-${timestamp}-${sanitizedWords}.md`;
```

## Integration with Existing Systems

### DiaryService Integration
- Reuse existing `parseDiaryEntry()` method to extract target sentences
- Leverage language detection capabilities
- Utilize established AI service connections

### Message Content Parser
Extract translations from Larry's existing three-level output:

```typescript
interface ExtractedTranslations {
  targetSentence: string;
  beginner: string;
  intermediate: string;
  upper: string;
}

async parseMessageAttachment(filePath: string): Promise<ExtractedTranslations>
```

### Reaction System Extension
Extend existing emoji reaction handler to include memory functionality alongside current translation/study reactions.

## Environment Configuration

### Required Environment Variables
```bash
GITHUB_PAT=<GitHub Personal Access Token>
OBSIDIAN_REPO_OWNER=tanigu12
OBSIDIAN_REPO_NAME=obisidian-git-sync
OBSIDIAN_VOCAB_PATH=notes/10_Vocabulary/
```

### GitHub Token Permissions
- Repository access (read/write)
- Contents permission for file creation/modification
- Metadata read access

## Error Handling Strategy

### Validation Checks
1. **Content Validation**: Ensure target sentence contains Japanese characters
2. **Length Limits**: Restrict sentences to reasonable vocabulary learning length
3. **Duplicate Prevention**: Check for existing similar vocabulary entries
4. **Rate Limiting**: Implement cooldown to prevent spam

### Fallback Mechanisms
1. **GitHub API Failures**: Queue entries locally and retry
2. **Message Parse Failures**: Log errors and notify user of invalid format
3. **Network Issues**: Graceful degradation with user notification

## Testing Strategy

### Unit Tests
- Memory reaction detection and validation
- Content formatting according to template structure  
- GitHub API integration mocking
- Translation generation testing

### Integration Tests
- End-to-end reaction-to-commit workflow
- Repository file creation verification
- Template compliance validation

## Security Considerations

### Token Management
- Secure storage of GitHub PAT in environment variables
- Token rotation strategy and expiration monitoring
- Scope limitation to minimum required permissions

### Content Validation
- Sanitize file names and content to prevent injection
- Validate repository paths to prevent directory traversal
- Rate limiting to prevent abuse

## Success Metrics

### Functionality Metrics
- Successful vocabulary file creation rate
- Translation quality consistency
- Repository commit success rate
- User adoption and reaction frequency

### Performance Metrics
- Response time from reaction to commit
- API call efficiency
- Error rate and recovery time

## Future Enhancements

### Advanced Features
1. **Smart Deduplication**: AI-powered detection of similar vocabulary entries
2. **Progress Tracking**: User statistics on vocabulary collection
3. **Batch Processing**: Multiple sentence processing in single commit
4. **Spaced Repetition Integration**: Anki/SRS export capabilities

### User Experience
1. **Confirmation Messages**: Discord notifications on successful commits
2. **Preview Mode**: Show formatted content before committing
3. **Customization**: User-specific formatting preferences
4. **Analytics**: Personal vocabulary learning insights

## Implementation Timeline

### Phase 1: Core Implementation (Week 1)
- Memory reaction handler setup
- Basic GitHub service integration
- Simple template formatting

### Phase 2: Content Extraction (Week 2)  
- Parse message.txt file attachments from Larry's feedback
- Extract Japanese target sentence and three-level translations
- Content validation and formatting optimization

### Phase 3: Enhancement & Testing (Week 3)
- Comprehensive error handling
- Security hardening
- Unit and integration testing

### Phase 4: Deployment & Monitoring (Week 4)
- Production deployment
- Performance monitoring
- User feedback collection and iteration

This implementation will seamlessly integrate with the existing diary system, providing users with an effortless way to build their personal Obsidian vocabulary repository through simple emoji reactions.