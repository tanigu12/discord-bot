import { Message } from 'discord.js';
import { BaseAIService } from '../../services/baseAIService';
import { AnalysisService } from '../analysis/analysisService';

export class ResearchHandler extends BaseAIService {
  private readonly RESEARCH_CHANNEL_NAME = 'research';
  private analysisService: AnalysisService;

  constructor() {
    super();
    this.analysisService = new AnalysisService();
  }

  /**
   * Check if message is from the research channel
   */
  isResearchChannel(message: Message): boolean {
    const channelName = message.channel.type === 0 ? message.channel.name : null;
    return channelName === this.RESEARCH_CHANNEL_NAME;
  }

  /**
   * Handle messages in the research channel
   * Uses Larry's AI capabilities for research assistance
   */
  async handleResearchMessage(message: Message): Promise<void> {
    try {
      const content = message.content;

      if (!content || content.trim() === '') {
        console.log('⚠️ Empty message content, skipping research consultation');
        return;
      }

      console.log(`🔬 Processing research request: "${content.substring(0, 50)}..."`);

      // Collect context using shared service for research channel
      // const analysisContext = await this.analysisService.collectReplyContext(message, 5);
      const analysisContext = {
        context: '',
        contextInfo: '',
      };

      console.log('🔍 Using Larry AI for research analysis...');

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

      console.log('✅ Research consultation response sent');
    } catch (error) {
      await this.analysisService.handleError(message, error, message.content);
    }
  }
}
