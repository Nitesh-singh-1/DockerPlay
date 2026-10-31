'use client';

import React from 'react';
import Link from 'next/link';
import {
  Terminal,
  Layers,
  Network,
  Wrench,
  Target,
  ArrowRight,
  ShieldCheck,
  Zap,
  Box,
  Flame,
  Globe,
  Github,
  Code2,
  FileCode,
  CheckCircle2,
  Cpu,
  BookOpen,
} from 'lucide-react';
import { CURRICULUM_CHAPTERS } from '@/data/curriculum';

export default function LandingPage() {
  const chapters = CURRICULUM_CHAPTERS.slice(0, 6);

  return (
    <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-6">
        {/* Safety Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[var(--brand-light)] border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] text-xs font-mono font-bold shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[var(--brand-primary)]" />
          <span>Zero Docker Desktop Required • In-Browser Interactive Engine</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Learn Docker with a visual,{' '}
          <span className="text-[var(--brand-primary)]">interactive playground.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          Inspired by the tactile clarity of LearnGitBranching. Run real container commands, bridge virtual networks, build immutable image layers, and solve break-fix puzzles — entirely in your browser.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/playground/"
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-[var(--brand-primary)] text-slate-950 font-bold text-sm shadow-md shadow-[var(--brand-primary)]/20 hover:brightness-110 transition-all active:scale-95"
          >
            <Terminal className="w-4 h-4" />
            <span>Open Playground ($)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/curriculum/what-is-docker/"
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--brand-primary)]/50 text-[var(--text-primary)] font-bold text-sm hover:bg-[var(--bg-subtle)] transition-all shadow-sm active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>Interactive Course</span>
          </Link>
        </div>

        {/* Tactile Mini Playground Demonstration Card */}
        <div className="max-w-3xl mx-auto pt-6">
          <div className="rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg overflow-hidden text-left">
            {/* Top Bar */}
            <div className="h-9 px-3 bg-[var(--bg-subtle)] border-b border-[var(--border-color)] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-mono text-[var(--text-muted)] ml-2 font-bold">
                  docker-playground-preview
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                Live State Sync
              </span>
            </div>

            {/* Split Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border-color)] bg-[var(--bg-card)]">
              {/* Terminal Snippet */}
              <div className="p-4 bg-[#070d18] text-slate-200 font-mono text-xs space-y-2">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  Terminal
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-emerald-400">$</span>
                    <span className="text-slate-100 font-bold">docker run -d --name web -p 8080:80 nginx:alpine</span>
                  </div>
                  <div className="text-slate-400 text-[11px] pl-3 border-l border-[#0284c7]">
                    c4a8f921e0b3 (Container created &amp; started)
                  </div>
                </div>
              </div>

              {/* Visualizer Node Snippet */}
              <div className="p-4 bg-grid-pattern space-y-2">
                <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider font-mono">
                  Visualizer Topology
                </div>

                <div className="p-3 rounded-xl border-2 border-[var(--brand-primary)] bg-[var(--bg-card)] shadow-sm space-y-1.5 bg-container-ribs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold text-xs text-[var(--text-primary)] font-display">web</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                      RUNNING
                    </span>
                  </div>
                  <div className="text-[10.5px] font-mono text-[var(--text-secondary)] space-y-0.5">
                    <div>nginx:alpine</div>
                    <div className="text-[var(--brand-primary)] font-semibold">localhost:8080 ➔ 80/tcp</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-4xl mx-auto pt-6 text-left text-xs">
          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--brand-light)] text-[var(--brand-primary)] flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <strong className="text-sm font-bold text-[var(--text-primary)] font-display block">
              Instant Simulation
            </strong>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Deterministic AST parser and state machine executes container commands in 0ms without virtualization lag.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
              <Network className="w-4 h-4" />
            </div>
            <strong className="text-sm font-bold text-[var(--text-primary)] font-display block">
              Tactile Mental Models
            </strong>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Understand DNS 127.0.0.11 routing, bridge isolation, and port forwarding through live interactive diagrams.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
              <Wrench className="w-4 h-4" />
            </div>
            <strong className="text-sm font-bold text-[var(--text-primary)] font-display block">
              Break/Fix Scenarios
            </strong>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Tackle realistic production failure modes: crash loops, port collisions, and orphaned networks.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Navigation Cards */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display">
            Interactive Learning Workstations
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-lg mx-auto">
            Everything you need to master containerization from first principles to multi-service orchestration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1 */}
          <Link
            href="/playground/"
            className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] transition-all space-y-2.5 shadow-sm group hover:-translate-y-0.5"
          >
            <div className="w-9 h-9 rounded-xl bg-[var(--brand-light)] text-[var(--brand-primary)] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] font-display">
              Visual Playground
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              12-column workstation with live topology, container lifecycle cards, and embedded CLI terminal.
            </p>
          </Link>

          {/* Card 2 */}
          <Link
            href="/tools/network-visualizer/"
            className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-cyan-500 transition-all space-y-2.5 shadow-sm group hover:-translate-y-0.5"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Network className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-cyan-500 font-display">
              Network Packet Tracer
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Trace DNS resolution through 127.0.0.11 and bridge isolation across custom Docker networks.
            </p>
          </Link>

          {/* Card 3 */}
          <Link
            href="/tools/compose-studio/"
            className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-pink-500 transition-all space-y-2.5 shadow-sm group hover:-translate-y-0.5"
          >
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Box className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-pink-500 font-display">
              Compose 3-Tier Studio
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Multi-service YAML editor, service dependency graph, and microservice container deployment.
            </p>
          </Link>

          {/* Card 4 */}
          <Link
            href="/tools/dockerfile-studio/"
            className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-amber-500 transition-all space-y-2.5 shadow-sm group hover:-translate-y-0.5"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileCode className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-amber-500 font-display">
              Dockerfile Layer Studio
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Multi-stage build visualization, layer cache difference inspector, and image slimming tips.
            </p>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[var(--border-color)] bg-[var(--bg-subtle)] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center font-bold">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm text-[var(--text-primary)] font-display">
              DockerPlay.org
            </span>
            <span>• Open Source Interactive Simulator</span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/Nitesh-singh-1/DockerPlay"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:text-[var(--text-primary)] transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
            <Link href="/curriculum/" className="hover:text-[var(--text-primary)] transition-colors">
              Curriculum
            </Link>
            <Link href="/playground/" className="hover:text-[var(--text-primary)] transition-colors">
              Playground
            </Link>
            <Link href="/tools/cheat-sheet/" className="hover:text-[var(--text-primary)] transition-colors">
              Cheat Sheet
            </Link>
          </div>
        </div>

        {/* Legal & Trust Links */}
        <div className="max-w-6xl mx-auto mt-6 pt-5 border-t border-[var(--border-color)] flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-[var(--text-muted)]">
          <Link href="/about/" className="hover:text-[var(--brand-primary)] transition-colors">About</Link>
          <Link href="/privacy/" className="hover:text-[var(--brand-primary)] transition-colors">Privacy Policy</Link>
          <Link href="/terms/" className="hover:text-[var(--brand-primary)] transition-colors">Terms of Use</Link>
          <Link href="/contact/" className="hover:text-[var(--brand-primary)] transition-colors">Contact</Link>
          <span className="text-[var(--text-muted)]">© {new Date().getFullYear()} DockerPlay</span>
        </div>
      </footer>
    </div>
  );
}
