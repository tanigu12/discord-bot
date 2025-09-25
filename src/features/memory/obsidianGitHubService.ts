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
      console.log(`📝 Processing vocabulary file: ${filename}`);

      // Construct full file path
      const filePath = `${this.vocabularyPath}${filename}`;

      // Check if file already exists
      const existingFile = await this.getFileContent(filePath);
      
      let finalContent: string;
      let commitMessage: string;
      
      if (existingFile) {
        // File exists - append new content
        console.log(`📄 Daily file exists, appending content to: ${filename}`);
        finalContent = existingFile.content + content; // content should already be formatted for appending
        
        commitMessage = `Append vocabulary entry to daily file: ${filename}

📚 New vocabulary entry added to daily file
🧠 Generated from Larry's diary feedback  
📅 ${new Date().toISOString()}`;

        // Encode content to base64
        const encodedContent = Buffer.from(finalContent, 'utf-8').toString('base64');

        // Update existing file
        const response = await this.octokit.rest.repos.createOrUpdateFileContents({
          owner: this.owner,
          repo: this.repo,
          path: filePath,
          message: commitMessage,
          content: encodedContent,
          sha: existingFile.sha, // Required for updating existing files
          branch: 'main',
        });

        console.log(`✅ Content appended to daily file: ${filePath}`);
        return response.data.content?.html_url || 
               `https://github.com/${this.owner}/${this.repo}/blob/main/${filePath}`;
               
      } else {
        // File doesn't exist - create new daily file
        console.log(`🆕 Creating new daily file: ${filename}`);
        
        // Create daily file header
        const dateString = filename.replace('vocabulary-', '').replace('.md', '');
        const dailyHeader = `# Vocabulary Learning - ${dateString}

This file contains vocabulary entries learned on ${dateString}.

---
`;
        
        finalContent = dailyHeader + content;
        
        commitMessage = `Create daily vocabulary file: ${filename}

📚 Daily vocabulary file created
🧠 Generated from Larry's diary feedback
📅 ${new Date().toISOString()}`;

        // Encode content to base64
        const encodedContent = Buffer.from(finalContent, 'utf-8').toString('base64');

        // Create new file
        const response = await this.octokit.rest.repos.createOrUpdateFileContents({
          owner: this.owner,
          repo: this.repo,
          path: filePath,
          message: commitMessage,
          content: encodedContent,
          branch: 'main',
        });

        console.log(`✅ Daily vocabulary file created: ${filePath}`);
        return response.data.content?.html_url || 
               `https://github.com/${this.owner}/${this.repo}/blob/main/${filePath}`;
      }
    } catch (error) {
      console.error('❌ Error processing vocabulary file:', error);

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
          throw new Error(`Failed to process vocabulary file: ${error.message}`);
        }
      } else {
        throw new Error(`Failed to process vocabulary file: Unknown error`);
      }
    }
  }


  /**
   * Get file content and SHA for updating existing files
   */
  private async getFileContent(filePath: string): Promise<{ content: string; sha: string } | null> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
      });

      // GitHub API returns content in base64, decode it
      if ('content' in response.data && typeof response.data.content === 'string') {
        const decodedContent = Buffer.from(response.data.content, 'base64').toString('utf-8');
        return {
          content: decodedContent,
          sha: response.data.sha
        };
      }

      return null;
    } catch (error: any) {
      // If 404, file doesn't exist - this is expected for new daily files
      if (error.status === 404 || (error.response && error.response.status === 404)) {
        return null;
      }
      // Other errors might indicate permission issues
      console.error('Unexpected error in getFileContent:', error);
      throw error;
    }
  }
}
