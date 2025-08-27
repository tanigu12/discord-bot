import { PomodoroConfig, PomodoroSession, PomodoroStats, TimerStatus, PomodoroPhase } from './types';

export class PomodoroService {
  private sessions: Map<string, PomodoroSession> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

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
    this.sessions.delete(userId);
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
    
    const timer = setTimeout(() => {
      this.completePhase(userId);
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

  private completePhase(userId: string): void {
    const session = this.sessions.get(userId);
    if (!session) return;

    if (session.phase === 'work') {
      session.completedPomodoros++;
      const nextPhase = this.getNextBreakPhase(session.completedPomodoros, session.config.longBreakInterval);
      session.phase = nextPhase;
      session.duration = nextPhase === 'long-break' 
        ? session.config.longBreakDuration 
        : session.config.shortBreakDuration;
    } else {
      session.phase = 'work';
      session.duration = session.config.workDuration;
    }

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
}