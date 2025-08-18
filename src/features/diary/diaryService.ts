import { DiaryAIService } from './diaryAIService';

// 日記処理結果の型定義
export interface DiaryProcessingResult {
  detectedLanguage: 'japanese' | 'english' | 'other';
  translation: string;
  grammarCheck?: string;
  enhancedEnglish?: string;
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

      // 英語の場合は包括的処理を実行（1回のAI呼び出しで全て処理）
      let grammarCheck: string | undefined;
      let enhancedEnglish: string | undefined;
      let translation = translateResult.translation;

      if (translateResult.detectedLanguage === 'english') {
        console.log('🔍 Running comprehensive English processing (translation, enhancement, grammar)...');
        const comprehensiveResult = await this.diaryAIService.processEnglishDiaryComprehensive(content);
        translation = comprehensiveResult.translation;
        enhancedEnglish = comprehensiveResult.enhancedEnglish;
        grammarCheck = comprehensiveResult.grammarFeedback;
      }

      const result: DiaryProcessingResult = {
        detectedLanguage: translateResult.detectedLanguage,
        translation,
        grammarCheck,
        enhancedEnglish,
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
