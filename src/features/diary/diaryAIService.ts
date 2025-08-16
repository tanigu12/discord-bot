import { BaseAIService } from "../../services/baseAIService";
import { TranslationService } from "../translation/translationService";
import { NewsItem } from "../../services/newsService";

// Larry による日記専用AIサービス
export class DiaryAIService extends BaseAIService {
  private translationService: TranslationService;

  constructor() {
    super();
    this.translationService = new TranslationService();
  }

  // 日記専用翻訳
  async translateDiaryText(text: string, targetLanguage: string): Promise<string> {
    try {
      const systemPrompt = this.aiPartnerIntegration.generateDiaryTranslationPrompt(targetLanguage, text);
      const userMessage = `Please translate this diary entry: "${text}". Include brief grammar explanations and related vocabulary.`;
      
      return await this.callOpenAI(systemPrompt, userMessage, {
        model: "gpt-4o-mini",
        maxTokens: 1000,
        temperature: 0.3,
      });
    } catch (error) {
      console.error("Diary translation error:", error);
      throw new Error("Failed to translate diary text");
    }
  }

  // 日記専用文法チェック
  async checkDiaryGrammar(text: string): Promise<string> {
    try {
      const systemPrompt = this.aiPartnerIntegration.generateDiaryGrammarPrompt(text);
      const userMessage = `Please provide grammar feedback on this diary entry: "${text}"`;
      
      return await this.callOpenAI(systemPrompt, userMessage, {
        model: "gpt-4o-mini",
        maxTokens: 1500,
        temperature: 0.4,
      });
    } catch (error) {
      console.error("Diary grammar check error:", error);
      throw new Error("Failed to check diary grammar");
    }
  }

  // 言語検出と翻訳（日記専用統合処理）
  async detectLanguageAndTranslate(text: string): Promise<{
    detectedLanguage: 'japanese' | 'english' | 'other';
    translation: string;
  }> {
    try {
      // 言語検出
      const detectedLanguage = await this.translationService.detectLanguage(text);
      
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
        translation
      };
    } catch (error) {
      console.error("Language detection and translation error:", error);
      throw new Error("Failed to detect language and translate");
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
      const newsContext = newsItems.length > 0 
        ? newsItems.map((item, index) => `${index + 1}. ${item.title}${item.description ? ': ' + item.description : ''}`).join('\n')
        : "No specific news available today";

      // 動的システムプロンプトを構築
      const systemPrompt = this.buildDynamicSystemPrompt(topicConfig);
      
      // ランダムシードを生成
      const randomSeed = this.generateRandomSeed();
      const userMessage = `Today's news context:\n${newsContext}\n\nRandom seed: ${randomSeed}\n\nPlease generate ${topicConfig.totalTopics} diary topics with variety and creativity.`;

      const responseText = await this.callOpenAI(systemPrompt, userMessage, {
        model: "gpt-4o-mini",
        maxTokens: 1500,
        temperature: 0.9,
      });
      
      try {
        const parsedResponse = JSON.parse(responseText);
        return {
          newsTopics: parsedResponse.newsTopics || [],
          personalPrompts: parsedResponse.personalPrompts || [],
          encouragement: parsedResponse.encouragement || "Hello! I'm here to support your English learning journey through diary writing. Let's explore your thoughts together! 😊"
        };
      } catch (parseError) {
        console.error("Failed to parse AI response, using fallback");
        return this.getFallbackDiaryTopics(newsItems);
      }

    } catch (error) {
      console.error("Diary topic generation error:", error);
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
      'philosophical-thinking'
    ];

    const tones = [
      'warm and encouraging',
      'playful and creative',
      'thoughtful and reflective',
      'energetic and motivating',
      'gentle and supportive',
      'curious and exploratory',
      'inspiring and uplifting',
      'friendly and conversational'
    ];

    const styles = [
      'question-based prompts',
      'scenario-based topics',
      'comparison and analysis',
      'storytelling prompts',
      'reflection exercises',
      'creative challenges',
      'opinion exploration',
      'memory-based writing'
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
      style: styles[Math.floor(Math.random() * styles.length)]
    };
  }

  // 動的システムプロンプト構築（元のメソッドから移動）
  private buildDynamicSystemPrompt(config: any): string {
    const categoriesText = config.categories.slice(0, 5).join(', '); // Limit for prompt length
    
    return `You are a creative and supportive English learning partner and diary writing assistant. Your goal is to help users practice English through diverse, engaging diary writing topics.

RANDOMIZATION FOCUS: Create varied, unique topics each time. Avoid repetitive patterns or similar suggestions.

Based on today's news and the following theme categories: ${categoriesText}

Create:
1. ${config.newsTopicsCount} news-inspired diary topics that creatively connect current events to personal experiences
2. ${config.personalPromptsCount} personal reflection prompts focusing on different aspects of life and growth
3. 1 encouraging message with a ${config.tone} approach

Use ${config.style} approach for maximum variety and engagement.

Format your response as JSON with these exact keys:
{
  "newsTopics": ["topic1", "topic2", ...],
  "personalPrompts": ["prompt1", "prompt2", ...], 
  "encouragement": "supportive message"
}

VARIETY GUIDELINES:
- Generate completely different topics from typical diary suggestions
- Mix different question types (what-if, compare, describe, imagine, analyze)
- Include unexpected angles and creative perspectives
- Vary sentence structures and prompt styles
- Be creative with topic themes and approaches
- Ensure each topic feels fresh and unique
- Include both simple and more complex prompts
- Mix abstract and concrete topics
- Encourage both English and Japanese writing practice`;
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
      "Describe a recent change in the world that affects you personally", 
      "Write about a current trend or topic you've been thinking about",
      "If you could ask a world leader one question, what would it be and why?",
      "How do you think technology will change daily life in the next 5 years?",
      "What global issue do you wish more people talked about?",
      "Describe a news story that made you change your perspective on something"
    ];

    const fallbackPersonalPrompts = [
      "How are you feeling today, and what's influencing your mood?",
      "What's one thing you want to accomplish this week, and why is it important to you?",
      "Describe a moment today when you felt proud of yourself, no matter how small",
      "What's a skill you've always wanted to learn, and what's stopping you?",
      "Write about someone who inspired you recently and why",
      "What would your ideal day look like from start to finish?",
      "Describe a challenge you overcame and what you learned from it",
      "What's something you used to believe that you no longer think is true?",
      "If you could have dinner with any three people, who would they be and why?"
    ];

    const fallbackEncouragements = [
      "Hey there! 😊 I'm your English learning companion, and I believe in you! Writing is such a powerful way to practice language and reflect on life. Don't worry about making it perfect - just let your thoughts flow. I'm here to help you along the way! 🌟",
      "Hello, my friend! 🌸 Every time you write, you're getting stronger at English. Remember, even professional writers make mistakes - what matters is expressing your thoughts and feelings. Let's explore your ideas together!",
      "Hi! 💫 Your English journey is unique and wonderful. Writing is like a conversation with yourself, so be kind and patient. I'm excited to see what thoughts you'll share today!",
      "Greetings! 🎯 You're doing amazing work by practicing English through writing. Don't worry about perfect grammar - focus on sharing your authentic thoughts and experiences. I'm here to support you!"
    ];

    // Randomly select items to maintain variety
    const selectedNewsTopics = [...fallbackNewsTopics]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const selectedPersonalPrompts = [...fallbackPersonalPrompts]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const selectedEncouragement = fallbackEncouragements[
      Math.floor(Math.random() * fallbackEncouragements.length)
    ];

    // If news items are available, add one news-specific topic
    if (newsItems.length > 0) {
      const newsSpecific = `What do you think about: "${newsItems[0]?.title}"? How does it relate to your life?`;
      selectedNewsTopics[0] = newsSpecific;
    }

    return {
      newsTopics: selectedNewsTopics,
      personalPrompts: selectedPersonalPrompts,
      encouragement: selectedEncouragement
    };
  }
}