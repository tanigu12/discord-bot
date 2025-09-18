import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ThreadChannel,
  TextChannel,
  NewsChannel,
} from 'discord.js';
import { PomodoroService, PomodoroFormatter } from '../pomodoro';
import { CoachingMessage, PhaseCompletionNotification, AutoStatusUpdate } from '../pomodoro/types';

const pomodoroService = new PomodoroService();
const pomodoroFormatter = new PomodoroFormatter();

export const pomodoroCommand = {
  data: new SlashCommandBuilder()
    .setName('pomodoro')
    .setDescription('Manage your pomodoro focus sessions')
    .addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription('Start a new pomodoro session')
        .addIntegerOption(option =>
          option
            .setName('work')
            .setDescription('Work duration in minutes (default: 25)')
            .setMinValue(1)
            .setMaxValue(120)
        )
        .addIntegerOption(option =>
          option
            .setName('short-break')
            .setDescription('Short break duration in minutes (default: 5)')
            .setMinValue(1)
            .setMaxValue(30)
        )
        .addIntegerOption(option =>
          option
            .setName('long-break')
            .setDescription('Long break duration in minutes (default: 15)')
            .setMinValue(1)
            .setMaxValue(60)
        )
    )
    .addSubcommand(subcommand =>
      subcommand.setName('pause').setDescription('Pause your current pomodoro session')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('resume').setDescription('Resume your paused pomodoro session')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('stop').setDescription('Stop your current pomodoro session')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('status').setDescription('Check your current pomodoro session status')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('config').setDescription('View your current pomodoro configuration')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('coach')
        .setDescription('Get AI coaching for your current session')
        .addStringOption(option =>
          option
            .setName('type')
            .setDescription('Type of coaching message')
            .setRequired(true)
            .addChoices(
              { name: '💪 Motivation', value: 'motivation' },
              { name: '🤔 Reflection', value: 'reflection' }
            )
        )
    )
    .addSubcommand(subcommand =>
      subcommand.setName('insight').setDescription('Get personalized performance insights')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('coaching-config')
        .setDescription('Configure your AI coaching preferences')
        .addStringOption(option =>
          option
            .setName('style')
            .setDescription('Preferred coaching style')
            .addChoices(
              { name: 'Encouraging', value: 'encouraging' },
              { name: 'Neutral', value: 'neutral' },
              { name: 'Challenging', value: 'challenging' }
            )
        )
        .addStringOption(option =>
          option.setName('goals').setDescription('Your goals (comma-separated)')
        )
        .addStringOption(option =>
          option.setName('keywords').setDescription('Motivational keywords (comma-separated)')
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;
    const channelId = interaction.channelId;

    try {
      switch (subcommand) {
        case 'start':
          await handleStart(interaction, userId, channelId);
          break;
        case 'pause':
          await handlePause(interaction, userId);
          break;
        case 'resume':
          await handleResume(interaction, userId);
          break;
        case 'stop':
          await handleStop(interaction, userId);
          break;
        case 'status':
          await handleStatus(interaction, userId);
          break;
        case 'config':
          await handleConfig(interaction);
          break;
        case 'coach':
          await handleCoach(interaction, userId);
          break;
        case 'insight':
          await handleInsight(interaction, userId);
          break;
        case 'coaching-config':
          await handleCoachingConfig(interaction, userId);
          break;
        default:
          await interaction.reply({
            embeds: [pomodoroFormatter.createErrorEmbed('Unknown Command', 'Invalid subcommand.')],
            ephemeral: true,
          });
      }
    } catch (error) {
      console.error('❌ Error executing pomodoro command:', error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          embeds: [
            pomodoroFormatter.createErrorEmbed(
              'Command Error',
              'Something went wrong. Please try again.'
            ),
          ],
          ephemeral: true,
        });
      }
    }
  },
};

async function handleStart(
  interaction: ChatInputCommandInteraction,
  userId: string,
  channelId: string
) {
  if (pomodoroService.hasActiveSession(userId)) {
    await interaction.reply({
      embeds: [
        pomodoroFormatter.createErrorEmbed(
          'Session Active',
          'You already have an active pomodoro session. Use `/pomodoro stop` to end it first.'
        ),
      ],
      ephemeral: true,
    });
    return;
  }

  const workDuration = interaction.options.getInteger('work');
  const shortBreakDuration = interaction.options.getInteger('short-break');
  const longBreakDuration = interaction.options.getInteger('long-break');

  const config = {
    ...(workDuration && { workDuration }),
    ...(shortBreakDuration && { shortBreakDuration }),
    ...(longBreakDuration && { longBreakDuration }),
  };

  const started = pomodoroService.startSession(userId, channelId, config);

  if (!started) {
    await interaction.reply({
      embeds: [
        pomodoroFormatter.createErrorEmbed('Failed to Start', 'Could not start pomodoro session.'),
      ],
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply();

  try {
    const thread = await createPomodoroThread(interaction);
    if (thread) {
      pomodoroService.setThreadId(userId, thread.id);

      // Set up coaching callback for AI messages in thread
      pomodoroService.setCoachingCallback(userId, async (message: CoachingMessage) => {
        try {
          const coachingEmbed = pomodoroFormatter.createCoachingEmbed(interaction.user, message);
          await thread.send({ embeds: [coachingEmbed] });
        } catch (error) {
          console.error('❌ Error sending coaching message to thread:', error);
        }
      });

      // Set up Discord notification callback for timer completions and auto-status
      pomodoroService.setDiscordNotificationCallback(
        userId,
        async (notification: PhaseCompletionNotification | AutoStatusUpdate) => {
          try {
            // Check if this is an AutoStatusUpdate or PhaseCompletionNotification
            if ('status' in notification) {
              // AutoStatusUpdate
              const autoStatusEmbed = pomodoroFormatter.createAutoStatusEmbed(
                interaction.user,
                notification as AutoStatusUpdate
              );
              await thread.send({ embeds: [autoStatusEmbed] });
            } else {
              // PhaseCompletionNotification
              const completionEmbed = pomodoroFormatter.createPhaseCompletionEmbed(
                interaction.user,
                notification as PhaseCompletionNotification
              );
              const autoMessage = pomodoroFormatter.createAutoTimerMessage(
                notification as PhaseCompletionNotification
              );

              // Send both embed and text message to thread
              await thread.send({
                content: autoMessage,
                embeds: [completionEmbed],
              });

              // Also send a simple message to the main channel to get user's attention
              if (interaction.channel && 'send' in interaction.channel) {
                const phaseNotification = notification as PhaseCompletionNotification;
                const channelMessage =
                  phaseNotification.previousPhase === 'work'
                    ? `🍅 <@${userId}> Pomodoro #${phaseNotification.completedPomodoros} completed! Time for a break!`
                    : `⏰ <@${userId}> Break's over! Ready for your next focus session?`;

                await interaction.channel.send(channelMessage);
              }
            }
          } catch (error) {
            console.error('❌ Error sending Discord notification:', error);
          }
        }
      );
    } else {
      // Fallback: set up notification callback to send to main channel if no thread
      pomodoroService.setDiscordNotificationCallback(
        userId,
        async (notification: PhaseCompletionNotification | AutoStatusUpdate) => {
          try {
            if (interaction.channel && 'send' in interaction.channel) {
              if ('status' in notification) {
                // AutoStatusUpdate - send to main channel but less prominently
                const autoStatusEmbed = pomodoroFormatter.createAutoStatusEmbed(
                  interaction.user,
                  notification as AutoStatusUpdate
                );
                await interaction.channel.send({ embeds: [autoStatusEmbed] });
              } else {
                // PhaseCompletionNotification
                const autoMessage = pomodoroFormatter.createAutoTimerMessage(
                  notification as PhaseCompletionNotification
                );
                const completionEmbed = pomodoroFormatter.createPhaseCompletionEmbed(
                  interaction.user,
                  notification as PhaseCompletionNotification
                );

                await interaction.channel.send({
                  content: `<@${userId}> ${autoMessage}`,
                  embeds: [completionEmbed],
                });
              }
            }
          } catch (error) {
            console.error('❌ Error sending Discord notification to main channel:', error);
          }
        }
      );
    }

    const finalConfig = { ...pomodoroService.getDefaultConfig(), ...config };
    const embed = pomodoroFormatter.createStartEmbed(interaction.user, finalConfig);

    await interaction.editReply({ embeds: [embed] });

    if (thread) {
      const status = pomodoroService.getStatus(userId);
      if (status) {
        const statusEmbed = pomodoroFormatter.createStatusEmbed(interaction.user, status);
        await thread.send({ embeds: [statusEmbed] });
      }
    }
  } catch (error) {
    console.error('❌ Error creating thread:', error);
    const finalConfig = { ...pomodoroService.getDefaultConfig(), ...config };
    const embed = pomodoroFormatter.createStartEmbed(interaction.user, finalConfig);
    await interaction.editReply({ embeds: [embed] });
  }
}

async function handlePause(interaction: ChatInputCommandInteraction, userId: string) {
  const paused = pomodoroService.pauseSession(userId);

  if (!paused) {
    await interaction.reply({
      embeds: [
        pomodoroFormatter.createErrorEmbed(
          'Cannot Pause',
          'No active session found or session is already paused.'
        ),
      ],
      ephemeral: true,
    });
    return;
  }

  const embed = pomodoroFormatter.createPausedEmbed(interaction.user);
  await interaction.reply({ embeds: [embed] });
}

async function handleResume(interaction: ChatInputCommandInteraction, userId: string) {
  const resumed = pomodoroService.resumeSession(userId);

  if (!resumed) {
    await interaction.reply({
      embeds: [pomodoroFormatter.createErrorEmbed('Cannot Resume', 'No paused session found.')],
      ephemeral: true,
    });
    return;
  }

  const embed = pomodoroFormatter.createResumedEmbed(interaction.user);
  await interaction.reply({ embeds: [embed] });
}

async function handleStop(interaction: ChatInputCommandInteraction, userId: string) {
  const stats = pomodoroService.stopSession(userId);

  if (!stats) {
    await interaction.reply({
      embeds: [
        pomodoroFormatter.createErrorEmbed('No Session', 'No active pomodoro session found.'),
      ],
      ephemeral: true,
    });
    return;
  }

  const embed = pomodoroFormatter.createStoppedEmbed(interaction.user, stats);
  await interaction.reply({ embeds: [embed] });
}

async function handleStatus(interaction: ChatInputCommandInteraction, userId: string) {
  const status = pomodoroService.getStatus(userId);

  if (!status) {
    await interaction.reply({
      embeds: [
        pomodoroFormatter.createErrorEmbed('No Session', 'No active pomodoro session found.'),
      ],
      ephemeral: true,
    });
    return;
  }

  const embed = pomodoroFormatter.createStatusEmbed(interaction.user, status);
  await interaction.reply({ embeds: [embed] });

  // Generate reflection message for active sessions (not paused)
  if (!status.isPaused && pomodoroService.hasActiveSession(userId)) {
    try {
      const reflectionContent = await pomodoroService.generateCoachingMessage(userId, 'reflection');

      if (reflectionContent) {
        const reflectionMessage: CoachingMessage = {
          type: 'reflection',
          content: reflectionContent,
          timestamp: new Date(),
        };

        const reflectionEmbed = pomodoroFormatter.createCoachingEmbed(
          interaction.user,
          reflectionMessage
        );

        // Try to send in thread if available, otherwise follow-up in channel
        const threadId = pomodoroService.getThreadId(userId);
        if (threadId && interaction.guild) {
          try {
            const thread = await interaction.guild.channels.fetch(threadId);
            if (thread?.isThread()) {
              await thread.send({ embeds: [reflectionEmbed] });
            } else {
              await interaction.followUp({ embeds: [reflectionEmbed] });
            }
          } catch {
            await interaction.followUp({ embeds: [reflectionEmbed] });
          }
        } else {
          await interaction.followUp({ embeds: [reflectionEmbed] });
        }
      }
    } catch (error) {
      // Gracefully handle reflection generation failures
      console.warn('⚠️ Could not generate reflection for status command:', error);
      // Don't send error to user - reflection is optional enhancement
    }
  }
}

async function handleConfig(interaction: ChatInputCommandInteraction) {
  const config = pomodoroService.getDefaultConfig();
  const embed = pomodoroFormatter.createConfigEmbed(interaction.user, config);
  await interaction.reply({ embeds: [embed] });
}

async function createPomodoroThread(
  interaction: ChatInputCommandInteraction
): Promise<ThreadChannel | null> {
  if (!interaction.channel || !interaction.channel.isTextBased()) {
    return null;
  }

  if (!('threads' in interaction.channel)) {
    return null;
  }

  const channel = interaction.channel as TextChannel | NewsChannel;

  try {
    const thread = await channel.threads.create({
      name: `🍅 ${interaction.user.displayName}'s Pomodoro`,
      autoArchiveDuration: 60,
      reason: 'Pomodoro session tracking',
    });

    return thread;
  } catch (error) {
    console.error('❌ Error creating pomodoro thread:', error);
    return null;
  }
}

async function handleCoach(interaction: ChatInputCommandInteraction, userId: string) {
  if (!pomodoroService.hasActiveSession(userId)) {
    await interaction.reply({
      embeds: [
        pomodoroFormatter.createErrorEmbed(
          'No Session',
          'You need an active pomodoro session to get AI coaching.'
        ),
      ],
      ephemeral: true,
    });
    return;
  }

  const coachingType = interaction.options.getString('type', true) as 'motivation' | 'reflection';

  await interaction.deferReply();

  try {
    const coachingContent = await pomodoroService.generateCoachingMessage(userId, coachingType);

    if (!coachingContent) {
      await interaction.editReply({
        embeds: [
          pomodoroFormatter.createErrorEmbed(
            'Coaching Error',
            'Unable to generate coaching message. Please try again.'
          ),
        ],
      });
      return;
    }

    const message: CoachingMessage = {
      type: coachingType,
      content: coachingContent,
      timestamp: new Date(),
    };

    const embed = pomodoroFormatter.createCoachingEmbed(interaction.user, message);
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('❌ Error generating coaching message:', error);
    await interaction.editReply({
      embeds: [
        pomodoroFormatter.createErrorEmbed(
          'Coaching Error',
          'An error occurred while generating your coaching message.'
        ),
      ],
    });
  }
}

async function handleInsight(interaction: ChatInputCommandInteraction, userId: string) {
  const insight = pomodoroService.getPerformanceInsight(userId);

  if (!insight) {
    await interaction.reply({
      embeds: [
        pomodoroFormatter.createErrorEmbed(
          'No Session',
          'You need an active pomodoro session to get performance insights.'
        ),
      ],
      ephemeral: true,
    });
    return;
  }

  const embed = pomodoroFormatter.createInsightEmbed(interaction.user, insight);
  await interaction.reply({ embeds: [embed] });
}

async function handleCoachingConfig(interaction: ChatInputCommandInteraction, userId: string) {
  const style = interaction.options.getString('style') as
    | 'encouraging'
    | 'neutral'
    | 'challenging'
    | null;
  const goalsString = interaction.options.getString('goals');
  const keywordsString = interaction.options.getString('keywords');

  const updates: {
    preferredStyle?: 'encouraging' | 'neutral' | 'challenging';
    goals?: string[];
    motivationalKeywords?: string[];
  } = {};

  if (style) {
    updates.preferredStyle = style;
  }
  if (goalsString) {
    updates.goals = goalsString
      .split(',')
      .map(goal => goal.trim())
      .filter(goal => goal.length > 0);
  }
  if (keywordsString) {
    updates.motivationalKeywords = keywordsString
      .split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword.length > 0);
  }

  if (Object.keys(updates).length > 0) {
    pomodoroService.updateUserCoachingProfile(userId, updates);
  }

  const currentProfile = pomodoroService.getUserCoachingProfile(userId);
  const embed = pomodoroFormatter.createCoachingConfigEmbed(
    interaction.user,
    currentProfile.preferredCoachingStyle,
    currentProfile.goals,
    currentProfile.motivationalKeywords
  );

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
