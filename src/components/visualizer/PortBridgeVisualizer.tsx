'use client';

import React, { useState } from 'react';
import {
  Globe,
  ArrowRight,
  Server,
  Shuffle,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export function PortBridgeVisualizer() {
  const [hostPort, setHostPort] = useState<number>(8080);
  const [containerPort, setContainerPort] = useState<number>(80);
  const [serviceType, setServiceType] = useState<string>('Nginx Web Server');

  const presets = [
    { name: 'Nginx (8080:80)', host: 8080, container: 80, service: 'Nginx Web Server' },
    { name: 'Node API (5000:5000)', host: 5000, container: 5000, service: 'Node.js Express API' },
    { name: 'PostgreSQL (5433:5432)', host: 5433, container: 5432, service: 'PostgreSQL Database' },
    { name: 'Redis (6379:6379)', host: 6379, container: 6379, service: 'Redis In-Memory Cache' },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm transition-colors">
      {/* Title */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-header)] border-b border-[var(--border-color)]">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-[var(--brand-primary)]" />
          <h3 className="font-bold text-[var(--text-primary)] text-xs font-display tracking-wide">
            Interactive Port Publishing & NAT Bridge Simulator (-p HOST:CONTAINER)
          </h3>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-grid-pattern">
        {/* Presets */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block font-mono">
            Common Port Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setHostPort(p.host);
                  setContainerPort(p.container);
                  setServiceType(p.service);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                  hostPort === p.host && containerPort === p.container
                    ? 'bg-[var(--brand-primary)] text-white shadow-md shadow-[var(--brand-primary)]/20'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)]'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Translation Bridge */}
        <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
            {/* Host Side */}
            <div className="md:col-span-4 p-5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[var(--text-primary)] font-display">
                  🖥️ Host Interface
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">0.0.0.0</span>
              </div>
              <div className="space-y-1">
                <label className="text-[10.5px] text-[var(--text-muted)] font-mono block">
                  Host Published Port:
                </label>
                <input
                  type="number"
                  value={hostPort}
                  onChange={(e) => setHostPort(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>
              <span className="text-[10.5px] font-mono text-[var(--brand-primary)] block font-semibold">
                Access: http://localhost:{hostPort}
              </span>
            </div>

            {/* Middle Pipeline Bridge */}
            <div className="md:col-span-3 flex flex-col items-center justify-center text-center space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)]">
                NAT Port Translation
              </span>
              <div className="flex items-center space-x-1 text-[var(--brand-primary)] font-bold">
                <div className="w-12 h-1 bg-[var(--brand-primary)] rounded-full animate-pulse" />
                <ArrowRight className="w-5 h-5" />
              </div>
              <code className="text-[11px] font-mono font-bold text-[var(--text-primary)] bg-[var(--bg-subtle)] px-2 py-0.5 rounded-lg border border-[var(--border-color)]">
                -p {hostPort}:{containerPort}
              </code>
            </div>

            {/* Container Side */}
            <div className="md:col-span-4 p-5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[var(--text-primary)] font-display">
                  📦 Container Isolated Port
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">172.18.0.2</span>
              </div>
              <div className="space-y-1">
                <label className="text-[10.5px] text-[var(--text-muted)] font-mono block">
                  Container Listening Port:
                </label>
                <input
                  type="number"
                  value={containerPort}
                  onChange={(e) => setContainerPort(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>
              <span className="text-[10.5px] font-mono text-emerald-600 dark:text-emerald-400 block font-semibold">
                Service: {serviceType}
              </span>
            </div>
          </div>
        </div>

        {/* Explanation Card */}
        <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] space-y-1.5 shadow-sm">
          <div className="flex items-center space-x-1.5 text-[var(--brand-primary)] font-bold font-display">
            <Info className="w-4 h-4" />
            <span>How `-p HOST:CONTAINER` Works:</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-sans">
            Docker configures iptables/NAT rules on your operating system so that any traffic arriving at{' '}
            <code className="text-[var(--brand-primary)] font-mono font-bold">localhost:{hostPort}</code> is transparently forwarded to the container&apos;s internal listening port{' '}
            <code className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">:{containerPort}</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
