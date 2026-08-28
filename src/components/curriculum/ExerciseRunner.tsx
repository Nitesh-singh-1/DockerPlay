'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  HelpCircle,
  Key,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Chapter } from '@/types/curriculum';
import { DockerState } from '@/types/docker';
import { ProgressManager } from '@/lib/persistence/ProgressManager';

interface ExerciseRunnerProps {
  chapter: Chapter;
  state: DockerState;
  lastExecutedCommand?: string;
  onOpenQuiz?: () => void;
}

export function ExerciseRunner({
  chapter,
  state,
  lastExecutedCommand,
  onOpenQuiz,
}: ExerciseRunnerProps) {
  const exercise = chapter.exercise;
  if (!exercise) return null;

  const [revealedHints, setRevealedHints] = useState<Record<string, number>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  useEffect(() => {
    const passed: string[] = [];
    for (const step of exercise.steps) {
      const result = step.validator(state, lastExecutedCommand);
      const isOk = typeof result === 'boolean' ? result : result.passed;
      if (isOk) {
        passed.push(step.id);
      }
    }
    setCompletedStepIds(passed);

    if (passed.length === exercise.steps.length && exercise.steps.length > 0 && !hasTriggeredConfetti) {
      setHasTriggeredConfetti(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.65 } });
      ProgressManager.markExerciseCompleted(exercise.id);
      ProgressManager.markChapterCompleted(chapter.id);
    }
  }, [state, lastExecutedCommand, exercise.steps, exercise.id, chapter.id, hasTriggeredConfetti]);

  const isAllComplete = completedStepIds.length === exercise.steps.length && exercise.steps.length > 0;

  const revealNextHint = (stepId: string, maxHints: number) => {
    setRevealedHints((prev) => ({
      ...prev,
      [stepId]: Math.min(maxHints, (prev[stepId] || 0) + 1),
    }));
  };

  const triggerRunCommand = (cmd: string) => {
    window.dispatchEvent(
      new CustomEvent('dockerplay-run-command', { detail: { command: cmd } })
    );
  };

  return (
    <div className="flex flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Interactive Lab
            </span>
            <h4 className="font-bold text-sm text-[var(--text-primary)] font-display">{exercise.title}</h4>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">{exercise.description}</p>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            {completedStepIds.length}/{exercise.steps.length} Steps Done
          </span>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {exercise.steps.map((step, idx) => {
          const isDone = completedStepIds.includes(step.id);
          const currentHintCount = revealedHints[step.id] || 0;
          const showSolution = revealedSolutions[step.id];

          return (
            <div
              key={step.id}
              className={`p-4 rounded-2xl border transition-all ${
                isDone
                  ? 'bg-emerald-500/5 border-emerald-500/30'
                  : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[var(--brand-primary)]/40'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-[var(--text-muted)]" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div>
                    <h5
                      className={`font-bold text-xs font-display ${
                        isDone ? 'text-emerald-700 dark:text-emerald-400' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      Step {idx + 1}: {step.instruction}
                    </h5>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{step.task}</p>
                  </div>

                  {/* 1-Click Fast Run Button */}
                  {!isDone && (
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={() => triggerRunCommand(step.solution)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[var(--brand-light)] hover:brightness-95 text-[var(--brand-primary)] border border-[var(--brand-primary)]/30 text-xs font-mono font-bold transition-all shadow-sm"
                        title="Click to automatically paste and run in terminal"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>⚡ 1-Click Run: {step.solution}</span>
                      </button>
                    </div>
                  )}

                  {/* Hints */}
                  {currentHintCount > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
                      {step.hints.slice(0, currentHintCount).map((hint, hIdx) => (
                        <div key={hIdx} className="flex items-start space-x-2 text-[11px]">
                          <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                          <span><strong>Clue {hIdx + 1}:</strong> {hint}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Solution display */}
                  {showSolution && (
                    <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--brand-primary)]/30 text-xs font-mono space-y-1.5">
                      <span className="text-[var(--text-muted)] text-[10px] uppercase block">Solution:</span>
                      <div className="flex items-center justify-between">
                        <code className="text-[var(--brand-primary)] font-bold">{step.solution}</code>
                        <button
                          onClick={() => triggerRunCommand(step.solution)}
                          className="px-2.5 py-0.5 rounded-lg bg-[var(--brand-primary)] text-white font-bold text-[10.5px] hover:brightness-110 shadow-sm"
                        >
                          Execute
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {!isDone && (
                    <div className="flex items-center space-x-3 pt-1 text-xs">
                      {currentHintCount < step.hints.length && (
                        <button
                          onClick={() => revealNextHint(step.id, step.hints.length)}
                          className="flex items-center space-x-1 text-[var(--text-muted)] hover:text-amber-600 dark:hover:text-amber-300 text-[11px] transition-colors"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Need a Hint? ({currentHintCount}/{step.hints.length})</span>
                        </button>
                      )}

                      {!showSolution && (
                        <button
                          onClick={() =>
                            setRevealedSolutions((prev) => ({ ...prev, [step.id]: true }))
                          }
                          className="flex items-center space-x-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[11px] transition-colors"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Reveal Solution</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      {isAllComplete && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in shadow-sm">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <h5 className="font-bold text-xs text-emerald-800 dark:text-emerald-300 font-display">Lab Completed (+50 XP)!</h5>
              <p className="text-[11px] text-[var(--text-secondary)]">
                You verified your understanding in the live simulator. Now take the chapter quiz!
              </p>
            </div>
          </div>

          {onOpenQuiz && (
            <button
              onClick={onOpenQuiz}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all shrink-0"
            >
              <span>Take Chapter Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
