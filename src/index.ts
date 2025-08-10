import { Client, Events, GatewayIntentBits, Collection } from "discord.js";
import dotenv from "dotenv";
import { translateCommand } from "./commands/translate";
import { grammarCommand } from "./commands/grammar";
import { explainCommand } from "./commands/explain";
import { ReactionHandler } from "./services/reactionHandler";
import { DiaryHandler } from "./services/diaryHandler";

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
client.commands.set(translateCommand.data.name, translateCommand);
client.commands.set(grammarCommand.data.name, grammarCommand);
client.commands.set(explainCommand.data.name, explainCommand);

// Initialize reaction handler and diary handler
const reactionHandler = new ReactionHandler();
const diaryHandler = new DiaryHandler();

client.once(Events.ClientReady, (readyClient) => {
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

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // Handle ping command (keep original basic functionality)
  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
    return;
  }

  // Handle help command for emoji reactions
  if (interaction.commandName === "help") {
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
      content: "There was an error while executing this command!",
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

// Handle new messages - check for diary channel and emoji reactions
client.on(Events.MessageCreate, async (message) => {
  try {
    if (!message.author.bot) {
      console.log(`📨 Message received from ${message.author.tag}: "${message.content?.substring(0, 30)}..."`);
      
      // Check if this is a diary channel message
      if (diaryHandler.isDiaryChannel(message)) {
        console.log('📔 Diary channel detected, processing auto-translation...');
        await diaryHandler.handleDiaryMessage(message);
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
      console.error("Something went wrong when fetching the message:", error);
      return;
    }
  }
  // For now, we don't need to do anything when reactions are removed
});

client.login(process.env.DISCORD_TOKEN);
