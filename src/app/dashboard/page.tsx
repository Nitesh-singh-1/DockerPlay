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
  Sparkles,
  ArrowRight,
  Flame,
  Zap,
  RotateCcw,
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
    <div className="flex-1 overflow-y-auto bg-[#070b14] bg-grid-pattern p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                Level {levelInfo.level} • {levelInfo.title}
              </span>
              <span className="flex items-center space-x-1 text-xs text-orange-400 font-mono font-bold bg-orange-950/40 px-2 py-0.5 rounded-full border border-orange-800/40">
                <Flame className="w-3.5 h-3.5 fill-current text-orange-400" />
                <span>{progress.streakDays || 3} Day Study Streak</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 font-display tracking-tight">
              Welcome back, Docker Pioneer!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Track your container orchestration mastery, earn skill badges, and practice real-world DevOps workflows.
            </p>
          </div>

          {/* XP & Level Progress Card */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 text-center min-w-[200px] shrink-0 shadow-xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Level Progression
            </span>
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 font-display">
              {progress.xpPoints} <span className="text-xs text-slate-400 font-mono">XP</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 mt-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">
              {levelInfo.progressXP} / 200 XP to Level {levelInfo.level + 1}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chapters */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 font-display font-semibold">
            <span>Chapters Mastered</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2 font-display">
            <span className="text-3xl font-bold text-slate-100">
              {progress.completedChapters.length}
            </span>
            <span className="text-xs text-slate-500">/ {CURRICULUM_CHAPTERS.length}</span>
          </div>
        </div>

        {/* Missions */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 font-display font-semibold">
            <span>Missions Completed</span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2 font-display">
            <span className="text-3xl font-bold text-slate-100">
              {progress.completedMissions.length}
            </span>
            <span className="text-xs text-slate-500">/ {DOCKER_MISSIONS.length}</span>
          </div>
        </div>

        {/* Break / Fix */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2 hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 font-display font-semibold">
            <span>Break/Fix Solved</span>
            <Wrench className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline space-x-2 font-display">
            <span className="text-3xl font-bold text-slate-100">
              {progress.completedChallenges.length}
            </span>
            <span className="text-xs text-slate-500">/ {TROUBLESHOOTING_CHALLENGES.length}</span>
          </div>
        </div>

        {/* Commands run */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 font-display font-semibold">
            <span>Commands Executed</span>
            <TerminalIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2 font-display">
            <span className="text-3xl font-bold text-slate-100">
              {progress.totalCommandsExecuted}
            </span>
            <span className="text-xs text-slate-500">CLI Runs</span>
          </div>
        </div>
      </div>

      {/* Recommended Up Next Paths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Next Lesson */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              Next Study Milestone
            </span>
            <h3 className="font-bold text-base text-slate-100 font-display">{nextChapter.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{nextChapter.summary}</p>
          </div>
          <Link
            href={`/curriculum/${nextChapter.slug}`}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 w-fit"
          >
            <span>Continue Chapter 0{nextChapter.order}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Next Mission */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              Recommended Quest
            </span>
            <h3 className="font-bold text-base text-slate-100 font-display">{nextMission.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{nextMission.scenario}</p>
          </div>
          <Link
            href="/missions"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 w-fit"
          >
            <span>Launch Mission {nextMission.number}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4 shadow-xl">
        <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2 font-display">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Earned DevOps Badges ({progress.unlockedBadges.length})</span>
        </h3>

        <div className="flex flex-wrap gap-2.5">
          {progress.unlockedBadges.map((badge, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-200 shadow-md hover:border-cyan-500/40 transition-all font-display"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
