'use client';

import React, { useState, useEffect } from 'react';
import { DockerfileStudioVisualizer } from '@/components/visualizer/DockerfileStudioVisualizer';
import { DockerTerminal } from '@/components/terminal/DockerTerminal';
import { getDockerEngine } from '@/lib/simulator/DockerEngine';
import { DockerState } from '@/types/docker';

export default function DockerfileStudioPage() {
  const [engine] = useState(() => getDockerEngine());
  const [state, setState] = useState<DockerState>(() => engine.getState());

  useEffect(() => {
    const unsub = engine.subscribe((newState) => {
      setState(newState);
    });
    return () => unsub();
  }, [engine]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] min-h-0 bg-[#090d16] p-2 gap-2 overflow-hidden">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 h-full min-h-0 overflow-hidden">
        <div className="lg:col-span-7 h-full min-h-0 flex flex-col overflow-hidden">
          <DockerfileStudioVisualizer />
        </div>
        <div className="lg:col-span-5 h-full min-h-0 flex flex-col overflow-hidden">
          <DockerTerminal className="h-full" />
        </div>
      </div>
    </div>
  );
}
