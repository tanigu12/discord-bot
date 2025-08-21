import { ResponseHandler, ResponseHandlerConfig } from './types';
import { WebResponseHandler } from './webResponseHandler';
import { YoutubeResponseHandler } from './youtubeResponseHandler';
import { TextResponseHandler } from './textResponseHandler';

export class ResponseHandlerManager {
  private handlers: ResponseHandler[];

  constructor() {
    // Order matters: more specific handlers should come first
    this.handlers = [
      new YoutubeResponseHandler(),
      new WebResponseHandler(),
      new TextResponseHandler(), // Fallback handler
    ];
  }

  private getHandler(query: string): ResponseHandler {
    const handler = this.handlers.find(h => h.canHandle(query));
    
    if (!handler) {
      // This should not happen since TextResponseHandler is a fallback
      throw new Error('No suitable response handler found for query');
    }
    
    console.log(`🔍 Selected handler: ${handler.constructor.name} for query type`);
    return handler;
  }

  async processAndRespond(config: ResponseHandlerConfig): Promise<string> {
    const { query, analysisContext } = config;
    
    try {
      const handler = this.getHandler(query);
      
      // Step 1: Process content based on handler type
      console.log('📥 Processing content with specialized handler...');
      const contentResult = await handler.processContent(query);
      
      // Step 2: Generate specialized response
      console.log('🤖 Generating specialized response...');
      const response = await handler.generateResponse(contentResult, analysisContext, query);
      
      // Step 3: Combine with source info
      const fullResponse = `${response}${contentResult.sourceInfo}${analysisContext.contextInfo}`;
      
      return fullResponse;
      
    } catch (error) {
      console.error('❌ Response handler manager error:', error);
      throw error;
    }
  }

  getHandlerInfo(query: string): string {
    const handler = this.getHandler(query);
    return handler.constructor.name;
  }
}