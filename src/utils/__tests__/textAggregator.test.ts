import { describe, it, expect } from 'vitest';
import { TextAggregator } from '../textAggregator';

describe('TextAggregator', () => {
  describe('foldLinesByCharacters', () => {
    it('should not modify lines shorter than max length', () => {
      const text = 'Short line\nAnother short line';
      const result = TextAggregator.foldLinesByCharacters(text, 100);
      expect(result).toBe(text);
    });

    it('should fold long lines at word boundaries', () => {
      const longLine =
        'This is a very long line that exceeds the maximum length and should be folded at word boundaries for better readability';
      const result = TextAggregator.foldLinesByCharacters(longLine, 50);
      const lines = result.split('\n');

      // Each line should be <= 50 characters
      lines.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(50);
      });

      // Should preserve all words
      const reconstructed = result.replace(/\n/g, ' ');
      expect(reconstructed).toBe(longLine);
    });

    it('should force break very long single words', () => {
      const longWord = 'a'.repeat(120);
      const result = TextAggregator.foldLinesByCharacters(longWord, 100);
      const lines = result.split('\n');

      expect(lines.length).toBeGreaterThan(1);
      expect(lines[0]).toBe('a'.repeat(100));
      expect(lines[1]).toBe('a'.repeat(20));
    });

    it('should handle mixed content correctly', () => {
      const text =
        'Short line\n' +
        'This is a longer line that should be wrapped at word boundaries when it exceeds the limit\nAnother short line';
      const result = TextAggregator.foldLinesByCharacters(text, 50);
      const lines = result.split('\n');

      expect(lines[0]).toBe('Short line');
      expect(lines[lines.length - 1]).toBe('Another short line');

      // All lines should be <= 50 characters
      lines.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('aggregateSearchResults', () => {
    it('should create properly formatted search results', () => {
      const query = 'test query';
      const response = 'This is the analysis response';
      const contextInfo = 'Context: 5 messages from 2 participants';
      const handlerType = 'TextResponseHandler';

      const result = TextAggregator.aggregateSearchResults(
        query,
        response,
        contextInfo,
        handlerType
      );

      expect(result).toContain('SEARCH ANALYSIS RESULTS');
      expect(result).toContain(`Query: ${query}`);
      expect(result).toContain(`Handler: ${handlerType}`);
      expect(result).toContain(response);
      expect(result).toContain(contextInfo);
      expect(result).toContain('ANALYSIS RESULTS:');
      expect(result).toContain('End of Analysis');
    });

    it('should handle empty context info gracefully', () => {
      const query = 'test query';
      const response = 'Analysis response';
      const contextInfo = '';
      const handlerType = 'WebResponseHandler';

      const result = TextAggregator.aggregateSearchResults(
        query,
        response,
        contextInfo,
        handlerType
      );

      expect(result).toContain(query);
      expect(result).toContain(response);
      expect(result).not.toContain('CONTEXT INFORMATION:');
    });

    it('should apply line folding to aggregated content', () => {
      const longQuery =
        'This is a very long search query that exceeds one hundred characters and should be folded properly when aggregated';
      const response = 'Response';
      const contextInfo = '';
      const handlerType = 'Handler';

      const result = TextAggregator.aggregateSearchResults(
        longQuery,
        response,
        contextInfo,
        handlerType
      );
      const lines = result.split('\n');

      // All lines should be <= 100 characters (default)
      lines.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('generateFileName', () => {
    it('should generate safe filename from query', () => {
      const query = 'Test Query with Special Characters!@#$%';
      const fileName = TextAggregator.generateFileName(query);

      expect(fileName).toMatch(/^search_analysis_/);
      expect(fileName).toMatch(/_\d{4}-\d{2}-\d{2}\.txt$/);
      expect(fileName).toContain('test_query_with_special_characters');
      expect(fileName).not.toContain('!@#$%');
    });

    it('should limit filename length', () => {
      const longQuery =
        'This is an extremely long query that exceeds fifty characters and should be truncated properly to avoid filesystem issues';
      const fileName = TextAggregator.generateFileName(longQuery);

      // Should be truncated but still include prefix and suffix
      expect(fileName.length).toBeLessThan(100);
      expect(fileName).toMatch(/^search_analysis_/);
      expect(fileName).toMatch(/\.txt$/);
    });

    it('should handle empty or whitespace queries', () => {
      const fileName = TextAggregator.generateFileName('   ');
      expect(fileName).toMatch(/^search_analysis_+\d{4}-\d{2}-\d{2}\.txt$/);
    });
  });
});
