import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ContentAggregationService, RandomContentEmbedFormatter } from '../content-aggregation';

const contentAggregationService = new ContentAggregationService();
const embedFormatter = new RandomContentEmbedFormatter();

export const randomCommand = {
  data: new SlashCommandBuilder()
    .setName('random')
    .setDescription(
      'Get diary topics, technical questions, English phrases, and your current tasks'
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      console.log(`📝 Generating content for ${interaction.user.tag}`);

      // Aggregate all content using the service
      const content = await contentAggregationService.aggregateRandomContent({
        technicalQuestionCount: 3,
        englishPhraseCount: 3,
        debateQuestionCount: 2,
        maxAsanaTasks: 10,
        includeNews: true,
        includeDiary: true,
        includeAsana: true,
      });

      // Create comprehensive response with main embed and follow-up messages
      await embedFormatter.createRandomContentResponse(content, interaction.user, interaction);
      console.log('✅ Random content generated successfully');
    } catch (error) {
      console.error('❌ Error generating random content:', error);

      // Get fallback content and create fallback embed
      const fallbackContent = contentAggregationService.getFallbackContent(3, 3, 2);
      const fallbackEmbed = embedFormatter.createFallbackEmbed(
        fallbackContent.technicalQuestions,
        fallbackContent.englishPhrases,
        fallbackContent.debateQuestions
      );

      await interaction.editReply({
        embeds: [fallbackEmbed],
        content: '⚠️ Having trouble fetching some data, but here are great topics and questions!',
      });
    }
  },
};
