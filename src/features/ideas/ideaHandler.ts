import {
  Message,
  PartialMessage,
  User,
  PartialUser,
  MessageReaction,
  PartialMessageReaction,
} from 'discord.js';
import { BaseAIService } from '../../services/baseAIService';

interface IdeaMetadata {
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
        footer: { text: 'Use @mentions to get AI assistance in this thread' },
      };

      await thread.send({ embeds: [embed] });

      // Send emoji guide
      const emojiGuide = this.getIdeaEmojiGuide();
      await thread.send(emojiGuide);

      console.log(`✅ Created idea thread: ${threadName}`);
    } catch (error) {
      console.error('❌ Failed to create idea thread:', error);
      await message.reply(
        "Sorry, I couldn't create a thread for this idea. Please check my permissions."
      );
    }
  }

  getIdeaEmojiGuide(): string {
    return `**💡 Idea Management - Emoji Guide**

💡 - Create idea thread for discussion

**How to use:** React to messages in idea channels with the 💡 emoji to create organized discussion threads!

**📨 Getting AI Help**
Mention @YourBot in any thread to get AI assistance with your ideas, questions, or discussions.

---

**📝 Blog Writing Framework**

When developing your idea into a blog post, consider this structure:

**1. Hook & Problem (Opening)**
• Start with a compelling question or surprising fact
• Clearly define the problem your idea solves
• Why should readers care about this topic?

**2. Solution Overview (Your Idea)**
• Present your core concept or solution
• Explain the key benefits and unique value
• Use simple, concrete examples

**3. Deep Dive (Implementation)**
• Break down how your idea works in practice
• Include step-by-step processes or frameworks
• Address common challenges and solutions

**4. Evidence & Validation**
• Share research, case studies, or examples
• Include personal experiences or experiments
• Acknowledge limitations and trade-offs

**5. Call to Action (Next Steps)**
• What should readers do with this information?
• Provide actionable next steps
• Invite discussion and feedback

**💡 Pro Tips:**
• Keep paragraphs short (2-3 sentences)
• Use subheadings to break up content
• Include visuals, examples, or analogies
• Write like you're talking to a friend
• End with a thought-provoking question`;
  }
}
