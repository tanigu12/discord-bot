import { EmbedBuilder, User, Message } from 'discord.js';
import { DiaryProcessingResult } from './diaryService';

// Discord埋め込みメッセージのフォーマット機能
export class DiaryFormatter {
  
  // Larry による日記フィードバックの埋め込みとフォローアップメッセージを作成
  async createFeedbackResponse(
    result: DiaryProcessingResult, 
    originalContent: string,
    author: User,
    message: Message
  ): Promise<void> {
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

    // メイン埋め込みを送信
    const reply = await message.reply({ embeds: [embed] });

    // Larry の文法フィードバックを追加（英語の場合）
    if (result.grammarCheck) {
      // 文法フィードバックが長い場合は別のメッセージで送信
      if (result.grammarCheck.length > 2000) {
        // 2000文字ずつに分割して送信
        const chunks = this.splitTextIntoChunks(result.grammarCheck, 2000);
        
        for (let i = 0; i < chunks.length; i++) {
          const feedbackEmbed = new EmbedBuilder()
            .setTitle(`📝 Larry's Grammar Feedback ${chunks.length > 1 ? `(${i + 1}/${chunks.length})` : ''}`)
            .setDescription(chunks[i])
            .setColor(0x00AE86)
            .setTimestamp();
          
          await reply.reply({ embeds: [feedbackEmbed] });
        }
      } else {
        // 短い場合は単一の埋め込みで送信
        const feedbackEmbed = new EmbedBuilder()
          .setTitle('📝 Larry\'s Grammar Feedback')
          .setDescription(result.grammarCheck)
          .setColor(0x00AE86)
          .setTimestamp();
        
        await reply.reply({ embeds: [feedbackEmbed] });
      }
    }
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

  // テキストを指定された長さのチャンクに分割
  private splitTextIntoChunks(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    let currentIndex = 0;

    while (currentIndex < text.length) {
      let endIndex = currentIndex + chunkSize;
      
      // 文の途中で切れないように、最適な切断点を探す
      if (endIndex < text.length) {
        const lastSentenceEnd = text.lastIndexOf('.', endIndex);
        const lastParagraphEnd = text.lastIndexOf('\n', endIndex);
        const lastSpaceEnd = text.lastIndexOf(' ', endIndex);
        
        // 最適な切断点を選択（文末 > 段落末 > 単語境界）
        if (lastSentenceEnd > currentIndex + chunkSize * 0.7) {
          endIndex = lastSentenceEnd + 1;
        } else if (lastParagraphEnd > currentIndex + chunkSize * 0.7) {
          endIndex = lastParagraphEnd;
        } else if (lastSpaceEnd > currentIndex + chunkSize * 0.7) {
          endIndex = lastSpaceEnd;
        }
      }
      
      chunks.push(text.substring(currentIndex, endIndex).trim());
      currentIndex = endIndex;
    }

    return chunks;
  }
}