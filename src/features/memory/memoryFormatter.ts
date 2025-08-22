export class MemoryFormatter {
  /**
   * Format diary content for Obsidian vocabulary template
   */
  async formatForObsidian(messageContent: string): Promise<string> {
    const { targetSentence, translationSection } = this.extractContent(messageContent);

    // Replace double line breaks with single line breaks in translation section for compactness
    const compactTranslationSection = translationSection 
      ? translationSection.replace(/\n\n/g, '\n')
      : '見つかりませんでした';

    return `${targetSentence}
?
${compactTranslationSection}

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
   * Generate filename for vocabulary entry
   */
  generateVocabularyFilename(): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').substring(0, 19); // YYYY-MM-DDTHH-mm-ss format

    return `vocabulary-${timestamp}.md`;
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
