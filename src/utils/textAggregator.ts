/**
 * Utility for aggregating text content and formatting with line folding
 */
export class TextAggregator {
  private static readonly MAX_LINE_LENGTH = 100;

  /**
   * Fold text by breaking lines at specified character length
   */
  static foldLinesByCharacters(text: string, maxLength: number = this.MAX_LINE_LENGTH): string {
    const lines = text.split('\n');
    const foldedLines: string[] = [];

    for (const line of lines) {
      if (line.length <= maxLength) {
        foldedLines.push(line);
      } else {
        // Break long lines at word boundaries when possible
        const words = line.split(' ');
        let currentLine = '';

        for (const word of words) {
          if (currentLine.length + word.length + 1 <= maxLength) {
            currentLine += (currentLine ? ' ' : '') + word;
          } else {
            if (currentLine) {
              foldedLines.push(currentLine);
              currentLine = word;
            } else {
              // Single word longer than max length, force break
              foldedLines.push(word.substring(0, maxLength));
              currentLine = word.substring(maxLength);
            }
          }
        }

        if (currentLine) {
          foldedLines.push(currentLine);
        }
      }
    }

    return foldedLines.join('\n');
  }

  /**
   * Aggregate search results into a formatted text document
   */
  static aggregateSearchResults(
    query: string,
    response: string,
    contextInfo: string,
    handlerType: string
  ): string {
    const timestamp = new Date().toISOString();
    const separator = '='.repeat(80);

    let aggregatedContent = '';

    // Header section
    aggregatedContent += `${separator}\n`;
    aggregatedContent += `SEARCH ANALYSIS RESULTS\n`;
    aggregatedContent += `${separator}\n`;
    aggregatedContent += `Query: ${query}\n`;
    aggregatedContent += `Handler: ${handlerType}\n`;
    aggregatedContent += `Generated: ${timestamp}\n`;
    aggregatedContent += `${separator}\n\n`;

    // Context information if available
    if (contextInfo && contextInfo.trim()) {
      aggregatedContent += `CONTEXT INFORMATION:\n`;
      aggregatedContent += `${contextInfo.trim()}\n\n`;
      aggregatedContent += `${'-'.repeat(40)}\n\n`;
    }

    // Main response content
    aggregatedContent += `ANALYSIS RESULTS:\n`;
    aggregatedContent += `${'-'.repeat(40)}\n`;
    aggregatedContent += `${response.trim()}\n\n`;

    // Footer
    aggregatedContent += `${separator}\n`;
    aggregatedContent += `End of Analysis\n`;
    aggregatedContent += `${separator}\n`;

    // Apply line folding
    return this.foldLinesByCharacters(aggregatedContent);
  }

  /**
   * Generate safe filename from query
   */
  static generateFileName(query: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const safeQuery = query
      .replace(/[^a-z0-9\s-]/gi, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .toLowerCase()
      .substring(0, 50); // Limit length

    return `search_analysis_${safeQuery}_${timestamp}.txt`;
  }
}
