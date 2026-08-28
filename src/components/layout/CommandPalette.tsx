'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Terminal,
  BookOpen,
  Target,
  Wrench,
  HelpCircle,
  RotateCcw,
  Layers,
  Box,
  Network,
  HardDrive,
  X,
} from 'lucide-react';
import { getDockerEngine } from '@/lib/simulator/DockerEngine';

interface PaletteItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Tools' | 'Chapters' | 'Missions' | 'Actions';
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items: PaletteItem[] = [
    {
      id: 'nav-playground',
      title: 'Open Docker Visual Playground',
      category: 'Navigation',
      icon: <Terminal className="w-4 h-4 text-docker-blue" />,
      action: () => { router.push('/playground'); onClose(); },
    },
    {
      id: 'nav-curriculum',
      title: 'Curriculum: Chapter 1 - What is Docker?',
      category: 'Chapters',
      icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
      action: () => { router.push('/curriculum/ch-01'); onClose(); },
    },
    {
      id: 'nav-ch-run',
      title: 'Curriculum: Chapter 4 - Mastering docker run',
      category: 'Chapters',
      icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
      action: () => { router.push('/curriculum/ch-04'); onClose(); },
    },
    {
      id: 'nav-ch-net',
      title: 'Curriculum: Chapter 6 - Container Networking & DNS',
      category: 'Chapters',
      icon: <Network className="w-4 h-4 text-emerald-400" />,
      action: () => { router.push('/curriculum/ch-06'); onClose(); },
    },
    {
      id: 'nav-ch-compose',
      title: 'Curriculum: Chapter 9 - Docker Compose',
      category: 'Chapters',
      icon: <Layers className="w-4 h-4 text-emerald-400" />,
      action: () => { router.push('/curriculum/ch-09'); onClose(); },
    },
    {
      id: 'nav-missions',
      title: 'Docker Missions Hub (10 Progressive Challenges)',
      category: 'Missions',
      icon: <Target className="w-4 h-4 text-amber-400" />,
      action: () => { router.push('/missions'); onClose(); },
    },
    {
      id: 'nav-breakfix',
      title: 'Break/Fix Troubleshooting Sandbox',
      category: 'Tools',
      icon: <Wrench className="w-4 h-4 text-rose-400" />,
      action: () => { router.push('/break-fix'); onClose(); },
    },
    {
      id: 'nav-cheatsheet',
      title: 'Docker Command Cheat Sheet',
      category: 'Tools',
      icon: <HelpCircle className="w-4 h-4 text-purple-400" />,
      action: () => { router.push('/tools/cheat-sheet'); onClose(); },
    },
    {
      id: 'nav-network-viz',
      title: 'Interactive Network & DNS Visualizer',
      category: 'Tools',
      icon: <Network className="w-4 h-4 text-cyan-400" />,
      action: () => { router.push('/tools/network-visualizer'); onClose(); },
    },
    {
      id: 'nav-compose-studio',
      title: 'Docker Compose Live Studio',
      category: 'Tools',
      icon: <Layers className="w-4 h-4 text-indigo-400" />,
      action: () => { router.push('/tools/compose-studio'); onClose(); },
    },
    {
      id: 'act-reset',
      title: 'Reset Simulated Docker Environment',
      category: 'Actions',
      icon: <RotateCcw className="w-4 h-4 text-rose-400" />,
      action: () => {
        getDockerEngine().reset();
        onClose();
      },
    },
  ];

  const filtered = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command, chapter, tool, or action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No matching commands or pages found.
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-800/80 transition-colors text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded-md bg-slate-800 border border-slate-700 group-hover:border-docker-blue/40 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium text-slate-200 group-hover:text-docker-accent">
                    {item.title}
                  </span>
                </div>
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-700/50">
                  {item.category}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-500">
          <span>Navigate with mouse or enter</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
