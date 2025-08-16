import { BaseAIService } from "../../services/baseAIService";

// Larry による翻訳サービス
export class TranslationService extends BaseAIService {
  
  // テキスト翻訳
  async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      const systemPrompt = this.aiPartnerIntegration.generateTranslationPrompt(targetLanguage);
      return await this.callOpenAI(systemPrompt, text, {
        model: "gpt-4o-mini",
        maxTokens: 1000,
        temperature: 0.3,
      });
    } catch (error) {
      console.error("Translation error:", error);
      throw new Error("Failed to translate text");
    }
  }

  // 文法チェック
  async checkGrammar(text: string): Promise<string> {
    try {
      const systemPrompt = this.aiPartnerIntegration.generateGrammarCheckPrompt();
      return await this.callOpenAI(systemPrompt, text, {
        model: "gpt-4o-mini",
        maxTokens: 1500,
        temperature: 0.4,
      });
    } catch (error) {
      console.error("Grammar check error:", error);
      throw new Error("Failed to check grammar");
    }
  }

  // 語彙説明
  async explainWord(word: string): Promise<string> {
    try {
      const systemPrompt = this.aiPartnerIntegration.generateVocabularyPrompt();
      return await this.callOpenAI(systemPrompt, word, {
        model: "gpt-4o-mini",
        maxTokens: 800,
        temperature: 0.3,
      });
    } catch (error) {
      console.error("Word explanation error:", error);
      throw new Error("Failed to explain word");
    }
  }

  // テキスト分析
  async explainText(text: string): Promise<string> {
    try {
      const systemPrompt = this.aiPartnerIntegration.generateTextAnalysisPrompt();
      return await this.callOpenAI(systemPrompt, text, {
        model: "gpt-4o-mini",
        maxTokens: 1200,
        temperature: 0.3,
      });
    } catch (error) {
      console.error("Text explanation error:", error);
      throw new Error("Failed to analyze text");
    }
  }

  // 言語検出
  async detectLanguage(text: string): Promise<'japanese' | 'english' | 'other'> {
    try {
      const systemPrompt = this.aiPartnerIntegration.generateLanguageDetectionPrompt();
      const result = await this.callOpenAI(systemPrompt, text, {
        model: "gpt-4o-mini",
        maxTokens: 10,
        temperature: 0.1,
      });
      
      return result.toLowerCase().trim() as 'japanese' | 'english' | 'other';
    } catch (error) {
      console.error("Language detection error:", error);
      throw new Error("Failed to detect language");
    }
  }

  // 言語検出と翻訳を組み合わせた高度な機能
  async detectLanguageAndTranslate(text: string): Promise<{
    detectedLanguage: 'japanese' | 'english' | 'other';
    translation: string;
    grammarCheck?: string;
  }> {
    try {
      const detectedLanguage = await this.detectLanguage(text);

      let translation = '';
      let grammarCheck = undefined;

      if (detectedLanguage === 'japanese') {
        // Translate Japanese to English
        translation = await this.translateText(text, 'English');
      } else if (detectedLanguage === 'english') {
        // Translate English to Japanese
        translation = await this.translateText(text, 'Japanese');
        // Also check English grammar
        grammarCheck = await this.checkGrammar(text);
      } else {
        // For other languages, translate to English by default
        translation = await this.translateText(text, 'English');
      }

      return {
        detectedLanguage,
        translation,
        grammarCheck,
      };
    } catch (error) {
      console.error('Language detection and translation error:', error);
      throw new Error('Failed to detect language and translate');
    }
  }
}