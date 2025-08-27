export interface PomodoroConfig {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStatusInterval?: number; // in minutes, default 5
  enableAutoStatus?: boolean; // default true
  includeLogicChecking?: boolean; // default true
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

export interface AICoachingContext {
  currentSession: PomodoroSession;
  stats: PomodoroStats;
  timeOfDay: string;
  recentPerformance: string;
  preferredStyle: 'encouraging' | 'neutral' | 'challenging';
}

export interface CoachingMessage {
  type: 'start' | 'break' | 'completion' | 'motivation' | 'reflection';
  content: string;
  timestamp: Date;
}

export interface UserProfile {
  userId: string;
  preferredCoachingStyle: 'encouraging' | 'neutral' | 'challenging';
  goals: string[];
  motivationalKeywords: string[];
}

export interface PhaseCompletionNotification {
  userId: string;
  channelId: string;
  threadId?: string;
  previousPhase: PomodoroPhase;
  nextPhase: PomodoroPhase;
  completedPomodoros: number;
  isSessionComplete?: boolean;
}

export interface AutoStatusUpdate {
  userId: string;
  channelId: string;
  threadId?: string;
  status: TimerStatus;
  sessionInfo: {
    startTime: Date;
    currentPhase: PomodoroPhase;
    nextPhaseIn: number; // minutes
  };
  logicCheck?: {
    timerAccuracy: 'accurate' | 'drift' | 'error';
    sessionConsistency: boolean;
    diagnostics: string[];
  };
  timestamp: Date;
}

export type DiscordNotificationCallback = (notification: PhaseCompletionNotification | AutoStatusUpdate) => Promise<void>;