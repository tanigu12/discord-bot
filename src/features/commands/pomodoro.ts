import { ChatInputCommandInteraction, SlashCommandBuilder, ThreadChannel, TextChannel, NewsChannel } from 'discord.js';
import { PomodoroService, PomodoroFormatter } from '../pomodoro';

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
      subcommand
        .setName('pause')
        .setDescription('Pause your current pomodoro session')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('resume')
        .setDescription('Resume your paused pomodoro session')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('stop')
        .setDescription('Stop your current pomodoro session')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Check your current pomodoro session status')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('config')
        .setDescription('View your current pomodoro configuration')
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
          embeds: [pomodoroFormatter.createErrorEmbed('Command Error', 'Something went wrong. Please try again.')],
          ephemeral: true,
        });
      }
    }
  },
};

async function handleStart(interaction: ChatInputCommandInteraction, userId: string, channelId: string) {
  if (pomodoroService.hasActiveSession(userId)) {
    await interaction.reply({
      embeds: [pomodoroFormatter.createErrorEmbed('Session Active', 'You already have an active pomodoro session. Use `/pomodoro stop` to end it first.')],
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
      embeds: [pomodoroFormatter.createErrorEmbed('Failed to Start', 'Could not start pomodoro session.')],
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply();

  try {
    const thread = await createPomodoroThread(interaction);
    if (thread) {
      pomodoroService.setThreadId(userId, thread.id);
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
      embeds: [pomodoroFormatter.createErrorEmbed('Cannot Pause', 'No active session found or session is already paused.')],
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
      embeds: [pomodoroFormatter.createErrorEmbed('No Session', 'No active pomodoro session found.')],
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
      embeds: [pomodoroFormatter.createErrorEmbed('No Session', 'No active pomodoro session found.')],
      ephemeral: true,
    });
    return;
  }

  const embed = pomodoroFormatter.createStatusEmbed(interaction.user, status);
  await interaction.reply({ embeds: [embed] });
}

async function handleConfig(interaction: ChatInputCommandInteraction) {
  const config = pomodoroService.getDefaultConfig();
  const embed = pomodoroFormatter.createConfigEmbed(interaction.user, config);
  await interaction.reply({ embeds: [embed] });
}

async function createPomodoroThread(interaction: ChatInputCommandInteraction): Promise<ThreadChannel | null> {
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