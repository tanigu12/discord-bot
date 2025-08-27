import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AICoachingService } from '../aiCoachingService';
import { AICoachingContext, PomodoroSession, PomodoroStats } from '../types';

vi.mock('../../services/baseAIService');

describe('AICoachingService', () => {
  let aiCoachingService: AICoachingService;

  beforeEach(() => {
    aiCoachingService = new AICoachingService();
    (aiCoachingService as any).callOpenAI = vi.fn();
  });

  describe('generateCoachingMessage', () => {
    const mockContext: AICoachingContext = {
      currentSession: {
        userId: 'test-user',
        channelId: 'test-channel',
        phase: 'work',
        startTime: new Date(),
        duration: 25,
        completedPomodoros: 2,
        isPaused: false,
        config: {
          workDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          longBreakInterval: 4,
        },
      } as PomodoroSession,
      stats: {
        completedPomodoros: 2,
        completedBreaks: 2,
        totalWorkTime: 50,
        totalBreakTime: 10,
        currentStreak: 2,
      } as PomodoroStats,
      timeOfDay: 'morning',
      recentPerformance: 'good',
      preferredStyle: 'encouraging',
    };

    it('should generate a start coaching message', async () => {
      const expectedMessage = 'Great morning energy! Focus on your goals for this session.';
      (aiCoachingService as any).callOpenAI = vi.fn().mockResolvedValue(expectedMessage);

      const result = await aiCoachingService.generateCoachingMessage('start', mockContext);

      expect(result).toBe(expectedMessage);
      expect((aiCoachingService as any).callOpenAI).toHaveBeenCalledWith(
        'You are an AI productivity coach for Pomodoro technique users.',
        expect.stringContaining('starting a new work session'),
        { maxCompletionTokens: 150, temperature: 0.7 }
      );
    });

    it('should generate a break coaching message', async () => {
      const expectedMessage = 'Time to recharge! Try a quick walk or stretch.';
      (aiCoachingService as any).callOpenAI = vi.fn().mockResolvedValue(expectedMessage);

      const result = await aiCoachingService.generateCoachingMessage('break', mockContext);

      expect(result).toBe(expectedMessage);
      expect((aiCoachingService as any).callOpenAI).toHaveBeenCalledWith(
        'You are an AI productivity coach for Pomodoro technique users.',
        expect.stringContaining('starting their work'),
        { maxCompletionTokens: 150, temperature: 0.7 }
      );
    });

    it('should generate a completion coaching message', async () => {
      const expectedMessage = 'Fantastic work! You completed 2 focused sessions today.';
      (aiCoachingService as any).callOpenAI = vi.fn().mockResolvedValue(expectedMessage);

      const result = await aiCoachingService.generateCoachingMessage('completion', mockContext);

      expect(result).toBe(expectedMessage);
      expect((aiCoachingService as any).callOpenAI).toHaveBeenCalledWith(
        'You are an AI productivity coach for Pomodoro technique users.',
        expect.stringContaining('completed their Pomodoro session with 2 pomodoros'),
        { maxCompletionTokens: 150, temperature: 0.7 }
      );
    });

    it('should generate a motivation coaching message', async () => {
      const expectedMessage = 'You can do this! Your focus is building stronger with each session.';
      (aiCoachingService as any).callOpenAI = vi.fn().mockResolvedValue(expectedMessage);

      const result = await aiCoachingService.generateCoachingMessage('motivation', mockContext);

      expect(result).toBe(expectedMessage);
      expect((aiCoachingService as any).callOpenAI).toHaveBeenCalledWith(
        'You are an AI productivity coach for Pomodoro technique users.',
        expect.stringContaining('needs motivational support'),
        { maxCompletionTokens: 150, temperature: 0.7 }
      );
    });

    it('should generate a reflection coaching message', async () => {
      const expectedMessage = 'What did you learn about your focus patterns today?';
      (aiCoachingService as any).callOpenAI = vi.fn().mockResolvedValue(expectedMessage);

      const result = await aiCoachingService.generateCoachingMessage('reflection', mockContext);

      expect(result).toBe(expectedMessage);
      expect((aiCoachingService as any).callOpenAI).toHaveBeenCalledWith(
        'You are an AI productivity coach for Pomodoro technique users.',
        expect.stringContaining('reflection on their Pomodoro session'),
        { maxCompletionTokens: 150, temperature: 0.7 }
      );
    });
  });

  describe('updateUserProfile', () => {
    it('should create a new user profile with defaults', () => {
      aiCoachingService.updateUserProfile('test-user', { preferredCoachingStyle: 'challenging' });

      const profile = aiCoachingService.getUserProfile('test-user');
      expect(profile.userId).toBe('test-user');
      expect(profile.preferredCoachingStyle).toBe('challenging');
      expect(profile.goals).toEqual([]);
      expect(profile.motivationalKeywords).toEqual([]);
    });

    it('should update existing user profile', () => {
      aiCoachingService.updateUserProfile('test-user', { 
        preferredCoachingStyle: 'encouraging',
        goals: ['improve focus', 'increase productivity'] 
      });
      
      aiCoachingService.updateUserProfile('test-user', { 
        motivationalKeywords: ['determination', 'success'] 
      });

      const profile = aiCoachingService.getUserProfile('test-user');
      expect(profile.preferredCoachingStyle).toBe('encouraging');
      expect(profile.goals).toEqual(['improve focus', 'increase productivity']);
      expect(profile.motivationalKeywords).toEqual(['determination', 'success']);
    });
  });

  describe('getUserProfile', () => {
    it('should return default profile for new user', () => {
      const profile = aiCoachingService.getUserProfile('new-user');
      
      expect(profile.userId).toBe('new-user');
      expect(profile.preferredCoachingStyle).toBe('encouraging');
      expect(profile.goals).toEqual([]);
      expect(profile.motivationalKeywords).toEqual([]);
    });

    it('should return existing profile', () => {
      aiCoachingService.updateUserProfile('existing-user', {
        preferredCoachingStyle: 'neutral',
        goals: ['test goal'],
      });

      const profile = aiCoachingService.getUserProfile('existing-user');
      expect(profile.preferredCoachingStyle).toBe('neutral');
      expect(profile.goals).toEqual(['test goal']);
    });
  });

  describe('generateTimeBasedInsight', () => {
    it('should generate morning insight', () => {
      const stats: PomodoroStats = {
        completedPomodoros: 3,
        completedBreaks: 3,
        totalWorkTime: 75,
        totalBreakTime: 15,
        currentStreak: 3,
      };

      const insight = aiCoachingService.generateTimeBasedInsight(stats, 9);
      
      expect(insight).toContain('Morning sessions');
      expect(insight).toContain('3-session streak');
    });

    it('should generate afternoon insight', () => {
      const stats: PomodoroStats = {
        completedPomodoros: 2,
        completedBreaks: 2,
        totalWorkTime: 50,
        totalBreakTime: 10,
        currentStreak: 2,
      };

      const insight = aiCoachingService.generateTimeBasedInsight(stats, 15);
      
      expect(insight).toContain('Afternoon focus');
      expect(insight).toContain('hydrated');
    });

    it('should generate evening insight', () => {
      const stats: PomodoroStats = {
        completedPomodoros: 1,
        completedBreaks: 1,
        totalWorkTime: 25,
        totalBreakTime: 5,
        currentStreak: 1,
      };

      const insight = aiCoachingService.generateTimeBasedInsight(stats, 19);
      
      expect(insight).toContain('Evening sessions');
      expect(insight).toContain('wrapping up');
    });

    it('should generate night insight', () => {
      const stats: PomodoroStats = {
        completedPomodoros: 1,
        completedBreaks: 1,
        totalWorkTime: 25,
        totalBreakTime: 5,
        currentStreak: 1,
      };

      const insight = aiCoachingService.generateTimeBasedInsight(stats, 23);
      
      expect(insight).toContain('Late-night sessions');
      expect(insight).toContain('sleep');
    });
  });

  describe('calculatePerformanceMetrics', () => {
    it('should calculate focus and consistency scores', () => {
      const stats: PomodoroStats = {
        completedPomodoros: 8,
        completedBreaks: 2,
        totalWorkTime: 200,
        totalBreakTime: 10,
        currentStreak: 6,
      };

      const metrics = aiCoachingService.calculatePerformanceMetrics(stats);
      
      expect(metrics.focusScore).toBeGreaterThan(50);
      expect(metrics.consistencyScore).toBeGreaterThan(80);
      expect(metrics.improvementSuggestion).toBeTruthy();
    });

    it('should provide improvement suggestions for low focus', () => {
      const stats: PomodoroStats = {
        completedPomodoros: 2,
        completedBreaks: 8,
        totalWorkTime: 50,
        totalBreakTime: 40,
        currentStreak: 1,
      };

      const metrics = aiCoachingService.calculatePerformanceMetrics(stats);
      
      expect(metrics.focusScore).toBeLessThan(70);
      expect(metrics.improvementSuggestion).toContain('distractions');
    });

    it('should provide improvement suggestions for low consistency', () => {
      const stats: PomodoroStats = {
        completedPomodoros: 3,
        completedBreaks: 7,
        totalWorkTime: 75,
        totalBreakTime: 35,
        currentStreak: 8, // High streak for focus score to pass focus check
      };

      const metrics = aiCoachingService.calculatePerformanceMetrics(stats);
      
      expect(metrics.consistencyScore).toBeLessThan(70);
      expect(metrics.improvementSuggestion).toContain('shorter sessions');
    });

    it('should provide positive feedback for good performance', () => {
      const stats: PomodoroStats = {
        completedPomodoros: 10,
        completedBreaks: 2,
        totalWorkTime: 250,
        totalBreakTime: 10,
        currentStreak: 10,
      };

      const metrics = aiCoachingService.calculatePerformanceMetrics(stats);
      
      expect(metrics.focusScore).toBeGreaterThan(70);
      expect(metrics.consistencyScore).toBeGreaterThan(70);
      expect(metrics.improvementSuggestion).toContain('Excellent');
    });
  });
});