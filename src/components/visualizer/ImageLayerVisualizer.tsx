'use client';

import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  RefreshCw,
  Info,
  Clock,
  HardDrive,
} from 'lucide-react';

interface VisualLayer {
  step: number;
  instruction: string;
  command: string;
  sizeMb: number;
  isCached: boolean;
  explanation: string;
}

export function ImageLayerVisualizer() {
  const [modifiedFile, setModifiedFile] = useState<'none' | 'source_code' | 'package_json'>('none');

  const baseLayers: VisualLayer[] = [
    {
      step: 1,
      instruction: 'FROM node:22-alpine',
      command: 'Base OS & Node runtime',
      sizeMb: 140,
      isCached: true,
      explanation: 'Base Alpine Linux layer with minimal Node.js binary.',
    },
    {
      step: 2,
      instruction: 'WORKDIR /app',
      command: 'Create working directory',
      sizeMb: 0,
      isCached: true,
      explanation: 'Sets working directory metadata.',
    },
    {
      step: 3,
      instruction: 'COPY package*.json ./',
      command: 'Copy dependency manifests',
      sizeMb: 0.1,
      isCached: modifiedFile !== 'package_json',
      explanation: 'Copies package specs to leverage build cache on npm install.',
    },
    {
      step: 4,
      instruction: 'RUN npm install',
      command: 'Install node dependencies',
      sizeMb: 85,
      isCached: modifiedFile !== 'package_json',
      explanation: 'Installs production libraries into node_modules layer.',
    },
    {
      step: 5,
      instruction: 'COPY . .',
      command: 'Copy application source code',
      sizeMb: 2.5,
      isCached: modifiedFile === 'none',
      explanation: 'Copies server.js and app logic files.',
    },
    {
      step: 6,
      instruction: 'EXPOSE 3000',
      command: 'Declare runtime port 3000',
      sizeMb: 0,
      isCached: modifiedFile === 'none',
      explanation: 'Documents container network listener.',
    },
    {
      step: 7,
      instruction: 'CMD ["node", "server.js"]',
      command: 'Container entrypoint',
      sizeMb: 0,
      isCached: modifiedFile === 'none',
      explanation: 'Default launch process on container startup.',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm transition-colors">
      {/* Title */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-header)] border-b border-[var(--border-color)]">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[var(--brand-primary)]" />
          <h3 className="font-bold text-[var(--text-primary)] text-xs font-display tracking-wide">
            Docker Image Layer Stack & Build Cache Analyzer
          </h3>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-grid-pattern">
        {/* Scenario Buttons */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block font-mono">
            Test Cache Invalidation Scenarios:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setModifiedFile('none')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                modifiedFile === 'none'
                  ? 'bg-[var(--brand-primary)] text-white shadow-md'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-color)]'
              }`}
            >
              No Code Changes (100% Cached)
            </button>
            <button
              onClick={() => setModifiedFile('source_code')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                modifiedFile === 'source_code'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-color)]'
              }`}
            >
              Edited server.js only (Deps Cached!)
            </button>
            <button
              onClick={() => setModifiedFile('package_json')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                modifiedFile === 'package_json'
                  ? 'bg-rose-500 text-white font-bold shadow-md'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-color)]'
              }`}
            >
              Added new package in package.json (npm install runs)
            </button>
          </div>
        </div>

        {/* Layer Cake Stack */}
        <div className="space-y-2.5">
          {baseLayers.map((layer) => (
            <div
              key={layer.step}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                layer.isCached
                  ? 'bg-[var(--bg-card)] border-emerald-500/30'
                  : 'bg-amber-500/10 border-amber-500/40 shadow-sm'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[10px] font-mono text-[var(--text-primary)] font-bold flex items-center justify-center">
                    {layer.step}
                  </span>
                  <code className="text-xs font-mono font-bold text-[var(--text-primary)]">
                    {layer.instruction}
                  </code>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] pl-7">{layer.explanation}</p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-[10.5px] font-mono text-[var(--text-muted)]">
                  {layer.sizeMb > 0 ? `${layer.sizeMb} MB` : '0 B'}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    layer.isCached
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {layer.isCached ? '⚡ CACHED' : '🔨 REBUILT'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
