import { Client, Events, GatewayIntentBits, Collection } from "discord.js";
import dotenv from "dotenv";
import { translateCommand } from './commands/translate';
import { grammarCommand } from './commands/grammar';
import { explainCommand } from './commands/explain';

dotenv.config();

interface ExtendedClient extends Client {
  commands?: Collection<string, any>;
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
}) as ExtendedClient;

// Initialize commands collection
client.commands = new Collection();
client.commands.set(translateCommand.data.name, translateCommand);
client.commands.set(grammarCommand.data.name, grammarCommand);
client.commands.set(explainCommand.data.name, explainCommand);

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // Handle ping command (keep original basic functionality)
  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
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
    const reply = { content: 'There was an error while executing this command!', ephemeral: true };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
