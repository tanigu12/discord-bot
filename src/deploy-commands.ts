import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
import { translateCommand } from './commands/translate';
import { grammarCommand } from './commands/grammar';
import { explainCommand } from './commands/explain';
import { randomCommand } from './commands/random';

dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show emoji reaction guide for AI assistant'),
  translateCommand.data,
  grammarCommand.data,
  explainCommand.data,
  randomCommand.data,
].map(command => command.toJSON());

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // Make sure you have these environment variables set
    const clientId = process.env.CLIENT_ID!;
    const guildId = process.env.GUILD_ID; // Optional: for guild-specific commands during development

    let data: any;
    
    if (guildId) {
      // Register commands for a specific guild (faster for development)
      data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );
      console.log(`Successfully reloaded ${data.length} application (/) commands for guild ${guildId}.`);
    } else {
      // Register commands globally (takes up to 1 hour to sync)
      data = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands },
      );
      console.log(`Successfully reloaded ${data.length} application (/) commands globally.`);
    }
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
})();