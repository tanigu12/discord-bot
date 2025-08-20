import {
  MessageReaction,
  PartialMessageReaction,
  User,
  PartialUser,
  Message,
  PartialMessage,
} from 'discord.js';
import { ContentAnalysisService } from '../search/contentAnalysisService';
import { IdeaHandler } from '../ideas/ideaHandler';
import { BlogHandler } from '../blog/blogHandler';
import { MemoryHandler } from '../memory/memoryHandler';

export class ReactionHandler {
  private contentAnalysisService: ContentAnalysisService;
  private ideaHandler: IdeaHandler;
  private blogHandler: BlogHandler;
  private memoryHandler: MemoryHandler;

  // Emoji mappings for different functions
  private readonly EMOJI_ACTIONS = {
    // Only keep Larry consultation for general reactions
    '🧙‍♂️': 'consult_larry',
  };

  // Idea-specific emojis (handled separately)
  private readonly IDEA_EMOJIS = ['💡', '🧙‍♂️'];

  // Blog creation emojis (handled separately for messages with text attachments)
  private readonly BLOG_EMOJIS = ['📝'];

  // Memory emojis (handled separately for Larry's diary feedback messages)
  private readonly MEMORY_EMOJIS = ['🧠'];

  constructor() {
    this.contentAnalysisService = new ContentAnalysisService();
    this.ideaHandler = new IdeaHandler();
    this.blogHandler = new BlogHandler();
    this.memoryHandler = new MemoryHandler();
  }

  async handleReaction(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser
  ): Promise<void> {
    console.log(`👤 User: ${user.tag} (bot: ${user.bot})`);

    const emoji = reaction.emoji.name;
    console.log(`😀 Emoji: ${emoji}`);

    if (!emoji) {
      console.log('❌ No emoji name found');
      return;
    }

    const message = reaction.message;

    // Check if this is an idea channel and handle idea-specific reactions
    if (this.ideaHandler.isIdeaChannel(message) && this.IDEA_EMOJIS.includes(emoji)) {
      console.log('💡 Handling idea channel reaction');
      await this.ideaHandler.handleIdeaReaction(reaction, user, emoji);
      return;
    }

    // Check if this is a blog creation reaction
    if (this.BLOG_EMOJIS.includes(emoji)) {
      console.log('📝 Handling blog creation reaction');
      await this.blogHandler.handleBlogReaction(reaction, user, emoji);
      return;
    }

    // Check if this is a memory reaction on Larry's feedback messages
    if (this.MEMORY_EMOJIS.includes(emoji) && this.memoryHandler.isValidMemoryReaction(reaction)) {
      console.log('🧠 Handling memory reaction for vocabulary save');
      await this.memoryHandler.handleMemoryReaction(reaction, user);
      return;
    }

    // Handle regular reactions
    if (!this.EMOJI_ACTIONS[emoji as keyof typeof this.EMOJI_ACTIONS]) {
      console.log(`❌ Emoji "${emoji}" not in action list`);
      console.log(`📋 Available emojis:`, Object.keys(this.EMOJI_ACTIONS));
      return;
    }

    console.log(`📝 Message content length: ${message.content?.length || 0}`);

    if (!message.content || !message.content.trim()) {
      console.log('⚠️  Skipping empty message');
      return;
    }

    try {
      const action = this.EMOJI_ACTIONS[emoji as keyof typeof this.EMOJI_ACTIONS];
      console.log(`🎬 Executing action: ${action}`);
      await this.executeAction(action, message, user, emoji);
    } catch (error) {
      console.error(`💥 Error handling reaction ${emoji}:`, error);
    }
  }

  private async executeAction(
    action: string,
    message: Message | PartialMessage,
    _user: User | PartialUser,
    _emoji: string
  ): Promise<void> {
    const messageContent = message.content || '';

    try {
      let response = '';

      if (action === 'consult_larry') {
        // Consult with Larry (Web search enabled)
        console.log('🧙‍♂️ Processing Larry consultation reaction...');

        const aiResponse = await this.contentAnalysisService.analyzeContent(
          `As Larry, a knowledgeable consultant with web search capabilities, please provide expert advice on this topic: ${messageContent}`,
          false
        );
        response = `🧙‍♂️ **Larry's Consultation:**\n\n${aiResponse}`;
      }

      if (response) {
        // Reply to the original message instead of creating a thread
        const chunks = this.splitMessage(response);
        for (const chunk of chunks) {
          await message.reply(chunk);
        }
      }
    } catch (error) {
      await message.reply(`Sorry, I encountered an error processing your request: ${error}`);
    }
  }

  private splitMessage(content: string, maxLength: number = 2000): string[] {
    if (content.length <= maxLength) {
      return [content];
    }

    const chunks: string[] = [];
    let currentChunk = '';
    const lines = content.split('\n');

    for (const line of lines) {
      if ((currentChunk + line + '\n').length > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        // If single line is too long, split it
        if (line.length > maxLength) {
          let remaining = line;
          while (remaining.length > maxLength) {
            chunks.push(remaining.substring(0, maxLength));
            remaining = remaining.substring(maxLength);
          }
          if (remaining) {
            currentChunk = remaining + '\n';
          }
        } else {
          currentChunk = line + '\n';
        }
      } else {
        currentChunk += line + '\n';
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  getEmojiGuide(): string {
    return `**🤖 AI Assistant - Emoji Reactions Guide**

**General Consultation:**
🧙‍♂️ - Consult Larry for expert advice (with web search capabilities)

**Idea Management (in idea channels only):**
💡 - Create idea thread for discussion
🧙‍♂️ - Consult Larry for expert advice

**Blog Creation (in idea channels with text attachments):**
📝 - Create blog post from text file
📄 - Convert document to blog draft
✍️ - Turn text into blog post
📰 - Generate blog article

**Memory/Vocabulary Learning (on Larry's diary feedback only):**
🧠 - Save Japanese sentence with translations to Obsidian Git Sync repository

**How to use:** Simply react to any message with these emojis and I'll reply with the AI response!`;
  }
}
