import {
  Message,
  PartialMessage,
  User,
  PartialUser,
  MessageReaction,
  PartialMessageReaction,
  ThreadChannel,
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
    '📋': 'categorize',
    '✨': 'mark_implemented',
    '🗂️': 'archive',
    '👍': 'approve',
    '🔥': 'high_priority',
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
        case 'categorize':
          await this.categorizeIdea(message, user);
          break;
        case 'mark_implemented':
          await this.markImplemented(message, user);
          break;
        case 'archive':
          await this.archiveIdea(message, user);
          break;
        case 'approve':
          await this.approveIdea(message, user);
          break;
        case 'high_priority':
          await this.setPriority(message, user, 'high');
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
        footer: { text: 'React with 📋 to categorize, ✨ to mark implemented, 🗂️ to archive' },
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

  private async categorizeIdea(
    message: Message | PartialMessage,
    user: User | PartialUser
  ): Promise<void> {
    const categories = [
      'Feature',
      'Bug Fix',
      'Enhancement',
      'Documentation',
      'Research',
      'Discussion',
    ];
    const categoryList = categories.map((cat, index) => `${index + 1}. ${cat}`).join('\n');

    await message.reply(
      `📋 **Categorize this idea** (${user.tag}):\n${categoryList}\n\nReact with a number emoji (1️⃣-6️⃣) to categorize.`
    );
  }

  private async markImplemented(
    message: Message | PartialMessage,
    user: User | PartialUser
  ): Promise<void> {
    const embed = {
      color: 0x00ff00,
      title: '✨ Idea Implemented!',
      description: `This idea has been marked as implemented by ${user.tag}`,
      timestamp: new Date().toISOString(),
    };

    await message.reply({ embeds: [embed] });

    // If this is in a thread, update thread name
    if (message.channel?.isThread()) {
      const thread = message.channel as ThreadChannel;
      const currentName = thread.name;
      if (!currentName.startsWith('✅')) {
        try {
          await thread.setName(`✅ ${currentName.replace('💡 ', '')}`);
          console.log(`✅ Updated thread name to show implemented status`);
        } catch (error) {
          console.error('Failed to update thread name:', error);
        }
      }
    }
  }

  private async archiveIdea(
    message: Message | PartialMessage,
    user: User | PartialUser
  ): Promise<void> {
    const embed = {
      color: 0x808080,
      title: '🗂️ Idea Archived',
      description: `This idea has been archived by ${user.tag}`,
      timestamp: new Date().toISOString(),
    };

    await message.reply({ embeds: [embed] });

    // If this is in a thread, archive it
    if (message.channel?.isThread()) {
      const thread = message.channel as ThreadChannel;
      try {
        await thread.setArchived(true, `Archived by ${user.tag}`);
        console.log(`🗂️ Archived idea thread`);
      } catch (error) {
        console.error('Failed to archive thread:', error);
      }
    }
  }

  private async approveIdea(
    message: Message | PartialMessage,
    user: User | PartialUser
  ): Promise<void> {
    const embed = {
      color: 0x0099ff,
      title: '👍 Idea Approved!',
      description: `This idea has been approved by ${user.tag}`,
      timestamp: new Date().toISOString(),
    };

    await message.reply({ embeds: [embed] });

    // Update thread name if in thread
    if (message.channel?.isThread()) {
      const thread = message.channel as ThreadChannel;
      const currentName = thread.name;
      if (!currentName.startsWith('👍')) {
        try {
          await thread.setName(`👍 ${currentName.replace('💡 ', '')}`);
          console.log(`👍 Updated thread name to show approved status`);
        } catch (error) {
          console.error('Failed to update thread name:', error);
        }
      }
    }
  }

  private async setPriority(
    message: Message | PartialMessage,
    user: User | PartialUser,
    priority: 'high' | 'medium' | 'low'
  ): Promise<void> {
    const priorityEmoji = { high: '🔥', medium: '📅', low: '📋' };
    const embed = {
      color: priority === 'high' ? 0xff0000 : priority === 'medium' ? 0xffaa00 : 0x808080,
      title: `${priorityEmoji[priority]} Priority Set: ${priority.toUpperCase()}`,
      description: `Priority set by ${user.tag}`,
      timestamp: new Date().toISOString(),
    };

    await message.reply({ embeds: [embed] });
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

**Thread Management:**
💡 - Create idea thread for discussion
👍 - Approve idea for implementation
🔥 - Mark as high priority
🧙‍♂️ - Consult Larry for expert advice

**Organization:**
📋 - Categorize idea
✨ - Mark as implemented
🗂️ - Archive completed/outdated idea

**How to use:** React to messages in idea channels with these emojis to manage ideas in organized threads!`;
  }
}
