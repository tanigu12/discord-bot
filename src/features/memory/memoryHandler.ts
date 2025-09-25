import {
  MessageReaction,
  PartialMessageReaction,
  User,
  PartialUser,
  Message,
  PartialMessage,
} from 'discord.js';
import { MemoryFormatter } from './memoryFormatter';
import { ObsidianGitHubService } from './obsidianGitHubService';

interface ExtractedMessageContent {
  content: string;
  type: 'embed' | 'attachment' | 'message';
}

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
        await message.reply(
          "🧠 Memory save only works on Larry's diary feedback messages with text attachments."
        );
        return;
      }

      // Extract content and its type from message
      const extractedContent = await this.extractMessageContent(message);
      if (!extractedContent) {
        console.log('❌ No content found');
        await message.reply('🧠 Could not find content with diary content.');
        return;
      }

      const { content, type } = extractedContent;
      console.log(`📝 Processing manual memory save for content type: ${type}`);

      // Validate content is suitable for vocabulary learning based on type
      let isValidContent = false;

      if (type === 'embed') {
        // For embed content, we know it's Larry's feedback - always valid
        console.log('✅ Embed content from Larry - automatically valid for vocabulary learning');
        isValidContent = true;
      } else if (type === 'attachment' || type === 'message') {
        // For attachment/message content, use formatter validation
        isValidContent = this.memoryFormatter.validateMemoryContent(content);
        if (!isValidContent) {
          console.log(`❌ ${type} content not suitable for vocabulary learning`);
          await message.reply(
            "🧠 This content doesn't appear suitable for vocabulary learning (needs Japanese text with translations)."
          );
          return;
        }
      }

      // Generate daily filename
      const filename = this.memoryFormatter.generateVocabularyFilename();

      // Format content for Obsidian based on content type
      let baseFormattedContent: string;

      if (type === 'embed') {
        // Embed content is already well-formatted, use as-is or with minimal formatting
        console.log('📋 Using embed content with minimal formatting');
        baseFormattedContent = content; // Embed content is already structured
      } else {
        // Use formatter for attachment and message content
        console.log(`📄 Formatting ${type} content through MemoryFormatter`);
        baseFormattedContent = await this.memoryFormatter.formatForObsidian(content);
      }

      // Format for appending (adds timestamp and separator)
      const appendFormattedContent = this.memoryFormatter.formatForAppending(baseFormattedContent);

      // Save/append to daily Obsidian file
      const fileUrl = await this.obsidianService.createVocabularyFile(
        filename,
        appendFormattedContent
      );

      // Send content-type specific confirmation reply
      const contentTypeEmoji = type === 'embed' ? '📋' : type === 'attachment' ? '📎' : '📝';
      await message.reply(`🧠✅ **Vocabulary saved to daily file!**

${contentTypeEmoji} **Content Type:** ${type}
📂 **Daily File:** ${filename}
🔗 **URL:** ${fileUrl}

Your vocabulary entry has been appended to your daily Obsidian file!`);

      console.log(`✅ Manual memory saved successfully (${type}): ${filename}`);
    } catch (error) {
      console.error('❌ Error handling memory reaction:', error);
      await reaction.message.reply(`🧠❌ **Memory save failed**

Sorry, I encountered an error while saving your vocabulary entry: ${error instanceof Error ? error.message : 'Unknown error'}

Please try again or check the logs.`);
    }
  }

  /**
   * Handle automatic memory processing for messages in translation channels
   * This is called automatically when messages are sent in translation channels
   */
  async handleTranslationChannelMessage(message: Message): Promise<void> {
    try {
      // Only process bot messages (Larry's feedback) with valid content
      if (!this.isValidTranslationChannelMessage(message)) {
        return;
      }

      console.log(`🧠 Auto-processing memory for translation channel message from bot...`);

      // Extract content and its type from message
      const extractedContent = await this.extractMessageContent(message);
      if (!extractedContent) {
        console.log('❌ No content found for auto-memory processing');
        return;
      }

      const { content, type } = extractedContent;
      console.log(`📝 Processing content type: ${type}`);

      // Validate content is suitable for vocabulary learning based on type
      let isValidContent = false;

      if (type === 'embed') {
        // For embed content, we know it's Larry's feedback - always valid
        console.log('✅ Embed content from Larry - automatically valid for vocabulary learning');
        isValidContent = true;
      } else if (type === 'attachment' || type === 'message') {
        // For attachment/message content, use formatter validation
        isValidContent = this.memoryFormatter.validateMemoryContent(content);
        if (!isValidContent) {
          console.log(
            `❌ ${type} content not suitable for vocabulary learning - skipping auto-memory save`
          );
          return;
        }
      }

      // Generate daily filename
      const filename = this.memoryFormatter.generateVocabularyFilename();

      // Format content for Obsidian based on content type
      let baseFormattedContent: string;

      if (type === 'embed') {
        // Embed content is already well-formatted, use as-is or with minimal formatting
        console.log('📋 Using embed content with minimal formatting');
        baseFormattedContent = content; // Embed content is already structured
      } else {
        // Use formatter for attachment and message content
        console.log(`📄 Formatting ${type} content through MemoryFormatter`);
        baseFormattedContent = await this.memoryFormatter.formatForObsidian(content);
      }

      // Format for appending (adds timestamp and separator)
      const appendFormattedContent = this.memoryFormatter.formatForAppending(baseFormattedContent);

      // Save/append to daily Obsidian file
      const fileUrl = await this.obsidianService.createVocabularyFile(
        filename,
        appendFormattedContent
      );

      // Add brain emoji reaction to indicate auto-save completed
      await message.react(this.MEMORY_EMOJI);

      // Send content-type specific confirmation reply
      const contentTypeEmoji = type === 'embed' ? '📋' : type === 'attachment' ? '📎' : '📝';
      await message.reply(
        `🧠✅ **Auto-saved to daily vocabulary!**\n\n${contentTypeEmoji} **Content Type:** ${type}\n📂 **Daily File:** ${filename}\n🔗 **URL:** ${fileUrl}\n\n*Automatically appended to your daily vocabulary file.*`
      );

      console.log(`✅ Auto-memory appended successfully (${type}): ${filename}`);
    } catch (error) {
      console.error('❌ Error handling translation channel memory:', error);
      // Don't send error messages for auto-processing failures to avoid spam
      // Just log the error and continue
    }
  }

  /**
   * Check if message is valid for automatic memory processing in translation channels
   */
  private isValidTranslationChannelMessage(message: Message): boolean {
    console.log(
      `🔍 Validating translation channel message from ${message.author?.tag || 'unknown'}`
    );

    // Message must be from bot (Larry's feedback)
    if (!message.author?.bot) {
      console.log(
        `❌ Message validation failed: Not from a bot (from: ${message.author?.tag || 'unknown'})`
      );
      return false;
    }

    // Check embeds for Larry's Diary Feedback (new format)
    if (message.embeds && message.embeds.length > 0) {
      const hasLarryEmbed = message.embeds.some(
        embed => embed.title && embed.title.includes("Larry's Diary Feedback")
      );
      if (hasLarryEmbed) {
        console.log(`✅ Message validation passed: Larry's Diary Feedback found in embed title`);
        return true;
      }
    }

    // Check for text attachments (message.txt from Larry) - fallback method
    if (!message.attachments || message.attachments.size === 0) {
      console.log(
        `❌ Message validation failed: No Larry's Diary Feedback in content/embeds and no attachments found`
      );
      return false;
    }

    // Check if any attachment is a text file (likely message.txt from Larry)
    const hasTextFile = Array.from(message.attachments.values()).some(
      attachment => attachment.name?.endsWith('.txt') || attachment.contentType?.startsWith('text/')
    );

    if (!hasTextFile) {
      const attachmentNames = Array.from(message.attachments.values())
        .map(att => att.name || 'unknown')
        .join(', ');
      console.log(
        `❌ Message validation failed: No Larry's Diary Feedback found and no text file attachments (attachments: ${attachmentNames})`
      );
      return false;
    }

    console.log(`✅ Message validation passed: Text file attachment found`);
    return true;
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
      attachment => attachment.name?.endsWith('.txt') || attachment.contentType?.startsWith('text/')
    );

    return hasTextFile;
  }

  /**
   * Extract content from message.txt attachment
   */
  private async extractMessageContent(
    message: Message | PartialMessage
  ): Promise<ExtractedMessageContent | null> {
    try {
      // Check embeds for Larry's Diary Feedback (new format)
      if (message.embeds && message.embeds.length > 0) {
        const larryEmbed = message.embeds.find(
          embed => embed.title && embed.title.includes("Larry's Diary Feedback")
        );

        if (larryEmbed) {
          console.log(`📝 Extracting content from Larry's Diary Feedback embed`);

          // Extract content from embed fields
          let embedContent = `# ${larryEmbed.title}\n\n`;

          if (larryEmbed.fields && larryEmbed.fields.length > 0) {
            for (const field of larryEmbed.fields) {
              embedContent += `## ${field.name}\n${field.value}\n\n`;
            }
          }

          console.log(`📄 Extracted embed content length: ${embedContent.length}`);
          console.log(`📋 Embed content preview: "${embedContent.substring(0, 200)}..."`);
          return {
            content: embedContent,
            type: 'embed',
          };
        }
      }

      // Standard case: Find the text attachment (message.txt)
      const textAttachment = Array.from(message.attachments.values()).find(
        attachment =>
          attachment.name?.endsWith('.txt') || attachment.contentType?.startsWith('text/')
      );

      if (!textAttachment) {
        console.log(
          "❌ No text attachment found and no Larry's Diary Feedback found in content or embeds"
        );
        return null;
      }

      console.log(`📎 Found text attachment: ${textAttachment.name}`);

      // Fetch the attachment content
      const response = await fetch(textAttachment.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch attachment: ${response.status} ${response.statusText}`);
      }

      const content = await response.text();
      console.log(`📄 Extracted attachment content length: ${content.length}`);

      return {
        content: content,
        type: 'attachment',
      };
    } catch (error) {
      console.error('❌ Error extracting message content:', error);
      return null;
    }
  }
}
