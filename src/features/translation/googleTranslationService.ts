import { Translate } from '@google-cloud/translate/build/src/v2';

export class GoogleTranslationService {
  private translate: Translate | null = null;

  private initTranslate(): Translate {
    if (!this.translate) {
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error('GOOGLE_API_KEY environment variable is not set');
      }

      this.translate = new Translate({
        key: apiKey,
      });
    }
    return this.translate;
  }

  async translateToEnglish(text: string): Promise<string> {
    try {
      const translate = this.initTranslate();
      const [translation] = await translate.translate(text, 'en');
      return translation;
    } catch (error) {
      // Only log in non-test environment
      if (process.env.NODE_ENV !== 'test') {
        console.error('Translation to English failed:', error);
      }
      throw error;
    }
  }

  async translateToJapanese(text: string): Promise<string> {
    try {
      const translate = this.initTranslate();
      const [translation] = await translate.translate(text, 'ja');
      return translation;
    } catch (error) {
      // Only log in non-test environment
      if (process.env.NODE_ENV !== 'test') {
        console.error('Translation to Japanese failed:', error);
      }
      throw error;
    }
  }
}

export const googleTranslationService = new GoogleTranslationService();