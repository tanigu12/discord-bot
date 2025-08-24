import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { AttachmentService } from './attachmentService';

export interface ReplyOptions {
  content: string;
  filename?: string;
  contextInfo?: string;
}

interface ReplyResult {
  strategy: 'message' | 'attachment';
  characterCount: number;
  sent: boolean;
}

/**
 * Service for handling conditional reply strategy based on content length
 * Sends short content as direct messages, long content as file attachments
 */
export class ReplyStrategyService {
  // Character limit constants
  static readonly DEFAULT_CHARACTER_LIMIT = 1500;
  static readonly CHARACTER_LIMIT = parseInt(
    process.env.REPLY_CHARACTER_LIMIT || ReplyStrategyService.DEFAULT_CHARACTER_LIMIT.toString()
  );

  /**
   * Evaluate content length and determine if attachment should be used
   * @param content Text content to evaluate
   * @returns True if content should be sent as attachment, false for direct message
   */
  static shouldUseAttachment(content: string): boolean {
    return content.length > ReplyStrategyService.CHARACTER_LIMIT;
  }

  /**
   * Send conditional reply for Message context (Larry consult, reactions)
   * @param message Discord message to reply to
   * @param options Reply options including content and filename
   * @returns Result indicating strategy used and success
   */
  static async sendConditionalReply(message: Message, options: ReplyOptions): Promise<ReplyResult> {
    const { content, filename } = options;
    const characterCount = content.length;
    const useAttachment = this.shouldUseAttachment(content);

    console.log(
      `📝 Reply strategy: ${useAttachment ? 'ATTACHMENT' : 'MESSAGE'} (${characterCount} chars)`
    );

    try {
      if (useAttachment) {
        // Send as file attachment
        const attachment = AttachmentService.createTextAttachment(
          content,
          filename || 'response.txt'
        );

        await message.reply({
          content:
            `📎 **Response sent as file** (${characterCount} characters)\n` +
            `Content was too long for direct message. Download the file above to view.`,
          files: [attachment],
        });

        return { strategy: 'attachment', characterCount, sent: true };
      } else {
        // Send as direct message
        await message.reply(content);
        return { strategy: 'message', characterCount, sent: true };
      }
    } catch (error) {
      // Only log in non-test environment
      if (process.env.NODE_ENV !== 'test') {
        console.error('❌ Error in conditional reply:', error);
      }

      // Fallback: try sending as attachment if direct message fails
      if (!useAttachment) {
        try {
          console.log('🔄 Fallback: Sending as attachment due to message error');
          const attachment = AttachmentService.createTextAttachment(
            content,
            filename || 'response.txt'
          );

          await message.reply({
            content:
              `📎 **Response sent as file** (fallback due to formatting issues)\n` +
              `Download the file above to view the complete response.`,
            files: [attachment],
          });

          return { strategy: 'attachment', characterCount, sent: true };
        } catch (fallbackError) {
          // Only log in non-test environment
          if (process.env.NODE_ENV !== 'test') {
            console.error('💥 Fallback also failed:', fallbackError);
          }
          throw fallbackError;
        }
      }

      throw error;
    }
  }

  /**
   * Send conditional reply for Interaction context (slash commands)
   * @param interaction Discord command interaction
   * @param options Reply options including content and filename
   * @returns Result indicating strategy used and success
   */
  static async sendConditionalInteractionReply(
    interaction: ChatInputCommandInteraction,
    options: ReplyOptions
  ): Promise<ReplyResult> {
    const { content, filename } = options;
    const characterCount = content.length;
    const useAttachment = this.shouldUseAttachment(content);

    console.log(
      `📝 Interaction reply strategy: ${useAttachment ? 'ATTACHMENT' : 'MESSAGE'} (${characterCount} chars)`
    );

    try {
      if (useAttachment) {
        // Send as file attachment
        const attachment = AttachmentService.createTextAttachment(
          content,
          filename || 'response.txt'
        );

        await interaction.editReply({
          content:
            `📎 **Response sent as file** (${characterCount} characters)\n` +
            `Content was too long for direct message. Download the file above to view.`,
          files: [attachment],
        });

        return { strategy: 'attachment', characterCount, sent: true };
      } else {
        // Send as direct message
        await interaction.editReply({ content });
        return { strategy: 'message', characterCount, sent: true };
      }
    } catch (error) {
      // Only log in non-test environment
      if (process.env.NODE_ENV !== 'test') {
        console.error('❌ Error in conditional interaction reply:', error);
      }

      // Fallback: try sending as attachment if direct message fails
      if (!useAttachment) {
        try {
          console.log('🔄 Fallback: Sending interaction as attachment due to message error');
          const attachment = AttachmentService.createTextAttachment(
            content,
            filename || 'response.txt'
          );

          await interaction.editReply({
            content:
              `📎 **Response sent as file** (fallback due to formatting issues)\n` +
              `Download the file above to view the complete response.`,
            files: [attachment],
          });

          return { strategy: 'attachment', characterCount, sent: true };
        } catch (fallbackError) {
          // Only log in non-test environment
          if (process.env.NODE_ENV !== 'test') {
            console.error('💥 Interaction fallback also failed:', fallbackError);
          }
          throw fallbackError;
        }
      }

      throw error;
    }
  }

  /**
   * Send conditional reply with embedded content (for diary feedback, etc.)
   * @param message Discord message to reply to
   * @param embed EmbedBuilder for the main embedded content
   * @param content Full text content to evaluate for attachment
   * @param filename Optional filename for attachment
   * @returns Result indicating strategy used and success
   */
  static async sendConditionalEmbedReply(
    message: Message,
    embed: EmbedBuilder,
    content: string,
    filename?: string
  ): Promise<ReplyResult> {
    const characterCount = content.length;
    const useAttachment = this.shouldUseAttachment(content);

    console.log(
      `📝 Embed reply strategy: ${useAttachment ? 'EMBED + ATTACHMENT' : 'EMBED ONLY'} (${characterCount} chars)`
    );

    try {
      if (useAttachment) {
        // Send embed with file attachment
        const { attachment, cleanup } = await AttachmentService.createTempFileAttachment(
          content,
          filename || 'feedback.txt'
        );

        try {
          await message.reply({
            embeds: [embed],
            files: [attachment],
          });
        } finally {
          cleanup();
        }

        return { strategy: 'attachment', characterCount, sent: true };
      } else {
        // Send embed only - the content is short enough to be in the embed
        await message.reply({ embeds: [embed] });
        return { strategy: 'message', characterCount, sent: true };
      }
    } catch (error) {
      console.error('❌ Error in conditional embed reply:', error);
      throw error;
    }
  }

  /**
   * Get formatted status message about reply strategy decision
   * @param result ReplyResult from a conditional reply operation
   * @returns Formatted status message
   */
  static getStrategyStatusMessage(result: ReplyResult): string {
    const { strategy, characterCount } = result;
    const limit = ReplyStrategyService.CHARACTER_LIMIT;

    if (strategy === 'attachment') {
      return `📎 Content sent as file attachment (${characterCount} characters > ${limit} limit)`;
    } else {
      return `💬 Content sent as direct message (${characterCount} characters ≤ ${limit} limit)`;
    }
  }

  /**
   * Check if content would exceed Discord's message limits
   * @param content Content to check
   * @returns True if content would likely cause Discord errors
   */
  static exceedsDiscordLimits(content: string): boolean {
    // Discord's message limit is 2000 characters
    // Leave some buffer for embeds, formatting, etc.
    return content.length > 1900;
  }

  /**
   * Truncate content with ellipsis for preview purposes
   * @param content Content to truncate
   * @param maxLength Maximum length (default: 100)
   * @returns Truncated content with ellipsis if needed
   */
  static truncateForPreview(content: string, maxLength: number = 100): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength - 3) + '...';
  }
}
