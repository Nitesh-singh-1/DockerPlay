---
name: ui
description: >-
  Build, style, and optimize UI visualizers, workstation layouts, and terminal elements in DockerPlay.
  Use this skill when creating new visualization canvases, styling components with Tailwind CSS,
  or enforcing layout and viewport invariants.
---

# UI & Visualizer Engineering Skill

This skill provides the standard runbook for building reactive Docker visualizers, maintaining the dark terminal design system, and implementing workstation layouts in DockerPlay.

---

## 🎨 Visualizer Component Blueprint

When building a new visualizer (e.g. in `src/components/visualizer/`):

1. **Reactive State Subscription**:
   Always subscribe to `getDockerEngine()` and clean up on unmount:
   ```tsx
   'use client';

   import React, { useState, useEffect } from 'react';
   import { getDockerEngine } from '@/lib/simulator/DockerEngine';
   import { DockerState } from '@/types/docker';

   export function MyCustomVisualizer() {
     const engine = getDockerEngine();
     const [state, setState] = useState<DockerState>(() => engine.getState());

     useEffect(() => {
       const unsubscribe = engine.subscribe((newState) => {
         setState(newState);
       });
       return () => unsubscribe();
     }, [engine]);

     return (
       <div className="h-full min-h-0 flex flex-col bg-zinc-950 p-4 border border-zinc-800 rounded-lg overflow-hidden">
         {/* Visualizer content with internal scroll */}
         <div className="flex-1 min-h-0 overflow-y-auto">
           {/* Dynamic nodes */}
         </div>
       </div>
     );
   }
   ```

2. **Framer Motion Animations**:
   - Use `AnimatePresence` for containers being added/removed:
   ```tsx
   import { motion, AnimatePresence } from 'framer-motion';

   <AnimatePresence>
     {Object.values(state.containers).map((c) => (
       <motion.div
         key={c.id}
         initial={{ opacity: 0, scale: 0.95, y: 10 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.9, y: -10 }}
         transition={{ duration: 0.2 }}
         className="p-3 rounded-md bg-zinc-900 border border-zinc-800"
       >
         {c.name}
       </motion.div>
     ))}
   </AnimatePresence>
   ```

---

## 📐 Workstation Layout Rules

When embedding visualizers alongside `DockerTerminal`:
- **Split Container**:
  ```tsx
  <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden">
    {/* Visualizer Column */}
    <div className="lg:col-span-7 h-full min-h-0 overflow-hidden flex flex-col">
      <MyCustomVisualizer />
    </div>

    {/* Terminal Column (MUST have min-h-0) */}
    <div className="lg:col-span-5 h-full min-h-0 overflow-hidden flex flex-col">
      <DockerTerminal />
    </div>
  </div>
  ```

---

## 🎨 Theme Classes Quick Reference

- **Panels**: `bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl`
- **Headers**: `h-10 px-3 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50`
- **Badges**:
  - Running: `px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`
  - Paused: `px-2 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20`
  - Stopped/Exited: `px-2 py-0.5 text-xs rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700`
- **Buttons**: `px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition-colors`

