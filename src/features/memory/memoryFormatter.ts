export class MemoryFormatter {
  /**
   * Format diary content for Obsidian vocabulary template
   */
  async formatForObsidian(messageContent: string): Promise<string> {
    const { targetSentence, translationSection } = this.extractContent(messageContent);

    return `${targetSentence}
?
${translationSection || '見つかりませんでした'}

#flashcards/vocab/ja-to-en #vocabulary`;
  }

  /**
   * Extract target sentence and translation section from content
   */
  extractContent(content: string) {
    // Find target sentence
    const targetMatch = content.match(/TARGET SENTENCE:\s*\n(.+)/);
    const targetSentence = targetMatch?.[1]?.trim() || content.trim();

    // Extract translation section between markers
    const startMarker = '📚 THREE LEVEL ENGLISH TRANSLATIONS:';
    const endMarker = '═══════════════════════════════════════════════════════';

    const startIndex = content.indexOf(startMarker);
    const endIndex =
      startIndex !== -1 ? content.indexOf(endMarker, startIndex + startMarker.length) : -1;

    const translationSection =
      startIndex !== -1 && endIndex !== -1
        ? content.substring(startIndex + startMarker.length, endIndex).trim()
        : '';

    return { targetSentence, translationSection };
  }

  /**
   * Extract key words from Japanese sentence for vocabulary learning
   */
  private extractKeyWords(sentence: string): string[] {
    // Simple key word extraction - split by common Japanese separators
    const words = sentence
      .replace(/[。、！？]/g, ' ') // Replace punctuation with spaces
      .split(/[\s　]+/) // Split by spaces (both regular and full-width)
      .filter(word => word.length > 0)
      .filter(word => word.length > 1) // Filter out single characters
      .slice(0, 5); // Take first 5 words

    return words;
  }

  /**
   * Read and parse message.txt file from file path
   */
  async parseMessageFile(
    filePath: string
  ): Promise<{ targetSentence: string; translationSection: string }> {
    try {
      const { readFileSync } = await import('fs');
      const content = readFileSync(filePath, 'utf-8');
      return this.extractContent(content);
    } catch (error) {
      console.error('Error reading message file:', error);
      throw new Error(`Failed to read message file: ${error}`);
    }
  }

  /**
   * Generate filename for vocabulary entry
   */
  generateVocabularyFilename(targetSentence: string): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').substring(0, 19); // YYYY-MM-DDTHH-mm-ss format

    // Extract first few words for filename
    const words = this.extractKeyWords(targetSentence).slice(0, 2);
    const sanitizedWords = words
      .join('-')
      .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF-]/g, '') // Keep Japanese chars and alphanumeric
      .substring(0, 20); // Limit length

    return `vocabulary-${timestamp}-${sanitizedWords}.md`;
  }

  /**
   * Validate if content is suitable for vocabulary learning
   */
  validateMemoryContent(content: string): boolean {
    // Check if content contains the new format markers
    const hasTranslationSection = content.includes('📚 THREE LEVEL ENGLISH TRANSLATIONS:');
    const hasSeparator = content.includes(
      '═══════════════════════════════════════════════════════'
    );

    return hasTranslationSection && hasSeparator;
  }
}
