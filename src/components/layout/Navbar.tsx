'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Terminal,
  BookOpen,
  Target,
  Wrench,
  HelpCircle,
  Layers,
  RotateCcw,
  Command,
  Flame,
  Palette,
  Sun,
  Moon,
  ChevronDown,
  Check,
  Menu,
  X,
  Github,
  FileCode,
  Box,
  Network,
} from 'lucide-react';
import { ProgressManager } from '@/lib/persistence/ProgressManager';
import { UserProgress } from '@/types/progress';
import { CommandPalette } from './CommandPalette';
import { getDockerEngine } from '@/lib/simulator/DockerEngine';
import { useTheme, ColorBrand } from '@/context/ThemeContext';

export function Navbar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState<UserProgress>(ProgressManager.load());
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const { mode, brand, setBrand, toggleMode } = useTheme();

  useEffect(() => {
    setProgress(ProgressManager.load());
    const interval = setInterval(() => {
      setProgress(ProgressManager.load());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setIsToolsMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on page change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsThemeMenuOpen(false);
    setIsToolsMenuOpen(false);
  }, [pathname]);

  const handleReset = () => {
    getDockerEngine().reset();
    setConfirmReset(false);
  };

  const levelInfo = ProgressManager.getLevelInfo(progress.xpPoints || 50);

  const primaryNavLinks = [
    { href: '/playground/', label: 'Playground', icon: Terminal },
    { href: '/curriculum/', label: 'Curriculum', icon: BookOpen },
    { href: '/missions/', label: 'Missions', icon: Target },
    { href: '/break-fix/', label: 'Break/Fix', icon: Wrench },
  ];

  const toolsNavLinks = [
    { href: '/tools/compose-studio/', label: 'Compose Studio', icon: Box, desc: 'Multi-service YAML editor & visualizer' },
    { href: '/tools/dockerfile-studio/', label: 'Dockerfile Studio', icon: FileCode, desc: 'Multi-stage image builder & layer cache' },
    { href: '/tools/network-visualizer/', label: 'Network Tracer', icon: Network, desc: 'Bridge packet tracer & DNS 127.0.0.11' },
    { href: '/tools/cheat-sheet/', label: 'Cheat Sheet', icon: HelpCircle, desc: 'Categorized CLI command reference' },
  ];

  const brandThemes: Array<{
    id: ColorBrand;
    name: string;
    description: string;
    colorDot: string;
  }> = [
    {
      id: 'harbor',
      name: 'Docker Harbor',
      description: 'Iconic Docker Whale Blue & deep nautical slate',
      colorDot: 'bg-[#0db7ed]',
    },
    {
      id: 'cargo',
      name: 'Cargo Wharf',
      description: 'Warm timber amber & container yard contrast',
      colorDot: 'bg-[#f59e0b]',
    },
    {
      id: 'blueprint',
      name: 'Electric Blueprint',
      description: 'Technical cyan & architectural grid',
      colorDot: 'bg-[#06b6d4]',
    },
    {
      id: 'midnight',
      name: 'Midnight Studio',
      description: 'Dark obsidian developer theme',
      colorDot: 'bg-[#818cf8]',
    },
  ];

  return (
    <>
      <header className="h-14 shrink-0 bg-[var(--bg-header)] backdrop-blur-md border-b border-[var(--border-color)] px-3 sm:px-4 lg:px-6 flex items-center justify-between z-40 transition-colors">
        {/* Brand & Left Navigation */}
        <div className="flex items-center space-x-2 sm:space-x-5 min-w-0">
          <Link href="/" className="flex items-center space-x-2 group shrink-0">
            {/* Playful Whale / Container Icon */}
            <div className="w-8 h-8 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-sm shadow-[var(--brand-primary)]/30 group-hover:scale-105 active:scale-95 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="font-extrabold text-base font-display text-[var(--text-primary)] tracking-tight">
                Docker<span className="text-[var(--brand-primary)]">Play</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-[var(--text-muted)] font-bold">
                .org
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {primaryNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href.startsWith('/curriculum') && pathname?.startsWith('/curriculum'));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[var(--brand-light)] text-[var(--brand-primary)] shadow-sm font-bold border border-[var(--brand-primary)]/20'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Tools Dropdown with Seamless Hover Bridge & Click Toggle */}
            <div
              ref={toolsMenuRef}
              className="relative"
              onMouseEnter={() => setIsToolsMenuOpen(true)}
              onMouseLeave={() => setIsToolsMenuOpen(false)}
            >
              <button
                onClick={() => setIsToolsMenuOpen((prev) => !prev)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  pathname?.startsWith('/tools') || isToolsMenuOpen
                    ? 'bg-[var(--brand-light)] text-[var(--brand-primary)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <span>Tools</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    isToolsMenuOpen ? 'rotate-180 text-[var(--brand-primary)]' : ''
                  }`}
                />
              </button>

              {/* Seamless Dropdown: zero dead margin gap with top-full pt-1.5 buffer */}
              {isToolsMenuOpen && (
                <div className="absolute left-0 top-full pt-1.5 w-64 z-50">
                  <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl p-2 animate-in fade-in zoom-in-95">
                    {toolsNavLinks.map((tool) => {
                      const Icon = tool.icon;
                      const isToolActive = pathname === tool.href;
                      return (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          onClick={() => setIsToolsMenuOpen(false)}
                          className={`flex items-start space-x-2.5 p-2 rounded-xl transition-all ${
                            isToolActive
                              ? 'bg-[var(--brand-light)] text-[var(--brand-primary)] font-bold'
                              : 'hover:bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-[var(--bg-subtle)] text-[var(--brand-primary)] mt-0.5 shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-xs">
                            <span className="font-semibold block">{tool.label}</span>
                            <span className="text-[10px] text-[var(--text-muted)] leading-tight block">
                              {tool.desc}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Side: Command Palette, Streak, Theme, Reset, Mobile Menu */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
          {/* Quick Command Palette Button (Ctrl+K) */}
          <button
            onClick={() => setIsPaletteOpen(true)}
            className="hidden sm:flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all shadow-sm"
            title="Search Docker Commands & Scenarios"
          >
            <Command className="w-3 h-3 text-[var(--brand-primary)]" />
            <span className="hidden md:inline font-mono text-[11px]">Search...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-mono rounded bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] font-bold">
              ⌘K
            </kbd>
          </button>

          {/* Gamified Level & XP Pill */}
          <Link
            href="/dashboard/"
            className="flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] transition-all text-xs text-[var(--text-secondary)] shadow-sm shrink-0"
            title={`${levelInfo.title} • ${progress.xpPoints || 50} XP`}
          >
            <span className="text-xs">🎖️</span>
            <span className="font-bold text-[11px] font-mono text-[var(--brand-text)] hidden xs:inline">
              {progress.xpPoints || 50} XP
            </span>
          </Link>

          {/* Study Streak */}
          <div
            className="flex items-center space-x-1 px-2 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-mono font-bold shrink-0"
            title="Daily Learning Streak"
          >
            <Flame className="w-3.5 h-3.5 fill-current text-amber-500 animate-pulse" />
            <span className="text-[11px]">{progress.streakDays || 3}d</span>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleMode}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm shrink-0"
            title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {mode === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Theme Palette Dropdown */}
          <div ref={themeMenuRef} className="relative">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="hidden sm:flex items-center space-x-1 px-2 py-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] text-xs text-[var(--text-primary)] transition-all shadow-sm shrink-0"
              title="Change Color Theme"
            >
              <Palette className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 top-full pt-1.5 w-60 z-50">
                <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-2 animate-in fade-in zoom-in-95 text-xs">
                  <div className="px-2 py-1.5 border-b border-[var(--border-color)] mb-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)] block">
                      Playground Palette
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)]">
                      Docker aesthetic & node styling
                    </span>
                  </div>

                  <div className="space-y-1">
                    {brandThemes.map((bt) => {
                      const isSelected = brand === bt.id;
                      return (
                        <button
                          key={bt.id}
                          onClick={() => {
                            setBrand(bt.id);
                            setIsThemeMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                            isSelected
                              ? 'bg-[var(--brand-light)] text-[var(--brand-primary)] font-bold'
                              : 'hover:bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-3.5 h-3.5 rounded-full ${bt.colorDot} border border-white/40 shadow-sm shrink-0`} />
                            <div>
                              <span className="block font-medium leading-tight">{bt.name}</span>
                              <span className="text-[10px] text-[var(--text-muted)] block leading-tight">
                                {bt.description}
                              </span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* GitHub Link */}
          <a
            href="https://github.com/Nitesh-singh-1/DockerPlay"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm shrink-0"
            title="DockerPlay on GitHub"
          >
            <Github className="w-3.5 h-3.5 text-[var(--text-primary)]" />
            <span className="font-semibold text-[11px]">GitHub</span>
          </a>

          {/* Reset Docker Daemon Button */}
          <div className="shrink-0">
            {confirmReset ? (
              <div className="flex items-center space-x-1 animate-in fade-in">
                <button
                  onClick={handleReset}
                  className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold shadow-sm"
                >
                  Reset?
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Reset Simulated Docker Daemon"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Hamburger Toggle (< lg) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-colors shrink-0"
            title="Open Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Down Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-14 bg-[var(--bg-card)] border-b border-[var(--border-color)] shadow-2xl z-50 p-4 space-y-3 animate-in slide-in-from-top-2">
          <div className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)] tracking-wider px-2">
            Navigation Menu
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[...primaryNavLinks, ...toolsNavLinks].map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href.startsWith('/curriculum') && pathname?.startsWith('/curriculum'));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[var(--brand-light)] text-[var(--brand-primary)] font-bold border border-[var(--brand-primary)]/30 shadow-sm'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Palette Switcher */}
          <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">Theme Palette:</span>
            <div className="flex items-center space-x-1.5">
              {brandThemes.map((bt) => (
                <button
                  key={bt.id}
                  onClick={() => setBrand(bt.id)}
                  className={`w-6 h-6 rounded-full ${bt.colorDot} border-2 ${
                    brand === bt.id ? 'border-white ring-2 ring-[var(--brand-primary)]' : 'border-transparent'
                  }`}
                  title={bt.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global Command Palette */}
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
    </>
  );
}
