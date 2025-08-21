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
  private readonly captionServerUrl = 'https://youtube-caption-server-production.up.railway.app';

  constructor() {
    // Only use internal Railway network URL with port 8080
  }

  async fetchCaptions(youtubeUrl: string, languages: string[] = ['en']): Promise<CaptionResponse> {
    console.log(`🎬 Fetching captions for: ${youtubeUrl}`);
    console.log(`🌐 Using caption server: ${this.captionServerUrl}`);

    const requestBody: CaptionRequest = {
      url: youtubeUrl,
      languages,
    };

    return this.retry(
      async () => {
        const response = await fetch(`${this.captionServerUrl}/youtube/video-captions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(30000),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Caption server error (${response.status}): ${errorText}`);
        }

        const result = (await response.json()) as CaptionResponse;

        if (result.status === 'success' && result.captions) {
          return result;
        } else {
          throw new Error(result.error || result.message || 'Unknown caption fetch error');
        }
      },
      {
        maxAttempts: 3,
        delay: 5000,
        taskName: 'fetch captions'
      }
    );
  }

  private async retry<T>(
    fn: () => Promise<T>, 
    options: { maxAttempts: number; delay: number; taskName: string }
  ): Promise<T | CaptionResponse> {
    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${options.maxAttempts} to ${options.taskName}`);
        const result = await fn();
        console.log(`✅ Successfully completed ${options.taskName} on attempt ${attempt}`);
        return result;
      } catch (error) {
        console.error(`❌ Error on attempt ${attempt}:`, error instanceof Error ? error.message : error);

        if (attempt === options.maxAttempts) {
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              return {
                status: 'error',
                error: `${options.taskName} timeout after ${options.maxAttempts} attempts - server took too long to respond`,
              } as CaptionResponse;
            } else if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
              return {
                status: 'error',
                error: `Cannot connect to caption server after ${options.maxAttempts} attempts - network error`,
              } as CaptionResponse;
            }
          }

          return {
            status: 'error',
            error: `${options.taskName} failed after ${options.maxAttempts} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
          } as CaptionResponse;
        }
        
        console.log(`⏳ Waiting ${options.delay/1000}s before retry (server might be sleeping)...`);
        await this.sleep(options.delay);
      }
    }

    return {
      status: 'error',
      error: 'All retry attempts failed',
    } as CaptionResponse;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
