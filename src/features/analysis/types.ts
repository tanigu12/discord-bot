import { ChatInputCommandInteraction, Message } from 'discord.js';

export interface AnalysisContext {
  context: any;
  contextInfo: string;
}

export interface AnalysisResult {
  response: string;
  handlerInfo: string;
  context: any;
  contextInfo: string;
}

export interface AnalysisConfig {
  query: string;
  source: 'research' | 'mention';
  outputFormat?: 'file' | 'message';
  systemPromptOverride?: string;
}

export type AnalysisSource = ChatInputCommandInteraction | Message;
