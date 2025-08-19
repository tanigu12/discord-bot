import { DiaryAIService } from './diaryAIService';

// 日記処理結果の型定義
export interface DiaryProcessingResult {
  detectedLanguage: 'japanese' | 'english' | 'other';
  translation: string;
  grammarCheck?: string;
  enhancedEnglish?: string;
  hasTryTranslation?: boolean;
  tryTranslationFeedback?: {
    feedback: string;
    threeVersions: {
      casual: string;
      formal: string;
      advanced: string;
    };
  };
}

// 日記サービスクラス - Larry による日記処理のコア機能
export class DiaryService {
  private diaryAIService: DiaryAIService;

  constructor() {
    this.diaryAIService = new DiaryAIService();
  }

  // 日記エントリを処理（統一された単一AI呼び出し）
  async processDiaryEntry(content: string): Promise<DiaryProcessingResult> {
    try {
      console.log(`📔 Larry is analyzing diary entry with unified processing: "${content.substring(0, 50)}..."`);

      // 統一された処理で全てを1回のAI呼び出しで実行
      const result = await this.diaryAIService.processUnifiedDiary(content);

      console.log(`✅ Larry completed unified diary analysis - detected: ${result.detectedLanguage}`);
      return {
        detectedLanguage: result.detectedLanguage,
        translation: result.translation,
        grammarCheck: result.grammarFeedback || undefined,
        enhancedEnglish: result.enhancedEnglish || undefined,
        hasTryTranslation: result.hasTryTranslation,
        tryTranslationFeedback: result.tryTranslationFeedback || undefined,
      };
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
