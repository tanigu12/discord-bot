import { describe, it, expect, beforeEach, vi } from 'vitest';
import { YoutubeResponseHandler } from '../youtubeResponseHandler';

// Mock the YoutubeCaptionService
vi.mock('../../../youtube-caption/youtubeCaptionService');

// Mock the BaseAIService
vi.mock('../../../../services/baseAIService', () => ({
  BaseAIService: class {
    callOpenAI = vi.fn();
  }
}));

describe('YoutubeResponseHandler', () => {
  let handler: YoutubeResponseHandler;
  let mockYoutubeCaptionService: any;

  beforeEach(() => {
    handler = new YoutubeResponseHandler();
    mockYoutubeCaptionService = handler['youtubeCaptionService'];
    
    // Reset all mocks
    vi.clearAllMocks();
    
    // Mock console.log and console.error to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('canHandle', () => {
    it('should return true for valid YouTube URLs', () => {
      const testUrls = [
        'https://www.youtube.com/watch?v=wUrvXN-yiyo',
        'https://youtube.com/watch?v=abc123',
        'https://youtu.be/wUrvXN-yiyo',
        'https://m.youtube.com/watch?v=test123'
      ];

      // Mock isYouTubeUrl to return true for all test URLs
      mockYoutubeCaptionService.isYouTubeUrl = vi.fn().mockReturnValue(true);

      testUrls.forEach(url => {
        const result = handler.canHandle(url);
        expect(result).toBe(true);
        expect(mockYoutubeCaptionService.isYouTubeUrl).toHaveBeenCalledWith(url);
      });
    });

    it('should return false for non-YouTube URLs', () => {
      const testUrls = [
        'https://www.google.com',
        'https://example.com/video',
        'not-a-url',
        ''
      ];

      // Mock isYouTubeUrl to return false for non-YouTube URLs
      mockYoutubeCaptionService.isYouTubeUrl = vi.fn().mockReturnValue(false);

      testUrls.forEach(url => {
        const result = handler.canHandle(url);
        expect(result).toBe(false);
        expect(mockYoutubeCaptionService.isYouTubeUrl).toHaveBeenCalledWith(url);
      });
    });

    it('should log debug information', () => {
      const testUrl = 'https://www.youtube.com/watch?v=wUrvXN-yiyo';
      mockYoutubeCaptionService.isYouTubeUrl = vi.fn().mockReturnValue(true);

      handler.canHandle(testUrl);

      expect(console.log).toHaveBeenCalledWith('🔍 [DEBUG] YoutubeResponseHandler.canHandle()');
      expect(console.log).toHaveBeenCalledWith(`   Query: ${testUrl}`);
      expect(console.log).toHaveBeenCalledWith('   Is YouTube URL: true');
    });
  });

  describe('processContent', () => {
    it('should process YouTube video successfully', async () => {
      const testUrl = 'https://www.youtube.com/watch?v=wUrvXN-yiyo';
      const mockSummary = 'Test video summary with transcript content...';
      
      mockYoutubeCaptionService.getTranscriptFromVideo = vi.fn().mockResolvedValue({
        status: 'success',
        summary: mockSummary
      });

      const result = await handler.processContent(testUrl);

      expect(result.content).toBe(mockSummary);
      expect(result.sourceInfo).toContain(testUrl);
      expect(result.sourceInfo).toContain('YouTube Video Complete Transcript');
      expect(result.sourceInfo).toContain('Gemini AI Analysis');
      expect(mockYoutubeCaptionService.getTranscriptFromVideo).toHaveBeenCalledWith(testUrl);
    });

    it('should handle analysis failure gracefully', async () => {
      const testUrl = 'https://www.youtube.com/watch?v=wUrvXN-yiyo';
      const errorMessage = 'API key not configured';
      
      mockYoutubeCaptionService.getTranscriptFromVideo = vi.fn().mockResolvedValue({
        status: 'error',
        error: errorMessage
      });

      const result = await handler.processContent(testUrl);

      expect(result.content).toBe(testUrl);
      expect(result.sourceInfo).toContain('analysis unavailable');
      expect(result.sourceInfo).toContain(errorMessage);
    });

    it('should handle service errors gracefully', async () => {
      const testUrl = 'https://www.youtube.com/watch?v=wUrvXN-yiyo';
      const error = new Error('Network error');
      
      mockYoutubeCaptionService.getTranscriptFromVideo = vi.fn().mockRejectedValue(error);

      const result = await handler.processContent(testUrl);

      expect(result.content).toBe(testUrl);
      expect(result.sourceInfo).toContain('caption service error');
    });

    it('should log comprehensive debug information', async () => {
      const testUrl = 'https://www.youtube.com/watch?v=wUrvXN-yiyo';
      const mockSummary = 'Test summary';
      
      mockYoutubeCaptionService.getTranscriptFromVideo = vi.fn().mockResolvedValue({
        status: 'success',
        summary: mockSummary
      });

      await handler.processContent(testUrl);

      expect(console.log).toHaveBeenCalledWith('🎬 [DEBUG] YoutubeResponseHandler.processContent() starting');
      expect(console.log).toHaveBeenCalledWith(`   Input URL: ${testUrl}`);
      expect(console.log).toHaveBeenCalledWith('   Step 1: Calling youtubeCaptionService.getTranscriptFromVideo...');
    });
  });

  describe('generateResponse', () => {
    it('should generate response with timestamp support and full video analysis', async () => {
      const testUrl = 'https://www.youtube.com/watch?v=wUrvXN-yiyo';
      const contentResult = {
        content: 'Test video transcript content for analysis...',
        sourceInfo: 'Source info'
      };
      const analysisContext = {
        context: null,
        contextInfo: ''
      };
      const mockResponse = 'Generated sectioned translation response';

      // Mock the callOpenAI method
      handler['callOpenAI'] = vi.fn().mockResolvedValue(mockResponse);

      const result = await handler.generateResponse(contentResult, analysisContext, testUrl);

      expect(result).toBe(mockResponse);
      expect(handler['callOpenAI']).toHaveBeenCalled();

      // Check that the system prompt includes timestamp support and full video analysis
      const [systemPrompt, userPrompt] = (handler['callOpenAI'] as any).mock.calls[0];
      expect(systemPrompt).toContain('Include timestamps [HH:MM:SS] in ALL section headers');
      expect(systemPrompt).toContain('CRITICAL: Include timestamps [HH:MM:SS]');
      expect(systemPrompt).toContain('[HH:MM:SS] Section');
      expect(userPrompt).toContain(testUrl);
      expect(userPrompt).toContain(contentResult.content);
    });

    it('should handle empty response from AI', async () => {
      const testUrl = 'https://www.youtube.com/watch?v=wUrvXN-yiyo';
      const contentResult = {
        content: 'Test content',
        sourceInfo: 'Source info'
      };
      const analysisContext = {
        context: null,
        contextInfo: ''
      };

      handler['callOpenAI'] = vi.fn().mockResolvedValue('');

      await expect(handler.generateResponse(contentResult, analysisContext, testUrl))
        .rejects.toThrow('AI service returned empty response for YouTube content');
    });

    it('should handle AI service errors', async () => {
      const testUrl = 'https://www.youtube.com/watch?v=wUrvXN-yiyo';
      const contentResult = {
        content: 'Test content',
        sourceInfo: 'Source info'
      };
      const analysisContext = {
        context: null,
        contextInfo: ''
      };
      const error = new Error('API rate limit exceeded');

      handler['callOpenAI'] = vi.fn().mockRejectedValue(error);

      await expect(handler.generateResponse(contentResult, analysisContext, testUrl))
        .rejects.toThrow('YouTube content analysis failed: API rate limit exceeded');
    });

    it('should log debug information for OpenAI calls', async () => {
      const testUrl = 'https://www.youtube.com/watch?v=wUrvXN-yiyo';
      const contentResult = {
        content: 'Test content',
        sourceInfo: 'Source info'
      };
      const analysisContext = {
        context: null,
        contextInfo: ''
      };
      const mockResponse = 'Test response';

      handler['callOpenAI'] = vi.fn().mockResolvedValue(mockResponse);

      await handler.generateResponse(contentResult, analysisContext, testUrl);

      expect(console.log).toHaveBeenCalledWith('🤖 [DEBUG] YoutubeResponseHandler.generateResponse() starting');
      expect(console.log).toHaveBeenCalledWith('🔍 [DEBUG] Calling OpenAI API...');
      expect(console.log).toHaveBeenCalledWith('✅ [DEBUG] YouTube response generation completed successfully');
    });
  });

  describe('Integration test with real URL structure', () => {
    it('should properly identify and structure response for the test URL', () => {
      const testUrl = 'https://www.youtube.com/watch?v=wUrvXN-yiyo';
      
      // Mock the service to return true for YouTube URL check
      mockYoutubeCaptionService.isYouTubeUrl = vi.fn().mockReturnValue(true);
      
      const canHandle = handler.canHandle(testUrl);
      expect(canHandle).toBe(true);
      expect(mockYoutubeCaptionService.isYouTubeUrl).toHaveBeenCalledWith(testUrl);

      // Verify debug logs are called with correct URL
      expect(console.log).toHaveBeenCalledWith(`   Query: ${testUrl}`);
    });
  });
});