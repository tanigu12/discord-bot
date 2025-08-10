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
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a grammar checker and English tutor. Check the grammar of the given text and provide corrections with explanations. Format your response clearly with corrections and explanations.",
          },
          {
            role: "user",
            content: text,
          },
        ],
        max_tokens: 1500,
        temperature: 0.3,
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
}
