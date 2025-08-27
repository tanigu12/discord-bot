import { EmbedBuilder, User } from 'discord.js';
import { PomodoroStats, TimerStatus, PomodoroConfig } from './types';

export class PomodoroFormatter {
  createStartEmbed(user: User, config: PomodoroConfig): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0xFF6B6B)
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

  createCompletionEmbed(user: User, stats: PomodoroStats): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0x4ECDC4)
      .setTitle('🎉 Pomodoro Session Complete!')
      .setDescription(`Great job, ${user.displayName}!`)
      .addFields(
        { name: '🍅 Completed Pomodoros', value: `${stats.completedPomodoros}`, inline: true },
        { name: '⏱️ Total Work Time', value: this.formatTime(stats.totalWorkTime), inline: true },
        { name: '☕ Total Break Time', value: this.formatTime(stats.totalBreakTime), inline: true },
        { name: '🔥 Current Streak', value: `${stats.currentStreak} pomodoros`, inline: true }
      )
      .setTimestamp();
  }

  createPausedEmbed(user: User): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0xFFE66D)
      .setTitle('⏸️ Pomodoro Paused')
      .setDescription(`${user.displayName}'s session is paused`)
      .setTimestamp();
  }

  createResumedEmbed(user: User): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0xFF6B6B)
      .setTitle('▶️ Pomodoro Resumed')
      .setDescription(`${user.displayName}'s session is back on track!`)
      .setTimestamp();
  }

  createStoppedEmbed(user: User, stats: PomodoroStats): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0x95A5A6)
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
      .setColor(0x9B59B6)
      .setTitle('⚙️ Pomodoro Configuration')
      .setDescription(`${user.displayName}'s settings`)
      .addFields(
        { name: '⏱️ Work Duration', value: `${config.workDuration} minutes`, inline: true },
        { name: '☕ Short Break', value: `${config.shortBreakDuration} minutes`, inline: true },
        { name: '🛋️ Long Break', value: `${config.longBreakDuration} minutes`, inline: true },
        { name: '🔄 Long Break Interval', value: `Every ${config.longBreakInterval} pomodoros`, inline: true }
      )
      .setTimestamp();
  }

  createErrorEmbed(title: string, description: string): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle(`❌ ${title}`)
      .setDescription(description)
      .setTimestamp();
  }

  createPhaseTransitionMessage(phase: 'work' | 'short-break' | 'long-break', completedPomodoros: number): string {
    const phaseEmoji = this.getPhaseEmoji(phase);
    
    if (phase === 'work') {
      return `${phaseEmoji} Break complete! Time to focus. You've completed ${completedPomodoros} pomodoros.`;
    } else {
      const breakType = phase === 'long-break' ? 'long break' : 'short break';
      return `${phaseEmoji} Great work! Time for a ${breakType}. You've completed ${completedPomodoros} pomodoros.`;
    }
  }

  private getPhaseEmoji(phase: string): string {
    switch (phase) {
      case 'work': return '🍅';
      case 'short-break': return '☕';
      case 'long-break': return '🛋️';
      default: return '⏱️';
    }
  }

  private getPhaseText(phase: string): string {
    switch (phase) {
      case 'work': return 'Focus Time';
      case 'short-break': return 'Short Break';
      case 'long-break': return 'Long Break';
      default: return 'Timer';
    }
  }

  private getPhaseColor(phase: string): number {
    switch (phase) {
      case 'work': return 0xFF6B6B;
      case 'short-break': return 0x4ECDC4;
      case 'long-break': return 0x45B7D1;
      default: return 0x95A5A6;
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
}