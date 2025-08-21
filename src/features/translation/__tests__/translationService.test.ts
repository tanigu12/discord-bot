import { describe, it, expect, beforeEach } from 'vitest';
import { TranslationService } from '../translationService';
import { ParsedTranslationEntry } from '../types';

describe('TranslationService', () => {
  let translationService: TranslationService;

  beforeEach(() => {
    translationService = new TranslationService();
  });

  describe('parseTranslationEntry', () => {
    it('should extract target sentence only when no [try] or [q] markers exist', () => {
      const content = 'Today I went to school and had a great time.';
      
      const result = translationService.parseTranslationEntry(content);
      
      expect(result.targetSentence).toBe('Today I went to school and had a great time.');
      expect(result.tryTranslation).toBeUndefined();
      expect(result.questions).toBeUndefined();
    });

    it('should extract target sentence excluding [try] marker content', () => {
      const content = `今日は学校に行きました。
      
[try] I went to school today.`;
      
      const result = translationService.parseTranslationEntry(content);
      
      expect(result.targetSentence).toBe('今日は学校に行きました。');
      expect(result.tryTranslation).toBe('I went to school today.');
      expect(result.questions).toBeUndefined();
    });

    it('should extract target sentence excluding [q] marker content', () => {
      const content = `Today I studied English grammar.
      
[q] What is the difference between present perfect and past tense?`;
      
      const result = translationService.parseTranslationEntry(content);
      
      expect(result.targetSentence).toBe('Today I studied English grammar.');
      expect(result.tryTranslation).toBeUndefined();
      expect(result.questions).toEqual(['What is the difference between present perfect and past tense?']);
    });

    it('should extract target sentence excluding both [try] and [q] markers', () => {
      const content = `今日は英語の勉強をしました。とても面白かったです。

[try] I studied English today. It was very interesting.

[q] How can I improve my English speaking skills?
[q] What are some good resources for learning grammar?`;
      
      const result = translationService.parseTranslationEntry(content);
      
      expect(result.targetSentence).toBe('今日は英語の勉強をしました。とても面白かったです。');
      expect(result.tryTranslation).toBe('I studied English today. It was very interesting.');
      expect(result.questions).toEqual([
        'How can I improve my English speaking skills?',
        'What are some good resources for learning grammar?'
      ]);
    });

    it('should handle multi-line target sentences correctly', () => {
      const content = `今日は朝から晩まで忙しい一日でした。
学校で新しい友達と出会い、とても楽しい時間を過ごしました。
夜は家族と夕食を食べて、一日の出来事を話しました。

[try] Today was a busy day from morning to night.
[q] How do you say "busy day" in more natural English?`;
      
      const result = translationService.parseTranslationEntry(content);
      
      const expectedTarget = `今日は朝から晩まで忙しい一日でした。
学校で新しい友達と出会い、とても楽しい時間を過ごしました。
夜は家族と夕食を食べて、一日の出来事を話しました。`;
      
      expect(result.targetSentence).toBe(expectedTarget);
      expect(result.tryTranslation).toBe('Today was a busy day from morning to night.');
      expect(result.questions).toEqual(['How do you say "busy day" in more natural English?']);
    });

    it('should handle mixed order of [try] and [q] markers', () => {
      const content = `English is a challenging but rewarding language to learn.

[q] What are the most difficult aspects of English grammar?

[try] 英語は学ぶのが難しいですが、やりがいのある言語です。

[q] How long does it typically take to become fluent?`;
      
      const result = translationService.parseTranslationEntry(content);
      
      expect(result.targetSentence).toBe('English is a challenging but rewarding language to learn.');
      expect(result.tryTranslation).toBe('英語は学ぶのが難しいですが、やりがいのある言語です。');
      expect(result.questions).toEqual([
        'What are the most difficult aspects of English grammar?',
        'How long does it typically take to become fluent?'
      ]);
    });

    it('should handle empty lines and whitespace correctly', () => {
      const content = `

Today was a wonderful day.


[try] 今日は素晴らしい日でした。


[q] How do you express strong positive emotions in English?

`;
      
      const result = translationService.parseTranslationEntry(content);
      
      expect(result.targetSentence).toBe('Today was a wonderful day.');
      expect(result.tryTranslation).toBe('今日は素晴らしい日でした。');
      expect(result.questions).toEqual(['How do you express strong positive emotions in English?']);
    });

    it('should handle content with only [try] marker', () => {
      const content = `今日は映画を見ました。

[try] I watched a movie today.`;
      
      const result = translationService.parseTranslationEntry(content);
      
      expect(result.targetSentence).toBe('今日は映画を見ました。');
      expect(result.tryTranslation).toBe('I watched a movie today.');
      expect(result.questions).toBeUndefined();
    });

    it('should handle content with only [q] markers', () => {
      const content = `Learning languages requires consistent practice and patience.

[q] What are the best methods for language retention?
[q] How important is pronunciation in language learning?`;
      
      const result = translationService.parseTranslationEntry(content);
      
      expect(result.targetSentence).toBe('Learning languages requires consistent practice and patience.');
      expect(result.tryTranslation).toBeUndefined();
      expect(result.questions).toEqual([
        'What are the best methods for language retention?',
        'How important is pronunciation in language learning?'
      ]);
    });

    it('should handle edge case with empty target sentence', () => {
      const content = `[try] This is just a translation attempt.
[q] What if there is no target sentence?`;
      
      const result = translationService.parseTranslationEntry(content);
      
      expect(result.targetSentence).toBe('');
      expect(result.tryTranslation).toBe('This is just a translation attempt.');
      expect(result.questions).toEqual(['What if there is no target sentence?']);
    });

    it('should handle markers with extra whitespace', () => {
      const content = `My weekend was relaxing and productive.

    [try]     週末はリラックスできて生産的でした。    

  [q]    How do you balance relaxation and productivity?    `;
      
      const result = translationService.parseTranslationEntry(content);
      
      expect(result.targetSentence).toBe('My weekend was relaxing and productive.');
      expect(result.tryTranslation).toBe('週末はリラックスできて生産的でした。');
      expect(result.questions).toEqual(['How do you balance relaxation and productivity?']);
    });
  });

  describe('determineProcessingScenario', () => {
    it('should return "japanese-only" for Japanese target without [try]', () => {
      const parsedEntry: ParsedTranslationEntry = {
        targetSentence: '今日は学校に行きました。',
        tryTranslation: undefined,
        questions: undefined,
      };
      
      const scenario = translationService.determineProcessingScenario(parsedEntry);
      
      expect(scenario).toBe('japanese-only');
    });

    it('should return "japanese-with-try" for Japanese target with [try]', () => {
      const parsedEntry: ParsedTranslationEntry = {
        targetSentence: '今日は学校に行きました。',
        tryTranslation: 'I went to school today.',
        questions: undefined,
      };
      
      const scenario = translationService.determineProcessingScenario(parsedEntry);
      
      expect(scenario).toBe('japanese-with-try');
    });

    it('should return "english-only" for English target', () => {
      const parsedEntry: ParsedTranslationEntry = {
        targetSentence: 'Today I went to school.',
        tryTranslation: undefined,
        questions: undefined,
      };
      
      const scenario = translationService.determineProcessingScenario(parsedEntry);
      
      expect(scenario).toBe('english-only');
    });

    it('should return "japanese-with-try" for mixing language with [try]', () => {
      const parsedEntry: ParsedTranslationEntry = {
        targetSentence: 'Today I went to 学校.',
        tryTranslation: 'I tried to translate this mixed sentence.',
        questions: undefined,
      };
      
      const scenario = translationService.determineProcessingScenario(parsedEntry);
      
      expect(scenario).toBe('japanese-with-try');
    });
  });

  describe('isValidTranslationChannel', () => {
    it('should return true for channel names containing "translation"', () => {
      expect(translationService.isValidTranslationChannel('translation')).toBe(true);
      expect(translationService.isValidTranslationChannel('my-translation')).toBe(true);
      expect(translationService.isValidTranslationChannel('translation-channel')).toBe(true);
      expect(translationService.isValidTranslationChannel('TRANSLATION')).toBe(true);
    });

    it('should return false for channel names not containing "translation"', () => {
      expect(translationService.isValidTranslationChannel('general')).toBe(false);
      expect(translationService.isValidTranslationChannel('chat')).toBe(false);
      expect(translationService.isValidTranslationChannel('random')).toBe(false);
      expect(translationService.isValidTranslationChannel('')).toBe(false);
      expect(translationService.isValidTranslationChannel(undefined)).toBe(false);
    });
  });

  describe('helper methods', () => {
    it('should display language names correctly', () => {
      expect(translationService.getLanguageDisplayName('japanese')).toBe('🇯🇵 Japanese');
      expect(translationService.getLanguageDisplayName('english')).toBe('🇺🇸 English');
      expect(translationService.getLanguageDisplayName('mixing')).toBe('🇯🇵🇺🇸 Mixed (JP + EN)');
      expect(translationService.getLanguageDisplayName('unknown')).toBe('🌍 Other');
    });

    it('should truncate text correctly', () => {
      const shortText = 'Short text';
      const longText = 'This is a very long text that needs to be truncated for display purposes';
      
      expect(translationService.truncateText(shortText, 20)).toBe(shortText);
      expect(translationService.truncateText(longText, 20)).toBe('This is a very lo...');
      expect(translationService.truncateText(longText, 50)).toBe('This is a very long text that needs to be trunc...');
    });
  });
});