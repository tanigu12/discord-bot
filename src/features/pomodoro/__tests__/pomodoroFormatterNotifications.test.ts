import { describe, it, expect, beforeEach } from 'vitest';
import { PomodoroFormatter } from '../pomodoroFormatter';
import { PhaseCompletionNotification } from '../types';

describe('PomodoroFormatter Auto-Notification Features', () => {
  let pomodoroFormatter: PomodoroFormatter;
  let mockUser: any;

  beforeEach(() => {
    pomodoroFormatter = new PomodoroFormatter();
    mockUser = {
      displayName: 'TestUser',
      username: 'testuser',
    };
  });

  describe('createPhaseCompletionEmbed', () => {
    it('should create work completion embed (short break)', () => {
      const notification: PhaseCompletionNotification = {
        userId: 'user123',
        channelId: 'channel123',
        threadId: 'thread123',
        previousPhase: 'work',
        nextPhase: 'short-break',
        completedPomodoros: 2,
        isSessionComplete: false,
      };

      const embed = pomodoroFormatter.createPhaseCompletionEmbed(mockUser, notification);

      expect(embed.data.title).toBe('🎉 Pomodoro #2 Complete!');
      expect(embed.data.description).toContain('Great work, TestUser!');
      expect(embed.data.description).toContain('short break');
      expect(embed.data.color).toBe(0x2ECC71); // Green for completion
      
      expect(embed.data.fields).toHaveLength(2);
      expect(embed.data.fields?.[0]).toMatchObject({
        name: '🍅 Completed Pomodoros',
        value: '2',
        inline: true,
      });
      expect(embed.data.fields?.[1]).toMatchObject({
        name: '⏱️ Next Phase',
        value: '☕ Short Break',
        inline: true,
      });
    });

    it('should create work completion embed (long break)', () => {
      const notification: PhaseCompletionNotification = {
        userId: 'user123',
        channelId: 'channel123',
        previousPhase: 'work',
        nextPhase: 'long-break',
        completedPomodoros: 4,
        isSessionComplete: false,
      };

      const embed = pomodoroFormatter.createPhaseCompletionEmbed(mockUser, notification);

      expect(embed.data.title).toBe('🎉 Pomodoro #4 Complete!');
      expect(embed.data.description).toContain('long break');
      expect(embed.data.fields?.[1]?.value).toBe('🛋️ Long Break');
    });

    it('should create break completion embed', () => {
      const notification: PhaseCompletionNotification = {
        userId: 'user123',
        channelId: 'channel123',
        previousPhase: 'short-break',
        nextPhase: 'work',
        completedPomodoros: 3,
        isSessionComplete: false,
      };

      const embed = pomodoroFormatter.createPhaseCompletionEmbed(mockUser, notification);

      expect(embed.data.title).toBe('🍅 Break\'s Over!');
      expect(embed.data.description).toContain('Ready to focus, TestUser?');
      expect(embed.data.description).toContain('next work session');
      expect(embed.data.color).toBe(0xFF6B6B); // Red/orange for work
      
      expect(embed.data.fields?.[1]?.value).toBe('🍅 Focus Time');
    });

    it('should add appropriate footer based on progress', () => {
      // Low progress (1 pomodoro)
      const lowProgressNotification: PhaseCompletionNotification = {
        userId: 'user123',
        channelId: 'channel123',
        previousPhase: 'work',
        nextPhase: 'short-break',
        completedPomodoros: 1,
        isSessionComplete: false,
      };

      const lowEmbed = pomodoroFormatter.createPhaseCompletionEmbed(mockUser, lowProgressNotification);
      expect(lowEmbed.data.footer?.text).toBe('🌱 Every session counts! Keep going!');

      // Medium progress (2 pomodoros)
      const mediumProgressNotification: PhaseCompletionNotification = {
        ...lowProgressNotification,
        completedPomodoros: 2,
      };

      const mediumEmbed = pomodoroFormatter.createPhaseCompletionEmbed(mockUser, mediumProgressNotification);
      expect(mediumEmbed.data.footer?.text).toBe('💪 Building momentum! You\'re doing great!');

      // High progress (4+ pomodoros)
      const highProgressNotification: PhaseCompletionNotification = {
        ...lowProgressNotification,
        completedPomodoros: 5,
      };

      const highEmbed = pomodoroFormatter.createPhaseCompletionEmbed(mockUser, highProgressNotification);
      expect(highEmbed.data.footer?.text).toBe('🔥 Amazing productivity streak! Keep it up!');
    });

    it('should include timestamp', () => {
      const notification: PhaseCompletionNotification = {
        userId: 'user123',
        channelId: 'channel123',
        previousPhase: 'work',
        nextPhase: 'short-break',
        completedPomodoros: 1,
        isSessionComplete: false,
      };

      const embed = pomodoroFormatter.createPhaseCompletionEmbed(mockUser, notification);
      expect(embed.data.timestamp).toBeTruthy();
    });
  });

  describe('createAutoTimerMessage', () => {
    it('should create work completion message for short break', () => {
      const notification: PhaseCompletionNotification = {
        userId: 'user123',
        channelId: 'channel123',
        previousPhase: 'work',
        nextPhase: 'short-break',
        completedPomodoros: 2,
        isSessionComplete: false,
      };

      const message = pomodoroFormatter.createAutoTimerMessage(notification);
      
      expect(message).toBe('🍅 **Pomodoro #2 completed!** Time for a short break. Great work! 🎉');
    });

    it('should create work completion message for long break', () => {
      const notification: PhaseCompletionNotification = {
        userId: 'user123',
        channelId: 'channel123',
        previousPhase: 'work',
        nextPhase: 'long-break',
        completedPomodoros: 4,
        isSessionComplete: false,
      };

      const message = pomodoroFormatter.createAutoTimerMessage(notification);
      
      expect(message).toBe('🍅 **Pomodoro #4 completed!** Time for a long break. Great work! 🎉');
    });

    it('should create break completion message', () => {
      const notification: PhaseCompletionNotification = {
        userId: 'user123',
        channelId: 'channel123',
        previousPhase: 'short-break',
        nextPhase: 'work',
        completedPomodoros: 3,
        isSessionComplete: false,
      };

      const message = pomodoroFormatter.createAutoTimerMessage(notification);
      
      expect(message).toBe('⏰ **Break time\'s up!** Ready to focus on your next work session? Let\'s go! 💪');
    });

    it('should handle long break completion', () => {
      const notification: PhaseCompletionNotification = {
        userId: 'user123',
        channelId: 'channel123',
        previousPhase: 'long-break',
        nextPhase: 'work',
        completedPomodoros: 4,
        isSessionComplete: false,
      };

      const message = pomodoroFormatter.createAutoTimerMessage(notification);
      
      expect(message).toBe('⏰ **Break time\'s up!** Ready to focus on your next work session? Let\'s go! 💪');
    });
  });

  describe('edge cases', () => {
    it('should handle zero completed pomodoros', () => {
      const notification: PhaseCompletionNotification = {
        userId: 'user123',
        channelId: 'channel123',
        previousPhase: 'work',
        nextPhase: 'short-break',
        completedPomodoros: 0,
        isSessionComplete: false,
      };

      const embed = pomodoroFormatter.createPhaseCompletionEmbed(mockUser, notification);
      expect(embed.data.title).toBe('🎉 Pomodoro #0 Complete!');
      expect(embed.data.footer?.text).toBe('🌱 Every session counts! Keep going!');
    });

    it('should handle very high pomodoro counts', () => {
      const notification: PhaseCompletionNotification = {
        userId: 'user123',
        channelId: 'channel123',
        previousPhase: 'work',
        nextPhase: 'short-break',
        completedPomodoros: 10,
        isSessionComplete: false,
      };

      const embed = pomodoroFormatter.createPhaseCompletionEmbed(mockUser, notification);
      expect(embed.data.title).toBe('🎉 Pomodoro #10 Complete!');
      expect(embed.data.footer?.text).toBe('🔥 Amazing productivity streak! Keep it up!');

      const message = pomodoroFormatter.createAutoTimerMessage(notification);
      expect(message).toContain('Pomodoro #10 completed');
    });

    it('should handle missing thread ID gracefully', () => {
      const notification: PhaseCompletionNotification = {
        userId: 'user123',
        channelId: 'channel123',
        threadId: undefined,
        previousPhase: 'work',
        nextPhase: 'short-break',
        completedPomodoros: 1,
        isSessionComplete: false,
      };

      const embed = pomodoroFormatter.createPhaseCompletionEmbed(mockUser, notification);
      expect(embed.data.title).toBeTruthy();
      expect(embed.data.description).toBeTruthy();
    });
  });
});