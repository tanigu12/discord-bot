
/**
 * Result of transcript extraction from YouTube video
 */
export interface TranscriptResult {
  status: 'success' | 'error';
  transcript?: string;
  videoId?: string;
  error?: string;
}

/**
 * Result of YouTube video analysis including summary
 */
export interface YouTubeAnalysisResult {
  status: 'success' | 'error';
  transcript?: string;
  summary?: string;
  videoId?: string;
  sourceUrl: string;
  error?: string;
}

