'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Terminal as TerminalIcon,
  List,
} from 'lucide-react';
import { CURRICULUM_CHAPTERS } from '@/data/curriculum';
import { getDockerEngine } from '@/lib/simulator/DockerEngine';
import { DockerState } from '@/types/docker';
import { DockerTerminal } from '@/components/terminal/DockerTerminal';
import { ExerciseRunner } from '@/components/curriculum/ExerciseRunner';
import { QuizModal } from '@/components/curriculum/QuizModal';
import { ProgressManager } from '@/lib/persistence/ProgressManager';
import { AdBanner } from '@/components/ads/AdBanner';

interface ChapterViewProps {
  chapterId: string;
}

export function ChapterView({ chapterId }: ChapterViewProps) {
  const currentChapter =
    CURRICULUM_CHAPTERS.find((c) => c.slug === chapterId || c.id === chapterId) ||
    CURRICULUM_CHAPTERS[0];

  const [engine] = useState(() => getDockerEngine());
  const [state, setState] = useState<DockerState>(() => engine.getState());
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [lastExecutedCommand, setLastExecutedCommand] = useState<string>('');
  const [progress, setProgress] = useState(() => ProgressManager.load());

  // Desktop panels collapse state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

  // Mobile view mode: 'lesson' | 'terminal' | 'chapters'
  const [mobileTab, setMobileTab] = useState<'lesson' | 'terminal' | 'chapters'>('lesson');

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
    // On mobile, auto-switch to terminal view if running a command
    if (window.innerWidth < 1024) {
      setMobileTab('terminal');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors select-text">
      {/* Mobile / Tablet Tab Selector Bar (Visible < lg) */}
      <div className="lg:hidden shrink-0 h-11 bg-[var(--bg-header)] border-b border-[var(--border-color)] px-3 flex items-center justify-between z-30">
        <div className="flex items-center space-x-1 w-full max-w-md mx-auto">
          <button
            onClick={() => setMobileTab('lesson')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mobileTab === 'lesson'
                ? 'bg-[var(--brand-primary)] text-white shadow-sm font-bold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lesson</span>
          </button>

          <button
            onClick={() => setMobileTab('terminal')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mobileTab === 'terminal'
                ? 'bg-[var(--brand-primary)] text-white shadow-sm font-bold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => setMobileTab('chapters')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mobileTab === 'chapters'
                ? 'bg-[var(--brand-primary)] text-white shadow-sm font-bold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Roadmap</span>
          </button>
        </div>
      </div>

      {/* 1. LEFT PANE: Sticky / Pinned Curriculum Road Sidebar */}
      <aside
        className={`w-full lg:w-56 xl:w-64 2xl:w-72 h-full shrink-0 bg-[var(--bg-card)] border-r border-[var(--border-color)] flex flex-col overflow-hidden shadow-sm z-10 ${
          mobileTab === 'chapters' ? 'flex' : 'hidden lg:flex'
        } ${!isSidebarOpen && 'lg:hidden'}`}
      >
        <div className="p-3 border-b border-[var(--border-color)] shrink-0 flex items-center justify-between bg-[var(--bg-header)]">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-[var(--brand-primary)]" />
            <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono">
              Curriculum
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-mono text-[var(--brand-primary)] font-bold bg-[var(--brand-light)] px-2 py-0.5 rounded-full">
              {progress.completedChapters.length}/{CURRICULUM_CHAPTERS.length}
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="hidden lg:block p-1 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {CURRICULUM_CHAPTERS.map((ch) => {
            const isSelected = ch.id === currentChapter.id;
            const isDone = progress.completedChapters.includes(ch.id);

            return (
              <Link
                key={ch.id}
                href={`/curriculum/${ch.slug}`}
                onClick={() => setMobileTab('lesson')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                  isSelected
                    ? 'bg-[var(--brand-light)] text-[var(--brand-primary)] font-bold border border-[var(--brand-primary)]/40 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className="w-5 h-5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[10px] font-mono flex items-center justify-center text-[var(--text-muted)] shrink-0 font-bold">
                    {ch.order}
                  </span>
                  <span className="truncate font-medium">{ch.title}</span>
                </div>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Collapsed Sidebar Toggle (Desktop Only) */}
      {!isSidebarOpen && (
        <div className="hidden lg:flex shrink-0 h-full border-r border-[var(--border-color)] bg-[var(--bg-card)] p-1.5 flex-col items-center">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors"
            title="Open Chapters Sidebar"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* 2. CENTER PANE: The Reading Column (Only area that scrolls) */}
      <main
        className={`flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 lg:p-6 xl:p-8 bg-[var(--bg-page)] space-y-6 relative ${
          mobileTab === 'lesson' ? 'block' : 'hidden lg:block'
        }`}
      >
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
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
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-sm">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>What You Will Master:</span>
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
              {currentChapter.learningObjectives.map((obj, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chapter Core Reading Sections */}
          <div className="space-y-6 text-sm text-[var(--text-primary)] leading-relaxed">
            {currentChapter.sections.map((sec, idx) => (
              <section
                key={idx}
                className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-3 transition-colors"
              >
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] font-display flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-[var(--brand-light)] text-[var(--brand-primary)] text-xs flex items-center justify-center font-mono font-bold">
                    {idx + 1}
                  </span>
                  <span>{sec.title}</span>
                </h2>

                <div className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed space-y-3 whitespace-pre-line">
                  {sec.content}
                </div>

                {sec.terminalSnippet && (
                  <div className="relative mt-3 rounded-xl overflow-hidden border border-[var(--border-color)] bg-slate-950 font-mono text-xs shadow-inner">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/80 border-b border-white/10 text-[10px] text-slate-400">
                      <span className="uppercase">bash</span>
                      <button
                        onClick={() => triggerRunCommand(sec.terminalSnippet!)}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[var(--brand-primary)] text-white hover:brightness-110 font-bold transition-all text-[10px]"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Run in Terminal ➔</span>
                      </button>
                    </div>
                    <pre className="p-3 text-slate-200 overflow-x-auto selection:bg-[var(--brand-primary)]/30">
                      {sec.terminalSnippet}
                    </pre>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Interactive Guided Hands-on Exercise */}
          {currentChapter.exercise && (
            <ExerciseRunner
              chapter={currentChapter}
              state={state}
              lastExecutedCommand={lastExecutedCommand}
              onOpenQuiz={() => setIsQuizOpen(true)}
            />
          )}

          {/* Knowledge Check / Quiz Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[var(--brand-primary)]/10 via-[var(--brand-accent)]/10 to-transparent border border-[var(--brand-primary)]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <HelpCircle className="w-4 h-4 text-[var(--brand-primary)]" />
                <h3 className="font-bold text-sm text-[var(--text-primary)] font-display">
                  Chapter Knowledge Quiz
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Pass the 3-question assessment to earn +50 XP and complete this chapter.
              </p>
            </div>

            <button
              onClick={() => setIsQuizOpen(true)}
              className="px-4 py-2 rounded-xl bg-[var(--brand-primary)] text-white font-bold text-xs hover:brightness-110 transition-all shadow-md shadow-[var(--brand-primary)]/20 shrink-0"
            >
              {quizScore ? 'Retake Quiz' : 'Start Quiz'}
            </button>
          </div>

          {/* Non-intrusive Ad Placement */}
          <AdBanner slotId="1234567890" label="Sponsor & Resources" className="my-3" />

          {/* Prev / Next Chapter Navigation */}
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

        {/* Mobile Floating Quick Terminal Button */}
        <div className="lg:hidden fixed bottom-4 right-4 z-30">
          <button
            onClick={() => setMobileTab('terminal')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-[var(--brand-primary)] text-white font-bold text-xs shadow-xl shadow-[var(--brand-primary)]/30 hover:scale-105 active:scale-95 transition-all"
          >
            <TerminalIcon className="w-4 h-4" />
            <span>Open Terminal ($)</span>
          </button>
        </div>
      </main>

      {/* 3. RIGHT PANE: Interactive Terminal (Desktop side-by-side / Mobile Full view) */}
      <section
        className={`w-full lg:w-[380px] xl:w-[440px] 2xl:w-[500px] h-full shrink-0 bg-[var(--bg-card)] border-l border-[var(--border-color)] flex flex-col overflow-hidden shadow-2xl z-10 ${
          mobileTab === 'terminal' ? 'flex' : 'hidden lg:flex'
        } ${!isTerminalOpen && 'lg:hidden'}`}
      >
        <div className="p-2 sm:p-2.5 h-full min-h-0 w-full flex flex-col overflow-hidden">
          <div className="hidden lg:flex items-center justify-between px-2 pb-1.5 text-[11px] text-[var(--text-muted)] font-mono">
            <span className="flex items-center space-x-1.5">
              <TerminalIcon className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span className="font-bold text-[var(--text-primary)]">Interactive CLI</span>
            </span>
            <button
              onClick={() => setIsTerminalOpen(false)}
              className="p-1 rounded hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="Collapse Terminal"
            >
              <PanelRightClose className="w-3.5 h-3.5" />
            </button>
          </div>
          <DockerTerminal
            className="h-full w-full min-h-0"
            onCommandExecuted={(cmd) => setLastExecutedCommand(cmd)}
          />
        </div>
      </section>

      {/* Collapsed Terminal Toggle (Desktop Only) */}
      {!isTerminalOpen && (
        <div className="hidden lg:flex shrink-0 h-full border-l border-[var(--border-color)] bg-[var(--bg-card)] p-1.5 flex-col items-center">
          <button
            onClick={() => setIsTerminalOpen(true)}
            className="p-2 rounded-xl hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors"
            title="Open Interactive Terminal"
          >
            <PanelRightOpen className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Chapter MCQ Quiz Modal */}
      <QuizModal
        chapter={currentChapter}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
      />
    </div>
  );
}
