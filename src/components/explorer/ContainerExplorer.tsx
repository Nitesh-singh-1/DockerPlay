'use client';

import React from 'react';
import {
  Box,
  Play,
  Square,
  RotateCcw,
  Trash2,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Container } from '@/types/docker';
import { getDockerEngine } from '@/lib/simulator/DockerEngine';

interface ContainerExplorerProps {
  containers: Container[];
  onSelect?: (c: Container) => void;
}

export function ContainerExplorer({ containers, onSelect }: ContainerExplorerProps) {
  const handleStop = (id: string) => {
    getDockerEngine().execute({
      raw: `docker stop ${id}`,
      binary: 'docker',
      command: 'stop',
      flags: {},
      positionalArgs: [id],
      isValid: true,
    });
  };

  const handleStart = (id: string) => {
    getDockerEngine().execute({
      raw: `docker start ${id}`,
      binary: 'docker',
      command: 'start',
      flags: {},
      positionalArgs: [id],
      isValid: true,
    });
  };

  const handleRestart = (id: string) => {
    getDockerEngine().execute({
      raw: `docker restart ${id}`,
      binary: 'docker',
      command: 'restart',
      flags: {},
      positionalArgs: [id],
      isValid: true,
    });
  };

  const handleRemove = (id: string) => {
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
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-header)] border-b border-[var(--border-color)]">
        <div className="flex items-center space-x-2">
          <Box className="w-4 h-4 text-[var(--brand-primary)]" />
          <h3 className="font-bold text-[var(--text-primary)] text-xs font-display tracking-wide">
            Container Explorer & Resource Table
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[var(--text-muted)]">
          {containers.length} Total Containers
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[var(--bg-subtle)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider border-b border-[var(--border-color)]">
            <tr>
              <th className="px-4 py-2.5">Name / ID</th>
              <th className="px-4 py-2.5">Image</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Port Mappings</th>
              <th className="px-4 py-2.5">Memory</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
            {containers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-muted)]">
                  No containers found in simulated engine.
                </td>
              </tr>
            ) : (
              containers.map((c) => {
                const isRunning = c.status === 'running';
                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelect?.(c)}
                    className="hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <div>
                          <span className="font-bold block text-[11.5px] font-display">{c.name}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">{c.id.slice(0, 10)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">{c.image}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[9.5px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          isRunning
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-color)]'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10.5px]">
                      {c.ports.length > 0 ? (
                        c.ports.map((p, i) => (
                          <span key={i} className="text-[var(--brand-primary)] font-semibold block">
                            :{p.hostPort} ➔ :{p.containerPort}
                          </span>
                        ))
                      ) : (
                        <span className="text-[var(--text-muted)] italic">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">
                      {c.resources.memoryUsageMb} MB
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                        {isRunning ? (
                          <button
                            onClick={() => handleStop(c.id)}
                            title="Stop"
                            className="p-1 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-amber-500"
                          >
                            <Square className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStart(c.id)}
                            title="Start"
                            className="p-1 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-emerald-500"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRestart(c.id)}
                          title="Restart"
                          className="p-1 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--brand-primary)]"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemove(c.id)}
                          title="Remove"
                          className="p-1 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
