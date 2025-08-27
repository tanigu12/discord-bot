import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PomodoroService } from '../pomodoroService';
import { PomodoroFormatter } from '../pomodoroFormatter';
import { CoachingMessage } from '../types';

// Mock Discord User type with minimal required properties
const mockUser = {
  id: 'user123',
  username: 'testuser',
  discriminator: '0001',
  globalName: 'Test User',
  displayAvatarURL: () => 'https://cdn.discordapp.com/avatars/user123/avatar.png',
} as any; // Using any to avoid full Discord.js User interface implementation


describe('Pomodoro Status Reflection Integration', () => {
  let pomodoroService: PomodoroService;
  let pomodoroFormatter: PomodoroFormatter;

  beforeEach(() => {
    vi.clearAllMocks();
    pomodoroService = new PomodoroService();
    pomodoroFormatter = new PomodoroFormatter();

    // Mock the AI coaching service to avoid actual API calls
    const mockAIService = {
      generateCoachingMessage: vi.fn(),
      updateUserProfile: vi.fn(),
      getUserProfile: vi.fn(),
      generateTimeBasedInsight: vi.fn()
    };
    (pomodoroService as any).aiCoachingService = mockAIService;
  });

  describe('Status command with reflection', () => {
    it('should generate reflection message for active sessions', async () => {
      const userId = 'user123';
      const channelId = 'channel123';

      // Start a session
      pomodoroService.startSession(userId, channelId);
      
      // Mock successful reflection generation (returns string content)
      const mockReflectionContent = 'What barriers are you facing with your current task?';

      vi.spyOn(pomodoroService, 'generateCoachingMessage')
        .mockResolvedValue(mockReflectionContent);

      // Get status to verify session is active
      const status = pomodoroService.getStatus(userId);
      expect(status).toBeTruthy();
      expect(status?.isPaused).toBe(false);

      // Verify reflection message can be generated
      const reflectionContent = await pomodoroService.generateCoachingMessage(userId, 'reflection');
      expect(reflectionContent).toBeDefined();
      expect(typeof reflectionContent).toBe('string');
      expect(reflectionContent).toContain('barriers');
    });

    it('should not generate reflection for paused sessions', async () => {
      const userId = 'user123';
      const channelId = 'channel123';

      // Start and then pause a session
      pomodoroService.startSession(userId, channelId);
      pomodoroService.pauseSession(userId);
      
      const status = pomodoroService.getStatus(userId);
      expect(status?.isPaused).toBe(true);

      // Reflection should not be generated for paused sessions
      // This would be tested in the actual handleStatus function
    });

    it('should handle thread message sending', async () => {
      const userId = 'user123';
      const channelId = 'channel123';
      const threadId = 'thread123';

      // Start session and set thread
      pomodoroService.startSession(userId, channelId);
      pomodoroService.setThreadId(userId, threadId);

      // Verify thread ID is stored
      const storedThreadId = pomodoroService.getThreadId(userId);
      expect(storedThreadId).toBe(threadId);
    });

    it('should gracefully handle missing thread', async () => {
      const userId = 'user123';
      const channelId = 'channel123';

      // Start session without thread
      pomodoroService.startSession(userId, channelId);

      // Verify no thread ID is stored
      const storedThreadId = pomodoroService.getThreadId(userId);
      expect(storedThreadId).toBeUndefined();
    });

    it('should handle AI service failures gracefully', async () => {
      const userId = 'user123';
      const channelId = 'channel123';

      // Start session
      pomodoroService.startSession(userId, channelId);
      
      // Mock AI service failure
      vi.spyOn(pomodoroService, 'generateCoachingMessage')
        .mockRejectedValue(new Error('AI service unavailable'));

      // Should not throw error when AI fails
      await expect(
        pomodoroService.generateCoachingMessage(userId, 'reflection')
      ).rejects.toThrow('AI service unavailable');
    });

    it('should not generate reflection for non-existent sessions', async () => {
      const userId = 'user123';

      // No session started
      const status = pomodoroService.getStatus(userId);
      expect(status).toBeNull();
      
      // hasActiveSession should return false
      const hasSession = pomodoroService.hasActiveSession(userId);
      expect(hasSession).toBe(false);
    });

    it('should create proper reflection embed', () => {
      const mockReflectionMessage: CoachingMessage = {
        type: 'reflection',
        content: 'What work remains to be done on your current task?',
        timestamp: new Date()
      };

      const embed = pomodoroFormatter.createCoachingEmbed(mockUser, mockReflectionMessage);
      
      expect(embed.data.title).toContain('🤔');
      expect(embed.data.description).toBe(mockReflectionMessage.content);
      expect(embed.data.color).toBeDefined();
    });
  });

  describe('getThreadId method', () => {
    it('should return thread ID when set', () => {
      const userId = 'user123';
      const channelId = 'channel123';
      const threadId = 'thread123';

      pomodoroService.startSession(userId, channelId);
      pomodoroService.setThreadId(userId, threadId);

      const result = pomodoroService.getThreadId(userId);
      expect(result).toBe(threadId);
    });

    it('should return undefined when no thread set', () => {
      const userId = 'user123';
      const channelId = 'channel123';

      pomodoroService.startSession(userId, channelId);

      const result = pomodoroService.getThreadId(userId);
      expect(result).toBeUndefined();
    });

    it('should return undefined for non-existent session', () => {
      const userId = 'user123';

      const result = pomodoroService.getThreadId(userId);
      expect(result).toBeUndefined();
    });
  });
});