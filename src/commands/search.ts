import { ChatInputCommandInteraction, SlashCommandBuilder, ThreadChannel } from 'discord.js';
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

      // Create thread for detailed response
      console.log('🧵 Creating thread for response...');
      const thread = await searchCommand.createResponseThread(interaction, query, isUrl);

      // Send analysis to thread
      const responseMessage = `${analysis}${sourceInfo}${contextInfo}`;
      
      // Split long messages if necessary (Discord has 2000 character limit)
      await searchCommand.sendLongMessage(thread, responseMessage);

      // Reply to original interaction
      const contextStatus = context ? `📖 Context-aware analysis using ${context.messageCount} recent messages` : '🔍 Standard analysis';
      await interaction.editReply({
        content: `✅ **Analysis complete!** ${contextStatus}\n🧵 Check the thread below for detailed explanation of: \`${searchCommand.truncateText(query, 50)}\``
      });

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

  async createResponseThread(interaction: ChatInputCommandInteraction, query: string, isUrl: boolean): Promise<ThreadChannel> {
    const channel = interaction.channel;
    if (!channel || !('threads' in channel)) {
      throw new Error('Cannot create thread in this channel type');
    }

    const threadName = isUrl 
      ? `🌐 URL Analysis: ${searchCommand.truncateText(new URL(query).hostname, 20)}`
      : `🔍 Search: ${searchCommand.truncateText(query, 20)}`;

    const thread = await channel.threads.create({
      name: threadName,
      autoArchiveDuration: 1440, // 24 hours
      reason: 'AI content analysis thread'
    });

    return thread;
  },

  async sendLongMessage(thread: ThreadChannel, message: string): Promise<void> {
    const maxLength = 2000;
    
    if (message.length <= maxLength) {
      await thread.send(message);
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

    // Send chunks with slight delay
    for (let i = 0; i < chunks.length; i++) {
      await thread.send(chunks[i]);
      if (i < chunks.length - 1) {
        // Small delay between messages to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  },

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
};