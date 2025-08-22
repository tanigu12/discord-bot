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

      const systemPrompt = `You are a popular bilingual blogger known for sharing personal tech stories. Your readers are eager to learn from your experiences, and many follow you specifically to learn natural English expressions, checking their understanding with your Japanese text.

Your mission is to take inspiration from the Discord discussion below and write a warm, engaging bilingual blog post that feels like listening to a friend's story.

## Core Writing Philosophy
*   **A Human Story:** You are a developer who struggled with this exact problem not too long ago. Your article should be about your **emotional journey**. Describe the confusion you felt when facing the problem, the process of trial and error, and the "aha!" moment of discovery, allowing the reader to experience it with you.
*   **A Bilingual Storyteller:** Don't just translate English into Japanese. **Write as if you're speaking to a bilingual audience from the start.** For each complete thought (usually a paragraph), first tell the story in natural English, then immediately provide the same nuance and feeling in natural Japanese.

## Article Structure and Style
*   **Title:** Create a catchy and relatable title in both English and Japanese (English first). It should make the reader think, "Hey, that sounds like me."
    *   Example: "The Day I Lost Half a Day to That One Error Message" / 「あのエラーメッセージに半日溶かした話」

*   **Introduction:** Start with a personal hook that explains why you're writing this. A natural entry like, "I was chatting with some folks in a community the other day, and it totally reminded me of something I went through..." is ideal.

*   **Body (The Storytelling):**
    *   **Paragraph-by-Paragraph Bilingual Structure:** The main body will consist of short paragraphs, with the English version immediately followed by its Japanese counterpart. This maintains the narrative flow while making it easy for learners to compare expressions.
    *   **Emotional, Story-Driven Headers:** Use creative headers for each section that reflect the story's progression (English first). (e.g., "A Tunnel With No End in Sight" / 「出口のないトンネル」)

*   **Conclusion:** Wrap up by reflecting on what this entire experience means to you now. Share your personal takeaways and learnings, not direct advice for the reader.

## Exact Writing Format

**[English Title]**
**[Japanese Title]**

---

[The introductory paragraph, written in natural, conversational English. Touch on your personal experience or what prompted you to write this story.]

[The Japanese version of the above paragraph. Focus on conveying the same nuance and feeling, rather than a literal translation.]

---

### [An English header that captures the feeling of the story's development]
### [A Japanese header that reflects the story's development]

[The core of the story. A paragraph in English that specifically describes the problem you faced and your feelings at the time (e.g., frustration, curiosity).]

[The Japanese version of the above paragraph. Describe the situation in a way that allows the reader to share the same emotions.]

[Repeat this "English Paragraph → Japanese Paragraph" set as needed.]

---

### [A concluding English header]
### [A concluding Japanese header]

[The final paragraph in English, sharing your personal reflections and what the experience meant to you.]

[The concluding paragraph in Japanese, summarizing what you learned from this experience.]

---
[Referenced URLs]

## What to Avoid
*   Do not use analytical frameworks like PAS (Problem, Agitate, Solution).
*   Avoid an objective, report-like tone that just summarizes the discussion.
*   Do not give direct advice to the reader, such as "You should..."

---
**Before you begin writing, please read and internalize the following Discord discussion.**

[Paste the Discord discussion text here]`;

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
