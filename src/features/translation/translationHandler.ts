import { Message } from 'discord.js';
import { TranslationService } from './translationService';
import { TranslationFormatter } from './translationFormatter';
import { googleTranslationService } from './googleTranslationService';

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

      // Google Translation を試行
      await this.handleGoogleTranslation(message);

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

  // Google Translation の処理
  private async handleGoogleTranslation(message: Message): Promise<void> {
    const parsedEntry = this.translationService.parseTranslationEntry(message.content);
    
    if (!parsedEntry.targetSentence) {
      return;
    }

    console.log(`🔍 Determining language scenario for: "${parsedEntry.targetSentence}"`);
    
    const scenario = this.translationService.determineProcessingScenario(parsedEntry);
    console.log(`📝 Processing scenario: ${scenario}`);
    
    try {
      const translation = await this.getGoogleTranslation(scenario, parsedEntry.targetSentence);
      if (translation) {
        await message.reply(translation);
      }
    } catch (translationError) {
      console.error('❌ Google Translation failed:', translationError);
    }
  }

  // 言語シナリオに基づく翻訳処理
  private async getGoogleTranslation(scenario: string, text: string): Promise<string | null> {
    if (scenario === 'japanese-only' || scenario === 'japanese-with-try' || scenario === 'mixing') {
      console.log(`🇯🇵 Translating Japanese to English...`);
      const translation = await googleTranslationService.translateToEnglish(text);
      console.log(`✨ Google Translation (JA→EN): "${translation}"`);
      return `🌐 **Google Translation (JP→EN):**\n> ${translation}`;
    }
    
    if (scenario === 'english-only') {
      console.log(`🇺🇸 Translating English to Japanese...`);
      const translation = await googleTranslationService.translateToJapanese(text);
      console.log(`✨ Google Translation (EN→JA): "${translation}"`);
      return `🌐 **Google Translation (EN→JP):**\n> ${translation}`;
    }
    
    return null;
  }

  // チャンネルが翻訳チャンネルかどうかを判定
  isTranslationChannel(message: Message): boolean {
    const channelName = message.channel.type === 0 ? message.channel.name?.toLowerCase() : '';
    return this.translationService.isValidTranslationChannel(channelName);
  }
}
