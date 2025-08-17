import {
  MessageReaction,
  PartialMessageReaction,
  User,
  PartialUser,
  Message,
  PartialMessage,
} from "discord.js";
import { ContentAnalysisService } from "../search/contentAnalysisService";
import { ContentFetcherService } from "../../services/contentFetcherService";
import { IdeaHandler } from "../ideas/ideaHandler";

export class ReactionHandler {
  private contentAnalysisService: ContentAnalysisService;
  private contentFetcher: ContentFetcherService;
  private ideaHandler: IdeaHandler;

  // Emoji mappings for different functions
  private readonly EMOJI_ACTIONS = {
    // Study emojis
    "✅": "grammar_check",
    "📚": "explain_word",
    "💡": "explain_text",

    // Search emoji
    "🔍": "search_analyze",
    
    // AI Partner emoji
    "🤝": "chat_partner",
  };

  // Idea-specific emojis (handled separately)
  private readonly IDEA_EMOJIS = ["💡", "📋", "✨", "🗂️", "👍", "🔥", "🧙‍♂️"];

  constructor() {
    this.contentAnalysisService = new ContentAnalysisService();
    this.contentFetcher = new ContentFetcherService();
    this.ideaHandler = new IdeaHandler();
  }

  async handleReaction(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser
  ): Promise<void> {
    console.log(`👤 User: ${user.tag} (bot: ${user.bot})`);
    
    // Ignore bot reactions
    if (user.bot) {
      console.log('🤖 Ignoring bot reaction');
      return;
    }

    const emoji = reaction.emoji.name;
    console.log(`😀 Emoji: ${emoji}`);
    
    if (!emoji) {
      console.log('❌ No emoji name found');
      return;
    }

    const message = reaction.message;
    
    // Check if this is an idea channel and handle idea-specific reactions
    if (this.ideaHandler.isIdeaChannel(message) && this.IDEA_EMOJIS.includes(emoji)) {
      console.log('💡 Handling idea channel reaction');
      await this.ideaHandler.handleIdeaReaction(reaction, user, emoji);
      return;
    }

    // Handle regular reactions
    if (!this.EMOJI_ACTIONS[emoji as keyof typeof this.EMOJI_ACTIONS]) {
      console.log(`❌ Emoji "${emoji}" not in action list`);
      console.log(`📋 Available emojis:`, Object.keys(this.EMOJI_ACTIONS));
      return;
    }

    console.log(`📝 Message content length: ${message.content?.length || 0}`);
    
    if (!message.content || !message.content.trim()) {
      console.log('⚠️  Skipping empty message');
      return;
    }

    try {
      const action = this.EMOJI_ACTIONS[emoji as keyof typeof this.EMOJI_ACTIONS];
      console.log(`🎬 Executing action: ${action}`);
      await this.executeAction(action, message, user, emoji);
    } catch (error) {
      console.error(`💥 Error handling reaction ${emoji}:`, error);
    }
  }

  private async executeAction(
    action: string,
    message: Message | PartialMessage,
    _user: User | PartialUser,
    emoji: string
  ): Promise<void> {
    const messageContent = message.content || "";

    try {
      let response = "";

      if (action === "grammar_check") {
        response = await this.contentAnalysisService.analyzeContent(
          `Please check the grammar and provide corrections for this text: ${messageContent}`,
          false
        );
        response = `**Grammar Check:**\n${response}`;
      } else if (action === "explain_word") {
        // For single words, use word explanation
        const words = messageContent.trim().split(/\s+/);
        if (words.length === 1) {
          response = await this.contentAnalysisService.analyzeContent(
            `Please explain the meaning, usage, and provide examples for this word: ${words[0]}`,
            false
          );
          response = `**Word Explanation: "${words[0]}"**\n${response}`;
        } else {
          response = `Please react with 📚 to a single word for explanation.`;
        }
      } else if (action === "explain_text") {
        // General text explanation/analysis
        response = await this.contentAnalysisService.analyzeContent(messageContent, false);
        response = `**Text Analysis:**\n${response}`;
      } else if (action === "search_analyze") {
        // Search and analyze content (similar to /search command)
        console.log('🔍 Processing search reaction...');
        const isUrl = this.isValidUrl(messageContent);
        let content = messageContent;
        let sourceInfo = '';

        if (isUrl) {
          console.log('🌐 URL detected in reaction, fetching content...');
          try {
            const fetchedContent = await this.contentFetcher.fetchContent(messageContent);
            content = fetchedContent.content;
            sourceInfo = `\n\n**Source:** ${messageContent}\n**Title:** ${fetchedContent.title || 'Unknown'}`;
            console.log(`✅ Content fetched for reaction: ${content.substring(0, 100)}...`);
          } catch (error) {
            console.error('❌ Failed to fetch URL content in reaction:', error);
            sourceInfo = `\n\n**Source:** ${messageContent} (content fetch failed, analyzing URL directly)`;
          }
        }

        // Generate AI analysis
        const analysis = await this.contentAnalysisService.analyzeContent(content, isUrl);
        response = `🔍 **Content Analysis**\n\n${analysis}${sourceInfo}`;
      } else if (action === "chat_partner") {
        // Chat with AI Partner (simplified without user profile)
        console.log('🤝 Processing AI partner chat reaction...');
        
        // Use text analysis with chat prompt instead
        const aiResponse = await this.contentAnalysisService.analyzeContent(
          `As a helpful AI assistant, please respond to this message: ${messageContent}`,
          false
        );
        response = `🤝 **AIパートナー:**\n\n${aiResponse}`;
      }

      if (response) {
        // Reply to the original message instead of creating a thread
        const chunks = this.splitMessage(response);
        for (const chunk of chunks) {
          await message.reply(chunk);
        }
      }
    } catch (error) {
      await message.reply(
        `Sorry, I encountered an error processing your request: ${error}`
      );
    }
  }



  private splitMessage(content: string, maxLength: number = 2000): string[] {
    if (content.length <= maxLength) {
      return [content];
    }

    const chunks: string[] = [];
    let currentChunk = "";
    const lines = content.split("\n");

    for (const line of lines) {
      if ((currentChunk + line + "\n").length > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = "";
        }
        // If single line is too long, split it
        if (line.length > maxLength) {
          let remaining = line;
          while (remaining.length > maxLength) {
            chunks.push(remaining.substring(0, maxLength));
            remaining = remaining.substring(maxLength);
          }
          if (remaining) {
            currentChunk = remaining + "\n";
          }
        } else {
          currentChunk = line + "\n";
        }
      } else {
        currentChunk += line + "\n";
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  getEmojiGuide(): string {
    return `**🤖 AI Assistant - Emoji Reactions Guide**

**English Study:**
✅ - Check grammar and get corrections
📚 - Explain word (single word only)
💡 - Analyze and explain text

**Content Analysis:**
🔍 - Search and analyze content/URLs (like /search command)

**AI English Teacher:**
🤝 - Chat with Alex, your personal AI English teacher

**Idea Management (in idea channels):**
💡 - Create idea thread for discussion
📋 - Categorize idea
👍 - Approve idea
🔥 - Mark as high priority
🧙‍♂️ - Consult Larry for expert advice
✨ - Mark as implemented
🗂️ - Archive idea

**How to use:** Simply react to any message with these emojis and I'll reply with the AI response!`;
  }

  getIdeaGuide(): string {
    return this.ideaHandler.getIdeaEmojiGuide();
  }
}
