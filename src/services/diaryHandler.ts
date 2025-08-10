import { Message, EmbedBuilder } from 'discord.js';
import { OpenAIService } from './openai';

export class DiaryHandler {
  private openaiService: OpenAIService;

  constructor() {
    this.openaiService = new OpenAIService();
  }

  async handleDiaryMessage(message: Message): Promise<void> {
    try {
      // Skip bot messages and empty messages
      if (message.author.bot || !message.content.trim()) {
        return;
      }

      console.log(`📔 Processing diary message from ${message.author.tag}: "${message.content.substring(0, 50)}..."`);

      // Detect language and translate
      const result = await this.openaiService.detectLanguageAndTranslate(message.content);

      // Create embed for the response
      const embed = new EmbedBuilder()
        .setTitle('📝 Diary Translation')
        .setColor(0x00AE86)
        .setTimestamp()
        .setFooter({ 
          text: `Detected: ${this.getLanguageDisplayName(result.detectedLanguage)}`,
          iconURL: message.author.displayAvatarURL()
        });

      // Add original text
      embed.addFields({
        name: `Original (${this.getLanguageDisplayName(result.detectedLanguage)})`,
        value: this.truncateText(message.content, 1000),
        inline: false
      });

      // Add translation
      const targetLang = result.detectedLanguage === 'japanese' ? 'English' : 'Japanese';
      embed.addFields({
        name: `Translation (${targetLang})`,
        value: this.truncateText(result.translation, 1000),
        inline: false
      });

      // Add grammar check if available (for English text)
      if (result.grammarCheck) {
        embed.addFields({
          name: '📝 Grammar Check',
          value: this.truncateText(result.grammarCheck, 1000),
          inline: false
        });
      }

      // Reply to the original message
      await message.reply({ embeds: [embed] });
      
      console.log('✅ Diary translation completed');
    } catch (error) {
      console.error('❌ Error processing diary message:', error);
      
      // Send error message to user
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Translation Error')
        .setDescription('Sorry, I encountered an error while translating your diary entry. Please try again later.')
        .setColor(0xFF0000)
        .setTimestamp();

      try {
        await message.reply({ embeds: [errorEmbed] });
      } catch (replyError) {
        console.error('Failed to send error message:', replyError);
      }
    }
  }

  private getLanguageDisplayName(language: string): string {
    switch (language) {
      case 'japanese':
        return '🇯🇵 Japanese';
      case 'english':
        return '🇺🇸 English';
      default:
        return '🌍 Other';
    }
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }

  isDiaryChannel(message: Message): boolean {
    // Check if the channel name contains 'diary' (case insensitive)
    const channelName = message.channel.type === 0 ? message.channel.name?.toLowerCase() : '';
    return channelName?.includes('diary') || false;
  }
}