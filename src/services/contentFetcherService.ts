import axios from 'axios';

interface FetchedContent {
  title?: string;
  content: string;
  url: string;
  contentType?: string;
}

export class ContentFetcherService {
  async fetchContent(url: string): Promise<FetchedContent> {
    try {
      console.log(`🌐 Fetching content from: ${url}`);

      // Validate URL format
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Only HTTP and HTTPS URLs are supported');
      }

      // Fetch content with timeout and proper headers
      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DiscordBot/1.0; AI Content Analyzer)',
          Accept: 'text/html,application/xhtml+xml,text/plain,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        maxContentLength: 1024 * 1024, // 1MB limit
      });

      const contentType = response.headers['content-type'] || '';
      console.log(`📄 Content type: ${contentType}`);

      // Extract title and content based on content type
      let title: string | undefined;
      let content: string;

      if (contentType.includes('text/html')) {
        const result = this.parseHtmlContent(response.data);
        title = result.title;
        content = result.content;
      } else if (contentType.includes('text/plain') || contentType.includes('text/')) {
        content = response.data;
        title = this.extractTitleFromUrl(url);
      } else {
        // For other content types, provide basic info
        content = `Content type: ${contentType}\nURL: ${url}\n\nThis appears to be a ${contentType} file. AI analysis will be limited to the URL and metadata.`;
        title = this.extractTitleFromUrl(url);
      }

      // Clean and truncate content
      content = this.cleanContent(content);

      console.log(`✅ Content extracted successfully: ${content.substring(0, 100)}...`);

      return {
        title,
        content,
        url,
        contentType: contentType,
      };
    } catch (error) {
      console.error('❌ Error fetching content:', error);

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout - the website took too long to respond');
        }
        if (error.response?.status === 403) {
          throw new Error('Access denied - the website blocks automated requests');
        }
        if (error.response?.status === 404) {
          throw new Error('Page not found - the URL may be incorrect');
        }
        if (error.response?.status && error.response.status >= 500) {
          throw new Error('Server error - the website is currently unavailable');
        }
      }

      throw new Error(
        `Failed to fetch content: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private parseHtmlContent(html: string): { title?: string; content: string } {
    try {
      // Extract title
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : undefined;

      // Remove script and style tags
      let cleanHtml = html.replace(/<script[^>]*>.*?<\/script>/gis, '');
      cleanHtml = cleanHtml.replace(/<style[^>]*>.*?<\/style>/gis, '');

      // Remove HTML tags and decode entities
      let content = cleanHtml.replace(/<[^>]*>/g, ' ');
      content = content.replace(/&nbsp;/g, ' ');
      content = content.replace(/&amp;/g, '&');
      content = content.replace(/&lt;/g, '<');
      content = content.replace(/&gt;/g, '>');
      content = content.replace(/&quot;/g, '"');
      content = content.replace(/&#x27;/g, "'");

      // Clean up whitespace
      content = content.replace(/\s+/g, ' ').trim();

      return { title, content };
    } catch (error) {
      console.error('Error parsing HTML:', error);
      return { content: 'Failed to parse HTML content' };
    }
  }

  private extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
      const lastSegment = pathSegments[pathSegments.length - 1] || urlObj.hostname;

      // Clean up the segment (remove file extensions, decode URI)
      let title = decodeURIComponent(lastSegment);
      title = title.replace(/\.[^.]*$/, ''); // Remove file extension
      title = title.replace(/[-_]/g, ' '); // Replace dashes and underscores with spaces
      title = title.replace(/\b\w/g, char => char.toUpperCase()); // Title case

      return title || urlObj.hostname;
    } catch {
      return 'Unknown Title';
    }
  }

  private cleanContent(content: string): string {
    // Truncate very long content to avoid API limits
    const maxLength = 8000; // Conservative limit for AI processing

    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '\n\n[Content truncated due to length...]';
    }

    // Remove excessive whitespace
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n'); // Reduce multiple newlines
    content = content.replace(/[ \t]+/g, ' '); // Normalize spaces

    return content.trim();
  }

  // Helper method to check if URL is likely to contain useful content
}
