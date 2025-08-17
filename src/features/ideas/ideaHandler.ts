import {
  Message,
  PartialMessage,
  User,
  PartialUser,
  MessageReaction,
  PartialMessageReaction,
  ThreadChannel,
} from "discord.js";

export interface IdeaMetadata {
  status: "new" | "discussing" | "approved" | "implemented" | "archived";
  category?: string;
  priority?: "low" | "medium" | "high";
  createdBy: string;
  createdAt: Date;
}

export class IdeaHandler {
  private readonly IDEA_CHANNEL_PATTERNS = [
    "idea", "ideas", "brainstorm", "brainstorming", "suggestion", "suggestions"
  ];

  private readonly IDEA_EMOJIS = {
    "💡": "create_thread",
    "📋": "categorize", 
    "✨": "mark_implemented",
    "🗂️": "archive",
    "👍": "approve",
    "🔥": "high_priority"
  };

  isIdeaChannel(message: Message | PartialMessage): boolean {
    if (!message.channel || !('name' in message.channel)) {
      return false;
    }

    const channelName = message.channel.name?.toLowerCase() || "";
    return this.IDEA_CHANNEL_PATTERNS.some(pattern => 
      channelName.includes(pattern)
    );
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
        case "create_thread":
          await this.createIdeaThread(message, user);
          break;
        case "categorize":
          await this.categorizeIdea(message, user);
          break;
        case "mark_implemented":
          await this.markImplemented(message, user);
          break;
        case "archive":
          await this.archiveIdea(message, user);
          break;
        case "approve":
          await this.approveIdea(message, user);
          break;
        case "high_priority":
          await this.setPriority(message, user, "high");
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
        reason: `Idea thread created by ${user.tag}`
      });

      // Create idea metadata embed
      const ideaMetadata: IdeaMetadata = {
        status: "new",
        createdBy: user.tag || "Unknown",
        createdAt: new Date()
      };

      const embed = {
        color: 0x00ff00,
        title: "💡 New Idea",
        description: message.content,
        fields: [
          { name: "Status", value: ideaMetadata.status, inline: true },
          { name: "Created by", value: ideaMetadata.createdBy, inline: true },
          { name: "Created at", value: ideaMetadata.createdAt.toLocaleString(), inline: true }
        ],
        footer: { text: "React with 📋 to categorize, ✨ to mark implemented, 🗂️ to archive" }
      };

      await thread.send({ embeds: [embed] });
      
      // React with management emojis
      const managementEmojis = ['📋', '👍', '🔥', '✨', '🗂️'];
      for (const emoji of managementEmojis) {
        try {
          await thread.send(`React with ${emoji}:`).then(msg => msg.react(emoji));
        } catch (error) {
          console.error(`Failed to add reaction ${emoji}:`, error);
        }
      }

      console.log(`✅ Created idea thread: ${threadName}`);
    } catch (error) {
      console.error('❌ Failed to create idea thread:', error);
      await message.reply('Sorry, I couldn\'t create a thread for this idea. Please check my permissions.');
    }
  }

  private async categorizeIdea(
    message: Message | PartialMessage,
    user: User | PartialUser
  ): Promise<void> {
    const categories = ["Feature", "Bug Fix", "Enhancement", "Documentation", "Research", "Discussion"];
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
      title: "✨ Idea Implemented!",
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
      title: "🗂️ Idea Archived",
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
      title: "👍 Idea Approved!",
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
    priority: "high" | "medium" | "low"
  ): Promise<void> {
    const priorityEmoji = { high: "🔥", medium: "📅", low: "📋" };
    const embed = {
      color: priority === "high" ? 0xff0000 : priority === "medium" ? 0xffaa00 : 0x808080,
      title: `${priorityEmoji[priority]} Priority Set: ${priority.toUpperCase()}`,
      description: `Priority set by ${user.tag}`,
      timestamp: new Date().toISOString(),
    };

    await message.reply({ embeds: [embed] });
  }

  getIdeaEmojiGuide(): string {
    return `**💡 Idea Management - Emoji Guide**

**Thread Management:**
💡 - Create idea thread for discussion
👍 - Approve idea for implementation
🔥 - Mark as high priority

**Organization:**
📋 - Categorize idea
✨ - Mark as implemented
🗂️ - Archive completed/outdated idea

**How to use:** React to messages in idea channels with these emojis to manage ideas in organized threads!`;
  }
}