import { DiaryAIService } from './diaryAIService';

// 日記処理結果の型定義
export interface DiaryProcessingResult {
  detectedLanguage: 'japanese' | 'english' | 'other';
  translation: string;
  grammarCheck?: string;
}

// 日記サービスクラス - Larry による日記処理のコア機能
export class DiaryService {
  private diaryAIService: DiaryAIService;

  constructor() {
    this.diaryAIService = new DiaryAIService();
  }

  // 日記エントリを処理（言語検出、翻訳、文法チェック）
  async processDiaryEntry(content: string): Promise<DiaryProcessingResult> {
    try {
      console.log(`📔 Larry is analyzing diary entry: "${content.substring(0, 50)}..."`);

      // 言語検出と翻訳を実行
      const translateResult = await this.diaryAIService.detectLanguageAndTranslate(content);

      // 英語の場合は文法チェックを追加
      let grammarCheck: string | undefined;
      if (translateResult.detectedLanguage === 'english') {
        console.log('🔍 Running grammar check for English diary entry...');
        grammarCheck = await this.diaryAIService.checkDiaryGrammar(content);
      }

      const result: DiaryProcessingResult = {
        detectedLanguage: translateResult.detectedLanguage,
        translation: translateResult.translation,
        grammarCheck,
      };

      console.log(`✅ Larry completed diary analysis - detected: ${result.detectedLanguage}`);
      return result;
    } catch (error) {
      console.error('❌ Larry encountered error processing diary:', error);
      throw new Error('Failed to process diary entry');
    }
  }

  // チャンネルが日記チャンネルかどうかを判定
  isValidDiaryChannel(channelName?: string): boolean {
    if (!channelName) return false;
    return channelName.toLowerCase().includes('diary');
  }

  // 言語名を表示用に変換
  getLanguageDisplayName(language: string): string {
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
  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }
}
