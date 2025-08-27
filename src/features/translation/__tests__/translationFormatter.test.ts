import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TranslationFormatter } from '../translationFormatter';
import { TranslationProcessingResult } from '../types';
import { User } from 'discord.js';

// Mock Discord.js User for testing
const createMockUser = (username: string = 'TestUser'): User => ({
  username,
  displayAvatarURL: vi.fn().mockReturnValue('https://example.com/avatar.png'),
} as unknown as User);

// Mock TranslationProcessingResult for testing
const createMockResult = (overrides: Partial<TranslationProcessingResult> = {}): TranslationProcessingResult => ({
  detectedLanguage: 'japanese',
  targetSentence: '今日は学校に行きました。',
  scenario: 'japanese-only',
  hasQuestions: false,
  threeLevelTranslations: {
    beginner: 'Today I went to school.',
    intermediate: 'I went to school today.',
    upper: 'I attended school today.',
  },
  ...overrides,
});

describe('TranslationFormatter', () => {
  let formatter: TranslationFormatter;

  beforeEach(() => {
    formatter = new TranslationFormatter();
  });

  describe('addLineBreaks', () => {
    // Access private method for testing using type assertion
    const getAddLineBreaks = (formatter: TranslationFormatter) => 
      (formatter as any).addLineBreaks.bind(formatter);

    it('should not break text under 100 characters', () => {
      const addLineBreaks = getAddLineBreaks(formatter);
      const shortText = 'This is a short sentence that should not be broken.';
      
      const result = addLineBreaks(shortText);
      
      expect(result).toBe(shortText);
      expect(result.split('\n')).toHaveLength(1);
    });

    it('should break text at word boundaries when over 100 characters', () => {
      const addLineBreaks = getAddLineBreaks(formatter);
      const longText = 'This is a longer sentence that contains multiple words and should be broken at an appropriate word boundary when it exceeds the one hundred character limit.';
      
      const result = addLineBreaks(longText);
      const lines = result.split('\n');
      
      expect(lines.length).toBeGreaterThan(1);
      expect(lines.every((line: string) => line.length <= 100)).toBe(true);
      expect(result.replace(/\n/g, ' ')).toBe(longText);
    });

    it('should force-break extremely long single words', () => {
      const addLineBreaks = getAddLineBreaks(formatter);
      const longWord = 'A'.repeat(150); // 150 character single word
      
      const result = addLineBreaks(longWord);
      const lines = result.split('\n');
      
      expect(lines.length).toBeGreaterThan(1);
      expect(lines.every((line: string) => line.length <= 100)).toBe(true);
      expect(result.replace(/\n/g, '')).toBe(longWord);
    });

    it('should handle mixed content with long words and normal text', () => {
      const addLineBreaks = getAddLineBreaks(formatter);
      const mixedText = 'This is normal text with a supercalifragilisticexpialidocious' + 'A'.repeat(50) + ' word that should be broken properly.';
      
      const result = addLineBreaks(mixedText);
      const lines = result.split('\n');
      
      expect(lines.length).toBeGreaterThan(1);
      expect(lines.every((line: string) => line.length <= 100)).toBe(true);
    });

    it('should respect custom line length limit', () => {
      const addLineBreaks = getAddLineBreaks(formatter);
      const text = 'This is a test sentence that should be broken at fifty characters exactly when we specify that limit.';
      
      const result = addLineBreaks(text, 50);
      const lines = result.split('\n');
      
      expect(lines.every((line: string) => line.length <= 50)).toBe(true);
    });

    it('should handle empty strings', () => {
      const addLineBreaks = getAddLineBreaks(formatter);
      
      const result = addLineBreaks('');
      
      expect(result).toBe('');
    });

    it('should handle single words shorter than limit', () => {
      const addLineBreaks = getAddLineBreaks(formatter);
      
      const result = addLineBreaks('word');
      
      expect(result).toBe('word');
    });

    it('should preserve multiple spaces between words', () => {
      const addLineBreaks = getAddLineBreaks(formatter);
      const textWithSpaces = 'This  has    multiple   spaces   between words that should be preserved in the output text.';
      
      const result = addLineBreaks(textWithSpaces);
      
      expect(result).toContain('  ');
      expect(result).toContain('    ');
    });
  });

  describe('generateCompleteMessage integration', () => {
    it('should apply line breaks to translation content', () => {
      const mockUser = createMockUser();
      const longTranslation = 'This is a very long translation that contains many words and should be broken into multiple lines because it significantly exceeds the one hundred character limit.';
      
      const mockResult = createMockResult({
        threeLevelTranslations: {
          beginner: longTranslation,
          intermediate: longTranslation,
          upper: longTranslation,
        },
      });

      const generateCompleteMessage = (formatter as any).generateCompleteMessage.bind(formatter);
      const result = generateCompleteMessage(mockResult, mockUser);
      
      // Check that long translations are broken into multiple lines
      const lines = result.split('\n');
      const translationLines = lines.filter((line: string) => line.includes('significantly exceeds'));
      
      expect(translationLines.length).toBeGreaterThan(0);
      expect(lines.every((line: string) => line.length <= 100)).toBe(true);
    });

    it('should apply line breaks to evaluation content', () => {
      const mockUser = createMockUser();
      const longEvaluation = 'This is a very detailed evaluation of your translation attempt that provides comprehensive feedback and suggestions for improvement, covering multiple aspects of grammar, vocabulary, and natural expression in English.';
      
      const mockResult = createMockResult({
        scenario: 'japanese-with-try',
        translationEvaluation: {
          evaluation: longEvaluation,
          studyPoints: ['Very long study point that needs to be broken because it contains detailed explanations'],
          improvements: 'Long improvement suggestion that should also be broken into readable chunks for better user experience',
        },
      });

      const generateCompleteMessage = (formatter as any).generateCompleteMessage.bind(formatter);
      const result = generateCompleteMessage(mockResult, mockUser);
      
      const lines = result.split('\n');
      expect(lines.every((line: string) => line.length <= 100)).toBe(true);
    });

    it('should apply line breaks to questions and answers', () => {
      const mockUser = createMockUser();
      const longQuestion = 'What is the most important aspect of learning English grammar that you think students should focus on when they are trying to improve their writing skills?';
      const longAnswer = 'I think the most important aspect is understanding sentence structure and how different parts of speech work together to create clear, coherent, and natural-sounding English sentences.';
      
      const mockResult = createMockResult({
        hasQuestions: true,
        questionAnswers: [
          {
            question: longQuestion,
            answer: longAnswer,
          },
        ],
      });

      const generateCompleteMessage = (formatter as any).generateCompleteMessage.bind(formatter);
      const result = generateCompleteMessage(mockResult, mockUser);
      
      const lines = result.split('\n');
      expect(lines.every((line: string) => line.length <= 100)).toBe(true);
      
      // Verify both question and answer are present and properly broken
      expect(result).toContain('What is the most important aspect');
      expect(result).toContain('I think the most important aspect');
    });

    it('should handle english-only scenario with line breaks', () => {
      const mockUser = createMockUser();
      const longTranslation = '今日は学校に行って英語の授業を受けました。とても興味深い内容で、特に文法の説明が分かりやすく、新しい表現もたくさん学ぶことができました。';
      const longVocabulary = 'Key vocabulary includes: school (学校), classroom (教室), grammar (文法), expression (表現), interesting (興味深い), explanation (説明), and many other important terms for daily conversation.';
      const longGrammar = 'This sentence uses past tense verbs and demonstrates the structure of compound sentences in English, showing how multiple ideas can be connected using conjunctions and appropriate punctuation.';
      
      const mockResult = createMockResult({
        scenario: 'english-only',
        japaneseTranslation: longTranslation,
        educationalExplanation: `${longVocabulary}\n\n${longGrammar}`,
        threeLevelTranslations: undefined,
      });

      const generateCompleteMessage = (formatter as any).generateCompleteMessage.bind(formatter);
      const result = generateCompleteMessage(mockResult, mockUser);
      
      const lines = result.split('\n');
      expect(lines.every((line: string) => line.length <= 100)).toBe(true);
      
      // Verify all content sections are present
      expect(result).toContain('🇯🇵 JAPANESE TRANSLATION:');
      expect(result).toContain('🎓 EDUCATIONAL FEEDBACK & ANALYSIS:');
    });
  });

  describe('Content preservation', () => {
    it('should preserve all content when applying line breaks', () => {
      const mockUser = createMockUser();
      const originalTranslation = 'This is a comprehensive translation that demonstrates various aspects of English grammar and vocabulary usage in natural conversational contexts.';
      
      const mockResult = createMockResult({
        threeLevelTranslations: {
          beginner: originalTranslation,
          intermediate: originalTranslation,
          upper: originalTranslation,
        },
      });

      const generateCompleteMessage = (formatter as any).generateCompleteMessage.bind(formatter);
      const result = generateCompleteMessage(mockResult, mockUser);
      
      // Remove line breaks and check content preservation
      const contentWithoutBreaks = result.replace(/\n/g, ' ').replace(/\s+/g, ' ');
      expect(contentWithoutBreaks).toContain(originalTranslation.replace(/\s+/g, ' '));
    });

    it('should maintain proper structure with line breaks', () => {
      const mockUser = createMockUser();
      const mockResult = createMockResult();

      const generateCompleteMessage = (formatter as any).generateCompleteMessage.bind(formatter);
      const result = generateCompleteMessage(mockResult, mockUser);
      
      const lines = result.split('\n');
      
      // Check for proper structure
      expect(result).toContain("📝 Larry's Complete Diary Feedback");
      expect(result).toContain('🎯 DETECTED LANGUAGE:');
      expect(result).toContain('📚 THREE LEVEL ENGLISH TRANSLATIONS:');
      expect(result).toContain('Generated by Larry • Canadian English Tutor');
      
      // Ensure no line exceeds 100 characters
      expect(lines.every((line: string) => line.length <= 100)).toBe(true);
    });
  });
});