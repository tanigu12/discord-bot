import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PomodoroService } from '../pomodoroService';

describe('PomodoroService', () => {
  let service: PomodoroService;
  const userId = 'test-user-123';
  const channelId = 'test-channel-456';

  beforeEach(() => {
    service = new PomodoroService();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('startSession', () => {
    it('should start a new session with default config', () => {
      const started = service.startSession(userId, channelId);
      
      expect(started).toBe(true);
      expect(service.hasActiveSession(userId)).toBe(true);

      const status = service.getStatus(userId);
      expect(status).toBeDefined();
      expect(status?.phase).toBe('work');
      expect(status?.completedPomodoros).toBe(0);
      expect(status?.isActive).toBe(true);
    });

    it('should start a new session with custom config', () => {
      const config = { workDuration: 30, shortBreakDuration: 10 };
      const started = service.startSession(userId, channelId, config);
      
      expect(started).toBe(true);
      
      const status = service.getStatus(userId);
      expect(status?.remainingTime).toBe(30);
    });

    it('should not start a new session if user already has one', () => {
      service.startSession(userId, channelId);
      const secondStart = service.startSession(userId, channelId);
      
      expect(secondStart).toBe(false);
    });
  });

  describe('pauseSession', () => {
    it('should pause an active session', () => {
      service.startSession(userId, channelId);
      const paused = service.pauseSession(userId);
      
      expect(paused).toBe(true);
      
      const status = service.getStatus(userId);
      expect(status?.isPaused).toBe(true);
      expect(status?.isActive).toBe(false);
    });

    it('should not pause if no session exists', () => {
      const paused = service.pauseSession(userId);
      expect(paused).toBe(false);
    });

    it('should not pause an already paused session', () => {
      service.startSession(userId, channelId);
      service.pauseSession(userId);
      
      const secondPause = service.pauseSession(userId);
      expect(secondPause).toBe(false);
    });
  });

  describe('resumeSession', () => {
    it('should resume a paused session', () => {
      service.startSession(userId, channelId);
      service.pauseSession(userId);
      
      const resumed = service.resumeSession(userId);
      expect(resumed).toBe(true);
      
      const status = service.getStatus(userId);
      expect(status?.isPaused).toBe(false);
      expect(status?.isActive).toBe(true);
    });

    it('should not resume if no session exists', () => {
      const resumed = service.resumeSession(userId);
      expect(resumed).toBe(false);
    });

    it('should not resume an active session', () => {
      service.startSession(userId, channelId);
      
      const resumed = service.resumeSession(userId);
      expect(resumed).toBe(false);
    });
  });

  describe('stopSession', () => {
    it('should stop an active session and return stats', () => {
      service.startSession(userId, channelId);
      
      const stats = service.stopSession(userId);
      
      expect(stats).toBeDefined();
      expect(stats?.completedPomodoros).toBe(0);
      expect(service.hasActiveSession(userId)).toBe(false);
    });

    it('should return null if no session exists', () => {
      const stats = service.stopSession(userId);
      expect(stats).toBeNull();
    });
  });

  describe('getStatus', () => {
    it('should return null if no session exists', () => {
      const status = service.getStatus(userId);
      expect(status).toBeNull();
    });

    it('should return correct status for active session', () => {
      service.startSession(userId, channelId);
      
      const status = service.getStatus(userId);
      
      expect(status).toBeDefined();
      expect(status?.isActive).toBe(true);
      expect(status?.phase).toBe('work');
      expect(status?.remainingTime).toBe(25);
      expect(status?.completedPomodoros).toBe(0);
      expect(status?.isPaused).toBe(false);
    });
  });

  describe('setThreadId', () => {
    it('should set thread ID for existing session', () => {
      service.startSession(userId, channelId);
      const threadId = 'thread-789';
      
      const result = service.setThreadId(userId, threadId);
      expect(result).toBe(true);
    });

    it('should return false for non-existing session', () => {
      const result = service.setThreadId(userId, 'thread-789');
      expect(result).toBe(false);
    });
  });

  describe('updateConfig', () => {
    it('should update config for existing session', () => {
      service.startSession(userId, channelId);
      
      const result = service.updateConfig(userId, { workDuration: 30 });
      expect(result).toBe(true);
    });

    it('should return false for non-existing session', () => {
      const result = service.updateConfig(userId, { workDuration: 30 });
      expect(result).toBe(false);
    });
  });

  describe('getDefaultConfig', () => {
    it('should return default configuration', () => {
      const config = service.getDefaultConfig();
      
      expect(config).toEqual({
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 4,
      });
    });
  });

  describe('hasActiveSession', () => {
    it('should return false when no session exists', () => {
      expect(service.hasActiveSession(userId)).toBe(false);
    });

    it('should return true when session exists', () => {
      service.startSession(userId, channelId);
      expect(service.hasActiveSession(userId)).toBe(true);
    });

    it('should return false after session is stopped', () => {
      service.startSession(userId, channelId);
      service.stopSession(userId);
      expect(service.hasActiveSession(userId)).toBe(false);
    });
  });
});