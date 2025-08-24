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

// Mock youtube-dl-exec
vi.mock('youtube-dl-exec', () => ({
  default: vi.fn()
}));

// Mock fs promises
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    unlink: vi.fn(),
    access: vi.fn(),
    stat: vi.fn(),
    readdir: vi.fn()
  }
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

    it('should successfully analyze video using audio extraction (simplified test)', async () => {
      const testUrl = 'https://www.youtube.com/watch?v=wUrvXN-yiyo';
      const testPrompt = 'Test analysis prompt';
      const mockResponseText = 'Analyzed audio content response';

      // Mock the downloadAudio method to return a success
      const mockDownloadAudio = vi.spyOn(service as any, 'downloadAudio').mockResolvedValue({
        audioPath: '/tmp/test_audio.m4a',
        videoId: 'wUrvXN-yiyo'
      });

      // Mock fs.readFile to return audio buffer
      const fs = await import('fs');
      vi.mocked(fs.promises.readFile).mockResolvedValue(Buffer.from('mock-audio-data'));

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

      // Mock cleanupAudioFile
      const mockCleanup = vi.spyOn(service as any, 'cleanupAudioFile').mockResolvedValue(undefined);

      const result = await service.analyzeVideo(testUrl, testPrompt);

      expect(result.status).toBe('success');
      expect(result.summary).toBe(mockResponseText);

      // Verify mocked methods were called
      expect(mockDownloadAudio).toHaveBeenCalledWith(testUrl);
      expect(mockCleanup).toHaveBeenCalledWith('/tmp/test_audio.m4a');
      expect(mockModel.generateContent).toHaveBeenCalled();
    });

    it('should handle audio download errors with detailed logging', async () => {
      const testUrl = 'https://www.youtube.com/watch?v=wUrvXN-yiyo';
      const testPrompt = 'Test prompt';
      const downloadError = new Error('youtube-dl-exec failed');

      // Mock youtube-dl-exec to throw an error
      const youtubedl = await import('youtube-dl-exec');
      vi.mocked(youtubedl.default).mockRejectedValue(downloadError);

      const result = await service.analyzeVideo(testUrl, testPrompt);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Audio analysis failed: Failed to download audio');

      // Check error logging
      expect(console.error).toHaveBeenCalledWith('❌ [DEBUG] Error analyzing video:');
      expect(console.error).toHaveBeenCalledWith(`   Error type: ${downloadError.constructor.name}`);
    });
  });

  describe('getTranscriptFromVideo', () => {
    it('should call analyzeVideo with enhanced audio-based analysis prompt', async () => {
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
          'Extract the most accurate and complete transcription from this audio file (extracted from YouTube)'
        )
      );
      expect(analyzeVideoSpy).toHaveBeenCalledWith(
        testUrl,
        expect.stringContaining(
          'Process ONLY the first 30 minutes of content - stop processing after 30:00'
        )
      );
      expect(analyzeVideoSpy).toHaveBeenCalledWith(
        testUrl,
        expect.stringContaining(
          'Audio Processing: Analyzing first 30 minutes of video content with timestamp markers'
        )
      );

      // Check debug logging
      expect(console.log).toHaveBeenCalledWith(
        '🔍 [DEBUG] YoutubeCaptionService.getTranscriptFromVideo() starting'
      );
      expect(console.log).toHaveBeenCalledWith(
        '🔍 [DEBUG] Enhanced prompt created for first 30 minutes audio-based analysis'
      );
    });

    it('should include audio transcription sections in prompt', async () => {
      const testUrl = 'https://www.youtube.com/watch?v=wUrvXN-yiyo';

      const analyzeVideoSpy = vi.spyOn(service, 'analyzeVideo').mockResolvedValue({
        status: 'success',
        summary: 'Test response',
      });

      await service.getTranscriptFromVideo(testUrl);

      const [, prompt] = analyzeVideoSpy.mock.calls[0];
      expect(prompt).toContain('## 📝 Complete Audio Transcription');
      expect(prompt).toContain('## 📊 Video Analysis Summary');
      expect(prompt).toContain('Only the first 30 minutes were analyzed for optimal processing efficiency');
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
