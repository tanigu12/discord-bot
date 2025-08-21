import { ResponseHandler, ContentResult, AnalysisContext } from './types';
import { ContentFetcherService } from '../../../services/contentFetcherService';
import { BaseAIService } from '../../../services/baseAIService';
import { OPENAI_MODELS } from '../../../constants/ai';

export class WebResponseHandler extends BaseAIService implements ResponseHandler {
  private contentFetcher: ContentFetcherService;

  constructor() {
    super();
    this.contentFetcher = new ContentFetcherService();
  }

  canHandle(query: string): boolean {
    try {
      const url = new URL(query);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  }

  async processContent(query: string): Promise<ContentResult> {
    console.log('🌐 Processing web URL with specialized handler...');
    
    try {
      const fetchedContent = await this.contentFetcher.fetchContent(query);
      const sourceInfo = `\n\n**Source:** ${query}\n**Title:** ${fetchedContent.title || 'Unknown'}\n**Type:** Web Content Analysis`;
      console.log(`✅ Web content fetched successfully: ${fetchedContent.content.substring(0, 100)}...`);
      
      return { content: fetchedContent.content, sourceInfo };
    } catch (error) {
      console.error('❌ Failed to fetch web content:', error);
      return {
        content: query,
        sourceInfo: `\n\n**Source:** ${query}\n**Type:** Web URL (content fetch failed, analyzing URL directly)`
      };
    }
  }

  async generateResponse(contentResult: ContentResult, analysisContext: AnalysisContext): Promise<string> {
    console.log('🤖 Generating web content analysis with Japanese translation...');
    
    const systemPrompt = `You are a specialized web content analyzer for Japanese language learners. Your task is to:

1. Provide a comprehensive summary of the web content
2. Translate the summary into Japanese
3. Extract and explain sophisticated vocabulary and grammar points
4. Make the content educational and accessible

Format your response as follows:

## English Summary
[Provide a clear, comprehensive summary of the web content in English]

## Japanese Translation (日本語翻訳)
[Translate the summary into natural, accurate Japanese]

## Vocabulary & Grammar Analysis (語彙・文法解析)
[Extract and explain 5-8 sophisticated or important terms/phrases from the content, including:]
- **English term** / 日本語訳
- Definition and usage explanation
- Example sentences in both languages
- Grammar points if applicable

## Key Learning Points (重要学習ポイント)
[Highlight 3-4 key concepts, ideas, or takeaways that would be valuable for learners]

Structure your analysis to be educational and help users improve their English comprehension while understanding the content deeply.`;

    const userPrompt = `Please analyze this web content and provide the structured response as specified:

Content to analyze:
${contentResult.content}

${analysisContext.context ? `\nChannel Context: This analysis is being done in a Discord channel conversation.` : ''}`;

    try {
      const response = await this.callOpenAI(
        systemPrompt,
        userPrompt,
        { model: OPENAI_MODELS.MAIN }
      );

      if (!response || response.trim().length === 0) {
        throw new Error('AI service returned empty response for web content');
      }

      return response;
    } catch (error) {
      console.error('❌ Web content analysis failed:', error);
      throw new Error(`Web content analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}