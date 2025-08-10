import OpenAI from "openai";

export class OpenAIService {
  private openai: OpenAI | null = null;

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable is missing');
      }
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    return this.openai;
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      const openai = this.getOpenAI();
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the given text to ${targetLanguage}. Only return the translated text, no explanations or additional content.`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || "Translation failed";
    } catch (error) {
      console.error("Translation error:", error);
      throw new Error("Failed to translate text");
    }
  }

  async checkGrammar(text: string): Promise<string> {
    try {
      const openai = this.getOpenAI();
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a kind and patient English teacher for beginners. Check the grammar of the given text and provide gentle, encouraging feedback. Focus on:\n- Highlighting what was done well first\n- Gently pointing out areas for improvement\n- Explaining grammar rules in simple terms\n- Providing corrected versions with explanations\n- Being encouraging and supportive\n- Using emojis to make it friendly\nFormat your response in a warm, teacher-like manner that builds confidence.",
          },
          {
            role: "user",
            content: text,
          },
        ],
        max_tokens: 1500,
        temperature: 0.4,
      });

      return response.choices[0]?.message?.content || "Grammar check failed";
    } catch (error) {
      console.error("Grammar check error:", error);
      throw new Error("Failed to check grammar");
    }
  }

  async explainWord(word: string): Promise<string> {
    try {
      const openai = this.getOpenAI();
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an English vocabulary tutor. Provide a comprehensive explanation of the given word including: definition, pronunciation, part of speech, example sentences, and common usage. Keep it educational and helpful.",
          },
          {
            role: "user",
            content: word,
          },
        ],
        max_tokens: 800,
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || "Word explanation failed";
    } catch (error) {
      console.error("Word explanation error:", error);
      throw new Error("Failed to explain word");
    }
  }

  async explainText(text: string): Promise<string> {
    try {
      const openai = this.getOpenAI();
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful text analysis assistant. Analyze the given text and provide insights including: main ideas, context, cultural references, idioms, writing style, and educational explanations. Make it helpful for language learning."
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: 1200,
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || "Text analysis failed";
    } catch (error) {
      console.error("Text explanation error:", error);
      throw new Error("Failed to analyze text");
    }
  }

  async detectLanguageAndTranslate(text: string): Promise<{
    detectedLanguage: 'japanese' | 'english' | 'other';
    translation: string;
    grammarCheck?: string;
  }> {
    try {
      const openai = this.getOpenAI();
      
      // First, detect the language
      const languageResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a language detector. Analyze the given text and determine if it's primarily Japanese, English, or another language. Respond with only one word: 'japanese', 'english', or 'other'."
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: 10,
        temperature: 0.1,
      });

      const detectedLanguage = languageResponse.choices[0]?.message?.content?.toLowerCase().trim() as 'japanese' | 'english' | 'other';
      
      // Translate based on detected language
      let translation = '';
      let grammarCheck = undefined;
      
      if (detectedLanguage === 'japanese') {
        // Japanese to English
        translation = await this.translateText(text, 'English');
      } else if (detectedLanguage === 'english') {
        // English to Japanese
        translation = await this.translateText(text, 'Japanese');
        // Also perform grammar check for English text
        grammarCheck = await this.checkGrammar(text);
      } else {
        // Other languages - translate to English by default
        translation = await this.translateText(text, 'English');
      }

      return {
        detectedLanguage,
        translation,
        grammarCheck
      };
    } catch (error) {
      console.error("Language detection and translation error:", error);
      throw new Error("Failed to detect language and translate");
    }
  }
}
