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
  Sparkles,
  CheckCircle2,
  Box,
  Flame,
  Globe,
} from 'lucide-react';
import { CURRICULUM_CHAPTERS } from '@/data/curriculum';

export default function LandingPage() {
  const chapters = CURRICULUM_CHAPTERS.slice(0, 6);

  return (
    <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col bg-[#070b14] bg-grid-pattern relative">
      {/* Ambient Gradient Glow Lights */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-cyan-600/20 via-sky-500/20 to-indigo-600/15 blur-[140px] pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-6">
        {/* Safety Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono shadow-lg shadow-cyan-500/10">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Zero Docker Desktop Required • Safe In-Browser Simulation Engine</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-100 font-display tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Master Docker by <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400">actually building it.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans">
          An interactive, visual playground where you run real container commands, bridge virtual networks, build layer stacks, orchestrate Compose services, and solve break-fix challenges — right in your browser.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
          <Link
            href="/playground"
            className="flex items-center space-x-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 hover:brightness-110 transition-all hover:scale-[1.02]"
          >
            <Terminal className="w-4 h-4" />
            <span>Launch Visual Playground</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/curriculum/ch-01"
            className="flex items-center space-x-2 px-7 py-3.5 rounded-2xl bg-slate-900/90 border border-white/10 text-slate-200 font-bold text-sm hover:bg-slate-800 hover:border-cyan-500/40 transition-all shadow-lg"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Start Interactive Course</span>
          </Link>
        </div>

        {/* 3 Core Value Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-8 text-left text-xs">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md flex items-start space-x-3 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-100 font-display text-sm block mb-0.5">0ms Instant Simulation</strong>
              <span className="text-slate-400 leading-snug">Deterministic parser executes and visualizes commands in milliseconds.</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md flex items-start space-x-3 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-100 font-display text-sm block mb-0.5">Visual Mental Models</strong>
              <span className="text-slate-400 leading-snug">Live topology, DNS lookup traces, and build cache status make invisible concepts visible.</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md flex items-start space-x-3 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-100 font-display text-sm block mb-0.5">Break/Fix Lab</strong>
              <span className="text-slate-400 leading-snug">Diagnose and repair crash loops, port collisions, and network split bugs with guided clues.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Showcase Cards */}
      <section className="py-14 px-4 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100 font-display">
            Built to Make Studying Addictive & Clear
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            From single-container commands to full-stack Docker Compose and Kubernetes architectural bridges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <Link
            href="/playground"
            className="p-6 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-cyan-500/40 hover:bg-slate-900/90 transition-all space-y-3.5 group shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-100 group-hover:text-cyan-300 font-display">
              Live Terminal & Auto-Explainer
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every command receives a step-by-step <em>&quot;What Just Happened?&quot;</em> explanation and beginner mode flag breakdown.
            </p>
          </Link>

          {/* Card 2 */}
          <Link
            href="/tools/network-visualizer"
            className="p-6 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all space-y-3.5 group shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Network className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-100 group-hover:text-indigo-300 font-display">
              Network Flow & DNS Tracer
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Send animated HTTP packets across bridge networks and learn why <code>localhost</code> between containers fails.
            </p>
          </Link>

          {/* Card 3 */}
          <Link
            href="/tools/compose-studio"
            className="p-6 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all space-y-3.5 group shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Box className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-100 group-hover:text-emerald-300 font-display">
              Compose 3-Tier Multi-Service
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Orchestrate Frontend, Node/Python API, and PostgreSQL databases with single-command declarative management.
            </p>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500 space-y-1">
        <p className="font-display font-semibold text-slate-400">DockerPlay — Modern Interactive Docker Learning Platform</p>
        <p className="text-[11px]">
          Safe browser simulation engine. Zero Docker Desktop installation required.
        </p>
      </footer>
    </div>
  );
}
