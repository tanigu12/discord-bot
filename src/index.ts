import { Client, Events, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';
import { randomCommand, formatCommand, bskyCommand, asanaCommand } from './features/commands';
import { ReactionHandler } from './features/reactions';
import { TranslationHandler } from './features/translation';
import { IdeaHandler } from './features/ideas';
import { ResearchHandler } from './features/research';
import { BotHandler } from './features/bot-mention';

dotenv.config();

interface ExtendedClient extends Client {
  commands?: Collection<string, any>;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
}) as ExtendedClient;

// Initialize commands collection
client.commands = new Collection();
client.commands.set(randomCommand.data.name, randomCommand);
client.commands.set(formatCommand.data.name, formatCommand);
client.commands.set(bskyCommand.data.name, bskyCommand);
client.commands.set(asanaCommand.data.name, asanaCommand);

// Initialize handlers
const reactionHandler = new ReactionHandler();
const translationHandler = new TranslationHandler();
const ideaHandler = new IdeaHandler();
const researchHandler = new ResearchHandler();
const botHandler = new BotHandler();

// Handle bot mentions - provide AI assistance
async function handleBotMention(message: any) {
  try {
    // Extract content from mention using bot handler
    const content = botHandler.extractContentFromMention(message, client.user!.id);

    // Use bot handler for AI assistance
    await botHandler.handleBotMention(message, content);
  } catch (error) {
    console.error('💥 Error handling bot mention:', error);
    await message.reply(
      'Sorry, something went wrong while processing your request. Please try again!'
    );
  }
}

client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  const intents = readyClient.options.intents;
  console.log(`🎯 Bot intents bitfield:`, intents?.bitfield);

  // Check individual intents
  if (intents?.has('Guilds')) console.log('✅ Guilds intent enabled');
  if (intents?.has('GuildMessages')) console.log('✅ GuildMessages intent enabled');
  if (intents?.has('GuildMessageReactions')) console.log('✅ GuildMessageReactions intent enabled');
  if (intents?.has('MessageContent')) console.log('✅ MessageContent intent enabled');

  console.log(`📡 Listening for messages and reactions...`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // Handle ping command (keep original basic functionality)
  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
    return;
  }

  // Handle help command for emoji reactions
  if (interaction.commandName === 'help') {
    await interaction.reply({
      content: reactionHandler.getEmojiGuide(),
      ephemeral: true,
    });
    return;
  }

  // Handle other commands from the collection
  const command = client.commands?.get(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}:`, error);
    const reply = {
      content: 'There was an error while executing this command!',
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

// Handle new messages - check for translation channel, idea channel, Larry consult channel, mentions, and emoji reactions
client.on(Events.MessageCreate, async message => {
  try {
    if (!message.author.bot) {
      console.log(
        `📨 Message received from ${message.author.tag}: "${message.content?.substring(0, 30)}..."`
      );

      // Check for bot mentions first (highest priority)
      if (message.mentions.has(client.user!.id)) {
        console.log('📨 Bot mention detected, processing mention...');
        await handleBotMention(message);
      }

      // Check if this is a translation channel message
      if (translationHandler.isTranslationChannel(message)) {
        console.log('🌐 Translation channel detected, processing auto-translation...');
        await translationHandler.handleTranslationMessage(message);
      }

      // Check if this is an idea channel message
      if (ideaHandler.isIdeaChannel(message)) {
        console.log('💡 Idea channel detected, processing idea message...');
        await ideaHandler.handleIdeaMessage(message);
      }

      // Check if this is a research channel message
      if (researchHandler.isResearchChannel(message)) {
        console.log('🔬 Research channel detected, processing research request...');
        await researchHandler.handleResearchMessage(message);
      }
    }
  } catch (error) {
    console.error('💥 Error processing message:', error);
  }
});

// Handle message reactions
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  try {
    console.log(`🔔 Reaction received: ${reaction.emoji.name} from ${user.tag}`);

    // When a reaction is received, check if the structure is partial
    if (reaction.partial) {
      console.log('⏳ Reaction is partial, fetching...');
      try {
        await reaction.fetch();
      } catch (error) {
        console.error('❌ Error fetching partial reaction:', error);
        return;
      }
    }

    // Check if message is partial and fetch it
    if (reaction.message.partial) {
      console.log('⏳ Message is partial, fetching...');
      try {
        await reaction.message.fetch();
      } catch (error) {
        console.error('❌ Error fetching partial message:', error);
        return;
      }
    }

    console.log(`📄 Message content preview: "${reaction.message.content?.substring(0, 50)}..."`);
    console.log('🚀 Calling reaction handler...');

    await reactionHandler.handleReaction(reaction, user);
    console.log('✅ Reaction handler completed');
  } catch (error) {
    console.error('💥 Error in MessageReactionAdd event:', error);
  }
});

// Optional: Handle reaction removal (you can add cleanup logic here if needed)
client.on(Events.MessageReactionRemove, async (reaction, _user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the message:', error);
      return;
    }
  }
  // For now, we don't need to do anything when reactions are removed
});

// Enhanced error handling for production
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', error => {
  console.error('🚨 Uncaught Exception thrown:', error);
  // Attempt graceful shutdown
  process.exit(1);
});

// Handle client errors for reconnection
client.on(Events.Error, error => {
  console.error('🔴 Discord client error:', error);
});

client.on(Events.Warn, info => {
  console.warn('⚠️  Discord client warning:', info);
});

// Handle disconnections
client.on(Events.ShardDisconnect, (event, shardId) => {
  console.log(`🔌 Shard ${shardId} disconnected. Event:`, event);
});

client.on(Events.ShardReconnecting, shardId => {
  console.log(`🔄 Shard ${shardId} reconnecting...`);
});

client.on(Events.ShardReady, shardId => {
  console.log(`✅ Shard ${shardId} ready!`);
});

// Login with retry logic
const loginWithRetry = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await client.login(process.env.DISCORD_TOKEN);
      console.log('🎉 Bot logged in successfully!');
      break;
    } catch (error) {
      console.error(`❌ Login attempt ${i + 1} failed:`, error);
      if (i === retries - 1) {
        console.error('🚨 All login attempts failed. Exiting...');
        process.exit(1);
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// Start the bot
loginWithRetry();
