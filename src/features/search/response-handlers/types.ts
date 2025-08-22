
export interface ContentResult {
  content: string;
  sourceInfo: string;
}

export interface AnalysisContext {
  context?: any;
  contextInfo: string;
}

export interface ResponseHandler {
  canHandle(query: string): boolean;
  processContent(query: string): Promise<ContentResult>;
  generateResponse(contentResult: ContentResult, analysisContext: AnalysisContext, query?: string): Promise<string>;
}

