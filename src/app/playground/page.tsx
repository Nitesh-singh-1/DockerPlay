'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Network,
  ArrowRightLeft,
  Server,
  Box,
  FileCode,
  LayoutGrid,
  Sparkles,
} from 'lucide-react';
import { getDockerEngine } from '@/lib/simulator/DockerEngine';
import { DockerState, Container } from '@/types/docker';
import { DockerTerminal } from '@/components/terminal/DockerTerminal';
import { ArchitectureCanvas } from '@/components/visualizer/ArchitectureCanvas';
import { NetworkFlowVisualizer } from '@/components/visualizer/NetworkFlowVisualizer';
import { PortBridgeVisualizer } from '@/components/visualizer/PortBridgeVisualizer';
import { ImageLayerVisualizer } from '@/components/visualizer/ImageLayerVisualizer';
import { ComposeTopologyVisualizer } from '@/components/visualizer/ComposeTopologyVisualizer';
import { ContainerExplorer } from '@/components/explorer/ContainerExplorer';

type VisualizerTab =
  | 'topology'
  | 'network-flow'
  | 'port-bridge'
  | 'image-layers'
  | 'compose'
  | 'containers-table';

export default function PlaygroundPage() {
  const [engine] = useState(() => getDockerEngine());
  const [state, setState] = useState<DockerState>(() => engine.getState());
  const [activeTab, setActiveTab] = useState<VisualizerTab>('topology');
  const [lastExecutedCommand, setLastExecutedCommand] = useState<string>('');

  useEffect(() => {
    const unsub = engine.subscribe((newState) => {
      setState(newState);
    });
    return () => unsub();
  }, [engine]);

  const tabs: Array<{ id: VisualizerTab; label: string; icon: React.ElementType }> = [
    { id: 'topology', label: 'Topology Canvas', icon: Layers },
    { id: 'network-flow', label: 'Network & DNS Flow', icon: Network },
    { id: 'port-bridge', label: 'Port NAT Bridge', icon: ArrowRightLeft },
    { id: 'image-layers', label: 'Image Layers & Cache', icon: FileCode },
    { id: 'compose', label: 'Compose 3-Tier Studio', icon: Server },
    { id: 'containers-table', label: 'Container Table', icon: Box },
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] bg-[var(--bg-page)] overflow-hidden">
      {/* Top Visualizer Tab Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-card)] border-b border-[var(--border-color)] overflow-x-auto shadow-sm">
        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-mono mr-2 hidden sm:inline">
            Active Visualizer:
          </span>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-[var(--brand-light)] text-[var(--brand-primary)] border border-[var(--brand-primary)]/30 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center space-x-2 text-[11px] font-mono text-[var(--text-muted)]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time State Sync</span>
        </div>
      </div>

      {/* Main Split Layout: Top Visualizer + Bottom Terminal */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2.5 p-2.5 overflow-hidden">
        {/* Visualizer Canvas Area (7 Cols on desktop) */}
        <div className="lg:col-span-7 h-full flex flex-col overflow-hidden">
          {activeTab === 'topology' && <ArchitectureCanvas state={state} />}
          {activeTab === 'network-flow' && <NetworkFlowVisualizer state={state} />}
          {activeTab === 'port-bridge' && <PortBridgeVisualizer />}
          {activeTab === 'image-layers' && <ImageLayerVisualizer />}
          {activeTab === 'compose' && <ComposeTopologyVisualizer state={state} />}
          {activeTab === 'containers-table' && <ContainerExplorer containers={Object.values(state.containers)} />}
        </div>

        {/* Interactive CLI Terminal Area (5 Cols on desktop) */}
        <div className="lg:col-span-5 h-full flex flex-col overflow-hidden">
          <DockerTerminal
            className="h-full"
            onCommandExecuted={(cmd) => setLastExecutedCommand(cmd)}
          />
        </div>
      </div>
    </div>
  );
}
