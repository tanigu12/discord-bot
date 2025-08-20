import { readFileSync } from 'fs';

export interface ExtractedTranslations {
  targetSentence: string;
  beginner: string;
  intermediate: string;
  upper: string;
  keyWords: string[];
}

export class MemoryFormatter {
  /**
   * Format diary content from Larry's message.txt for Obsidian vocabulary template
   */
  async formatForObsidian(messageContent: string): Promise<string> {
    const extracted = this.extractTranslationsFromMessage(messageContent);
    
    // Generate key concept from target sentence (first few meaningful words)
    const keyConcept = this.extractKeyWords(extracted.targetSentence).slice(0, 3).join('・');
    
    // Format according to Obsidian vocabulary template
    const formatted = `### ${keyConcept}

${extracted.targetSentence}
?
1. **Formal/Academic:** ${extracted.upper}
2. **Natural/Conversational:** ${extracted.intermediate}  
3. **Alternative expression:** ${extracted.beginner}

#flashcards/vocab/ja-to-en #vocabulary`;

    return formatted;
  }

  /**
   * Extract translations from Larry's formatted message content
   */
  extractTranslationsFromMessage(content: string): ExtractedTranslations {
    const lines = content.split('\n');
    let targetSentence = '';
    let beginner = '';
    let intermediate = '';
    let upper = '';

    // Find target sentence (after "TARGET SENTENCE:" header)
    const targetIndex = lines.findIndex(line => line.includes('TARGET SENTENCE:'));
    if (targetIndex !== -1 && targetIndex + 1 < lines.length) {
      targetSentence = lines[targetIndex + 1].trim();
    }

    // Find three-level translations
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('🟢 BEGINNER LEVEL:')) {
        // Get next non-empty line
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].trim() && !lines[j].includes('🟡') && !lines[j].includes('🔴')) {
            beginner = lines[j].trim();
            break;
          }
        }
      }
      
      if (line.includes('🟡 INTERMEDIATE LEVEL:')) {
        // Get next non-empty line
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].trim() && !lines[j].includes('🟢') && !lines[j].includes('🔴')) {
            intermediate = lines[j].trim();
            break;
          }
        }
      }
      
      if (line.includes('🔴 UPPER LEVEL:')) {
        // Get next non-empty line
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].trim() && !lines[j].includes('🟢') && !lines[j].includes('🟡')) {
            upper = lines[j].trim();
            break;
          }
        }
      }
    }

    const keyWords = this.extractKeyWords(targetSentence);

    return {
      targetSentence,
      beginner,
      intermediate,
      upper,
      keyWords
    };
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
  async parseMessageFile(filePath: string): Promise<ExtractedTranslations> {
    try {
      const content = readFileSync(filePath, 'utf-8');
      return this.extractTranslationsFromMessage(content);
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
    const timestamp = now.toISOString()
      .replace(/[:.]/g, '-')
      .substring(0, 19); // YYYY-MM-DDTHH-mm-ss format

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
    // Check if content contains Japanese characters
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(content);
    
    // Check if content has reasonable length for vocabulary learning
    const hasReasonableLength = content.length >= 10 && content.length <= 200;
    
    // Check if content appears to have translation structure
    const hasTranslationStructure = content.includes('BEGINNER LEVEL') || 
                                   content.includes('INTERMEDIATE LEVEL') || 
                                   content.includes('UPPER LEVEL');

    return hasJapanese && hasReasonableLength && hasTranslationStructure;
  }
}