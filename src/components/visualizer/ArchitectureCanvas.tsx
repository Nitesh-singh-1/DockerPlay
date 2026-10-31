'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Terminal as TerminalIcon,
  Zap,
  Globe,
  Radio,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Shield,
  Key,
} from 'lucide-react';
import { DockerState, Container } from '@/types/docker';
import { getDockerEngine } from '@/lib/simulator/DockerEngine';

interface ArchitectureCanvasProps {
  state: DockerState;
  onSelectContainer?: (container: Container) => void;
}

export function ArchitectureCanvas({ state, onSelectContainer }: ArchitectureCanvasProps) {
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'overview' | 'logs' | 'env' | 'mounts'>('overview');
  const [copiedText, setCopiedText] = useState<string | null>(null);

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
    if (selectedContainerId === id) {
      setSelectedContainerId(null);
    }
  };

  const runCommandQuickly = (cmd: string) => {
    window.dispatchEvent(
      new CustomEvent('dockerplay-run-command', { detail: { command: cmd } })
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm transition-colors">
      {/* Harbor Berth Header Bar */}
      <div className="flex items-center justify-between px-3.5 sm:px-4 py-2 bg-[var(--bg-header)] border-b border-[var(--border-color)] shrink-0 backdrop-blur-md">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] flex items-center justify-center shrink-0">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center space-x-2 truncate">
            <h3 className="font-bold text-[var(--text-primary)] text-xs font-display tracking-tight truncate">
              Docker Harbor Canvas
            </h3>
            <span className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-color)]">
              Topology &amp; Conduits
            </span>
          </div>
        </div>

        {/* Real-time stats */}
        <div className="flex items-center space-x-2 text-[11px] shrink-0 font-mono">
          <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{containers.filter((c) => c.status === 'running').length} Active</span>
          </span>
          <span className="text-[var(--text-muted)] hidden md:inline">
            {networks.length} Nets • {volumes.length} Vols
          </span>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-grid-pattern relative space-y-4">
        {/* Host Machine Boundary (Wharf Dock) */}
        <div className="rounded-2xl border-2 border-dashed border-[var(--brand-primary)]/30 bg-[var(--bg-subtle)]/60 p-3 sm:p-4 relative shadow-sm">
          {/* Wharf Berth Badge */}
          <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-[var(--bg-card)] text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--brand-primary)] border border-[var(--brand-primary)]/30 shadow-sm flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] animate-ping" />
            <span>🖥️ Host Node (Linux Kernel 6.8 • cgroups v2)</span>
          </div>

          {/* Docker Engine Daemon Hub */}
          <div className="mt-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 sm:p-4 relative space-y-4 shadow-sm">
            {/* Dockerd status strip */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-accent)] flex items-center justify-center text-white shadow-sm">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-xs text-[var(--text-primary)] font-display">
                      dockerd
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      v27.1.1 (overlay2)
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] block">
                    Zero Docker Desktop Required • In-Browser Runtime
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Simulation Online</span>
                </span>
              </div>
            </div>

            {/* Virtual Network Bridge Lanes (LearnGitBranching style conduits) */}
            <div className="space-y-1.5">
              <div className="text-[10.5px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center justify-between font-mono">
                <span className="flex items-center space-x-1.5">
                  <Network className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Virtual Network Conduits &amp; Bridges ({networks.length})</span>
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-normal hidden sm:inline">
                  Embedded DNS 127.0.0.11 on user bridges
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {networks.map((net) => {
                  const isDefaultBridge = net.name === 'bridge';
                  const attachedCount = Object.values(state.containers).filter(
                    (c) => c.networks[net.name]
                  ).length;

                  return (
                    <div
                      key={net.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        isDefaultBridge
                          ? 'bg-[var(--bg-subtle)] border-[var(--border-color)]'
                          : 'bg-cyan-500/5 border-cyan-500/30'
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isDefaultBridge ? 'bg-slate-400' : 'bg-cyan-400 animate-pulse'
                          }`}
                        />
                        <div className="truncate">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold font-mono text-xs text-[var(--text-primary)] truncate">
                              {net.name}
                            </span>
                            {!isDefaultBridge && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20 shrink-0">
                                DNS
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-[var(--text-muted)] block truncate">
                            {net.subnet || '172.17.0.0/16'} • GW {net.gateway || '172.17.0.1'}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10.5px] font-mono text-[var(--text-muted)] shrink-0 font-semibold px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)]">
                        {attachedCount} docked
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Containers Container Yard */}
            <div className="pt-2">
              <div className="text-[10.5px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5 flex items-center justify-between font-mono">
                <div className="flex items-center space-x-1.5">
                  <Box className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span>Docked Shipping Containers ({containers.length})</span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-normal hidden sm:inline">
                  Click any container to inspect
                </span>
              </div>

              {containers.length === 0 ? (
                /* Friendly Empty State with Cartoonish Prompts */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 text-center rounded-xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-subtle)]/70 space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[var(--brand-light)] text-[var(--brand-primary)] mx-auto flex items-center justify-center shadow-sm">
                    <Box className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)] font-display">
                      Your Harbor Berth is Empty
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mt-0.5">
                      No containers are currently docked. Launch a container below to see live topological conduits:
                    </p>
                  </div>

                  {/* Quick Launch Action Chips */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      onClick={() => runCommandQuickly('docker run -d --name web -p 8080:80 nginx:alpine')}
                      className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--brand-light)] text-[var(--text-primary)] hover:text-[var(--brand-primary)] border border-[var(--border-color)] hover:border-[var(--brand-primary)]/40 text-xs font-mono transition-all shadow-sm flex items-center space-x-1.5 active:scale-95"
                    >
                      <Play className="w-3 h-3 text-emerald-500" />
                      <span>run nginx web (:8080)</span>
                    </button>

                    <button
                      onClick={() => runCommandQuickly('docker run -d --name db -v pgdata:/var/lib/postgresql/data -e POSTGRES_PASSWORD=secret postgres:16-alpine')}
                      className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--brand-light)] text-[var(--text-primary)] hover:text-[var(--brand-primary)] border border-[var(--border-color)] hover:border-[var(--brand-primary)]/40 text-xs font-mono transition-all shadow-sm flex items-center space-x-1.5 active:scale-95"
                    >
                      <Play className="w-3 h-3 text-amber-500" />
                      <span>run postgres db with volume</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Tactile Shipping Container Grid with Framer Motion */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <AnimatePresence>
                    {containers.map((c) => {
                      const isRunning = c.status === 'running';
                      const isSelected = selectedContainerId === c.id;
                      const primaryNetName = Object.keys(c.networks)[0] || 'bridge';
                      const primaryNet = c.networks[primaryNetName];

                      return (
                        <motion.div
                          key={c.id}
                          layout
                          initial={{ opacity: 0, scale: 0.85, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: -15 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          onClick={() => {
                            setSelectedContainerId(c.id);
                            onSelectContainer?.(c);
                          }}
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative group bg-container-ribs overflow-hidden ${
                            isSelected
                              ? 'bg-[var(--bg-card)] border-[var(--brand-primary)] shadow-md shadow-[var(--brand-primary)]/20 scale-[1.01]'
                              : isRunning
                              ? 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[var(--brand-primary)] hover:shadow-sm'
                              : 'bg-[var(--bg-subtle)] border-[var(--border-color)] opacity-70'
                          }`}
                        >
                          {/* Corner Container Lock Brackets (Tactile shipping container motif) */}
                          <div className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-sm bg-slate-400/30" />
                          <div className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-sm bg-slate-400/30" />
                          <div className="absolute bottom-1 left-1.5 w-1.5 h-1.5 rounded-sm bg-slate-400/30" />
                          <div className="absolute bottom-1 right-1.5 w-1.5 h-1.5 rounded-sm bg-slate-400/30" />

                          {/* Container Header */}
                          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[var(--border-color)]">
                            <div className="flex items-center space-x-2 min-w-0">
                              {/* Animated Status Beacon */}
                              <span
                                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                  isRunning
                                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse'
                                    : 'bg-rose-500'
                                }`}
                              />
                              <span className="font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] font-display truncate">
                                {c.name}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] text-[var(--text-muted)] shrink-0">
                              {c.id.slice(0, 8)}
                            </span>
                          </div>

                          {/* Image & Topological Conduit Badges */}
                          <div className="text-[11px] text-[var(--text-secondary)] space-y-1.5 mb-2.5 font-mono">
                            <div className="flex items-center space-x-1.5 truncate text-[var(--text-muted)]">
                              <Layers className="w-3 h-3 shrink-0" />
                              <span className="truncate">{c.image}</span>
                            </div>

                            {/* Topological Network Conduit Cable */}
                            {primaryNet && (
                              <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-[10.5px]">
                                <Network className="w-3 h-3 shrink-0" />
                                <span className="font-bold">{primaryNetName}:</span>
                                <span className="truncate">{primaryNet.ipAddress}</span>
                              </div>
                            )}

                            {/* Port Forwarding with Tactile Plug */}
                            {c.ports.length > 0 && (
                              <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-lg bg-[var(--brand-light)] border border-[var(--brand-primary)]/20 text-[var(--brand-text)] font-semibold text-[10.5px]">
                                <ArrowRight className="w-3 h-3 shrink-0 text-[var(--brand-primary)]" />
                                <span className="truncate">
                                  {c.ports
                                    .map((p) => `:${p.hostPort} ➔ ${p.containerPort}`)
                                    .join(', ')}
                                </span>
                              </div>
                            )}

                            {/* Attached Storage Volumes (Docked Cargo Crates) */}
                            {c.mounts && c.mounts.length > 0 && (
                              <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10.5px]">
                                <HardDrive className="w-3 h-3 shrink-0" />
                                <span className="font-bold">vol:</span>
                                <span className="truncate">{c.mounts.map((m) => m.source).join(', ')}</span>
                              </div>
                            )}
                          </div>

                          {/* Footer Status Pill & Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)] text-[10.5px]">
                            <span
                              className={`font-bold uppercase text-[9px] px-2 py-0.5 rounded-full ${
                                isRunning
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              }`}
                            >
                              {c.status}
                            </span>

                            {/* Tactile Control Buttons */}
                            <div className="flex items-center space-x-1">
                              {isRunning ? (
                                <button
                                  onClick={(e) => handleStop(c.id, e)}
                                  title="Stop container (docker stop)"
                                  className="p-1 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-amber-500 transition-colors"
                                >
                                  <Square className="w-3 h-3" />
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => handleStart(c.id, e)}
                                  title="Start container (docker start)"
                                  className="p-1 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-emerald-500 transition-colors"
                                >
                                  <Play className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={(e) => handleRemove(c.id, e)}
                                title="Delete container (docker rm -f)"
                                className="p-1 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-rose-500 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Persistent Volumes Storage Bay */}
            <div className="pt-2 border-t border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5 font-bold text-[10.5px] uppercase tracking-wider text-[var(--text-secondary)] font-mono">
                  <HardDrive className="w-3.5 h-3.5 text-amber-500" />
                  <span>Storage Bay: Persistent Volumes ({volumes.length})</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">Driver: local</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {volumes.length === 0 ? (
                  <span className="text-[11px] text-[var(--text-muted)] italic font-mono">
                    No named volumes created. Run <code>docker volume create data</code>
                  </span>
                ) : (
                  volumes.map((vol) => (
                    <div
                      key={vol.id}
                      className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-500 font-mono text-xs flex items-center space-x-1.5 shadow-sm"
                    >
                      <HardDrive className="w-3 h-3" />
                      <span className="font-bold">{vol.name}</span>
                      <span className="text-[10px] text-amber-500/70">(/var/lib/docker/volumes)</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Container Live Inspector Drawer */}
        <AnimatePresence>
          {activeContainer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-3.5 sm:p-4 rounded-2xl border-2 border-[var(--brand-primary)] bg-[var(--bg-card)] shadow-xl space-y-3 text-xs"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                <div className="flex items-center space-x-2 min-w-0">
                  <Activity className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                  <h4 className="font-bold text-[var(--text-primary)] font-display truncate">
                    Container Inspector:{' '}
                    <span className="text-[var(--brand-primary)]">{activeContainer.name}</span>
                  </h4>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    ({activeContainer.id})
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => copyToClipboard(activeContainer.id)}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs flex items-center space-x-1"
                    title="Copy full container ID"
                  >
                    {copiedText === activeContainer.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedContainerId(null)}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2 py-1 rounded-lg hover:bg-[var(--bg-subtle)]"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* Inspector Navigation Tabs */}
              <div className="flex items-center space-x-1 border-b border-[var(--border-color)] pb-2 text-[11px] font-mono">
                <button
                  onClick={() => setInspectorTab('overview')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    inspectorTab === 'overview'
                      ? 'bg-[var(--brand-light)] text-[var(--brand-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  Overview &amp; Ports
                </button>
                <button
                  onClick={() => setInspectorTab('logs')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    inspectorTab === 'logs'
                      ? 'bg-[var(--brand-light)] text-[var(--brand-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  Logs ({activeContainer.logs.length})
                </button>
                <button
                  onClick={() => setInspectorTab('env')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    inspectorTab === 'env'
                      ? 'bg-[var(--brand-light)] text-[var(--brand-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  Environment
                </button>
                <button
                  onClick={() => setInspectorTab('mounts')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    inspectorTab === 'mounts'
                      ? 'bg-[var(--brand-light)] text-[var(--brand-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  Mounts ({activeContainer.mounts.length})
                </button>
              </div>

              {/* Tab 1: Overview */}
              {inspectorTab === 'overview' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase block">Status</span>
                    <span className="font-bold text-emerald-500 uppercase">{activeContainer.status}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] truncate">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase block">Base Image</span>
                    <span className="text-[var(--text-primary)] truncate block">{activeContainer.image}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase block">IP Address</span>
                    <span className="text-cyan-500 font-bold">
                      {Object.values(activeContainer.networks)[0]?.ipAddress || 'None'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase block">Resources</span>
                    <span className="text-[var(--text-primary)] font-bold">
                      {activeContainer.resources.cpuPercent}% CPU • {activeContainer.resources.memoryUsageMb}MB
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 2: Logs */}
              {inspectorTab === 'logs' && (
                <div className="p-3 rounded-xl bg-[#070d18] font-mono text-[11px] max-h-36 overflow-y-auto space-y-1 text-slate-300">
                  {activeContainer.logs.length === 0 ? (
                    <span className="text-slate-500 italic">No output recorded yet</span>
                  ) : (
                    activeContainer.logs.map((log, i) => (
                      <div key={i} className="leading-relaxed flex items-start space-x-2">
                        <span className="text-slate-500 shrink-0">[{log.timestamp.slice(11, 19)}]</span>
                        <span className={log.stream === 'stderr' ? 'text-rose-400' : 'text-slate-300'}>
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Environment Variables */}
              {inspectorTab === 'env' && (
                <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] font-mono text-[11px] space-y-1">
                  {Object.keys(activeContainer.environment).length === 0 ? (
                    <span className="text-[var(--text-muted)] italic">No custom environment variables specified (-e KEY=VAL)</span>
                  ) : (
                    Object.entries(activeContainer.environment).map(([k, v]) => (
                      <div key={k} className="flex items-center space-x-2">
                        <span className="font-bold text-[var(--brand-primary)]">{k}=</span>
                        <span className="text-[var(--text-primary)]">{v}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 4: Mounts */}
              {inspectorTab === 'mounts' && (
                <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] font-mono text-[11px] space-y-1.5">
                  {activeContainer.mounts.length === 0 ? (
                    <span className="text-[var(--text-muted)] italic">No volumes attached (-v source:dest)</span>
                  ) : (
                    activeContainer.mounts.map((m, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <HardDrive className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-bold text-amber-500">{m.source}</span>
                        <span className="text-[var(--text-muted)]">➔</span>
                        <span className="text-[var(--text-primary)]">{m.destination}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--bg-card)] text-[var(--text-muted)]">
                          {m.readonly ? 'ro' : 'rw'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
