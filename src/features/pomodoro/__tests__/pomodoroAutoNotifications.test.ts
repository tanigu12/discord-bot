import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PomodoroService } from '../pomodoroService';
import { PhaseCompletionNotification } from '../types';

// Mock the AICoachingService
vi.mock('../aiCoachingService', () => ({
  AICoachingService: vi.fn().mockImplementation(() => ({
    generateCoachingMessage: vi.fn().mockResolvedValue('Test coaching message'),
    updateUserProfile: vi.fn(),
    getUserProfile: vi.fn().mockReturnValue({
      userId: 'test-user',
      preferredCoachingStyle: 'encouraging',
      goals: [],
      motivationalKeywords: [],
    }),
    generateTimeBasedInsight: vi.fn().mockReturnValue('Test insight'),
  })),
}));

describe('Pomodoro Auto-Notifications', () => {
  let pomodoroService: PomodoroService;
  let mockDiscordCallback: any;

  beforeEach(() => {
    vi.useFakeTimers();
    pomodoroService = new PomodoroService();
    mockDiscordCallback = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Discord notification callbacks', () => {
    it('should set and remove Discord notification callbacks', () => {
      pomodoroService.setDiscordNotificationCallback('user1', mockDiscordCallback);
      expect((pomodoroService as any).discordNotificationCallbacks.has('user1')).toBe(true);

      pomodoroService.removeDiscordNotificationCallback('user1');
      expect((pomodoroService as any).discordNotificationCallbacks.has('user1')).toBe(false);
    });

    it('should call Discord callback when phase completes manually', async () => {
      pomodoroService.startSession('user1', 'channel1');
      pomodoroService.setDiscordNotificationCallback('user1', mockDiscordCallback);
      
      // Access private method for testing
      const session = (pomodoroService as any).sessions.get('user1');
      await (pomodoroService as any).sendPhaseCompletionNotification(
        'user1', 
        'work', 
        'short-break', 
        session
      );

      expect(mockDiscordCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user1',
          channelId: 'channel1',
          previousPhase: 'work',
          nextPhase: 'short-break',
          completedPomodoros: expect.any(Number),
          isSessionComplete: false,
        })
      );
    });

    it('should handle errors gracefully in Discord notifications', async () => {
      const errorCallback = vi.fn().mockRejectedValue(new Error('Discord API error'));
      pomodoroService.startSession('user1', 'channel1');
      pomodoroService.setDiscordNotificationCallback('user1', errorCallback);
      
      const session = (pomodoroService as any).sessions.get('user1');
      
      // Should not throw error
      await expect((pomodoroService as any).sendPhaseCompletionNotification(
        'user1', 
        'work', 
        'short-break', 
        session
      )).resolves.not.toThrow();

      expect(errorCallback).toHaveBeenCalled();
    });

    it('should not call callback if no callback is registered', async () => {
      pomodoroService.startSession('user1', 'channel1');
      
      const session = (pomodoroService as any).sessions.get('user1');
      
      // Should not throw error when no callback is registered
      await expect((pomodoroService as any).sendPhaseCompletionNotification(
        'user1', 
        'work', 
        'short-break', 
        session
      )).resolves.not.toThrow();
    });
  });

  describe('notification content', () => {
    it('should create work completion notification', async () => {
      pomodoroService.startSession('user1', 'channel1');
      pomodoroService.setDiscordNotificationCallback('user1', mockDiscordCallback);
      
      const session = (pomodoroService as any).sessions.get('user1');
      session.completedPomodoros = 3;
      
      await (pomodoroService as any).sendPhaseCompletionNotification(
        'user1', 
        'work', 
        'short-break', 
        session
      );

      const notification: PhaseCompletionNotification = mockDiscordCallback.mock.calls[0][0];
      expect(notification.previousPhase).toBe('work');
      expect(notification.nextPhase).toBe('short-break');
      expect(notification.completedPomodoros).toBe(3);
      expect(notification.channelId).toBe('channel1');
      expect(notification.userId).toBe('user1');
    });

    it('should create break completion notification', async () => {
      pomodoroService.startSession('user1', 'channel1');
      pomodoroService.setDiscordNotificationCallback('user1', mockDiscordCallback);
      
      const session = (pomodoroService as any).sessions.get('user1');
      session.phase = 'short-break';
      session.completedPomodoros = 2;
      
      await (pomodoroService as any).sendPhaseCompletionNotification(
        'user1', 
        'short-break', 
        'work', 
        session
      );

      const notification: PhaseCompletionNotification = mockDiscordCallback.mock.calls[0][0];
      expect(notification.previousPhase).toBe('short-break');
      expect(notification.nextPhase).toBe('work');
      expect(notification.completedPomodoros).toBe(2);
    });

    it('should include thread ID when available', async () => {
      pomodoroService.startSession('user1', 'channel1');
      pomodoroService.setThreadId('user1', 'thread123');
      pomodoroService.setDiscordNotificationCallback('user1', mockDiscordCallback);
      
      const session = (pomodoroService as any).sessions.get('user1');
      
      await (pomodoroService as any).sendPhaseCompletionNotification(
        'user1', 
        'work', 
        'short-break', 
        session
      );

      const notification: PhaseCompletionNotification = mockDiscordCallback.mock.calls[0][0];
      expect(notification.threadId).toBe('thread123');
    });
  });

  describe('session lifecycle', () => {
    it('should remove Discord notification callback when session ends', () => {
      pomodoroService.startSession('user1', 'channel1');
      pomodoroService.setDiscordNotificationCallback('user1', mockDiscordCallback);

      expect((pomodoroService as any).discordNotificationCallbacks.has('user1')).toBe(true);

      pomodoroService.stopSession('user1');

      expect((pomodoroService as any).discordNotificationCallbacks.has('user1')).toBe(false);
    });
  });

  describe('phase transitions', () => {
    it('should generate correct notification for work to short break transition', async () => {
      pomodoroService.startSession('user1', 'channel1', { workDuration: 1 });
      pomodoroService.setDiscordNotificationCallback('user1', mockDiscordCallback);
      
      const session = (pomodoroService as any).sessions.get('user1');
      session.completedPomodoros = 1;
      
      await (pomodoroService as any).sendPhaseCompletionNotification(
        'user1', 
        'work', 
        'short-break', 
        session
      );

      expect(mockDiscordCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          previousPhase: 'work',
          nextPhase: 'short-break',
          completedPomodoros: 1,
        })
      );
    });

    it('should generate correct notification for work to long break transition', async () => {
      pomodoroService.startSession('user1', 'channel1');
      pomodoroService.setDiscordNotificationCallback('user1', mockDiscordCallback);
      
      const session = (pomodoroService as any).sessions.get('user1');
      session.completedPomodoros = 4; // Should trigger long break
      
      await (pomodoroService as any).sendPhaseCompletionNotification(
        'user1', 
        'work', 
        'long-break', 
        session
      );

      expect(mockDiscordCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          previousPhase: 'work',
          nextPhase: 'long-break',
          completedPomodoros: 4,
        })
      );
    });

    it('should generate correct notification for break to work transition', async () => {
      pomodoroService.startSession('user1', 'channel1');
      pomodoroService.setDiscordNotificationCallback('user1', mockDiscordCallback);
      
      const session = (pomodoroService as any).sessions.get('user1');
      session.phase = 'short-break';
      session.completedPomodoros = 2;
      
      await (pomodoroService as any).sendPhaseCompletionNotification(
        'user1', 
        'short-break', 
        'work', 
        session
      );

      expect(mockDiscordCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          previousPhase: 'short-break',
          nextPhase: 'work',
          completedPomodoros: 2,
        })
      );
    });
  });
});