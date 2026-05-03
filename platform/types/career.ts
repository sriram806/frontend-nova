export type CareerAnalyzeRequest = {
  resumeText: string;
  targetRole: string;
  userId: string;
  githubScore?: number;
  quizScore?: number;
};

export type CareerMarketInsights = {
  trend: string;
  demandLevel: string;
  topSkillsToPrioritize: string[];
};

export type CareerMetadata = {
  githubScore?: number;
  quizScore?: number;
  experienceYears?: number;
  entityCount?: number;
};

export type CareerReport = {
  userId: string;
  targetRole: string;
  readinessScore: number;
  strengths: string[];
  skillGaps: string[];
  recommendations: string[];
  marketInsights: CareerMarketInsights;
  modelVersion: string;
  similarityScore: number;
  matchedSkills: string[];
  extractedSkills: string[];
  source: string;
  createdAt: string;
  metadata: CareerMetadata;
};

export type CareerAnalyzeSuccessResponse = {
  success: true;
  data: CareerReport | null;
};

export type CareerAnalyzeErrorResponse = {
  success: false;
  message?: string;
  error?: string;
};

export type CareerAnalyzeApiResponse = CareerAnalyzeSuccessResponse | CareerAnalyzeErrorResponse;
