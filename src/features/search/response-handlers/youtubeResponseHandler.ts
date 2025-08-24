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
    const isYouTubeUrl = this.youtubeCaptionService.isYouTubeUrl(query);
    console.log(`🔍 [DEBUG] YoutubeResponseHandler.canHandle()`);
    console.log(`   Query: ${query}`);
    console.log(`   Is YouTube URL: ${isYouTubeUrl}`);
    return isYouTubeUrl;
  }

  async processContent(query: string): Promise<ContentResult> {
    console.log('🎬 [DEBUG] YoutubeResponseHandler.processContent() starting');
    console.log(`   Input URL: ${query}`);
    console.log('   Step 1: Calling youtubeCaptionService.getTranscriptFromVideo...');

    try {
      const startTime = Date.now();
      // Use Gemini AI to analyze the video content
      const analysisResult = await this.youtubeCaptionService.getTranscriptFromVideo(query);
      const processingTime = Date.now() - startTime;

      console.log(`🔍 [DEBUG] Analysis result received in ${processingTime}ms:`);
      console.log(`   Status: ${analysisResult.status}`);
      console.log(`   Has summary: ${!!analysisResult.summary}`);
      console.log(`   Summary length: ${analysisResult.summary?.length || 0} characters`);
      console.log(`   Error: ${analysisResult.error || 'none'}`);

      if (analysisResult.status === 'success' && analysisResult.summary) {
        const sourceInfo = `\n\n**Source:** ${query}\n**Type:** YouTube Video Complete Transcript\n**Method:** Gemini AI Analysis`;
        console.log('✅ [DEBUG] YouTube video analyzed successfully with Gemini');
        console.log(`   Content preview: ${analysisResult.summary.substring(0, 200)}...`);

        // Return only the transcript content - this will be sent as the first reply
        // The content contains the complete transcript with timestamps as formatted by Gemini
        return { content: analysisResult.summary, sourceInfo };
      }

      console.error('❌ [DEBUG] Failed to analyze YouTube video:');
      console.error(`   Error details: ${analysisResult.error}`);
      console.error(`   Full result:`, analysisResult);
      return {
        content: query,
        sourceInfo: `\n\n**Source:** ${query}\n**Type:** YouTube Video (analysis unavailable: ${analysisResult.error || 'Unknown error'})`,
      };
    } catch (error) {
      console.error('❌ [DEBUG] YouTube caption service error:');
      console.error(`   Error type: ${error?.constructor?.name}`);
      console.error(`   Error message: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`   Error stack:`, error);
      return {
        content: query,
        sourceInfo: `\n\n**Source:** ${query}\n**Type:** YouTube Video (caption service error)`,
      };
    }
  }

  async generateResponse(
    contentResult: ContentResult,
    analysisContext: AnalysisContext,
    query: string
  ): Promise<string> {
    console.log('🤖 [DEBUG] YoutubeResponseHandler.generateResponse() starting');
    console.log(`   Content length: ${contentResult.content?.length || 0} characters`);
    console.log(`   Query: ${query}`);
    console.log(`   Has analysis context: ${!!analysisContext.context}`);

    const systemPrompt = `You are a specialized English tutor using YouTube audio for English language learners. Your task is to:

1. Understand the entire context of the audio captions
2. Divide the content into logical sections based on topics/themes
3. Create each section Japanese and English summary while maintaining context
4. Provide clear section headers with timestamps that reflect the content
5. **IMPORTANT: Include timestamps in section titles using format [HH:MM:SS]**

Format your response as follows:

## Video Summary (動画要約)
[Brief summary in both English and Japanese about what the video covers]

## [00:00:00] Section 1: [English Topic/Theme Title]
[English summary for this section]

## [00:00:00]（日本語）: [Japanese translation of the topic/theme title]
[Japanese summary for this section]

## [HH:MM:SS] Section 2: [English Topic/Theme Title]
[English summary for this section]

## [HH:MM:SS]（日本語）: [Japanese translation of the topic/theme title]
[Japanese summary for this section]

[Continue this pattern for all logical sections with appropriate timestamps...]

Guidelines:
- Create 3-6 sections based on natural topic breaks
- **CRITICAL: Include timestamps [HH:MM:SS] in ALL section headers**
- Extract timestamps from the provided transcript content
- Use approximate timestamps based on content flow and topic transitions
- Maintain context flow between sections
- Make section titles descriptive and helpful
- If exact timestamps aren't available, estimate based on content order and typical speech pace
- For very long videos, create logical breaks every 10-20 minutes`;

    const userPrompt = `Please analyze these YouTube video captions and provide sectioned translation with timestamps as specified:

Video URL: ${query}
Caption content to analyze:
${contentResult.content}

${analysisContext.context ? `\nChannel Context: This analysis is being done in a Discord channel conversation.` : ''}`;

    console.log('🔍 [DEBUG] Calling OpenAI API...');
    console.log(`   System prompt length: ${systemPrompt.length} characters`);
    console.log(`   User prompt length: ${userPrompt.length} characters`);
    console.log(`   Model: ${OPENAI_MODELS.MAIN}`);
    console.log(`   Max tokens: 8000`);

    try {
      const startTime = Date.now();
      const response = await this.callOpenAI(systemPrompt, userPrompt, {
        model: OPENAI_MODELS.MAIN,
        maxCompletionTokens: 10000,
      });
      const apiCallTime = Date.now() - startTime;

      console.log(`✅ [DEBUG] OpenAI API call completed in ${apiCallTime}ms`);
      console.log(`   Response length: ${response?.length || 0} characters`);
      console.log(`   Response preview: ${response?.substring(0, 200) || 'none'}...`);

      if (!response || response.trim().length === 0) {
        console.error('❌ [DEBUG] AI service returned empty response');
        throw new Error('AI service returned empty response for YouTube content');
      }

      console.log('✅ [DEBUG] YouTube response generation completed successfully');
      return response;
    } catch (error) {
      console.error('❌ [DEBUG] YouTube content analysis failed:');
      console.error(`   Error type: ${error?.constructor?.name}`);
      console.error(`   Error message: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`   Error stack:`, error);
      throw new Error(
        `YouTube content analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
