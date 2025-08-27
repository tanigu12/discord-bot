export interface PomodoroConfig {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
}

export interface PomodoroSession {
  userId: string;
  channelId: string;
  threadId?: string;
  phase: 'work' | 'short-break' | 'long-break';
  startTime: Date;
  duration: number;
  completedPomodoros: number;
  isPaused: boolean;
  pausedAt?: Date;
  config: PomodoroConfig;
}

export interface PomodoroStats {
  completedPomodoros: number;
  completedBreaks: number;
  totalWorkTime: number;
  totalBreakTime: number;
  currentStreak: number;
}

export type PomodoroPhase = 'work' | 'short-break' | 'long-break';

export interface TimerStatus {
  isActive: boolean;
  remainingTime: number;
  phase: PomodoroPhase;
  completedPomodoros: number;
  isPaused: boolean;
}