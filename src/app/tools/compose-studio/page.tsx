'use client';

import React, { useState, useEffect } from 'react';
import { Box, Terminal as TerminalIcon } from 'lucide-react';
import { ComposeTopologyVisualizer } from '@/components/visualizer/ComposeTopologyVisualizer';
import { DockerTerminal } from '@/components/terminal/DockerTerminal';
import { getDockerEngine } from '@/lib/simulator/DockerEngine';
import { DockerState } from '@/types/docker';

export default function ComposeStudioPage() {
  const [engine] = useState(() => getDockerEngine());
  const [state, setState] = useState<DockerState>(() => engine.getState());
  const [mobileMode, setMobileMode] = useState<'studio' | 'terminal'>('studio');

  useEffect(() => {
    const unsub = engine.subscribe((newState) => {
      setState(newState);
    });
    return () => unsub();
  }, [engine]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] min-h-0 bg-[var(--bg-page)] overflow-hidden">
      {/* Mobile / Tablet Tab Switcher (< lg) */}
      <div className="lg:hidden shrink-0 h-11 bg-[var(--bg-header)] border-b border-[var(--border-color)] px-3 flex items-center justify-between z-30">
        <div className="flex items-center space-x-1 w-full max-w-xs mx-auto">
          <button
            onClick={() => setMobileMode('studio')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mobileMode === 'studio'
                ? 'bg-[var(--brand-primary)] text-white shadow-sm font-bold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Compose Studio</span>
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

      {/* Main Workstation Layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2 p-2 overflow-hidden">
        <div
          className={`lg:col-span-7 h-full min-h-0 flex flex-col overflow-hidden ${
            mobileMode === 'studio' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <ComposeTopologyVisualizer state={state} />
        </div>
        <div
          className={`lg:col-span-5 h-full min-h-0 flex flex-col overflow-hidden ${
            mobileMode === 'terminal' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <DockerTerminal className="h-full w-full min-h-0" />
        </div>
      </div>
    </div>
  );
}
