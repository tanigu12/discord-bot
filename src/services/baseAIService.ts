import OpenAI from 'openai';
import { OPENAI_MODELS } from '../constants/ai';
import { AIPartnerIntegration } from '../features/ai-partner/integration';

// OpenAI API の基本機能を提供する共有サービス
export class BaseAIService {
  private openai: OpenAI | null = null;
  protected aiPartnerIntegration: AIPartnerIntegration;

  constructor() {
    this.aiPartnerIntegration = new AIPartnerIntegration();
  }

  // OpenAI クライアントの取得（遅延初期化）
  protected getOpenAI(): OpenAI {
    if (!this.openai) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable is missing');
      }
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    return this.openai;
  }

  // 基本的な OpenAI API 呼び出し
  protected async callOpenAI(
    systemPrompt: string,
    userMessage: string,
    options: {
      model?: string;
      maxCompletionTokens?: number;
      temperature?: number;
      response_format?:
        | { type: 'text' | 'json_object' }
        | {
            type: 'json_schema';
            json_schema: {
              name: string;
              strict?: boolean;
              schema: Record<string, unknown>;
            };
          };
    } = {}
  ): Promise<string> {
    try {
      const openai = this.getOpenAI();

      // check prompt
      console.info('[log]systemPrompt================', systemPrompt);
      console.info('[log]userPrompt================', userMessage);
      console.info('[log]options================', JSON.stringify(options));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const requestConfig: any = {
        model: options.model || OPENAI_MODELS.MAIN,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        max_completion_tokens: options.maxCompletionTokens || 1000,
        // GPT-5-mini only supports default temperature (1.0)
      };

      // Add response_format if specified
      if (options.response_format) {
        requestConfig.response_format = options.response_format;
      }

      const response = await openai.chat.completions.create(requestConfig);

      return response.choices[0]?.message?.content || 'AI response failed';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get AI response');
    }
  }

  // Larry の人格統合へのアクセス
  protected getAIPartnerIntegration(): AIPartnerIntegration {
    return this.aiPartnerIntegration;
  }
}
