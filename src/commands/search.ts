import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { OpenAIService } from '../services/openai';
import { ContentFetcherService } from '../services/contentFetcherService';
import { ContextCollectorService } from '../services/contextCollectorService';

const openaiService = new OpenAIService();
const contentFetcher = new ContentFetcherService();
const contextCollector = new ContextCollectorService();

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

      // Detect if query is a URL
      const isUrl = searchCommand.isValidUrl(query);
      let content = query;
      let sourceInfo = '';

      if (isUrl) {
        console.log('🌐 URL detected, fetching content...');
        try {
          const fetchedContent = await contentFetcher.fetchContent(query);
          content = fetchedContent.content;
          sourceInfo = `\n\n**Source:** ${query}\n**Title:** ${fetchedContent.title || 'Unknown'}`;
          console.log(`✅ Content fetched successfully: ${content.substring(0, 100)}...`);
        } catch (error) {
          console.error('❌ Failed to fetch URL content:', error);
          // Continue with original URL as query
          sourceInfo = `\n\n**Source:** ${query} (content fetch failed, analyzing URL directly)`;
        }
      }

      // Collect channel context
      console.log('📖 Collecting conversation context...');
      let context;
      let contextInfo = '';
      
      try {
        context = await contextCollector.collectChannelContext(interaction, 30); // Last 30 messages
        contextInfo = `\n\n**Context:** Analyzed with ${context.messageCount} recent messages from ${context.participants.length} participants over ${context.timespan}`;
        console.log(`✅ Context collected: ${context.messageCount} messages from ${context.participants.join(', ')}`);
      } catch (error) {
        console.warn('⚠️ Failed to collect context, falling back to regular analysis:', error);
      }

      // Generate AI analysis with context
      console.log('🤖 Generating context-aware AI analysis...');
      let analysis: string;
      try {
        analysis = context 
          ? await openaiService.analyzeContentWithContext(content, context, isUrl)
          : await openaiService.analyzeContent(content, isUrl);
          
        if (!analysis || analysis.trim().length === 0) {
          throw new Error('AI service returned empty response');
        }
      } catch (aiError) {
        console.error('❌ AI analysis failed:', aiError);
        throw new Error(`AI analysis failed: ${aiError instanceof Error ? aiError.message : 'Unknown AI error'}`);
      }

      // Prepare response message
      const responseMessage = `${analysis}${sourceInfo}${contextInfo}`;
      const contextStatus = context ? `📖 Context-aware analysis using ${context.messageCount} recent messages` : '🔍 Standard analysis';

      // Send analysis directly as reply
      const directReplyHeader = `✅ **Analysis complete!** ${contextStatus}\n💬 Direct response for: \`${searchCommand.truncateText(query, 50)}\`\n\n`;
      const fullDirectReply = directReplyHeader + responseMessage;
      
      // Split long messages for direct reply
      await searchCommand.sendLongMessageDirect(interaction, fullDirectReply);

      console.log('✅ Search analysis completed successfully');

    } catch (error) {
      console.error('❌ Error in search command:', error);
      
      let errorMessage = '❌ **Search Error**\n\n';
      let errorDetails = '';
      
      if (error instanceof Error) {
        // Categorize error types for better user feedback
        if (error.message.includes('timeout') || error.message.includes('ECONNABORTED')) {
          errorDetails = '• **Timeout Error**: The website took too long to respond\n• Try again later or use a different URL';
        } else if (error.message.includes('403') || error.message.includes('Access denied')) {
          errorDetails = '• **Access Denied**: The website blocks automated requests\n• This website cannot be analyzed automatically';
        } else if (error.message.includes('404') || error.message.includes('not found')) {
          errorDetails = '• **Page Not Found**: The URL may be incorrect\n• Please check the URL and try again';
        } else if (error.message.includes('OPENAI_API_KEY')) {
          errorDetails = '• **Configuration Error**: AI service is not properly configured\n• Please contact the bot administrator';
        } else if (error.message.includes('thread')) {
          errorDetails = '• **Discord Error**: Cannot create thread in this channel\n• Make sure the bot has proper permissions';
        } else {
          errorDetails = `• **Error Details**: ${error.message}\n• Please try again or contact support if the issue persists`;
        }
        
        console.error('Detailed error info:', {
          message: error.message,
          stack: error.stack,
          query: query.substring(0, 100)
        });
      } else {
        errorDetails = '• Unknown error occurred\n• Please try again with different content';
      }
      
      await interaction.editReply({
        content: errorMessage + errorDetails
      });
    }
  },

  isValidUrl(string: string): boolean {
    try {
      const url = new URL(string);
      return ['http:', 'https:'].includes(url.protocol);
    } catch (_) {
      return false;
    }
  },



  async sendLongMessageDirect(interaction: ChatInputCommandInteraction, message: string): Promise<void> {
    const maxLength = 2000;
    
    if (message.length <= maxLength) {
      await interaction.editReply({ content: message });
      return;
    }

    // Split message into chunks
    const chunks = [];
    let currentChunk = '';
    const lines = message.split('\n');

    for (const line of lines) {
      if (currentChunk.length + line.length + 1 > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = line;
        } else {
          // Line itself is too long, force split
          chunks.push(line.substring(0, maxLength));
          currentChunk = line.substring(maxLength);
        }
      } else {
        currentChunk += (currentChunk ? '\n' : '') + line;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    // Send first chunk as edit reply, rest as follow-up messages
    if (chunks.length > 0) {
      await interaction.editReply({ content: chunks[0] });
      
      // Send remaining chunks as follow-up messages
      for (let i = 1; i < chunks.length; i++) {
        await interaction.followUp({ content: chunks[i] });
        if (i < chunks.length - 1) {
          // Small delay between messages to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
  },

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
};