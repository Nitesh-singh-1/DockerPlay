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
    if (window.innerWidth < 1280) {
      setMobileTab('terminal');
    }
  };

  return (
    <div className="flex flex-col xl:flex-row h-full w-full overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors select-text">
      {/* Mobile / Tablet Tab Selector Bar (Visible < xl) */}
      <div className="xl:hidden shrink-0 h-11 bg-[var(--bg-header)] border-b border-[var(--border-color)] px-3 flex items-center justify-between z-30">
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
        className={`w-full xl:w-68 2xl:w-72 h-full shrink-0 bg-[var(--bg-card)] border-r border-[var(--border-color)] flex flex-col overflow-hidden shadow-sm z-10 ${
          mobileTab === 'chapters' ? 'flex' : 'hidden xl:flex'
        } ${!isSidebarOpen && 'xl:hidden'}`}
      >
        <div className="p-3.5 border-b border-[var(--border-color)] shrink-0 flex items-center justify-between bg-[var(--bg-header)]">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-[var(--brand-primary)]" />
            <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono">
              Curriculum Road
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-mono text-[var(--brand-primary)] font-bold bg-[var(--brand-light)] px-2 py-0.5 rounded-full">
              {progress.completedChapters.length}/{CURRICULUM_CHAPTERS.length}
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="hidden xl:block p-1 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
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
        <div className="hidden xl:flex shrink-0 h-full border-r border-[var(--border-color)] bg-[var(--bg-card)] p-2 flex-col items-center">
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
        className={`flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[var(--bg-page)] space-y-6 relative ${
          mobileTab === 'lesson' ? 'block' : 'hidden xl:block'
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
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2.5 shadow-sm">
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
              <div
                key={sec.id}
                className="space-y-3 p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm"
              >
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
                      className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[var(--brand-light)] hover:brightness-95 text-[var(--brand-primary)] border border-[var(--brand-primary)]/30 text-xs font-mono font-bold transition-all shadow-sm group"
                    >
                      <Zap className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      <span>⚡ 1-Click Run in Terminal: {sec.terminalSnippet}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Interactive Guided Lab Exercise */}
          {currentChapter.exercise && (
            <ExerciseRunner
              chapter={currentChapter}
              state={state}
              lastExecutedCommand={lastExecutedCommand}
              onOpenQuiz={() => setIsQuizOpen(true)}
            />
          )}

          {/* Chapter Quiz Card */}
          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between gap-4 shadow-sm">
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
        <div className="xl:hidden fixed bottom-4 right-4 z-30">
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
        className={`w-full xl:w-[460px] 2xl:w-[520px] h-full shrink-0 bg-[var(--bg-card)] border-l border-[var(--border-color)] flex flex-col overflow-hidden shadow-2xl z-10 ${
          mobileTab === 'terminal' ? 'flex' : 'hidden xl:flex'
        } ${!isTerminalOpen && 'xl:hidden'}`}
      >
        <div className="p-2 sm:p-2.5 h-full w-full flex flex-col overflow-hidden">
          <DockerTerminal
            className="h-full w-full"
            onCommandExecuted={(cmd) => setLastExecutedCommand(cmd)}
          />
        </div>
      </section>

      {/* Collapsed Terminal Toggle (Desktop Only) */}
      {!isTerminalOpen && (
        <div className="hidden xl:flex shrink-0 h-full border-l border-[var(--border-color)] bg-[var(--bg-card)] p-2 flex-col items-center">
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
