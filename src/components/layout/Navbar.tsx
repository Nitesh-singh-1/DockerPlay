'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { mode, brand, setBrand, toggleMode } = useTheme();

  useEffect(() => {
    setProgress(ProgressManager.load());
    const interval = setInterval(() => {
      setProgress(ProgressManager.load());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu on page change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleReset = () => {
    getDockerEngine().reset();
    setConfirmReset(false);
  };

  const levelInfo = ProgressManager.getLevelInfo(progress.xpPoints || 50);

  const navLinks = [
    { href: '/playground', label: 'Playground', icon: Terminal },
    { href: '/curriculum/what-is-docker', label: 'Curriculum', icon: BookOpen },
    { href: '/tools/compose-studio', label: 'Compose Studio', icon: Box },
    { href: '/tools/dockerfile-studio', label: 'Dockerfile Studio', icon: FileCode },
    { href: '/missions', label: 'Missions', icon: Target },
    { href: '/break-fix', label: 'Break/Fix', icon: Wrench },
    { href: '/tools/cheat-sheet', label: 'Cheat Sheet', icon: HelpCircle },
  ];

  const brandThemes: Array<{
    id: ColorBrand;
    name: string;
    description: string;
    colorDot: string;
    borderPreview: string;
  }> = [
    {
      id: 'sky',
      name: 'Clean Sky Blue',
      description: 'Crisp white with sky blue accents',
      colorDot: 'bg-sky-500',
      borderPreview: 'border-sky-400',
    },
    {
      id: 'google',
      name: 'Google Tech',
      description: 'Google Cloud Blue & 4-color accents',
      colorDot: 'bg-[#1a73e8]',
      borderPreview: 'border-[#1a73e8]',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Green',
      description: 'WhatsApp Emerald & Teal palette',
      colorDot: 'bg-[#25D366]',
      borderPreview: 'border-[#128C7E]',
    },
    {
      id: 'meta',
      name: 'Meta Royal Blue',
      description: 'Meta / Facebook modern blue',
      colorDot: 'bg-[#0866FF]',
      borderPreview: 'border-[#0866FF]',
    },
    {
      id: 'midnight',
      name: 'Midnight Studio',
      description: 'Dark obsidian developer theme',
      colorDot: 'bg-indigo-500',
      borderPreview: 'border-indigo-500',
    },
  ];

  return (
    <>
      <header className="h-14 shrink-0 bg-[var(--bg-header)] backdrop-blur-md border-b border-[var(--border-color)] px-3 sm:px-4 lg:px-6 flex items-center justify-between z-40 transition-colors">
        {/* Brand & Left Navigation */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-accent)] flex items-center justify-center shadow-md shadow-[var(--brand-primary)]/20 text-white">
              <Layers className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base font-display text-[var(--text-primary)] tracking-tight">
                Docker<span className="text-[var(--brand-primary)]">Play</span>
              </span>
              <span className="hidden sm:inline text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-[var(--brand-light)] text-[var(--brand-primary)] font-bold border border-[var(--brand-primary)]/30">
                {brand}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
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
                      ? 'bg-[var(--brand-light)] text-[var(--brand-primary)] shadow-sm font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {/* Level & XP Widget */}
          <Link
            href="/dashboard"
            className="flex items-center space-x-1.5 px-2 py-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] text-xs text-[var(--text-primary)] transition-all shadow-sm"
            title={`${levelInfo.progressXP} / 200 XP to next level`}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 font-bold font-mono text-[10px] flex items-center justify-center shadow-sm">
              {levelInfo.level}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[10px] font-bold text-[var(--text-primary)] font-display leading-none">
                {levelInfo.title}
              </span>
              <span className="text-[9px] font-mono text-[var(--brand-primary)] font-bold">
                {progress.xpPoints} XP
              </span>
            </div>
          </Link>

          {/* Streak Counter */}
          <div
            className="hidden sm:flex items-center space-x-1 px-2 py-1 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-mono font-bold"
            title="Daily Study Streak"
          >
            <Flame className="w-3.5 h-3.5 fill-current text-orange-500 animate-pulse" />
            <span>{progress.streakDays || 3}d</span>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleMode}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm"
            title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {mode === 'light' ? (
              <Moon className="w-4 h-4 text-indigo-600" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Theme Color Palette Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="flex items-center space-x-1 px-2 py-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] text-xs text-[var(--text-primary)] transition-all shadow-sm"
              title="Change Color Theme"
            >
              <Palette className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span className="hidden md:inline font-medium text-[11px] capitalize">{brand}</span>
              <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 text-xs">
                <div className="px-2 py-1.5 border-b border-[var(--border-color)] mb-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)] block">
                    Brand Color Palette
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    Pick your study theme
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
                          <div className={`w-3.5 h-3.5 rounded-full ${bt.colorDot} border border-white/40 shadow-sm`} />
                          <div>
                            <span className="block font-medium leading-tight">{bt.name}</span>
                            <span className="text-[10px] text-[var(--text-muted)] block leading-tight">{bt.description}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* GitHub / Creator Profile Link */}
          <a
            href="https://github.com/Nitesh-singh-1/DockerPlay"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm group"
            title="Architected & Maintained by Nitesh Singh on GitHub"
          >
            <Github className="w-3.5 h-3.5 text-[var(--text-primary)] group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-[11px] hidden md:inline">GitHub</span>
          </a>

          {/* Reset Docker Engine Button */}
          <div className="hidden sm:block">
            {confirmReset ? (
              <div className="flex items-center space-x-1 animate-in fade-in">
                <button
                  onClick={handleReset}
                  className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="p-1 text-[var(--text-muted)]"
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

          {/* Mobile Hamburger Toggle (Visible < lg) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-colors"
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
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href.startsWith('/curriculum') && pathname?.startsWith('/curriculum'));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 p-3 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[var(--brand-light)] text-[var(--brand-primary)] font-bold border border-[var(--brand-primary)]/40 shadow-sm'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Quick Stats & Reset */}
          <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-secondary)] px-1">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{progress.streakDays || 3} Day Study Streak</span>
            </div>
            <button
              onClick={() => {
                handleReset();
                setIsMobileMenuOpen(false);
              }}
              className="text-xs text-rose-500 font-bold hover:underline"
            >
              Reset Docker State
            </button>
          </div>
        </div>
      )}

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
    </>
  );
}
