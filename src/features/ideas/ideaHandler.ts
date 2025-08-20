import {
  Message,
  PartialMessage,
  User,
  PartialUser,
  MessageReaction,
  PartialMessageReaction,
} from 'discord.js';
import { BaseAIService } from '../../services/baseAIService';
import { OPENAI_MODELS } from '../../constants/ai';

export interface IdeaMetadata {
  status: 'new' | 'discussing' | 'approved' | 'implemented' | 'archived';
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: Date;
}

export class IdeaHandler extends BaseAIService {
  private readonly IDEA_CHANNEL_PATTERNS = ['idea', 'ideas'];

  private readonly IDEA_EMOJIS = {
    '💡': 'create_thread',
    '🧙‍♂️': 'consult_larry',
  };

  isIdeaChannel(message: Message | PartialMessage): boolean {
    if (!message.channel || !('name' in message.channel)) {
      return false;
    }

    const channelName = message.channel.name?.toLowerCase() || '';
    return this.IDEA_CHANNEL_PATTERNS.some(pattern => channelName.includes(pattern));
  }

  async handleIdeaMessage(message: Message): Promise<void> {
    console.log('💡 Processing idea channel message...');

    if (message.author.bot) {
      return;
    }

    // Auto-react with idea emoji to encourage thread creation
    try {
      await message.react('💡');
      console.log('💡 Auto-reacted with idea emoji');
    } catch (error) {
      console.error('❌ Failed to auto-react:', error);
    }
  }

  async handleIdeaReaction(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
    emoji: string
  ): Promise<void> {
    const message = reaction.message;
    const action = this.IDEA_EMOJIS[emoji as keyof typeof this.IDEA_EMOJIS];

    if (!action) {
      return;
    }

    console.log(`💡 Executing idea action: ${action}`);

    try {
      switch (action) {
        case 'create_thread':
          await this.createIdeaThread(message, user);
          break;
        case 'consult_larry':
          await this.consultLarry(message, user);
          break;
      }
    } catch (error) {
      console.error(`💥 Error executing idea action ${action}:`, error);
    }
  }

  private async createIdeaThread(
    message: Message | PartialMessage,
    user: User | PartialUser
  ): Promise<void> {
    if (!message.content || message.content.trim().length === 0) {
      return;
    }

    // Extract title from message (first 50 chars or until line break)
    const title = message.content.split('\n')[0].substring(0, 50).trim();
    const threadName = `💡 ${title}`;

    try {
      const thread = await message.startThread({
        name: threadName,
        autoArchiveDuration: 1440, // 24 hours
        reason: `Idea thread created by ${user.tag}`,
      });

      // Create idea metadata embed
      const ideaMetadata: IdeaMetadata = {
        status: 'new',
        createdBy: user.tag || 'Unknown',
        createdAt: new Date(),
      };

      const embed = {
        color: 0x00ff00,
        title: '💡 New Idea',
        description: message.content,
        fields: [
          { name: 'Status', value: ideaMetadata.status, inline: true },
          { name: 'Created by', value: ideaMetadata.createdBy, inline: true },
          { name: 'Created at', value: ideaMetadata.createdAt.toLocaleString(), inline: true },
        ],
        footer: { text: 'React with 🧙‍♂️ to consult Larry for expert advice' },
      };

      await thread.send({ embeds: [embed] });

      // Send emoji guide
      const emojiGuide = this.getIdeaEmojiGuide();
      await thread.send(emojiGuide);

      // Send deep dive questions to explore the idea further
      const deepDiveQuestions = this.generateDeepDiveQuestions(message.content);
      await thread.send(deepDiveQuestions);

      console.log(`✅ Created idea thread: ${threadName}`);
    } catch (error) {
      console.error('❌ Failed to create idea thread:', error);
      await message.reply(
        "Sorry, I couldn't create a thread for this idea. Please check my permissions."
      );
    }
  }


  private async consultLarry(
    message: Message | PartialMessage,
    user: User | PartialUser
  ): Promise<void> {
    try {
      if (!message.content || message.content.trim().length === 0) {
        await message.reply("I need some content to consult Larry about! 🤔");
        return;
      }

      console.log(`🧙‍♂️ Consulting Larry about idea: "${message.content.substring(0, 50)}..."`);

      // Get Larry's personality and knowledge
      const aiIntegration = this.getAIPartnerIntegration();
      const systemPrompt = aiIntegration.generateChatPrompt('idea_consultation');
      
      // Add specific context for idea consultation
      const ideaConsultationContext = `
You are being asked to provide your expert advice on an idea or concept posted in a Discord idea channel.
The user wants your thoughtful analysis and suggestions for improving or implementing this idea.

**CRITICAL LANGUAGE REQUIREMENT: ALWAYS RESPOND IN ENGLISH ONLY**
- This is for English learning purposes
- Never respond in Japanese, even if the idea is written in Japanese
- Always use English to help improve the user's English skills
- If idea is in Japanese, analyze and respond in English

You have access to web search capabilities to provide the most current and relevant information.
Use web search when analyzing ideas that involve:
- Current market trends, competitor analysis, or industry standards
- Latest technical solutions, frameworks, or implementation approaches
- Recent research, case studies, or best practices
- Current regulations, compliance requirements, or legal considerations
- Real-time data about similar products, services, or implementations
Consider aspects like feasibility, potential improvements, risks, and implementation strategies.
Keep your response conversational and appropriately sized for Discord (aim for 2-4 paragraphs).
Be encouraging while also being realistic about challenges.
When you use web search results, naturally integrate the findings into your analysis without explicitly mentioning the search.
Remember: RESPOND ONLY IN ENGLISH for learning purposes.
`;

      const fullSystemPrompt = systemPrompt + ideaConsultationContext;

      // Get Larry's response with web search if needed
      const response = await this.callOpenAI(
        fullSystemPrompt,
        `Please analyze this idea and provide your expert consultation: "${message.content}"`,
        {
          model: OPENAI_MODELS.MAIN,
          maxCompletionTokens: 1500
        }
      );

      // Reply to the message with Larry's consultation
      const embed = {
        color: 0x9932cc,
        title: '🧙‍♂️ Larry\'s Consultation',
        description: response,
        footer: { text: `Consultation requested by ${user.tag || 'Unknown'}` },
        timestamp: new Date().toISOString(),
      };

      await message.reply({ embeds: [embed] });
      
      console.log('✅ Larry consultation response sent for idea');
    } catch (error) {
      console.error('💥 Error consulting Larry about idea:', error);
      
      try {
        await message.reply(
          "Sorry, Larry seems to be busy right now. Could you try consulting him again in a moment? 🧙‍♂️"
        );
      } catch (replyError) {
        console.error('💥 Error sending Larry consultation error message:', replyError);
      }
    }
  }

  private generateDeepDiveQuestions(_ideaContent: string): string {
    const questions = [
      "🤔 **Let's explore this idea deeper:**",
      "",
      "📊 **Impact & Value:**",
      "• Who would benefit from this idea?",
      "• What problem does this solve?",
      "• How would you measure success?",
      "",
      "🔧 **Implementation:**", 
      "• What would be needed to make this happen?",
      "• Are there any potential challenges or roadblocks?",
      "• What resources would be required?",
      "",
      "💭 **Next Steps:**",
      "• What's the first action item to move this forward?",
      "• Are there similar solutions already out there?",
      "• How could we test or prototype this quickly?",
      "",
      "Feel free to discuss any of these questions to develop the idea further! 🚀"
    ];

    return questions.join('\n');
  }

  getIdeaEmojiGuide(): string {
    return `**💡 Idea Management - Emoji Guide**

💡 - Create idea thread for discussion
🧙‍♂️ - Consult Larry for expert advice

**How to use:** React to messages in idea channels with these emojis to manage ideas in organized threads!`;
  }
}
