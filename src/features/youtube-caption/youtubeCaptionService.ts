interface CaptionRequest {
  url: string;
  languages: string[];
}

interface CaptionResponse {
  status: 'success' | 'error';
  captions?: {
    language: string;
    text: string;
  }[];
  error?: string;
  message?: string;
}

export class YoutubeCaptionService {
  private readonly captionServerUrl: string;

  constructor() {
    // Try Railway internal network first, fallback to external URL
    this.captionServerUrl =
      process.env.NODE_ENV === 'production'
        ? 'http://youtube-caption-server.railway.internal'
        : 'https://youtube-caption-server-production.up.railway.app';
  }

  async fetchCaptions(youtubeUrl: string, languages: string[] = ['en']): Promise<CaptionResponse> {
    try {
      console.log(`🎬 Fetching captions for: ${youtubeUrl}`);
      console.log(`🌐 Using caption server: ${this.captionServerUrl}`);

      const requestBody: CaptionRequest = {
        url: youtubeUrl,
        languages,
      };

      const response = await fetch(`${this.captionServerUrl}/youtube/video-captions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        // Timeout for Railway network calls
        signal: AbortSignal.timeout(30000), // 30 seconds
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Caption server error ${response.status}:`, errorText);

        return {
          status: 'error',
          error: `Caption server error (${response.status}): ${errorText}`,
        };
      }

      const result = (await response.json()) as CaptionResponse;

      if (result.status === 'success' && result.captions) {
        console.log(`✅ Successfully fetched captions in ${result.captions.length} language(s)`);
        return result;
      } else {
        console.error('❌ Caption fetch failed:', result.error || result.message);
        return {
          status: 'error',
          error: result.error || result.message || 'Unknown caption fetch error',
        };
      }
    } catch (error) {
      console.error('❌ YouTube caption service error:', error);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            status: 'error',
            error: 'Caption fetch timeout - the request took too long',
          };
        } else if (error.message.includes('fetch')) {
          return {
            status: 'error',
            error: 'Cannot connect to caption server - network error',
          };
        }
      }

      return {
        status: 'error',
        error: `Caption service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
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
