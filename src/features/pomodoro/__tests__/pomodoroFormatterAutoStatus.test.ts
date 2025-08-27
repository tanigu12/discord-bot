import { describe, it, expect, beforeEach } from 'vitest';
import { User, EmbedBuilder } from 'discord.js';
import { PomodoroFormatter } from '../pomodoroFormatter';
import { AutoStatusUpdate } from '../types';

describe('PomodoroFormatter Auto-Status Functionality', () => {
  let formatter: PomodoroFormatter;
  let mockUser: User;

  beforeEach(() => {
    formatter = new PomodoroFormatter();
    mockUser = {
      id: 'test-user-123',
      displayName: 'TestUser',
    } as User;
  });

  describe('createAutoStatusEmbed', () => {
    it('should create auto-status embed with basic information', () => {
      const now = new Date();
      const startTime = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago

      const autoStatusUpdate: AutoStatusUpdate = {
        userId: 'test-user-123',
        channelId: 'test-channel-456',
        status: {
          isActive: true,
          remainingTime: 15.5,
          phase: 'work',
          completedPomodoros: 2,
          isPaused: false,
        },
        sessionInfo: {
          startTime,
          currentPhase: 'work',
          nextPhaseIn: 15.5,
        },
        timestamp: now,
      };

      const embed = formatter.createAutoStatusEmbed(mockUser, autoStatusUpdate);

      expect(embed).toBeInstanceOf(EmbedBuilder);
      
      const embedData = embed.toJSON();
      expect(embedData.title).toContain('📊');
      expect(embedData.title).toContain('Auto Status Check');
      expect(embedData.description).toContain('TestUser');
      expect(embedData.color).toBe(0x95a5a6); // Gray color for auto-status
      expect(embedData.timestamp).toBe(now.toISOString());
    });

    it('should display correct phase information', () => {
      const autoStatusUpdate: AutoStatusUpdate = {
        userId: 'test-user-123',
        channelId: 'test-channel-456',
        status: {
          isActive: true,
          remainingTime: 3.2,
          phase: 'short-break',
          completedPomodoros: 1,
          isPaused: false,
        },
        sessionInfo: {
          startTime: new Date(),
          currentPhase: 'short-break',
          nextPhaseIn: 3.2,
        },
        timestamp: new Date(),
      };

      const embed = formatter.createAutoStatusEmbed(mockUser, autoStatusUpdate);
      const embedData = embed.toJSON();

      // Check that short break phase is displayed
      const phaseField = embedData.fields?.find(f => f.name === '🎯 Current Phase');
      expect(phaseField?.value).toContain('Short Break');
      expect(phaseField?.value).toContain('3.2 min remaining');
    });

    it('should display session statistics correctly', () => {
      const startTime = new Date(Date.now() - 45 * 60 * 1000); // 45 minutes ago

      const autoStatusUpdate: AutoStatusUpdate = {
        userId: 'test-user-123',
        channelId: 'test-channel-456',
        status: {
          isActive: true,
          remainingTime: 20.0,
          phase: 'work',
          completedPomodoros: 3,
          isPaused: false,
        },
        sessionInfo: {
          startTime,
          currentPhase: 'work',
          nextPhaseIn: 20.0,
        },
        timestamp: new Date(),
      };

      const embed = formatter.createAutoStatusEmbed(mockUser, autoStatusUpdate);
      const embedData = embed.toJSON();

      // Check pomodoros completed
      const completedField = embedData.fields?.find(f => f.name === '🍅 Completed');
      expect(completedField?.value).toBe('3 pomodoros');

      // Check session time
      const sessionTimeField = embedData.fields?.find(f => f.name === '⏰ Session Time');
      expect(sessionTimeField?.value).toBe('45 minutes');
    });

    it('should include logic check information when available', () => {
      const autoStatusUpdate: AutoStatusUpdate = {
        userId: 'test-user-123',
        channelId: 'test-channel-456',
        status: {
          isActive: true,
          remainingTime: 15.0,
          phase: 'work',
          completedPomodoros: 1,
          isPaused: false,
        },
        sessionInfo: {
          startTime: new Date(),
          currentPhase: 'work',
          nextPhaseIn: 15.0,
        },
        logicCheck: {
          timerAccuracy: 'accurate',
          sessionConsistency: true,
          diagnostics: ['Session running for 10 minutes', 'Current phase: work (15.0m remaining)'],
        },
        timestamp: new Date(),
      };

      const embed = formatter.createAutoStatusEmbed(mockUser, autoStatusUpdate);
      const embedData = embed.toJSON();

      // Check logic check field exists
      const logicCheckField = embedData.fields?.find(f => f.name === '🔍 Logic Check');
      expect(logicCheckField).toBeDefined();
      expect(logicCheckField?.value).toContain('✅ Timer: accurate');
      expect(logicCheckField?.value).toContain('✅ Consistency: Good');
    });

    it('should show warnings for timer drift', () => {
      const autoStatusUpdate: AutoStatusUpdate = {
        userId: 'test-user-123',
        channelId: 'test-channel-456',
        status: {
          isActive: true,
          remainingTime: 15.0,
          phase: 'work',
          completedPomodoros: 1,
          isPaused: false,
        },
        sessionInfo: {
          startTime: new Date(),
          currentPhase: 'work',
          nextPhaseIn: 15.0,
        },
        logicCheck: {
          timerAccuracy: 'drift',
          sessionConsistency: true,
          diagnostics: ['Timer drift detected: 2.3 minutes difference'],
        },
        timestamp: new Date(),
      };

      const embed = formatter.createAutoStatusEmbed(mockUser, autoStatusUpdate);
      const embedData = embed.toJSON();

      const logicCheckField = embedData.fields?.find(f => f.name === '🔍 Logic Check');
      expect(logicCheckField?.value).toContain('⚠️ Timer: drift');
      expect(logicCheckField?.value).toContain('✅ Consistency: Good');
    });

    it('should show errors for timer and consistency issues', () => {
      const autoStatusUpdate: AutoStatusUpdate = {
        userId: 'test-user-123',
        channelId: 'test-channel-456',
        status: {
          isActive: true,
          remainingTime: 15.0,
          phase: 'work',
          completedPomodoros: 1,
          isPaused: false,
        },
        sessionInfo: {
          startTime: new Date(),
          currentPhase: 'work',
          nextPhaseIn: 15.0,
        },
        logicCheck: {
          timerAccuracy: 'error',
          sessionConsistency: false,
          diagnostics: [
            'Timer drift detected: 8.5 minutes difference',
            'Phase mismatch: status=work, session=break',
            'Session marked as paused but status shows active',
          ],
        },
        timestamp: new Date(),
      };

      const embed = formatter.createAutoStatusEmbed(mockUser, autoStatusUpdate);
      const embedData = embed.toJSON();

      const logicCheckField = embedData.fields?.find(f => f.name === '🔍 Logic Check');
      expect(logicCheckField?.value).toContain('❌ Timer: error');
      expect(logicCheckField?.value).toContain('❌ Consistency: Issues detected');

      // Should include diagnostics for errors
      const diagnosticsField = embedData.fields?.find(f => f.name === '🔧 Diagnostics');
      expect(diagnosticsField).toBeDefined();
      expect(diagnosticsField?.value).toContain('Timer drift detected');
      expect(diagnosticsField?.value).toContain('Phase mismatch');
    });

    it('should limit diagnostics to prevent spam', () => {
      const manyDiagnostics = [
        'Diagnostic 1',
        'Diagnostic 2',
        'Diagnostic 3',
        'Diagnostic 4',
        'Diagnostic 5',
        'Diagnostic 6',
      ];

      const autoStatusUpdate: AutoStatusUpdate = {
        userId: 'test-user-123',
        channelId: 'test-channel-456',
        status: {
          isActive: true,
          remainingTime: 15.0,
          phase: 'work',
          completedPomodoros: 1,
          isPaused: false,
        },
        sessionInfo: {
          startTime: new Date(),
          currentPhase: 'work',
          nextPhaseIn: 15.0,
        },
        logicCheck: {
          timerAccuracy: 'error',
          sessionConsistency: false,
          diagnostics: manyDiagnostics,
        },
        timestamp: new Date(),
      };

      const embed = formatter.createAutoStatusEmbed(mockUser, autoStatusUpdate);
      const embedData = embed.toJSON();

      const diagnosticsField = embedData.fields?.find(f => f.name === '🔧 Diagnostics');
      const diagnosticsContent = diagnosticsField?.value || '';
      
      // Should only show first 3 diagnostics
      expect(diagnosticsContent.split('\n').length).toBe(3);
      expect(diagnosticsContent).toContain('Diagnostic 1');
      expect(diagnosticsContent).toContain('Diagnostic 2');
      expect(diagnosticsContent).toContain('Diagnostic 3');
      expect(diagnosticsContent).not.toContain('Diagnostic 4');
    });

    it('should not show diagnostics for good sessions', () => {
      const autoStatusUpdate: AutoStatusUpdate = {
        userId: 'test-user-123',
        channelId: 'test-channel-456',
        status: {
          isActive: true,
          remainingTime: 15.0,
          phase: 'work',
          completedPomodoros: 1,
          isPaused: false,
        },
        sessionInfo: {
          startTime: new Date(),
          currentPhase: 'work',
          nextPhaseIn: 15.0,
        },
        logicCheck: {
          timerAccuracy: 'accurate',
          sessionConsistency: true,
          diagnostics: ['Session running for 10 minutes', 'Current phase: work (15.0m remaining)'],
        },
        timestamp: new Date(),
      };

      const embed = formatter.createAutoStatusEmbed(mockUser, autoStatusUpdate);
      const embedData = embed.toJSON();

      // Should not show diagnostics field for healthy sessions
      const diagnosticsField = embedData.fields?.find(f => f.name === '🔧 Diagnostics');
      expect(diagnosticsField).toBeUndefined();
    });

    it('should work without logic checking', () => {
      const autoStatusUpdate: AutoStatusUpdate = {
        userId: 'test-user-123',
        channelId: 'test-channel-456',
        status: {
          isActive: true,
          remainingTime: 15.0,
          phase: 'work',
          completedPomodoros: 1,
          isPaused: false,
        },
        sessionInfo: {
          startTime: new Date(),
          currentPhase: 'work',
          nextPhaseIn: 15.0,
        },
        timestamp: new Date(),
      };

      const embed = formatter.createAutoStatusEmbed(mockUser, autoStatusUpdate);
      const embedData = embed.toJSON();

      // Should not have logic check field
      const logicCheckField = embedData.fields?.find(f => f.name === '🔍 Logic Check');
      expect(logicCheckField).toBeUndefined();

      // Should still have basic fields
      expect(embedData.fields?.length).toBe(3); // Phase, Completed, Session Time
    });
  });
});