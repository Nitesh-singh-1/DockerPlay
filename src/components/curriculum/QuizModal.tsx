'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  RotateCcw,
  X,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Chapter } from '@/types/curriculum';
import { ProgressManager } from '@/lib/persistence/ProgressManager';

interface QuizModalProps {
  chapter: Chapter;
  isOpen: boolean;
  onClose: () => void;
}

export function QuizModal({ chapter, isOpen, onClose }: QuizModalProps) {
  const quiz = chapter.quiz;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentQ = quiz.questions[currentIdx];
  const totalQuestions = quiz.questions.length;

  const handleSelectOption = (qId: string, optId: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleFinish = () => {
    setIsSubmitted(true);
    let correctCount = 0;
    for (const q of quiz.questions) {
      const selected = selectedAnswers[q.id];
      const opt = q.options.find((o) => o.id === selected);
      if (opt?.isCorrect) correctCount++;
    }
    const scorePct = Math.round((correctCount / totalQuestions) * 100);
    ProgressManager.recordQuizScore(chapter.id, scorePct);

    if (scorePct >= quiz.passingScore) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const calculateScore = () => {
    let correct = 0;
    for (const q of quiz.questions) {
      const selected = selectedAnswers[q.id];
      const opt = q.options.find((o) => o.id === selected);
      if (opt?.isCorrect) correct++;
    }
    return Math.round((correct / totalQuestions) * 100);
  };

  const score = isSubmitted ? calculateScore() : 0;
  const isPassed = score >= quiz.passingScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Quiz Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[var(--bg-header)] border-b border-[var(--border-color)]">
          <div className="flex items-center space-x-2.5">
            <HelpCircle className="w-5 h-5 text-[var(--brand-primary)]" />
            <div>
              <h3 className="font-bold text-sm text-[var(--text-primary)] font-display">{quiz.title}</h3>
              <span className="text-[11px] text-[var(--text-muted)] font-mono">
                Passing Score: {quiz.passingScore}%
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!isSubmitted ? (
            <div>
              {/* Question Navigation Pill Strip */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-color)] text-xs">
                <span className="text-[var(--text-secondary)]">
                  Question <strong className="text-[var(--text-primary)]">{currentIdx + 1}</strong> of {totalQuestions}
                </span>
                <div className="flex space-x-1.5">
                  {quiz.questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-6 h-6 rounded-lg text-xs font-mono font-bold transition-all ${
                        currentIdx === idx
                          ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                          : selectedAnswers[q.id]
                          ? 'bg-[var(--brand-light)] text-[var(--brand-primary)] border border-[var(--brand-primary)]/30'
                          : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Question */}
              <div className="space-y-4">
                <h4 className="text-base font-bold text-[var(--text-primary)] font-display leading-snug">
                  {currentQ.question}
                </h4>

                {currentQ.codeSnippet && (
                  <pre className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-primary)] overflow-x-auto">
                    {currentQ.codeSnippet}
                  </pre>
                )}

                {/* Options List */}
                <div className="space-y-2.5">
                  {currentQ.options.map((opt) => {
                    const isSelected = selectedAnswers[currentQ.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(currentQ.id, opt.id)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-[var(--brand-light)] border-[var(--brand-primary)] text-[var(--brand-primary)] font-semibold shadow-sm'
                            : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[var(--brand-primary)]/40 hover:bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                        }`}
                      >
                        <span className="leading-relaxed">{opt.text}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                            isSelected
                              ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white'
                              : 'border-[var(--border-color)] bg-[var(--bg-subtle)]'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="space-y-6 animate-in fade-in">
              <div
                className={`p-6 rounded-2xl border text-center space-y-2 ${
                  isPassed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] mx-auto flex items-center justify-center shadow-sm">
                  {isPassed ? (
                    <Award className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-500" />
                  )}
                </div>
                <h4 className="text-xl font-bold font-display">
                  {isPassed ? 'Congratulations! Quiz Passed' : 'Quiz Not Passed'}
                </h4>
                <div className="text-3xl font-extrabold font-mono text-[var(--text-primary)]">
                  {score}%
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  {isPassed
                    ? `You demonstrated solid Docker knowledge! +${score} XP awarded.`
                    : `You need ${quiz.passingScore}% to pass. Review the chapter explanations below and try again.`}
                </p>
              </div>

              {/* Review Questions Breakdown */}
              <div className="space-y-4">
                <h5 className="font-bold text-xs text-[var(--text-primary)] font-display uppercase tracking-wider">
                  Detailed Answer Review:
                </h5>

                {quiz.questions.map((q, idx) => {
                  const userOptId = selectedAnswers[q.id];
                  const userOpt = q.options.find((o) => o.id === userOptId);
                  const correctOpt = q.options.find((o) => o.isCorrect);
                  const isCorrect = userOpt?.isCorrect;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-2 text-xs"
                    >
                      <div className="flex items-start space-x-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        )}
                        <span className="font-bold text-[var(--text-primary)]">
                          {idx + 1}. {q.question}
                        </span>
                      </div>

                      <div className="pl-6 space-y-1 text-[11.5px]">
                        <div>
                          <span className="text-[var(--text-muted)]">Your Answer: </span>
                          <span
                            className={
                              isCorrect
                                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                : 'text-rose-600 dark:text-rose-400 font-semibold'
                            }
                          >
                            {userOpt?.text || 'None selected'}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div>
                            <span className="text-[var(--text-muted)]">Correct Answer: </span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              {correctOpt?.text}
                            </span>
                          </div>
                        )}
                        <p className="text-[11px] text-[var(--text-secondary)] italic pt-1 border-t border-[var(--border-color)]">
                          💡 <strong>Concept Key:</strong> {q.conceptExplanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-[var(--bg-header)] border-t border-[var(--border-color)] flex items-center justify-between">
          {!isSubmitted ? (
            <>
              <button
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="px-3.5 py-1.5 rounded-xl border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40"
              >
                Previous
              </button>

              {currentIdx < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentIdx((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="px-4 py-1.5 rounded-xl bg-[var(--brand-primary)] text-white font-bold text-xs hover:brightness-110 shadow-sm"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="px-5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                >
                  Submit Quiz
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setIsSubmitted(false);
                  setCurrentIdx(0);
                }}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-1.5 rounded-xl bg-[var(--brand-primary)] text-white font-bold text-xs hover:brightness-110 shadow-sm"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
