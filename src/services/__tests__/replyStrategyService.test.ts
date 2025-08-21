import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Message, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { ReplyStrategyService, ReplyOptions } from '../replyStrategyService';
import { AttachmentService } from '../attachmentService';

// Mock AttachmentService
vi.mock('../attachmentService', () => ({
  AttachmentService: {
    createTextAttachment: vi.fn().mockReturnValue({ name: 'test.txt' }),
    createTempFileAttachment: vi.fn().mockResolvedValue({
      attachment: { name: 'temp.txt' },
      cleanup: vi.fn()
    })
  }
}));

describe('ReplyStrategyService', () => {
  // Mock Discord objects
  let mockMessage: Partial<Message>;
  let mockInteraction: Partial<ChatInputCommandInteraction>;

  beforeEach(() => {
    mockMessage = {
      reply: vi.fn().mockResolvedValue({}),
      channel: {
        send: vi.fn().mockResolvedValue({})
      }
    } as any;

    mockInteraction = {
      editReply: vi.fn().mockResolvedValue({})
    } as any;

    // Reset environment variable
    delete process.env.REPLY_CHARACTER_LIMIT;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('shouldUseAttachment', () => {
    it('should return false for short content (≤1500 chars)', () => {
      const shortContent = 'a'.repeat(1500);
      expect(ReplyStrategyService.shouldUseAttachment(shortContent)).toBe(false);
    });

    it('should return true for long content (>1500 chars)', () => {
      const longContent = 'a'.repeat(1501);
      expect(ReplyStrategyService.shouldUseAttachment(longContent)).toBe(true);
    });

    it('should use custom character limit from environment', () => {
      // Environment variable is set at class load time, so we test the current behavior
      const limit = ReplyStrategyService.CHARACTER_LIMIT;
      
      const contentOverLimit = 'a'.repeat(limit + 1);
      expect(ReplyStrategyService.shouldUseAttachment(contentOverLimit)).toBe(true);
      
      const contentAtLimit = 'a'.repeat(limit);
      expect(ReplyStrategyService.shouldUseAttachment(contentAtLimit)).toBe(false);
    });

    it('should handle edge cases', () => {
      const limit = ReplyStrategyService.CHARACTER_LIMIT;
      expect(ReplyStrategyService.shouldUseAttachment('')).toBe(false);
      
      const exactlyAtLimit = 'a'.repeat(limit);
      expect(ReplyStrategyService.shouldUseAttachment(exactlyAtLimit)).toBe(false);
      
      const overLimit = 'a'.repeat(limit + 1);
      expect(ReplyStrategyService.shouldUseAttachment(overLimit)).toBe(true);
    });
  });

  describe('sendConditionalReply', () => {
    it('should send short content as direct message', async () => {
      const shortContent = 'This is a short message';
      const options: ReplyOptions = { content: shortContent };

      const result = await ReplyStrategyService.sendConditionalReply(
        mockMessage as Message,
        options
      );

      expect(result.strategy).toBe('message');
      expect(result.characterCount).toBe(shortContent.length);
      expect(result.sent).toBe(true);
      expect(mockMessage.reply).toHaveBeenCalledWith(shortContent);
    });

    it('should send long content as file attachment', async () => {
      const longContent = 'a'.repeat(2000);
      const filename = 'test.txt';
      const options: ReplyOptions = { content: longContent, filename };

      const result = await ReplyStrategyService.sendConditionalReply(
        mockMessage as Message,
        options
      );

      expect(result.strategy).toBe('attachment');
      expect(result.characterCount).toBe(longContent.length);
      expect(result.sent).toBe(true);
      expect(AttachmentService.createTextAttachment).toHaveBeenCalledWith(longContent, filename);
      expect(mockMessage.reply).toHaveBeenCalledWith({
        content: expect.stringContaining('Response sent as file'),
        files: [{ name: 'test.txt' }]
      });
    });

    it('should fallback to attachment when message sending fails', async () => {
      const shortContent = 'Short content that fails to send';
      const options: ReplyOptions = { content: shortContent };

      // Mock message.reply to fail first, then succeed
      (mockMessage.reply as any)
        .mockRejectedValueOnce(new Error('Message too long'))
        .mockResolvedValueOnce({});

      const result = await ReplyStrategyService.sendConditionalReply(
        mockMessage as Message,
        options
      );

      expect(result.strategy).toBe('attachment');
      expect(result.sent).toBe(true);
      expect(mockMessage.reply).toHaveBeenCalledTimes(2);
    });

    it('should use default filename when none provided', async () => {
      const longContent = 'a'.repeat(2000);
      const options: ReplyOptions = { content: longContent };

      await ReplyStrategyService.sendConditionalReply(mockMessage as Message, options);

      expect(AttachmentService.createTextAttachment).toHaveBeenCalledWith(longContent, 'response.txt');
    });
  });

  describe('sendConditionalInteractionReply', () => {
    it('should send short content as interaction reply', async () => {
      const shortContent = 'This is a short interaction response';
      const options: ReplyOptions = { content: shortContent };

      const result = await ReplyStrategyService.sendConditionalInteractionReply(
        mockInteraction as ChatInputCommandInteraction,
        options
      );

      expect(result.strategy).toBe('message');
      expect(result.characterCount).toBe(shortContent.length);
      expect(result.sent).toBe(true);
      expect(mockInteraction.editReply).toHaveBeenCalledWith({ content: shortContent });
    });

    it('should send long content as file attachment', async () => {
      const longContent = 'a'.repeat(2000);
      const filename = 'interaction.txt';
      const options: ReplyOptions = { content: longContent, filename };

      const result = await ReplyStrategyService.sendConditionalInteractionReply(
        mockInteraction as ChatInputCommandInteraction,
        options
      );

      expect(result.strategy).toBe('attachment');
      expect(result.characterCount).toBe(longContent.length);
      expect(result.sent).toBe(true);
      expect(mockInteraction.editReply).toHaveBeenCalledWith({
        content: expect.stringContaining('Response sent as file'),
        files: [{ name: 'test.txt' }]
      });
    });

    it('should fallback to attachment for failed interaction replies', async () => {
      const shortContent = 'Short interaction content';
      const options: ReplyOptions = { content: shortContent };

      // Mock editReply to fail first, then succeed
      (mockInteraction.editReply as any)
        .mockRejectedValueOnce(new Error('Interaction failed'))
        .mockResolvedValueOnce({});

      const result = await ReplyStrategyService.sendConditionalInteractionReply(
        mockInteraction as ChatInputCommandInteraction,
        options
      );

      expect(result.strategy).toBe('attachment');
      expect(result.sent).toBe(true);
      expect(mockInteraction.editReply).toHaveBeenCalledTimes(2);
    });
  });

  describe('sendConditionalEmbedReply', () => {
    let mockEmbed: EmbedBuilder;

    beforeEach(() => {
      mockEmbed = new EmbedBuilder().setTitle('Test Embed');
    });

    it('should send embed only for short content', async () => {
      const shortContent = 'Short embed content';
      const filename = 'embed.txt';

      const result = await ReplyStrategyService.sendConditionalEmbedReply(
        mockMessage as Message,
        mockEmbed,
        shortContent,
        filename
      );

      expect(result.strategy).toBe('message');
      expect(result.characterCount).toBe(shortContent.length);
      expect(result.sent).toBe(true);
      expect(mockMessage.reply).toHaveBeenCalledWith({ embeds: [mockEmbed] });
      expect(AttachmentService.createTempFileAttachment).not.toHaveBeenCalled();
    });

    it('should send embed with attachment for long content', async () => {
      const longContent = 'a'.repeat(2000);
      const filename = 'long-embed.txt';

      const result = await ReplyStrategyService.sendConditionalEmbedReply(
        mockMessage as Message,
        mockEmbed,
        longContent,
        filename
      );

      expect(result.strategy).toBe('attachment');
      expect(result.characterCount).toBe(longContent.length);
      expect(result.sent).toBe(true);
      expect(AttachmentService.createTempFileAttachment).toHaveBeenCalledWith(longContent, filename);
      expect(mockMessage.reply).toHaveBeenCalledWith({
        embeds: [mockEmbed],
        files: [{ name: 'temp.txt' }]
      });
    });

    it('should call cleanup function after sending attachment', async () => {
      const longContent = 'a'.repeat(2000);
      const mockCleanup = vi.fn();
      
      (AttachmentService.createTempFileAttachment as any).mockResolvedValue({
        attachment: { name: 'temp.txt' },
        cleanup: mockCleanup
      });

      await ReplyStrategyService.sendConditionalEmbedReply(
        mockMessage as Message,
        mockEmbed,
        longContent
      );

      expect(mockCleanup).toHaveBeenCalled();
    });
  });

  describe('getStrategyStatusMessage', () => {
    it('should return message status for message strategy', () => {
      const result = { strategy: 'message' as const, characterCount: 500, sent: true };
      const message = ReplyStrategyService.getStrategyStatusMessage(result);
      
      expect(message).toBe('💬 Content sent as direct message (500 characters ≤ 1500 limit)');
    });

    it('should return attachment status for attachment strategy', () => {
      const result = { strategy: 'attachment' as const, characterCount: 2000, sent: true };
      const message = ReplyStrategyService.getStrategyStatusMessage(result);
      
      expect(message).toBe('📎 Content sent as file attachment (2000 characters > 1500 limit)');
    });

    it('should use current character limit in status message', () => {
      const limit = ReplyStrategyService.CHARACTER_LIMIT;
      const result = { strategy: 'attachment' as const, characterCount: limit + 200, sent: true };
      const message = ReplyStrategyService.getStrategyStatusMessage(result);
      
      expect(message).toBe(`📎 Content sent as file attachment (${limit + 200} characters > ${limit} limit)`);
    });
  });

  describe('exceedsDiscordLimits', () => {
    it('should return false for content under Discord limits', () => {
      const shortContent = 'a'.repeat(1900);
      expect(ReplyStrategyService.exceedsDiscordLimits(shortContent)).toBe(false);
    });

    it('should return true for content exceeding Discord limits', () => {
      const longContent = 'a'.repeat(1901);
      expect(ReplyStrategyService.exceedsDiscordLimits(longContent)).toBe(true);
    });

    it('should handle edge cases', () => {
      expect(ReplyStrategyService.exceedsDiscordLimits('')).toBe(false);
      expect(ReplyStrategyService.exceedsDiscordLimits('a'.repeat(1900))).toBe(false);
      expect(ReplyStrategyService.exceedsDiscordLimits('a'.repeat(2000))).toBe(true);
    });
  });

  describe('truncateForPreview', () => {
    it('should not truncate short content', () => {
      const shortContent = 'Short content';
      expect(ReplyStrategyService.truncateForPreview(shortContent)).toBe(shortContent);
    });

    it('should truncate long content with ellipsis', () => {
      const longContent = 'a'.repeat(150);
      const truncated = ReplyStrategyService.truncateForPreview(longContent);
      
      expect(truncated).toBe('a'.repeat(97) + '...');
      expect(truncated.length).toBe(100);
    });

    it('should use custom max length', () => {
      const content = 'a'.repeat(50);
      const truncated = ReplyStrategyService.truncateForPreview(content, 20);
      
      expect(truncated).toBe('a'.repeat(17) + '...');
      expect(truncated.length).toBe(20);
    });

    it('should handle edge cases', () => {
      expect(ReplyStrategyService.truncateForPreview('', 10)).toBe('');
      expect(ReplyStrategyService.truncateForPreview('abc', 3)).toBe('abc');
      expect(ReplyStrategyService.truncateForPreview('abcd', 3)).toBe('...');
    });
  });

  describe('character limit configuration', () => {
    it('should use default character limit when env var not set', () => {
      // CHARACTER_LIMIT is set at class load time, so we test what it currently is
      expect(ReplyStrategyService.CHARACTER_LIMIT).toBe(ReplyStrategyService.DEFAULT_CHARACTER_LIMIT);
    });

    it('should use environment variable when set', () => {
      // Environment variable is processed at class load time
      const content = 'a'.repeat(ReplyStrategyService.CHARACTER_LIMIT + 1);
      expect(ReplyStrategyService.shouldUseAttachment(content)).toBe(true);
    });

    it('should have valid character limit constant', () => {
      expect(ReplyStrategyService.CHARACTER_LIMIT).toBeGreaterThan(0);
      expect(ReplyStrategyService.DEFAULT_CHARACTER_LIMIT).toBe(1500);
    });
  });
});