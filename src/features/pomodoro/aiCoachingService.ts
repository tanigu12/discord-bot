import { BaseAIService } from '../../services/baseAIService';
import { AICoachingContext, CoachingMessage, PomodoroStats, UserProfile } from './types';

export class AICoachingService extends BaseAIService {
  private userProfiles: Map<string, UserProfile> = new Map();

  constructor() {
    super();
  }

  async generateCoachingMessage(
    type: CoachingMessage['type'],
    context: AICoachingContext
  ): Promise<string> {
    const prompt = this.buildPrompt(type, context);
    return this.callOpenAI(
      'You are an AI productivity coach for Pomodoro technique users.',
      prompt,
      {
        maxCompletionTokens: 150,
        temperature: 0.7,
      }
    );
  }

  updateUserProfile(userId: string, updates: Partial<UserProfile>): void {
    const existingProfile = this.userProfiles.get(userId);
    const updatedProfile: UserProfile = {
      userId,
      preferredCoachingStyle: 'encouraging',
      goals: [],
      motivationalKeywords: [],
      ...existingProfile,
      ...updates,
    };
    this.userProfiles.set(userId, updatedProfile);
  }

  getUserProfile(userId: string): UserProfile {
    return this.userProfiles.get(userId) || {
      userId,
      preferredCoachingStyle: 'encouraging',
      goals: [],
      motivationalKeywords: [],
    };
  }

  private buildPrompt(type: CoachingMessage['type'], context: AICoachingContext): string {
    const userProfile = this.getUserProfile(context.currentSession.userId);
    const baseContext = this.buildBaseContext(context, userProfile);

    switch (type) {
      case 'start':
        return this.buildStartPrompt(baseContext, context);
      case 'break':
        return this.buildBreakPrompt(baseContext, context);
      case 'completion':
        return this.buildCompletionPrompt(baseContext, context);
      case 'motivation':
        return this.buildMotivationPrompt(baseContext, context);
      case 'reflection':
        return this.buildReflectionPrompt(baseContext, context);
      default:
        return this.buildGenericPrompt(baseContext);
    }
  }

  private buildBaseContext(context: AICoachingContext, userProfile: UserProfile): string {
    const { currentSession, stats, timeOfDay, recentPerformance } = context;
    
    return `
You are an AI productivity coach for a Pomodoro technique user. Your role is to provide ${userProfile.preferredCoachingStyle} guidance.

User Context:
- Current session phase: ${currentSession.phase}
- Completed pomodoros today: ${currentSession.completedPomodoros}
- Total completed sessions: ${stats.completedPomodoros}
- Current streak: ${stats.currentStreak}
- Time of day: ${timeOfDay}
- Recent performance: ${recentPerformance}
- User goals: ${userProfile.goals.join(', ') || 'No specific goals set'}
- Motivational keywords: ${userProfile.motivationalKeywords.join(', ') || 'productivity, focus, achievement'}

Keep responses concise (1-2 sentences), ${userProfile.preferredCoachingStyle}, and actionable.
`;
  }

  private buildStartPrompt(baseContext: string, context: AICoachingContext): string {
    return `${baseContext}

The user is starting a new ${context.currentSession.phase} session. 
Provide an ${context.preferredStyle} message to help them focus and set intentions.
Focus on what they can achieve in this session.`;
  }

  private buildBreakPrompt(baseContext: string, context: AICoachingContext): string {
    return `${baseContext}

The user just completed a work session and is starting their ${context.currentSession.phase}.
Provide an ${context.preferredStyle} message about taking effective breaks.
Suggest specific break activities that will help them recharge.`;
  }

  private buildCompletionPrompt(baseContext: string, context: AICoachingContext): string {
    return `${baseContext}

The user has completed their Pomodoro session with ${context.currentSession.completedPomodoros} pomodoros.
Provide an ${context.preferredStyle} completion message that celebrates their achievement.
Include insights about their performance and suggest next steps.`;
  }

  private buildMotivationPrompt(baseContext: string, context: AICoachingContext): string {
    return `${baseContext}

The user needs motivational support during their current ${context.currentSession.phase} session.
They may be struggling with focus or energy. Provide an ${context.preferredStyle} boost.
Reference their progress and remind them of their capabilities.`;
  }

  private buildReflectionPrompt(baseContext: string, _context: AICoachingContext): string {
    return `${baseContext}

Guide the user through reflection on their Pomodoro session.
Ask thought-provoking questions about their focus, productivity patterns, and learnings.
Help them identify improvements for future sessions.`;
  }

  private buildGenericPrompt(baseContext: string): string {
    return `${baseContext}

Provide general productivity coaching advice based on the user's current context.
Keep it relevant to their Pomodoro practice and encouraging.`;
  }

  generateTimeBasedInsight(stats: PomodoroStats, currentHour: number): string {
    let insight = '';
    
    if (currentHour >= 6 && currentHour < 12) {
      insight = "Morning sessions often yield the highest focus. You're starting strong! 🌅";
    } else if (currentHour >= 12 && currentHour < 17) {
      insight = "Afternoon focus can dip after lunch. Stay hydrated and consider a short walk during breaks. 🌤️";
    } else if (currentHour >= 17 && currentHour < 21) {
      insight = "Evening sessions are great for wrapping up tasks. Review your progress from today! 🌆";
    } else {
      insight = "Late-night sessions can be productive, but don't sacrifice sleep for work. 🌙";
    }

    if (stats.currentStreak >= 3) {
      insight += ` Your ${stats.currentStreak}-session streak shows excellent consistency!`;
    }

    return insight;
  }

  calculatePerformanceMetrics(stats: PomodoroStats): {
    focusScore: number;
    consistencyScore: number;
    improvementSuggestion: string;
  } {
    const totalSessions = stats.completedPomodoros + stats.completedBreaks;
    const focusScore = Math.min(100, (stats.currentStreak / totalSessions) * 100);
    const consistencyScore = Math.min(100, (stats.completedPomodoros / Math.max(1, totalSessions * 0.6)) * 100);

    let improvementSuggestion = '';
    if (focusScore < 70) {
      improvementSuggestion = 'Try eliminating distractions before starting your next session.';
    } else if (consistencyScore < 70) {
      improvementSuggestion = 'Consider shorter sessions if you\'re having trouble maintaining focus.';
    } else {
      improvementSuggestion = 'Excellent focus and consistency! Consider gradually increasing session length.';
    }

    return {
      focusScore: Math.round(focusScore),
      consistencyScore: Math.round(consistencyScore),
      improvementSuggestion,
    };
  }
}