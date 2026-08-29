'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Terminal as TerminalIcon,
  Play,
  Sparkles,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  List,
} from 'lucide-react';
import { TROUBLESHOOTING_CHALLENGES } from '@/data/troubleshooting';
import { TroubleshootingChallenge } from '@/types/curriculum';
import { getDockerEngine } from '@/lib/simulator/DockerEngine';
import { ProgressManager } from '@/lib/persistence/ProgressManager';
import { DockerTerminal } from '@/components/terminal/DockerTerminal';

export default function BreakFixPage() {
  const [selectedChallenge, setSelectedChallenge] = useState<TroubleshootingChallenge>(
    TROUBLESHOOTING_CHALLENGES[0]
  );
  const [progress, setProgress] = useState(() => ProgressManager.load());
  const [state, setState] = useState(() => getDockerEngine().getState());
  const [isBrokenDeployed, setIsBrokenDeployed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<'scenario' | 'terminal' | 'list'>('scenario');

  useEffect(() => {
    const unsub = getDockerEngine().subscribe((s) => {
      setState(s);
      setProgress(ProgressManager.load());
    });
    return () => unsub();
  }, []);

  const triggerRunCommand = (cmd: string) => {
    window.dispatchEvent(
      new CustomEvent('dockerplay-run-command', { detail: { command: cmd } })
    );
    if (window.innerWidth < 1280) {
      setMobileTab('terminal');
    }
  };

  const handleBreakEnvironment = () => {
    setIsBrokenDeployed(true);
    getDockerEngine().loadPreset(selectedChallenge.setupPreset);
    if (window.innerWidth < 1280) {
      setMobileTab('terminal');
    }
  };

  const isFixed = selectedChallenge.verifyFixed(state);

  return (
    <div className="flex flex-col xl:flex-row h-full w-full overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors select-text">
      {/* Mobile / Tablet Tab Selector Bar */}
      <div className="xl:hidden shrink-0 h-11 bg-[var(--bg-header)] border-b border-[var(--border-color)] px-3 flex items-center justify-between z-30">
        <div className="flex items-center space-x-1 w-full max-w-md mx-auto">
          <button
            onClick={() => setMobileTab('scenario')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mobileTab === 'scenario'
                ? 'bg-[var(--brand-primary)] text-white shadow-sm font-bold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Scenario</span>
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
            onClick={() => setMobileTab('list')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mobileTab === 'list'
                ? 'bg-[var(--brand-primary)] text-white shadow-sm font-bold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Incidents</span>
          </button>
        </div>
      </div>

      {/* 1. LEFT PANE: Scenarios List Sidebar */}
      <aside
        className={`w-full xl:w-68 2xl:w-72 h-full shrink-0 bg-[var(--bg-card)] border-r border-[var(--border-color)] flex flex-col overflow-hidden shadow-sm z-10 ${
          mobileTab === 'list' ? 'flex' : 'hidden xl:flex'
        } ${!isSidebarOpen && 'xl:hidden'}`}
      >
        <div className="p-3.5 border-b border-[var(--border-color)] shrink-0 flex items-center justify-between bg-[var(--bg-header)]">
          <div className="flex items-center space-x-2">
            <Wrench className="w-4 h-4 text-rose-500" />
            <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono">
              Break / Fix Labs
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-mono text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              {progress.completedChallenges.length}/{TROUBLESHOOTING_CHALLENGES.length}
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="hidden xl:block p-1 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="Collapse Incidents List"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {TROUBLESHOOTING_CHALLENGES.map((ch, idx) => {
            const isSelected = selectedChallenge.id === ch.id;
            const isDone = progress.completedChallenges.includes(ch.id);

            return (
              <button
                key={ch.id}
                onClick={() => {
                  setSelectedChallenge(ch);
                  setIsBrokenDeployed(false);
                  setMobileTab('scenario');
                }}
                className={`w-full text-left p-3 rounded-2xl text-xs transition-all flex items-start justify-between ${
                  isSelected
                    ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold border border-rose-500/40 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-transparent'
                }`}
              >
                <div className="space-y-1 truncate pr-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-[var(--bg-card)] text-rose-500 border border-rose-500/20">
                      INC-0{idx + 1}
                    </span>
                    <span className="font-display truncate font-semibold">{ch.title}</span>
                  </div>
                  <div className="text-[10.5px] text-[var(--text-muted)] font-mono truncate">
                    {ch.difficulty}
                  </div>
                </div>
                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 ml-1" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 2. CENTER PANE: Incident Details */}
      <main
        className={`flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[var(--bg-page)] space-y-6 relative ${
          mobileTab === 'scenario' ? 'block' : 'hidden xl:block'
        }`}
      >
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
          {/* Incident Banner */}
          <div className="space-y-2 pb-4 border-b border-[var(--border-color)]">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                🚨 {selectedChallenge.id}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {selectedChallenge.difficulty}
              </span>
              {isFixed && (
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  Resolved ✓
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

          {/* Trigger Failure Action Bar */}
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300 font-display flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Simulate Broken Production State</span>
              </span>
              <p className="text-[11px] text-rose-900/80 dark:text-rose-300/80">
                {selectedChallenge.symptom}
              </p>
            </div>
            <button
              onClick={handleBreakEnvironment}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/30 shrink-0 flex items-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isBrokenDeployed ? 'Re-deploy Broken State' : 'Deploy Broken State'}</span>
            </button>
          </div>

          {/* Diagnostic Clues */}
          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3 shadow-sm">
            <h4 className="font-bold text-xs text-[var(--text-primary)] font-display uppercase tracking-wider">
              Diagnostic Clues & What to Look For:
            </h4>
            <div className="space-y-2 text-xs text-[var(--text-secondary)]">
              {selectedChallenge.hints.map((hint, hIdx) => (
                <div key={hIdx} className="flex items-start space-x-2">
                  <span className="font-bold text-[var(--brand-primary)] font-mono">0{hIdx + 1}.</span>
                  <span className="leading-relaxed">{hint}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Diagnostic Commands */}
          {selectedChallenge.suggestedCommands && (
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3 shadow-sm">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block font-bold">
                1-Click Diagnostic Commands:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedChallenge.suggestedCommands.map((cmd, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => triggerRunCommand(cmd)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[var(--brand-light)] text-[var(--brand-primary)] border border-[var(--brand-primary)]/30 hover:brightness-95 text-xs font-mono font-semibold transition-all shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{cmd}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Solution Explanation */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-sm text-xs">
            <h4 className="font-bold text-xs text-[var(--text-primary)] font-display uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Root Cause & Solution Summary:</span>
            </h4>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {selectedChallenge.solutionExplanation}
            </p>
          </div>
        </div>

        {/* Mobile Floating Quick Terminal Button */}
        <div className="xl:hidden fixed bottom-4 right-4 z-30">
          <button
            onClick={() => setMobileTab('terminal')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-rose-600 text-white font-bold text-xs shadow-xl shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all"
          >
            <TerminalIcon className="w-4 h-4" />
            <span>Open Terminal ($)</span>
          </button>
        </div>
      </main>

      {/* 3. RIGHT PANE: Interactive Terminal */}
      <section
        className={`w-full xl:w-[460px] 2xl:w-[520px] h-full shrink-0 bg-[var(--bg-card)] border-l border-[var(--border-color)] flex flex-col overflow-hidden shadow-2xl z-10 ${
          mobileTab === 'terminal' ? 'flex' : 'hidden xl:flex'
        } ${!isTerminalOpen && 'xl:hidden'}`}
      >
        <div className="p-2 sm:p-2.5 h-full w-full flex flex-col overflow-hidden">
          <DockerTerminal className="h-full w-full" />
        </div>
      </section>
    </div>
  );
}
