import { describe, it, expect, beforeEach, vi } from 'vitest';
import { YouTubeAnalysisService } from '../youtubeAnalysisService';
import type { Message } from 'discord.js';

// Mock the YoutubeCaptionService
const mockYoutubeCaptionService = {
  isYouTubeUrl: vi.fn(),
  getTranscriptFromVideo: vi.fn(),
};

// Mock dependencies
vi.mock('../../youtube-caption/youtubeCaptionService', () => ({
  YoutubeCaptionService: vi.fn(() => mockYoutubeCaptionService),
}));

vi.mock('../../../services/replyStrategyService', () => ({
  ReplyStrategyService: {
    sendConditionalReply: vi.fn(),
  },
}));

vi.mock('../../../utils/textAggregator', () => ({
  TextAggregator: {
    aggregateSearchResults: vi.fn(),
    generateFileName: vi.fn(),
  },
}));

// Mock Discord.js Message
const createMockMessage = (): Partial<Message> =>
  ({
    content: 'Test content',
    channel: {
      type: 0,
      name: 'test-channel',
      send: vi.fn().mockResolvedValue({}),
    } as any,
    reply: vi.fn().mockResolvedValue({}),
    valueOf: () => 'mock-message',
  }) as any;

describe('YouTubeAnalysisService', () => {
  let service: YouTubeAnalysisService;
  let mockMessage: Partial<Message>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new YouTubeAnalysisService();
    mockMessage = createMockMessage();
  });

  describe('isYouTubeUrl', () => {
    it('should detect valid YouTube URLs', () => {
      const urls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtube.com/watch?v=dQw4w9WgXcQ',
      ];

      // Mock the caption service to return true
      mockYoutubeCaptionService.isYouTubeUrl.mockReturnValue(true);

      urls.forEach(url => {
        expect(service.isYouTubeUrl(url)).toBe(true);
        expect(mockYoutubeCaptionService.isYouTubeUrl).toHaveBeenCalledWith(url);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'https://www.google.com',
        'https://vimeo.com/123456789',
        'not a url',
        '',
      ];

      // Mock the caption service to return false
      mockYoutubeCaptionService.isYouTubeUrl.mockReturnValue(false);

      invalidUrls.forEach(url => {
        expect(service.isYouTubeUrl(url)).toBe(false);
        expect(mockYoutubeCaptionService.isYouTubeUrl).toHaveBeenCalledWith(url);
      });
    });
  });

  describe('extractYouTubeUrl', () => {
    it('should extract YouTube URL from text content', () => {
      const content = 'Check out this video: https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const result = service.extractYouTubeUrl(content);
      expect(result).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    });

    it('should extract youtu.be URL from text content', () => {
      const content = 'Short link: https://youtu.be/dQw4w9WgXcQ';
      const result = service.extractYouTubeUrl(content);
      expect(result).toBe('https://youtu.be/dQw4w9WgXcQ');
    });

    it('should return null when no YouTube URL found', () => {
      const content = 'This is just regular text without any video links';
      const result = service.extractYouTubeUrl(content);
      expect(result).toBeNull();
    });

    it('should return first YouTube URL when multiple exist', () => {
      const content = 'First: https://youtu.be/first Second: https://youtu.be/second';
      const result = service.extractYouTubeUrl(content);
      expect(result).toBe('https://youtu.be/first');
    });
  });

  describe('getTranscriptImmediate', () => {
    it('should return error for invalid YouTube URL', async () => {
      // Mock isYouTubeUrl to return false
      mockYoutubeCaptionService.isYouTubeUrl.mockReturnValue(false);

      const result = await service.getTranscriptImmediate('https://www.google.com');

      expect(result.status).toBe('error');
      expect(result.error).toBe('Invalid YouTube URL provided');
      expect(result.transcript).toBeUndefined();
    });

    it('should return success result with transcript', async () => {
      // Mock isYouTubeUrl to return true
      mockYoutubeCaptionService.isYouTubeUrl.mockReturnValue(true);

      // Mock getTranscriptFromVideo to return success
      mockYoutubeCaptionService.getTranscriptFromVideo.mockResolvedValue({
        status: 'success',
        summary: 'Mock transcript content',
      });

      const result = await service.getTranscriptImmediate(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      );

      expect(result.status).toBe('success');
      expect(result.transcript).toBe('Mock transcript content');
      expect(result.videoId).toBe('dQw4w9WgXcQ');
      expect(mockYoutubeCaptionService.getTranscriptFromVideo).toHaveBeenCalledWith(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      );
    });

    it('should handle transcript extraction failure', async () => {
      // Mock isYouTubeUrl to return true
      mockYoutubeCaptionService.isYouTubeUrl.mockReturnValue(true);

      // Mock getTranscriptFromVideo to return error
      mockYoutubeCaptionService.getTranscriptFromVideo.mockResolvedValue({
        status: 'error',
        error: 'Video unavailable',
      });

      const result = await service.getTranscriptImmediate(
        'https://www.youtube.com/watch?v=invalid'
      );

      expect(result.status).toBe('error');
      expect(result.error).toBe('Video unavailable');
    });

    it('should handle service exceptions', async () => {
      // Mock isYouTubeUrl to return true
      mockYoutubeCaptionService.isYouTubeUrl.mockReturnValue(true);

      // Mock getTranscriptFromVideo to throw error
      mockYoutubeCaptionService.getTranscriptFromVideo.mockRejectedValue(
        new Error('Service error')
      );

      const result = await service.getTranscriptImmediate('https://www.youtube.com/watch?v=test');

      expect(result.status).toBe('error');
      expect(result.error).toContain('Service error');
    });
  });

  describe('sendTranscriptToDiscord', () => {
    it('should send error message when transcript extraction failed', async () => {
      const transcriptResult = {
        status: 'error' as const,
        error: 'Failed to extract transcript',
      };

      // Mock ReplyStrategyService
      const { ReplyStrategyService } = await import('../../../services/replyStrategyService');
      const sendConditionalReplySpy = vi
        .spyOn(ReplyStrategyService, 'sendConditionalReply')
        .mockResolvedValue({ strategy: 'message', characterCount: 100, sent: true });

      await service.sendTranscriptToDiscord(
        mockMessage as Message,
        transcriptResult,
        'https://youtu.be/test'
      );

      expect(sendConditionalReplySpy).toHaveBeenCalledWith(
        mockMessage,
        expect.objectContaining({
          content: expect.stringContaining('YouTube Analysis Failed'),
          filename: 'youtube-error.txt',
        })
      );
    });

    it('should send transcript content when extraction succeeded', async () => {
      const transcriptResult = {
        status: 'success' as const,
        transcript: 'Mock transcript content',
        videoId: 'dQw4w9WgXcQ',
      };

      // Mock services
      const { ReplyStrategyService } = await import('../../../services/replyStrategyService');
      const { TextAggregator } = await import('../../../utils/textAggregator');

      const sendConditionalReplySpy = vi
        .spyOn(ReplyStrategyService, 'sendConditionalReply')
        .mockResolvedValue({ strategy: 'message', characterCount: 100, sent: true });

      const aggregateResultsSpy = vi
        .spyOn(TextAggregator, 'aggregateSearchResults')
        .mockReturnValue('Aggregated content');

      vi.spyOn(TextAggregator, 'generateFileName').mockReturnValue('youtube-transcript-test.txt');

      await service.sendTranscriptToDiscord(
        mockMessage as Message,
        transcriptResult,
        'https://youtu.be/test'
      );

      expect(aggregateResultsSpy).toHaveBeenCalledWith(
        'https://youtu.be/test',
        'Mock transcript content',
        'YouTube video transcript extracted immediately',
        'YouTubeAnalysisService'
      );

      expect(sendConditionalReplySpy).toHaveBeenCalledWith(
        mockMessage,
        expect.objectContaining({
          content: expect.stringContaining('Aggregated content'),
          filename: 'youtube-transcript-test.txt',
        })
      );

      // Should send status message
      expect((mockMessage.channel as any)?.send).toHaveBeenCalledWith(
        'ℹ️ Transcript extracted immediately | 🤖 Generating summary...'
      );
    });

    it('should handle missing transcript content', async () => {
      const transcriptResult = {
        status: 'success' as const,
        videoId: 'test',
        // transcript is undefined
      };

      await expect(
        service.sendTranscriptToDiscord(
          mockMessage as Message,
          transcriptResult,
          'https://youtu.be/test'
        )
      ).resolves.not.toThrow();

      // Should send error reply
      expect(mockMessage.reply).toHaveBeenCalledWith(
        expect.stringContaining('Failed to process YouTube video')
      );
    });
  });

  describe('generateSummaryAsync', () => {
    it('should generate AI summary from transcript', async () => {
      // Mock callOpenAI method
      const mockCallOpenAI = vi.fn().mockResolvedValue('Generated summary content');
      (service as any).callOpenAI = mockCallOpenAI;

      const transcript = 'Mock transcript for analysis';
      const url = 'https://www.youtube.com/watch?v=test';

      const result = await service.generateSummaryAsync(transcript, url);

      expect(result).toBe('Generated summary content');
      expect(mockCallOpenAI).toHaveBeenCalledWith(
        expect.stringContaining('specialized English tutor'),
        expect.stringContaining('Mock transcript for analysis'),
        expect.objectContaining({
          maxCompletionTokens: 10000,
        })
      );
    });

    it('should throw error when AI returns empty response', async () => {
      const mockCallOpenAI = vi.fn().mockResolvedValue('');
      (service as any).callOpenAI = mockCallOpenAI;

      await expect(
        service.generateSummaryAsync('transcript', 'https://youtu.be/test')
      ).rejects.toThrow('AI service returned empty response');
    });

    it('should handle AI service errors', async () => {
      const mockCallOpenAI = vi.fn().mockRejectedValue(new Error('OpenAI API error'));
      (service as any).callOpenAI = mockCallOpenAI;

      await expect(
        service.generateSummaryAsync('transcript', 'https://youtu.be/test')
      ).rejects.toThrow('OpenAI API error');
    });
  });

  describe('processYouTubeUrl', () => {
    it('should complete three-phase processing successfully', async () => {
      // Mock transcript extraction
      const mockGetTranscript = vi.spyOn(service, 'getTranscriptImmediate').mockResolvedValue({
        status: 'success',
        transcript: 'Mock transcript',
        videoId: 'test123',
      });

      // Mock Discord sending
      const mockSendToDiscord = vi.spyOn(service, 'sendTranscriptToDiscord').mockResolvedValue();

      const url = 'https://www.youtube.com/watch?v=test123';
      const result = await service.processYouTubeUrl(mockMessage as Message, url, true);

      expect(result.status).toBe('success');
      expect(result.transcript).toBe('Mock transcript');
      expect(result.videoId).toBe('test123');
      expect(result.sourceUrl).toBe(url);

      expect(mockGetTranscript).toHaveBeenCalledWith(url);
      expect(mockSendToDiscord).toHaveBeenCalledWith(
        mockMessage,
        expect.objectContaining({ status: 'success' }),
        url
      );
    });

    it('should handle transcript extraction failure', async () => {
      vi.spyOn(service, 'getTranscriptImmediate').mockResolvedValue({
        status: 'error',
        error: 'Extraction failed',
      });

      const mockSendToDiscord = vi.spyOn(service, 'sendTranscriptToDiscord').mockResolvedValue();

      const result = await service.processYouTubeUrl(
        mockMessage as Message,
        'https://youtu.be/test'
      );

      expect(result.status).toBe('error');
      expect(result.error).toBe('Extraction failed');
      expect(mockSendToDiscord).toHaveBeenCalledWith(
        mockMessage,
        expect.objectContaining({ status: 'error' }),
        'https://youtu.be/test'
      );
    });

    it('should skip summary generation when disabled', async () => {
      vi.spyOn(service, 'getTranscriptImmediate').mockResolvedValue({
        status: 'success',
        transcript: 'Mock transcript',
        videoId: 'test123',
      });

      vi.spyOn(service, 'sendTranscriptToDiscord').mockResolvedValue();

      const result = await service.processYouTubeUrl(
        mockMessage as Message,
        'https://youtu.be/test',
        false // shouldGenerateSummary = false
      );

      expect(result.status).toBe('success');
      // Summary generation should be skipped, so no additional async calls
    });

    it('should handle processing exceptions', async () => {
      vi.spyOn(service, 'getTranscriptImmediate').mockRejectedValue(new Error('Processing error'));

      const result = await service.processYouTubeUrl(
        mockMessage as Message,
        'https://youtu.be/test'
      );

      expect(result.status).toBe('error');
      expect(result.error).toContain('Processing error');
      expect(mockMessage.reply).toHaveBeenCalledWith(
        expect.stringContaining('YouTube processing failed')
      );
    });
  });

  describe('extractVideoId', () => {
    it('should extract video ID from standard YouTube URL', () => {
      const videoId = (service as any).extractVideoId(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      );
      expect(videoId).toBe('dQw4w9WgXcQ');
    });

    it('should extract video ID from youtu.be URL', () => {
      const videoId = (service as any).extractVideoId('https://youtu.be/dQw4w9WgXcQ');
      expect(videoId).toBe('dQw4w9WgXcQ');
    });

    it('should return "unknown" for invalid URLs', () => {
      const videoId = (service as any).extractVideoId('not a url');
      expect(videoId).toBe('unknown');
    });

    it('should return "unknown" for non-YouTube URLs', () => {
      const videoId = (service as any).extractVideoId('https://www.google.com');
      expect(videoId).toBe('unknown');
    });
  });
});
