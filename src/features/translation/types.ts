// 日記機能の型定義を集約

// 検出可能な言語の型
export type DetectedLanguage = 'japanese' | 'english' | 'mixing';

// 翻訳バージョンの三パターン（レベル別）
export interface ThreeTranslationVersions {
  casual: string;
  formal: string;
  advanced: string;
}

// 三段階レベル翻訳（日本語→英語用）
export interface ThreeLevelTranslations {
  beginner: string;
  intermediate: string;
  upper: string;
}

// [try]翻訳フィードバック
export interface TryTranslationFeedback {
  feedback: string;
  threeVersions: ThreeTranslationVersions;
}

// 三段階翻訳評価とフィードバック
export interface TranslationEvaluationFeedback {
  evaluation: string;
  studyPoints: string[];
  improvements: string;
}

// 日記エントリの解析結果
export interface ParsedTranslationEntry {
  targetSentence: string;
  tryTranslation?: string;
  questions?: string[];
}

// 質問回答結果
export interface QuestionAnswer {
  question: string;
  answer: string;
}

// 処理シナリオの型
export type ProcessingScenario = 
  | 'japanese-only'           // 1. 日本語のみ
  | 'japanese-with-try'       // 2. 日本語 + [try]英語翻訳
  | 'english-only';           // 3. 英語のみ（日本語混在あり）

// 日記処理結果の型定義
export interface TranslationProcessingResult {
  detectedLanguage: DetectedLanguage;
  targetSentence: string;
  scenario: ProcessingScenario;
  
  // シナリオ1&2: 日本語入力の場合の三段階翻訳
  threeLevelTranslations?: ThreeLevelTranslations;
  
  // シナリオ2: [try]翻訳評価
  translationEvaluation?: TranslationEvaluationFeedback;
  
  // シナリオ3: 英語入力の場合の翻訳と解説
  japaneseTranslation?: string;
  vocabularyExplanation?: string;
  grammarExplanation?: string;
  
  // 共通: 質問回答
  hasQuestions?: boolean;
  questionAnswers?: QuestionAnswer[];
}

// 英語日記の包括的処理結果
export interface EnglishDiaryComprehensiveResult {
  translation: string;
  enhancedEnglish: string;
  grammarFeedback: string;
}

// 統一された日記処理結果（processUnifiedDiary）
export interface UnifiedTranslationProcessingResult {
  detectedLanguage: DetectedLanguage;
  targetSentence: string;
  scenario: ProcessingScenario;
  
  // シナリオ1&2: 日本語入力の場合の三段階翻訳
  threeLevelTranslations?: ThreeLevelTranslations | null;
  
  // シナリオ2: [try]翻訳評価
  translationEvaluation?: TranslationEvaluationFeedback | null;
  
  // シナリオ3: 英語入力の場合の翻訳と解説
  japaneseTranslation?: string | null;
  vocabularyExplanation?: string | null;
  grammarExplanation?: string | null;
  
  // 共通: 質問回答
  hasQuestions?: boolean;
  questionAnswers?: QuestionAnswer[] | null;
}

// [try]付き日本語日記処理結果
export interface JapaneseDiaryWithTryResult {
  translationFeedback: string;
  threeVersions: ThreeTranslationVersions;
}

// 言語検出と翻訳結果
export interface LanguageDetectionAndTranslationResult {
  detectedLanguage: DetectedLanguage;
  translation: string;
  hasTryTranslation?: boolean;
}

// 日記トピック生成結果
export interface DiaryTopicsGenerationResult {
  newsTopics: string[];
  personalPrompts: string[];
  encouragement: string;
}

// ランダムトピック設定
export interface RandomTopicConfig {
  categories: string[];
  newsTopicsCount: number;
  personalPromptsCount: number;
  totalTopics: number;
  tone: string;
  style: string;
}