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
    console.log(`🔍 [DEBUG] YoutubeCaptionService.analyzeVideo() starting`);
    console.log(`   URL: ${youtubeUrl}`);
    console.log(`   Prompt length: ${prompt.length} characters`);
    
    if (!this.genAI) {
      console.error(`❌ [DEBUG] Google API key not configured`);
      return {
        status: 'error',
        error: 'Google API key not configured. Please set GOOGLE_API_KEY in environment variables.',
      };
    }

    if (!this.isYouTubeUrl(youtubeUrl)) {
      console.error(`❌ [DEBUG] Invalid YouTube URL: ${youtubeUrl}`);
      return {
        status: 'error',
        error: 'Invalid YouTube URL provided.',
      };
    }

    console.log(`🎬 [DEBUG] Valid YouTube URL confirmed, starting Gemini AI analysis`);
    console.log(`   Model: gemini-1.5-pro`);
    console.log(`   Prompt preview: ${prompt.substring(0, 200)}...`);

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      console.log(`🔍 [DEBUG] Gemini model initialized, calling generateContent...`);

      const startTime = Date.now();
      const result = await model.generateContent([
        prompt,
        {
          fileData: {
            fileUri: youtubeUrl,
            mimeType: 'video/mp4',
          },
        },
      ]);
      const apiCallTime = Date.now() - startTime;

      console.log(`🔍 [DEBUG] Gemini API call completed in ${apiCallTime}ms`);
      
      const response = result.response;
      const text = response.text();

      console.log(`✅ [DEBUG] Successfully analyzed video`);
      console.log(`   Response length: ${text.length} characters`);
      console.log(`   Response preview: ${text.substring(0, 300)}...`);

      return {
        status: 'success',
        summary: text,
        analysis: text,
      };
    } catch (error) {
      console.error(`❌ [DEBUG] Error analyzing video:`);
      console.error(`   Error type: ${error?.constructor?.name}`);
      console.error(`   Error message: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`   Full error:`, error);

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
    console.log(`🔍 [DEBUG] YoutubeCaptionService.getTranscriptFromVideo() starting`);
    
    const prompt = `You are a specialized YouTube transcription extractor. Your primary task is to:

1. Extract the most accurate and complete transcription/captions from this YouTube video
2. **IMPORTANT: If this is a long video (>10 minutes), focus ONLY on the first 10 minutes of content** to provide manageable learning material
3. Preserve all spoken content exactly as said, including natural speech patterns
4. Maintain proper timing and flow of the conversation
5. Include all dialogue, narration, and spoken content from the selected timeframe

**CRITICAL: Focus on getting the precise transcription first. Extract every word that is spoken in the video as accurately as possible.**

**For long videos: Only transcribe and analyze the FIRST 10 MINUTES to keep learning sessions focused and manageable.**

Format your response as follows:

## 📝 Complete Video Transcription
[If this is a long video, note: "Note: This transcription covers the first 10 minutes of the video for focused learning."]
[Provide the complete, accurate transcription of all spoken content in the specified timeframe. Include speaker identification if multiple people are talking. Preserve natural speech patterns, including "um", "uh", false starts, and corrections as they actually occur in the video.]

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

## ⏱️ Video Length Note
[If the video is longer than 10 minutes, include: "This analysis covers the first 10 minutes of a longer video. For continued learning, you can request analysis of subsequent segments."]

Guidelines:
- FIRST PRIORITY: Get the complete, accurate transcription
- For videos >10 minutes: Focus only on the first 10 minutes
- Preserve exact wording - do not paraphrase or correct the original speech
- Include natural speech elements (hesitations, corrections, etc.)
- Clearly indicate if content was limited to first 10 minutes
`;

    console.log(`🔍 [DEBUG] Enhanced prompt created with 10-minute focus`);
    console.log(`   Calling analyzeVideo with enhanced prompt...`);
    
    return this.analyzeVideo(youtubeUrl, prompt);
  }

  isYouTubeUrl(url: string): boolean {
    console.log(`🔍 [DEBUG] YoutubeCaptionService.isYouTubeUrl() checking: ${url}`);
    
    try {
      const urlObj = new URL(url);
      const validHosts = ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com'];
      const isValid = validHosts.includes(urlObj.hostname);
      
      console.log(`   Parsed hostname: ${urlObj.hostname}`);
      console.log(`   Valid YouTube URL: ${isValid}`);
      
      return isValid;
    } catch (error) {
      console.log(`   URL parsing failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  
}
