import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoogleTranslationService } from '../googleTranslationService';

// Mock functions
const mockDetect = vi.fn();
const mockTranslate = vi.fn();

// Mock the Google Cloud Translate library
vi.mock('@google-cloud/translate/build/src/v2', () => {
  return {
    Translate: vi.fn().mockImplementation(() => ({
      detect: mockDetect,
      translate: mockTranslate,
    })),
  };
});

describe('GoogleTranslationService', () => {
  let service: GoogleTranslationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new GoogleTranslationService();
    
    // Set default environment variable for tests
    process.env.GOOGLE_API_KEY = 'test-api-key';
  });

  describe('translateToEnglish', () => {
    it('should translate Japanese to English', async () => {
      mockTranslate.mockResolvedValue(['Hello']);
      
      const result = await service.translateToEnglish('こんにちは');
      
      expect(result).toBe('Hello');
      expect(mockTranslate).toHaveBeenCalledWith('こんにちは', 'en');
    });

    it('should throw error when translation fails', async () => {
      mockTranslate.mockRejectedValue(new Error('Translation API Error'));
      
      await expect(service.translateToEnglish('こんにちは')).rejects.toThrow('Translation API Error');
    });
  });

  describe('translateToJapanese', () => {
    it('should translate text to Japanese', async () => {
      mockTranslate.mockResolvedValue(['こんにちは']);
      
      const result = await service.translateToJapanese('Hello');
      
      expect(result).toBe('こんにちは');
      expect(mockTranslate).toHaveBeenCalledWith('Hello', 'ja');
    });

    it('should throw error when translation fails', async () => {
      mockTranslate.mockRejectedValue(new Error('Translation API Error'));
      
      await expect(service.translateToJapanese('Hello')).rejects.toThrow('Translation API Error');
    });
  });
});