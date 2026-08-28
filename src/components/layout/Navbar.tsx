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

  const { mode, brand, setBrand, toggleMode } = useTheme();

  useEffect(() => {
    setProgress(ProgressManager.load());
    const interval = setInterval(() => {
      setProgress(ProgressManager.load());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    getDockerEngine().reset();
    setConfirmReset(false);
  };

  const levelInfo = ProgressManager.getLevelInfo(progress.xpPoints || 50);

  const navLinks = [
    { href: '/playground', label: 'Playground', icon: Terminal },
    { href: '/curriculum/ch-01', label: 'Curriculum', icon: BookOpen },
    { href: '/missions', label: 'Missions', icon: Target },
    { href: '/break-fix', label: 'Break/Fix Lab', icon: Wrench },
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
      borderPreview: 'border-indigo-400',
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border-color)] bg-[var(--bg-header)] backdrop-blur-xl shadow-sm transition-colors">
        <div className="flex h-14 items-center justify-between px-3 sm:px-5 lg:px-6 max-w-7xl mx-auto">
          {/* Brand Logo & Nav Tabs */}
          <div className="flex items-center space-x-3 lg:space-x-6">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-accent)] flex items-center justify-center shadow-md shadow-[var(--brand-primary)]/20 group-hover:scale-105 transition-all text-white font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="font-display font-extrabold text-base text-[var(--text-primary)] tracking-tight">
                  Docker<span className="text-[var(--brand-primary)]">Play</span>
                </span>
                <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-full bg-[var(--brand-light)] text-[var(--brand-primary)] border border-[var(--brand-primary)]/20">
                  {brand}
                </span>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[var(--brand-light)] text-[var(--brand-primary)] font-bold border border-[var(--brand-primary)]/30 shadow-sm'
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
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Gamified Level & XP Widget */}
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] text-xs text-[var(--text-primary)] transition-all shadow-sm"
              title={`${levelInfo.progressXP} / 200 XP to next level`}
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 font-bold font-mono text-[10px] flex items-center justify-center shadow-sm">
                {levelInfo.level}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] font-bold text-[var(--text-primary)] font-display leading-none">
                  {levelInfo.title}
                </span>
                <div className="flex items-center space-x-1 mt-0.5">
                  <div className="w-12 h-1 rounded-full bg-[var(--border-color)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--brand-primary)] transition-all duration-500"
                      style={{ width: `${levelInfo.progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-[var(--brand-primary)] font-bold">
                    {progress.xpPoints} XP
                  </span>
                </div>
              </div>
            </Link>

            {/* Streak Counter */}
            <div
              className="hidden lg:flex items-center space-x-1 px-2 py-1 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-mono font-bold"
              title="Daily Study Streak"
            >
              <Flame className="w-3.5 h-3.5 fill-current text-orange-500 animate-pulse" />
              <span>{progress.streakDays || 3}d</span>
            </div>

            {/* LIGHT / DARK MODE TOGGLE (1-CLICK) */}
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

            {/* THEME COLOR BRAND PICKER (Google, WhatsApp, Meta, Sky Blue) */}
            <div className="relative">
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] text-xs text-[var(--text-primary)] transition-all shadow-sm"
                title="Change Color Theme (Sky Blue, Google, WhatsApp, Meta)"
              >
                <Palette className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                <span className="hidden sm:inline font-medium text-[11px] capitalize">{brand}</span>
                <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
              </button>

              {isThemeMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 text-xs">
                  <div className="px-2 py-1.5 border-b border-[var(--border-color)] mb-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)] block">
                      Choose Your Color Theme
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)]">
                      Instant brand & palette switch
                    </span>
                  </div>

                  <div className="space-y-1">
                    {brandThemes.map((t) => {
                      const isSelected = brand === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setBrand(t.id);
                            setIsThemeMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all ${
                            isSelected
                              ? 'bg-[var(--brand-light)] text-[var(--brand-primary)] font-bold'
                              : 'hover:bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className={`w-3.5 h-3.5 rounded-full ${t.colorDot} shadow-sm shrink-0`} />
                            <div>
                              <span className="font-semibold block text-[11.5px]">{t.name}</span>
                              <span className="text-[10px] text-[var(--text-muted)] block">{t.description}</span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Beginner Mode Pill */}
            <button
              onClick={() => {
                const updated = ProgressManager.setBeginnerMode(!progress.beginnerMode);
                setProgress(updated);
              }}
              className={`hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                progress.beginnerMode
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--border-color)]'
              }`}
            >
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>Beginner: {progress.beginnerMode ? 'ON' : 'OFF'}</span>
            </button>

            {/* Command Palette Button */}
            <button
              onClick={() => setIsPaletteOpen(true)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title="Command Palette (Ctrl + K)"
            >
              <Command className="w-3 h-3" />
              <span className="hidden sm:inline font-mono text-[10px]">Ctrl K</span>
            </button>

            {/* Reset Simulator */}
            <div className="relative">
              {confirmReset ? (
                <div className="flex items-center space-x-1 bg-rose-500/10 border border-rose-500/30 p-1 rounded-xl">
                  <button
                    onClick={handleReset}
                    className="px-2 py-0.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-1.5 py-0.5 text-xs text-[var(--text-muted)]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="p-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-rose-500 transition-colors"
                  title="Reset Simulated State"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
    </>
  );
}
