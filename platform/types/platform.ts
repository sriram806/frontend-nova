export type UserProfile = {
  id: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
  isOnboarded: boolean;
  subscription: boolean;
  displayName: string;
  targetRole: string | null;
  preferences: any;
  bio: string | null;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    portfolio?: string;
  };
};

export type AuthPayload = {
  accessToken: string;
  refreshToken?: string;
  user: UserProfile;
};

export type Recommendation = {
  id: string;
  title: string;
  description: string;
  category: 'course' | 'project' | 'exam' | 'interview';
  priority: 'high' | 'medium' | 'low';
};

export type RecentActivity = {
  id: string;
  title: string;
  timestamp: string;
  type: 'exam' | 'roadmap' | 'resume' | 'interview';
};

export type SkillSummary = {
  skill: string;
  progress: number;
  status: 'passed' | 'failed' | 'in-progress';
  attempts: number;
};

export type DashboardOverview = {
  greeting: string;
  streak: number;
  tasksDueToday: number;
  skillProgress: SkillSummary[];
  recommendations: Recommendation[];
  activity: RecentActivity[];
};

export type ExamQuestionBase = {
  id: string;
  prompt: string;
  skill: string;
  marks: number;
};

export type McqQuestion = ExamQuestionBase & {
  type: 'mcq';
  options: string[];
};

export type FillBlankQuestion = ExamQuestionBase & {
  type: 'fill';
  placeholder?: string;
};

export type CodingQuestion = ExamQuestionBase & {
  type: 'coding';
  starterCode: string;
  language: string;
};

export type ExamQuestion = McqQuestion | FillBlankQuestion | CodingQuestion;

export type ExamSession = {
  id: string;
  title: string;
  skillName: string;
  skillType: 'STANDARD' | 'PROGRAMMING_LANGUAGE';
  durationInSeconds: number;
  timeRemainingInSeconds: number;
  startedAt: string;
  endsAt: string;
  passPercentage: number;
  instructions: string[];
  questions: ExamQuestion[];
  securityConfig: {
    enforceFullscreen: boolean;
    disableCopyPaste: boolean;
    trackTabSwitches: boolean;
    shuffleQuestions: boolean;
    maxTabSwitches?: number;
  };
};

export type ExamCatalogItem = {
  skillName: string;
  title: string;
  description: string;
  skillType: 'STANDARD' | 'PROGRAMMING_LANGUAGE';
  status: 'ready' | 'draft' | 'in_progress' | 'passed' | 'failed';
  isPublished: boolean;
  isReady: boolean;
  passPercentage: number;
  securityConfig: {
    enforceFullscreen: boolean;
    disableCopyPaste: boolean;
    trackTabSwitches: boolean;
    shuffleQuestions: boolean;
    maxTabSwitches?: number;
  };
  questionBank: {
    total: number;
    mcq: number;
    fill: number;
    code: number;
    required: {
      mcq: number;
      fill: number;
      code: number;
    };
  };
  progress: {
    score: number;
    attempts: number;
    status: 'NOT_STARTED' | 'LEARNING' | 'PASSED';
  } | null;
  latestAttempt: {
    id: string;
    status: 'IN_PROGRESS' | 'PASS' | 'FAIL';
    percentage: number;
    attemptNumber: number;
    startedAt: string;
    submittedAt: string | null;
  } | null;
};

export type ExamQuestionReview = {
  questionId: string;
  type: 'mcq' | 'fill' | 'coding';
  prompt: string;
  expectedAnswer: string;
  submittedAnswer: string;
  correct: boolean;
  marksAwarded: number;
  marks: number;
  explanation: string | null;
};

export type SubmitExamResult = {
  sessionId: string;
  score: number;
  passed: boolean;
  timedOut: boolean;
  skill: string;
  threshold: number;
  totalMarks: number;
  scoredMarks: number;
  submittedAt: string;
  questions?: ExamQuestionReview[];
};

export type ExamTemplateSummary = {
  id: string;
  organizationId: string | null;
  skillName: string;
  title: string;
  description: string;
  skillType: 'STANDARD' | 'PROGRAMMING_LANGUAGE';
  difficultyLevel: number;
  passPercentage: number;
  mcqCount: number;
  fillBlankCount: number;
  codingCount: number;
  isPublished: boolean;
  createdAt: string;
  availableQuestions: {
    total: number;
    mcq: number;
    fill: number;
    code: number;
  };
};

export type ExamTemplateQuestion = {
  id: string;
  examId: string;
  skillName: string;
  type: 'MCQ' | 'FILL' | 'CODE';
  question: string;
  options: string[] | null;
  answer: string;
  placeholder: string | null;
  starterCode: string | null;
  language: string | null;
  explanation: string | null;
  difficulty: number;
  marks: number;
  metadata: Record<string, unknown> | null;
};

export type DeleteExamQuestionResult = {
  id: string;
  examId: string;
  skillName: string;
  deleted: boolean;
};

export type RoadmapTask = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

export type RoadmapMilestone = {
  id: string;
  title: string;
  weekLabel: string;
  progress: number;
  tasks: RoadmapTask[];
};

export type InterviewMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  createdAt: string;
};
