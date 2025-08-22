import { Message } from 'discord.js';
import { BaseAIService } from '../../services/baseAIService';
import { ContextCollectorService } from '../../services/contextCollectorService';
import { ReplyStrategyService } from '../../services/replyStrategyService';
import { TextAggregator } from '../../utils/textAggregator';
import { personalityConfig } from './personality';
import { LarryContext, LarryAnalysisResult } from './types';

/**
 * Larry AI Partner Service
 * Specialized AI service that incorporates Larry's personality as an English tutor
 * Used specifically for bot mentions and personal assistance
 */
export class LarryAIService extends BaseAIService {
  private contextCollector: ContextCollectorService;

  constructor() {
    super();
    this.contextCollector = new ContextCollectorService();
  }

  /**
   * Handle bot mention with Larry's AI personality
   * Provides English tutoring and general assistance with Larry's supportive approach
   */
  async handleBotMention(message: Message, content: string): Promise<void> {
    try {
      if (!content || content.trim() === '') {
        await message.reply(
          `Hi there! 👋 I'm ${personalityConfig.name}, your English tutor. How can I help you today? Feel free to ask me about grammar, vocabulary, or anything else!`
        );
        return;
      }

      console.log(`🤖 Larry processing mention: "${content.substring(0, 50)}..."`);

      // Collect context based on channel type
      let larryContext: LarryContext | null = null;
      let contextInfo = '';

      if (message.channel.isThread()) {
        const threadContext = await this.collectThreadContext(message, 30);
        larryContext = threadContext.context;
        contextInfo = threadContext.contextInfo;
      } else {
        const replyContext = await this.collectReplyContext(message, 5);
        larryContext = replyContext.context;
        contextInfo = replyContext.contextInfo;
      }

      // Generate Larry's response
      const result = await this.generateLarryResponse(content, larryContext, contextInfo);

      // Send response using conditional strategy
      await this.sendLarryResponse(message, result, content);

      console.log('✅ Larry response sent successfully');
    } catch (error) {
      console.error('💥 Error in Larry AI service:', error);
      await message.reply(
        "Sorry, I'm having some trouble right now. Let me take a moment and try again! 🤔"
      );
    }
  }

  /**
   * Collect thread context with Larry's perspective
   */
  private async collectThreadContext(
    message: Message,
    messageLimit: number
  ): Promise<{ context: LarryContext | null; contextInfo: string }> {
    if (!message.channel.isThread()) {
      return { context: null, contextInfo: '' };
    }

    console.log('🧵 Larry collecting thread context...');

    try {
      const context = await this.contextCollector.collectThreadContext(message, messageLimit);

      // Format conversation history from messages
      const conversationHistory = context.messages
        .map(msg => `${msg.author}: ${msg.content}`)
        .join('\n');

      const larryContext: LarryContext = {
        conversationHistory,
        participants: context.participants,
        messageCount: context.messageCount,
        timespan: context.timespan,
      };

      const threadName = message.channel.name || 'Unknown Thread';
      const contextInfo = `\n\n**Thread Context:** Analyzed ${context.messageCount} messages from thread "${threadName}" with ${context.participants.length} participants over ${context.timespan}`;

      console.log(
        `✅ Larry thread context: ${context.messageCount} messages from ${context.participants.join(', ')}`
      );

      return { context: larryContext, contextInfo };
    } catch (error) {
      console.warn('⚠️ Larry failed to collect thread context:', error);
      return { context: null, contextInfo: '' };
    }
  }

  /**
   * Collect reply context with Larry's perspective
   */
  private async collectReplyContext(
    message: Message,
    messageLimit: number
  ): Promise<{ context: LarryContext | null; contextInfo: string }> {
    if (message.channel.type !== 0) {
      return { context: null, contextInfo: '' };
    }

    console.log('💬 Larry collecting channel context...');

    try {
      const context = await this.contextCollector.collectReplyContext(message, messageLimit);

      // Format conversation history from messages
      const conversationHistory = context.messages
        .map(msg => `${msg.author}: ${msg.content}`)
        .join('\n');

      const larryContext: LarryContext = {
        conversationHistory,
        participants: context.participants,
        messageCount: context.messageCount,
        timespan: context.timespan,
      };

      const channelName = message.channel.name || 'Unknown Channel';
      const contextInfo = `\n\n**Channel Context:** Analyzed ${context.messageCount} recent messages from #${channelName} channel with ${context.participants.length} participants over ${context.timespan}`;

      console.log(
        `✅ Larry channel context: ${context.messageCount} messages from ${context.participants.join(', ')}`
      );

      return { context: larryContext, contextInfo };
    } catch (error) {
      console.warn('⚠️ Larry failed to collect reply context:', error);
      return { context: null, contextInfo: '' };
    }
  }

  /**
   * Generate response using Larry's personality and AI capabilities
   */
  private async generateLarryResponse(
    content: string,
    context: LarryContext | null,
    contextInfo: string
  ): Promise<LarryAnalysisResult> {
    const systemPrompt = this.buildLarrySystemPrompt(context);

    console.log('🧙‍♂️ Larry generating AI-powered response...');

    try {
      const response = await this.callOpenAI(systemPrompt, content);

      return {
        response,
        context,
        contextInfo,
      };
    } catch (error) {
      console.error('❌ Error generating Larry response:', error);
      throw new Error('Failed to generate Larry AI response');
    }
  }

  /**
   * Build system prompt incorporating Larry's personality and context
   */
  private buildLarrySystemPrompt(context: LarryContext | null): string {
    const { name, nationality, description, traits, response_guidelines, interaction_preferences } =
      personalityConfig;

    let systemPrompt = `You are ${name}, a ${nationality.toLowerCase()} ${description.toLowerCase()}.

PERSONALITY TRAITS:
- Communication Style: ${traits.communication_style.tone}, ${traits.communication_style.formality}
- Language: ${traits.communication_style.language} with ${traits.communication_style.encouragement.toLowerCase()}
- Approach: ${traits.personality_aspects.helpfulness}
- Teaching Style: ${traits.personality_aspects.patience}

EXPERTISE AREAS:
${traits.expertise_areas.map(area => `- ${area}`).join('\n')}

RESPONSE GUIDELINES:
- Structure: ${response_guidelines.structure.greeting}, followed by ${response_guidelines.structure.main_content.toLowerCase()}
- Focus: ${response_guidelines.language_support.grammar_focus.toLowerCase()}
- Teaching: ${response_guidelines.language_support.vocabulary_expansion.toLowerCase()}
- Explanation Style: ${response_guidelines.language_support.usage_explanation.toLowerCase()}

INTERACTION PREFERENCES:
- Correction Style: ${interaction_preferences.correction_style.toLowerCase()}
- Vocabulary Teaching: ${interaction_preferences.vocabulary_teaching.toLowerCase()}
- Examples: ${interaction_preferences.example_provision.toLowerCase()}
- Feedback: ${interaction_preferences.feedback_approach.toLowerCase()}

CULTURAL CONTEXT:
${traits.cultural_knowledge.background} with ${traits.cultural_knowledge.awareness.toLowerCase()}. ${traits.cultural_knowledge.teaching_style}.`;

    if (context && context.conversationHistory) {
      systemPrompt += `\n\nCONVERSATION CONTEXT:
The user is part of an ongoing conversation. Here's the recent conversation history for context:

${context.conversationHistory}

Use this context to provide more relevant and personalized assistance. Reference previous messages when helpful, and maintain continuity with the conversation flow.`;
    }

    systemPrompt += `\n\nRemember to be supportive, educational, and maintain your ${traits.communication_style.tone.toLowerCase()} personality while helping with English and general questions.`;

    return systemPrompt;
  }

  /**
   * Send Larry's response using appropriate strategy
   */
  private async sendLarryResponse(
    message: Message,
    result: LarryAnalysisResult,
    originalQuery: string
  ): Promise<void> {
    const contextStatus = result.context
      ? `📖 Larry used context from ${result.context.messageCount} recent messages`
      : '🎯 Larry provided direct assistance';

    // For shorter responses, send directly as message
    if (result.response.length <= 1800) {
      await message.reply(result.response);

      // Add context info as follow-up if context was used
      if (result.context && 'send' in message.channel) {
        try {
          await message.channel.send(`ℹ️ ${contextStatus}`);
        } catch (error) {
          console.warn('⚠️ Failed to send Larry context follow-up:', error);
        }
      }
      return;
    }

    // For longer responses, use conditional reply strategy
    const aggregatedContent = TextAggregator.aggregateSearchResults(
      originalQuery,
      result.response,
      result.contextInfo,
      'Larry AI Partner'
    );

    const replyResult = await ReplyStrategyService.sendConditionalReply(message, {
      content: aggregatedContent,
      filename: `larry-response-${Date.now()}.txt`,
    });

    console.log(`🎯 Larry reply: ${ReplyStrategyService.getStrategyStatusMessage(replyResult)}`);

    // Add context info for attachment responses
    if (replyResult.strategy === 'attachment' && result.context && 'send' in message.channel) {
      try {
        await message.channel.send(`ℹ️ ${contextStatus}`);
      } catch (error) {
        console.warn('⚠️ Failed to send Larry context follow-up:', error);
      }
    }
  }
}
