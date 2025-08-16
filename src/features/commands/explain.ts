import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { TranslationService } from '../translation/translationService';

const translationService = new TranslationService();

export const explainCommand = {
  data: new SlashCommandBuilder()
    .setName('explain')
    .setDescription('Get detailed explanation of an English word')
    .addStringOption(option =>
      option
        .setName('word')
        .setDescription('Word to explain')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const word = interaction.options.getString('word', true);

    await interaction.deferReply();

    try {
      const explanation = await translationService.explainWord(word);
      
      await interaction.editReply({
        content: `**Word:** ${word}\n\n${explanation}`
      });
    } catch (error) {
      console.error('Explain command error:', error);
      await interaction.editReply({
        content: 'Sorry, I encountered an error while explaining the word. Please try again later.'
      });
    }
  }
};