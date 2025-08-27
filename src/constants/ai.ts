// AI関連の定数定義

// OpenAI モデル定義
export const OPENAI_MODELS = {
  // メインモデル - GPT-5 Mini
  MAIN: 'gpt-5-mini',

  // レガシーサポート用（必要に応じて）
  GPT_4O_MINI: 'gpt-4o-mini',
} as const;

// 機能別のモデル設定
export const MODEL_CONFIGS = {
  // 日記処理用
  DIARY_PROCESSING: {
    model: OPENAI_MODELS.MAIN,
    maxCompletionTokens: 5000,
  },

  // 翻訳用
  TRANSLATION: {
    model: OPENAI_MODELS.MAIN,
    maxCompletionTokens: 1500,
  },

  // 文法チェック用
  GRAMMAR_CHECK: {
    model: OPENAI_MODELS.MAIN,
    maxCompletionTokens: 1500,
  },

  // 言語検出用（軽量タスク）
  LANGUAGE_DETECTION: {
    model: OPENAI_MODELS.MAIN,
    maxCompletionTokens: 50,
  },

  // 日記トピック生成用
  TOPIC_GENERATION: {
    model: OPENAI_MODELS.MAIN,
    maxCompletionTokens: 1500,
  },
} as const;
