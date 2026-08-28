'use client';

import React, { useState } from 'react';
import {
  Layers,
  ArrowDown,
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
} from 'lucide-react';
import { DockerState } from '@/types/docker';
import { getDockerEngine } from '@/lib/simulator/DockerEngine';

interface ComposeTopologyVisualizerProps {
  state: DockerState;
}

export function ComposeTopologyVisualizer({ state }: ComposeTopologyVisualizerProps) {
  const containers = Object.values(state.containers);
  const isComposeRunning = containers.some((c) => c.labels['com.docker.compose.project']);

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
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-header)] border-b border-[var(--border-color)]">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[var(--brand-primary)]" />
          <h3 className="font-bold text-[var(--text-primary)] text-xs font-display tracking-wide">
            Docker Compose 3-Tier Multi-Service Architecture Studio
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleComposeUp}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Play className="w-3.5 h-3.5" />
            <span>docker compose up -d</span>
          </button>
          <button
            onClick={handleComposeDown}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:bg-rose-500/10 hover:text-rose-500 text-xs text-[var(--text-muted)] transition-colors"
          >
            <Square className="w-3.5 h-3.5" />
            <span>compose down</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-grid-pattern">
        {/* Tier Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {/* Frontend Web Tier */}
          <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--brand-light)] text-[var(--brand-primary)] border border-[var(--brand-primary)]/20">
                  Tier 1: Frontend
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">:8080 ➔ :80</span>
              </div>
              <h4 className="font-bold text-sm text-[var(--text-primary)] font-display flex items-center space-x-2">
                <Globe className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>storefront-web</span>
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                Nginx web server hosting Single Page App (React/Next.js).
              </p>
            </div>
            <div className="pt-2 border-t border-[var(--border-color)] text-[10.5px] font-mono text-[var(--text-muted)]">
              Network: <span className="text-[var(--brand-primary)] font-bold">app-network</span>
            </div>
          </div>

          {/* Backend API Tier */}
          <div className="p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Tier 2: Backend API
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">:5000</span>
              </div>
              <h4 className="font-bold text-sm text-[var(--text-primary)] font-display flex items-center space-x-2">
                <Server className="w-4 h-4 text-indigo-500" />
                <span>order-service</span>
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                Node.js REST API communicating with PostgreSQL.
              </p>
            </div>
            <div className="pt-2 border-t border-[var(--border-color)] text-[10.5px] font-mono text-[var(--text-muted)]">
              DNS: <span className="text-indigo-600 dark:text-indigo-400 font-bold">order-service:5000</span>
            </div>
          </div>

          {/* Database Storage Tier */}
          <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Tier 3: Database
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">:5432</span>
              </div>
              <h4 className="font-bold text-sm text-[var(--text-primary)] font-display flex items-center space-x-2">
                <Database className="w-4 h-4 text-amber-500" />
                <span>postgres-db</span>
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                PostgreSQL relational database with persistent named volume.
              </p>
            </div>
            <div className="pt-2 border-t border-[var(--border-color)] text-[10.5px] font-mono text-[var(--text-muted)]">
              Volume: <span className="text-amber-600 dark:text-amber-400 font-bold">pgdata:/var/lib/postgresql</span>
            </div>
          </div>
        </div>

        {/* Compose File Specification */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-[var(--text-primary)]">
              docker-compose.yml (Live Project Specification)
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
              {isComposeRunning ? 'Project Active' : 'Idle'}
            </span>
          </div>
          <pre className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[11.5px] font-mono text-[var(--text-secondary)] overflow-x-auto leading-relaxed">
{`services:
  storefront:
    image: nginx:alpine
    ports:
      - "8080:80"
    networks:
      - app-network

  order-service:
    image: node:22-alpine
    environment:
      - DB_HOST=postgres-db
    networks:
      - app-network

  postgres-db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - app-network

volumes:
  pgdata:

networks:
  app-network:`}
          </pre>
        </div>
      </div>
    </div>
  );
}
