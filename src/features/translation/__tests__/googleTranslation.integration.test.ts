import { describe, it, expect, beforeAll } from 'vitest';
import { GoogleTranslationService } from '../googleTranslationService';

// Integration tests that require actual Google API key
// These tests will be skipped if GOOGLE_API_KEY is not available
describe('GoogleTranslationService Integration Tests', () => {
  let service: GoogleTranslationService;
  const hasApiKey = !!process.env.GOOGLE_API_KEY;

  beforeAll(() => {
    service = new GoogleTranslationService();
  });

  // Skip all tests if no API key is available
  const testIf = hasApiKey ? it : it.skip;

  describe('Real API Translation Tests', () => {
    testIf('should translate simple Japanese to English', async () => {
      const japaneseText = 'こんにちは';
      const result = await service.translateToEnglish(japaneseText);
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.toLowerCase()).toMatch(/hello|hi|good/);
      
      console.log(`✨ JA→EN: "${japaneseText}" → "${result}"`);
    }, 10000); // 10 second timeout for API call

    testIf('should translate simple English to Japanese', async () => {
      const englishText = 'Hello';
      const result = await service.translateToJapanese(englishText);
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/こんにち|ハロー|やあ/);
      
      console.log(`✨ EN→JA: "${englishText}" → "${result}"`);
    }, 10000);

    testIf('should translate complex Japanese sentence to English', async () => {
      const japaneseText = '今日は学校に行きました';
      const result = await service.translateToEnglish(japaneseText);
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.toLowerCase()).toMatch(/(school|today|went|go)/);
      
      console.log(`✨ Complex JA→EN: "${japaneseText}" → "${result}"`);
    }, 10000);

    testIf('should translate complex English sentence to Japanese', async () => {
      const englishText = 'I went to school today';
      const result = await service.translateToJapanese(englishText);
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/(今日|学校|行き)/);
      
      console.log(`✨ Complex EN→JA: "${englishText}" → "${result}"`);
    }, 10000);

    testIf('should handle special characters and punctuation', async () => {
      const japaneseText = 'これは素晴らしいです！';
      const result = await service.translateToEnglish(japaneseText);
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.toLowerCase()).toMatch(/(wonderful|great|amazing|excellent)/);
      
      console.log(`✨ Special chars JA→EN: "${japaneseText}" → "${result}"`);
    }, 10000);
  });

  describe('Error Handling Tests', () => {
    testIf('should handle very long text', async () => {
      const longText = 'これは長いテキストです。'.repeat(100); // Repeat 100 times
      
      try {
        const result = await service.translateToEnglish(longText);
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
        console.log(`✨ Long text handled successfully (${longText.length} chars)`);
      } catch (error) {
        // If it fails due to length limits, that's expected
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`⚠️  Long text failed as expected: ${errorMessage}`);
        expect(errorMessage).toMatch(/(limit|length|quota|too)/i);
      }
    }, 15000);

    testIf('should handle empty string gracefully', async () => {
      try {
        const result = await service.translateToEnglish('');
        // Some APIs might return empty string, others might throw
        expect(typeof result).toBe('string');
      } catch (error) {
        // Empty string error is acceptable
        expect(error).toBeTruthy();
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`⚠️  Empty string handled: ${errorMessage}`);
      }
    });

    testIf('should handle mixed language text', async () => {
      const mixedText = 'Hello こんにちは world 世界';
      const result = await service.translateToEnglish(mixedText);
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      
      console.log(`✨ Mixed text JA→EN: "${mixedText}" → "${result}"`);
    }, 10000);
  });

  describe('Performance Tests', () => {
    testIf('should handle multiple concurrent translations', async () => {
      const texts = [
        'こんにちは',
        '今日は晴れです',
        'ありがとうございます',
        '元気ですか？',
        'さようなら'
      ];

      const startTime = Date.now();
      const results = await Promise.all(
        texts.map(text => service.translateToEnglish(text))
      );
      const duration = Date.now() - startTime;

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      });

      console.log(`✨ Concurrent translations completed in ${duration}ms`);
      results.forEach((result, index) => {
        console.log(`  "${texts[index]}" → "${result}"`);
      });
    }, 20000);
  });

  // Information test - always runs to show API availability
  it('should report Google API key availability', () => {
    if (hasApiKey) {
      console.log('✅ Google API key is available - integration tests will run');
      expect(process.env.GOOGLE_API_KEY).toBeTruthy();
    } else {
      console.log('⚠️  Google API key not available - integration tests skipped');
      console.log('   Set GOOGLE_API_KEY environment variable to run integration tests');
    }
  });
});