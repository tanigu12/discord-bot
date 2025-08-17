import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { AsanaService } from '../../services/asanaService';

const asanaService = new AsanaService({
  clientId: process.env.ASANA_CLIENT_ID || '',
  clientSecret: process.env.ASANA_CLIENT_SECRET || '',
  redirectUri: process.env.ASANA_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob'
});

// Store user tokens temporarily (in production, use a database)
const userTokens = new Map<string, string>();

export const asanaCommand = {
  data: new SlashCommandBuilder()
    .setName('asana')
    .setDescription('Manage Asana tasks from Discord')
    .addSubcommand(subcommand =>
      subcommand
        .setName('auth')
        .setDescription('Authenticate with Asana')
        .addStringOption(option =>
          option
            .setName('code')
            .setDescription('OAuth authorization code from Asana')
            .setRequired(false)
        )
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
    const userId = interaction.user.id;

    try {
      switch (subcommand) {
        case 'auth':
          await handleAuth(interaction, userId);
          break;
        case 'create':
          await handleCreateTask(interaction, userId);
          break;
        case 'list':
          await handleListTasks(interaction, userId);
          break;
        case 'complete':
          await handleCompleteTask(interaction, userId);
          break;
        case 'workspaces':
          await handleListWorkspaces(interaction, userId);
          break;
        case 'projects':
          await handleListProjects(interaction, userId);
          break;
        default:
          await interaction.reply({
            content: 'Unknown subcommand.',
            ephemeral: true
          });
      }
    } catch (error) {
      console.error('Asana command error:', error);
      await interaction.reply({
        content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        ephemeral: true
      });
    }
  }
};

async function handleAuth(interaction: ChatInputCommandInteraction, userId: string) {
  const code = interaction.options.getString('code');

  if (!code) {
    // Generate authorization URL
    const authUrl = asanaService.getAuthorizationUrl();
    
    const embed = new EmbedBuilder()
      .setTitle('🔐 Asana Authentication')
      .setDescription('To authenticate with Asana, please follow these steps:')
      .addFields(
        {
          name: 'Step 1',
          value: `[Click here to authorize](${authUrl})`,
          inline: false
        },
        {
          name: 'Step 2',
          value: 'Copy the authorization code from the response',
          inline: false
        },
        {
          name: 'Step 3',
          value: 'Run `/asana auth code:<your_code>`',
          inline: false
        }
      )
      .setColor(0x00ff00)
      .setFooter({ text: 'This authorization expires in 1 hour' });

    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  try {
    const accessToken = await asanaService.authenticateWithCode(code);
    userTokens.set(userId, accessToken);

    // Get user info to confirm authentication
    await asanaService.authenticateWithToken(accessToken);
    const user = await asanaService.getCurrentUser();

    const embed = new EmbedBuilder()
      .setTitle('✅ Authentication Successful')
      .setDescription(`Successfully authenticated as **${user.name}** (${user.email})`)
      .setColor(0x00ff00)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (error) {
    throw new Error(`Authentication failed: ${error}`);
  }
}

async function handleCreateTask(interaction: ChatInputCommandInteraction, userId: string) {
  const accessToken = userTokens.get(userId);
  if (!accessToken) {
    throw new Error('Please authenticate with Asana first using `/asana auth`');
  }

  const name = interaction.options.getString('name', true);
  const notes = interaction.options.getString('notes') || '';
  const projectGid = interaction.options.getString('project') || undefined;
  const dueDate = interaction.options.getString('due_date');

  await asanaService.authenticateWithToken(accessToken);

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

  await interaction.reply({ embeds: [embed] });
}

async function handleListTasks(interaction: ChatInputCommandInteraction, userId: string) {
  const accessToken = userTokens.get(userId);
  if (!accessToken) {
    throw new Error('Please authenticate with Asana first using `/asana auth`');
  }

  const projectGid = interaction.options.getString('project') || undefined;
  const showCompleted = interaction.options.getBoolean('completed') || false;

  await asanaService.authenticateWithToken(accessToken);
  const tasks = await asanaService.getTasks(projectGid);

  const filteredTasks = showCompleted ? tasks : tasks.filter(task => !task.completed);

  if (filteredTasks.length === 0) {
    await interaction.reply({
      content: '📝 No tasks found.',
      ephemeral: true
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

  await interaction.reply({ embeds: [embed] });
}

async function handleCompleteTask(interaction: ChatInputCommandInteraction, userId: string) {
  const accessToken = userTokens.get(userId);
  if (!accessToken) {
    throw new Error('Please authenticate with Asana first using `/asana auth`');
  }

  const taskGid = interaction.options.getString('task_gid', true);

  await asanaService.authenticateWithToken(accessToken);
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

  await interaction.reply({ embeds: [embed] });
}

async function handleListWorkspaces(interaction: ChatInputCommandInteraction, userId: string) {
  const accessToken = userTokens.get(userId);
  if (!accessToken) {
    throw new Error('Please authenticate with Asana first using `/asana auth`');
  }

  await asanaService.authenticateWithToken(accessToken);
  const workspaces = await asanaService.getWorkspaces();

  const embed = new EmbedBuilder()
    .setTitle('🏢 Your Asana Workspaces')
    .setColor(0x0099ff)
    .setTimestamp();

  const workspaceList = workspaces.map((ws: any, index: number) => {
    return `${index + 1}. **${ws.name}**\n   \`GID: ${ws.gid}\``;
  }).join('\n\n');

  embed.setDescription(workspaceList);

  await interaction.reply({ embeds: [embed] });
}

async function handleListProjects(interaction: ChatInputCommandInteraction, userId: string) {
  const accessToken = userTokens.get(userId);
  if (!accessToken) {
    throw new Error('Please authenticate with Asana first using `/asana auth`');
  }

  const workspaceGid = interaction.options.getString('workspace') as string;

  await asanaService.authenticateWithToken(accessToken);
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

  await interaction.reply({ embeds: [embed] });
}