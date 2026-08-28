import { DockerState } from './docker';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ChapterSection {
  id: string;
  title: string;
  content: string; // Markdown or rich content
  terminalSnippet?: string;
  visualHighlight?: 'architecture' | 'images' | 'containers' | 'ports' | 'networks' | 'volumes' | 'dockerfile' | 'compose' | 'debugging';
}

export interface ExerciseStep {
  id: string;
  instruction: string;
  task: string;
  expectedCommandPattern?: string; // Regex or pattern string
  validator: (state: DockerState, lastCommand?: string) => boolean | { passed: boolean; message: string };
  hints: string[];
  solution: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: QuizOption[];
  conceptExplanation: string;
}

export interface Chapter {
  id: string;
  slug: string;
  order: number;
  title: string;
  tagline: string;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  summary: string;
  learningObjectives: string[];
  sections: ChapterSection[];
  exercise?: {
    id: string;
    title: string;
    description: string;
    initialStatePreset?: string;
    steps: ExerciseStep[];
  };
  quiz: {
    id: string;
    title: string;
    passingScore: number; // e.g. 70
    questions: QuizQuestion[];
  };
}

export interface Mission {
  id: string;
  number: number;
  title: string;
  tagline: string;
  scenario: string;
  objectives: Array<{
    id: string;
    description: string;
    verify: (state: DockerState) => boolean;
  }>;
  hints: string[];
  solutionSteps: string[];
  rewardBadge: string;
  initialPreset?: string;
}

export interface TroubleshootingChallenge {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  symptom: string;
  scenarioDescription: string;
  setupPreset: string;
  hints: string[];
  suggestedCommands: string[];
  solutionExplanation: string;
  verifyFixed: (state: DockerState) => boolean;
}

export interface PracticalExam {
  id: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  tasks: Array<{
    id: string;
    title: string;
    points: number;
    description: string;
    verify: (state: DockerState) => { passed: boolean; feedback: string };
  }>;
}
