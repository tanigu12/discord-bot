import { GoogleGenerativeAI } from '@google/generative-ai';

interface VideoAnalysisResponse {
  status: 'success' | 'error';
  summary?: string;
  analysis?: string;
  error?: string;
}

export class YoutubeCaptionService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async analyzeVideo(
    youtubeUrl: string,
    prompt: string = 'Please summarize the video in 3 sentences.'
  ): Promise<VideoAnalysisResponse> {
    if (!this.genAI) {
      return {
        status: 'error',
        error: 'Google API key not configured. Please set GOOGLE_API_KEY in environment variables.',
      };
    }

    if (!this.isYouTubeUrl(youtubeUrl)) {
      return {
        status: 'error',
        error: 'Invalid YouTube URL provided.',
      };
    }

    console.log(`🎬 Analyzing YouTube video: ${youtubeUrl}`);
    console.log(`🤖 Using Gemini AI with prompt: ${prompt}`);

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const result = await model.generateContent([
        prompt,
        {
          fileData: {
            fileUri: youtubeUrl,
            mimeType: 'video/mp4',
          },
        },
      ]);

      const response = result.response;
      const text = response.text();

      console.log(`✅ Successfully analyzed video`);

      return {
        status: 'success',
        summary: text,
        analysis: text,
      };
    } catch (error) {
      console.error(`❌ Error analyzing video:`, error);

      if (error instanceof Error) {
        return {
          status: 'error',
          error: `Gemini API error: ${error.message}`,
        };
      }

      return {
        status: 'error',
        error: 'Unknown error occurred while analyzing video',
      };
    }
  }

  async summarizeVideo(youtubeUrl: string): Promise<VideoAnalysisResponse> {
    return this.analyzeVideo(
      youtubeUrl,
      'Please provide a detailed summary of this video, including the main topics discussed and key takeaways.'
    );
  }

  isYouTubeUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com'].includes(
        urlObj.hostname
      );
    } catch {
      return false;
    }
  }

  extractVideoId(url: string): string | null {
    try {
      const urlObj = new URL(url);

      // Standard YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
      if (urlObj.pathname === '/watch') {
        return urlObj.searchParams.get('v');
      }

      // Short YouTube URL: https://youtu.be/VIDEO_ID
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }

      return null;
    } catch {
      return null;
    }
  }
}
