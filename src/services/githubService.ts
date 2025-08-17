import { Octokit } from '@octokit/rest';

export interface BlogPostMetadata {
  title: string;
  content: string;
  fileName: string;
  filePath: string;
}

export class GitHubService {
  private octokit: Octokit;
  private readonly owner: string;
  private readonly repo: string;

  constructor() {
    if (!process.env.GITHUB_PAT) {
      throw new Error('GITHUB_PAT environment variable is required');
    }
    
    // Initialize with your blog repository details
    this.owner = 'tanigu12';
    this.repo = 'tanigu12.github.io';
    
    this.octokit = new Octokit({
      auth: process.env.GITHUB_PAT,
    });
  }

  /**
   * Create a new blog post file in the _drafts directory
   */
  async createBlogPost(metadata: BlogPostMetadata): Promise<string> {
    try {
      console.log(`📝 Creating blog post: ${metadata.fileName}`);
      
      // Create the file content with Jekyll front matter
      const frontMatter = this.generateFrontMatter(metadata.title);
      const fullContent = `${frontMatter}\n\n${metadata.content}`;
      
      // Encode content to base64
      const encodedContent = Buffer.from(fullContent, 'utf-8').toString('base64');
      
      // Create the file in the repository
      const response = await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: metadata.filePath,
        message: `Add new blog post draft: ${metadata.title}`,
        content: encodedContent,
        branch: 'master',
      });
      
      console.log(`✅ Blog post created successfully: ${metadata.filePath}`);
      
      // Return the URL to the created file
      return response.data.content?.html_url || `https://github.com/${this.owner}/${this.repo}/blob/master/${metadata.filePath}`;
      
    } catch (error) {
      console.error('❌ Error creating blog post:', error);
      throw new Error(`Failed to create blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate Jekyll front matter for the blog post
   */
  private generateFrontMatter(title: string): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    return `---
layout: post
title: "${title}"
date: ${dateStr}
categories: []
tags: []
---`;
  }

  /**
   * Generate filename and path for the blog post
   */
  generateBlogPostPath(title: string): { fileName: string; filePath: string } {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Clean title for filename
    const cleanTitle = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove duplicate hyphens
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    const fileName = `${dateStr}-${cleanTitle}.md`;
    const filePath = `_drafts/${fileName}`;
    
    return { fileName, filePath };
  }

  /**
   * Extract title from content (first line or first 50 characters)
   */
  extractTitleFromContent(content: string): string {
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      return 'Untitled Post';
    }
    
    // Use first non-empty line as title, truncated to 50 characters
    const firstLine = lines[0].trim();
    return firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
  }

  /**
   * Check if GitHub PAT is configured
   */
  static isConfigured(): boolean {
    return !!process.env.GITHUB_PAT;
  }
}