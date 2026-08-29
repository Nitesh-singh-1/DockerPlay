'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Network,
  ArrowRightLeft,
  Server,
  Box,
  FileCode,
  Sparkles,
  Terminal as TerminalIcon,
} from 'lucide-react';
import { getDockerEngine } from '@/lib/simulator/DockerEngine';
import { DockerState } from '@/types/docker';
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
  const [mobileMode, setMobileMode] = useState<'visualizer' | 'terminal'>('visualizer');

  useEffect(() => {
    const unsub = engine.subscribe((newState) => {
      setState(newState);
    });
    return () => unsub();
  }, [engine]);

  const tabs: Array<{ id: VisualizerTab; label: string; icon: React.ElementType }> = [
    { id: 'topology', label: 'Topology', icon: Layers },
    { id: 'network-flow', label: 'Networks', icon: Network },
    { id: 'port-bridge', label: 'Port Bridge', icon: ArrowRightLeft },
    { id: 'image-layers', label: 'Image Layers', icon: FileCode },
    { id: 'compose', label: 'Compose 3-Tier', icon: Server },
    { id: 'containers-table', label: 'Containers', icon: Box },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-page)] overflow-hidden">
      {/* Mobile View Switcher (< lg) */}
      <div className="lg:hidden shrink-0 h-11 bg-[var(--bg-header)] border-b border-[var(--border-color)] px-3 flex items-center justify-between">
        <div className="flex items-center space-x-1 w-full max-w-xs mx-auto">
          <button
            onClick={() => setMobileMode('visualizer')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mobileMode === 'visualizer'
                ? 'bg-[var(--brand-primary)] text-white shadow-sm font-bold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Visualizer</span>
          </button>
          <button
            onClick={() => setMobileMode('terminal')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mobileMode === 'terminal'
                ? 'bg-[var(--brand-primary)] text-white shadow-sm font-bold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>
        </div>
      </div>

      {/* Top Visualizer Tab Bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[var(--bg-card)] border-b border-[var(--border-color)] overflow-x-auto shadow-sm no-scrollbar">
        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-mono mr-2 hidden sm:inline">
            Visualizer Mode:
          </span>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMode('visualizer');
                }}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
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

      {/* Main Split Layout: Desktop 7:5 / Mobile Toggle */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2.5 p-2.5 overflow-hidden">
        {/* Visualizer Canvas Area */}
        <div
          className={`lg:col-span-7 h-full flex flex-col overflow-hidden ${
            mobileMode === 'visualizer' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {activeTab === 'topology' && <ArchitectureCanvas state={state} />}
          {activeTab === 'network-flow' && <NetworkFlowVisualizer state={state} />}
          {activeTab === 'port-bridge' && <PortBridgeVisualizer />}
          {activeTab === 'image-layers' && <ImageLayerVisualizer />}
          {activeTab === 'compose' && <ComposeTopologyVisualizer state={state} />}
          {activeTab === 'containers-table' && (
            <ContainerExplorer containers={Object.values(state.containers)} />
          )}
        </div>

        {/* Interactive CLI Terminal Area */}
        <div
          className={`lg:col-span-5 h-full flex flex-col overflow-hidden ${
            mobileMode === 'terminal' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <DockerTerminal className="h-full w-full" />
        </div>
      </div>

      {/* Mobile Floating Terminal Quick Action (Visible only on mobile visualizer mode) */}
      {mobileMode === 'visualizer' && (
        <div className="lg:hidden fixed bottom-4 right-4 z-30">
          <button
            onClick={() => setMobileMode('terminal')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-[var(--brand-primary)] text-white font-bold text-xs shadow-xl shadow-[var(--brand-primary)]/30 hover:scale-105 active:scale-95 transition-all"
          >
            <TerminalIcon className="w-4 h-4" />
            <span>Open Terminal ($)</span>
          </button>
        </div>
      )}
    </div>
  );
}
