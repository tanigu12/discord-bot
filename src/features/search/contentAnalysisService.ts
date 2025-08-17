import { BaseAIService } from '../../services/baseAIService';
import { ChannelContext } from '../../services/contextCollectorService';
import { ThreadData } from '../../services/conversationReaderService';

// Content analysis and search functionality using Larry's knowledge
export class ContentAnalysisService extends BaseAIService {
  
  // General content analysis
  async analyzeContent(content: string, isUrl: boolean = false): Promise<string> {
    try {
      const systemPrompt = isUrl
        ? `You are an expert content analyzer and educator. Your task is to analyze web content and provide a comprehensive, educational explanation.

When analyzing content from URLs:
1. Provide a clear summary of what the content is about
2. Extract and explain key concepts, ideas, or information
3. Identify the main topics and themes
4. Explain any technical terms or complex concepts in simple language
5. Provide context and background information when relevant
6. Highlight practical applications or implications
7. Structure your response with clear headings and bullet points
8. Make it educational and accessible for language learners
9. Include relevant examples or analogies to aid understanding

Format your response clearly with:
- **Overview**: Brief summary
- **Key Points**: Main ideas and concepts
- **Detailed Explanation**: In-depth analysis
- **Practical Applications**: How this applies in real life
- **Learning Notes**: Important terms and concepts to remember

Write in English and make it comprehensive yet accessible.`
        : `You are an expert content analyzer and educator. Your task is to analyze the given text or topic and provide a comprehensive, educational explanation.

When analyzing text content or topics:
1. Identify what the content/topic is about
2. Provide comprehensive explanation of key concepts
3. Break down complex ideas into understandable parts
4. Give historical context or background when relevant
5. Explain practical applications and real-world examples
6. Define important terms and concepts
7. Structure information logically with clear headings
8. Make it educational for English language learners
9. Include related topics or connections

Format your response clearly with:
- **Overview**: What this is about
- **Key Concepts**: Main ideas and definitions
- **Detailed Analysis**: In-depth explanation
- **Examples**: Real-world applications or examples
- **Related Topics**: Connected concepts worth exploring

Write in English and make it comprehensive, educational, and engaging.`;

      const userMessage = isUrl
        ? `Please analyze this web content and provide a comprehensive explanation:\n\n${content}`
        : `Please analyze and explain this topic/content in detail:\n\n${content}`;

      return await this.callOpenAI(systemPrompt, userMessage, {
        model: 'gpt-4o-mini',
        maxTokens: 3000,
        temperature: 0.4,
      });
    } catch (error) {
      console.error('Content analysis error:', error);
      throw new Error('Failed to analyze content with AI');
    }
  }

  // Context-aware content analysis
  async analyzeContentWithContext(
    content: string,
    context: ChannelContext,
    isUrl: boolean = false
  ): Promise<string> {
    try {
      const systemPrompt = `You are an expert content analyzer and educator with access to conversation context. Your task is to analyze the given content while considering the ongoing discussion context.

When analyzing with context:
1. Consider how the query relates to the recent conversation
2. Reference relevant points from the discussion when appropriate
3. Build upon ideas and topics already mentioned
4. Address questions or topics that emerged from the conversation
5. Provide analysis that fits naturally with the discussion flow
6. Connect the search query to the ongoing dialogue
7. Make it feel like a natural extension of the conversation

Format your response clearly with:
- **Context-Aware Analysis**: How this relates to your discussion
- **Direct Answer**: Response to the specific query
- **Key Points**: Main concepts and ideas
- **Connection to Discussion**: How this builds on your conversation
- **Further Exploration**: Related topics worth discussing

Write in English and make it feel like a knowledgeable participant joining the conversation with valuable insights.`;

      // Prepare context summary (keep it concise for token efficiency)
      const contextSummary = this.summarizeContextForAI(context);

      const userMessage = isUrl
        ? `Based on our recent discussion, please analyze this web content:

**Recent Context:**
${contextSummary}

**Content to Analyze:**
${content}

Please provide analysis that considers our ongoing conversation and how this content relates to what we've been discussing.`
        : `Based on our recent discussion, please analyze this topic:

**Recent Context:**
${contextSummary}

**Query/Topic:**
${content}

Please provide analysis that considers our ongoing conversation and how this topic connects to what we've been discussing.`;

      return await this.callOpenAI(systemPrompt, userMessage, {
        model: 'gpt-4o-mini',
        maxTokens: 3500,
        temperature: 0.4,
      });
    } catch (error) {
      console.error('Context-aware content analysis error:', error);
      // Fallback to regular analysis if context analysis fails
      console.log('🔄 Falling back to regular content analysis...');
      return await this.analyzeContent(content, isUrl);
    }
  }

  // Format Discord thread to Obsidian blog format
  async formatToObsidianBlog(threadData: ThreadData): Promise<{
    markdown: string;
    title: string;
    sections: number;
    wordCount: number;
  }> {
    try {
      // Prepare thread content for AI processing
      const messagesContent = threadData.messages
        .map(
          msg => `**${msg.author}** (${msg.timestamp.toISOString().split('T')[0]}):\n${msg.content}`
        )
        .join('\n\n---\n\n');

      const systemPrompt = `You are an expert content organizer specializing in creating bilingual technical blog posts from Discord thread discussions.

Create a structured blog post with BOTH English and Japanese following this EXACT format:

1. Clean title (no quotes, technical but readable)
2. Brief definition/introduction (1-2 sentences in English, followed by Japanese translation)
3. Referenced links in brackets [URL] if any mentioned
4. Main content organized with clear hierarchy:
   - Use simple headers for main topics (English first, then Japanese)
   - Use indented bullet points (spaces) for sub-points
   - Each English section followed by Japanese translation
   - Keep explanations concise and technical
   - Focus on facts, features, and key differences
5. No frontmatter, no conclusion section, no "Key Takeaways"
6. BILINGUAL FORMAT: English content followed by Japanese translation for each section

Style Guidelines:
- Present content in both English and Japanese
- Technical but accessible language in both languages  
- Bullet points over paragraphs
- Minimal fluff, maximum information density
- Include version numbers, protocol names, technical details
- Remove personal opinions and conversational elements
- Focus on the technical substance
- Provide accurate translations of technical terms

Example format:
Title
Brief explanation of what it is.
簡潔な説明（日本語）

[relevant URLs if mentioned]

## Main Topic 1 / メイントピック1
    sub-point with technical details
    技術的詳細のサブポイント
    another technical point
    別の技術的ポイント

## Main Topic 2 / メイントピック2  
    feature explanation
    機能の説明
    implementation details
    実装の詳細
        deeper sub-point if needed
        必要に応じてより詳細なサブポイント

Transform the Discord discussion into this clean, bilingual reference-style format.`;

      const userMessage = `Please format this Discord thread discussion into a structured blog post:

**Thread Info:**
- Title: ${threadData.threadName}
- Participants: ${threadData.participants.join(', ')}
- Messages: ${threadData.totalMessages}
- Date: ${threadData.createdAt}

**Thread Content:**
${messagesContent}`;

      const formattedMarkdown = await this.callOpenAI(systemPrompt, userMessage, {
        model: 'gpt-4o-mini',
        maxTokens: 4000,
        temperature: 0.3,
      });

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
        wordCount,
      };
    } catch (error) {
      console.error('Thread formatting error:', error);
      // Fallback formatting
      return this.createFallbackFormat(threadData);
    }
  }

  // Private helper methods
  private summarizeContextForAI(context: ChannelContext): string {
    // Keep context concise to preserve tokens for the main analysis
    const recentMessages = context.messages.slice(-8); // Last 8 messages
    let summary = `Discussion in ${context.channelName}`;

    if (context.channelType === 'thread' && context.parentChannelName) {
      summary += ` (thread in ${context.parentChannelName})`;
    }

    summary += ` with ${context.participants.length} participants:\n\n`;

    // Include key messages, focusing on substantive content
    for (const msg of recentMessages) {
      if (msg.content.trim() && msg.content.length > 10) {
        // Only meaningful messages
        const shortContent = msg.content.substring(0, 150);
        summary += `${msg.author}: ${shortContent}${msg.content.length > 150 ? '...' : ''}\n`;
      }
    }

    return summary;
  }

  private createFallbackFormat(threadData: ThreadData): {
    markdown: string;
    title: string;
    sections: number;
    wordCount: number;
  } {
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