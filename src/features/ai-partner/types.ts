export interface LarryContext {
  conversationHistory: string;
  participants: string[];
  messageCount: number;
  timespan: string;
}

export interface LarryAnalysisResult {
  response: string;
  context: LarryContext | null;
  contextInfo: string;
}