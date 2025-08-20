import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DiaryAIService } from '../diaryAIService';
import type { DetectedLanguage } from '../types';

// Mock console.log to avoid cluttering test output but still allow testing the logging
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('DiaryAIService', () => {
  let diaryAIService: DiaryAIService;

  beforeEach(() => {
    diaryAIService = new DiaryAIService();
    consoleSpy.mockClear();
  });

  describe('detectLanguageByPattern', () => {
    it('should detect English text correctly', () => {
      const testCases = [
        'Hello world',
        'This is a test',
        'I went to school today',
        '[try] I went to school today',
        'Good morning everyone',
      ];

      testCases.forEach((testCase) => {
        const result = diaryAIService.detectLanguageByPattern(testCase);
        expect(result).toBe('english' as DetectedLanguage);
      });
    });

    it('should detect Japanese hiragana text correctly', () => {
      const testCases = [
        'こんにちは',
        'おはようございます', 
        'ありがとうございます',
        'すみません',
        'はじめまして',
      ];

      testCases.forEach((testCase) => {
        const result = diaryAIService.detectLanguageByPattern(testCase);
        expect(result).toBe('japanese' as DetectedLanguage);
      });
    });

    it('should detect Japanese katakana text correctly', () => {
      const testCases = [
        'コンニチハ',
        'アリガトウ',
        'コンピュータ',
        'インターネット',
        'プログラム',
      ];

      testCases.forEach((testCase) => {
        const result = diaryAIService.detectLanguageByPattern(testCase);
        expect(result).toBe('japanese' as DetectedLanguage);
      });
    });

    it('should detect Japanese kanji text correctly', () => {
      const testCases = [
        '日本語',
        '学校',
        '今日',
        '明日',
        '友達',
      ];

      testCases.forEach((testCase) => {
        const result = diaryAIService.detectLanguageByPattern(testCase);
        expect(result).toBe('japanese' as DetectedLanguage);
      });
    });

    it('should detect mixed Japanese scripts correctly', () => {
      const testCases = [
        '今日はいい天気です', // kanji + hiragana
        'コンピュータを使います', // katakana + hiragana
        '日本のアニメ', // kanji + katakana
        '今日はコンピュータで勉強しました', // all three scripts
      ];

      testCases.forEach((testCase) => {
        const result = diaryAIService.detectLanguageByPattern(testCase);
        expect(result).toBe('japanese' as DetectedLanguage);
      });
    });

    it('should detect mixed language (Japanese + English) correctly', () => {
      const testCases = [
        'Hello こんにちは',
        'Hello コンニチハ', 
        'Hello 世界',
        '今日はgood weatherです',
        '今日学校に行きました [try] I went to school today',
        'I like アニメ very much',
        'Programming プログラミング is fun',
      ];

      testCases.forEach((testCase) => {
        const result = diaryAIService.detectLanguageByPattern(testCase);
        expect(result).toBe('mixing' as DetectedLanguage);
      });
    });

    it('should handle edge cases and default to English', () => {
      const testCases = [
        '', // empty string
        '   ', // whitespace only
        '123456', // numbers only
        '!@#$%', // symbols only
        '🎉🎊', // emojis only
        '123 + 456 = 789', // math expression
      ];

      testCases.forEach((testCase) => {
        const result = diaryAIService.detectLanguageByPattern(testCase);
        expect(result).toBe('english' as DetectedLanguage);
      });
    });

    it('should log detection process for debugging', () => {
      const testText = 'Hello こんにちは';
      diaryAIService.detectLanguageByPattern(testText);

      // Verify that logging occurred
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔍 Language Detection - Input text:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Character detection results:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🎯 Result: MIXING')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ Language detection completed:')
      );
    });

    it('should detect individual character types correctly', () => {
      // Test individual character detection logic
      const hiraganaText = 'あ';
      const katakanaText = 'ア';
      const kanjiText = '日';
      const englishText = 'A';

      diaryAIService.detectLanguageByPattern(hiraganaText);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('- Hiragana: true')
      );

      consoleSpy.mockClear();
      diaryAIService.detectLanguageByPattern(katakanaText);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('- Katakana: true')
      );

      consoleSpy.mockClear();
      diaryAIService.detectLanguageByPattern(kanjiText);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('- Kanji: true')
      );

      consoleSpy.mockClear();
      diaryAIService.detectLanguageByPattern(englishText);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('- English: true')
      );
    });

    it('should handle complex mixed content correctly', () => {
      const complexTestCases = [
        {
          input: '今日は東京駅でMeetingがありました。とてもinterestingでした！',
          expected: 'mixing' as DetectedLanguage,
          description: 'complex mixed content with multiple scripts and English words'
        },
        {
          input: 'プロジェクトのStatusは？',
          expected: 'mixing' as DetectedLanguage,
          description: 'katakana + English'
        },
        {
          input: 'Let me know about your 気持ち',
          expected: 'mixing' as DetectedLanguage,
          description: 'English + kanji'
        }
      ];

      complexTestCases.forEach(({ input, expected, description }) => {
        const result = diaryAIService.detectLanguageByPattern(input);
        expect(result, `Failed for: ${description}`).toBe(expected);
      });
    });
  });
});

describe('DiaryAIService Character Regex Validation', () => {
  let diaryAIService: DiaryAIService;

  beforeEach(() => {
    diaryAIService = new DiaryAIService();
    consoleSpy.mockClear();
  });

  it('should correctly identify hiragana characters from comprehensive set', () => {
    // Test various hiragana characters from different groups
    const hiraganaChars = [
      'あ', 'い', 'う', 'え', 'お', // basic vowels
      'か', 'き', 'く', 'け', 'こ', // ka group
      'が', 'ぎ', 'ぐ', 'げ', 'ご', // ga group (voiced)
      'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ', // pa group (semi-voiced)
      'ゃ', 'ゅ', 'ょ', // small ya, yu, yo
      'っ', // small tsu
      'ん', // n
    ];

    hiraganaChars.forEach(char => {
      const result = diaryAIService.detectLanguageByPattern(char);
      expect(result, `Failed for hiragana character: ${char}`).toBe('japanese');
    });
  });

  it('should correctly identify katakana characters from comprehensive set', () => {
    // Test various katakana characters from different groups
    const katakanaChars = [
      'ア', 'イ', 'ウ', 'エ', 'オ', // basic vowels
      'カ', 'キ', 'ク', 'ケ', 'コ', // ka group  
      'ガ', 'ギ', 'グ', 'ゲ', 'ゴ', // ga group (voiced)
      'パ', 'ピ', 'プ', 'ペ', 'ポ', // pa group (semi-voiced)
      'ャ', 'ュ', 'ョ', // small ya, yu, yo
      'ッ', // small tsu
      'ン', // n
      'ー', // long vowel mark
    ];

    katakanaChars.forEach(char => {
      const result = diaryAIService.detectLanguageByPattern(char);
      expect(result, `Failed for katakana character: ${char}`).toBe('japanese');
    });
  });

  it('should correctly identify kanji characters', () => {
    // Test various kanji from different ranges
    const kanjiChars = [
      '日', '本', '語', // common kanji
      '学', '校', '生', // school-related
      '今', '明', '昨', // time-related
      '人', '私', '君', // person-related
      '大', '小', '中', // size-related
      '一', '二', '三', '四', '五', // numbers
    ];

    kanjiChars.forEach(char => {
      const result = diaryAIService.detectLanguageByPattern(char);
      expect(result, `Failed for kanji character: ${char}`).toBe('japanese');
    });
  });
});