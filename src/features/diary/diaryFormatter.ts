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
      .setTitle("📝 Larry's Diary Feedback")
      .setColor(0x00ae86)
      .setTimestamp()
      .setFooter({
        text: `Larry detected: ${this.getLanguageDisplayName(result.detectedLanguage)} • Canadian English Tutor`,
        iconURL: author.displayAvatarURL(),
      });

    // 元のテキストを追加
    embed.addFields({
      name: `Original (${this.getLanguageDisplayName(result.detectedLanguage)})`,
      value: this.truncateText(originalContent, 1000),
      inline: false,
    });

    // メイン埋め込みを送信
    const reply = await message.reply({ embeds: [embed] });

    // [try]翻訳フィードバックがある場合の処理
    if (result.hasTryTranslation && result.tryTranslationFeedback) {
      // フィードバック内容を作成
      let feedbackContent = `**🎯 Feedback on your English translation attempt:**\n${result.tryTranslationFeedback.feedback}`;
      
      feedbackContent += `\n\n**📚 Three Translation Patterns:**`;
      feedbackContent += `\n\n**1. 💬 Casual (Conversational):**\n${result.tryTranslationFeedback.threeVersions.casual}`;
      feedbackContent += `\n\n**2. ✍️ Formal (Polished):**\n${result.tryTranslationFeedback.threeVersions.formal}`;
      feedbackContent += `\n\n**3. 🎓 Advanced (Sophisticated):**\n${result.tryTranslationFeedback.threeVersions.advanced}`;
      
      await this.sendLongContent("Translation Feedback & Examples", feedbackContent, reply);
    } else {
      // 通常の翻訳処理
      const targetLang = result.detectedLanguage === 'japanese' ? 'English' : 'Japanese';
      let allContent = `**Translation (${targetLang}):**\n${result.translation}`;

      // 英語の場合は向上版を追加
      if (result.enhancedEnglish) {
        allContent += `\n\n**✨ Enhanced English:**\n${result.enhancedEnglish}`;
      }

      // Larry の文法フィードバックを追加（英語の場合）
      if (result.grammarCheck) {
        allContent += `\n\n**📝 Larry's Grammar Feedback:**\n${result.grammarCheck}`;
      }

      await this.sendLongContent("Translation & Feedback", allContent, reply);
    }
  }

  // エラー時の埋め込みメッセージを作成
  createErrorEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle("❌ Larry's Translation Error")
      .setDescription(
        'Sorry, I encountered an error while processing your diary entry. Please try again later.'
      )
      .setColor(0xff0000)
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

  // 長いコンテンツを適切なサイズに分割して送信
  private async sendLongContent(title: string, content: string, replyMessage: Message): Promise<void> {
    if (content.length <= 2000) {
      // 単一メッセージで送信
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(content)
        .setColor(0x00ae86)
        .setTimestamp();
      
      await replyMessage.reply({ embeds: [embed] });
    } else {
      // 複数メッセージに分割して送信
      const chunks = this.splitTextIntoChunks(content, 2000);
      
      for (let i = 0; i < chunks.length; i++) {
        const embed = new EmbedBuilder()
          .setTitle(`${title} (${i + 1}/${chunks.length})`)
          .setDescription(chunks[i])
          .setColor(0x00ae86)
          .setTimestamp();
        
        await replyMessage.reply({ embeds: [embed] });
      }
    }
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
