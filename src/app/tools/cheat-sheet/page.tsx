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
    <div className="flex-1 overflow-y-auto bg-[#070b14] bg-grid-pattern p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-white/5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-display">
            Docker Command Cheat Sheet
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Searchable, battle-tested reference library for core Docker commands with 1-click execution support.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search commands, flags, or keywords (e.g. port, volume, -d)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/80 text-slate-400 border border-white/5 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((entry, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3.5 flex flex-col justify-between hover:border-cyan-500/30 hover:bg-slate-900/80 transition-all group shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 font-mono">
                  {entry.command}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5">
                  {entry.category}
                </span>
              </div>

              <p className="text-xs text-slate-100 font-medium leading-relaxed font-display">
                {entry.description}
              </p>

              {/* Example box with 1-click execution */}
              <div className="p-3 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between group-hover:border-cyan-500/30 transition-colors">
                <code className="font-mono text-xs text-emerald-400 overflow-x-auto">
                  {entry.example}
                </code>
                <div className="flex items-center space-x-1 shrink-0 ml-2">
                  <button
                    onClick={() => handleCopy(entry.example)}
                    className="p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    title="Copy command"
                  >
                    {copiedCmd === entry.example ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-[11.5px] text-slate-400 leading-relaxed">
                {entry.explanation}
              </p>
            </div>

            {/* Warnings & Pro Tips */}
            <div className="space-y-2 pt-2.5 border-t border-white/5 text-[11px]">
              <div className="flex items-start space-x-1.5 text-rose-300/90 bg-rose-950/20 p-2 rounded-lg border border-rose-900/30">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span><strong>Watch out:</strong> {entry.commonMistakes}</span>
              </div>
              <div className="flex items-start space-x-1.5 text-emerald-300/90 bg-emerald-950/20 p-2 rounded-lg border border-emerald-900/30">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Pro Tip:</strong> {entry.tip}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
