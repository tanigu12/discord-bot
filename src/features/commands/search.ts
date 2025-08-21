import { ChatInputCommandInteraction, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { ContextCollectorService } from '../../services/contextCollectorService';
import { ResponseHandlerManager } from '../search/response-handlers';
import { TextAggregator } from '../../utils/textAggregator';

const contextCollector = new ContextCollectorService();
const responseHandlerManager = new ResponseHandlerManager();

export const searchCommand = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Analyze and explain specified content or URL with AI in a dedicated thread')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Text content, topic, or URL to analyze and explain')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString('query', true);
    
    await interaction.deferReply();

    try {
      console.log(`🔍 Processing search request from ${interaction.user.tag}: "${query.substring(0, 50)}..."`);

      // Collect channel context
      const { context, contextInfo } = await searchCommand.collectContext(interaction);

      // Process content and generate specialized response using handler manager
      const handlerInfo = responseHandlerManager.getHandlerInfo(query);
      console.log(`🎯 Using specialized handler: ${handlerInfo}`);
      
      const fullResponse = await responseHandlerManager.processAndRespond({
        interaction,
        query,
        analysisContext: { context, contextInfo }
      });
      
      // Create aggregated text file instead of sending direct response
      await searchCommand.sendAggregatedResponse(interaction, fullResponse, context, query, handlerInfo);

      console.log('✅ Search analysis completed successfully');

    } catch (error) {
      await searchCommand.handleError(interaction, error, query);
    }
  },


  async collectContext(interaction: ChatInputCommandInteraction): Promise<{context: any, contextInfo: string}> {
    console.log('📖 Collecting conversation context...');
    let context;
    let contextInfo = '';
    
    try {
      context = await contextCollector.collectChannelContext(interaction, 30);
      contextInfo = `\n\n**Context:** Analyzed with ${context.messageCount} recent messages from ${context.participants.length} participants over ${context.timespan}`;
      console.log(`✅ Context collected: ${context.messageCount} messages from ${context.participants.join(', ')}`);
    } catch (error) {
      console.warn('⚠️ Failed to collect context, falling back to regular analysis:', error);
    }
    
    return { context, contextInfo };
  },


  async sendAggregatedResponse(
    interaction: ChatInputCommandInteraction, 
    responseContent: string, 
    context: any, 
    query: string,
    handlerInfo: string
  ): Promise<void> {
    const contextStatus = context ? `📖 Context-aware analysis using ${context.messageCount} recent messages` : '🔍 Standard analysis';
    const contextInfo = context ? `\n\n**Context:** Analyzed with ${context.messageCount} recent messages from ${context.participants.length} participants over ${context.timespan}` : '';
    
    // Generate aggregated text content with line folding
    const aggregatedContent = TextAggregator.aggregateSearchResults(
      query,
      responseContent,
      contextInfo,
      handlerInfo
    );
    
    // Create file attachment
    const fileName = TextAggregator.generateFileName(query);
    const attachment = new AttachmentBuilder(Buffer.from(aggregatedContent, 'utf8'), {
      name: fileName
    });
    
    // Send response with file attachment
    await interaction.editReply({
      content: `✅ **Analysis complete!** ${contextStatus}\n` +
              `💬 Query: \`${this.truncateText(query, 50)}\`\n` +
              `🤖 Handler: ${handlerInfo}\n` +
              `📄 Results exported to attached file with line folding at 100 characters.\n\n` +
              `📎 Download the .txt file above to view the complete analysis.`,
      files: [attachment]
    });
  },

  async handleError(interaction: ChatInputCommandInteraction, error: unknown, query: string): Promise<void> {
    console.error('❌ Error in search command:', error);
    
    const errorMessage = '❌ **Search Error**\n\n';
    const errorDetails = error instanceof Error 
      ? this.categorizeError(error)
      : '• Unknown error occurred\n• Please try again with different content';
    
    if (error instanceof Error) {
      console.error('Detailed error info:', {
        message: error.message,
        stack: error.stack,
        query: query.substring(0, 100)
      });
    }
    
    await interaction.editReply({
      content: errorMessage + errorDetails
    });
  },

  categorizeError(error: Error): string {
    const message = error.message;
    
    if (message.includes('timeout') || message.includes('ECONNABORTED')) {
      return '• **Timeout Error**: The website took too long to respond\n• Try again later or use a different URL';
    }
    
    if (message.includes('403') || message.includes('Access denied')) {
      return '• **Access Denied**: The website blocks automated requests\n• This website cannot be analyzed automatically';
    }
    
    if (message.includes('404') || message.includes('not found')) {
      return '• **Page Not Found**: The URL may be incorrect\n• Please check the URL and try again';
    }
    
    if (message.includes('OPENAI_API_KEY')) {
      return '• **Configuration Error**: AI service is not properly configured\n• Please contact the bot administrator';
    }
    
    if (message.includes('thread')) {
      return '• **Discord Error**: Cannot create thread in this channel\n• Make sure the bot has proper permissions';
    }
    
    return `• **Error Details**: ${message}\n• Please try again or contact support if the issue persists`;
  },



  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
};