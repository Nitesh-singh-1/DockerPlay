'use client';

import React, { useState } from 'react';
import {
  Network,
  Send,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Server,
  Globe,
  Radio,
  Sparkles,
  Info,
} from 'lucide-react';
import { DockerState } from '@/types/docker';

interface NetworkFlowVisualizerProps {
  state: DockerState;
}

export function NetworkFlowVisualizer({ state }: NetworkFlowVisualizerProps) {
  const containers = Object.values(state.containers);
  const networks = Object.values(state.networks);

  const [sourceId, setSourceId] = useState<string>(containers[0]?.id || '');
  const [destTarget, setDestTarget] = useState<string>('api:5000');
  const [protocol, setProtocol] = useState<'HTTP' | 'PING' | 'TCP'>('HTTP');

  const [traceState, setTraceState] = useState<{
    isRunning: boolean;
    step: number;
    dnsSuccess?: boolean;
    dnsResolvedIp?: string;
    networkSuccess?: boolean;
    responseBody?: string;
    statusCode?: number;
    errorMsg?: string;
  } | null>(null);

  const sourceContainer = state.containers[sourceId] || containers[0];

  const handleRunTrace = () => {
    if (!sourceContainer) return;

    setTraceState({ isRunning: true, step: 1 });

    const targetHostname = destTarget.replace(/^(http|https):\/\//, '').split('/')[0].split(':')[0];
    const targetPort = destTarget.includes(':') ? parseInt(destTarget.split(':')[1], 10) : 80;

    // Simulation Step 1: DNS Lookup
    setTimeout(() => {
      // Check if target is localhost
      if (targetHostname === 'localhost' || targetHostname === '127.0.0.1') {
        setTraceState({
          isRunning: false,
          step: 2,
          dnsSuccess: true,
          dnsResolvedIp: '127.0.0.1 (Loopback)',
          networkSuccess: false,
          errorMsg: `Connection Refused: 'localhost' refers to ${sourceContainer.name}'s own internal loopback interface, not other containers on the host!`,
        });
        return;
      }

      // Find matching destination container
      const targetContainer = containers.find(
        (c) => c.status === 'running' && (c.name === targetHostname || Object.values(c.networks).some((n) => n.aliases.includes(targetHostname) || n.ipAddress === targetHostname))
      );

      // Check shared network
      const sourceNets = Object.keys(sourceContainer.networks);
      const sharedNet = targetContainer ? Object.keys(targetContainer.networks).find((net) => sourceNets.includes(net)) : undefined;

      if (!targetContainer) {
        setTraceState({
          isRunning: false,
          step: 1,
          dnsSuccess: false,
          errorMsg: `DNS Lookup Failed: Hostname '${targetHostname}' could not be resolved by Docker DNS. Does this container exist?`,
        });
        return;
      }

      if (!sharedNet) {
        setTraceState({
          isRunning: false,
          step: 2,
          dnsSuccess: false,
          errorMsg: `Network Isolation: Container '${sourceContainer.name}' and '${targetContainer.name}' are NOT on the same Docker network! Attach them to the same custom bridge network.`,
        });
        return;
      }

      if (sharedNet === 'bridge') {
        setTraceState({
          isRunning: false,
          step: 2,
          dnsSuccess: false,
          errorMsg: `DNS Resolution Unavailable: Default 'bridge' network does NOT support DNS lookup by container name. Create a custom network with 'docker network create app-net'.`,
        });
        return;
      }

      // Step 2: Route Packet
      const resolvedIp = targetContainer.networks[sharedNet]?.ipAddress || '172.18.0.3';
      setTraceState({
        isRunning: true,
        step: 2,
        dnsSuccess: true,
        dnsResolvedIp: resolvedIp,
      });

      // Step 3: Response Delivered
      setTimeout(() => {
        setTraceState({
          isRunning: false,
          step: 3,
          dnsSuccess: true,
          dnsResolvedIp: resolvedIp,
          networkSuccess: true,
          statusCode: 200,
          responseBody: JSON.stringify(
            {
              status: 'success',
              source: sourceContainer.name,
              destination: `${targetContainer.name}:${targetPort}`,
              network: sharedNet,
              ip: resolvedIp,
              latencyMs: 0.42,
            },
            null,
            2
          ),
        });
      }, 700);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm transition-colors">
      {/* Title */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-header)] border-b border-[var(--border-color)]">
        <div className="flex items-center space-x-2">
          <Network className="w-4 h-4 text-[var(--brand-primary)]" />
          <h3 className="font-bold text-[var(--text-primary)] text-xs font-display tracking-wide">
            Live Network Flow & Embedded DNS Resolution Simulator
          </h3>
        </div>
        <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-[var(--brand-light)] text-[var(--brand-primary)] border border-[var(--brand-primary)]/20">
          DNS: 127.0.0.11
        </span>
      </div>

      {/* Control Bar */}
      <div className="p-4 bg-[var(--bg-subtle)] border-b border-[var(--border-color)] flex flex-wrap items-center gap-3 text-xs">
        {/* Source Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-[var(--text-secondary)] font-semibold">Source:</span>
          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[var(--brand-primary)] font-mono shadow-sm"
          >
            {containers.length === 0 ? (
              <option value="">No running containers</option>
            ) : (
              containers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({Object.values(c.networks)[0]?.ipAddress || 'no-ip'})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Destination Target */}
        <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
          <span className="text-[var(--text-secondary)] font-semibold">Target:</span>
          <input
            type="text"
            value={destTarget}
            onChange={(e) => setDestTarget(e.target.value)}
            placeholder="api:5000 or database:5432 or localhost:5000"
            className="flex-1 bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[var(--brand-primary)] shadow-sm"
          />
        </div>

        {/* Protocol */}
        <div className="flex items-center space-x-1">
          {(['HTTP', 'PING', 'TCP'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setProtocol(p)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                protocol === p
                  ? 'bg-[var(--brand-primary)] text-white shadow-md shadow-[var(--brand-primary)]/20'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Send Request Button */}
        <button
          onClick={handleRunTrace}
          disabled={traceState?.isRunning || !sourceContainer}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-[var(--brand-primary)] text-white font-bold text-xs hover:brightness-110 disabled:opacity-50 shadow-md shadow-[var(--brand-primary)]/20 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send Request</span>
        </button>
      </div>

      {/* Visual Canvas */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-grid-pattern">
        {/* Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Source Node */}
          <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm text-center relative">
            <div className="w-11 h-11 rounded-2xl bg-[var(--brand-light)] text-[var(--brand-primary)] flex items-center justify-center mx-auto mb-2 font-bold shadow-sm">
              <Server className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-xs text-[var(--text-primary)] font-display">{sourceContainer?.name || 'Source Container'}</h4>
            <span className="text-[10px] font-mono text-[var(--text-muted)] block mt-0.5">
              IP: {Object.values(sourceContainer?.networks || {})[0]?.ipAddress || '172.18.0.2'}
            </span>
            <div className="mt-2 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
              Packet Origin
            </div>
          </div>

          {/* Docker Network Bridge & DNS */}
          <div className="p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 shadow-sm text-center relative">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-2 font-bold shadow-sm">
              <Network className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-xs text-[var(--text-primary)] font-display">Docker Virtual Bridge</h4>
            <span className="text-[10px] font-mono text-[var(--text-muted)] block mt-0.5">
              Embedded DNS: 127.0.0.11
            </span>
            {traceState?.isRunning && (
              <div className="mt-2 flex items-center justify-center space-x-1.5 text-[10.5px] text-indigo-600 dark:text-indigo-400 animate-pulse font-mono font-semibold">
                <Radio className="w-3.5 h-3.5 animate-spin" />
                <span>Resolving DNS & Routing...</span>
              </div>
            )}
          </div>

          {/* Destination Node */}
          <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm text-center relative">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2 font-bold shadow-sm">
              <Globe className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-xs text-[var(--text-primary)] font-display">{destTarget}</h4>
            <span className="text-[10px] font-mono text-[var(--text-muted)] block mt-0.5">
              Resolved: {traceState?.dnsResolvedIp || 'Pending...'}
            </span>
            <div className="mt-2 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-subtle)] py-0.5 rounded-full border border-[var(--border-color)]">
              Target Socket
            </div>
          </div>
        </div>

        {/* Trace Inspector Card */}
        {traceState && (
          <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-md space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
              <span className="font-bold text-[var(--text-primary)] flex items-center space-x-2 font-display">
                <Sparkles className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>Packet Trace Inspector</span>
              </span>
              {traceState.networkSuccess ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>200 OK Delivered</span>
                </span>
              ) : traceState.errorMsg ? (
                <span className="text-rose-600 dark:text-rose-400 flex items-center space-x-1 font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Connection Failed</span>
                </span>
              ) : null}
            </div>

            {/* Step 1: DNS */}
            <div className="flex items-start space-x-2 text-xs">
              <span className="w-5 h-5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-center text-[10px] text-[var(--text-primary)] font-bold shrink-0">
                1
              </span>
              <div>
                <span className="font-semibold text-[var(--text-primary)]">Docker DNS Lookup:</span>
                <span className="text-[var(--text-secondary)] ml-2">
                  Queried 127.0.0.11 for hostname &quot;{destTarget.split(':')[0]}&quot; ➔{' '}
                  <strong className={traceState.dnsSuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                    {traceState.dnsResolvedIp || (traceState.errorMsg ? 'NXDOMAIN' : 'Querying...')}
                  </strong>
                </span>
              </div>
            </div>

            {/* Error Message */}
            {traceState.errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 space-y-1">
                <div className="font-bold text-[11px] flex items-center space-x-1.5 font-display">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>Why this request failed:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[var(--text-primary)] font-sans">{traceState.errorMsg}</p>
              </div>
            )}

            {/* Response JSON */}
            {traceState.responseBody && (
              <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] uppercase block mb-1">Response JSON Body:</span>
                <pre className="text-emerald-600 dark:text-emerald-400 text-[11px] whitespace-pre-wrap">{traceState.responseBody}</pre>
              </div>
            )}
          </div>
        )}

        {/* Mental Model Callout */}
        <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] space-y-1.5 shadow-sm">
          <div className="flex items-center space-x-1.5 text-[var(--brand-primary)] font-bold font-display">
            <Info className="w-4 h-4" />
            <span>Key Docker Networking Mental Model:</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-sans">
            Containers on the <strong>same user-defined network</strong> can communicate seamlessly using container names (e.g.{' '}
            <code className="text-[var(--brand-primary)] font-mono font-bold">http://api:5000</code>). Docker automatically runs an embedded DNS server that intercepts name lookups and resolves them to internal container IPs.
          </p>
        </div>
      </div>
    </div>
  );
}
