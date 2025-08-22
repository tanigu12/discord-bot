import {
  Message,
  PartialMessage,
  User,
  PartialUser,
  MessageReaction,
  PartialMessageReaction,
  Attachment,
} from 'discord.js';
import { GitHubService, BlogPostMetadata } from '../../services/githubService';

export class BlogHandler {
  private githubService: GitHubService | null = null;

  constructor() {
    // Initialize GitHub service only if PAT is available
    if (GitHubService.isConfigured()) {
      try {
        this.githubService = new GitHubService();
        console.log('✅ GitHub service initialized for blog creation');
      } catch (error) {
        console.error('❌ Failed to initialize GitHub service:', error);
      }
    } else {
      console.warn('⚠️ GITHUB_PAT not configured, blog creation disabled');
    }
  }

  /**
   * Check if the message has text file attachments
   */
  private hasTextAttachment(message: Message | PartialMessage): boolean {
    if (!message.attachments || message.attachments.size === 0) {
      return false;
    }

    return message.attachments.some(
      attachment =>
        attachment.name?.endsWith('.txt') ||
        attachment.name?.endsWith('.md') ||
        attachment.contentType?.startsWith('text/')
    );
  }

  /**
   * Handle blog creation reaction
   */
  async handleBlogReaction(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
    emoji: string
  ): Promise<void> {
    if (!this.githubService) {
      await reaction.message.reply(
        '❌ Blog creation is not available. Please configure GITHUB_PAT environment variable.'
      );
      return;
    }

    const message = reaction.message;

    // Check if message has text attachments
    if (!this.hasTextAttachment(message)) {
      await message.reply(
        `📎 ${emoji} To create a blog post, please react to a message that contains a text file attachment (.txt or .md file).`
      );
      return;
    }

    console.log(`📝 Processing blog creation request from ${user.tag} with ${emoji}`);

    try {
      // Process all text attachments
      const results: string[] = [];

      for (const attachment of message.attachments.values()) {
        if (this.isTextFile(attachment)) {
          const blogUrl = await this.processTextAttachment(attachment, user);
          results.push(`✅ [${attachment.name}](${blogUrl})`);
        }
      }

      if (results.length > 0) {
        const embed = {
          color: 0x00ff00,
          title: '📝 Blog Post Created!',
          description: `Your text file has been converted to a blog post draft:\n\n${results.join('\n')}`,
          fields: [
            {
              name: '📍 Location',
              value: 'Repository: `tanigu12/tanigu12.github.io`\nDirectory: `_drafts/`',
              inline: false,
            },
            {
              name: '📝 Next Steps',
              value:
                '1. Review the generated blog post\n2. Edit title and content as needed\n3. Move from `_drafts/` to `_posts/` when ready to publish',
              inline: false,
            },
          ],
          footer: { text: `Created by ${user.tag}` },
          timestamp: new Date().toISOString(),
        };

        await message.reply({ embeds: [embed] });
        console.log(`✅ Blog creation completed for ${user.tag}`);
      } else {
        await message.reply('❌ No valid text files found to process.');
      }
    } catch (error) {
      console.error('💥 Error creating blog post:', error);
      await message.reply(
        `❌ Sorry, I encountered an error creating your blog post: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if attachment is a text file
   */
  private isTextFile(attachment: Attachment): boolean {
    const fileName = attachment.name?.toLowerCase() || '';
    const contentType = attachment.contentType?.toLowerCase() || '';

    return (
      fileName.endsWith('.txt') ||
      fileName.endsWith('.md') ||
      fileName.endsWith('.markdown') ||
      contentType.startsWith('text/')
    );
  }

  /**
   * Process a text attachment and create a blog post
   */
  private async processTextAttachment(
    attachment: Attachment,
    _user: User | PartialUser
  ): Promise<string> {
    console.log(`📄 Processing text attachment: ${attachment.name}`);

    // Download the text content
    const response = await fetch(attachment.url);
    if (!response.ok) {
      throw new Error(`Failed to download attachment: ${response.statusText}`);
    }

    const content = await response.text();
    console.log(`📄 Downloaded content (${content.length} characters)`);

    // Extract title from content or use filename
    const title =
      this.githubService!.extractTitleFromContent(content) ||
      attachment.name?.replace(/\.(txt|md|markdown)$/i, '') ||
      'New Blog Post';

    // Generate file path
    const { fileName, filePath } = this.githubService!.generateBlogPostPath(title);

    // Create blog post metadata
    const metadata: BlogPostMetadata = {
      title,
      content: content.trim(),
      fileName,
      filePath,
    };

    // Create the blog post in GitHub
    const blogUrl = await this.githubService!.createBlogPost(metadata);

    console.log(`✅ Blog post created: ${fileName}`);
    return blogUrl;
  }
}
