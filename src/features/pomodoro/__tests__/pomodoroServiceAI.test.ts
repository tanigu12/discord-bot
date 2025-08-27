import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PomodoroService } from '../pomodoroService';

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

describe('PomodoroService AI Coaching Integration', () => {
  let pomodoroService: PomodoroService;
  let mockCoachingCallback: any;

  beforeEach(() => {
    vi.useFakeTimers();
    pomodoroService = new PomodoroService();
    mockCoachingCallback = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('coaching callbacks', () => {
    it('should set and remove coaching callbacks', () => {
      pomodoroService.setCoachingCallback('user1', mockCoachingCallback);
      expect((pomodoroService as any).coachingCallbacks.has('user1')).toBe(true);

      pomodoroService.removeCoachingCallback('user1');
      expect((pomodoroService as any).coachingCallbacks.has('user1')).toBe(false);
    });

    it('should call coaching callback when generating messages', async () => {
      pomodoroService.startSession('user1', 'channel1');
      pomodoroService.setCoachingCallback('user1', mockCoachingCallback);

      const result = await pomodoroService.generateCoachingMessage('user1', 'motivation');

      expect(result).toBe('Test coaching message');
      expect(mockCoachingCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'motivation',
          content: 'Test coaching message',
          timestamp: expect.any(Date),
        })
      );
    });

    it('should not call callback if user has no active session', async () => {
      pomodoroService.setCoachingCallback('user1', mockCoachingCallback);

      const result = await pomodoroService.generateCoachingMessage('user1', 'motivation');

      expect(result).toBeNull();
      expect(mockCoachingCallback).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully when generating coaching messages', async () => {
      const mockAIService = (pomodoroService as any).aiCoachingService;
      mockAIService.generateCoachingMessage.mockRejectedValue(new Error('AI service error'));

      pomodoroService.startSession('user1', 'channel1');
      pomodoroService.setCoachingCallback('user1', mockCoachingCallback);

      const result = await pomodoroService.generateCoachingMessage('user1', 'motivation');

      expect(result).toBeNull();
      expect(mockCoachingCallback).not.toHaveBeenCalled();
    });
  });

  describe('session lifecycle coaching', () => {
    it('should trigger callback when manually generating start message', async () => {
      pomodoroService.startSession('user1', 'channel1');
      pomodoroService.setCoachingCallback('user1', mockCoachingCallback);
      
      await pomodoroService.generateCoachingMessage('user1', 'start');

      expect(mockCoachingCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'start',
          content: 'Test coaching message',
        })
      );
    });

    it('should trigger callback when manually generating completion message', async () => {
      pomodoroService.startSession('user1', 'channel1');
      pomodoroService.setCoachingCallback('user1', mockCoachingCallback);
      
      await pomodoroService.generateCoachingMessage('user1', 'completion');

      expect(mockCoachingCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'completion',
          content: 'Test coaching message',
        })
      );
    });

    it('should remove coaching callback when session ends', () => {
      pomodoroService.startSession('user1', 'channel1');
      pomodoroService.setCoachingCallback('user1', mockCoachingCallback);

      pomodoroService.stopSession('user1');

      expect((pomodoroService as any).coachingCallbacks.has('user1')).toBe(false);
    });
  });

  describe('user profile management', () => {
    it('should update user coaching profile', () => {
      const updates = {
        preferredStyle: 'challenging' as const,
        goals: ['improve focus'],
        motivationalKeywords: ['determination'],
      };

      pomodoroService.updateUserCoachingProfile('user1', updates);

      const mockAIService = (pomodoroService as any).aiCoachingService;
      expect(mockAIService.updateUserProfile).toHaveBeenCalledWith('user1', updates);
    });

    it('should get user coaching profile', () => {
      const profile = pomodoroService.getUserCoachingProfile('user1');

      expect(profile).toEqual({
        userId: 'test-user', // This matches the mock implementation
        preferredCoachingStyle: 'encouraging',
        goals: [],
        motivationalKeywords: [],
      });

      const mockAIService = (pomodoroService as any).aiCoachingService;
      expect(mockAIService.getUserProfile).toHaveBeenCalledWith('user1');
    });
  });

  describe('performance insights', () => {
    it('should generate performance insight for active session', () => {
      pomodoroService.startSession('user1', 'channel1');

      const insight = pomodoroService.getPerformanceInsight('user1');

      expect(insight).toBe('Test insight');
      
      const mockAIService = (pomodoroService as any).aiCoachingService;
      expect(mockAIService.generateTimeBasedInsight).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Number)
      );
    });

    it('should return null for user with no active session', () => {
      const insight = pomodoroService.getPerformanceInsight('user1');

      expect(insight).toBeNull();
    });
  });

  describe('time-based context', () => {
    it('should generate correct time of day descriptions', () => {
      const service = pomodoroService as any;

      expect(service.getTimeOfDayDescription(8)).toBe('morning');
      expect(service.getTimeOfDayDescription(14)).toBe('afternoon');
      expect(service.getTimeOfDayDescription(19)).toBe('evening');
      expect(service.getTimeOfDayDescription(2)).toBe('night');
    });

    it('should calculate recent performance correctly', () => {
      const service = pomodoroService as any;

      const excellentStats = { currentStreak: 5 };
      expect(service.calculateRecentPerformance(excellentStats)).toBe('excellent');

      const goodStats = { currentStreak: 3 };
      expect(service.calculateRecentPerformance(goodStats)).toBe('good');

      const moderateStats = { currentStreak: 1 };
      expect(service.calculateRecentPerformance(moderateStats)).toBe('moderate');

      const startingStats = { currentStreak: 0 };
      expect(service.calculateRecentPerformance(startingStats)).toBe('starting');
    });
  });

  describe('coaching message generation with context', () => {
    it('should generate coaching message with proper context', async () => {
      pomodoroService.startSession('user1', 'channel1', { workDuration: 30 });
      
      const result = await pomodoroService.generateCoachingMessage('user1', 'start');
      
      expect(result).toBe('Test coaching message');
      
      const mockAIService = (pomodoroService as any).aiCoachingService;
      expect(mockAIService.generateCoachingMessage).toHaveBeenCalledWith(
        'start',
        expect.objectContaining({
          currentSession: expect.objectContaining({
            userId: 'user1',
            channelId: 'channel1',
            phase: 'work',
            duration: 30,
          }),
          stats: expect.any(Object),
          timeOfDay: expect.any(String),
          recentPerformance: expect.any(String),
          preferredStyle: 'encouraging',
        })
      );
    });
  });
});