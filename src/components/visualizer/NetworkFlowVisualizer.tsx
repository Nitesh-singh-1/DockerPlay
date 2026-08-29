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
  Zap,
  HelpCircle,
  Link as LinkIcon,
  Play,
  RotateCcw,
} from 'lucide-react';
import { DockerState } from '@/types/docker';
import { getDockerEngine } from '@/lib/simulator/DockerEngine';

interface NetworkFlowVisualizerProps {
  state: DockerState;
}

export function NetworkFlowVisualizer({ state }: NetworkFlowVisualizerProps) {
  const containers = Object.values(state.containers);
  const networks = Object.values(state.networks);

  const [sourceId, setSourceId] = useState<string>(containers[0]?.id || '');
  const [destTarget, setDestTarget] = useState<string>('db:5432');
  const [protocol, setProtocol] = useState<'HTTP' | 'PING' | 'TCP'>('TCP');

  const [traceState, setTraceState] = useState<{
    isRunning: boolean;
    step: number;
    dnsSuccess?: boolean;
    dnsResolvedIp?: string;
    networkSuccess?: boolean;
    responseBody?: string;
    statusCode?: number;
    errorMsg?: string;
    suggestedFix?: string;
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
          errorMsg: `Connection Refused: 'localhost' inside container "${sourceContainer.name}" refers to its OWN isolated loopback interface, not other containers or the host machine!`,
          suggestedFix: `Use the destination container's name (e.g. 'db:5432') on a user-defined network instead of 'localhost'.`,
        });
        return;
      }

      // Find matching destination container
      const targetContainer = containers.find(
        (c) =>
          c.status === 'running' &&
          (c.name === targetHostname ||
            c.id.startsWith(targetHostname) ||
            Object.values(c.networks).some(
              (n) => n.aliases.includes(targetHostname) || n.ipAddress === targetHostname
            ))
      );

      if (!targetContainer) {
        setTraceState({
          isRunning: false,
          step: 1,
          dnsSuccess: false,
          errorMsg: `DNS Lookup Failed: Hostname '${targetHostname}' could not be resolved by Docker DNS (127.0.0.11). Does container "${targetHostname}" exist and is it running?`,
          suggestedFix: `Run 'docker ps' to see active container names, or start one using 'docker run -d --name ${targetHostname} ...'`,
        });
        return;
      }

      // Check shared networks
      const sourceNets = Object.keys(sourceContainer.networks);
      const targetNets = Object.keys(targetContainer.networks);
      const sharedNets = sourceNets.filter((net) => targetNets.includes(net));

      if (sharedNets.length === 0) {
        setTraceState({
          isRunning: false,
          step: 2,
          dnsSuccess: false,
          errorMsg: `Network Isolation: Container '${sourceContainer.name}' and '${targetContainer.name}' are NOT on the same Docker network.`,
          suggestedFix: `Connect them with: docker network connect <network-name> ${targetContainer.name}`,
        });
        return;
      }

      // Prioritize user-defined networks (which support DNS)
      const customSharedNet = sharedNets.find((net) => net !== 'bridge');
      const activeNet = customSharedNet || 'bridge';

      if (!customSharedNet && activeNet === 'bridge') {
        setTraceState({
          isRunning: false,
          step: 2,
          dnsSuccess: false,
          errorMsg: `DNS Resolution Unavailable: The default 'bridge' network does NOT support automatic DNS lookup by container name (Docker by-design limitation).`,
          suggestedFix: `Create a custom user-defined network: docker network create app-net && docker network connect app-net ${sourceContainer.name} && docker network connect app-net ${targetContainer.name}`,
        });
        return;
      }

      // Step 2: Route Packet
      const resolvedIp = targetContainer.networks[activeNet]?.ipAddress || '172.20.0.3';
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
              status: '200 OK',
              protocol,
              source: `${sourceContainer.name} (${sourceContainer.networks[activeNet]?.ipAddress})`,
              destination: `${targetContainer.name}:${targetPort} (${resolvedIp})`,
              network: `${activeNet} (User-Defined Bridge)`,
              dnsServer: '127.0.0.11 (Embedded Docker DNS)',
              latencyMs: 0.38,
            },
            null,
            2
          ),
        });
      }, 600);
    }, 500);
  };

  const setPreset = (target: string, proto: 'HTTP' | 'PING' | 'TCP') => {
    setDestTarget(target);
    setProtocol(proto);
  };

  const handleCreateCustomNetwork = () => {
    const engine = getDockerEngine();
    engine.execute({
      raw: 'docker network create app-net',
      binary: 'docker',
      command: 'network',
      subcommand: 'create',
      flags: {},
      positionalArgs: ['app-net'],
      isValid: true,
    });
    // Connect all existing containers to app-net
    containers.forEach((c) => {
      engine.execute({
        raw: `docker network connect app-net ${c.name}`,
        binary: 'docker',
        command: 'network',
        subcommand: 'connect',
        flags: {},
        positionalArgs: ['app-net', c.name],
        isValid: true,
      });
    });
  };

  const isSharedCustomNetwork = () => {
    if (!sourceContainer) return false;
    const sourceNets = Object.keys(sourceContainer.networks).filter((n) => n !== 'bridge');
    return sourceNets.length > 0;
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm transition-colors min-h-0">
      {/* Title Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-header)] border-b border-[var(--border-color)] shrink-0">
        <div className="flex items-center space-x-2">
          <Network className="w-4 h-4 text-[var(--brand-primary)]" />
          <h3 className="font-bold text-[var(--text-primary)] text-xs font-display tracking-wide">
            Live Network Flow & Embedded DNS Resolution Simulator
          </h3>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--brand-light)] text-[var(--brand-primary)] border border-[var(--brand-primary)]/20">
            Embedded DNS: 127.0.0.11
          </span>
        </div>
      </div>

      {/* Quick Interactive Guide / How-To Banner */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-transparent border-b border-[var(--border-color)] shrink-0 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 text-[11px] leading-snug">
            <strong>How to test:</strong> Select a <em>Source</em> container, type a <em>Target</em> (e.g. <code>db:5432</code>), and click <strong>&quot;Send Request&quot;</strong> or run <code>docker exec api ping db</code> in the CLI!
          </span>
        </div>

        {/* Quick Connect Helper Button */}
        {!isSharedCustomNetwork() && containers.length >= 2 && (
          <button
            onClick={handleCreateCustomNetwork}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[var(--brand-primary)] text-white text-[10.5px] font-bold hover:brightness-110 shadow-sm transition-all shrink-0"
            title="Create user-defined bridge network and attach all containers"
          >
            <Zap className="w-3 h-3" />
            <span>Enable DNS (Create app-net)</span>
          </button>
        )}
      </div>

      {/* Control & Input Bar */}
      <div className="p-3 bg-[var(--bg-subtle)] border-b border-[var(--border-color)] flex flex-wrap items-center gap-2 text-xs shrink-0">
        {/* Source Selector */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[var(--text-secondary)] font-semibold text-[11px]">From:</span>
          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[var(--brand-primary)] font-mono shadow-sm"
          >
            {containers.length === 0 ? (
              <option value="">No running containers (run one first!)</option>
            ) : (
              containers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({Object.values(c.networks)[0]?.ipAddress || '172.17.0.2'})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Destination Target */}
        <div className="flex items-center space-x-1.5 flex-1 min-w-[180px]">
          <span className="text-[var(--text-secondary)] font-semibold text-[11px]">To:</span>
          <input
            type="text"
            value={destTarget}
            onChange={(e) => setDestTarget(e.target.value)}
            placeholder="db:5432 or api:5000 or localhost:5000"
            className="flex-1 bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-[var(--brand-primary)] shadow-sm"
          />
        </div>

        {/* Protocol */}
        <div className="flex items-center space-x-1">
          {(['TCP', 'HTTP', 'PING'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setProtocol(p)}
              className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold transition-all ${
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
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--brand-primary)] text-white font-bold text-xs hover:brightness-110 disabled:opacity-50 shadow-md shadow-[var(--brand-primary)]/20 transition-all shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send Request</span>
        </button>
      </div>

      {/* Quick Test Presets Pills */}
      <div className="px-3.5 py-1.5 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex items-center space-x-1.5 overflow-x-auto text-[10.5px] select-none scrollbar-none shrink-0">
        <span className="text-[var(--text-muted)] font-semibold uppercase tracking-wider text-[9.5px] mr-1 shrink-0">
          Presets:
        </span>
        <button
          onClick={() => setPreset('db:5432', 'TCP')}
          className="px-2 py-0.5 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--brand-light)] hover:text-[var(--brand-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] transition-all font-mono shrink-0"
        >
          🎯 db:5432 (Postgres)
        </button>
        <button
          onClick={() => setPreset('api:5000', 'HTTP')}
          className="px-2 py-0.5 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--brand-light)] hover:text-[var(--brand-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] transition-all font-mono shrink-0"
        >
          🌐 api:5000 (HTTP)
        </button>
        <button
          onClick={() => setPreset('localhost:5000', 'HTTP')}
          className="px-2 py-0.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-all font-mono shrink-0"
        >
          ❌ localhost:5000 (Why it fails)
        </button>
      </div>

      {/* Visual Canvas Area */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-grid-pattern min-h-0">
        {/* Visual Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-center">
          {/* Source Node */}
          <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm text-center relative">
            <div className="w-10 h-10 rounded-2xl bg-[var(--brand-light)] text-[var(--brand-primary)] flex items-center justify-center mx-auto mb-1.5 font-bold shadow-sm">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-[var(--text-primary)] font-display truncate">
              {sourceContainer?.name || 'Source Container'}
            </h4>
            <span className="text-[10px] font-mono text-[var(--text-muted)] block mt-0.5">
              IP: {Object.values(sourceContainer?.networks || {})[0]?.ipAddress || '172.17.0.2'}
            </span>
            <div className="mt-2 text-[9.5px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
              Packet Origin (Sender)
            </div>
          </div>

          {/* Docker Network Bridge & Embedded DNS */}
          <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 shadow-sm text-center relative">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-1.5 font-bold shadow-sm">
              <Network className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-[var(--text-primary)] font-display">
              {isSharedCustomNetwork() ? 'User-Defined Bridge (app-net)' : 'Default Bridge Network'}
            </h4>
            <span className="text-[10px] font-mono text-[var(--text-muted)] block mt-0.5">
              DNS Server: 127.0.0.11
            </span>
            {traceState?.isRunning ? (
              <div className="mt-2 flex items-center justify-center space-x-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 animate-pulse font-mono font-semibold">
                <Radio className="w-3.5 h-3.5 animate-spin" />
                <span>Resolving DNS & Routing Packet...</span>
              </div>
            ) : (
              <div className="mt-2 text-[9.5px] font-mono text-[var(--text-muted)] bg-[var(--bg-subtle)] py-0.5 rounded-full border border-[var(--border-color)]">
                {isSharedCustomNetwork() ? '✔ Automatic DNS Enabled' : '⚠ Default Bridge (No DNS by name)'}
              </div>
            )}
          </div>

          {/* Destination Node */}
          <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm text-center relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-1.5 font-bold shadow-sm">
              <Globe className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-[var(--text-primary)] font-display truncate">
              {destTarget}
            </h4>
            <span className="text-[10px] font-mono text-[var(--text-muted)] block mt-0.5">
              Resolved: {traceState?.dnsResolvedIp || 'Pending Request...'}
            </span>
            <div className="mt-2 text-[9.5px] font-mono text-[var(--text-muted)] bg-[var(--bg-subtle)] py-0.5 rounded-full border border-[var(--border-color)]">
              Target Socket ({protocol})
            </div>
          </div>
        </div>

        {/* Trace Inspector Card */}
        {traceState && !traceState.isRunning && (
          <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-md space-y-3 font-mono text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
              <span className="font-bold text-[var(--text-primary)] flex items-center space-x-1.5 font-display">
                <Sparkles className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>Packet Trace Result</span>
              </span>
              {traceState.networkSuccess ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 font-semibold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>200 OK Delivered</span>
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 flex items-center space-x-1 font-semibold text-[11px]">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Connection Failed</span>
                </span>
              )}
            </div>

            {/* Step 1: DNS */}
            <div className="flex items-start space-x-2 text-[11px]">
              <span className="w-4 h-4 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-center text-[9px] text-[var(--text-primary)] font-bold shrink-0 mt-0.5">
                1
              </span>
              <div>
                <span className="font-semibold text-[var(--text-primary)]">Docker DNS Lookup:</span>
                <span className="text-[var(--text-secondary)] ml-1.5">
                  Queried 127.0.0.11 for &quot;{destTarget.split(':')[0]}&quot; ➔{' '}
                  <strong className={traceState.dnsSuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                    {traceState.dnsResolvedIp || 'NXDOMAIN (Not Found)'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Diagnostic Explanation */}
            {traceState.errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 space-y-1.5">
                <div className="font-bold text-[11px] flex items-center space-x-1.5 font-display">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span>Why this happened:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[var(--text-primary)] font-sans">{traceState.errorMsg}</p>
                {traceState.suggestedFix && (
                  <div className="pt-1.5 border-t border-rose-500/20 text-[10.5px] font-mono text-rose-600 dark:text-rose-400">
                    💡 <strong>Fix:</strong> {traceState.suggestedFix}
                  </div>
                )}
              </div>
            )}

            {/* Response JSON */}
            {traceState.responseBody && (
              <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                <span className="text-[9.5px] text-[var(--text-muted)] uppercase block mb-1 font-semibold">
                  Delivered Packet Metadata:
                </span>
                <pre className="text-emerald-600 dark:text-emerald-400 text-[10.5px] whitespace-pre-wrap">{traceState.responseBody}</pre>
              </div>
            )}
          </div>
        )}

        {/* Core Mental Model Card */}
        <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] space-y-2 shadow-sm">
          <div className="flex items-center space-x-1.5 text-[var(--brand-primary)] font-bold font-display">
            <Info className="w-4 h-4" />
            <span>How Docker Container Networking Works:</span>
          </div>
          <ul className="text-[11px] text-[var(--text-secondary)] space-y-1.5 list-disc pl-4 font-sans leading-relaxed">
            <li>
              <strong>Default Bridge (172.17.0.0/16):</strong> Created automatically by Docker. Containers can reach each other <em>only by hardcoded IP</em> (no DNS by container name).
            </li>
            <li>
              <strong>User-Defined Bridge (e.g. <code>app-net</code>):</strong> Created with <code>docker network create app-net</code>. Docker enables its embedded DNS server (<code>127.0.0.11</code>) so containers discover each other automatically by name (e.g. <code>http://db:5432</code>).
            </li>
            <li>
              <strong>Testing in CLI:</strong> Use <code>docker exec &lt;container&gt; ping &lt;target&gt;</code> to ping inside a container, or test here in the visualizer!
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
