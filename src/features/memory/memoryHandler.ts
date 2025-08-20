import {
  MessageReaction,
  PartialMessageReaction,
  User,
  PartialUser,
  Message,
  PartialMessage
} from 'discord.js';
import { MemoryFormatter } from './memoryFormatter';
import { ObsidianGitHubService } from './obsidianGitHubService';

export class MemoryHandler {
  private memoryFormatter: MemoryFormatter;
  private obsidianService: ObsidianGitHubService;

  // Memory emoji for triggering vocabulary save
  private readonly MEMORY_EMOJI = '🧠';

  constructor() {
    this.memoryFormatter = new MemoryFormatter();
    this.obsidianService = new ObsidianGitHubService();
  }

  /**
   * Handle memory emoji reaction on Larry's diary feedback messages
   */
  async handleMemoryReaction(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser
  ): Promise<void> {
    try {
      console.log(`🧠 Memory reaction from ${user.tag} - processing vocabulary save...`);

      const message = reaction.message;
      
      // Validate this is a valid memory reaction
      if (!this.isValidMemoryReaction(reaction)) {
        console.log('❌ Invalid memory reaction - not on Larry feedback message');
        await message.reply('🧠 Memory save only works on Larry\'s diary feedback messages with text attachments.');
        return;
      }

      // Extract diary content from message attachment
      const messageContent = await this.extractMessageContent(message);
      if (!messageContent) {
        console.log('❌ No message.txt content found');
        await message.reply('🧠 Could not find message.txt attachment with diary content.');
        return;
      }

      // Validate content is suitable for vocabulary learning
      if (!this.memoryFormatter.validateMemoryContent(messageContent)) {
        console.log('❌ Content not suitable for vocabulary learning');
        await message.reply('🧠 This content doesn\'t appear suitable for vocabulary learning (needs Japanese text with translations).');
        return;
      }

      // Format content for Obsidian
      const formattedContent = await this.memoryFormatter.formatForObsidian(messageContent);
      
      // Extract target sentence for filename
      const extracted = this.memoryFormatter.extractContent(messageContent);
      const filename = this.memoryFormatter.generateVocabularyFilename(extracted.targetSentence);

      // Save to Obsidian GitHub repository
      const fileUrl = await this.obsidianService.createVocabularyFile(filename, formattedContent);

      // Confirm success to user
      await message.reply(`🧠✅ **Vocabulary saved to Obsidian!**

📝 **Target:** ${extracted.targetSentence.substring(0, 50)}${extracted.targetSentence.length > 50 ? '...' : ''}
📂 **File:** ${filename}
🔗 **URL:** ${fileUrl}

Your vocabulary entry has been added to your Obsidian Git Sync repository!`);

      console.log(`✅ Memory saved successfully: ${filename}`);

    } catch (error) {
      console.error('❌ Error handling memory reaction:', error);
      await reaction.message.reply(`🧠❌ **Memory save failed**

Sorry, I encountered an error while saving your vocabulary entry: ${error instanceof Error ? error.message : 'Unknown error'}

Please try again or check the logs.`);
    }
  }

  /**
   * Check if reaction is valid for memory processing
   */
  isValidMemoryReaction(reaction: MessageReaction | PartialMessageReaction): boolean {
    const message = reaction.message;
    
    // Must be brain emoji
    if (reaction.emoji.name !== this.MEMORY_EMOJI) {
      return false;
    }

    // Message must be from bot (Larry's feedback)
    if (!message.author?.bot) {
      return false;
    }

    // Message must have text attachments (message.txt from Larry)
    if (!message.attachments || message.attachments.size === 0) {
      return false;
    }

    // Check if any attachment is a text file (likely message.txt from Larry)
    const hasTextFile = Array.from(message.attachments.values()).some(
      attachment => 
        attachment.name?.endsWith('.txt') || 
        attachment.contentType?.startsWith('text/')
    );

    return hasTextFile;
  }

  /**
   * Extract content from message.txt attachment
   */
  private async extractMessageContent(message: Message | PartialMessage): Promise<string | null> {
    try {
      // Find the text attachment (message.txt)
      const textAttachment = Array.from(message.attachments.values()).find(
        attachment => 
          attachment.name?.endsWith('.txt') || 
          attachment.contentType?.startsWith('text/')
      );

      if (!textAttachment) {
        console.log('No text attachment found');
        return null;
      }

      console.log(`📎 Found text attachment: ${textAttachment.name}`);

      // Fetch the attachment content
      const response = await fetch(textAttachment.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch attachment: ${response.status} ${response.statusText}`);
      }

      const content = await response.text();
      console.log(`📄 Extracted content length: ${content.length}`);
      
      return content;
      
    } catch (error) {
      console.error('Error extracting message content:', error);
      return null;
    }
  }

  /**
   * Get emoji used for memory reactions
   */
  getMemoryEmoji(): string {
    return this.MEMORY_EMOJI;
  }

}