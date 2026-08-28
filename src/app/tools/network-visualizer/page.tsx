'use client';

import React, { useState, useEffect } from 'react';
import { NetworkFlowVisualizer } from '@/components/visualizer/NetworkFlowVisualizer';
import { DockerTerminal } from '@/components/terminal/DockerTerminal';
import { getDockerEngine } from '@/lib/simulator/DockerEngine';
import { DockerState } from '@/types/docker';

export default function StandaloneNetworkVisualizerPage() {
  const [engine] = useState(() => getDockerEngine());
  const [state, setState] = useState<DockerState>(() => engine.getState());

  useEffect(() => {
    const unsub = engine.subscribe((newState) => {
      setState(newState);
    });
    return () => unsub();
  }, [engine]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] bg-[#090d16] p-2 gap-2 overflow-hidden">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 h-full overflow-hidden">
        <div className="lg:col-span-7 h-full flex flex-col overflow-hidden">
          <NetworkFlowVisualizer state={state} />
        </div>
        <div className="lg:col-span-5 h-full flex flex-col overflow-hidden">
          <DockerTerminal className="h-full" />
        </div>
      </div>
    </div>
  );
}
