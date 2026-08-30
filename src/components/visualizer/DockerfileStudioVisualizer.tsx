'use client';

import React, { useState } from 'react';
import {
  Layers,
  Code2,
  Sparkles,
  Zap,
  CheckCircle2,
  HardDrive,
  Clock,
  ArrowRight,
  Play,
  RotateCcw,
  Info,
  ShieldCheck,
  PackageCheck,
  FileCode,
} from 'lucide-react';
import { getDockerEngine } from '@/lib/simulator/DockerEngine';

interface DockerfileTemplate {
  id: string;
  name: string;
  category: string;
  baseImage: string;
  fatSizeMb: number;
  slimSizeMb: number;
  code: string;
  layers: Array<{
    directive: string;
    description: string;
    sizeMb: number;
    explanation: string;
  }>;
}

const TEMPLATES: DockerfileTemplate[] = [
  {
    id: 'node-multistage',
    name: 'Node.js 22 (Multi-Stage Build)',
    category: 'Full-Stack JavaScript',
    baseImage: 'node:22-alpine',
    fatSizeMb: 1140,
    slimSizeMb: 82,
    code: `# Stage 1: Build Dependencies
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production Minimal Runtime
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
USER node
CMD ["node", "server.js"]`,
    layers: [
      { directive: 'FROM node:22-alpine', description: 'Base Alpine Linux OS & Node runtime', sizeMb: 52, explanation: 'Minimal Alpine-based distribution (~5MB core OS + Node runtime).' },
      { directive: 'WORKDIR /app', description: 'Set working directory', sizeMb: 0, explanation: 'Creates and sets execution context to /app.' },
      { directive: 'COPY package*.json ./', description: 'Cache dependency manifests', sizeMb: 0.1, explanation: 'Copied separately to leverage layer cache when source code changes.' },
      { directive: 'RUN npm ci --only=production', description: 'Install production dependencies', sizeMb: 24, explanation: 'Deterministic install of only runtime packages.' },
      { directive: 'COPY . .', description: 'Inject application source code', sizeMb: 5.9, explanation: 'Fast layer rebuilt only when application code changes.' },
      { directive: 'USER node & CMD', description: 'Security hardening & startup command', sizeMb: 0, explanation: 'Runs as non-root user for enterprise container security.' },
    ],
  },
  {
    id: 'python-fastapi',
    name: 'Python 3.12 FastAPI',
    category: 'Backend & AI Microservice',
    baseImage: 'python:3.12-slim',
    fatSizeMb: 980,
    slimSizeMb: 125,
    code: `FROM python:3.12-slim
WORKDIR /app

# Prevent Python from buffering stdout & writing .pyc
ENV PYTHONUNBUFFERED=1 \\
    PYTHONDONTWRITEBYTECODE=1

# Layer Cache: Install requirements first
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
    layers: [
      { directive: 'FROM python:3.12-slim', description: 'Python 3.12 Debian slim runtime', sizeMb: 85, explanation: 'Stripped-down Debian runtime without heavy build toolchains.' },
      { directive: 'WORKDIR /app & ENV', description: 'Configure Python unbuffered execution', sizeMb: 0, explanation: 'Ensures logs stream immediately to stdout.' },
      { directive: 'COPY requirements.txt .', description: 'Copy package dependencies list', sizeMb: 0.1, explanation: 'Separated from application code to preserve pip cache.' },
      { directive: 'RUN pip install --no-cache-dir', description: 'Install FastAPI & Uvicorn', sizeMb: 36, explanation: 'Installs dependencies without storing local wheel cache.' },
      { directive: 'COPY . .', description: 'Copy Python scripts', sizeMb: 3.9, explanation: 'Fast layer rebuilt on code edits.' },
    ],
  },
  {
    id: 'golang-scratch',
    name: 'Golang Microservice (Scratch Base)',
    category: 'Ultra-Lightweight Microservice',
    baseImage: 'scratch (0MB Base)',
    fatSizeMb: 890,
    slimSizeMb: 14,
    code: `# Stage 1: Build static binary
FROM golang:1.23-alpine AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server .

# Stage 2: Empty Scratch Container
FROM scratch
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /app/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]`,
    layers: [
      { directive: 'FROM scratch', description: 'Completely empty zero-byte base image', sizeMb: 0, explanation: 'No OS, no shell, no package managers. Maximum security surface.' },
      { directive: 'COPY ca-certificates.crt', description: 'Root TLS/SSL certificates', sizeMb: 0.2, explanation: 'Allows secure outbound HTTPS API calls from Go binary.' },
      { directive: 'COPY --from=builder /app/server', description: 'Static compiled Golang binary', sizeMb: 13.8, explanation: 'Self-contained executable with zero dynamic library dependencies.' },
    ],
  },
];

export function DockerfileStudioVisualizer() {
  const [selectedTemplate, setSelectedTemplate] = useState<DockerfileTemplate>(TEMPLATES[0]);
  const [cacheScenario, setCacheScenario] = useState<'none' | 'source_edit' | 'deps_edit'>('none');
  const [customTag, setCustomTag] = useState('my-app:v1');

  const totalSizeMb = selectedTemplate.layers.reduce((acc, l) => acc + l.sizeMb, 0);
  const savingsPct = Math.round(((selectedTemplate.fatSizeMb - selectedTemplate.slimSizeMb) / selectedTemplate.fatSizeMb) * 100);

  const handleBuild = () => {
    getDockerEngine().execute({
      raw: `docker build -t ${customTag} .`,
      binary: 'docker',
      command: 'build',
      flags: { tag: customTag },
      positionalArgs: ['.'],
      isValid: true,
    });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm transition-colors">
      {/* Top Header Controls */}
      <div className="px-4 py-2.5 bg-[var(--bg-header)] border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-[var(--brand-light)] border border-[var(--brand-primary)]/30 flex items-center justify-center text-[var(--brand-primary)]">
            <FileCode className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)] text-xs font-display flex items-center space-x-1.5">
              <span>Interactive Dockerfile Studio & Layer Cache Builder</span>
            </h3>
          </div>
        </div>

        {/* Template Selector & Build Trigger */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedTemplate.id}
            onChange={(e) => {
              const tmpl = TEMPLATES.find((t) => t.id === e.target.value);
              if (tmpl) setSelectedTemplate(tmpl);
            }}
            className="px-2.5 py-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-medium outline-none focus:border-[var(--brand-primary)]"
          >
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleBuild}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition-all font-display"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>docker build -t {customTag} .</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-5 bg-grid-pattern">
        {/* Layer Optimization & Size Reduction Metric Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center space-x-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] font-bold block">
                Total Image Layers
              </span>
              <span className="text-sm font-bold text-[var(--text-primary)] font-display">
                {selectedTemplate.layers.length} Layers
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center space-x-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] font-bold block">
                Final Compressed Size
              </span>
              <span className="text-sm font-bold text-emerald-400 font-display">
                {selectedTemplate.slimSizeMb} MB
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center space-x-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] font-bold block">
                Multi-Stage Slim Savings
              </span>
              <span className="text-sm font-bold text-amber-400 font-display">
                {savingsPct}% Smaller ({selectedTemplate.fatSizeMb}MB ➔ {selectedTemplate.slimSizeMb}MB)
              </span>
            </div>
          </div>
        </div>

        {/* Split View: Code Editor & Layer Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Dockerfile Code Viewer */}
          <div className="lg:col-span-6 rounded-2xl bg-slate-950 border border-white/10 p-4 font-mono text-xs flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 text-slate-400 text-[11px]">
                <span className="flex items-center space-x-1.5 text-cyan-400 font-bold">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Dockerfile</span>
                </span>
                <span className="text-[10px] text-slate-500">Read-only template</span>
              </div>
              <pre className="text-slate-200 leading-relaxed overflow-x-auto whitespace-pre font-mono text-[11px] selection:bg-cyan-500/30">
                {selectedTemplate.code}
              </pre>
            </div>

            {/* Quick Cache Test Controls */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-2">
                Simulate Developer Code Change:
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                <button
                  onClick={() => setCacheScenario('none')}
                  className={`px-2 py-1 rounded-lg border transition-all ${
                    cacheScenario === 'none'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 border-white/5 hover:border-white/20'
                  }`}
                >
                  ✨ Initial Build (0% Cache)
                </button>
                <button
                  onClick={() => setCacheScenario('source_edit')}
                  className={`px-2 py-1 rounded-lg border transition-all ${
                    cacheScenario === 'source_edit'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 border-white/5 hover:border-white/20'
                  }`}
                >
                  📝 Edit Source Code
                </button>
                <button
                  onClick={() => setCacheScenario('deps_edit')}
                  className={`px-2 py-1 rounded-lg border transition-all ${
                    cacheScenario === 'deps_edit'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 border-white/5 hover:border-white/20'
                  }`}
                >
                  📦 Add Package (package.json)
                </button>
              </div>
            </div>
          </div>

          {/* Right: Layer-by-Layer Assembly Inspector */}
          <div className="lg:col-span-6 space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-[var(--text-primary)] font-display flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                <span>Layer Assembly & Cache Status</span>
              </span>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                Base ➔ Top Layer
              </span>
            </div>

            <div className="space-y-2">
              {selectedTemplate.layers.map((layer, idx) => {
                let isCached = true;
                if (cacheScenario === 'none') {
                  isCached = false;
                } else if (cacheScenario === 'source_edit') {
                  // Only source code COPY layer is rebuilt
                  isCached = !layer.directive.includes('COPY . .');
                } else if (cacheScenario === 'deps_edit') {
                  // Manifest and everything after is rebuilt
                  isCached = idx < 2;
                }

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all shadow-sm flex items-start justify-between gap-3 ${
                      isCached
                        ? 'bg-[var(--bg-card)] border-emerald-500/30'
                        : 'bg-amber-500/5 border-amber-500/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-md bg-[var(--bg-subtle)] text-[var(--text-muted)] text-[10px] font-mono font-bold flex items-center justify-center border border-[var(--border-color)]">
                          {idx + 1}
                        </span>
                        <code className="text-xs font-bold font-mono text-[var(--text-primary)]">
                          {layer.directive}
                        </code>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] pl-7">
                        {layer.explanation}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[9.5px] font-mono font-bold uppercase px-2 py-0.5 rounded-full inline-block mb-1 ${
                          isCached
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {isCached ? 'CACHED' : 'REBUILD'}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)] block">
                        {layer.sizeMb > 0 ? `${layer.sizeMb} MB` : '0 MB (Metadata)'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
