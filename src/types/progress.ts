export type PlaygroundTheme = 'cyan' | 'indigo' | 'emerald' | 'sunset';

export interface UserProgress {
  completedChapters: string[];
  completedExercises: string[];
  completedMissions: string[];
  completedChallenges: string[];
  quizScores: Record<string, number>; // chapterId -> percentage score
  examScores: Record<string, number>; // examId -> percentage score
  commandHistory: string[];
  totalCommandsExecuted: number;
  unlockedBadges: string[];
  lastVisitedRoute: string;
  theme: PlaygroundTheme;
  beginnerMode: boolean;
  autoExplain: boolean;
  xpPoints: number;
  streakDays: number;
}
