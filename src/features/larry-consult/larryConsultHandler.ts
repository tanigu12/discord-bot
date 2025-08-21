import { Message } from 'discord.js';
import { BaseAIService } from '../../services/baseAIService';
import { AnalysisService } from '../analysisService';

export class LarryConsultHandler extends BaseAIService {
  private readonly CONSULT_LARRY_CHANNEL_NAME = 'consult-larry';
  private analysisService: AnalysisService;

  constructor() {
    super();
    this.analysisService = new AnalysisService();
  }

  // Check if this message is from the consult-larry channel
  isConsultLarryChannel(message: Message): boolean {
    const channelName = message.channel.type === 0 ? message.channel.name : null;
    return channelName === this.CONSULT_LARRY_CHANNEL_NAME;
  }

  // Handle messages in the consult-larry channel
  async handleConsultMessage(message: Message): Promise<void> {
    try {
      if (!message.content || message.content.trim() === '') {
        console.log('⚠️ Empty message content, skipping Larry consultation');
        return;
      }

      console.log(
        `🧙‍♂️ Processing Larry consultation request: "${message.content.substring(0, 50)}..."`
      );

      // Collect context using shared service (will collect context for consult-larry channel)
      const analysisContext = await this.analysisService.collectContextIfNeeded(message, 5);

      console.log('🔍 Using unified analysis service...');

      // Process query using shared service
      const result = await this.analysisService.processQuery(
        {
          query: message.content,
          source: 'larry-consult',
          outputFormat: 'message',
        },
        analysisContext
      );

      // Send result as file attachment using shared service
      await this.analysisService.sendAsFileAttachmentReply(message, result, message.content);

      console.log('✅ Larry consultation response sent');
    } catch (error) {
      await this.analysisService.handleError(message, error, message.content);
    }
  }
}
