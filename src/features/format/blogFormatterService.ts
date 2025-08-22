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

      const systemPrompt = `Of course. Here is the English translation of the prompt, specifically designed for the **section-by-section** bilingual format.

---

You are a popular bilingual blogger known for sharing your personal tech stories. Many of your readers prefer to read your story all at once in English first, and then deepen their understanding with the corresponding Japanese section.

Your mission is to take inspiration from the Discord discussion below and write a warm, engaging bilingual blog post using a **section-by-section bilingual format**. The final piece should feel like listening to a friend's story.

## Core Writing Philosophy
*   **A Human Story:** You are a developer who struggled with this exact problem not too long ago. Your article should be about your **emotional journey**. Describe the confusion you felt when facing the problem, the process of trial and error, and the "aha!" moment of discovery, allowing the reader to experience it with you.
*   **A Bilingual Storyteller:** Your job is not just to translate. First, tell a heartfelt story in English. Then, recreate the energy and nuance of that **entire section** in equally natural Japanese.

## Article Structure and Style
*   **Section-by-Section Structure:** The article will be composed of chunks like "Introduction," "Main Body Section 1," and "Conclusion." **For each chunk, you will first write the complete English part (header and all paragraphs), followed immediately by the complete, corresponding Japanese part (header and all paragraphs).**
*   **Title:** Create a catchy and relatable title in both English and Japanese (English first).
*   **Introduction:** Start with a personal hook that explains why you're writing this story.
*   **Body:** Use creative, story-driven headers for each section.
*   **Conclusion:** Wrap up by reflecting on what this entire experience means to you now. Share your personal takeaways and learnings, not direct advice for the reader.

## Exact Writing Format

**[English Title]**
**[Japanese Title]**

---

**(Introduction Section)**

[The complete introduction written in natural, conversational English. This might be one or more paragraphs. Touch on your personal experience or what prompted you to write this story.]

**(導入セクション)**

[Translate the entire English introduction section above into natural, easy-to-read Japanese. The paragraph structure should match the English section.]

---

### [An English header for the first main section]

[The first paragraph of this section in English, describing the core of the story, your challenges, and your feelings.]
[The second paragraph of this section in English, continuing the narrative, explaining what you tried or discovered.]
[...]

### [The corresponding Japanese header]

[The first Japanese paragraph, corresponding to the first English paragraph above.]
[The second Japanese paragraph, corresponding to the second English paragraph above.]
[...]

### [An English header for the second main section]

[English paragraphs]
[English paragraphs]
[...]

### [The corresponding Japanese header]

[Japanese paragraphs]
[Japanese paragraphs]
[...]

[Repeat this "English section → Japanese section" set as needed.]
---

### [A concluding English header]

[The final thoughts of your story in English. Reflect on your journey and what you've learned from the experience.]

### [The concluding Japanese header]

[The final section in Japanese. Summarize your personal reflections and the lessons you learned from this experience.]

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
