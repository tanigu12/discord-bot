import { Message } from 'discord.js';
import { BaseAIService } from '../../services/baseAIService';

export class LarryConsultHandler extends BaseAIService {
  private readonly CONSULT_LARRY_CHANNEL_NAME = 'consult-larry';

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

      console.log(`🧙‍♂️ Processing Larry consultation request: "${message.content.substring(0, 50)}..."`);

      // Get Larry's personality and knowledge
      const aiIntegration = this.getAIPartnerIntegration();
      const systemPrompt = aiIntegration.generateChatPrompt('consultation');
      
      // Add specific context for general consultation
      const consultationContext = `
You are responding to a consultation request in a Discord channel called "consult-larry". 
The user is asking for your advice, opinion, or help on various topics.
Provide helpful, thoughtful responses while maintaining your friendly Canadian personality.
Keep responses conversational and appropriately sized for Discord (aim for 1-3 paragraphs unless more detail is needed).
`;

      const fullSystemPrompt = systemPrompt + consultationContext;

      // Get Larry's response
      const response = await this.callOpenAI(
        fullSystemPrompt,
        message.content,
        {
          model: 'gpt-4o-mini',
          maxTokens: 1500,
          temperature: 0.7
        }
      );

      // Reply to the original message
      await message.reply(response);
      
      console.log('✅ Larry consultation response sent');
    } catch (error) {
      console.error('💥 Error handling Larry consultation:', error);
      
      try {
        await message.reply(
          "Sorry, I'm having some technical difficulties right now. Could you try asking again in a moment? 🤔"
        );
      } catch (replyError) {
        console.error('💥 Error sending error message:', replyError);
      }
    }
  }
}