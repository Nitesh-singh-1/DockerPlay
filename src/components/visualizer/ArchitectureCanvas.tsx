'use client';

import React, { useState } from 'react';
import {
  Box,
  Layers,
  Network,
  HardDrive,
  Cpu,
  Activity,
  ArrowRight,
  Play,
  Square,
  Trash2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { DockerState, Container } from '@/types/docker';
import { getDockerEngine } from '@/lib/simulator/DockerEngine';

interface ArchitectureCanvasProps {
  state: DockerState;
  onSelectContainer?: (container: Container) => void;
}

export function ArchitectureCanvas({ state, onSelectContainer }: ArchitectureCanvasProps) {
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const containers = Object.values(state.containers);
  const networks = Object.values(state.networks);
  const volumes = Object.values(state.volumes);
  const images = Object.values(state.images);

  const activeContainer = selectedContainerId ? state.containers[selectedContainerId] : null;

  const handleStop = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    getDockerEngine().execute({
      raw: `docker stop ${id}`,
      binary: 'docker',
      command: 'stop',
      flags: {},
      positionalArgs: [id],
      isValid: true,
    });
  };

  const handleStart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    getDockerEngine().execute({
      raw: `docker start ${id}`,
      binary: 'docker',
      command: 'start',
      flags: {},
      positionalArgs: [id],
      isValid: true,
    });
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    getDockerEngine().execute({
      raw: `docker rm -f ${id}`,
      binary: 'docker',
      command: 'rm',
      flags: { force: true },
      positionalArgs: [id],
      isValid: true,
    });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-header)] border-b border-[var(--border-color)] backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[var(--brand-primary)]" />
          <h3 className="font-bold text-[var(--text-primary)] text-xs font-display tracking-wide">
            Interactive Topology & Cluster Visualizer
          </h3>
        </div>
        <div className="flex items-center space-x-2.5 text-[11px]">
          <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{containers.filter((c) => c.status === 'running').length} Active</span>
          </span>
          <span className="text-[var(--text-muted)] font-mono hidden sm:inline">
            {images.length} Images • {networks.length} Nets • {volumes.length} Vols
          </span>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 p-5 overflow-y-auto bg-grid-pattern relative space-y-4">
        {/* Host Machine Boundary */}
        <div className="rounded-2xl border-2 border-dashed border-[var(--brand-primary)]/40 bg-[var(--bg-subtle)]/70 p-5 relative shadow-sm">
          <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-[var(--bg-card)] text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--brand-primary)] border border-[var(--brand-primary)]/30 shadow-sm">
            🖥️ Host Machine (Operating System & Kernel)
          </div>

          {/* Docker Engine Kernel */}
          <div className="mt-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 relative space-y-4 shadow-sm">
            {/* Dockerd status */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-xl bg-[var(--brand-primary)] flex items-center justify-center text-white shadow-md shadow-[var(--brand-primary)]/20">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-[var(--text-primary)] font-display">
                    Docker Daemon (dockerd)
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] ml-2 font-mono">
                    v27.1.1 (overlay2)
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Simulation Active</span>
              </span>
            </div>

            {/* Containers Grid View */}
            <div>
              <div className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Box className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span>Containers ({containers.length})</span>
                </div>
              </div>

              {containers.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-subtle)] space-y-2">
                  <Box className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
                  <p className="text-xs text-[var(--text-primary)] font-semibold font-display">No containers running</p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Type or run a container command in the terminal:
                  </p>
                  <code className="inline-block px-3 py-1 rounded-xl bg-[var(--bg-card)] text-[var(--brand-primary)] font-mono text-[11px] border border-[var(--border-color)] shadow-sm">
                    docker run -d --name web -p 8080:80 nginx:alpine
                  </code>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {containers.map((c) => {
                    const isRunning = c.status === 'running';
                    const isSelected = selectedContainerId === c.id;

                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedContainerId(c.id);
                          onSelectContainer?.(c);
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                          isSelected
                            ? 'bg-[var(--bg-card)] border-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary)]/15 scale-[1.02]'
                            : isRunning
                            ? 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[var(--brand-primary)]/50 hover:shadow-md'
                            : 'bg-[var(--bg-subtle)] border-[var(--border-color)] opacity-70'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                isRunning
                                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500 animate-pulse'
                                  : 'bg-slate-400 dark:bg-slate-600'
                              }`}
                            />
                            <span className="font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] font-display">
                              {c.name}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-[var(--text-muted)]">
                            {c.id.slice(0, 8)}
                          </span>
                        </div>

                        {/* Image & Network Ports */}
                        <div className="text-[11px] text-[var(--text-secondary)] space-y-1 mb-3 font-mono">
                          <div className="flex items-center space-x-1.5 truncate">
                            <Layers className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                            <span className="truncate">{c.image}</span>
                          </div>

                          {c.ports.length > 0 && (
                            <div className="flex items-center space-x-1 text-[var(--brand-primary)] font-semibold text-[10.5px]">
                              <ArrowRight className="w-3 h-3 shrink-0" />
                              <span>
                                {c.ports
                                  .map((p) => `localhost:${p.hostPort} ➔ :${p.containerPort}`)
                                  .join(', ')}
                              </span>
                            </div>
                          )}

                          {Object.keys(c.networks).length > 0 && (
                            <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 text-[10.5px]">
                              <Network className="w-3 h-3 shrink-0" />
                              <span>
                                {Object.entries(c.networks)
                                  .map(([net, cfg]) => `${net} (${cfg.ipAddress})`)
                                  .join(', ')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Status Pill & Action Buttons */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-[var(--border-color)] text-[10.5px]">
                          <span
                            className={`font-bold uppercase text-[9px] px-2 py-0.5 rounded-full ${
                              isRunning
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                            }`}
                          >
                            {c.status}
                          </span>

                          <div className="flex items-center space-x-1">
                            {isRunning ? (
                              <button
                                onClick={(e) => handleStop(c.id, e)}
                                title="Stop container"
                                className="p-1 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-amber-500 transition-colors"
                              >
                                <Square className="w-3 h-3" />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => handleStart(c.id, e)}
                                title="Start container"
                                className="p-1 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-emerald-500 transition-colors"
                              >
                                <Play className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleRemove(c.id, e)}
                              title="Delete container"
                              className="p-1 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-rose-500 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Networks & Volumes Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-[var(--border-color)]">
              {/* Bridge Networks */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[var(--text-primary)] font-display">
                    <Network className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Bridge Networks</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">{networks.length} total</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {networks.map((net) => (
                    <span
                      key={net.id}
                      className="px-2.5 py-0.5 rounded-lg bg-[var(--bg-card)] text-[10.5px] font-mono text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm font-semibold"
                    >
                      {net.name} {net.subnet ? `(${net.subnet})` : ''}
                    </span>
                  ))}
                </div>
              </div>

              {/* Volumes */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[var(--text-primary)] font-display">
                    <HardDrive className="w-3.5 h-3.5 text-amber-500" />
                    <span>Persistent Volumes</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">{volumes.length} total</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {volumes.length === 0 ? (
                    <span className="text-[10.5px] text-[var(--text-muted)] italic">No named volumes created</span>
                  ) : (
                    volumes.map((vol) => (
                      <span
                        key={vol.id}
                        className="px-2.5 py-0.5 rounded-lg bg-[var(--bg-card)] text-[10.5px] font-mono text-amber-600 dark:text-amber-400 border border-[var(--border-color)] shadow-sm font-semibold"
                      >
                        {vol.name}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Container Live Inspector */}
        {activeContainer && (
          <div className="p-4 rounded-2xl border border-[var(--brand-primary)] bg-[var(--bg-card)] shadow-xl space-y-3 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[var(--brand-primary)]" />
                <h4 className="font-bold text-[var(--text-primary)] font-display">
                  Live Container Inspector: <span className="text-[var(--brand-primary)]">{activeContainer.name}</span>
                </h4>
              </div>
              <button
                onClick={() => setSelectedContainerId(null)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-[11px]">
              <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] text-[10px] uppercase block">Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  {activeContainer.status}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] truncate">
                <span className="text-[var(--text-muted)] text-[10px] uppercase block">Image</span>
                <span className="text-[var(--text-primary)] truncate block">{activeContainer.image}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] text-[10px] uppercase block">Memory</span>
                <span className="text-[var(--text-primary)]">
                  {activeContainer.resources.memoryUsageMb} MB / {activeContainer.resources.memoryLimitMb ? `${activeContainer.resources.memoryLimitMb}MB` : 'Host'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] text-[10px] uppercase block">CPU Usage</span>
                <span className="text-[var(--brand-primary)] font-bold">{activeContainer.resources.cpuPercent}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
