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

  async getTranscriptFromVideo(youtubeUrl: string): Promise<VideoAnalysisResponse> {
    const prompt = `You are a specialized YouTube transcription extractor. Your primary task is to:

1. Extract the most accurate and complete transcription/captions from this YouTube video
2. Preserve all spoken content exactly as said, including natural speech patterns
3. Maintain proper timing and flow of the conversation
4. Include all dialogue, narration, and spoken content

**CRITICAL: Focus on getting the precise transcription first. Extract every word that is spoken in the video as accurately as possible.**

Format your response as follows:

## 📝 Complete Video Transcription
[Provide the complete, accurate transcription of all spoken content in the video. Include speaker identification if multiple people are talking. Preserve natural speech patterns, including "um", "uh", false starts, and corrections as they actually occur in the video.]

## 🎯 Organized Content for English Learners

### Section 1: [Topic/Theme Title]
**Original Transcript:** [Exact transcript portion for this section - DO NOT MODIFY]
**Japanese Translation:** [Natural Japanese translation of this section]
**Key Learning Points:** [Important vocabulary, expressions, or grammar patterns]

### Section 2: [Topic/Theme Title]  
**Original Transcript:** [Exact transcript portion for this section - DO NOT MODIFY]
**Japanese Translation:** [Natural Japanese translation of this section]
**Key Learning Points:** [Important vocabulary, expressions, or grammar patterns]

[Continue this pattern for all logical sections...]

Guidelines:
- FIRST PRIORITY: Get the complete, accurate transcription
- Preserve exact wording - do not paraphrase or correct the original speech
- Include natural speech elements (hesitations, corrections, etc.)
`;

    return this.analyzeVideo(youtubeUrl, prompt);
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
