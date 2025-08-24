import { GoogleGenerativeAI } from '@google/generative-ai';
import youtubedl from 'youtube-dl-exec';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

interface VideoAnalysisResponse {
  status: 'success' | 'error';
  summary?: string;
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

  /**
   * Download audio from YouTube video using youtube-dl-exec
   */
  private async downloadAudio(youtubeUrl: string): Promise<{ audioPath: string; videoId: string }> {
    console.log(`🎵 [DEBUG] YoutubeCaptionService.downloadAudio() starting`);
    console.log(`   URL: ${youtubeUrl}`);

    try {
      // Extract video ID for filename
      const videoId = this.extractVideoId(youtubeUrl);
      const tempDir = os.tmpdir();
      const outputPath = path.join(tempDir, `youtube_audio_${videoId}_${Date.now()}`);

      console.log(`   Video ID: ${videoId}`);
      console.log(`   Output path: ${outputPath}.%(ext)s`);

      const startTime = Date.now();

      // Download audio only - using youtube-dl's built-in audio extraction without ffmpeg
      await youtubedl(youtubeUrl, {
        format: 'bestaudio', // Get best audio format available
        output: `${outputPath}.%(ext)s`,
        // Use youtube-dl's built-in time limiting (no ffmpeg required)
        playlistEnd: 1, // Only download one video
        noPlaylist: true, // Don't download playlist
      });

      const downloadTime = Date.now() - startTime;

      // Find the downloaded file (extension varies based on source format)
      const outputDir = path.dirname(outputPath);
      const baseFileName = path.basename(outputPath);
      const files = await fs.readdir(outputDir);
      const audioFile = files.find(file => file.startsWith(baseFileName));

      if (!audioFile) {
        throw new Error('Downloaded audio file not found');
      }

      const audioPath = path.join(outputDir, audioFile);
      const stats = await fs.stat(audioPath);

      console.log(`✅ [DEBUG] Audio download completed in ${downloadTime}ms`);
      console.log(`   Audio file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Audio file path: ${audioPath}`);

      return { audioPath, videoId };
    } catch (error) {
      console.error(`❌ [DEBUG] Audio download failed:`);
      console.error(`   Error type: ${error?.constructor?.name}`);
      console.error(`   Error message: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`   Full error:`, error);
      throw new Error(
        `Failed to download audio: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Extract video ID from YouTube URL
   */
  private extractVideoId(url: string): string {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.slice(1); // Remove leading '/'
      } else if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v') || 'unknown';
      }
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get MIME type based on audio file extension
   */
  private getAudioMimeType(extension: string): string {
    switch (extension) {
      case '.mp3':
        return 'audio/mpeg';
      case '.wav':
        return 'audio/wav';
      case '.m4a':
        return 'audio/mp4';
      case '.ogg':
        return 'audio/ogg';
      case '.webm':
        return 'audio/webm';
      case '.aac':
        return 'audio/aac';
      default:
        console.warn(`⚠️ [DEBUG] Unknown audio extension: ${extension}, defaulting to audio/mpeg`);
        return 'audio/mpeg'; // Default fallback
    }
  }

  /**
   * Clean up downloaded audio file
   */
  private async cleanupAudioFile(audioPath: string): Promise<void> {
    try {
      await fs.unlink(audioPath);
      console.log(`🗑️ [DEBUG] Cleaned up audio file: ${audioPath}`);
    } catch (error) {
      console.warn(
        `⚠️ [DEBUG] Failed to cleanup audio file: ${error instanceof Error ? error.message : String(error)}`
      );
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

    console.log(`🎬 [DEBUG] Valid YouTube URL confirmed, starting audio-based analysis`);
    console.log(`   Model: gemini-2.5-pro`);
    console.log(`   Method: Audio extraction + Gemini analysis`);

    let audioPath: string | null = null;

    try {
      // Step 1: Download audio from YouTube
      console.log(`🎵 [DEBUG] Step 1: Downloading audio from YouTube...`);
      const { audioPath: downloadedPath, videoId } = await this.downloadAudio(youtubeUrl);
      audioPath = downloadedPath;

      // Step 2: Read audio file as base64 for Gemini
      console.log(`🔍 [DEBUG] Step 2: Reading audio file for Gemini analysis...`);
      const audioBuffer = await fs.readFile(audioPath);
      const audioBase64 = audioBuffer.toString('base64');

      // Determine MIME type based on file extension
      const audioExtension = path.extname(audioPath).toLowerCase();
      const mimeType = this.getAudioMimeType(audioExtension);

      console.log(`   Audio file read successfully`);
      console.log(`   Audio buffer size: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Audio format: ${audioExtension} (${mimeType})`);

      // Step 3: Analyze with Gemini
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
      console.log(`🔍 [DEBUG] Step 3: Analyzing audio with Gemini...`);
      console.log(`   Video ID: ${videoId}`);
      console.log(`   Prompt preview: ${prompt.substring(0, 200)}...`);

      const startTime = Date.now();
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: audioBase64,
            mimeType: mimeType,
          },
        },
      ]);
      const apiCallTime = Date.now() - startTime;

      console.log(`🔍 [DEBUG] Gemini API call completed in ${apiCallTime}ms`);

      const response = result.response;
      const text = response.text();

      console.log(`✅ [DEBUG] Successfully analyzed audio`);
      console.log(`   Response length: ${text.length} characters`);
      console.log(`   Response preview: ${text.substring(0, 300)}...`);

      // Step 4: Clean up audio file
      await this.cleanupAudioFile(audioPath);

      return {
        status: 'success',
        summary: text,
      };
    } catch (error) {
      console.error(`❌ [DEBUG] Error analyzing video:`);
      console.error(`   Error type: ${error?.constructor?.name}`);
      console.error(`   Error message: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`   Full error:`, error);

      // Clean up audio file in case of error
      if (audioPath) {
        await this.cleanupAudioFile(audioPath);
      }

      if (error instanceof Error) {
        return {
          status: 'error',
          error: `Audio analysis failed: ${error.message}`,
        };
      }

      return {
        status: 'error',
        error: 'Unknown error occurred while analyzing audio',
      };
    }
  }

  async getTranscriptFromVideo(youtubeUrl: string): Promise<VideoAnalysisResponse> {
    console.log(`🔍 [DEBUG] YoutubeCaptionService.getTranscriptFromVideo() starting`);

    const prompt = `You are a specialized audio transcription extractor for YouTube content. Your primary task is to:

1. Extract the most accurate and complete transcription from this audio file (extracted from YouTube)
2. **IMPORTANT: Process the ENTIRE video content - no time restrictions**
3. Preserve all spoken content exactly as said, including natural speech patterns
4. Maintain proper timing and flow of the conversation
5. Include all dialogue, narration, and spoken content from the audio
6. **CRITICAL: Include approximate timestamps for major topic transitions**

**CRITICAL: Focus on getting the precise transcription first. Extract every word that is spoken in the audio as accurately as possible.**

**Audio Processing: Analyzing complete video content with timestamp markers.**

Format your response as follows:

## 📝 Complete Audio Transcription  
[Provide the complete, accurate transcription of all spoken content from the audio. Include speaker identification if multiple people are talking. Preserve natural speech patterns, including "um", "uh", false starts, and corrections as they actually occur in the audio.]

## 🎯 Organized Content for English Learners

### [00:00:00] Section 1: [Topic/Theme Title]
**Original Transcript:** [Exact transcript portion for this section - DO NOT MODIFY]
**Japanese Translation:** [Natural Japanese translation of this section]
**Key Learning Points:** [Important vocabulary, expressions, or grammar patterns]

### [HH:MM:SS] Section 2: [Topic/Theme Title]  
**Original Transcript:** [Exact transcript portion for this section - DO NOT MODIFY]
**Japanese Translation:** [Natural Japanese translation of this section]
**Key Learning Points:** [Important vocabulary, expressions, or grammar patterns]

[Continue this pattern for all logical sections with appropriate timestamps...]

## 📊 Video Analysis Summary
**Total Content Processed:** [Full video length]
**Number of Sections:** [X sections based on topic transitions]
**Key Topics Covered:** [Brief list of main topics with timestamps]

Guidelines:
- FIRST PRIORITY: Get the complete, accurate transcription from entire audio
- Include timestamps in format [HH:MM:SS] for each section header
- Process COMPLETE video - no time limitations
- Preserve exact wording - do not paraphrase or correct the original speech
- Include natural speech elements (hesitations, corrections, etc.)
- Provide timestamps based on approximate timing of topic transitions
- If video is very long (>2 hours), create logical section breaks every 10-15 minutes
`;

    console.log(`🔍 [DEBUG] Enhanced prompt created for full audio-based analysis`);
    console.log(`   Calling analyzeVideo with complete audio extraction method...`);

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
      console.log(
        `   URL parsing failed: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }
}
