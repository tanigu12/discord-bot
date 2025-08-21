import { AttachmentBuilder } from 'discord.js';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Centralized service for creating Discord file attachments
 * Handles both buffer-based and temporary file-based attachments with cleanup
 */
export class AttachmentService {
  /**
   * Create attachment from text content using buffer
   * @param content Text content to attach
   * @param filename Desired filename for attachment
   * @returns AttachmentBuilder instance
   */
  static createTextAttachment(content: string, filename: string): AttachmentBuilder {
    const buffer = Buffer.from(content, 'utf8');
    return new AttachmentBuilder(buffer, { name: filename });
  }

  /**
   * Create attachment from formatted content with auto-generated filename
   * @param content Text content to attach
   * @param baseFilename Base filename without extension
   * @param extension File extension (with or without dot)
   * @returns AttachmentBuilder instance
   */
  static createFormattedAttachment(
    content: string,
    baseFilename: string,
    extension: string
  ): AttachmentBuilder {
    const sanitizedBase = this.sanitizeFilename(baseFilename);
    const fullFilename = this.generateTimestampedFilename(sanitizedBase, extension);
    return this.createTextAttachment(content, fullFilename);
  }

  /**
   * Create temporary file attachment with automatic cleanup
   * Returns both the attachment and a cleanup function
   * @param content Text content to attach
   * @param filename Desired filename for attachment
   * @returns Object with attachment and cleanup function
   */
  static async createTempFileAttachment(
    content: string,
    filename: string
  ): Promise<{
    attachment: AttachmentBuilder;
    cleanup: () => void;
  }> {
    const sanitizedFilename = this.sanitizeFilename(filename);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const tempFilename = `${sanitizedFilename}-${timestamp}`;
    const filePath = join(tmpdir(), tempFilename);

    // Write content to temporary file
    writeFileSync(filePath, content, 'utf8');

    // Create attachment from file path
    const attachment = new AttachmentBuilder(filePath, { name: sanitizedFilename });

    // Return attachment with cleanup function
    const cleanup = () => {
      try {
        unlinkSync(filePath);
      } catch (error) {
        console.warn('Failed to cleanup temporary file:', filePath, error);
      }
    };

    return { attachment, cleanup };
  }

  /**
   * Sanitize filename for safe file operations
   * Removes special characters and limits length
   * @param filename Original filename
   * @param maxLength Maximum filename length (default: 50)
   * @returns Sanitized filename
   */
  static sanitizeFilename(filename: string, maxLength: number = 50): string {
    return filename
      .replace(/[^a-z0-9\s-_.]/gi, '') // Remove special characters, keep basic ones
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .toLowerCase()
      .substring(0, maxLength); // Limit length
  }

  /**
   * Generate timestamped filename with proper extension
   * @param base Base filename (will be sanitized)
   * @param extension File extension (with or without dot)
   * @returns Timestamped filename
   */
  static generateTimestampedFilename(base: string, extension: string): string {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const sanitizedBase = this.sanitizeFilename(base);
    const cleanExtension = extension.startsWith('.') ? extension : `.${extension}`;

    return `${sanitizedBase}_${timestamp}${cleanExtension}`;
  }

  /**
   * Create attachment for search analysis results
   * Specialized method that integrates with TextAggregator
   * @param query Search query
   * @param aggregatedContent Pre-formatted content from TextAggregator
   * @param baseFilename Optional base filename (defaults to query-based name)
   * @returns AttachmentBuilder instance
   */
  static createSearchResultAttachment(
    query: string,
    aggregatedContent: string,
    baseFilename?: string
  ): AttachmentBuilder {
    const filename = baseFilename || this.generateSearchFilename(query);
    return this.createTextAttachment(aggregatedContent, filename);
  }

  /**
   * Generate filename for search results (compatible with TextAggregator)
   * @param query Search query
   * @returns Generated filename
   */
  private static generateSearchFilename(query: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const safeQuery = query
      .replace(/[^a-z0-9\s-]/gi, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .toLowerCase()
      .substring(0, 50); // Limit length

    return `search_analysis_${safeQuery}_${timestamp}.txt`;
  }
}
