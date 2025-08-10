import { BskyAgent, RichText } from '@atproto/api';

export interface BlueskyPostResult {
  uri: string;
  cid: string;
  url: string;
}

export class BlueskyService {
  private agent: BskyAgent;
  private isAuthenticated = false;

  constructor() {
    this.agent = new BskyAgent({ 
      service: 'https://bsky.social'
    });
  }

  async login(): Promise<boolean> {
    try {
      const username = process.env.BLUESKY_USERNAME;
      const password = process.env.BLUESKY_PASSWORD;

      if (!username || !password) {
        throw new Error('BLUESKY_USERNAME and BLUESKY_PASSWORD environment variables are required');
      }

      console.log(`🔐 Logging in to Bluesky as ${username}...`);
      
      await this.agent.login({
        identifier: username,
        password: password
      });

      this.isAuthenticated = true;
      console.log('✅ Successfully authenticated with Bluesky');
      return true;

    } catch (error) {
      console.error('❌ Failed to login to Bluesky:', error);
      this.isAuthenticated = false;
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid identifier or password')) {
          throw new Error('Invalid Bluesky credentials. Please check your username and app password.');
        }
        if (error.message.includes('Rate limit')) {
          throw new Error('Rate limit exceeded for Bluesky login. Please try again later.');
        }
      }
      
      throw new Error(`Bluesky authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async post(text: string, imageBuffer?: Buffer): Promise<BlueskyPostResult> {
    try {
      // Ensure we're authenticated
      if (!this.isAuthenticated) {
        console.log('🔄 Not authenticated, attempting login...');
        await this.login();
      }

      console.log(`📝 Preparing to post to Bluesky: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

      // Check text length (Bluesky limit is 300 characters)
      if (text.length > 300) {
        throw new Error(`Post too long (${text.length} characters). Bluesky limit is 300 characters.`);
      }

      // Create RichText to detect mentions and links
      const richText = new RichText({ text });
      await richText.detectFacets(this.agent);

      const postData: any = {
        text: richText.text,
        facets: richText.facets,
        createdAt: new Date().toISOString()
      };

      // Handle image attachment if provided
      if (imageBuffer) {
        console.log('🖼️ Uploading image to Bluesky...');
        try {
          const { data } = await this.agent.uploadBlob(imageBuffer, { 
            encoding: 'image/jpeg' 
          });
          
          postData.embed = {
            $type: 'app.bsky.embed.images',
            images: [{
              alt: 'Image posted from Discord',
              image: data.blob
            }]
          };
          console.log('✅ Image uploaded successfully');
        } catch (imageError) {
          console.warn('⚠️ Failed to upload image, posting text only:', imageError);
        }
      }

      // Create the post
      const result = await this.agent.post(postData);
      
      // Generate Bluesky URL from the result
      const handle = process.env.BLUESKY_USERNAME?.replace('.bsky.social', '') || 'unknown';
      const postId = result.uri.split('/').pop();
      const blueskyUrl = `https://bsky.app/profile/${handle}.bsky.social/post/${postId}`;

      console.log(`✅ Successfully posted to Bluesky: ${blueskyUrl}`);

      return {
        uri: result.uri,
        cid: result.cid,
        url: blueskyUrl
      };

    } catch (error) {
      console.error('❌ Error posting to Bluesky:', error);

      // Handle specific Bluesky API errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        
        if (status === 429) {
          throw new Error('Rate limit exceeded. Please try again later (Bluesky allows 5,000 points per hour).');
        }
        if (status === 400) {
          throw new Error('Invalid post content. Please check your message format.');
        }
        if (status === 401 || status === 403) {
          this.isAuthenticated = false;
          throw new Error('Authentication failed. Please check your Bluesky credentials.');
        }
      }

      throw new Error(`Failed to post to Bluesky: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateCredentials(): Promise<boolean> {
    try {
      return await this.login();
    } catch (error) {
      return false;
    }
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  // Helper method to format Discord message content for Bluesky
  formatForBluesky(discordMessage: string): string {
    let formatted = discordMessage;

    // Remove Discord-specific formatting
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold
    formatted = formatted.replace(/\*(.*?)\*/g, '$1'); // Remove italics
    formatted = formatted.replace(/__(.*?)__/g, '$1'); // Remove underline
    formatted = formatted.replace(/~~(.*?)~~/g, '$1'); // Remove strikethrough
    formatted = formatted.replace(/`(.*?)`/g, '$1'); // Remove inline code
    formatted = formatted.replace(/```[\s\S]*?```/g, '[code block]'); // Replace code blocks

    // Clean up extra whitespace
    formatted = formatted.trim().replace(/\n\s*\n/g, '\n\n');

    // Truncate if too long
    if (formatted.length > 290) {
      formatted = formatted.substring(0, 287) + '...';
    }

    return formatted;
  }

  // Helper method to extract text from rich Discord content
  static extractTextContent(content: string): string {
    // Remove embeds, mentions, and other Discord-specific content
    let text = content;
    
    // Remove user mentions
    text = text.replace(/<@!?\d+>/g, '');
    // Remove channel mentions
    text = text.replace(/<#\d+>/g, '');
    // Remove role mentions
    text = text.replace(/<@&\d+>/g, '');
    // Remove custom emojis
    text = text.replace(/<a?:\w+:\d+>/g, '');
    
    return text.trim();
  }
}