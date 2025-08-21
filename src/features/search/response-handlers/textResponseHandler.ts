import { ResponseHandler, ContentResult, AnalysisContext } from './types';
import { ContentAnalysisService } from '../contentAnalysisService';

export class TextResponseHandler implements ResponseHandler {
  private contentAnalysisService: ContentAnalysisService;

  constructor() {
    this.contentAnalysisService = new ContentAnalysisService();
  }

  canHandle(query: string): boolean {
    // Handle any non-URL content (fallback handler)
    try {
      new URL(query);
      return false; // If it's a valid URL, let other handlers take it
    } catch {
      return true; // If it's not a URL, this handler can process it
    }
  }

  async processContent(query: string): Promise<ContentResult> {
    console.log('📝 Processing text content with standard handler...');
    
    // For text content, we use the query directly
    return { 
      content: query, 
      sourceInfo: '\n\n**Type:** Text Analysis' 
    };
  }

  async generateResponse(contentResult: ContentResult, analysisContext: AnalysisContext): Promise<string> {
    console.log('🤖 Generating standard text analysis...');
    
    try {
      const analysis = analysisContext.context 
        ? await this.contentAnalysisService.analyzeContentWithContext(contentResult.content, analysisContext.context, false)
        : await this.contentAnalysisService.analyzeContent(contentResult.content, false);
        
      if (!analysis || analysis.trim().length === 0) {
        throw new Error('AI service returned empty response for text content');
      }
      
      return analysis;
    } catch (error) {
      console.error('❌ Text analysis failed:', error);
      throw new Error(`Text analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}