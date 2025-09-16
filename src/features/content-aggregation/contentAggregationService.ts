import { TranslationAIService } from '../translation/translationAIService';
import { NewsService } from '../../services/newsService';
import { AsanaService } from '../../services/asanaService';
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
  asanaTasks: any[];
}

interface ContentAggregationOptions {
  technicalQuestionCount?: number;
  englishPhraseCount?: number;
  debateQuestionCount?: number;
  maxAsanaTasks?: number;
  includeNews?: boolean;
  includeDiary?: boolean;
  includeAsana?: boolean;
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
      maxAsanaTasks = 10,
      includeNews = true,
      includeDiary = true,
      includeAsana = true,
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
      asanaTasks: [],
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

    // Get Asana tasks if requested and configured (same logic as asana list command)
    if (includeAsana) {
      try {
        if (process.env.ASANA_PERSONAL_ACCESS_TOKEN) {
          const asanaService = AsanaService.createFromEnvironment();
          // Use same logic as asana list command
          const allTasks = await asanaService.getTasks(); // Get all tasks (same as asana list)
          const incompleteTasks = allTasks.filter(task => !task.completed); // Filter incomplete (same as asana list)
          result.asanaTasks = incompleteTasks.slice(0, maxAsanaTasks); // Limit results
          console.log(`✅ Retrieved ${result.asanaTasks.length} incomplete tasks from Asana`);
        }
      } catch (error) {
        console.log('ℹ️ Asana tasks not available (service not configured or error occurred)');
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
