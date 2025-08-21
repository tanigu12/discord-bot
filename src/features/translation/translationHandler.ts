import { Message } from 'discord.js';
import { TranslationService } from './translationService';
import { TranslationFormatter } from './translationFormatter';

// メインの翻訳ハンドラークラス - Discord メッセージの処理を担当
export class TranslationHandler {
  private translationService: TranslationService;
  private translationFormatter: TranslationFormatter;

  constructor() {
    this.translationService = new TranslationService();
    this.translationFormatter = new TranslationFormatter();
  }

  // 翻訳メッセージを処理してフィードバックを返信
  async handleTranslationMessage(message: Message): Promise<void> {
    try {
      // ボットメッセージや空メッセージはスキップ
      if (message.author.bot || !message.content.trim()) {
        return;
      }

      console.log(`🌐 Processing translation message from ${message.author.tag}`);

      // Larry による翻訳処理を実行
      const result = await this.translationService.processTranslationEntry(message.content);

      // フィードバック応答を作成・送信（長いメッセージも完全に送信）
      await this.translationFormatter.createFeedbackResponse(
        result,
        message.content,
        message.author,
        message
      );

      console.log('✅ Larry completed translation feedback');
    } catch (error) {
      console.error('❌ Error processing translation message:', error);

      // エラーメッセージをユーザーに送信
      const errorEmbed = this.translationFormatter.createErrorEmbed();

      try {
        await message.reply({ embeds: [errorEmbed] });
      } catch (replyError) {
        console.error('Failed to send error message:', replyError);
      }
    }
  }

  // チャンネルが翻訳チャンネルかどうかを判定
  isTranslationChannel(message: Message): boolean {
    const channelName = message.channel.type === 0 ? message.channel.name?.toLowerCase() : '';
    return this.translationService.isValidTranslationChannel(channelName);
  }
}
