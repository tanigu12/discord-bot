import type { Message } from 'discord.js';
import { BaseAIService } from '../../services/baseAIService';
import { YoutubeCaptionService } from '../youtube-caption/youtubeCaptionService';
import { ReplyStrategyService } from '../../services/replyStrategyService';
import { TextAggregator } from '../../utils/textAggregator';
import { OPENAI_MODELS } from '../../constants/ai';
import type { TranscriptResult, YouTubeAnalysisResult } from './types';

/**
 * Independent YouTube analysis service that provides:
 * 1. Immediate transcript extraction and Discord response
 * 2. Direct integration with ResearchHandler
 * 3. Asynchronous summary generation
 */
export class YouTubeAnalysisService extends BaseAIService {
  private youtubeCaptionService: YoutubeCaptionService;

  constructor() {
    super();
    this.youtubeCaptionService = new YoutubeCaptionService();
  }

  /**
   * Check if the provided text contains a YouTube URL
   */
  isYouTubeUrl(text: string): boolean {
    return this.youtubeCaptionService.isYouTubeUrl(text);
  }

  /**
   * Extract YouTube URL from text content
   */
  extractYouTubeUrl(content: string): string | null {
    console.log('🔍 [DEBUG] YouTubeAnalysisService.extractYouTubeUrl() starting');
    console.log(`   Input content: ${content.substring(0, 100)}...`);

    // Look for YouTube URLs in the content
    const youtubeUrlPattern =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)[\w-]+/gi;
    const matches = content.match(youtubeUrlPattern);

    if (matches && matches.length > 0) {
      const url = matches[0];
      console.log(`✅ [DEBUG] YouTube URL found: ${url}`);
      return url;
    }

    console.log('❌ [DEBUG] No YouTube URL found in content');
    return null;
  }

  /**
   * Phase 1: Extract transcript immediately from YouTube video
   */
  async getTranscriptImmediate(url: string): Promise<TranscriptResult> {
    console.log('📝 [DEBUG] YouTubeAnalysisService.getTranscriptImmediate() starting');
    console.log(`   URL: ${url}`);

    try {
      // Validate YouTube URL
      if (!this.isYouTubeUrl(url)) {
        return {
          status: 'error',
          error: 'Invalid YouTube URL provided',
        };
      }

      const startTime = Date.now();

      // Get transcript using existing caption service
      const analysisResult = await this.youtubeCaptionService.getTranscriptFromVideo(url);
      const processingTime = Date.now() - startTime;

      console.log(`🔍 [DEBUG] Transcript extraction completed in ${processingTime}ms`);
      console.log(`   Status: ${analysisResult.status}`);
      console.log(`   Has content: ${!!analysisResult.summary}`);
      console.log(`   Content length: ${analysisResult.summary?.length || 0} characters`);

      if (analysisResult.status === 'success' && analysisResult.summary) {
        // Extract video ID for reference
        const videoId = this.extractVideoId(url);

        return {
          status: 'success',
          transcript: analysisResult.summary,
          videoId,
        };
      }

      return {
        status: 'error',
        error: analysisResult.error || 'Failed to extract transcript',
      };
    } catch (error) {
      // Only log in non-test environment
      if (process.env.NODE_ENV !== 'test') {
        console.error('❌ [DEBUG] Transcript extraction failed:');
        console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      }

      return {
        status: 'error',
        error: `Transcript extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Phase 2: Send transcript to Discord immediately using conditional reply
   */
  async sendTranscriptToDiscord(
    message: Message,
    transcriptResult: TranscriptResult,
    url: string
  ): Promise<void> {
    console.log('📤 [DEBUG] YouTubeAnalysisService.sendTranscriptToDiscord() starting');

    try {
      if (transcriptResult.status === 'error') {
        // Send error message
        const errorContent = `❌ **YouTube Analysis Failed**\n\n**Error:** ${transcriptResult.error}\n**URL:** ${url}`;

        await ReplyStrategyService.sendConditionalReply(message, {
          content: errorContent,
          filename: 'youtube-error.txt',
        });
        return;
      }

      if (!transcriptResult.transcript) {
        throw new Error('No transcript content available');
      }

      // Format transcript for Discord
      const sourceInfo = `\n\n**Source:** ${url}\n**Type:** YouTube Video Complete Transcript\n**Method:** Gemini AI Analysis\n**Video ID:** ${transcriptResult.videoId || 'Unknown'}`;

      const aggregatedContent = TextAggregator.aggregateSearchResults(
        url,
        transcriptResult.transcript,
        'YouTube video transcript extracted immediately',
        'YouTubeAnalysisService'
      );

      // Send using conditional reply strategy
      const replyResult = await ReplyStrategyService.sendConditionalReply(message, {
        content: aggregatedContent + sourceInfo,
        filename: TextAggregator.generateFileName(`youtube-transcript-${transcriptResult.videoId}`),
      });

      console.log(`🎯 [DEBUG] Transcript sent via ${replyResult.strategy}`);

      // Add processing status info
      if (replyResult.strategy === 'message') {
        try {
          if ('send' in message.channel) {
            await message.channel.send(
              'ℹ️ Transcript extracted immediately | 🤖 Generating summary...'
            );
          }
        } catch (error) {
          console.warn('⚠️ Failed to send status follow-up:', error);
        }
      }
    } catch (error) {
      // Only log in non-test environment
      if (process.env.NODE_ENV !== 'test') {
        console.error('❌ [DEBUG] Failed to send transcript to Discord:');
        console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Send fallback error message
      try {
        if ('reply' in message) {
          await message.reply(
            `❌ Failed to process YouTube video: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      } catch (replyError) {
        if (process.env.NODE_ENV !== 'test') {
          console.error('❌ Failed to send error reply:', replyError);
        }
      }
    }
  }

  /**
   * Phase 3: Generate AI-powered summary asynchronously
   */
  async generateSummaryAsync(transcript: string, url: string): Promise<string> {
    console.log('🤖 [DEBUG] YouTubeAnalysisService.generateSummaryAsync() starting');
    console.log(`   Transcript length: ${transcript.length} characters`);
    console.log(`   URL: ${url}`);

    const systemPrompt = `You are a specialized English tutor using YouTube audio for English language learners. Your task is to:

1. Understand the entire context of the audio transcript
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

    const userPrompt = `Please analyze this YouTube video transcript and provide sectioned translation with timestamps as specified:

Video URL: ${url}
Transcript to analyze:
${transcript}

Channel Context: This analysis is being done in a Discord channel for English learning purposes.`;

    console.log('🔍 [DEBUG] Calling OpenAI for summary generation...');
    console.log(`   System prompt length: ${systemPrompt.length} characters`);
    console.log(`   User prompt length: ${userPrompt.length} characters`);

    try {
      const startTime = Date.now();
      const response = await this.callOpenAI(systemPrompt, userPrompt, {
        model: OPENAI_MODELS.MAIN,
        maxCompletionTokens: 10000,
      });
      const apiCallTime = Date.now() - startTime;

      console.log(`✅ [DEBUG] Summary generation completed in ${apiCallTime}ms`);
      console.log(`   Response length: ${response?.length || 0} characters`);
      console.log(`   Response preview: ${response?.substring(0, 200) || 'none'}...`);

      if (!response || response.trim().length === 0) {
        throw new Error('AI service returned empty response for YouTube summary');
      }

      return response;
    } catch (error) {
      // Only log in non-test environment
      if (process.env.NODE_ENV !== 'test') {
        console.error('❌ [DEBUG] Summary generation failed:');
        console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      }
      throw error;
    }
  }

  /**
   * Main orchestration method: Process YouTube URL with three-phase approach
   */
  async processYouTubeUrl(
    message: Message,
    url: string,
    shouldGenerateSummary: boolean = true,
    onSummaryComplete?: () => Promise<void>
  ): Promise<YouTubeAnalysisResult> {
    console.log('🎬 [DEBUG] YouTubeAnalysisService.processYouTubeUrl() starting');
    console.log(`   URL: ${url}`);
    console.log(`   Should generate summary: ${shouldGenerateSummary}`);

    const result: YouTubeAnalysisResult = {
      status: 'error',
      sourceUrl: url,
    };

    try {
      // Phase 1: Get transcript immediately
      console.log('📝 [DEBUG] Phase 1: Extracting transcript...');
      const transcriptResult = await this.getTranscriptImmediate(url);

      if (transcriptResult.status === 'error') {
        result.error = transcriptResult.error;
        await this.sendTranscriptToDiscord(message, transcriptResult, url);
        return result;
      }

      result.transcript = transcriptResult.transcript;
      result.videoId = transcriptResult.videoId;

      // Phase 2: Send transcript to Discord immediately
      console.log('📤 [DEBUG] Phase 2: Sending transcript to Discord...');
      await this.sendTranscriptToDiscord(message, transcriptResult, url);

      // Phase 3: Generate summary asynchronously (if requested)
      if (shouldGenerateSummary && transcriptResult.transcript) {
        console.log('🤖 [DEBUG] Phase 3: Generating summary asynchronously...');

        // Start summary generation asynchronously (don't await)
        this.generateAndSendSummary(
          message,
          transcriptResult.transcript,
          url,
          onSummaryComplete
        ).catch(error => {
          if (process.env.NODE_ENV !== 'test') {
            console.error('❌ [DEBUG] Async summary generation failed:', error);
          }
        });
      }

      result.status = 'success';
      console.log('✅ [DEBUG] YouTube URL processing completed successfully');
      return result;
    } catch (error) {
      // Only log in non-test environment
      if (process.env.NODE_ENV !== 'test') {
        console.error('❌ [DEBUG] YouTube URL processing failed:');
        console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      }

      result.error = `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`;

      // Try to send error to Discord
      try {
        if ('reply' in message) {
          await message.reply(`❌ YouTube processing failed: ${result.error}`);
        }
      } catch (replyError) {
        if (process.env.NODE_ENV !== 'test') {
          console.error('❌ Failed to send error reply:', replyError);
        }
      }

      return result;
    }
  }

  /**
   * Generate summary and send as separate message (async operation)
   */
  private async generateAndSendSummary(
    message: Message,
    transcript: string,
    url: string,
    onComplete?: () => Promise<void>
  ): Promise<void> {
    try {
      console.log('📊 [DEBUG] Starting async summary generation...');

      const summary = await this.generateSummaryAsync(transcript, url);

      // Send summary as new message
      const summaryContent = TextAggregator.aggregateSearchResults(
        url,
        summary,
        'AI-generated summary from YouTube transcript',
        'YouTubeAnalysisService'
      );

      const sourceInfo = `\n\n**Source:** ${url}\n**Type:** YouTube Video AI Summary\n**Method:** OpenAI Analysis of Gemini Transcript`;

      await ReplyStrategyService.sendConditionalReply(message, {
        content: summaryContent + sourceInfo,
        filename: TextAggregator.generateFileName(`youtube-summary-${Date.now()}`),
      });

      console.log('✅ [DEBUG] Summary sent to Discord successfully');

      // Call completion callback if provided
      if (onComplete) {
        try {
          await onComplete();
          console.log('✅ [DEBUG] Completion callback executed successfully');
        } catch (callbackError) {
          if (process.env.NODE_ENV !== 'test') {
            console.error('❌ [DEBUG] Completion callback failed:', callbackError);
          }
        }
      }
    } catch (error) {
      // Only log in non-test environment
      if (process.env.NODE_ENV !== 'test') {
        console.error('❌ [DEBUG] Failed to generate and send summary:', error);
      }

      // Send error message about summary failure
      try {
        if ('send' in message.channel) {
          await message.channel.send(
            `⚠️ Summary generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      } catch (sendError) {
        if (process.env.NODE_ENV !== 'test') {
          console.error('❌ Failed to send summary error message:', sendError);
        }
      }

      // Still call completion callback even if summary failed
      if (onComplete) {
        try {
          await onComplete();
          console.log('✅ [DEBUG] Completion callback executed after summary error');
        } catch (callbackError) {
          if (process.env.NODE_ENV !== 'test') {
            console.error(
              '❌ [DEBUG] Completion callback failed after summary error:',
              callbackError
            );
          }
        }
      }
    }
  }

  /**
   * Extract video ID from YouTube URL (helper method)
   */
  private extractVideoId(url: string): string {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.slice(1); // Remove leading '/'
      } else if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v') || 'unknown';
      }
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }
}
