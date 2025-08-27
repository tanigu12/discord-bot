import { EmbedBuilder, User } from 'discord.js';
import {
  PomodoroStats,
  TimerStatus,
  PomodoroConfig,
  CoachingMessage,
  PhaseCompletionNotification,
} from './types';

export class PomodoroFormatter {
  createStartEmbed(user: User, config: PomodoroConfig): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0xff6b6b)
      .setTitle('🍅 Pomodoro Started!')
      .setDescription(`${user.displayName} started a focus session`)
      .addFields(
        { name: '⏱️ Work Duration', value: `${config.workDuration} minutes`, inline: true },
        { name: '☕ Break Duration', value: `${config.shortBreakDuration} minutes`, inline: true },
        { name: '🛋️ Long Break', value: `${config.longBreakDuration} minutes`, inline: true }
      )
      .setTimestamp();
  }

  createStatusEmbed(user: User, status: TimerStatus): EmbedBuilder {
    const phaseEmoji = this.getPhaseEmoji(status.phase);
    const phaseText = this.getPhaseText(status.phase);
    const progressBar = this.createProgressBar(status);

    const embed = new EmbedBuilder()
      .setColor(this.getPhaseColor(status.phase))
      .setTitle(`${phaseEmoji} ${phaseText}`)
      .setDescription(`${user.displayName}'s Pomodoro Session`)
      .addFields(
        { name: '⏰ Remaining Time', value: this.formatTime(status.remainingTime), inline: true },
        { name: '🎯 Completed', value: `${status.completedPomodoros} pomodoros`, inline: true },
        { name: '📊 Progress', value: progressBar, inline: false }
      )
      .setTimestamp();

    if (status.isPaused) {
      embed.setFooter({ text: '⏸️ Paused' });
    }

    return embed;
  }

  createPausedEmbed(user: User): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0xffe66d)
      .setTitle('⏸️ Pomodoro Paused')
      .setDescription(`${user.displayName}'s session is paused`)
      .setTimestamp();
  }

  createResumedEmbed(user: User): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0xff6b6b)
      .setTitle('▶️ Pomodoro Resumed')
      .setDescription(`${user.displayName}'s session is back on track!`)
      .setTimestamp();
  }

  createStoppedEmbed(user: User, stats: PomodoroStats): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0x95a5a6)
      .setTitle('🛑 Pomodoro Stopped')
      .setDescription(`${user.displayName} ended their session`)
      .addFields(
        { name: '🍅 Completed Pomodoros', value: `${stats.completedPomodoros}`, inline: true },
        { name: '⏱️ Total Work Time', value: this.formatTime(stats.totalWorkTime), inline: true }
      )
      .setTimestamp();
  }

  createConfigEmbed(user: User, config: PomodoroConfig): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('⚙️ Pomodoro Configuration')
      .setDescription(`${user.displayName}'s settings`)
      .addFields(
        { name: '⏱️ Work Duration', value: `${config.workDuration} minutes`, inline: true },
        { name: '☕ Short Break', value: `${config.shortBreakDuration} minutes`, inline: true },
        { name: '🛋️ Long Break', value: `${config.longBreakDuration} minutes`, inline: true },
        {
          name: '🔄 Long Break Interval',
          value: `Every ${config.longBreakInterval} pomodoros`,
          inline: true,
        }
      )
      .setTimestamp();
  }

  createErrorEmbed(title: string, description: string): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle(`❌ ${title}`)
      .setDescription(description)
      .setTimestamp();
  }

  private getPhaseEmoji(phase: string): string {
    switch (phase) {
      case 'work':
        return '🍅';
      case 'short-break':
        return '☕';
      case 'long-break':
        return '🛋️';
      default:
        return '⏱️';
    }
  }

  private getPhaseText(phase: string): string {
    switch (phase) {
      case 'work':
        return 'Focus Time';
      case 'short-break':
        return 'Short Break';
      case 'long-break':
        return 'Long Break';
      default:
        return 'Timer';
    }
  }

  private getPhaseColor(phase: string): number {
    switch (phase) {
      case 'work':
        return 0xff6b6b;
      case 'short-break':
        return 0x4ecdc4;
      case 'long-break':
        return 0x45b7d1;
      default:
        return 0x95a5a6;
    }
  }

  private createProgressBar(status: TimerStatus): string {
    const totalDuration = status.phase === 'work' ? 25 : 5; // Simplified for progress bar
    const elapsed = totalDuration - status.remainingTime;
    const progress = Math.min(Math.max(elapsed / totalDuration, 0), 1);

    const barLength = 20;
    const filledLength = Math.round(progress * barLength);
    const emptyLength = barLength - filledLength;

    const filledBar = '█'.repeat(filledLength);
    const emptyBar = '░'.repeat(emptyLength);

    return `\`${filledBar}${emptyBar}\` ${Math.round(progress * 100)}%`;
  }

  private formatTime(minutes: number): string {
    const totalMinutes = Math.floor(minutes);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  createCoachingEmbed(_user: User, message: CoachingMessage): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(this.getCoachingColor(message.type))
      .setTitle(this.getCoachingTitle(message.type))
      .setDescription(message.content || 'No coaching message available')
      .setTimestamp();

    if (message.type === 'reflection') {
      embed.setFooter({ text: '💭 Take a moment to reflect on this question' });
    }

    return embed;
  }

  createInsightEmbed(user: User, insight: string): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('💡 Performance Insight')
      .setDescription(insight)
      .setFooter({ text: `Personalized for ${user.displayName}` })
      .setTimestamp();
  }

  createCoachingConfigEmbed(
    user: User,
    preferredStyle: 'encouraging' | 'neutral' | 'challenging',
    goals: string[],
    motivationalKeywords: string[]
  ): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0x8e44ad)
      .setTitle('🎯 AI Coaching Profile')
      .setDescription(`${user.displayName}'s coaching preferences`)
      .addFields(
        { name: '🎨 Coaching Style', value: this.capitalizeFirst(preferredStyle), inline: true },
        {
          name: '🎯 Goals',
          value: goals.length > 0 ? goals.join(', ') : 'No goals set',
          inline: true,
        },
        {
          name: '💪 Keywords',
          value:
            motivationalKeywords.length > 0 ? motivationalKeywords.join(', ') : 'Default keywords',
          inline: false,
        }
      )
      .setTimestamp();
  }

  private getCoachingColor(type: CoachingMessage['type']): number {
    switch (type) {
      case 'start':
        return 0x2ecc71;
      case 'break':
        return 0x3498db;
      case 'completion':
        return 0xf39c12;
      case 'motivation':
        return 0xe74c3c;
      case 'reflection':
        return 0x9b59b6;
      default:
        return 0x95a5a6;
    }
  }

  private getCoachingTitle(type: CoachingMessage['type']): string {
    switch (type) {
      case 'start':
        return '🚀 Focus Coaching';
      case 'break':
        return '🌊 Break Guidance';
      case 'completion':
        return '🎉 Session Complete';
      case 'motivation':
        return '💪 Motivation Boost';
      case 'reflection':
        return '🤔 Reflection Time';
      default:
        return '🤖 AI Coach';
    }
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  createPhaseCompletionEmbed(user: User, notification: PhaseCompletionNotification): EmbedBuilder {
    const phaseEmoji = this.getPhaseEmoji(notification.nextPhase);
    const phaseText = this.getPhaseText(notification.nextPhase);

    let title: string;
    let description: string;
    let color: number;

    if (notification.previousPhase === 'work') {
      // Work completed, starting break
      title = `🎉 Pomodoro #${notification.completedPomodoros} Complete!`;
      description = `Great work, ${user.displayName}! Time for a ${notification.nextPhase === 'long-break' ? 'long' : 'short'} break.`;
      color = 0x2ecc71; // Green for completion
    } else {
      // Break completed, starting work
      title = `${phaseEmoji} Break's Over!`;
      description = `Ready to focus, ${user.displayName}? Let's start your next work session.`;
      color = 0xff6b6b; // Red/orange for work
    }

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setDescription(description)
      .addFields(
        {
          name: '🍅 Completed Pomodoros',
          value: `${notification.completedPomodoros}`,
          inline: true,
        },
        { name: '⏱️ Next Phase', value: `${phaseEmoji} ${phaseText}`, inline: true }
      )
      .setTimestamp();

    // Add encouraging footer based on progress
    if (notification.completedPomodoros >= 4) {
      embed.setFooter({ text: '🔥 Amazing productivity streak! Keep it up!' });
    } else if (notification.completedPomodoros >= 2) {
      embed.setFooter({ text: "💪 Building momentum! You're doing great!" });
    } else {
      embed.setFooter({ text: '🌱 Every session counts! Keep going!' });
    }

    return embed;
  }

  createAutoTimerMessage(notification: PhaseCompletionNotification): string {
    if (notification.previousPhase === 'work') {
      // Work session just completed
      const breakType = notification.nextPhase === 'long-break' ? 'long break' : 'short break';
      return `🍅 **Pomodoro #${notification.completedPomodoros} completed!** Time for a ${breakType}. Great work! 🎉`;
    } else {
      // Break just completed
      return `⏰ **Break time's up!** Ready to focus on your next work session? Let's go! 💪`;
    }
  }
}
