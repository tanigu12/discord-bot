import { ResponseHandler, ContentResult, AnalysisContext } from './types';
import { YoutubeCaptionService } from '../../youtube-caption/youtubeCaptionService';
import { BaseAIService } from '../../../services/baseAIService';
import { OPENAI_MODELS } from '../../../constants/ai';

export class YoutubeResponseHandler extends BaseAIService implements ResponseHandler {
  private youtubeCaptionService: YoutubeCaptionService;

  constructor() {
    super();
    this.youtubeCaptionService = new YoutubeCaptionService();
  }

  canHandle(query: string): boolean {
    return this.youtubeCaptionService.isYouTubeUrl(query);
  }

  async processContent(query: string): Promise<ContentResult> {
    console.log('🎬 Processing YouTube video with specialized handler...');
    
    try {
      // Get only English captions for sectioned translation
      const captionResult = await this.youtubeCaptionService.fetchCaptions(query, ['en']);
      
      if (captionResult.status === 'success' && captionResult.captions && captionResult.captions.length > 0) {
        const englishCaption = captionResult.captions.find(cap => cap.language === 'en');
        
        if (englishCaption) {
          const sourceInfo = `\n\n**Source:** ${query}\n**Type:** YouTube Video Analysis\n**Language:** English Captions`;
          console.log('✅ YouTube English captions fetched successfully');
          
          return { content: englishCaption.text, sourceInfo };
        }
      }
      
      console.error('❌ Failed to fetch YouTube English captions:', captionResult.error);
      return {
        content: query,
        sourceInfo: `\n\n**Source:** ${query}\n**Type:** YouTube Video (English captions unavailable: ${captionResult.error || 'Not found'})`
      };
      
    } catch (error) {
      console.error('❌ YouTube caption service error:', error);
      return {
        content: query,
        sourceInfo: `\n\n**Source:** ${query}\n**Type:** YouTube Video (caption service error)`
      };
    }
  }

  async generateResponse(contentResult: ContentResult, analysisContext: AnalysisContext, query: string): Promise<string> {
    console.log('🤖 Generating YouTube sectioned translation...');
    
    const systemPrompt = `You are a specialized YouTube video analyzer for Japanese language learners. Your task is to:

1. Understand the entire context of the video captions
2. Divide the content into logical sections based on topics/themes
3. Translate each section into Japanese while maintaining context
4. Provide clear section headers that reflect the content

**CRITICAL: DO NOT MODIFY OR CHANGE THE ORIGINAL ENGLISH CAPTIONS IN ANY WAY. The user studies these captions while listening to YouTube videos for language learning, so exact original text preservation is essential.**

Format your response as follows:

## Section 1: [English Topic/Theme Title]
[Original English content for this section - PRESERVE EXACTLY AS PROVIDED]

## Section 1（日本語）: [Japanese translation of the topic/theme title]
[Japanese translation of the content, maintaining natural flow and context]

## Section 2: [English Topic/Theme Title]
[Original English content for this section - PRESERVE EXACTLY AS PROVIDED]

## Section 2（日本語）: [Japanese translation of the topic/theme title]
[Japanese translation of the content]

[Continue this pattern for all logical sections...]

## Video Summary (動画要約)
[Brief summary in both English and Japanese about what the video covers]

Guidelines:
- Create 3-6 sections based on natural topic breaks
- Maintain context flow between sections
- **NEVER modify, correct, or change the original English captions - copy them exactly**
- Translate naturally into Japanese, not word-for-word
- Use appropriate Japanese expressions and terminology
- Make section titles descriptive and helpful`;

    const userPrompt = `Please analyze these YouTube video captions and provide sectioned translation as specified:

Video URL: ${query}
Caption content to analyze:
${contentResult.content}

${analysisContext.context ? `\nChannel Context: This analysis is being done in a Discord channel conversation.` : ''}`;

    try {
      const response = await this.callOpenAI(
        systemPrompt,
        userPrompt,
        { model: OPENAI_MODELS.GPT_4O_MINI }
      );

      if (!response || response.trim().length === 0) {
        throw new Error('AI service returned empty response for YouTube content');
      }

      return response;
    } catch (error) {
      console.error('❌ YouTube content analysis failed:', error);
      throw new Error(`YouTube content analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}