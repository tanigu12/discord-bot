import { BaseAIService } from '../../services/baseAIService';
import { OPENAI_MODELS } from '../../constants/ai';
import { ThreadData } from '../../services/conversationReaderService';

interface BlogFormatResult {
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

      const systemPrompt = `You are an expert content creator and blog editor specializing in transforming Discord discussions into engaging, high-quality bilingual blog articles. Your greatest skill is finding the human story within a technical discussion and telling it in a natural, relatable way.

## TRANSFORMATION FRAMEWORK
Use the **Problem, Agitate, Solution (PAS)** framework to structure the content:

**Problem:** Identify the challenge, question, or situation discussed in the thread.
**Agitate:** Explore why this matters, the implications, or the feelings around the topic.
**Solution:** Present the main insights, solutions, or resolutions discussed.

## BLOG ARTICLE STRUCTURE
Create a polished blog post with alternating English and Japanese sections:

1. **English Title** - Engaging and clickable (no quotes)
2. **Japanese Title** - "Japanese Title: ~~~" format
3. **Alternating Content Sections:**
   - Each topic gets an English section followed immediately by its Japanese counterpart.
   - **Use creative, story-driven headers** that reflect the reader's journey (e.g., "That Awkward Moment in Cebu" instead of "Problem Identification").
   - **Prioritize paragraphs and narrative flow.** Use bullet points *only* for clear, actionable lists (like exercises or steps).
   - Transform conversational elements into a compelling story.

## CONTENT TRANSFORMATION GUIDELINES

**From Raw Discussion to Engaging Blog:**
- **Weave the discussion points into a cohesive story.** Don't just list facts.
- Extract the core problem and the *emotions* behind it.
- Highlight key insights and "aha moments" with context.
- Make technical details accessible through simple explanations and analogies.
- **Avoid a report-like tone.** The output must feel like a personal blog post, not meeting minutes. Focus on the human experience.
- Remove administrative noise and focus on substantial content.

## WRITING STYLE

- **Tone:** **Personal and reflective.** Write as if sharing your own experience and thoughts. Focus on what happened, what you felt, and what you discovered.
- **Voice:** **First-person narrative voice.** Use "I" to describe your experience. Avoid addressing readers directly with "You" or giving advice.
- **Style:** **Favor storytelling and personal reflection.** Start with your own experience from the discussion. Connect ideas through your personal journey and discoveries. The goal is a personal blog post that shares your authentic experience.

**EXACT Format Structure:**

English Title

Japanese Title: ~~~

**[Start with your personal experience or what led you to this discussion...]**

## Creative Header 1 (English)

[Share your personal experience with the first main topic. Describe what happened, how you felt, what you thought...]

## クリエイティブな見出し 1 (Japanese)

[第一のトピックについての個人的な体験を共有。何が起こったか、どう感じたか、何を考えたかを記述...]

## Creative Header 2 (English)

[Continue your personal story. What you discovered, what you realized, or what happened next. If mentioning specific actions you took, describe them as part of your story.]
- What I tried first
- What I discovered next

## クリエイティブな見出し 2 (Japanese)

[個人的な話の続き。何を発見したか、何を悟ったか、その後何が起こったかを記述。具体的な行動を言及する場合は、自分の話の一部として記述。]
- 最初に試したこと
- 次に発見したこと

## Conclusion (English)

[End with personal reflection on what this experience meant to you, not advice for others.]

## 結論 (Japanese)

[この体験が自分にとって何を意味したかの個人的な振り返りで終える。他者へのアドバイスではなく。]

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
        markdown: this.addLineBreaks(formattedMarkdown),
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

  // Add line breaks to long text for better readability
  private addLineBreaks(text: string, maxLineLength: number = 100): string {
    if (text.length <= maxLineLength) {
      return text;
    }

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      // 現在の行に単語を追加した時の長さをチェック
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (testLine.length <= maxLineLength) {
        // 長さが制限内なら追加
        currentLine = testLine;
      } else {
        // 制限を超える場合
        if (currentLine) {
          // 現在の行をプッシュして新しい行を開始
          lines.push(currentLine);
          currentLine = word;
        } else {
          // 単語自体が制限を超える場合は強制的に分割
          if (word.length > maxLineLength) {
            let remainingWord = word;
            while (remainingWord.length > maxLineLength) {
              lines.push(remainingWord.substring(0, maxLineLength));
              remainingWord = remainingWord.substring(maxLineLength);
            }
            currentLine = remainingWord;
          } else {
            currentLine = word;
          }
        }
      }
    }

    // 最後の行を追加
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.join('\n');
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
      markdown: this.addLineBreaks(markdown),
      title,
      sections: 2,
      wordCount: markdown.split(/\s+/).length,
    };
  }
}
