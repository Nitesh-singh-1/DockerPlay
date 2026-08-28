import { UserProgress, PlaygroundTheme } from '@/types/progress';

const STORAGE_KEY = 'docker_playground_progress_v2';

export const INITIAL_USER_PROGRESS: UserProgress = {
  completedChapters: [],
  completedExercises: [],
  completedMissions: [],
  completedChallenges: [],
  quizScores: {},
  examScores: {},
  commandHistory: [],
  totalCommandsExecuted: 0,
  unlockedBadges: [],
  lastVisitedRoute: '/playground',
  theme: 'cyan',
  beginnerMode: true,
  autoExplain: true,
  xpPoints: 50, // Starter bonus XP
  streakDays: 3,
};

export class ProgressManager {
  private static isClient(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  public static load(): UserProgress {
    if (!this.isClient()) return INITIAL_USER_PROGRESS;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return INITIAL_USER_PROGRESS;
      return { ...INITIAL_USER_PROGRESS, ...JSON.parse(data) };
    } catch {
      return INITIAL_USER_PROGRESS;
    }
  }

  public static save(progress: UserProgress): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress to localStorage', e);
    }
  }

  public static addXP(amount: number): UserProgress {
    const current = this.load();
    current.xpPoints = (current.xpPoints || 0) + amount;
    this.checkBadges(current);
    this.save(current);
    return current;
  }

  public static setTheme(theme: PlaygroundTheme): UserProgress {
    const current = this.load();
    current.theme = theme;
    this.save(current);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('theme-cyan', 'theme-indigo', 'theme-emerald', 'theme-sunset');
      document.documentElement.classList.add(`theme-${theme}`);
    }
    return current;
  }

  public static markChapterCompleted(chapterId: string): UserProgress {
    const current = this.load();
    if (!current.completedChapters.includes(chapterId)) {
      current.completedChapters.push(chapterId);
      current.xpPoints = (current.xpPoints || 0) + 100;
      this.checkBadges(current);
      this.save(current);
    }
    return current;
  }

  public static markExerciseCompleted(exerciseId: string): UserProgress {
    const current = this.load();
    if (!current.completedExercises.includes(exerciseId)) {
      current.completedExercises.push(exerciseId);
      current.xpPoints = (current.xpPoints || 0) + 50;
      this.checkBadges(current);
      this.save(current);
    }
    return current;
  }

  public static markMissionCompleted(missionId: string): UserProgress {
    const current = this.load();
    if (!current.completedMissions.includes(missionId)) {
      current.completedMissions.push(missionId);
      current.xpPoints = (current.xpPoints || 0) + 150;
      this.checkBadges(current);
      this.save(current);
    }
    return current;
  }

  public static markChallengeCompleted(challengeId: string): UserProgress {
    const current = this.load();
    if (!current.completedChallenges.includes(challengeId)) {
      current.completedChallenges.push(challengeId);
      current.xpPoints = (current.xpPoints || 0) + 120;
      this.checkBadges(current);
      this.save(current);
    }
    return current;
  }

  public static recordQuizScore(chapterId: string, scorePct: number): UserProgress {
    const current = this.load();
    const prev = current.quizScores[chapterId] || 0;
    if (scorePct > prev) {
      current.quizScores[chapterId] = scorePct;
      current.xpPoints = (current.xpPoints || 0) + scorePct;
      this.checkBadges(current);
      this.save(current);
    }
    return current;
  }

  public static recordCommandExecution(cmd: string): UserProgress {
    const current = this.load();
    current.totalCommandsExecuted = (current.totalCommandsExecuted || 0) + 1;
    current.xpPoints = (current.xpPoints || 0) + 5;
    if (!current.commandHistory.includes(cmd)) {
      current.commandHistory.unshift(cmd);
      if (current.commandHistory.length > 100) {
        current.commandHistory = current.commandHistory.slice(0, 100);
      }
    }
    this.checkBadges(current);
    this.save(current);
    return current;
  }

  public static setBeginnerMode(enabled: boolean): UserProgress {
    const current = this.load();
    current.beginnerMode = enabled;
    this.save(current);
    return current;
  }

  public static setAutoExplain(enabled: boolean): UserProgress {
    const current = this.load();
    current.autoExplain = enabled;
    this.save(current);
    return current;
  }

  public static resetProgress(): UserProgress {
    if (this.isClient()) {
      localStorage.removeItem(STORAGE_KEY);
    }
    return INITIAL_USER_PROGRESS;
  }

  public static getLevelInfo(xp: number) {
    const level = Math.floor(xp / 200) + 1;
    const currentLevelBaseXP = (level - 1) * 200;
    const nextLevelXP = level * 200;
    const progressXP = xp - currentLevelBaseXP;
    const progressPercent = Math.min(100, Math.round((progressXP / 200) * 100));

    const titles = [
      'Docker Explorer',
      'Container Novice',
      'Port Apprentice',
      'Network Crafter',
      'Volume Virtuoso',
      'Dockerfile Architect',
      'Compose Master',
      'Cluster Hero',
      'Docker Grandmaster',
    ];

    const title = titles[Math.min(titles.length - 1, level - 1)];

    return { level, title, progressPercent, currentLevelBaseXP, nextLevelXP, progressXP };
  }

  private static checkBadges(p: UserProgress): void {
    const badges = new Set(p.unlockedBadges || []);

    if (p.totalCommandsExecuted >= 1) badges.add('First Command 🚀');
    if (p.totalCommandsExecuted >= 25) badges.add('CLI Enthusiast ⚡');
    if (p.totalCommandsExecuted >= 100) badges.add('Docker Ninja 🥷');

    if (p.completedChapters.includes('ch-01')) badges.add('Docker Foundations 📘');
    if (p.completedChapters.includes('ch-03')) badges.add('Container Commander 🚢');
    if (p.completedChapters.includes('ch-05')) badges.add('Port Wizard 🌐');
    if (p.completedChapters.includes('ch-06')) badges.add('Network Architect 🕸️');
    if (p.completedChapters.includes('ch-07')) badges.add('Volume Virtuoso 💾');
    if (p.completedChapters.includes('ch-08')) badges.add('Image Crafter 🏗️');
    if (p.completedChapters.includes('ch-09')) badges.add('Compose Master 🎻');
    if (p.completedChapters.includes('ch-10')) badges.add('Troubleshooter Hero 🛠️');

    if (p.completedMissions.length >= 5) badges.add('Mission Specialist 🎖️');
    if (p.completedMissions.length >= 10) badges.add('Grand Orchestrator 👑');

    if (p.completedChallenges.length >= 3) badges.add('Break-Fix Solver 🔧');

    p.unlockedBadges = Array.from(badges);
  }
}
