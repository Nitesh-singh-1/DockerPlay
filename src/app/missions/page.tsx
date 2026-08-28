'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Target,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Award,
  Zap,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { DOCKER_MISSIONS } from '@/data/missions';
import { Mission } from '@/types/curriculum';
import { ProgressManager } from '@/lib/persistence/ProgressManager';
import { UserProgress } from '@/types/progress';
import { getDockerEngine } from '@/lib/simulator/DockerEngine';
import { DockerTerminal } from '@/components/terminal/DockerTerminal';

export default function MissionsPage() {
  const [progress, setProgress] = useState<UserProgress>(ProgressManager.load());
  const [selectedMission, setSelectedMission] = useState<Mission>(DOCKER_MISSIONS[0]);
  const [state, setState] = useState(() => getDockerEngine().getState());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

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
  };

  return (
    <div className="flex flex-row h-full w-full overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors select-text">
      {/* 1. LEFT PANE: Mission List Sidebar (Pinned) */}
      {isSidebarOpen ? (
        <aside className="w-56 sm:w-64 lg:w-72 h-full shrink-0 bg-[var(--bg-card)] border-r border-[var(--border-color)] flex flex-col overflow-hidden shadow-sm z-10">
          <div className="p-3.5 border-b border-[var(--border-color)] shrink-0 flex items-center justify-between bg-[var(--bg-header)]">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-[var(--brand-primary)]" />
              <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono">
                Docker Quests
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-mono text-[var(--brand-primary)] font-bold bg-[var(--brand-light)] px-2 py-0.5 rounded-full">
                {progress.completedMissions.length}/{DOCKER_MISSIONS.length}
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                title="Collapse Quests List"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {DOCKER_MISSIONS.map((m) => {
              const isSelected = selectedMission.id === m.id;
              const isDone = progress.completedMissions.includes(m.id);

              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMission(m)}
                  className={`w-full text-left p-3 rounded-2xl text-xs transition-all flex items-start justify-between ${
                    isSelected
                      ? 'bg-[var(--brand-light)] text-[var(--brand-primary)] font-bold border border-[var(--brand-primary)]/40 shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-transparent'
                  }`}
                >
                  <div className="space-y-1 truncate pr-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)]">
                        M{m.number}
                      </span>
                      <span className="font-display truncate font-semibold">{m.title}</span>
                    </div>
                    <div className="text-[10.5px] text-[var(--text-muted)] font-mono truncate">
                      Reward: {m.rewardBadge}
                    </div>
                  </div>
                  {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 ml-1" />}
                </button>
              );
            })}
          </nav>
        </aside>
      ) : (
        <div className="shrink-0 h-full border-r border-[var(--border-color)] bg-[var(--bg-card)] p-2 flex flex-col items-center">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors"
            title="Open Quests List"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* 2. CENTER PANE: Mission Description & Objectives (Only Part That Scrolls) */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[var(--bg-page)] space-y-6">
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
          {/* Mission Header */}
          <div className="space-y-2 pb-4 border-b border-[var(--border-color)]">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[var(--brand-light)] text-[var(--brand-primary)] border border-[var(--brand-primary)]/20">
                Mission 0{selectedMission.number}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display">
              {selectedMission.title}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {selectedMission.scenario}
            </p>
          </div>

          {/* Target Goal */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-sm">
            <h4 className="font-bold text-xs text-[var(--brand-primary)] uppercase tracking-wider font-mono flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5" />
              <span>Mission Goal</span>
            </h4>
            <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
              {selectedMission.tagline}
            </p>
          </div>

          {/* Objectives Checklist */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-[var(--text-primary)] font-display uppercase tracking-wider">
              Verification Criteria Checklist:
            </h4>
            <div className="space-y-2">
              {selectedMission.objectives.map((obj, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-start space-x-2.5 text-xs shadow-sm"
                >
                  <ChevronRight className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                  <span className="text-[var(--text-primary)] leading-relaxed">{obj.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Intel / Hints */}
          {selectedMission.hints.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
              <h5 className="font-bold text-amber-700 dark:text-amber-400 font-display flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>DevOps Intel & Hints:</span>
              </h5>
              <div className="space-y-1.5 text-amber-900 dark:text-amber-200">
                {selectedMission.hints.map((hint, hIdx) => (
                  <div key={hIdx} className="flex items-start space-x-2 text-[11.5px]">
                    <span className="font-bold shrink-0">{hIdx + 1}.</span>
                    <span>{hint}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1-Click Solution Commands */}
          {selectedMission.solutionSteps && selectedMission.solutionSteps.length > 0 && (
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-sm">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block font-bold">
                1-Click Quick Execution Steps:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedMission.solutionSteps.map((step, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => triggerRunCommand(step)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[var(--brand-light)] text-[var(--brand-primary)] border border-[var(--brand-primary)]/30 hover:brightness-95 text-xs font-mono font-semibold transition-all shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{step}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reward Pill */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 font-bold flex items-center justify-center shadow-md">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block">Mission Reward</span>
                <span className="font-bold text-xs text-[var(--text-primary)] font-display">{selectedMission.rewardBadge}</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--brand-primary)] bg-[var(--brand-light)] px-3 py-1 rounded-xl border border-[var(--brand-primary)]/20">
              +150 XP
            </span>
          </div>
        </div>
      </main>

      {/* 3. RIGHT PANE: Permanently Pinned Terminal */}
      {isTerminalOpen ? (
        <section className="w-80 sm:w-96 md:w-[420px] lg:w-[460px] xl:w-[500px] 2xl:w-[540px] h-full shrink-0 bg-[var(--bg-card)] border-l border-[var(--border-color)] flex flex-col overflow-hidden shadow-2xl z-10">
          <div className="p-2 sm:p-2.5 h-full w-full flex flex-col overflow-hidden">
            <DockerTerminal className="h-full w-full" />
          </div>
        </section>
      ) : (
        <div className="shrink-0 h-full border-l border-[var(--border-color)] bg-[var(--bg-card)] p-2 flex flex-col items-center">
          <button
            onClick={() => setIsTerminalOpen(true)}
            className="p-2 rounded-xl hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors"
            title="Open Interactive Terminal"
          >
            <PanelRightOpen className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
