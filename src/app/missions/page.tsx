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
  ChevronDown,
  ChevronUp,
  Terminal,
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
  const [isMobileTerminalExpanded, setIsMobileTerminalExpanded] = useState(true);

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
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] bg-[var(--bg-page)] overflow-hidden transition-colors">
      {/* Left Mission Rail */}
      <aside className="w-full lg:w-72 xl:w-80 bg-[var(--bg-card)] border-r border-[var(--border-color)] flex flex-col shrink-0 overflow-y-auto shadow-sm max-h-48 lg:max-h-full">
        <div className="p-3.5 border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono flex items-center space-x-2">
              <Target className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>Docker Quests & Missions</span>
            </h2>
            <span className="text-[10px] font-mono text-[var(--brand-primary)] font-bold">
              {progress.completedMissions.length}/{DOCKER_MISSIONS.length} Solved
            </span>
          </div>
        </div>

        <nav className="p-2 space-y-1.5 overflow-y-auto">
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
                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Mission Objectives (Independently Scrollable) */}
      <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-24 lg:pb-8">
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
          <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-2 shadow-sm">
            <h4 className="font-bold text-xs text-[var(--brand-primary)] uppercase tracking-wider font-mono flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5" />
              <span>Mission Goal</span>
            </h4>
            <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
              {selectedMission.tagline}
            </p>
          </div>

          {/* Specific Objectives */}
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

          {/* Quick Help Hints */}
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

          {/* 1-Click Solution Steps */}
          {selectedMission.solutionSteps && selectedMission.solutionSteps.length > 0 && (
            <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-2 shadow-sm">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block font-bold">
                1-Click Quick Execution Steps:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedMission.solutionSteps.map((step, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => triggerRunCommand(step)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] text-[var(--brand-primary)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] text-xs font-mono font-semibold transition-all shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{step}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reward Pill */}
          <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-between shadow-sm">
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
            <Terminal className="w-4 h-4 text-[var(--brand-primary)]" />
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
