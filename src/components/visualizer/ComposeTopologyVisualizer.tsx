'use client';

import React, { useState } from 'react';
import {
  Layers,
  Database,
  Server,
  Globe,
  HardDrive,
  Network,
  Play,
  Square,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  FileCode,
  Terminal,
  Activity,
} from 'lucide-react';
import { DockerState } from '@/types/docker';
import { getDockerEngine } from '@/lib/simulator/DockerEngine';

interface ComposeStackTemplate {
  id: string;
  name: string;
  category: string;
  yaml: string;
  services: Array<{
    name: string;
    tier: string;
    image: string;
    ports: string;
    icon: 'globe' | 'server' | 'database';
    description: string;
    env: string;
    network: string;
    volume?: string;
  }>;
}

const COMPOSE_TEMPLATES: ComposeStackTemplate[] = [
  {
    id: '3-tier-fullstack',
    name: '3-Tier Microservice (React + Node + PostgreSQL)',
    category: 'Full-Stack Web Application',
    yaml: `version: '3.8'

services:
  frontend:
    image: nginx:alpine
    ports:
      - "3000:80"
    networks:
      - dockerplay_default
    depends_on:
      - backend

  backend:
    image: node:22-alpine
    ports:
      - "5000:5000"
    environment:
      - DB_HOST=database
      - PORT=5000
    networks:
      - dockerplay_default
    depends_on:
      - database

  database:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_PASSWORD=secretpassword
      - POSTGRES_DB=appdb
    volumes:
      - dbdata:/var/lib/postgresql/data
    networks:
      - dockerplay_default

volumes:
  dbdata:

networks:
  dockerplay_default:
    driver: bridge`,
    services: [
      {
        name: 'frontend',
        tier: 'Tier 1: Web Reverse Proxy',
        image: 'nginx:alpine',
        ports: '0.0.0.0:3000 ➔ :80',
        icon: 'globe',
        description: 'Serves Single Page Application and proxies API requests.',
        env: 'NODE_ENV=production',
        network: 'dockerplay_default',
      },
      {
        name: 'backend',
        tier: 'Tier 2: REST API Service',
        image: 'node:22-alpine',
        ports: '0.0.0.0:5000 ➔ :5000',
        icon: 'server',
        description: 'Express.js backend connecting to database via embedded DNS.',
        env: 'DB_HOST=database',
        network: 'dockerplay_default',
      },
      {
        name: 'database',
        tier: 'Tier 3: Relational DB',
        image: 'postgres:16-alpine',
        ports: '0.0.0.0:5432 ➔ :5432',
        icon: 'database',
        description: 'PostgreSQL database with isolated persistent volume storage.',
        env: 'POSTGRES_DB=appdb',
        network: 'dockerplay_default',
        volume: 'dbdata:/var/lib/postgresql/data',
      },
    ],
  },
  {
    id: 'redis-task-queue',
    name: 'Async Task Queue (FastAPI + Redis + Worker)',
    category: 'Distributed Background Queue',
    yaml: `version: '3.8'

services:
  api:
    image: python:3.12-slim
    ports:
      - "8000:8000"
    environment:
      - REDIS_URL=redis://cache:6379/0
    networks:
      - dockerplay_default

  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - dockerplay_default

  worker:
    image: python:3.12-slim
    environment:
      - REDIS_URL=redis://cache:6379/0
    networks:
      - dockerplay_default
    depends_on:
      - cache

networks:
  dockerplay_default:`,
    services: [
      {
        name: 'api',
        tier: 'FastAPI Gateway',
        image: 'python:3.12-slim',
        ports: '0.0.0.0:8000 ➔ :8000',
        icon: 'globe',
        description: 'Receives user requests and pushes jobs into Redis queue.',
        env: 'REDIS_URL=redis://cache:6379',
        network: 'dockerplay_default',
      },
      {
        name: 'cache',
        tier: 'In-Memory Message Broker',
        image: 'redis:7-alpine',
        ports: '0.0.0.0:6379 ➔ :6379',
        icon: 'database',
        description: 'Ultra-fast Redis in-memory cache and Celery broker.',
        env: 'MAXMEMORY=256mb',
        network: 'dockerplay_default',
      },
      {
        name: 'worker',
        tier: 'Background Consumer',
        image: 'python:3.12-slim',
        ports: 'Internal Only',
        icon: 'server',
        description: 'Pulls background tasks asynchronously from Redis queue.',
        env: 'CONCURRENCY=4',
        network: 'dockerplay_default',
      },
    ],
  },
];

interface ComposeTopologyVisualizerProps {
  state: DockerState;
}

export function ComposeTopologyVisualizer({ state }: ComposeTopologyVisualizerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ComposeStackTemplate>(COMPOSE_TEMPLATES[0]);
  const [yamlContent, setYamlContent] = useState<string>(COMPOSE_TEMPLATES[0].yaml);

  const containers = Object.values(state.containers);
  const isComposeRunning = containers.some((c) => c.labels['com.docker.compose.project']);
  const runningServicesCount = containers.filter((c) => c.labels['com.docker.compose.project']).length;

  const handleTemplateChange = (templateId: string) => {
    const tmpl = COMPOSE_TEMPLATES.find((t) => t.id === templateId) || COMPOSE_TEMPLATES[0];
    setSelectedTemplate(tmpl);
    setYamlContent(tmpl.yaml);
  };

  const handleComposeUp = () => {
    getDockerEngine().execute({
      raw: 'docker compose up -d',
      binary: 'docker-compose',
      command: 'up',
      flags: { detach: true },
      positionalArgs: [],
      isValid: true,
    });
  };

  const handleComposePs = () => {
    getDockerEngine().execute({
      raw: 'docker compose ps',
      binary: 'docker-compose',
      command: 'ps',
      flags: {},
      positionalArgs: [],
      isValid: true,
    });
  };

  const handleComposeLogs = () => {
    getDockerEngine().execute({
      raw: 'docker compose logs',
      binary: 'docker-compose',
      command: 'logs',
      flags: {},
      positionalArgs: [],
      isValid: true,
    });
  };

  const handleComposeDown = () => {
    getDockerEngine().execute({
      raw: 'docker compose down',
      binary: 'docker-compose',
      command: 'down',
      flags: {},
      positionalArgs: [],
      isValid: true,
    });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm transition-colors">
      {/* Top Header */}
      <div className="px-4 py-2.5 bg-[var(--bg-header)] border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-[var(--brand-light)] border border-[var(--brand-primary)]/30 flex items-center justify-center text-[var(--brand-primary)]">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)] text-xs font-display flex items-center space-x-2">
              <span>Docker Compose Multi-Service Architecture Studio</span>
            </h3>
          </div>
        </div>

        {/* Action Controls & Preset Dropdown */}
        <div className="flex flex-wrap items-center space-x-1.5">
          <select
            value={selectedTemplate.id}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="px-2.5 py-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-medium outline-none focus:border-[var(--brand-primary)]"
          >
            {COMPOSE_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleComposeUp}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
            title="Start all compose services"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>compose up -d</span>
          </button>

          <button
            onClick={handleComposePs}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] text-xs text-[var(--text-primary)] font-medium transition-all"
            title="List active compose services"
          >
            <Activity className="w-3 h-3 text-[var(--brand-primary)]" />
            <span>ps</span>
          </button>

          <button
            onClick={handleComposeLogs}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] text-xs text-[var(--text-primary)] font-medium transition-all"
            title="Inspect service logs"
          >
            <Terminal className="w-3 h-3 text-indigo-400" />
            <span>logs</span>
          </button>

          <button
            onClick={handleComposeDown}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:bg-rose-500/10 hover:text-rose-500 text-xs text-[var(--text-muted)] transition-colors"
            title="Stop and remove compose services"
          >
            <Square className="w-3 h-3" />
            <span>down</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-grid-pattern">
        {/* Status Notification Banner */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isComposeRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className="font-semibold text-[var(--text-primary)] font-display">
              {isComposeRunning
                ? `Compose Stack Active • ${runningServicesCount} Services Running on Network "dockerplay_default"`
                : 'Compose Stack Idle • Click "compose up -d" to orchestrate services'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            Network: 172.24.0.0/16
          </span>
        </div>

        {/* Live Multi-Tier Service Architecture Graph */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {selectedTemplate.services.map((svc, idx) => {
            const IconComponent =
              svc.icon === 'globe' ? Globe : svc.icon === 'server' ? Server : Database;
            const isRunning = isComposeRunning;

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all shadow-sm flex flex-col justify-between space-y-3 ${
                  isRunning
                    ? 'bg-[var(--bg-card)] border-emerald-500/40 shadow-emerald-500/5'
                    : 'bg-[var(--bg-card)] border-[var(--border-color)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9.5px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--brand-light)] text-[var(--brand-primary)] border border-[var(--brand-primary)]/20">
                      {svc.tier}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">{svc.ports}</span>
                  </div>

                  <h4 className="font-bold text-sm text-[var(--text-primary)] font-display flex items-center space-x-2 mt-2">
                    <IconComponent className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                    <span>{svc.name}</span>
                  </h4>

                  <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {svc.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2.5 border-t border-[var(--border-color)] text-[10px] font-mono">
                  <div className="flex items-center justify-between text-[var(--text-muted)]">
                    <span>Image:</span>
                    <span className="text-[var(--text-primary)] font-bold">{svc.image}</span>
                  </div>
                  <div className="flex items-center justify-between text-[var(--text-muted)]">
                    <span>DNS Alias:</span>
                    <span className="text-cyan-400 font-bold">{svc.name}</span>
                  </div>
                  {svc.volume && (
                    <div className="flex items-center justify-between text-[var(--text-muted)]">
                      <span>Volume:</span>
                      <span className="text-amber-400 font-bold">{svc.volume.split(':')[0]}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Editable docker-compose.yml Editor */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-xs text-slate-200 font-mono">
                docker-compose.yml (Declarative Multi-Service Blueprint)
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              YAML Syntax • Standard Compose Spec
            </span>
          </div>

          <textarea
            value={yamlContent}
            onChange={(e) => setYamlContent(e.target.value)}
            rows={12}
            className="w-full p-3 rounded-xl bg-slate-900/80 border border-white/10 text-[11px] font-mono text-cyan-300 outline-none focus:border-cyan-500 leading-relaxed resize-none selection:bg-cyan-500/30"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
