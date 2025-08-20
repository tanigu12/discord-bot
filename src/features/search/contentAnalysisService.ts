import { BaseAIService } from '../../services/baseAIService';
import { OPENAI_MODELS } from '../../constants/ai';
import { ChannelContext } from '../../services/contextCollectorService';

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
        model: OPENAI_MODELS.MAIN,
        maxCompletionTokens: 3000,
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
        model: OPENAI_MODELS.MAIN,
        maxCompletionTokens: 3500,
      });
    } catch (error) {
      console.error('Context-aware content analysis error:', error);
      // Fallback to regular analysis if context analysis fails
      console.log('🔄 Falling back to regular content analysis...');
      return await this.analyzeContent(content, isUrl);
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

}