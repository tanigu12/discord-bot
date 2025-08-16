import { EmbedBuilder, User } from 'discord.js';
import { DiaryProcessingResult } from './diaryService';

// Discord埋め込みメッセージのフォーマット機能
export class DiaryFormatter {
  
  // Larry による日記フィードバックの埋め込みを作成
  createFeedbackEmbed(
    result: DiaryProcessingResult, 
    originalContent: string,
    author: User
  ): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle('📝 Larry\'s Diary Feedback')
      .setColor(0x00AE86)
      .setTimestamp()
      .setFooter({ 
        text: `Larry detected: ${this.getLanguageDisplayName(result.detectedLanguage)} • Canadian English Tutor`,
        iconURL: author.displayAvatarURL()
      });

    // 元のテキストを追加
    embed.addFields({
      name: `Original (${this.getLanguageDisplayName(result.detectedLanguage)})`,
      value: this.truncateText(originalContent, 1000),
      inline: false
    });

    // 翻訳を追加
    const targetLang = result.detectedLanguage === 'japanese' ? 'English' : 'Japanese';
    embed.addFields({
      name: `Translation (${targetLang})`,
      value: this.truncateText(result.translation, 1000),
      inline: false
    });

    // Larry の文法フィードバックを追加（英語の場合）
    if (result.grammarCheck) {
      embed.addFields({
        name: '📝 Larry\'s Grammar Feedback',
        value: this.truncateText(result.grammarCheck, 1000),
        inline: false
      });
    }

    return embed;
  }

  // エラー時の埋め込みメッセージを作成
  createErrorEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle('❌ Larry\'s Translation Error')
      .setDescription('Sorry, I encountered an error while processing your diary entry. Please try again later.')
      .setColor(0xFF0000)
      .setTimestamp();
  }

  // 言語名を表示用に変換
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

  // テキストを指定長で切り詰め
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }
}