import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { AsanaService } from '../../services/asanaService';

// Initialize Asana service with Personal Access Token
let asanaService: AsanaService;

try {
  asanaService = AsanaService.createFromEnvironment();
  console.log('✅ Asana service initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Asana service:', error);
}

export const asanaCommand = {
  data: new SlashCommandBuilder()
    .setName('asana')
    .setDescription('Manage Asana tasks from Discord')
    .addSubcommand(subcommand =>
      subcommand
        .setName('me')
        .setDescription('Show your Asana user information')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new Asana task')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Task name')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('notes')
            .setDescription('Task description/notes')
            .setRequired(false)
        )
        .addStringOption(option =>
          option
            .setName('project')
            .setDescription('Project GID to assign task to')
            .setRequired(false)
        )
        .addStringOption(option =>
          option
            .setName('due_date')
            .setDescription('Due date (YYYY-MM-DD)')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List your Asana tasks')
        .addStringOption(option =>
          option
            .setName('project')
            .setDescription('Project GID to filter tasks')
            .setRequired(false)
        )
        .addBooleanOption(option =>
          option
            .setName('completed')
            .setDescription('Show completed tasks')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('complete')
        .setDescription('Mark a task as completed')
        .addStringOption(option =>
          option
            .setName('task_gid')
            .setDescription('Task GID to complete')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('workspaces')
        .setDescription('List your Asana workspaces')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('projects')
        .setDescription('List projects in a workspace')
        .addStringOption(option =>
          option
            .setName('workspace')
            .setDescription('Workspace GID')
            .setRequired(true)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    // Check if Asana service is available
    if (!asanaService?.isReady()) {
      await interaction.reply({
        content: '❌ **Asana service unavailable**\n\nThe Asana Personal Access Token is not configured. Please check the `ASANA_PERSONAL_ACCESS_TOKEN` environment variable.',
        ephemeral: true
      });
      return;
    }

    try {
      switch (subcommand) {
        case 'me':
          await handleUserInfo(interaction);
          break;
        case 'create':
          await handleCreateTask(interaction);
          break;
        case 'list':
          await handleListTasks(interaction);
          break;
        case 'complete':
          await handleCompleteTask(interaction);
          break;
        case 'workspaces':
          await handleListWorkspaces(interaction);
          break;
        case 'projects':
          await handleListProjects(interaction);
          break;
        default:
          await interaction.reply({
            content: 'Unknown subcommand.',
            ephemeral: true
          });
      }
    } catch (error) {
      console.error('Asana command error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const isAuthError = errorMessage.includes('401') || errorMessage.includes('authentication') || errorMessage.includes('unauthorized');
      
      await interaction.reply({
        content: `❌ **Asana Error**\n\n${errorMessage}${isAuthError ? '\n\n💡 This may be due to an invalid or expired Personal Access Token.' : ''}`,
        ephemeral: true
      });
    }
  }
};

async function handleUserInfo(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const user = await asanaService.getCurrentUser();
    const workspaces = await asanaService.getWorkspaces();

    const embed = new EmbedBuilder()
      .setTitle('👤 Your Asana Information')
      .setDescription(`Connected as **${user.name}**`)
      .addFields(
        { name: 'Email', value: user.email, inline: true },
        { name: 'User ID', value: user.gid, inline: true },
        { name: 'Workspaces', value: `${workspaces.length} workspace(s)`, inline: true }
      )
      .setColor(0x0099ff)
      .setTimestamp();

    if (workspaces.length > 0) {
      const workspaceList = workspaces.slice(0, 3).map(ws => `• **${ws.name}** (${ws.gid})`).join('\n');
      embed.addFields({ 
        name: 'Available Workspaces', 
        value: workspaceList + (workspaces.length > 3 ? `\n... and ${workspaces.length - 3} more` : ''),
        inline: false 
      });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw new Error(`Failed to get user information: ${error}`);
  }
}

async function handleCreateTask(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const name = interaction.options.getString('name', true);
  const notes = interaction.options.getString('notes') || '';
  const projectGid = interaction.options.getString('project') || undefined;
  const dueDate = interaction.options.getString('due_date');

  const taskData: any = {
    name,
    notes,
    projects: projectGid ? [projectGid] : []
  };

  if (dueDate) {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dueDate)) {
      throw new Error('Due date must be in YYYY-MM-DD format');
    }
    taskData.due_on = dueDate;
  }

  const task = await asanaService.createTask(taskData);

  const embed = new EmbedBuilder()
    .setTitle('✅ Task Created')
    .setDescription(`**${task.name}**`)
    .addFields(
      { name: 'Task GID', value: task.gid, inline: true },
      { name: 'Permalink', value: `[View in Asana](${task.permalink_url})`, inline: false }
    )
    .setColor(0x00ff00)
    .setTimestamp();

  if (notes) {
    embed.addFields({ name: 'Notes', value: notes, inline: false });
  }

  if (dueDate) {
    embed.addFields({ name: 'Due Date', value: dueDate, inline: true });
  }

  await interaction.editReply({ embeds: [embed] });
}

async function handleListTasks(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const projectGid = interaction.options.getString('project') || undefined;
  const showCompleted = interaction.options.getBoolean('completed') || false;
  const tasks = await asanaService.getTasks(projectGid);

  const filteredTasks = showCompleted ? tasks : tasks.filter(task => !task.completed);

  if (filteredTasks.length === 0) {
    await interaction.editReply({
      content: '📝 No tasks found.'
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle('📋 Your Asana Tasks')
    .setColor(0x0099ff)
    .setTimestamp();

  const taskList = filteredTasks.slice(0, 10).map((task, index) => {
    const status = task.completed ? '✅' : '⏳';
    const dueDate = task.due_on ? ` (Due: ${task.due_on})` : '';
    return `${index + 1}. ${status} **${task.name}**${dueDate}\n   \`GID: ${task.gid}\``;
  }).join('\n\n');

  embed.setDescription(taskList);

  if (filteredTasks.length > 10) {
    embed.setFooter({ text: `Showing 10 of ${filteredTasks.length} tasks` });
  }

  await interaction.editReply({ embeds: [embed] });
}

async function handleCompleteTask(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const taskGid = interaction.options.getString('task_gid', true);
  const task = await asanaService.completeTask(taskGid);

  const embed = new EmbedBuilder()
    .setTitle('✅ Task Completed')
    .setDescription(`**${task.name}** has been marked as completed!`)
    .addFields(
      { name: 'Task GID', value: task.gid, inline: true },
      { name: 'Status', value: '✅ Completed', inline: true }
    )
    .setColor(0x00ff00)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleListWorkspaces(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const workspaces = await asanaService.getWorkspaces();

  const embed = new EmbedBuilder()
    .setTitle('🏢 Your Asana Workspaces')
    .setColor(0x0099ff)
    .setTimestamp();

  const workspaceList = workspaces.map((ws: any, index: number) => {
    return `${index + 1}. **${ws.name}**\n   \`GID: ${ws.gid}\``;
  }).join('\n\n');

  embed.setDescription(workspaceList);

  await interaction.editReply({ embeds: [embed] });
}

async function handleListProjects(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const workspaceGid = interaction.options.getString('workspace') as string;
  const projects = await asanaService.getProjects(workspaceGid);

  const embed = new EmbedBuilder()
    .setTitle('📁 Projects in Workspace')
    .setColor(0x0099ff)
    .setTimestamp();

  if (projects.length === 0) {
    embed.setDescription('No projects found in this workspace.');
  } else {
    const projectList = projects.map((project: any, index: number) => {
      return `${index + 1}. **${project.name}**\n   \`GID: ${project.gid}\``;
    }).join('\n\n');

    embed.setDescription(projectList);
  }

  await interaction.editReply({ embeds: [embed] });
}