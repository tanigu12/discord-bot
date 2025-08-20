import { describe, it, expect } from 'vitest';
import { ObsidianGitHubService } from '../obsidianGitHubService';

describe('GitHub Access Test', () => {
  it('should be able to create a test vocabulary file when GITHUB_PAT is set', async () => {
    // Skip test if GITHUB_PAT is not available
    if (!process.env.GITHUB_PAT) {
      console.log('⚠️ GITHUB_PAT not set, skipping GitHub access test');
      return;
    }

    const service = new ObsidianGitHubService();
    const testContent = `Test Content
?
This is a test vocabulary entry

#flashcards/vocab/ja-to-en #vocabulary`;

    const testFilename = `test-access-${Date.now()}.md`;

    try {
      const fileUrl = await service.createVocabularyFile(testFilename, testContent);
      
      console.log(`✅ Test file created successfully: ${fileUrl}`);
      expect(fileUrl).toContain('github.com');
      expect(fileUrl).toContain('obisidian-git-sync');
      
    } catch (error) {
      console.error('❌ GitHub access test failed:', error);
      throw error;
    }
  });

  it('should validate the repository configuration', () => {
    expect(process.env.OBSIDIAN_REPO_OWNER).toBe('tanigu12');
    expect(process.env.OBSIDIAN_REPO_NAME).toBe('obisidian-git-sync');
    expect(process.env.OBSIDIAN_VOCAB_PATH).toBe('notes/10_Vocabulary/');
  });
});