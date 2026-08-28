'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Terminal as TerminalIcon,
  Layers,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
} from 'lucide-react';
import { CURRICULUM_CHAPTERS } from '@/data/curriculum';
import { getDockerEngine } from '@/lib/simulator/DockerEngine';
import { DockerState } from '@/types/docker';
import { DockerTerminal } from '@/components/terminal/DockerTerminal';
import { ExerciseRunner } from '@/components/curriculum/ExerciseRunner';
import { QuizModal } from '@/components/curriculum/QuizModal';
import { ProgressManager } from '@/lib/persistence/ProgressManager';

export default function ChapterPage() {
  const params = useParams();
  const rawId = Array.isArray(params.chapterId) ? params.chapterId[0] : params.chapterId;

  const currentChapter =
    CURRICULUM_CHAPTERS.find((c) => c.slug === rawId || c.id === rawId) ||
    CURRICULUM_CHAPTERS[0];

  const [engine] = useState(() => getDockerEngine());
  const [state, setState] = useState<DockerState>(() => engine.getState());
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [lastExecutedCommand, setLastExecutedCommand] = useState<string>('');
  const [progress, setProgress] = useState(() => ProgressManager.load());

  useEffect(() => {
    const unsub = engine.subscribe((newState) => {
      setState(newState);
      setProgress(ProgressManager.load());
    });
    return () => unsub();
  }, [engine]);

  const currentIdx = CURRICULUM_CHAPTERS.findIndex((c) => c.id === currentChapter.id);
  const prevChapter = currentIdx > 0 ? CURRICULUM_CHAPTERS[currentIdx - 1] : null;
  const nextChapter =
    currentIdx < CURRICULUM_CHAPTERS.length - 1 ? CURRICULUM_CHAPTERS[currentIdx + 1] : null;

  const isCompleted = progress.completedChapters.includes(currentChapter.id);
  const quizScore = progress.quizScores[currentChapter.id];

  const triggerRunCommand = (cmd: string) => {
    window.dispatchEvent(
      new CustomEvent('dockerplay-run-command', { detail: { command: cmd } })
    );
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-3.5rem)] bg-[var(--bg-page)] overflow-hidden transition-colors">
      {/* Left Curriculum Navigation Rail */}
      <aside className="w-full md:w-64 lg:w-72 bg-[var(--bg-card)] border-r border-[var(--border-color)] flex flex-col shrink-0 overflow-y-auto shadow-sm">
        <div className="p-4 border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono flex items-center space-x-2">
              <BookOpen className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>Curriculum Road</span>
            </h2>
            <span className="text-[10px] font-mono text-[var(--brand-primary)] font-bold">
              {progress.completedChapters.length}/{CURRICULUM_CHAPTERS.length} Done
            </span>
          </div>
        </div>

        <nav className="p-2 space-y-1">
          {CURRICULUM_CHAPTERS.map((ch) => {
            const isSelected = ch.id === currentChapter.id;
            const isDone = progress.completedChapters.includes(ch.id);

            return (
              <Link
                key={ch.id}
                href={`/curriculum/${ch.slug}`}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                  isSelected
                    ? 'bg-[var(--brand-light)] text-[var(--brand-primary)] font-bold border border-[var(--brand-primary)]/40 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <span className="w-5 h-5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[10px] font-mono flex items-center justify-center text-[var(--text-muted)] shrink-0 font-bold">
                    {ch.order}
                  </span>
                  <span className="truncate font-medium">{ch.title}</span>
                </div>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2.5 p-2.5 overflow-hidden">
        {/* Lesson Reading & Exercise Column (7 cols) */}
        <div className="lg:col-span-7 h-full overflow-y-auto p-6 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] space-y-6 shadow-sm">
          {/* Chapter Banner */}
          <div className="space-y-2 pb-4 border-b border-[var(--border-color)]">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[var(--brand-light)] text-[var(--brand-primary)] border border-[var(--brand-primary)]/20">
                Chapter 0{currentChapter.order}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {currentChapter.estimatedMinutes} mins • {currentChapter.difficulty}
              </span>
              {isCompleted && (
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  Completed ✓
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display">
              {currentChapter.title}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-mono">
              {currentChapter.tagline}
            </p>
          </div>

          {/* Learning Objectives Box */}
          <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-2.5 shadow-sm">
            <h4 className="font-bold text-xs text-[var(--brand-primary)] uppercase tracking-wider font-mono flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>What You Will Master:</span>
            </h4>
            <div className="space-y-1.5 text-xs text-[var(--text-primary)]">
              {currentChapter.learningObjectives.map((obj, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lesson Content Sections */}
          <div className="space-y-5 text-xs text-[var(--text-primary)] leading-relaxed">
            {currentChapter.sections.map((sec) => (
              <div key={sec.id} className="space-y-2.5 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-display flex items-center space-x-2">
                  <span className="w-1.5 h-4 rounded-full bg-[var(--brand-primary)]" />
                  <span>{sec.title}</span>
                </h3>
                <div className="text-[var(--text-secondary)] whitespace-pre-line space-y-2 text-[12px] leading-relaxed">
                  {sec.content}
                </div>

                {sec.terminalSnippet && (
                  <div className="pt-2">
                    <button
                      onClick={() => triggerRunCommand(sec.terminalSnippet!)}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[var(--brand-light)] hover:brightness-95 text-[var(--brand-primary)] border border-[var(--brand-primary)]/30 text-xs font-mono font-bold transition-all shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>⚡ 1-Click Run: {sec.terminalSnippet}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Interactive Guided Exercise */}
          {currentChapter.exercise && (
            <ExerciseRunner
              chapter={currentChapter}
              state={state}
              lastExecutedCommand={lastExecutedCommand}
              onOpenQuiz={() => setIsQuizOpen(true)}
            />
          )}

          {/* Chapter Quiz Card */}
          <div className="p-5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--brand-light)] border border-[var(--brand-primary)]/20 text-[var(--brand-primary)] flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[var(--text-primary)] font-display">Chapter Knowledge Check</h4>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {quizScore ? `Best Score: ${quizScore}%` : 'Take the interactive MCQ test to unlock bonus XP'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsQuizOpen(true)}
              className="px-4 py-2 rounded-xl bg-[var(--brand-primary)] text-white font-bold text-xs hover:brightness-110 transition-all shadow-md shadow-[var(--brand-primary)]/20 shrink-0"
            >
              {quizScore ? 'Retake Quiz' : 'Start Quiz'}
            </button>
          </div>

          {/* Prev / Next Chapter Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)] text-xs">
            {prevChapter ? (
              <Link
                href={`/curriculum/${prevChapter.slug}`}
                className="flex items-center space-x-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous: {prevChapter.title}</span>
              </Link>
            ) : <div />}

            {nextChapter && (
              <Link
                href={`/curriculum/${nextChapter.slug}`}
                className="flex items-center space-x-1.5 text-[var(--brand-primary)] font-bold hover:underline ml-auto"
              >
                <span>Next: {nextChapter.title}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Right Embedded Interactive Terminal (5 cols) */}
        <div className="lg:col-span-5 h-full flex flex-col overflow-hidden">
          <DockerTerminal
            className="h-full"
            onCommandExecuted={(cmd) => setLastExecutedCommand(cmd)}
          />
        </div>
      </div>

      {/* Quiz Modal */}
      <QuizModal
        chapter={currentChapter}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
      />
    </div>
  );
}
