import { TranslationAIService } from './translationAIService';
import { TranslationProcessingResult, ParsedTranslationEntry, ProcessingScenario } from './types';

// 翻訳サービスクラス - Larry による翻訳処理のコア機能
export class TranslationService {
  private translationAIService: TranslationAIService;

  constructor() {
    this.translationAIService = new TranslationAIService();
  }

  // 新しい翻訳フォーマットを解析
  parseTranslationEntry(content: string): ParsedTranslationEntry {
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
  determineProcessingScenario(parsedEntry: ParsedTranslationEntry): ProcessingScenario {
    const detectedLanguage = this.translationAIService.detectLanguageByPattern(
      parsedEntry.targetSentence
    );

    if (detectedLanguage === 'japanese') {
      return parsedEntry.tryTranslation ? 'japanese-with-try' : 'japanese-only';
    } else {
      // 'english' (including mixed content treated as english)
      return 'english-only';
    }
  }

  // 翻訳エントリを処理（統一された単一AI呼び出し）
  async processTranslationEntry(content: string): Promise<TranslationProcessingResult> {
    try {
      console.log(
        `📔 Larry is analyzing translation entry with unified processing: "${content.substring(0, 50)}..."`
      );

      // 新しいフォーマットを解析
      const parsedEntry = this.parseTranslationEntry(content);
      const scenario = this.determineProcessingScenario(parsedEntry);
      console.log(
        `📝 Parsed entry - Target: "${parsedEntry.targetSentence}", Scenario: ${scenario}, Questions: ${parsedEntry.questions?.length || 0}`
      );

      // シナリオに基づいた処理を実行
      const result = await this.translationAIService.processUnifiedDiary(parsedEntry, scenario);

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
        educationalExplanation: result.educationalExplanation || undefined,
        hasQuestions: result.hasQuestions,
        questionAnswers: result.questionAnswers || undefined,
      };
    } catch (error) {
      console.error('❌ Larry encountered error processing translation:', error);
      throw new Error('Failed to process translation entry');
    }
  }

  // チャンネルが翻訳チャンネルかどうかを判定
  isValidTranslationChannel(channelName?: string): boolean {
    if (!channelName) return false;
    return channelName.toLowerCase().includes('translation');
  }

  // テキストを指定長で切り詰め
  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }
}
