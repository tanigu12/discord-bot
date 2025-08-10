import {
  MessageReaction,
  PartialMessageReaction,
  User,
  PartialUser,
  Message,
  PartialMessage,
  ThreadChannel,
} from "discord.js";
import { OpenAIService } from "./openai";

export class ReactionHandler {
  private openaiService: OpenAIService;

  // Emoji mappings for different functions
  private readonly EMOJI_ACTIONS = {
    // Translation emojis
    "🌐": "translate_auto",
    "🇺🇸": "translate_english",
    "🇯🇵": "translate_japanese",
    "🇪🇸": "translate_spanish",
    "🇫🇷": "translate_french",
    "🇩🇪": "translate_german",
    "🇨🇳": "translate_chinese",
    "🇰🇷": "translate_korean",

    // Study emojis
    "✅": "grammar_check",
    "📚": "explain_word",
    "💡": "explain_text",
  };

  private readonly LANGUAGE_MAP = {
    "🇺🇸": "English",
    "🇯🇵": "Japanese",
    "🇪🇸": "Spanish",
    "🇫🇷": "French",
    "🇩🇪": "German",
    "🇨🇳": "Chinese",
    "🇰🇷": "Korean",
  };

  constructor() {
    this.openaiService = new OpenAIService();
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
    
    if (!emoji || !this.EMOJI_ACTIONS[emoji as keyof typeof this.EMOJI_ACTIONS]) {
      console.log(`❌ Emoji "${emoji}" not in action list`);
      console.log(`📋 Available emojis:`, Object.keys(this.EMOJI_ACTIONS));
      return;
    }

    const message = reaction.message;
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
    // Create or get existing thread
    const thread = await this.getOrCreateThread(message, action, emoji);
    if (!thread) return;

    const messageContent = message.content || "";

    try {
      let response = "";

      if (action.startsWith("translate_")) {
        if (action === "translate_auto") {
          // Auto-detect and translate to English by default
          response = await this.openaiService.translateText(
            messageContent,
            "English"
          );
          response = `**Translation (Auto → English):**\n${response}`;
        } else {
          const targetLang =
            this.LANGUAGE_MAP[emoji as keyof typeof this.LANGUAGE_MAP];
          response = await this.openaiService.translateText(
            messageContent,
            targetLang
          );
          response = `**Translation → ${targetLang}:**\n${response}`;
        }
      } else if (action === "grammar_check") {
        response = await this.openaiService.checkGrammar(messageContent);
        response = `**Grammar Check:**\n${response}`;
      } else if (action === "explain_word") {
        // For single words, use word explanation
        const words = messageContent.trim().split(/\s+/);
        if (words.length === 1) {
          response = await this.openaiService.explainWord(words[0]);
          response = `**Word Explanation: "${words[0]}"**\n${response}`;
        } else {
          response = `Please react with 📚 to a single word for explanation.`;
        }
      } else if (action === "explain_text") {
        // General text explanation/analysis
        response = await this.openaiService.explainText(messageContent);
        response = `**Text Analysis:**\n${response}`;
      }

      if (response) {
        // Split long responses if needed
        const chunks = this.splitMessage(response);
        for (const chunk of chunks) {
          await thread.send(chunk);
        }
      }
    } catch (error) {
      await thread.send(
        `Sorry, I encountered an error processing your request: ${error}`
      );
    }
  }

  private async getOrCreateThread(
    message: Message | PartialMessage,
    action: string,
    emoji: string
  ): Promise<ThreadChannel | null> {
    try {
      // Check if a thread already exists for this message
      if (message.hasThread) {
        return message.thread;
      }

      // Create a new thread
      const threadName = this.getThreadName(action, emoji);
      const thread = await message.startThread({
        name: threadName,
        autoArchiveDuration: 60, // Auto-archive after 1 hour
      });

      return thread;
    } catch (error) {
      console.error("Error creating thread:", error);
      return null;
    }
  }

  private getThreadName(action: string, emoji: string): string {
    if (action.startsWith("translate_")) {
      if (action === "translate_auto") return `${emoji} Translation`;
      const lang = this.LANGUAGE_MAP[emoji as keyof typeof this.LANGUAGE_MAP];
      return `${emoji} Translation to ${lang}`;
    } else if (action === "grammar_check") {
      return `${emoji} Grammar Check`;
    } else if (action === "explain_word") {
      return `${emoji} Word Explanation`;
    } else if (action === "explain_text") {
      return `${emoji} Text Analysis`;
    }
    return `${emoji} AI Assistant`;
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

  getEmojiGuide(): string {
    return `**🤖 AI Assistant - Emoji Reactions Guide**

**Translation:**
🌐 - Auto-translate to English
🇺🇸 - Translate to English
🇯🇵 - Translate to Japanese
🇪🇸 - Translate to Spanish
🇫🇷 - Translate to French
🇩🇪 - Translate to German
🇨🇳 - Translate to Chinese
🇰🇷 - Translate to Korean

**English Study:**
✅ - Check grammar and get corrections
📚 - Explain word (single word only)
💡 - Analyze and explain text

**How to use:** Simply react to any message with these emojis and I'll create a thread with the AI response!`;
  }
}
