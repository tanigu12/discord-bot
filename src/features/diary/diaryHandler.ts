import { Message } from 'discord.js';
import { DiaryService } from './diaryService';
import { DiaryFormatter } from './diaryFormatter';

// メインの日記ハンドラークラス - Discord メッセージの処理を担当
export class DiaryHandler {
  private diaryService: DiaryService;
  private diaryFormatter: DiaryFormatter;

  constructor() {
    this.diaryService = new DiaryService();
    this.diaryFormatter = new DiaryFormatter();
  }

  // 日記メッセージを処理してフィードバックを返信
  async handleDiaryMessage(message: Message): Promise<void> {
    try {
      // ボットメッセージや空メッセージはスキップ
      if (message.author.bot || !message.content.trim()) {
        return;
      }

      console.log(`📔 Processing diary message from ${message.author.tag}`);

      // Larry による日記処理を実行
      const result = await this.diaryService.processDiaryEntry(message.content);

      // フィードバック応答を作成・送信（長いメッセージも完全に送信）
      await this.diaryFormatter.createFeedbackResponse(
        result, 
        message.content, 
        message.author,
        message
      );
      
      console.log('✅ Larry completed diary feedback');
      
    } catch (error) {
      console.error('❌ Error processing diary message:', error);
      
      // エラーメッセージをユーザーに送信
      const errorEmbed = this.diaryFormatter.createErrorEmbed();

      try {
        await message.reply({ embeds: [errorEmbed] });
      } catch (replyError) {
        console.error('Failed to send error message:', replyError);
      }
    }
  }

  // チャンネルが日記チャンネルかどうかを判定
  isDiaryChannel(message: Message): boolean {
    const channelName = message.channel.type === 0 ? message.channel.name?.toLowerCase() : '';
    return this.diaryService.isValidDiaryChannel(channelName);
  }
}