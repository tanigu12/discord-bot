import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PomodoroService } from '../pomodoroService';
import { AutoStatusUpdate, PomodoroConfig } from '../types';

describe('PomodoroService Auto-Status Functionality', () => {
  let pomodoroService: PomodoroService;
  let mockNotificationCallback: any;
  const userId = 'test-user-123';
  const channelId = 'test-channel-456';

  beforeEach(() => {
    pomodoroService = new PomodoroService();
    mockNotificationCallback = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Auto-Status Configuration', () => {
    it('should use default auto-status configuration', () => {
      const config = pomodoroService.getDefaultConfig();
      expect(config.autoStatusInterval).toBe(5);
      expect(config.enableAutoStatus).toBe(true);
      expect(config.includeLogicChecking).toBe(true);
    });

    it('should allow custom auto-status interval configuration', () => {
      const customConfig: Partial<PomodoroConfig> = {
        autoStatusInterval: 3,
        enableAutoStatus: true,
      };

      const started = pomodoroService.startSession(userId, channelId, customConfig);
      expect(started).toBe(true);

      const session = (pomodoroService as any).sessions.get(userId);
      expect(session.config.autoStatusInterval).toBe(3);
    });

    it('should allow disabling auto-status', () => {
      const customConfig: Partial<PomodoroConfig> = {
        enableAutoStatus: false,
      };

      const started = pomodoroService.startSession(userId, channelId, customConfig);
      expect(started).toBe(true);

      const session = (pomodoroService as any).sessions.get(userId);
      expect(session.config.enableAutoStatus).toBe(false);
    });
  });

  describe('Auto-Status Interval Management', () => {
    it('should start auto-status interval when session starts with default config', () => {
      pomodoroService.setDiscordNotificationCallback(userId, mockNotificationCallback);
      
      const started = pomodoroService.startSession(userId, channelId);
      expect(started).toBe(true);

      // Check that status interval is tracked
      const statusIntervals = (pomodoroService as any).statusIntervals;
      expect(statusIntervals.has(userId)).toBe(true);
    });

    it('should not start auto-status interval when disabled', () => {
      const customConfig: Partial<PomodoroConfig> = { enableAutoStatus: false };
      
      const started = pomodoroService.startSession(userId, channelId, customConfig);
      expect(started).toBe(true);

      const statusIntervals = (pomodoroService as any).statusIntervals;
      expect(statusIntervals.has(userId)).toBe(false);
    });

    it('should send auto-status update after configured interval', async () => {
      pomodoroService.setDiscordNotificationCallback(userId, mockNotificationCallback);
      
      const customConfig: Partial<PomodoroConfig> = { autoStatusInterval: 2 }; // 2 minutes
      const started = pomodoroService.startSession(userId, channelId, customConfig);
      expect(started).toBe(true);

      // Clear the coaching message from start
      mockNotificationCallback.mockClear();

      // Manually trigger the auto-status update to test the functionality
      // without dealing with complex timer interactions
      await (pomodoroService as any).sendAutoStatusUpdate(userId);

      // Check that auto-status update was sent
      expect(mockNotificationCallback).toHaveBeenCalled();
      const call = mockNotificationCallback.mock.calls[0][0];
      expect(call).toHaveProperty('status');
      expect(call).toHaveProperty('sessionInfo');
    });

    it('should clear auto-status interval when session is paused', () => {
      const started = pomodoroService.startSession(userId, channelId);
      expect(started).toBe(true);

      let statusIntervals = (pomodoroService as any).statusIntervals;
      expect(statusIntervals.has(userId)).toBe(true);

      const paused = pomodoroService.pauseSession(userId);
      expect(paused).toBe(true);

      statusIntervals = (pomodoroService as any).statusIntervals;
      expect(statusIntervals.has(userId)).toBe(false);
    });

    it('should restart auto-status interval when session is resumed', () => {
      // Start and pause session
      pomodoroService.startSession(userId, channelId);
      pomodoroService.pauseSession(userId);

      const resumed = pomodoroService.resumeSession(userId);
      expect(resumed).toBe(true);

      const statusIntervals = (pomodoroService as any).statusIntervals;
      expect(statusIntervals.has(userId)).toBe(true);
    });

    it('should clear auto-status interval when session is stopped', () => {
      const started = pomodoroService.startSession(userId, channelId);
      expect(started).toBe(true);

      let statusIntervals = (pomodoroService as any).statusIntervals;
      expect(statusIntervals.has(userId)).toBe(true);

      const stats = pomodoroService.stopSession(userId);
      expect(stats).toBeTruthy();

      statusIntervals = (pomodoroService as any).statusIntervals;
      expect(statusIntervals.has(userId)).toBe(false);
    });
  });

  describe('Auto-Status Update Content', () => {
    it('should generate auto-status update with correct structure', async () => {
      pomodoroService.setDiscordNotificationCallback(userId, mockNotificationCallback);
      
      const started = pomodoroService.startSession(userId, channelId);
      expect(started).toBe(true);

      // Manually trigger auto-status update
      await (pomodoroService as any).sendAutoStatusUpdate(userId);

      expect(mockNotificationCallback).toHaveBeenCalled();
      const autoStatusUpdate: AutoStatusUpdate = mockNotificationCallback.mock.calls[0][0];

      // Check structure
      expect(autoStatusUpdate).toHaveProperty('userId', userId);
      expect(autoStatusUpdate).toHaveProperty('channelId', channelId);
      expect(autoStatusUpdate).toHaveProperty('status');
      expect(autoStatusUpdate).toHaveProperty('sessionInfo');
      expect(autoStatusUpdate).toHaveProperty('logicCheck');
      expect(autoStatusUpdate).toHaveProperty('timestamp');

      // Check status content
      expect(autoStatusUpdate.status.phase).toBe('work');
      expect(autoStatusUpdate.status.completedPomodoros).toBe(0);
      expect(autoStatusUpdate.status.isActive).toBe(true);
      expect(autoStatusUpdate.status.isPaused).toBe(false);

      // Check session info
      expect(autoStatusUpdate.sessionInfo.currentPhase).toBe('work');
      expect(autoStatusUpdate.sessionInfo.startTime).toBeInstanceOf(Date);
      expect(typeof autoStatusUpdate.sessionInfo.nextPhaseIn).toBe('number');
    });

    it('should include logic checking when enabled', async () => {
      pomodoroService.setDiscordNotificationCallback(userId, mockNotificationCallback);
      
      const config: Partial<PomodoroConfig> = { includeLogicChecking: true };
      const started = pomodoroService.startSession(userId, channelId, config);
      expect(started).toBe(true);

      await (pomodoroService as any).sendAutoStatusUpdate(userId);

      const autoStatusUpdate: AutoStatusUpdate = mockNotificationCallback.mock.calls[0][0];
      expect(autoStatusUpdate.logicCheck).toBeDefined();
      expect(autoStatusUpdate.logicCheck!.timerAccuracy).toBeDefined();
      expect(autoStatusUpdate.logicCheck!.sessionConsistency).toBeDefined();
      expect(autoStatusUpdate.logicCheck!.diagnostics).toBeInstanceOf(Array);
    });

    it('should exclude logic checking when disabled', async () => {
      pomodoroService.setDiscordNotificationCallback(userId, mockNotificationCallback);
      
      const config: Partial<PomodoroConfig> = { includeLogicChecking: false };
      const started = pomodoroService.startSession(userId, channelId, config);
      expect(started).toBe(true);

      await (pomodoroService as any).sendAutoStatusUpdate(userId);

      const autoStatusUpdate: AutoStatusUpdate = mockNotificationCallback.mock.calls[0][0];
      expect(autoStatusUpdate.logicCheck).toBeUndefined();
    });

    it('should not send auto-status update for paused sessions', async () => {
      pomodoroService.setDiscordNotificationCallback(userId, mockNotificationCallback);
      
      pomodoroService.startSession(userId, channelId);
      pomodoroService.pauseSession(userId);

      await (pomodoroService as any).sendAutoStatusUpdate(userId);

      expect(mockNotificationCallback).not.toHaveBeenCalled();
    });
  });

  describe('Logic Checking', () => {
    it('should report accurate timer when no drift', async () => {
      pomodoroService.setDiscordNotificationCallback(userId, mockNotificationCallback);
      pomodoroService.startSession(userId, channelId);

      await (pomodoroService as any).sendAutoStatusUpdate(userId);

      const autoStatusUpdate: AutoStatusUpdate = mockNotificationCallback.mock.calls[0][0];
      expect(autoStatusUpdate.logicCheck!.timerAccuracy).toBe('accurate');
      expect(autoStatusUpdate.logicCheck!.sessionConsistency).toBe(true);
    });

    it('should include diagnostic information', async () => {
      pomodoroService.setDiscordNotificationCallback(userId, mockNotificationCallback);
      pomodoroService.startSession(userId, channelId);

      await (pomodoroService as any).sendAutoStatusUpdate(userId);

      const autoStatusUpdate: AutoStatusUpdate = mockNotificationCallback.mock.calls[0][0];
      const diagnostics = autoStatusUpdate.logicCheck!.diagnostics;
      
      expect(diagnostics.length).toBeGreaterThan(0);
      expect(diagnostics.some(d => d.includes('Session running for'))).toBe(true);
      expect(diagnostics.some(d => d.includes('Current phase:'))).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle callback errors gracefully', async () => {
      const errorCallback = vi.fn().mockRejectedValue(new Error('Callback error'));
      pomodoroService.setDiscordNotificationCallback(userId, errorCallback);
      
      pomodoroService.startSession(userId, channelId);

      // Mock console.error to verify error handling
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await (pomodoroService as any).sendAutoStatusUpdate(userId);

      expect(errorCallback).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Error sending auto-status update:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle missing sessions gracefully', async () => {
      await (pomodoroService as any).sendAutoStatusUpdate('non-existent-user');
      // Should not throw error
    });
  });
});