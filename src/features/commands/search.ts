import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { AnalysisService } from '../analysisService';

const analysisService = new AnalysisService();

export const searchCommand = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Analyze and explain specified content or URL with AI in a dedicated thread')
    .addStringOption(option =>
      option
        .setName('query')
        .setDescription('Text content, topic, or URL to analyze and explain')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString('query', true);

    await interaction.deferReply();

    try {
      console.log(
        `🔍 Processing search request from ${interaction.user.tag}: "${query.substring(0, 50)}..."`
      );

      // Collect context using shared service
      const analysisContext = await analysisService.collectContextIfNeeded(interaction);

      // Process query using shared service
      const result = await analysisService.processQuery(
        {
          query,
          source: 'search-command',
          outputFormat: 'file'
        },
        analysisContext,
        interaction
      );

      // Send result as file attachment
      await analysisService.sendAsFileAttachment(interaction, result, query);

      console.log('✅ Search analysis completed successfully');
    } catch (error) {
      await analysisService.handleError(interaction, error, query);
    }
  },
};
