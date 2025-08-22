import { Octokit } from '@octokit/rest';

export class ObsidianGitHubService {
  private octokit: Octokit;
  private readonly owner: string;
  private readonly repo: string;
  private readonly vocabularyPath: string;

  constructor() {
    if (!process.env.GITHUB_PAT) {
      throw new Error('GITHUB_PAT environment variable is required for Obsidian integration');
    }

    // Obsidian Git Sync repository details
    this.owner = process.env.OBSIDIAN_REPO_OWNER || 'tanigu12';
    this.repo = process.env.OBSIDIAN_REPO_NAME || 'obisidian-git-sync';
    this.vocabularyPath = process.env.OBSIDIAN_VOCAB_PATH || 'notes/10_Vocabulary/';

    this.octokit = new Octokit({
      auth: process.env.GITHUB_PAT,
    });

    console.log(`🔧 ObsidianGitHubService initialized for ${this.owner}/${this.repo}`);
  }

  /**
   * Create a new vocabulary file in the Obsidian repository
   */
  async createVocabularyFile(filename: string, content: string): Promise<string> {
    try {
      console.log(`📝 Creating vocabulary file: ${filename}`);

      // Construct full file path
      let filePath = `${this.vocabularyPath}${filename}`;

      // Check if file already exists
      const exists = await this.checkFileExists(filePath);
      if (exists) {
        console.log(`⚠️ File ${filename} already exists, creating unique name...`);
        filename = this.generateUniqueFilename(filename);
        // Update filePath with new filename
        filePath = `${this.vocabularyPath}${filename}`;
        console.log(`📝 Updated filename: ${filename}`);
      }

      // Encode content to base64
      const encodedContent = Buffer.from(content, 'utf-8').toString('base64');

      // Create commit message
      const commitMessage = `Add vocabulary entry: ${this.extractTitleFromContent(content)}

📚 Vocabulary entry created via Discord memory reaction
🧠 Generated from Larry's diary feedback
📅 ${new Date().toISOString()}`;

      // Create or update the file in the repository
      const response = await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        message: commitMessage,
        content: encodedContent,
        branch: 'main', // Obsidian typically uses 'main' branch
      });

      console.log(`✅ Vocabulary file created successfully: ${filePath}`);

      // Return the URL to the created file
      return (
        response.data.content?.html_url ||
        `https://github.com/${this.owner}/${this.repo}/blob/main/${filePath}`
      );
    } catch (error) {
      console.error('❌ Error creating vocabulary file:', error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error(
            `Repository ${this.owner}/${this.repo} not found or no access. Check GitHub PAT permissions.`
          );
        } else if (error.message.includes('403')) {
          throw new Error(
            `Permission denied to ${this.owner}/${this.repo}. Check GitHub PAT permissions.`
          );
        } else {
          throw new Error(`Failed to create vocabulary file: ${error.message}`);
        }
      } else {
        throw new Error(`Failed to create vocabulary file: Unknown error`);
      }
    }
  }

  /**
   * Check if file already exists in repository
   */
  private async checkFileExists(filePath: string): Promise<boolean> {
    try {
      await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
      });
      return true;
    } catch (error: any) {
      // If 404, file doesn't exist - this is expected for new files
      if (error.status === 404 || (error.response && error.response.status === 404)) {
        return false;
      }
      // Other errors might indicate permission issues
      console.error('Unexpected error in checkFileExists:', error);
      throw error;
    }
  }

  /**
   * Generate unique filename if original already exists
   */
  private generateUniqueFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const nameWithoutExt = originalFilename.replace(/\.md$/, '');
    return `${nameWithoutExt}-${timestamp}.md`;
  }

  /**
   * Extract title from vocabulary content for commit message
   */
  private extractTitleFromContent(content: string): string {
    const lines = content.split('\n');

    // Look for the Japanese sentence (after ###)
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        !trimmed.startsWith('###') &&
        !trimmed.startsWith('#') &&
        trimmed.length > 0 &&
        trimmed !== '?' &&
        /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(trimmed)
      ) {
        // Truncate for commit message
        return trimmed.length > 50 ? trimmed.substring(0, 47) + '...' : trimmed;
      }
    }

    return 'New vocabulary entry';
  }
}
