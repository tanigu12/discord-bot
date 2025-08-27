import { PomodoroConfig, PomodoroSession, PomodoroStats, TimerStatus, PomodoroPhase, AICoachingContext, CoachingMessage, PhaseCompletionNotification, DiscordNotificationCallback } from './types';
import { AICoachingService } from './aiCoachingService';

export class PomodoroService {
  private sessions: Map<string, PomodoroSession> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private aiCoachingService = new AICoachingService();
  private coachingCallbacks: Map<string, (message: CoachingMessage) => void> = new Map();
  private discordNotificationCallbacks: Map<string, DiscordNotificationCallback> = new Map();

  private readonly DEFAULT_CONFIG: PomodoroConfig = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
  };

  startSession(userId: string, channelId: string, config?: Partial<PomodoroConfig>): boolean {
    if (this.sessions.has(userId)) {
      return false;
    }

    const sessionConfig = { ...this.DEFAULT_CONFIG, ...config };
    const session: PomodoroSession = {
      userId,
      channelId,
      phase: 'work',
      startTime: new Date(),
      duration: sessionConfig.workDuration,
      completedPomodoros: 0,
      isPaused: false,
      config: sessionConfig,
    };

    this.sessions.set(userId, session);
    this.startTimer(userId);
    
    setTimeout(async () => {
      await this.generateCoachingMessage(userId, 'start');
    }, 1000);
    
    return true;
  }

  pauseSession(userId: string): boolean {
    const session = this.sessions.get(userId);
    if (!session || session.isPaused) {
      return false;
    }

    session.isPaused = true;
    session.pausedAt = new Date();
    this.clearTimer(userId);
    return true;
  }

  resumeSession(userId: string): boolean {
    const session = this.sessions.get(userId);
    if (!session || !session.isPaused) {
      return false;
    }

    session.isPaused = false;
    session.pausedAt = undefined;
    this.startTimer(userId);
    return true;
  }

  stopSession(userId: string): PomodoroStats | null {
    const session = this.sessions.get(userId);
    if (!session) {
      return null;
    }

    this.clearTimer(userId);
    const stats = this.calculateStats(session);
    
    setTimeout(async () => {
      await this.generateCoachingMessage(userId, 'completion');
    }, 500);
    
    this.sessions.delete(userId);
    this.removeCoachingCallback(userId);
    this.removeDiscordNotificationCallback(userId);
    return stats;
  }

  getStatus(userId: string): TimerStatus | null {
    const session = this.sessions.get(userId);
    if (!session) {
      return null;
    }

    const remainingTime = this.calculateRemainingTime(session);
    return {
      isActive: !session.isPaused,
      remainingTime,
      phase: session.phase,
      completedPomodoros: session.completedPomodoros,
      isPaused: session.isPaused,
    };
  }

  setThreadId(userId: string, threadId: string): boolean {
    const session = this.sessions.get(userId);
    if (!session) {
      return false;
    }

    session.threadId = threadId;
    return true;
  }

  getThreadId(userId: string): string | undefined {
    const session = this.sessions.get(userId);
    return session?.threadId;
  }

  updateConfig(userId: string, config: Partial<PomodoroConfig>): boolean {
    const session = this.sessions.get(userId);
    if (!session) {
      return false;
    }

    session.config = { ...session.config, ...config };
    return true;
  }

  private startTimer(userId: string): void {
    const session = this.sessions.get(userId);
    if (!session) return;

    const durationMs = this.calculateRemainingTime(session) * 60 * 1000;
    
    const timer = setTimeout(async () => {
      await this.completePhase(userId);
    }, durationMs);

    this.timers.set(userId, timer);
  }

  private clearTimer(userId: string): void {
    const timer = this.timers.get(userId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(userId);
    }
  }

  private async completePhase(userId: string): Promise<void> {
    const session = this.sessions.get(userId);
    if (!session) return;

    const previousPhase = session.phase;
    let nextPhase: PomodoroPhase;
    
    if (session.phase === 'work') {
      session.completedPomodoros++;
      nextPhase = this.getNextBreakPhase(session.completedPomodoros, session.config.longBreakInterval);
      session.phase = nextPhase;
      session.duration = nextPhase === 'long-break' 
        ? session.config.longBreakDuration 
        : session.config.shortBreakDuration;
      
      await this.generateCoachingMessage(userId, 'break');
    } else {
      nextPhase = 'work';
      session.phase = nextPhase;
      session.duration = session.config.workDuration;
      
      await this.generateCoachingMessage(userId, 'start');
    }

    // Send Discord notification for phase completion
    await this.sendPhaseCompletionNotification(userId, previousPhase, nextPhase, session);

    session.startTime = new Date();
    this.startTimer(userId);
  }

  private getNextBreakPhase(completedPomodoros: number, longBreakInterval: number): PomodoroPhase {
    return completedPomodoros % longBreakInterval === 0 ? 'long-break' : 'short-break';
  }

  private calculateRemainingTime(session: PomodoroSession): number {
    const now = new Date();
    const baseTime = session.pausedAt || session.startTime;
    const elapsedMinutes = (now.getTime() - baseTime.getTime()) / (1000 * 60);
    
    if (session.isPaused && session.pausedAt) {
      const pausedElapsed = (session.pausedAt.getTime() - session.startTime.getTime()) / (1000 * 60);
      return Math.max(0, session.duration - pausedElapsed);
    }
    
    return Math.max(0, session.duration - elapsedMinutes);
  }

  private calculateStats(session: PomodoroSession): PomodoroStats {
    const totalSessionTime = (new Date().getTime() - session.startTime.getTime()) / (1000 * 60);
    
    return {
      completedPomodoros: session.completedPomodoros,
      completedBreaks: session.completedPomodoros,
      totalWorkTime: session.completedPomodoros * session.config.workDuration,
      totalBreakTime: totalSessionTime - (session.completedPomodoros * session.config.workDuration),
      currentStreak: session.completedPomodoros,
    };
  }

  hasActiveSession(userId: string): boolean {
    return this.sessions.has(userId);
  }

  getDefaultConfig(): PomodoroConfig {
    return { ...this.DEFAULT_CONFIG };
  }

  setCoachingCallback(userId: string, callback: (message: CoachingMessage) => void): void {
    this.coachingCallbacks.set(userId, callback);
  }

  removeCoachingCallback(userId: string): void {
    this.coachingCallbacks.delete(userId);
  }

  setDiscordNotificationCallback(userId: string, callback: DiscordNotificationCallback): void {
    this.discordNotificationCallbacks.set(userId, callback);
  }

  removeDiscordNotificationCallback(userId: string): void {
    this.discordNotificationCallbacks.delete(userId);
  }

  async generateCoachingMessage(userId: string, type: CoachingMessage['type']): Promise<string | null> {
    const session = this.sessions.get(userId);
    if (!session) return null;

    const stats = this.calculateStats(session);
    const now = new Date();
    const timeOfDay = this.getTimeOfDayDescription(now.getHours());
    
    const context: AICoachingContext = {
      currentSession: session,
      stats,
      timeOfDay,
      recentPerformance: this.calculateRecentPerformance(stats),
      preferredStyle: this.aiCoachingService.getUserProfile(userId).preferredCoachingStyle,
    };

    try {
      const content = await this.aiCoachingService.generateCoachingMessage(type, context);
      const message: CoachingMessage = {
        type,
        content,
        timestamp: now,
      };

      const callback = this.coachingCallbacks.get(userId);
      if (callback) {
        callback(message);
      }

      return content;
    } catch (error) {
      console.error('Error generating coaching message:', error);
      return null;
    }
  }

  updateUserCoachingProfile(userId: string, updates: { preferredStyle?: 'encouraging' | 'neutral' | 'challenging'; goals?: string[]; motivationalKeywords?: string[] }): void {
    this.aiCoachingService.updateUserProfile(userId, updates);
  }

  getUserCoachingProfile(userId: string) {
    return this.aiCoachingService.getUserProfile(userId);
  }

  getPerformanceInsight(userId: string): string | null {
    const session = this.sessions.get(userId);
    if (!session) return null;

    const stats = this.calculateStats(session);
    const currentHour = new Date().getHours();
    return this.aiCoachingService.generateTimeBasedInsight(stats, currentHour);
  }

  private getTimeOfDayDescription(hour: number): string {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  private calculateRecentPerformance(stats: PomodoroStats): string {
    if (stats.currentStreak >= 5) return 'excellent';
    if (stats.currentStreak >= 3) return 'good';
    if (stats.currentStreak >= 1) return 'moderate';
    return 'starting';
  }

  private async sendPhaseCompletionNotification(
    userId: string, 
    previousPhase: PomodoroPhase, 
    nextPhase: PomodoroPhase, 
    session: PomodoroSession
  ): Promise<void> {
    const callback = this.discordNotificationCallbacks.get(userId);
    if (!callback) return;

    const notification: PhaseCompletionNotification = {
      userId,
      channelId: session.channelId,
      threadId: session.threadId,
      previousPhase,
      nextPhase,
      completedPomodoros: session.completedPomodoros,
      isSessionComplete: false,
    };

    try {
      await callback(notification);
    } catch (error) {
      console.error('Error sending Discord phase completion notification:', error);
    }
  }
}