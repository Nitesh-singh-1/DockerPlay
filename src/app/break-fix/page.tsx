'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  Terminal,
} from 'lucide-react';
import { TROUBLESHOOTING_CHALLENGES, getScenarioPresetState } from '@/data/troubleshooting';
import { TroubleshootingChallenge } from '@/types/curriculum';
import { getDockerEngine } from '@/lib/simulator/DockerEngine';
import { DockerTerminal } from '@/components/terminal/DockerTerminal';
import { ProgressManager } from '@/lib/persistence/ProgressManager';
import { UserProgress } from '@/types/progress';

export default function BreakFixPage() {
  const [progress, setProgress] = useState<UserProgress>(ProgressManager.load());
  const [selectedChallenge, setSelectedChallenge] = useState<TroubleshootingChallenge>(
    TROUBLESHOOTING_CHALLENGES[0]
  );
  const [isBrokenApplied, setIsBrokenApplied] = useState(false);
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [isSolved, setIsSolved] = useState(false);
  const [isMobileTerminalExpanded, setIsMobileTerminalExpanded] = useState(true);

  useEffect(() => {
    const unsub = getDockerEngine().subscribe((s) => {
      setProgress(ProgressManager.load());
      if (selectedChallenge) {
        const solved = selectedChallenge.verifyFixed(s);
        if (solved && isBrokenApplied) {
          setIsSolved(true);
          ProgressManager.markChallengeCompleted(selectedChallenge.id);
        }
      }
    });
    return () => unsub();
  }, [selectedChallenge, isBrokenApplied]);

  const handleApplyBrokenState = () => {
    const preset = getScenarioPresetState(selectedChallenge.setupPreset);
    getDockerEngine().reset(preset);
    setIsBrokenApplied(true);
    setIsSolved(false);
    setRevealedHints(0);
  };

  const triggerRunCommand = (cmd: string) => {
    window.dispatchEvent(
      new CustomEvent('dockerplay-run-command', { detail: { command: cmd } })
    );
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] bg-[var(--bg-page)] overflow-hidden transition-colors">
      {/* Left Challenge Rail */}
      <aside className="w-full lg:w-72 xl:w-80 bg-[var(--bg-card)] border-r border-[var(--border-color)] flex flex-col shrink-0 overflow-y-auto shadow-sm max-h-48 lg:max-h-full">
        <div className="p-3.5 border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono flex items-center space-x-2">
              <Wrench className="w-3.5 h-3.5 text-rose-500" />
              <span>Break/Fix Sandbox</span>
            </h2>
            <span className="text-[10px] font-mono text-rose-500 font-bold">
              {progress.completedChallenges.length}/{TROUBLESHOOTING_CHALLENGES.length} Solved
            </span>
          </div>
        </div>

        <nav className="p-2 space-y-1.5 overflow-y-auto">
          {TROUBLESHOOTING_CHALLENGES.map((ch) => {
            const isSelected = selectedChallenge.id === ch.id;
            const isDone = progress.completedChallenges.includes(ch.id);

            return (
              <button
                key={ch.id}
                onClick={() => {
                  setSelectedChallenge(ch);
                  setIsBrokenApplied(false);
                  setIsSolved(false);
                  setRevealedHints(0);
                }}
                className={`w-full text-left p-3 rounded-2xl text-xs transition-all flex items-start justify-between ${
                  isSelected
                    ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold border border-rose-500/30 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-transparent'
                }`}
              >
                <div className="space-y-1 truncate pr-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)]">
                      {ch.difficulty}
                    </span>
                    <span className="font-display truncate font-semibold">{ch.title}</span>
                  </div>
                  <div className="text-[10.5px] text-[var(--text-muted)] font-mono truncate">
                    Preset: {ch.setupPreset}
                  </div>
                </div>
                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Sandbox Details (Independently Scrollable) */}
      <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-24 lg:pb-8">
          {/* Header */}
          <div className="space-y-2 pb-4 border-b border-[var(--border-color)]">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                Break/Fix Incident • {selectedChallenge.difficulty}
              </span>
              {isSolved && (
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  Bug Fixed & Verified ✓
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display">
              {selectedChallenge.title}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {selectedChallenge.scenarioDescription}
            </p>
          </div>

          {/* Action Trigger Card */}
          <div className="p-5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="font-bold text-xs text-[var(--text-primary)] font-display block">
                {isBrokenApplied ? '🔥 Broken Environment Active' : 'Ready to diagnose incident'}
              </span>
              <p className="text-[11px] text-[var(--text-muted)]">
                {isBrokenApplied
                  ? 'Inspect container status with `docker ps -a` and check logs with `docker logs`.'
                  : 'Click below to inject the broken state into your simulated Docker daemon.'}
              </p>
            </div>

            <button
              onClick={handleApplyBrokenState}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/25 shrink-0 flex items-center space-x-2"
            >
              <Wrench className="w-4 h-4" />
              <span>{isBrokenApplied ? 'Reset & Re-Inject Bug' : 'Inject Broken Scenario'}</span>
            </button>
          </div>

          {/* Symptom Box */}
          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
            <h4 className="font-bold text-xs text-rose-600 dark:text-rose-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Observed Incident Symptom</span>
            </h4>
            <p className="text-xs text-[var(--text-primary)] leading-relaxed font-sans">
              {selectedChallenge.symptom}
            </p>
          </div>

          {/* Diagnostic Hints */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-[var(--text-primary)] uppercase tracking-wider font-display">
                Diagnostic Hints ({revealedHints}/{selectedChallenge.hints.length})
              </h4>
              {revealedHints < selectedChallenge.hints.length && (
                <button
                  onClick={() => setRevealedHints((prev) => prev + 1)}
                  className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center space-x-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Reveal Next Hint</span>
                </button>
              )}
            </div>

            {revealedHints === 0 ? (
              <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] italic text-center shadow-sm">
                Try diagnosing with commands first (e.g. <code>docker ps -a</code>, <code>docker logs</code>). Reveal hints if stuck!
              </div>
            ) : (
              <div className="space-y-2">
                {selectedChallenge.hints.slice(0, revealedHints).map((hint, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-2 text-xs text-amber-900 dark:text-amber-200"
                  >
                    <ChevronRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Hint {idx + 1}:</strong> {hint}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggested commands */}
          {selectedChallenge.suggestedCommands.length > 0 && (
            <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-2 shadow-sm">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block font-bold">
                Suggested Diagnostic Commands:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedChallenge.suggestedCommands.map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => triggerRunCommand(cmd)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] text-[var(--brand-primary)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] text-xs font-mono font-semibold transition-all shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{cmd}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Success Banner */}
          {isSolved && (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4 shadow-lg animate-in fade-in">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-emerald-700 dark:text-emerald-300 font-display">
                    Bug Solved (+120 XP)!
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {selectedChallenge.solutionExplanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sticky Right Terminal */}
      <section
        className={`w-full lg:w-[460px] xl:w-[520px] shrink-0 flex flex-col bg-[var(--bg-card)] border-t lg:border-t-0 lg:border-l border-[var(--border-color)] transition-all z-30 shadow-xl ${
          isMobileTerminalExpanded ? 'h-80 lg:h-full' : 'h-11 lg:h-full'
        }`}
      >
        <div
          className="lg:hidden flex items-center justify-between px-4 py-2.5 bg-[var(--bg-header)] border-b border-[var(--border-color)] cursor-pointer select-none"
          onClick={() => setIsMobileTerminalExpanded(!isMobileTerminalExpanded)}
        >
          <div className="flex items-center space-x-2 text-xs font-bold text-[var(--text-primary)] font-display">
            <Terminal className="w-4 h-4 text-rose-500" />
            <span>Interactive Docker Terminal (Sticky)</span>
          </div>
          <button className="p-1 text-[var(--text-muted)]">
            {isMobileTerminalExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden p-2 lg:p-2.5">
          <DockerTerminal className="h-full" />
        </div>
      </section>
    </div>
  );
}
