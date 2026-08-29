'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  Copy,
  Check,
  Tag,
  AlertTriangle,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { DOCKER_CHEATSHEET, CheatSheetEntry } from '@/data/cheatsheet';
import { AdBanner } from '@/components/ads/AdBanner';

export default function CheatSheetPage() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const categories = ['All', 'Containers', 'Images', 'Networking', 'Volumes', 'Docker Compose', 'Debugging & Logs'];

  const filtered = DOCKER_CHEATSHEET.filter((entry) => {
    const matchesCat = selectedCategory === 'All' || entry.category === selectedCategory;
    const matchesQuery =
      entry.command.toLowerCase().includes(query.toLowerCase()) ||
      entry.description.toLowerCase().includes(query.toLowerCase()) ||
      entry.example.toLowerCase().includes(query.toLowerCase()) ||
      entry.explanation.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const triggerRunCommand = (cmd: string) => {
    window.dispatchEvent(
      new CustomEvent('dockerplay-run-command', { detail: { command: cmd } })
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-page)] p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-[var(--border-color)]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--brand-light)] border border-[var(--brand-primary)]/20 text-[var(--brand-primary)] flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display">
            Docker Command Cheat Sheet
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          Searchable, battle-tested reference library for core Docker commands with 1-click execution support.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, flags, or concepts (e.g. port mapping, volume, rm, logs)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs focus:outline-none focus:border-[var(--brand-primary)] shadow-sm font-sans"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Commands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((entry, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4 shadow-sm hover:border-[var(--brand-primary)]/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[var(--brand-light)] text-[var(--brand-primary)] font-bold border border-[var(--brand-primary)]/20">
                  {entry.category}
                </span>
                <span className="text-xs font-bold text-[var(--text-primary)] font-display">{entry.description}</span>
              </div>

              {/* Code Snippet with Copy and 1-Click Run */}
              <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-between font-mono text-xs">
                <code className="text-[var(--brand-primary)] font-bold truncate pr-2">{entry.example}</code>
                <div className="flex items-center space-x-1 shrink-0 ml-2">
                  <button
                    onClick={() => triggerRunCommand(entry.example)}
                    className="p-1 rounded-md text-[var(--brand-primary)] hover:bg-[var(--brand-light)] transition-colors"
                    title="1-Click Run in Terminal"
                  >
                    <Zap className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCopy(entry.example)}
                    className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
                    title="Copy command"
                  >
                    {copiedCmd === entry.example ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
                {entry.explanation}
              </p>
            </div>

            {/* Warnings & Pro Tips */}
            <div className="space-y-2 pt-2.5 border-t border-[var(--border-color)] text-[11px]">
              <div className="flex items-start space-x-1.5 text-rose-700 dark:text-rose-300 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Watch out:</strong> {entry.commonMistakes}</span>
              </div>
              <div className="flex items-start space-x-1.5 text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Pro Tip:</strong> {entry.tip}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Non-intrusive Ad Banner */}
      <AdBanner
        slotId="9876543210"
        label="Sponsored Resources"
        className="my-6"
      />
    </div>
  );
}
