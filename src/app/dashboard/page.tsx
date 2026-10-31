'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  Target,
  Wrench,
  Terminal as TerminalIcon,
  CheckCircle2,
  ArrowRight,
  Flame,
  Zap,
  Github,
  Layers,
} from 'lucide-react';
import { ProgressManager, INITIAL_USER_PROGRESS } from '@/lib/persistence/ProgressManager';
import { UserProgress } from '@/types/progress';
import { CURRICULUM_CHAPTERS } from '@/data/curriculum';
import { DOCKER_MISSIONS } from '@/data/missions';
import { TROUBLESHOOTING_CHALLENGES } from '@/data/troubleshooting';

export default function DashboardPage() {
  const [progress, setProgress] = useState<UserProgress>(INITIAL_USER_PROGRESS);

  useEffect(() => {
    setProgress(ProgressManager.load());
  }, []);

  const totalObjectives =
    CURRICULUM_CHAPTERS.length + DOCKER_MISSIONS.length + TROUBLESHOOTING_CHALLENGES.length;
  const completedCount =
    progress.completedChapters.length +
    progress.completedMissions.length +
    progress.completedChallenges.length;
  const progressPct = Math.min(100, Math.round((completedCount / totalObjectives) * 100));

  const levelInfo = ProgressManager.getLevelInfo(progress.xpPoints || 50);

  const nextChapter = CURRICULUM_CHAPTERS.find(
    (ch) => !progress.completedChapters.includes(ch.id)
  ) || CURRICULUM_CHAPTERS[0];

  const nextMission = DOCKER_MISSIONS.find(
    (m) => !progress.completedMissions.includes(m.id)
  ) || DOCKER_MISSIONS[0];

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-page)] p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto transition-colors">
      {/* Welcome & Level Hero Banner */}
      <div className="p-5 sm:p-7 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--border-color)] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[var(--brand-light)] text-[var(--brand-primary)] border border-[var(--brand-primary)]/30 font-bold">
                Level {levelInfo.level} • {levelInfo.title}
              </span>
              <span className="flex items-center space-x-1 text-xs text-amber-500 font-mono font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                <Flame className="w-3.5 h-3.5 fill-current text-amber-500" />
                <span>{progress.streakDays || 3} Day Study Streak</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
              Welcome back, Docker Captain!
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">
              Track your container engineering skills, practice hands-on CLI missions, and unlock DevOps achievements.
            </p>
          </div>

          {/* XP & Level Progress Card */}
          <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-center min-w-[200px] shrink-0 shadow-sm">
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block mb-1">
              Level Progression
            </span>
            <div className="text-3xl font-extrabold text-[var(--brand-primary)] font-display">
              {progress.xpPoints} <span className="text-xs text-[var(--text-muted)] font-mono">XP</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--bg-card)] mt-2 overflow-hidden border border-[var(--border-color)]">
              <div
                className="h-full bg-[var(--brand-primary)] transition-all duration-500"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-mono mt-1.5 block">
              {levelInfo.progressXP} / 200 XP to Level {levelInfo.level + 1}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Chapters */}
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1.5 hover:border-[var(--brand-primary)] transition-all shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-display font-semibold">
            <span>Lessons Mastered</span>
            <BookOpen className="w-4 h-4 text-[var(--brand-primary)]" />
          </div>
          <div className="flex items-baseline space-x-2 font-display">
            <span className="text-2xl font-bold text-[var(--text-primary)]">
              {progress.completedChapters.length}
            </span>
            <span className="text-xs text-[var(--text-muted)]">/ {CURRICULUM_CHAPTERS.length}</span>
          </div>
        </div>

        {/* Missions */}
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1.5 hover:border-amber-500 transition-all shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-display font-semibold">
            <span>Missions Completed</span>
            <Target className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline space-x-2 font-display">
            <span className="text-2xl font-bold text-[var(--text-primary)]">
              {progress.completedMissions.length}
            </span>
            <span className="text-xs text-[var(--text-muted)]">/ {DOCKER_MISSIONS.length}</span>
          </div>
        </div>

        {/* Break / Fix */}
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1.5 hover:border-rose-500 transition-all shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-display font-semibold">
            <span>Break/Fix Solved</span>
            <Wrench className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline space-x-2 font-display">
            <span className="text-2xl font-bold text-[var(--text-primary)]">
              {progress.completedChallenges.length}
            </span>
            <span className="text-xs text-[var(--text-muted)]">/ {TROUBLESHOOTING_CHALLENGES.length}</span>
          </div>
        </div>

        {/* Commands run */}
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1.5 hover:border-emerald-500 transition-all shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-display font-semibold">
            <span>Commands Executed</span>
            <TerminalIcon className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline space-x-2 font-display">
            <span className="text-2xl font-bold text-[var(--text-primary)]">
              {progress.totalCommandsExecuted}
            </span>
            <span className="text-xs text-[var(--text-muted)]">Runs</span>
          </div>
        </div>
      </div>

      {/* Recommended Up Next Paths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Next Lesson */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col justify-between space-y-3.5 shadow-sm">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-[var(--brand-primary)] uppercase font-bold px-2 py-0.5 rounded-full bg-[var(--brand-light)] border border-[var(--brand-primary)]/20">
              Next Study Lesson
            </span>
            <h3 className="font-bold text-sm text-[var(--text-primary)] font-display">{nextChapter.title}</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">{nextChapter.summary}</p>
          </div>
          <Link
            href={`/curriculum/${nextChapter.slug}/`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[var(--brand-primary)] hover:brightness-110 text-slate-950 text-xs font-bold transition-all shadow-sm w-fit active:scale-95"
          >
            <span>Continue Chapter 0{nextChapter.order}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Next Mission */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col justify-between space-y-3.5 shadow-sm">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-amber-500 uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              Recommended Quest
            </span>
            <h3 className="font-bold text-sm text-[var(--text-primary)] font-display">{nextMission.title}</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">{nextMission.scenario}</p>
          </div>
          <Link
            href="/missions/"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm w-fit active:scale-95"
          >
            <span>Launch Mission {nextMission.number}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3 shadow-sm">
        <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono flex items-center space-x-2">
          <Award className="w-4 h-4 text-emerald-500" />
          <span>DevOps Badges ({progress.unlockedBadges.length})</span>
        </h3>

        <div className="flex flex-wrap gap-2">
          {progress.unlockedBadges.map((badge, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] shadow-sm font-semibold"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
