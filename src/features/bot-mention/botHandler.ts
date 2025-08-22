import { Message } from 'discord.js';
import { LarryAIService } from '../ai-partner/larryAIService';

export class BotHandler {
  private larryAIService: LarryAIService;

  constructor() {
    this.larryAIService = new LarryAIService();
  }

  /**
   * Handle bot mentions with Larry's AI personality
   * Uses Larry's English tutoring capabilities and supportive personality
   */
  async handleBotMention(message: Message, content: string): Promise<void> {
    await this.larryAIService.handleBotMention(message, content);
  }

  /**
   * Remove bot mention from content to get clean query
   */
  extractContentFromMention(message: Message, clientId: string): string {
    return message.content
      .replace(`<@${clientId}>`, '')
      .replace(`<@!${clientId}>`, '')
      .trim();
  }
}