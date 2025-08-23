import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { YoutubeCaptionService } from '../youtubeCaptionService';

// Mock Google Generative AI
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn(),
    }),
  })),
}));

describe('YoutubeCaptionService', () => {
  let service: YoutubeCaptionService;
  let mockGenAI: any;

  beforeEach(() => {
    // Set up environment variable for test
    process.env.GOOGLE_API_KEY = 'test-api-key';

    service = new YoutubeCaptionService();
    mockGenAI = service['genAI'];

    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.GOOGLE_API_KEY;
  });

  describe('isYouTubeUrl', () => {
    it('should return true for valid YouTube URLs and log debug info', () => {
      const validUrls = [
        'https://www.youtube.com/watch?v=wUrvXN-yiyo',
        'https://youtube.com/watch?v=abc123',
        'https://youtu.be/wUrvXN-yiyo',
        'https://m.youtube.com/watch?v=test123',
      ];

      validUrls.forEach(url => {
        const result = service.isYouTubeUrl(url);
        expect(result).toBe(true);

        // Check debug logging
        expect(console.log).toHaveBeenCalledWith(
          `🔍 [DEBUG] YoutubeCaptionService.isYouTubeUrl() checking: ${url}`
        );
        expect(console.log).toHaveBeenCalledWith('   Valid YouTube URL: true');
      });
    });

    it('should return false for invalid URLs and log debug info', () => {
      const invalidUrls = ['https://www.google.com', 'https://vimeo.com/123456', 'not-a-url', ''];

      invalidUrls.forEach(url => {
        const result = service.isYouTubeUrl(url);
        expect(result).toBe(false);

        // Check debug logging
        expect(console.log).toHaveBeenCalledWith(
          `🔍 [DEBUG] YoutubeCaptionService.isYouTubeUrl() checking: ${url}`
        );
        expect(console.log).toHaveBeenCalledWith('   Valid YouTube URL: false');
      });
    });

    it('should handle malformed URLs and log parsing errors', () => {
      const malformedUrl = 'not-a-valid-url';

      const result = service.isYouTubeUrl(malformedUrl);
      expect(result).toBe(false);

      // Should log the parsing failure
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('URL parsing failed:'));
    });
  });

  describe('analyzeVideo', () => {
    it('should return error when Google API key is not configured', async () => {
      // Create service without API key
      delete process.env.GOOGLE_API_KEY;
      const serviceWithoutKey = new YoutubeCaptionService();

      const result = await serviceWithoutKey.analyzeVideo(
        'https://www.youtube.com/watch?v=test',
        'test prompt'
      );

      expect(result.status).toBe('error');
      expect(result.error).toContain('Google API key not configured');
      expect(console.error).toHaveBeenCalledWith('❌ [DEBUG] Google API key not configured');
    });

    it('should return error for invalid YouTube URL', async () => {
      const invalidUrl = 'https://www.google.com';

      const result = await service.analyzeVideo(invalidUrl, 'test prompt');

      expect(result.status).toBe('error');
      expect(result.error).toBe('Invalid YouTube URL provided.');
      expect(console.error).toHaveBeenCalledWith(`❌ [DEBUG] Invalid YouTube URL: ${invalidUrl}`);
    });

    it('should successfully analyze video with proper debug logging', async () => {
      const testUrl = 'https://www.youtube.com/watch?v=wUrvXN-yiyo';
      const testPrompt = 'Test analysis prompt';
      const mockResponseText = 'Analyzed video content response';

      // Mock the Gemini API response
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: vi.fn().mockReturnValue(mockResponseText),
          },
        }),
      };

      if (mockGenAI) {
        mockGenAI.getGenerativeModel = vi.fn().mockReturnValue(mockModel);
      }

      const result = await service.analyzeVideo(testUrl, testPrompt);

      expect(result.status).toBe('success');
      expect(result.summary).toBe(mockResponseText);

      // Check debug logging
      expect(console.log).toHaveBeenCalledWith(
        '🔍 [DEBUG] YoutubeCaptionService.analyzeVideo() starting'
      );
      expect(console.log).toHaveBeenCalledWith(`   URL: ${testUrl}`);
      expect(console.log).toHaveBeenCalledWith(`   Prompt length: ${testPrompt.length} characters`);
      expect(console.log).toHaveBeenCalledWith(
        '🎬 [DEBUG] Valid YouTube URL confirmed, starting Gemini AI analysis'
      );
      expect(console.log).toHaveBeenCalledWith('✅ [DEBUG] Successfully analyzed video');
    });

    it('should handle Gemini API errors with detailed logging', async () => {
      const testUrl = 'https://www.youtube.com/watch?v=wUrvXN-yiyo';
      const testPrompt = 'Test prompt';
      const apiError = new Error('API rate limit exceeded');

      // Mock the Gemini API to throw an error
      const mockModel = {
        generateContent: vi.fn().mockRejectedValue(apiError),
      };

      if (mockGenAI) {
        mockGenAI.getGenerativeModel = vi.fn().mockReturnValue(mockModel);
      }

      const result = await service.analyzeVideo(testUrl, testPrompt);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Gemini API error: API rate limit exceeded');

      // Check error logging
      expect(console.error).toHaveBeenCalledWith('❌ [DEBUG] Error analyzing video:');
      expect(console.error).toHaveBeenCalledWith(`   Error type: ${apiError.constructor.name}`);
      expect(console.error).toHaveBeenCalledWith(`   Error message: ${apiError.message}`);
    });
  });

  describe('getTranscriptFromVideo', () => {
    it('should call analyzeVideo with enhanced 20-minute API limit prompt', async () => {
      const testUrl = 'https://www.youtube.com/watch?v=wUrvXN-yiyo';

      // Spy on analyzeVideo method
      const analyzeVideoSpy = vi.spyOn(service, 'analyzeVideo').mockResolvedValue({
        status: 'success',
        summary: 'Test response',
      });

      await service.getTranscriptFromVideo(testUrl);

      expect(analyzeVideoSpy).toHaveBeenCalledWith(
        testUrl,
        expect.stringContaining(
          'This video analysis is automatically limited to the first 20 minutes (1200 seconds)'
        )
      );
      expect(analyzeVideoSpy).toHaveBeenCalledWith(
        testUrl,
        expect.stringContaining(
          'Video processing automatically limited to first 20 minutes (1200s) via API'
        )
      );
      expect(analyzeVideoSpy).toHaveBeenCalledWith(
        testUrl,
        expect.stringContaining(
          'Note: This transcription covers the first 20 minutes of the video for focused learning'
        )
      );

      // Check debug logging
      expect(console.log).toHaveBeenCalledWith(
        '🔍 [DEBUG] YoutubeCaptionService.getTranscriptFromVideo() starting'
      );
      expect(console.log).toHaveBeenCalledWith(
        '🔍 [DEBUG] Enhanced prompt created with 20-minute API limit'
      );
    });

    it('should include video length note section in prompt', async () => {
      const testUrl = 'https://www.youtube.com/watch?v=wUrvXN-yiyo';

      const analyzeVideoSpy = vi.spyOn(service, 'analyzeVideo').mockResolvedValue({
        status: 'success',
        summary: 'Test response',
      });

      await service.getTranscriptFromVideo(testUrl);

      const [, prompt] = analyzeVideoSpy.mock.calls[0];
      expect(prompt).toContain('## ⏱️ Video Length Note');
      expect(prompt).toContain('This analysis covers the first 20 minutes of a longer video');
    });
  });

  describe('Integration test with test URL', () => {
    it('should properly handle the specific test URL https://www.youtube.com/watch?v=wUrvXN-yiyo', () => {
      const testUrl = 'https://www.youtube.com/watch?v=wUrvXN-yiyo';

      const isValid = service.isYouTubeUrl(testUrl);
      expect(isValid).toBe(true);

      // Check that debug logs are called with the specific URL
      expect(console.log).toHaveBeenCalledWith(
        `🔍 [DEBUG] YoutubeCaptionService.isYouTubeUrl() checking: ${testUrl}`
      );
      expect(console.log).toHaveBeenCalledWith('   Parsed hostname: www.youtube.com');
    });
  });
});
