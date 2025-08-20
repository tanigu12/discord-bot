import { BaseAIService } from '../../services/baseAIService';
import { OPENAI_MODELS } from '../../constants/ai';
import { ThreadData } from '../../services/conversationReaderService';

export interface BlogFormatResult {
  markdown: string;
  title: string;
  sections: number;
  wordCount: number;
}

// Service dedicated to formatting Discord threads into professional blog articles
export class BlogFormatterService extends BaseAIService {
  // Format Discord thread to engaging blog post
  async formatToBlog(threadData: ThreadData): Promise<BlogFormatResult> {
    try {
      // Prepare thread content for AI processing
      const messagesContent = threadData.messages
        .map(
          msg => `**${msg.author}** (${msg.timestamp.toISOString().split('T')[0]}):\n${msg.content}`
        )
        .join('\n\n---\n\n');

      const systemPrompt = `You are an expert content creator and blog editor specializing in transforming Discord discussions into engaging, high-quality bilingual blog articles.

## TRANSFORMATION FRAMEWORK
Use the **Problem, Agitate, Solution (PAS)** framework to structure the content:

**Problem:** Identify the challenge, question, or situation discussed in the thread
**Agitate:** Explore why this matters, the implications, or the feelings around the topic  
**Solution:** Present the main insights, solutions, or resolutions discussed

## BLOG ARTICLE STRUCTURE

Create a polished blog post with alternating English and Japanese sections:

1. **English Title** - Engaging and clickable (no quotes)
2. **Japanese Title** - "Japanese Title: ~~~" format
3. **Alternating Content Sections:**
   - Each topic gets an English section followed immediately by its Japanese counterpart
   - Use engaging headers that tell a story
   - Mix paragraphs and bullet points for readability
   - Include specific examples, technical details, and insights from the discussion
   - Transform conversational elements into compelling narrative

## CONTENT TRANSFORMATION GUIDELINES

**From Raw Discussion to Engaging Blog:**
- Transform conversational exchanges into compelling narrative
- Extract the core problem/question being discussed
- Highlight key insights, solutions, and "aha moments"
- Include technical details but make them accessible
- Create flow between ideas rather than just listing points
- Add context and implications beyond the original discussion
- Remove administrative noise and focus on substantial content

**Writing Style:**
- **Tone:** Professional yet engaging, informative but accessible
- **Language:** Clear, scannable with short paragraphs
- **Structure:** Use headers to guide readers through the journey
- **Engagement:** Write to inspire, inform, and provide value
- **Bilingual:** Alternating English-Japanese sections, not separate complete versions

**EXACT Format Structure:**

English Title（English）

Japanese Title: ~~~

Hook opening paragraph that presents the problem/situation...

## Topic 1（English）

Content exploring the first main topic...
    - Specific insights from discussion
    - Technical details made accessible
    - Real examples and applications

## トピック 1（Japanese）

同じ内容の日本語版...
    - ディスカッションからの具体的な洞察
    - アクセシブルな技術的詳細
    - 実際の例と応用

## Topic 2（English）

Second main topic content...

## トピック 2（Japanese）  

二番目のメイントピックの内容...

## Conclusion（English）

Strong closing thought...

## 結論（Japanese）

強いまとめの思考...

[Referenced URLs]

Transform the Discord discussion into a compelling, professionally written blog article that provides real value to readers interested in the topic.`;

      const userMessage = `Please format this Discord thread discussion into a structured blog post:

**Thread Info:**
- Title: ${threadData.threadName}
- Participants: ${threadData.participants.join(', ')}
- Messages: ${threadData.totalMessages}
- Date: ${threadData.createdAt}
- IGNORE administrative messages like "💡 Idea Management - Emoji Guide" as these are unrelated to blog content
**Thread Content:**
${messagesContent}`;

      const formattedMarkdown = await this.callOpenAI(systemPrompt, userMessage, {
        model: OPENAI_MODELS.MAIN,
        maxCompletionTokens: 4000,
      });

      // Extract metadata from the formatted content
      const metadata = this.extractMetadata(formattedMarkdown, threadData.threadName);

      return {
        markdown: formattedMarkdown,
        ...metadata,
      };
    } catch (error) {
      console.error('Blog formatting error:', error);
      // Fallback formatting
      return this.createFallbackFormat(threadData);
    }
  }

  // Extract metadata from formatted content
  private extractMetadata(
    content: string,
    fallbackTitle: string
  ): Omit<BlogFormatResult, 'markdown'> {
    const titleMatch = content.match(/title:\s*"?([^"\n]+)"?/i);
    const title = titleMatch ? titleMatch[1] : fallbackTitle;

    const sectionMatches = content.match(/^#{1,3}\s/gm);
    const sections = sectionMatches ? sectionMatches.length : 0;

    const wordCount = content.split(/\s+/).length;

    return {
      title,
      sections,
      wordCount,
    };
  }

  // Create fallback format when AI processing fails
  private createFallbackFormat(threadData: ThreadData): BlogFormatResult {
    const title = threadData.threadName || 'Discussion Summary';

    // Create a simple, clean bilingual format
    const markdown = `${title}
Discussion summary from Discord thread with ${threadData.participants.length} participants.
${threadData.participants.length}名の参加者によるDiscordスレッドからのディスカッション要約

## Main Points / 主要ポイント
${threadData.messages
  .filter(msg => msg.content.trim().length > 0)
  .map(
    msg =>
      `    ${msg.content.replace(/\n/g, ' ').substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`
  )
  .join('\n')}

## Participants / 参加者
${threadData.participants.map(p => `    ${p}`).join('\n')}`;

    return {
      markdown,
      title,
      sections: 2,
      wordCount: markdown.split(/\s+/).length,
    };
  }
}
