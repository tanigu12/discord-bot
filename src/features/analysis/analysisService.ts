import { Message } from 'discord.js';
import { ReplyStrategyService } from '../../services/replyStrategyService';
import { TextAggregator } from '../../utils/textAggregator';
import {
  AnalysisContext as HandlerAnalysisContext,
  ResponseHandler,
} from '../search/response-handlers/types';
import { WebResponseHandler } from '../search/response-handlers/webResponseHandler';
import { YoutubeResponseHandler } from '../search/response-handlers/youtubeResponseHandler';
import { TextResponseHandler } from '../search/response-handlers/textResponseHandler';
import { AnalysisContext, AnalysisResult, AnalysisConfig, AnalysisSource } from './types';

/**
 * Generic content analysis service
 * Used for search commands and general content analysis
 * Does not include AI personality - for basic content processing only
 */
export class AnalysisService {
  private handlers: ResponseHandler[];

  constructor() {
    // Initialize handlers for content analysis
    this.handlers = [
      new YoutubeResponseHandler(),
      new WebResponseHandler(),
      new TextResponseHandler(), // Fallback handler
    ];
  }

  /**
   * Process query and generate response using content analysis handlers
   */
  async processQuery(
    config: AnalysisConfig,
    analysisContext: AnalysisContext
  ): Promise<AnalysisResult> {
    const { query, source } = config;

    console.log(`🔍 Processing ${source} request: "${query.substring(0, 50)}..."`);

    let response: string;

    const handler = this.getHandler(query);
    const handlerInfo = handler.constructor.name;
    console.log(`🎯 Using content handler: ${handlerInfo}`);

    // Step 1: Process content
    const contentResult = await handler.processContent(query);

    // Step 2: Generate response
    const handlerAnalysisContext: HandlerAnalysisContext = {
      context: analysisContext.context,
      contextInfo: analysisContext.contextInfo,
    };

    response = await handler.generateResponse(contentResult, handlerAnalysisContext, query);

    // Step 3: Add source info
    response = `${response}${contentResult.sourceInfo}${analysisContext.contextInfo}`;

    return {
      response,
      handlerInfo,
      context: analysisContext.context,
      contextInfo: analysisContext.contextInfo,
    };
  }

  /**
   * Get appropriate content handler for query
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
    console.log(`🎯 Analysis reply: ${ReplyStrategyService.getStrategyStatusMessage(replyResult)}`);

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
   * Handle errors for both interaction and message contexts
   */
  async handleError(source: AnalysisSource, error: unknown, query: string): Promise<void> {
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
      // For messages
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
}
