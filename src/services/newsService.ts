export interface NewsItem {
  title: string;
  description?: string;
  url?: string;
  publishedAt?: string;
}

export class NewsService {
  
  async getTodaysTopics(): Promise<NewsItem[]> {
    try {
      console.log('📰 Fetching today\'s news topics...');
      
      // Use a simple web search approach since many news APIs require keys
      // We'll search for trending topics and current events
      const topics = await this.searchCurrentTopics();
      
      console.log(`✅ Found ${topics.length} news topics`);
      return topics;
    } catch (error) {
      console.error('❌ Error fetching news topics:', error);
      // Return fallback topics if news fetch fails
      return this.getFallbackTopics();
    }
  }

  private async searchCurrentTopics(): Promise<NewsItem[]> {
    // For now, we'll use a combination of general trending topics
    // In production, you could integrate with News API, Reddit API, or RSS feeds
    const currentDate = new Date();
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Simulate news topics based on common categories
    const topicCategories = [
      'technology trends',
      'global events', 
      'science discoveries',
      'cultural happenings',
      'business news',
      'environmental updates',
      'space exploration',
      'health and wellness'
    ];

    // Generate diverse topic suggestions
    const topics: NewsItem[] = [];
    
    // Add some general interesting topics that work well for diary writing
    const interestingTopics = [
      {
        title: "New technological breakthrough changes daily life",
        description: "How recent tech innovations are reshaping the way we work and communicate"
      },
      {
        title: "Cultural festival celebrates international diversity", 
        description: "Communities worldwide embrace multicultural celebrations and traditions"
      },
      {
        title: "Environmental initiative shows promising results",
        description: "Local and global efforts to combat climate change gain momentum"
      },
      {
        title: "Scientific discovery opens new possibilities",
        description: "Researchers make breakthrough that could impact future generations"
      },
      {
        title: "Community initiative brings people together",
        description: "Local projects foster connection and mutual support among neighbors"
      }
    ];

    // Randomize and select 3-5 topics
    const shuffled = interestingTopics.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }

  private getFallbackTopics(): NewsItem[] {
    return [
      {
        title: "Daily life in the digital age",
        description: "How technology shapes our daily routines and relationships"
      },
      {
        title: "Personal growth and learning",
        description: "New skills and experiences that expand our horizons"
      },
      {
        title: "Community connections",
        description: "The importance of human connections in modern society"
      }
    ];
  }

  // Method to integrate with actual news APIs in the future
  private async fetchFromNewsAPI(): Promise<NewsItem[]> {
    // Placeholder for future news API integration
    // Could integrate with:
    // - News API (newsapi.org)
    // - Reddit API for trending topics
    // - RSS feeds from major news sources
    // - Google News RSS
    
    throw new Error('News API integration not implemented yet');
  }

  // Helper method to clean and format news titles for diary prompts
  formatForDiary(newsItem: NewsItem): string {
    const title = newsItem.title;
    const description = newsItem.description;
    
    if (description) {
      return `${title}: ${description}`;
    }
    return title;
  }
}