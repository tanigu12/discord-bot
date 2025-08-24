import { Message } from 'discord.js';
import { BaseAIService } from '../../services/baseAIService';
import { AnalysisService } from '../analysis/analysisService';

import { YouTubeAnalysisService } from '../youtube-analysis/youtubeAnalysisService';

export class ResearchHandler extends BaseAIService {
  private readonly RESEARCH_CHANNEL_NAME = 'research';
  private analysisService: AnalysisService;
  private youtubeAnalysisService: YouTubeAnalysisService;

  constructor() {
    super();
    this.analysisService = new AnalysisService();
    this.youtubeAnalysisService = new YouTubeAnalysisService();
  }

  /**
   * Check if message is from the research channel
   */
  isResearchChannel(message: Message): boolean {
    const channelName = message.channel.type === 0 ? message.channel.name : null;
    return channelName === this.RESEARCH_CHANNEL_NAME;
  }

  /**
   * Detect if content contains a YouTube URL
   */
  private detectYouTubeUrl(content: string): string | null {
    return this.youtubeAnalysisService.extractYouTubeUrl(content);
  }

  /**
   * Add loading indicator reaction to message
   */
  private async addLoadingReaction(message: Message): Promise<void> {
    try {
      await message.react('⏳');
      console.log('⏳ [DEBUG] Added loading reaction to message');
    } catch (error) {
      console.warn('⚠️ Failed to add loading reaction:', error);
    }
  }

  /**
   * Add completion indicator reaction to message
   */
  private async addCompletionReaction(message: Message): Promise<void> {
    try {
      // Remove loading reaction first
      await this.removeLoadingReaction(message);
      // Add completion reaction
      await message.react('✅');
      console.log('✅ [DEBUG] Added completion reaction to message');
    } catch (error) {
      console.warn('⚠️ Failed to add completion reaction:', error);
    }
  }

  /**
   * Add error indicator reaction to message
   */
  private async addErrorReaction(message: Message): Promise<void> {
    try {
      // Remove loading reaction first
      await this.removeLoadingReaction(message);
      // Add error reaction
      await message.react('❌');
      console.log('❌ [DEBUG] Added error reaction to message');
    } catch (error) {
      console.warn('⚠️ Failed to add error reaction:', error);
    }
  }

  /**
   * Remove loading reaction from message
   */
  private async removeLoadingReaction(message: Message): Promise<void> {
    try {
      const reaction = message.reactions.cache.find(r => r.emoji.name === '⏳');
      if (reaction && reaction.me) {
        await reaction.users.remove(message.client.user);
        console.log('🗑️ [DEBUG] Removed loading reaction from message');
      }
    } catch (error) {
      console.warn('⚠️ Failed to remove loading reaction:', error);
    }
  }

  /**
   * Add transcript completion indicator reaction to message (for YouTube)
   */
  private async addTranscriptCompletionReaction(message: Message): Promise<void> {
    try {
      // Remove loading reaction first
      await this.removeLoadingReaction(message);
      // Add transcript completion reaction
      await message.react('🎬');
      console.log('🎬 [DEBUG] Added transcript completion reaction to message');
    } catch (error) {
      console.warn('⚠️ Failed to add transcript completion reaction:', error);
    }
  }

  /**
   * Add summary completion indicator reaction to message (for YouTube)
   */
  private async addSummaryCompletionReaction(message: Message): Promise<void> {
    try {
      // Add summary completion reaction (keep transcript reaction)
      await message.react('✅');
      console.log('✅ [DEBUG] Added summary completion reaction to message');
    } catch (error) {
      console.warn('⚠️ Failed to add summary completion reaction:', error);
    }
  }

  /**
   * Handle YouTube URL processing for immediate transcript access
   */
  async handleYouTubeUrl(message: Message, url: string): Promise<void> {
    console.log('🎬 [DEBUG] ResearchHandler.handleYouTubeUrl() starting');
    console.log(`   URL: ${url}`);
    
    // Add loading indicator
    await this.addLoadingReaction(message);
    
    try {
      // Create completion callback for when summary is finished
      const onSummaryComplete = async () => {
        await this.addSummaryCompletionReaction(message);
      };
      
      // Process YouTube URL with immediate transcript and async summary
      const result = await this.youtubeAnalysisService.processYouTubeUrl(message, url, true, onSummaryComplete);
      
      if (result.status === 'success') {
        console.log('✅ [DEBUG] YouTube URL processed successfully');
        // Note: Transcript is already sent to Discord by YouTubeAnalysisService
        // Add completion reaction for transcript phase
        await this.addTranscriptCompletionReaction(message);
      } else {
        console.error('❌ [DEBUG] YouTube URL processing failed:', result.error);
        await this.addErrorReaction(message);
      }
    } catch (error) {
      console.error('❌ [DEBUG] YouTube URL handling failed:', error);
      await this.addErrorReaction(message);
      
      // Send error message
      try {
        if ('reply' in message) {
          await message.reply(`❌ Failed to process YouTube video: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } catch (replyError) {
        console.error('❌ Failed to send YouTube error reply:', replyError);
      }
    }
  }

  /**
   * Handle messages in the research channel
   * Uses Larry's AI capabilities for research assistance or YouTube analysis
   */
  async handleResearchMessage(message: Message): Promise<void> {
    try {
      const content = message.content;

      if (!content || content.trim() === '') {
        console.log('⚠️ Empty message content, skipping research consultation');
        return;
      }

      console.log(`🔬 Processing research request: "${content.substring(0, 50)}..."`);

      // Check if content contains YouTube URL
      const youtubeUrl = this.detectYouTubeUrl(content);
      
      if (youtubeUrl) {
        console.log('🎬 [DEBUG] YouTube URL detected, using YouTube analysis service');
        await this.handleYouTubeUrl(message, youtubeUrl);
        return;
      }

      // Regular research processing for non-YouTube content
      console.log('🔍 [DEBUG] No YouTube URL detected, using standard research analysis');

      // Collect context using shared service for research channel
      // const analysisContext = await this.analysisService.collectReplyContext(message, 5);
      const analysisContext = {
        context: '',
        contextInfo: '',
      };

      console.log('🔍 Using Larry AI for research analysis...');

      // Add loading indicator
      await this.addLoadingReaction(message);

      // Process query using shared service with Larry's capabilities
      const result = await this.analysisService.processQuery(
        {
          query: content,
          source: 'research',
          outputFormat: 'message',
        },
        analysisContext
      );

      // Send result using conditional reply strategy
      await this.analysisService.sendAsConditionalReply(message, result, content);

      // Add completion indicator
      await this.addCompletionReaction(message);
      console.log('✅ Research consultation response sent');
    } catch (error) {
      await this.addErrorReaction(message);
      await this.analysisService.handleError(message, error, message.content);
    }
  }
}
