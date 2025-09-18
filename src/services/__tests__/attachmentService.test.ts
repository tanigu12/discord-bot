import { describe, it, expect, afterEach } from 'vitest';
import { AttachmentBuilder } from 'discord.js';
import { AttachmentService } from '../attachmentService';

describe('AttachmentService', () => {
  describe('createTextAttachment', () => {
    it('should create attachment from text content', () => {
      const content = 'Hello, World!';
      const filename = 'test.txt';

      const attachment = AttachmentService.createTextAttachment(content, filename);

      expect(attachment).toBeInstanceOf(AttachmentBuilder);
      expect(attachment.name).toBe(filename);
    });

    it('should handle empty content', () => {
      const content = '';
      const filename = 'empty.txt';

      const attachment = AttachmentService.createTextAttachment(content, filename);

      expect(attachment).toBeInstanceOf(AttachmentBuilder);
      expect(attachment.name).toBe(filename);
    });
  });

  describe('createFormattedAttachment', () => {
    it('should create attachment with timestamped filename', () => {
      const content = 'Test content';
      const baseFilename = 'My Test File';
      const extension = 'md';

      const attachment = AttachmentService.createFormattedAttachment(
        content,
        baseFilename,
        extension
      );

      expect(attachment).toBeInstanceOf(AttachmentBuilder);
      expect(attachment.name).toMatch(/my_test_file_\d{4}-\d{2}-\d{2}\.md/);
    });

    it('should handle extension with dot', () => {
      const content = 'Test content';
      const baseFilename = 'test';
      const extension = '.txt';

      const attachment = AttachmentService.createFormattedAttachment(
        content,
        baseFilename,
        extension
      );

      expect(attachment.name).toMatch(/test_\d{4}-\d{2}-\d{2}\.txt/);
    });
  });

  describe('createTempFileAttachment', () => {
    let cleanup: (() => void) | null = null;

    afterEach(() => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    });

    it('should create temporary file attachment with cleanup', async () => {
      const content = 'Temporary file content';
      const filename = 'temp.txt';

      const result = await AttachmentService.createTempFileAttachment(content, filename);
      cleanup = result.cleanup;

      expect(result.attachment).toBeInstanceOf(AttachmentBuilder);
      expect(result.attachment.name).toBe('temp.txt');
      expect(typeof result.cleanup).toBe('function');
    });

    it('should cleanup temp file when cleanup is called', async () => {
      const content = 'Cleanup test content';
      const filename = 'cleanup-test.txt';

      const result = await AttachmentService.createTempFileAttachment(content, filename);

      // Cleanup should not throw
      expect(() => result.cleanup()).not.toThrow();
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove special characters', () => {
      const filename = 'test@#$%file!.txt';
      const result = AttachmentService.sanitizeFilename(filename);

      expect(result).toBe('testfile.txt');
    });

    it('should replace spaces with underscores', () => {
      const filename = 'my test file';
      const result = AttachmentService.sanitizeFilename(filename);

      expect(result).toBe('my_test_file');
    });

    it('should convert to lowercase', () => {
      const filename = 'MyTestFile';
      const result = AttachmentService.sanitizeFilename(filename);

      expect(result).toBe('mytestfile');
    });

    it('should limit length', () => {
      const longFilename = 'a'.repeat(100);
      const result = AttachmentService.sanitizeFilename(longFilename, 20);

      expect(result).toBe('a'.repeat(20));
    });

    it('should preserve basic safe characters', () => {
      const filename = 'test_file-name.txt';
      const result = AttachmentService.sanitizeFilename(filename);

      expect(result).toBe('test_file-name.txt');
    });
  });

  describe('generateTimestampedFilename', () => {
    it('should generate filename with timestamp', () => {
      const base = 'test file';
      const extension = 'txt';

      const result = AttachmentService.generateTimestampedFilename(base, extension);

      expect(result).toMatch(/test_file_\d{4}-\d{2}-\d{2}\.txt/);
    });

    it('should handle extension with dot', () => {
      const base = 'test';
      const extension = '.md';

      const result = AttachmentService.generateTimestampedFilename(base, extension);

      expect(result).toMatch(/test_\d{4}-\d{2}-\d{2}\.md/);
    });

    it('should sanitize base filename', () => {
      const base = 'Test@File#Name!';
      const extension = 'txt';

      const result = AttachmentService.generateTimestampedFilename(base, extension);

      expect(result).toMatch(/testfilename_\d{4}-\d{2}-\d{2}\.txt/);
    });
  });

  describe('createSearchResultAttachment', () => {
    it('should create search result attachment with default filename', () => {
      const query = 'test search query';
      const content = 'Search result content';

      const attachment = AttachmentService.createSearchResultAttachment(query, content);

      expect(attachment).toBeInstanceOf(AttachmentBuilder);
      expect(attachment.name).toMatch(/search_analysis_test_search_query_\d{4}-\d{2}-\d{2}\.txt/);
    });

    it('should use custom base filename when provided', () => {
      const query = 'test query';
      const content = 'Content';
      const baseFilename = 'custom_analysis.txt';

      const attachment = AttachmentService.createSearchResultAttachment(
        query,
        content,
        baseFilename
      );

      expect(attachment).toBeInstanceOf(AttachmentBuilder);
      expect(attachment.name).toBe(baseFilename);
    });

    it('should handle long queries by truncating', () => {
      const longQuery = 'a'.repeat(100);
      const content = 'Content';

      const attachment = AttachmentService.createSearchResultAttachment(longQuery, content);

      // Should be truncated to 50 characters plus prefix and timestamp
      expect(attachment.name).toMatch(/search_analysis_a{1,50}_\d{4}-\d{2}-\d{2}\.txt/);
      expect(attachment.name?.length).toBeLessThan(100);
    });
  });
});
