import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { OpenAIService } from '../services/openai';

const openaiService = new OpenAIService();

export const grammarCommand = {
  data: new SlashCommandBuilder()
    .setName('grammar')
    .setDescription('Check grammar and get corrections for your text')
    .addStringOption(option =>
      option
        .setName('text')
        .setDescription('Text to check for grammar')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const text = interaction.options.getString('text', true);

    await interaction.deferReply();

    try {
      const grammarCheck = await openaiService.checkGrammar(text);
      
      await interaction.editReply({
        content: `**Original text:** ${text}\n\n**Grammar check:**\n${grammarCheck}`
      });
    } catch (error) {
      console.error('Grammar command error:', error);
      await interaction.editReply({
        content: 'Sorry, I encountered an error while checking grammar. Please try again later.'
      });
    }
  }
};