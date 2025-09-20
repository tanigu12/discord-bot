import { TranslationAIService } from '../translation/translationAIService';
import { NewsService } from '../../services/newsService';
import { TechnicalQuestionService, TechnicalQuestion } from '../technical-questions';
import { EnglishPhraseService, EnglishPhrase } from '../english-phrases';

export interface RandomContentResult {
  newsTopics?: any[];
  diaryPrompts?: {
    newsTopics: string[];
    personalPrompts: string[];
    encouragement: string;
  };
  technicalQuestions: TechnicalQuestion[];
  englishPhrases: EnglishPhrase[];
  debateQuestions: EnglishPhrase[];
}

interface ContentAggregationOptions {
  technicalQuestionCount?: number;
  englishPhraseCount?: number;
  debateQuestionCount?: number;
  includeNews?: boolean;
  includeDiary?: boolean;
}

export class ContentAggregationService {
  private translationAIService: TranslationAIService;
  private newsService: NewsService;
  private technicalQuestionService: TechnicalQuestionService;
  private englishPhraseService: EnglishPhraseService;

  constructor() {
    this.translationAIService = new TranslationAIService();
    this.newsService = new NewsService();
    this.technicalQuestionService = new TechnicalQuestionService();
    this.englishPhraseService = new EnglishPhraseService();
  }

  /**
   * Aggregate all content for the random command
   */
  async aggregateRandomContent(
    options: ContentAggregationOptions = {}
  ): Promise<RandomContentResult> {
    const {
      technicalQuestionCount = 3,
      englishPhraseCount = 3,
      debateQuestionCount = 2,
      includeNews = true,
      includeDiary = true,
    } = options;

    console.log('📝 Aggregating random content...');

    // Get content that doesn't depend on external services first
    const [technicalQuestions, englishPhrases, debateQuestions] = await Promise.all([
      Promise.resolve(this.technicalQuestionService.getRandomQuestions(technicalQuestionCount)),
      Promise.resolve(this.englishPhraseService.getRandomPhrases(englishPhraseCount)),
      Promise.resolve(this.englishPhraseService.getRandomDebateQuestions(debateQuestionCount)),
    ]);

    const result: RandomContentResult = {
      technicalQuestions,
      englishPhrases,
      debateQuestions,
    };

    // Get news and diary content in parallel if requested
    if (includeNews || includeDiary) {
      try {
        const newsTopics = includeNews ? await this.newsService.getTodaysTopics() : [];
        result.newsTopics = newsTopics;

        if (includeDiary) {
          result.diaryPrompts = await this.translationAIService.generateDiaryTopics(newsTopics);
        }
      } catch (error) {
        console.error('❌ Error fetching news/diary content:', error);
        // Continue without news/diary content
      }
    }


    return result;
  }

  /**
   * Get fallback content when services fail
   */
  getFallbackContent(
    technicalQuestionCount: number = 3,
    englishPhraseCount: number = 3,
    debateQuestionCount: number = 2
  ): Pick<RandomContentResult, 'technicalQuestions' | 'englishPhrases' | 'debateQuestions'> {
    return {
      technicalQuestions: this.technicalQuestionService.getRandomQuestions(technicalQuestionCount),
      englishPhrases: this.englishPhraseService.getRandomPhrases(englishPhraseCount),
      debateQuestions: this.englishPhraseService.getRandomDebateQuestions(debateQuestionCount),
    };
  }

}
