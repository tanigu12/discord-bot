import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { TranslationService } from '../translation/translationService';

const translationService = new TranslationService();

export const translateCommand = {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate text to another language')
    .addStringOption(option =>
      option
        .setName('text')
        .setDescription('Text to translate')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('language')
        .setDescription('Target language')
        .setRequired(true)
        .addChoices(
          { name: 'English', value: 'English' },
          { name: 'Japanese', value: 'Japanese' },
          { name: 'Spanish', value: 'Spanish' },
          { name: 'French', value: 'French' },
          { name: 'German', value: 'German' },
          { name: 'Chinese', value: 'Chinese' },
          { name: 'Korean', value: 'Korean' },
          { name: 'Portuguese', value: 'Portuguese' },
          { name: 'Italian', value: 'Italian' },
          { name: 'Russian', value: 'Russian' }
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const text = interaction.options.getString('text', true);
    const targetLanguage = interaction.options.getString('language', true);

    await interaction.deferReply();

    try {
      const translatedText = await translationService.translateText(text, targetLanguage);
      
      await interaction.editReply({
        content: `**Original:** ${text}\n**Translated to ${targetLanguage}:** ${translatedText}`
      });
    } catch (error) {
      console.error('Translation command error:', error);
      await interaction.editReply({
        content: 'Sorry, I encountered an error while translating. Please try again later.'
      });
    }
  }
};