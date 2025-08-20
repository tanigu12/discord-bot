import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ContentAnalysisService } from '../search/contentAnalysisService';
import { ContentFetcherService } from '../../services/contentFetcherService';
import { ContextCollectorService } from '../../services/contextCollectorService';
import { YoutubeCaptionService } from '../youtube-caption/youtubeCaptionService';

const contentAnalysisService = new ContentAnalysisService();
const contentFetcher = new ContentFetcherService();
const contextCollector = new ContextCollectorService();
const youtubeCaptionService = new YoutubeCaptionService();

interface ContentResult {
  content: string;
  sourceInfo: string;
}

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

      // Process content based on query type
      const contentResult = await searchCommand.processContent(query);

      // Collect channel context
      const { context, contextInfo } = await searchCommand.collectContext(interaction);

      // Generate AI analysis
      const analysis = await searchCommand.generateAnalysis(contentResult.content, context, query);
      
      // Send response
      await searchCommand.sendResponse(interaction, analysis, contentResult.sourceInfo, contextInfo, context, query);

      console.log('✅ Search analysis completed successfully');

    } catch (error) {
      await searchCommand.handleError(interaction, error, query);
    }
  },

  async processContent(query: string): Promise<ContentResult> {
    const isUrl = this.isValidUrl(query);
    const isYouTubeUrl = youtubeCaptionService.isYouTubeUrl(query);
    
    if (!isUrl) {
      return { content: query, sourceInfo: '' };
    }

    if (isYouTubeUrl) {
      return await this.processYouTubeContent(query);
    } else {
      return await this.processWebContent(query);
    }
  },

  async processYouTubeContent(query: string): Promise<ContentResult> {
    console.log('🎬 YouTube URL detected, fetching captions...');
    
    try {
      const captionResult = await youtubeCaptionService.fetchCaptions(query, ['en', 'ja']);
      
      if (captionResult.status === 'success' && captionResult.captions) {
        const captionTexts = captionResult.captions.map(cap => 
          `**${cap.language.toUpperCase()} Captions:**\n${cap.text}`
        ).join('\n\n');
        
        const sourceInfo = `\n\n**Source:** ${query}\n**Type:** YouTube Video Captions\n**Languages:** ${captionResult.captions.map(c => c.language).join(', ')}`;
        console.log(`✅ YouTube captions fetched successfully: ${captionResult.captions.length} language(s)`);
        
        return { content: captionTexts, sourceInfo };
      } else {
        console.error('❌ Failed to fetch YouTube captions:', captionResult.error);
        return {
          content: query,
          sourceInfo: `\n\n**Source:** ${query}\n**Type:** YouTube Video (captions unavailable: ${captionResult.error})`
        };
      }
    } catch (error) {
      console.error('❌ YouTube caption service error:', error);
      return {
        content: query,
        sourceInfo: `\n\n**Source:** ${query}\n**Type:** YouTube Video (caption service error)`
      };
    }
  },

  async processWebContent(query: string): Promise<ContentResult> {
    console.log('🌐 URL detected, fetching content...');
    
    try {
      const fetchedContent = await contentFetcher.fetchContent(query);
      const sourceInfo = `\n\n**Source:** ${query}\n**Title:** ${fetchedContent.title || 'Unknown'}`;
      console.log(`✅ Content fetched successfully: ${fetchedContent.content.substring(0, 100)}...`);
      
      return { content: fetchedContent.content, sourceInfo };
    } catch (error) {
      console.error('❌ Failed to fetch URL content:', error);
      return {
        content: query,
        sourceInfo: `\n\n**Source:** ${query} (content fetch failed, analyzing URL directly)`
      };
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

  async generateAnalysis(content: string, context: any, query: string): Promise<string> {
    console.log('🤖 Generating context-aware AI analysis...');
    const isUrl = this.isValidUrl(query);
    
    try {
      const analysis = context 
        ? await contentAnalysisService.analyzeContentWithContext(content, context, isUrl)
        : await contentAnalysisService.analyzeContent(content, isUrl);
        
      if (!analysis || analysis.trim().length === 0) {
        throw new Error('AI service returned empty response');
      }
      
      return analysis;
    } catch (aiError) {
      console.error('❌ AI analysis failed:', aiError);
      throw new Error(`AI analysis failed: ${aiError instanceof Error ? aiError.message : 'Unknown AI error'}`);
    }
  },

  async sendResponse(
    interaction: ChatInputCommandInteraction, 
    analysis: string, 
    sourceInfo: string, 
    contextInfo: string, 
    context: any, 
    query: string
  ): Promise<void> {
    const responseMessage = `${analysis}${sourceInfo}${contextInfo}`;
    const contextStatus = context ? `📖 Context-aware analysis using ${context.messageCount} recent messages` : '🔍 Standard analysis';
    const directReplyHeader = `✅ **Analysis complete!** ${contextStatus}\n💬 Direct response for: \`${this.truncateText(query, 50)}\`\n\n`;
    const fullDirectReply = directReplyHeader + responseMessage;
    
    await this.sendLongMessageDirect(interaction, fullDirectReply);
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

    const chunks = this.splitMessageIntoChunks(message, maxLength);

    if (chunks.length > 0) {
      await interaction.editReply({ content: chunks[0] });
      
      for (let i = 1; i < chunks.length; i++) {
        await interaction.followUp({ content: chunks[i] });
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
  },

  splitMessageIntoChunks(message: string, maxLength: number): string[] {
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

    return chunks;
  },

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
};