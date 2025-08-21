import { ChatInputCommandInteraction, Message } from 'discord.js';
import { ContextCollectorService } from '../services/contextCollectorService';
import { AttachmentService } from '../services/attachmentService';
import { ReplyStrategyService } from '../services/replyStrategyService';
import { ResponseHandlerManager } from './search/response-handlers';
import { TextAggregator } from '../utils/textAggregator';
import {
  AnalysisContext as HandlerAnalysisContext,
  ResponseHandler,
} from './search/response-handlers/types';
import { WebResponseHandler } from './search/response-handlers/webResponseHandler';
import { YoutubeResponseHandler } from './search/response-handlers/youtubeResponseHandler';
import { TextResponseHandler } from './search/response-handlers/textResponseHandler';

export interface AnalysisContext {
  context: any;
  contextInfo: string;
}

export interface AnalysisResult {
  response: string;
  handlerInfo: string;
  context: any;
  contextInfo: string;
}

export interface AnalysisConfig {
  query: string;
  source: 'search-command' | 'larry-consult' | 'auto-reply';
  outputFormat?: 'file' | 'message';
  systemPromptOverride?: string;
}

/**
 * Shared service for content analysis and response generation
 * Used by both search command and Larry consult auto-reply
 */
export class AnalysisService {
  private contextCollector: ContextCollectorService;
  private responseHandlerManager: ResponseHandlerManager;
  private handlers: ResponseHandler[];

  constructor() {
    this.contextCollector = new ContextCollectorService();
    this.responseHandlerManager = new ResponseHandlerManager();

    // Initialize handlers directly for non-interaction usage
    this.handlers = [
      new YoutubeResponseHandler(),
      new WebResponseHandler(),
      new TextResponseHandler(), // Fallback handler
    ];
  }

  /**
   * Collect context if needed based on channel type
   * Works for both interactions and messages
   */
  async collectContextIfNeeded(
    source: ChatInputCommandInteraction | Message,
    messageLimit: number
  ): Promise<AnalysisContext> {
    let needsContext = false;
    let channel = null;

    // Determine channel and if context is needed
    if (source instanceof Message) {
      channel = source.channel;
      // For messages, collect context in threads or specific channels like consult-larry
      needsContext = channel.isThread() || (channel.type === 0 && channel.name === 'consult-larry');
    } else {
      // For interactions (slash commands)
      channel = source.channel;
      needsContext = channel?.isThread() || false;
    }

    if (!needsContext) {
      console.log('📝 Skipping context collection - not in thread or special channel');
      return { context: null, contextInfo: '' };
    }

    console.log('📖 Collecting conversation context...');
    let context = null;
    let contextInfo = '';

    try {
      if (source instanceof Message) {
        // For Message, we need to create a compatible object
        context = await this.contextCollector.collectChannelContext(source as any, messageLimit);
      } else {
        // For ChatInputCommandInteraction
        context = await this.contextCollector.collectChannelContext(source, messageLimit);
      }
      contextInfo = `\n\n**Context:** Analyzed with ${context.messageCount} recent messages from ${context.participants.length} participants over ${context.timespan}`;
      console.log(
        `✅ Context collected: ${context.messageCount} messages from ${context.participants.join(', ')}`
      );
    } catch (error) {
      console.warn('⚠️ Failed to collect context, falling back to regular analysis:', error);
    }

    return { context, contextInfo };
  }

  /**
   * Process query and generate response using the same logic as search command
   */
  async processQuery(
    config: AnalysisConfig,
    analysisContext: AnalysisContext,
    interaction?: ChatInputCommandInteraction
  ): Promise<AnalysisResult> {
    const { query, source } = config;

    console.log(`🔍 Processing ${source} request: "${query.substring(0, 50)}..."`);

    let response: string;
    let handlerInfo: string;

    if (interaction && source === 'search-command') {
      // Use ResponseHandlerManager for search command (has interaction)
      handlerInfo = this.responseHandlerManager.getHandlerInfo(query);
      console.log(`🎯 Using specialized handler: ${handlerInfo}`);

      const handlerAnalysisContext: HandlerAnalysisContext = {
        context: analysisContext.context,
        contextInfo: analysisContext.contextInfo,
      };

      response = await this.responseHandlerManager.processAndRespond({
        interaction,
        query,
        analysisContext: handlerAnalysisContext,
      });
    } else {
      // Use direct handlers for Larry consult (no interaction needed)
      const handler = this.getHandler(query);
      handlerInfo = handler.constructor.name;
      console.log(`🎯 Using direct handler: ${handlerInfo}`);

      // Step 1: Process content
      const contentResult = await handler.processContent(query);

      // Step 2: Generate response
      const handlerAnalysisContext: HandlerAnalysisContext = {
        context: analysisContext.context,
        contextInfo: analysisContext.contextInfo,
      };

      response = await handler.generateResponse(contentResult, handlerAnalysisContext, query);

      // Step 3: Add source info (similar to ResponseHandlerManager)
      response = `${response}${contentResult.sourceInfo}${analysisContext.contextInfo}`;
    }

    return {
      response,
      handlerInfo,
      context: analysisContext.context,
      contextInfo: analysisContext.contextInfo,
    };
  }

  /**
   * Get appropriate handler for query (same logic as ResponseHandlerManager)
   */
  private getHandler(query: string): ResponseHandler {
    const handler = this.handlers.find(h => h.canHandle(query));

    if (!handler) {
      // This should not happen since TextResponseHandler is a fallback
      throw new Error('No suitable response handler found for query');
    }

    console.log(`🔍 Selected handler: ${handler.constructor.name} for query type`);
    return handler;
  }

  /**
   * Send analysis result as file attachment (for search command)
   */
  async sendAsFileAttachment(
    interaction: ChatInputCommandInteraction,
    result: AnalysisResult,
    query: string
  ): Promise<void> {
    const contextStatus = result.context
      ? `📖 Context-aware analysis using ${result.context.messageCount} recent messages`
      : '🔍 Standard analysis';

    // Generate aggregated text content with line folding
    const aggregatedContent = TextAggregator.aggregateSearchResults(
      query,
      result.response,
      result.contextInfo,
      result.handlerInfo
    );

    // Create file attachment
    const attachment = AttachmentService.createSearchResultAttachment(query, aggregatedContent);

    // Send response with file attachment
    await interaction.editReply({
      content:
        `✅ **Analysis complete!** ${contextStatus}\n` +
        `💬 Query: \`${this.truncateText(query, 50)}\`\n` +
        `🤖 Handler: ${result.handlerInfo}\n` +
        `📄 Results exported to attached file with line folding at 100 characters.\n\n` +
        `📎 Download the .txt file above to view the complete analysis.`,
      files: [attachment],
    });
  }

  /**
   * Send analysis result as message reply (for Larry consult)
   */
  async sendAsMessageReply(message: Message, result: AnalysisResult): Promise<void> {
    // For Larry consult, we want the natural response without technical details
    // The response handler already provides a formatted response
    await message.reply(result.response);
  }

  /**
   * Send analysis result using conditional strategy (message or file based on length)
   */
  async sendAsConditionalReply(
    message: Message,
    result: AnalysisResult,
    query: string
  ): Promise<void> {
    const contextStatus = result.context
      ? `📖 Context-aware analysis using ${result.context.messageCount} recent messages`
      : '🔍 Standard analysis';

    // Generate aggregated text content with line folding
    const aggregatedContent = TextAggregator.aggregateSearchResults(
      query,
      result.response,
      result.contextInfo,
      result.handlerInfo
    );

    // Use conditional reply strategy
    const replyResult = await ReplyStrategyService.sendConditionalReply(message, {
      content: aggregatedContent,
      filename: TextAggregator.generateFileName(query),
    });

    // Log the strategy used
    console.log(
      `🎯 Larry consult reply: ${ReplyStrategyService.getStrategyStatusMessage(replyResult)}`
    );

    // If sent as direct message, add context info as follow-up
    if (replyResult.strategy === 'message' && contextStatus) {
      try {
        if ('send' in message.channel) {
          await message.channel.send(`ℹ️ ${contextStatus} | 🤖 Handler: ${result.handlerInfo}`);
        }
      } catch (error) {
        console.warn('⚠️ Failed to send context follow-up:', error);
      }
    }
  }

  /**
   * Send analysis result as file attachment reply (for Larry consult with file output)
   * @deprecated Use sendAsConditionalReply instead for better UX
   */
  async sendAsFileAttachmentReply(
    message: Message,
    result: AnalysisResult,
    query: string
  ): Promise<void> {
    console.log(
      '⚠️ Using deprecated sendAsFileAttachmentReply, consider using sendAsConditionalReply'
    );

    const contextStatus = result.context
      ? `📖 Context-aware analysis using ${result.context.messageCount} recent messages`
      : '🔍 Standard analysis';

    // Generate aggregated text content with line folding
    const aggregatedContent = TextAggregator.aggregateSearchResults(
      query,
      result.response,
      result.contextInfo,
      result.handlerInfo
    );

    // Create file attachment
    const attachment = AttachmentService.createSearchResultAttachment(query, aggregatedContent);

    // Send reply with file attachment
    await message.reply({
      content:
        `🧙‍♂️ **Larry's Consultation Complete!** ${contextStatus}\n` +
        `💬 Query: \`${this.truncateText(query, 50)}\`\n` +
        `🤖 Handler: ${result.handlerInfo}\n` +
        `📄 Results exported to attached file with line folding at 100 characters.\n\n` +
        `📎 Download the .txt file above to view the complete analysis.`,
      files: [attachment],
    });
  }

  /**
   * Handle errors for both interaction and message contexts
   */
  async handleError(
    source: ChatInputCommandInteraction | Message,
    error: unknown,
    query: string
  ): Promise<void> {
    console.error('❌ Error in analysis service:', error);

    const errorMessage = '❌ **Analysis Error**\n\n';
    const errorDetails =
      error instanceof Error
        ? this.categorizeError(error)
        : '• Unknown error occurred\n• Please try again with different content';

    if (error instanceof Error) {
      console.error('Detailed error info:', {
        message: error.message,
        stack: error.stack,
        query: query.substring(0, 100),
      });
    }

    if (source instanceof Message) {
      // For messages (Larry consult)
      try {
        await source.reply(
          "Sorry, I'm having some technical difficulties right now. Could you try asking again in a moment? 🤔"
        );
      } catch (replyError) {
        console.error('💥 Error sending error message:', replyError);
      }
    } else {
      // For interactions (search command)
      await source.editReply({
        content: errorMessage + errorDetails,
      });
    }
  }

  private categorizeError(error: Error): string {
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
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}
