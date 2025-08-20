import { DiaryAIService } from './diaryAIService';
import { DiaryProcessingResult, ParsedDiaryEntry, ProcessingScenario } from './types';

// 日記サービスクラス - Larry による日記処理のコア機能
export class DiaryService {
  private diaryAIService: DiaryAIService;

  constructor() {
    this.diaryAIService = new DiaryAIService();
  }

  // 新しい日記フォーマットを解析
  parseDiaryEntry(content: string): ParsedDiaryEntry {
    const lines = content.trim().split('\n');
    
    let tryTranslation: string | undefined;
    const questions: string[] = [];
    const targetLines: string[] = [];

    // 全ての行を解析して、[try]と[q]を分離し、残りをtargetSentenceとする
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (trimmedLine.startsWith('[try]')) {
        // [try]翻訳チャレンジを抽出
        tryTranslation = trimmedLine.substring(5).trim();
      } else if (trimmedLine.startsWith('[q]')) {
        // [q]質問を抽出
        questions.push(trimmedLine.substring(3).trim());
      } else {
        // [try]でも[q]でもない行はtargetSentenceの一部
        targetLines.push(trimmedLine);
      }
    }

    // targetSentenceは[try]と[q]を除いた残りのテキスト
    const targetSentence = targetLines.join('\n').trim();

    return {
      targetSentence,
      tryTranslation: tryTranslation || undefined,
      questions: questions.length > 0 ? questions : undefined,
    };
  }

  // 処理シナリオを決定
  determineProcessingScenario(parsedEntry: ParsedDiaryEntry): ProcessingScenario {
    const detectedLanguage = this.diaryAIService.detectLanguageByPattern(
      parsedEntry.targetSentence
    );

    if (detectedLanguage === 'japanese' || detectedLanguage === 'mixing') {
      return parsedEntry.tryTranslation ? 'japanese-with-try' : 'japanese-only';
    } else {
      // 'english'
      return 'english-only';
    }
  }

  // 日記エントリを処理（統一された単一AI呼び出し）
  async processDiaryEntry(content: string): Promise<DiaryProcessingResult> {
    try {
      console.log(
        `📔 Larry is analyzing diary entry with unified processing: "${content.substring(0, 50)}..."`
      );

      // 新しいフォーマットを解析
      const parsedEntry = this.parseDiaryEntry(content);
      const scenario = this.determineProcessingScenario(parsedEntry);
      console.log(
        `📝 Parsed entry - Target: "${parsedEntry.targetSentence}", Scenario: ${scenario}, Questions: ${parsedEntry.questions?.length || 0}`
      );

      // シナリオに基づいた処理を実行
      const result = await this.diaryAIService.processUnifiedDiary(parsedEntry, scenario);

      console.log(
        `✅ Larry completed scenario-based analysis - scenario: ${scenario}, language: ${result.detectedLanguage}`
      );
      return {
        detectedLanguage: result.detectedLanguage,
        targetSentence: result.targetSentence,
        scenario: result.scenario,
        threeLevelTranslations: result.threeLevelTranslations || undefined,
        translationEvaluation: result.translationEvaluation || undefined,
        japaneseTranslation: result.japaneseTranslation || undefined,
        vocabularyExplanation: result.vocabularyExplanation || undefined,
        grammarExplanation: result.grammarExplanation || undefined,
        hasQuestions: result.hasQuestions,
        questionAnswers: result.questionAnswers || undefined,
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
      case 'mixing':
        return '🇯🇵🇺🇸 Mixed (JP + EN)';
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
