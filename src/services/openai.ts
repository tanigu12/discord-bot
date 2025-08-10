import OpenAI from "openai";
import { NewsItem } from "./newsService";
import { ThreadData } from "./threadReaderService";

export class OpenAIService {
  private openai: OpenAI | null = null;

  private getOpenAI(): OpenAI {
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

  async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      const openai = this.getOpenAI();
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the given text to ${targetLanguage}. Only return the translated text, no explanations or additional content.`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || "Translation failed";
    } catch (error) {
      console.error("Translation error:", error);
      throw new Error("Failed to translate text");
    }
  }

  async checkGrammar(text: string): Promise<string> {
    try {
      const openai = this.getOpenAI();
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a kind and patient English teacher for beginners. Check the grammar of the given text and provide gentle, encouraging feedback. Focus on:\n- Highlighting what was done well first\n- Gently pointing out areas for improvement\n- Explaining grammar rules in simple terms\n- Providing corrected versions with explanations\n- Being encouraging and supportive\n- Using emojis to make it friendly\nFormat your response in a warm, teacher-like manner that builds confidence.",
          },
          {
            role: "user",
            content: text,
          },
        ],
        max_tokens: 1500,
        temperature: 0.4,
      });

      return response.choices[0]?.message?.content || "Grammar check failed";
    } catch (error) {
      console.error("Grammar check error:", error);
      throw new Error("Failed to check grammar");
    }
  }

  async explainWord(word: string): Promise<string> {
    try {
      const openai = this.getOpenAI();
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an English vocabulary tutor. Provide a comprehensive explanation of the given word including: definition, pronunciation, part of speech, example sentences, and common usage. Keep it educational and helpful.",
          },
          {
            role: "user",
            content: word,
          },
        ],
        max_tokens: 800,
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || "Word explanation failed";
    } catch (error) {
      console.error("Word explanation error:", error);
      throw new Error("Failed to explain word");
    }
  }

  async explainText(text: string): Promise<string> {
    try {
      const openai = this.getOpenAI();
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful text analysis assistant. Analyze the given text and provide insights including: main ideas, context, cultural references, idioms, writing style, and educational explanations. Make it helpful for language learning."
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: 1200,
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || "Text analysis failed";
    } catch (error) {
      console.error("Text explanation error:", error);
      throw new Error("Failed to analyze text");
    }
  }

  async detectLanguageAndTranslate(text: string): Promise<{
    detectedLanguage: 'japanese' | 'english' | 'other';
    translation: string;
    grammarCheck?: string;
  }> {
    try {
      const openai = this.getOpenAI();
      
      // First, detect the language
      const languageResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a language detector. Analyze the given text and determine if it's primarily Japanese, English, or another language. Respond with only one word: 'japanese', 'english', or 'other'."
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: 10,
        temperature: 0.1,
      });

      const detectedLanguage = languageResponse.choices[0]?.message?.content?.toLowerCase().trim() as 'japanese' | 'english' | 'other';
      
      // Translate based on detected language
      let translation = '';
      let grammarCheck = undefined;
      
      if (detectedLanguage === 'japanese') {
        // Japanese to English
        translation = await this.translateText(text, 'English');
      } else if (detectedLanguage === 'english') {
        // English to Japanese
        translation = await this.translateText(text, 'Japanese');
        // Also perform grammar check for English text
        grammarCheck = await this.checkGrammar(text);
      } else {
        // Other languages - translate to English by default
        translation = await this.translateText(text, 'English');
      }

      return {
        detectedLanguage,
        translation,
        grammarCheck
      };
    } catch (error) {
      console.error("Language detection and translation error:", error);
      throw new Error("Failed to detect language and translate");
    }
  }

  async generateDiaryTopics(newsItems: NewsItem[]): Promise<{
    newsTopics: string[];
    personalPrompts: string[];
    encouragement: string;
  }> {
    try {
      const openai = this.getOpenAI();
      
      // Prepare news context
      const newsContext = newsItems.length > 0 
        ? newsItems.map((item, index) => `${index + 1}. ${item.title}${item.description ? ': ' + item.description : ''}`).join('\n')
        : "No specific news available today";

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a supportive English learning partner and diary writing assistant. Your goal is to help users practice English through diary writing by providing engaging, relatable topics.

Based on today's news and general life experiences, create:
1. 3 news-inspired diary topics that connect current events to personal reflection
2. 3 personal reflection prompts that encourage introspection and English practice  
3. 1 warm, encouraging message as if you're their supportive language learning partner

Format your response as JSON with these exact keys:
{
  "newsTopics": ["topic1", "topic2", "topic3"],
  "personalPrompts": ["prompt1", "prompt2", "prompt3"], 
  "encouragement": "supportive message"
}

Guidelines:
- Make topics relatable and not overwhelming
- Encourage both English and Japanese writing
- Be warm, friendly, and supportive
- Focus on personal growth and reflection
- Include questions that spark genuine interest
- Keep topics accessible for language learners`
          },
          {
            role: "user",
            content: `Today's news context:\n${newsContext}\n\nPlease generate diary topics and encouragement for today.`
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      const responseText = response.choices[0]?.message?.content || "";
      
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

  private getFallbackDiaryTopics(newsItems: NewsItem[]): {
    newsTopics: string[];
    personalPrompts: string[];
    encouragement: string;
  } {
    const newsTopics = newsItems.length > 0 
      ? [
          `What do you think about: "${newsItems[0]?.title}"? How does it relate to your life?`,
          "Choose any current event and write about how it makes you feel",
          "What's one news story that caught your attention recently and why?"
        ]
      : [
          "What's happening in your community that interests you?",
          "Describe a recent change in the world that affects you personally", 
          "Write about a current trend or topic you've been thinking about"
        ];

    return {
      newsTopics,
      personalPrompts: [
        "How are you feeling today, and what's influencing your mood?",
        "What's one thing you want to accomplish this week, and why is it important to you?",
        "Describe a moment today when you felt proud of yourself, no matter how small"
      ],
      encouragement: "Hey there! 😊 I'm your English learning companion, and I believe in you! Writing is such a powerful way to practice language and reflect on life. Don't worry about making it perfect - just let your thoughts flow. I'm here to help you along the way! 🌟"
    };
  }

  async formatToObsidianBlog(threadData: ThreadData): Promise<{
    markdown: string;
    title: string;
    sections: number;
    wordCount: number;
  }> {
    try {
      const openai = this.getOpenAI();

      // Prepare thread content for AI processing
      const messagesContent = threadData.messages
        .map(msg => `**${msg.author}** (${msg.timestamp.toISOString().split('T')[0]}):\n${msg.content}`)
        .join('\n\n---\n\n');

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert content organizer specializing in creating concise, technical blog posts from Discord thread discussions.

Create a simple, structured blog post following this EXACT format:

1. Clean title (no quotes, technical but readable)
2. Brief definition/introduction (1-2 sentences)
3. Referenced links in brackets [URL] if any mentioned
4. Main content organized with clear hierarchy:
   - Use simple headers for main topics
   - Use indented bullet points (spaces) for sub-points
   - Keep explanations concise and technical
   - Focus on facts, features, and key differences
5. No frontmatter, no conclusion section, no "Key Takeaways"

Style Guidelines:
- Technical but accessible language
- Bullet points over paragraphs
- Minimal fluff, maximum information density
- Japanese terms acceptable when relevant
- Include version numbers, protocol names, technical details
- Remove personal opinions and conversational elements
- Focus on the technical substance

Example format:
Title
Brief explanation of what it is.

[relevant URLs if mentioned]

Main Topic 1
    sub-point with technical details
    another technical point

Main Topic 2
    feature explanation
    implementation details
        deeper sub-point if needed

Transform the Discord discussion into this clean, reference-style format.`
          },
          {
            role: "user",
            content: `Please format this Discord thread discussion into a structured blog post:

**Thread Info:**
- Title: ${threadData.threadName}
- Participants: ${threadData.participants.join(', ')}
- Messages: ${threadData.totalMessages}
- Date: ${threadData.createdAt}

**Thread Content:**
${messagesContent}`
          }
        ],
        max_tokens: 4000,
        temperature: 0.3,
      });

      const formattedMarkdown = response.choices[0]?.message?.content || "";
      
      // Extract metadata from the formatted content
      const titleMatch = formattedMarkdown.match(/title:\s*"?([^"\n]+)"?/i);
      const title = titleMatch ? titleMatch[1] : threadData.threadName;
      
      const sectionMatches = formattedMarkdown.match(/^#{1,3}\s/gm);
      const sections = sectionMatches ? sectionMatches.length : 0;
      
      const wordCount = formattedMarkdown.split(/\s+/).length;

      return {
        markdown: formattedMarkdown,
        title,
        sections,
        wordCount
      };

    } catch (error) {
      console.error("Thread formatting error:", error);
      // Fallback formatting
      return this.createFallbackFormat(threadData);
    }
  }

  private createFallbackFormat(threadData: ThreadData): {
    markdown: string;
    title: string;
    sections: number;
    wordCount: number;
  } {
    const title = threadData.threadName || 'Discussion Summary';
    
    // Create a simple, clean format matching the new style
    const markdown = `${title}
Discussion summary from Discord thread with ${threadData.participants.length} participants.

Main Points
${threadData.messages
  .filter(msg => msg.content.trim().length > 0)
  .map(msg => `    ${msg.content.replace(/\n/g, ' ').substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`)
  .join('\n')}

Participants
${threadData.participants.map(p => `    ${p}`).join('\n')}`;

    return {
      markdown,
      title,
      sections: 2,
      wordCount: markdown.split(/\s+/).length
    };
  }
}
