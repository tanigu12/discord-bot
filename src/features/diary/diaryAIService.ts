import { BaseAIService } from '../../services/baseAIService';
import { NewsItem } from '../../services/newsService';

// Larry による日記専用AIサービス
export class DiaryAIService extends BaseAIService {
  constructor() {
    super();
  }

  // 日記トピック生成用のJSONスキーマ定義（OpenAI Structured Outputs対応）
  private getDiaryTopicsSchema(_newsTopicsCount: number, _personalPromptsCount: number) {
    return {
      name: 'diary_topics_response',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          newsTopics: {
            type: 'array',
            description:
              'News-inspired diary topics that connect current events to personal experiences',
            items: {
              type: 'string',
            },
          },
          personalPrompts: {
            type: 'array',
            description:
              'Personal reflection prompts focusing on different aspects of life and growth',
            items: {
              type: 'string',
            },
          },
          encouragement: {
            type: 'string',
            description: 'A supportive and encouraging message for the user',
          },
        },
        required: ['newsTopics', 'personalPrompts', 'encouragement'],
        additionalProperties: false,
      },
    };
  }

  // 日記専用翻訳
  async translateDiaryText(text: string, targetLanguage: string): Promise<string> {
    try {
      const systemPrompt = this.aiPartnerIntegration.generateDiaryTranslationPrompt(
        targetLanguage,
        text
      );
      const userMessage = `Please translate this diary entry: "${text}". Include brief grammar explanations and related vocabulary.`;

      return await this.callOpenAI(systemPrompt, userMessage, {
        model: 'gpt-4o-mini',
        maxTokens: 1000,
        temperature: 0.3,
      });
    } catch (error) {
      console.error('Diary translation error:', error);
      throw new Error('Failed to translate diary text');
    }
  }

  // 日記専用文法チェック
  async checkDiaryGrammar(text: string): Promise<string> {
    try {
      const systemPrompt = this.aiPartnerIntegration.generateDiaryGrammarPrompt(text);
      const userMessage = `Please provide grammar feedback on this diary entry: "${text}"`;

      return await this.callOpenAI(systemPrompt, userMessage, {
        model: 'gpt-4o-mini',
        maxTokens: 1500,
        temperature: 0.4,
      });
    } catch (error) {
      console.error('Diary grammar check error:', error);
      throw new Error('Failed to check diary grammar');
    }
  }

  // 英語文章の包括的処理（翻訳、向上、文法フィードバックを一度に）
  async processEnglishDiaryComprehensive(text: string): Promise<{
    translation: string;
    enhancedEnglish: string;
    grammarFeedback: string;
  }> {
    try {
      const systemPrompt = this.aiPartnerIntegration.generateComprehensiveEnglishProcessingPrompt(text);
      const userMessage = `Please process this English diary entry comprehensively: "${text}"`;

      const responseText = await this.callOpenAI(systemPrompt, userMessage, {
        model: 'gpt-4o-mini',
        maxTokens: 2000,
        temperature: 0.4,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'comprehensive_english_processing',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                translation: {
                  type: 'string',
                  description: 'Japanese translation of the English diary entry'
                },
                enhancedEnglish: {
                  type: 'string',
                  description: 'Enhanced and more sophisticated version of the original English text'
                },
                grammarFeedback: {
                  type: 'string',
                  description: 'Grammar feedback and suggestions for improvement'
                }
              },
              required: ['translation', 'enhancedEnglish', 'grammarFeedback'],
              additionalProperties: false
            }
          }
        }
      });

      const parsed = JSON.parse(responseText);
      return {
        translation: parsed.translation,
        enhancedEnglish: parsed.enhancedEnglish,
        grammarFeedback: parsed.grammarFeedback
      };
    } catch (error) {
      console.error('Comprehensive English processing error:', error);
      throw new Error('Failed to process English diary comprehensively');
    }
  }

  // 統一された日記処理（単一AI呼び出しで全処理）
  async processUnifiedDiary(text: string): Promise<{
    detectedLanguage: 'japanese' | 'english' | 'other';
    translation: string;
    grammarFeedback?: string;
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
  }> {
    try {
      const systemPrompt = this.aiPartnerIntegration.generateUnifiedDiaryProcessingPrompt(text);
      const userMessage = `Please analyze and process this diary entry: "${text}"`;

      const responseText = await this.callOpenAI(systemPrompt, userMessage, {
        model: 'gpt-4o-mini',
        maxTokens: 3000,
        temperature: 0.4,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'unified_diary_processing',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                detectedLanguage: {
                  type: 'string',
                  enum: ['japanese', 'english', 'other'],
                  description: 'Detected language of the diary entry'
                },
                translation: {
                  type: 'string',
                  description: 'Translation of the diary entry with grammar points and vocabulary'
                },
                grammarFeedback: {
                  type: 'string',
                  description: 'Grammar feedback for English entries (optional)'
                },
                enhancedEnglish: {
                  type: 'string',
                  description: 'Enhanced version of English entries (optional)'
                },
                hasTryTranslation: {
                  type: 'boolean',
                  description: 'Whether the entry contains [try] translation attempts'
                },
                tryTranslationFeedback: {
                  type: 'object',
                  properties: {
                    feedback: {
                      type: 'string',
                      description: 'Feedback on user translation attempt'
                    },
                    threeVersions: {
                      type: 'object',
                      properties: {
                        casual: {
                          type: 'string',
                          description: 'Casual translation version'
                        },
                        formal: {
                          type: 'string',
                          description: 'Formal translation version'
                        },
                        advanced: {
                          type: 'string',
                          description: 'Advanced translation version'
                        }
                      },
                      required: ['casual', 'formal', 'advanced'],
                      additionalProperties: false
                    }
                  },
                  required: ['feedback', 'threeVersions'],
                  additionalProperties: false,
                  description: 'Translation feedback for [try] entries (optional)'
                }
              },
              required: ['detectedLanguage', 'translation', 'hasTryTranslation'],
              additionalProperties: false
            }
          }
        }
      });

      const parsed = JSON.parse(responseText);
      return {
        detectedLanguage: parsed.detectedLanguage,
        translation: parsed.translation,
        grammarFeedback: parsed.grammarFeedback,
        enhancedEnglish: parsed.enhancedEnglish,
        hasTryTranslation: parsed.hasTryTranslation,
        tryTranslationFeedback: parsed.tryTranslationFeedback
      };
    } catch (error) {
      console.error('Unified diary processing error:', error);
      throw new Error('Failed to process diary entry');
    }
  }

  // [try]付きの日本語日記の処理（英語翻訳のフィードバック付き）- DEPRECATED
  async processJapaneseDiaryWithTry(text: string): Promise<{
    translationFeedback: string;
    threeVersions: {
      casual: string;
      formal: string;
      advanced: string;
    };
  }> {
    try {
      const systemPrompt = this.aiPartnerIntegration.generateJapaneseTryTranslationPrompt(text);
      const userMessage = `Please analyze this Japanese diary entry with English translation attempt: "${text}"`;

      const responseText = await this.callOpenAI(systemPrompt, userMessage, {
        model: 'gpt-4o-mini',
        maxTokens: 2000,
        temperature: 0.4,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'japanese_try_translation_feedback',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                translationFeedback: {
                  type: 'string',
                  description: 'Feedback on the user\'s English translation attempt with corrections and suggestions'
                },
                threeVersions: {
                  type: 'object',
                  properties: {
                    casual: {
                      type: 'string',
                      description: 'Casual, conversational English translation'
                    },
                    formal: {
                      type: 'string', 
                      description: 'More formal, polished English translation'
                    },
                    advanced: {
                      type: 'string',
                      description: 'Advanced, sophisticated English translation with complex vocabulary'
                    }
                  },
                  required: ['casual', 'formal', 'advanced'],
                  additionalProperties: false
                }
              },
              required: ['translationFeedback', 'threeVersions'],
              additionalProperties: false
            }
          }
        }
      });

      const parsed = JSON.parse(responseText);
      return {
        translationFeedback: parsed.translationFeedback,
        threeVersions: {
          casual: parsed.threeVersions.casual,
          formal: parsed.threeVersions.formal,
          advanced: parsed.threeVersions.advanced
        }
      };
    } catch (error) {
      console.error('Japanese try translation processing error:', error);
      throw new Error('Failed to process Japanese diary with try translation');
    }
  }

  // 言語検出と翻訳（日記専用統合処理）
  async detectLanguageAndTranslate(text: string): Promise<{
    detectedLanguage: 'japanese' | 'english' | 'other';
    translation: string;
    hasTryTranslation?: boolean;
  }> {
    try {
      // 言語検出
      const languageDetectionResult = await this.callOpenAI(
        "Detect the language of the given text and return just 'japanese', 'english', or 'other'.",
        text,
        { model: 'gpt-4o-mini', maxTokens: 50, temperature: 0.1 }
      );

      // 型安全な言語判定
      const detectedLanguage: 'japanese' | 'english' | 'other' = languageDetectionResult
        .toLowerCase()
        .includes('japanese')
        ? 'japanese'
        : languageDetectionResult.toLowerCase().includes('english')
          ? 'english'
          : 'other';

      // [try]マーカーをチェック
      const hasTryTranslation = text.includes('[try]');

      // 言語に基づいて処理を分岐
      let translation = '';

      if (detectedLanguage === 'japanese') {
        // 日本語を英語に翻訳
        translation = await this.translateDiaryText(text, 'English');
      } else if (detectedLanguage === 'english') {
        // 英語を日本語に翻訳
        translation = await this.translateDiaryText(text, 'Japanese');
      } else {
        // その他の言語はデフォルトで英語に翻訳
        translation = await this.translateDiaryText(text, 'English');
      }

      return {
        detectedLanguage,
        translation,
        hasTryTranslation,
      };
    } catch (error) {
      console.error('Language detection and translation error:', error);
      throw new Error('Failed to detect language and translate');
    }
  }

  // 日記トピック生成
  async generateDiaryTopics(newsItems: NewsItem[]): Promise<{
    newsTopics: string[];
    personalPrompts: string[];
    encouragement: string;
  }> {
    try {
      // ランダムトピック設定を生成
      const topicConfig = this.generateRandomTopicConfig();

      // ニュースコンテキストを準備
      const newsContext =
        newsItems.length > 0
          ? newsItems
              .map(
                (item, index) =>
                  `${index + 1}. ${item.title}${item.description ? ': ' + item.description : ''}`
              )
              .join('\n')
          : 'No specific news available today';

      // 動的システムプロンプトを構築
      const systemPrompt = this.buildDynamicSystemPrompt(topicConfig);

      // ランダムシードを生成
      const randomSeed = this.generateRandomSeed();
      const userMessage = `Today's news context:\n${newsContext}\n\nRandom seed: ${randomSeed}\n\nPlease generate ${topicConfig.totalTopics} diary topics with variety and creativity.`;

      // Get structured JSON schema for diary topics
      const jsonSchema = this.getDiaryTopicsSchema(
        topicConfig.newsTopicsCount,
        topicConfig.personalPromptsCount
      );

      const responseText = await this.callOpenAI(systemPrompt, userMessage, {
        model: 'gpt-4o-mini',
        maxTokens: 1500,
        temperature: 0.7,
        response_format: {
          type: 'json_schema',
          json_schema: jsonSchema,
        },
      });

      try {
        // With structured outputs, OpenAI guarantees the JSON is valid and follows our schema
        const parsedResponse = JSON.parse(responseText);
        console.log('✅ Successfully received structured output from OpenAI');

        return {
          newsTopics: parsedResponse.newsTopics,
          personalPrompts: parsedResponse.personalPrompts,
          encouragement: parsedResponse.encouragement,
        };
      } catch (parseError) {
        console.error('❌ Unexpected: Structured output failed to parse');
        console.error('Response:', responseText.substring(0, 200) + '...');
        console.error('Parse error:', parseError);
        return this.getFallbackDiaryTopics(newsItems);
      }
    } catch (error) {
      console.error('Diary topic generation error:', error);
      return this.getFallbackDiaryTopics(newsItems);
    }
  }

  // ランダムトピック設定生成（元のメソッドから移動）
  private generateRandomTopicConfig(): {
    categories: string[];
    newsTopicsCount: number;
    personalPromptsCount: number;
    totalTopics: number;
    tone: string;
    style: string;
  } {
    const allCategories = [
      'current-events-reflection',
      'personal-growth',
      'creative-storytelling',
      'language-learning',
      'cultural-exploration',
      'daily-observations',
      'future-planning',
      'gratitude-mindfulness',
      'problem-solving',
      'memory-nostalgia',
      'hobby-interests',
      'relationship-social',
      'travel-adventure',
      'food-culture',
      'technology-digital',
      'nature-environment',
      'art-creativity',
      'career-education',
      'health-wellness',
      'philosophical-thinking',
    ];

    const tones = [
      'warm and encouraging',
      'playful and creative',
      'thoughtful and reflective',
      'energetic and motivating',
      'gentle and supportive',
      'curious and exploratory',
      'inspiring and uplifting',
      'friendly and conversational',
    ];

    const styles = [
      'question-based prompts',
      'scenario-based topics',
      'comparison and analysis',
      'storytelling prompts',
      'reflection exercises',
      'creative challenges',
      'opinion exploration',
      'memory-based writing',
    ];

    // Randomly select 4-6 categories
    const categoryCount = Math.floor(Math.random() * 3) + 4; // 4-6
    const selectedCategories = [...allCategories]
      .sort(() => 0.5 - Math.random())
      .slice(0, categoryCount);

    // Randomly determine topic distribution
    const newsTopicsCount = Math.floor(Math.random() * 3) + 2; // 2-4
    const personalPromptsCount = Math.floor(Math.random() * 3) + 2; // 2-4

    return {
      categories: selectedCategories,
      newsTopicsCount,
      personalPromptsCount,
      totalTopics: newsTopicsCount + personalPromptsCount,
      tone: tones[Math.floor(Math.random() * tones.length)],
      style: styles[Math.floor(Math.random() * styles.length)],
    };
  }

  // 動的システムプロンプト構築（元のメソッドから移動）
  private buildDynamicSystemPrompt(config: any): string {
    const categoriesText = config.categories.slice(0, 5).join(', '); // Limit for prompt length

    return `You are a creative and supportive English learning partner and diary writing assistant. Your goal is to help users practice English through diverse, engaging diary writing topics.

RANDOMIZATION FOCUS: Create varied, unique topics each time. Avoid repetitive patterns or similar suggestions.

Based on today's news and the following theme categories: ${categoriesText}

Create exactly:
1. ${config.newsTopicsCount} news-inspired diary topics that creatively connect current events to personal experiences
2. ${config.personalPromptsCount} personal reflection prompts focusing on different aspects of life and growth
3. 1 encouraging message with a ${config.tone} approach using ${config.style}

VARIETY GUIDELINES:
- Generate completely different topics from typical diary suggestions
- Mix different question types (what-if, compare, describe, imagine, analyze)
- Include unexpected angles and creative perspectives
- Vary sentence structures and prompt styles
- Be creative with topic themes and approaches
- Ensure each topic feels fresh and unique
- Include both simple and more complex prompts
- Mix abstract and concrete topics
- Encourage both English and Japanese writing practice
- Make topics personal and thought-provoking
- Connect news to everyday life experiences`;
  }

  // ランダムシード生成（元のメソッドから移動）
  private generateRandomSeed(): string {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const hourStr = String(today.getHours()).padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 10000);
    const timeBasedRandom = Date.now() % 1000;

    return `${dateStr}-${hourStr}-${randomNum}-${timeBasedRandom}`;
  }

  // フォールバック日記トピック（元のメソッドから移動）
  private getFallbackDiaryTopics(newsItems: NewsItem[]): {
    newsTopics: string[];
    personalPrompts: string[];
    encouragement: string;
  } {
    // Create randomized fallback topics to maintain variety even when AI fails
    const fallbackNewsTopics = [
      "What's happening in your community that interests you?",
      'Describe a recent change in the world that affects you personally',
      "Write about a current trend or topic you've been thinking about",
      'If you could ask a world leader one question, what would it be and why?',
      'How do you think technology will change daily life in the next 5 years?',
      'What global issue do you wish more people talked about?',
      'Describe a news story that made you change your perspective on something',
    ];

    const fallbackPersonalPrompts = [
      "How are you feeling today, and what's influencing your mood?",
      "What's one thing you want to accomplish this week, and why is it important to you?",
      'Describe a moment today when you felt proud of yourself, no matter how small',
      "What's a skill you've always wanted to learn, and what's stopping you?",
      'Write about someone who inspired you recently and why',
      'What would your ideal day look like from start to finish?',
      'Describe a challenge you overcame and what you learned from it',
      "What's something you used to believe that you no longer think is true?",
      'If you could have dinner with any three people, who would they be and why?',
    ];

    const fallbackEncouragements = [
      "Hey there! 😊 I'm your English learning companion, and I believe in you! Writing is such a powerful way to practice language and reflect on life. Don't worry about making it perfect - just let your thoughts flow. I'm here to help you along the way! 🌟",
      "Hello, my friend! 🌸 Every time you write, you're getting stronger at English. Remember, even professional writers make mistakes - what matters is expressing your thoughts and feelings. Let's explore your ideas together!",
      "Hi! 💫 Your English journey is unique and wonderful. Writing is like a conversation with yourself, so be kind and patient. I'm excited to see what thoughts you'll share today!",
      "Greetings! 🎯 You're doing amazing work by practicing English through writing. Don't worry about perfect grammar - focus on sharing your authentic thoughts and experiences. I'm here to support you!",
    ];

    // Randomly select items to maintain variety
    const selectedNewsTopics = [...fallbackNewsTopics].sort(() => 0.5 - Math.random()).slice(0, 3);

    const selectedPersonalPrompts = [...fallbackPersonalPrompts]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const selectedEncouragement =
      fallbackEncouragements[Math.floor(Math.random() * fallbackEncouragements.length)];

    // If news items are available, add one news-specific topic
    if (newsItems.length > 0) {
      const newsSpecific = `What do you think about: "${newsItems[0]?.title}"? How does it relate to your life?`;
      selectedNewsTopics[0] = newsSpecific;
    }

    return {
      newsTopics: selectedNewsTopics,
      personalPrompts: selectedPersonalPrompts,
      encouragement: selectedEncouragement,
    };
  }
}
