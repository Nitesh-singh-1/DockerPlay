'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import {
  Terminal as TerminalIcon,
  Trash2,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  ChevronRight,
  Zap,
  X,
  AlertTriangle,
  Info,
  HelpCircle,
} from 'lucide-react';
import { getDockerEngine } from '@/lib/simulator/DockerEngine';
import { CommandParser } from '@/lib/parser/CommandParser';
import { COMMAND_SUGGESTIONS } from '@/lib/parser/CommandDictionary';
import { CommandExecutionResult } from '@/types/docker';
import { ProgressManager } from '@/lib/persistence/ProgressManager';

interface HistoryEntry {
  id: string;
  command: string;
  result: CommandExecutionResult;
  timestamp: string;
}

interface DockerTerminalProps {
  onCommandExecuted?: (cmd: string, result: CommandExecutionResult) => void;
  className?: string;
  initialPrompt?: string;
}

export function DockerTerminal({ onCommandExecuted, className = '', initialPrompt = '' }: DockerTerminalProps) {
  const [input, setInput] = useState(initialPrompt);
  const [showBeginnerMode, setShowBeginnerMode] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      id: 'init-1',
      command: 'docker version',
      result: {
        stdout: `Client: Docker Engine - Community v27.1.1\nServer: Docker Engine - Simulated In-Browser Runtime (Safe Sandbox)\nStorage Driver: overlay2 (Virtual Layers)\nStatus: Ready • Zero Docker Desktop Required`,
        stderr: '',
        exitCode: 0,
      },
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [cmdHistoryIndex, setCmdHistoryIndex] = useState<number>(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Global listener for Escape key to exit fullscreen
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && isMaximized) {
        setIsMaximized(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isMaximized]);

  // Global listener for "⚡ Run in Terminal" clicks from lessons
  useEffect(() => {
    const handleRunEvent = (e: CustomEvent<{ command: string }>) => {
      if (e.detail && e.detail.command) {
        runCommandString(e.detail.command);
      }
    };
    window.addEventListener('dockerplay-run-command' as any, handleRunEvent as any);
    return () => window.removeEventListener('dockerplay-run-command' as any, handleRunEvent as any);
  }, []);

  const matchingSuggestions = input.trim().length > 1
    ? COMMAND_SUGGESTIONS.filter((s) => s.command.toLowerCase().startsWith(input.trim().toLowerCase()) || s.example.toLowerCase().includes(input.trim().toLowerCase())).slice(0, 4)
    : [];

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommandString(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex = Math.min(commandHistory.length - 1, cmdHistoryIndex + 1);
        setCmdHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cmdHistoryIndex > 0) {
        const nextIndex = cmdHistoryIndex - 1;
        setCmdHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      } else if (cmdHistoryIndex === 0) {
        setCmdHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (matchingSuggestions.length > 0) {
        const selected = matchingSuggestions[activeSuggestionIndex] || matchingSuggestions[0];
        setInput(selected.example || selected.command);
      }
    }
  };

  const runCommandString = (cmd: string) => {
    const rawCmd = cmd.trim();
    if (!rawCmd) return;

    if (rawCmd.toLowerCase() === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    const parsed = CommandParser.parse(rawCmd);
    const result = getDockerEngine().execute(parsed);

    if (result.stdout === '__CLEAR__') {
      setHistory([]);
      setInput('');
      return;
    }

    const newEntry: HistoryEntry = {
      id: `hist-${Date.now()}-${Math.random()}`,
      command: rawCmd,
      result,
      timestamp: new Date().toLocaleTimeString(),
    };

    setHistory((prev) => [...prev, newEntry]);
    setCommandHistory((prev) => [rawCmd, ...prev.filter((c) => c !== rawCmd)]);
    setCmdHistoryIndex(-1);
    setInput('');

    ProgressManager.recordCommandExecution(rawCmd);

    if (onCommandExecuted) {
      onCommandExecuted(rawCmd, result);
    }
  };

  const copyAllOutput = () => {
    const text = history.map((h) => `$ ${h.command}\n${h.result.stdout || h.result.stderr}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const quickCommands = [
    { label: 'docker ps -a', cmd: 'docker ps -a' },
    { label: 'run nginx', cmd: 'docker run -d --name web -p 8080:80 nginx:alpine' },
    { label: 'run postgres with volume', cmd: 'docker run -d --name db -v pgdata:/var/lib/postgresql/data -e POSTGRES_PASSWORD=secret postgres:16-alpine' },
    { label: 'create network', cmd: 'docker network create app-net' },
    { label: 'compose up', cmd: 'docker compose up -d' },
  ];

  const terminalBody = (
    <div className="flex-1 min-h-0 flex flex-col w-full h-full overflow-hidden bg-[#080d1a] text-slate-200">
      {/* Terminal Title Bar */}
      <div className="shrink-0 h-11 flex items-center justify-between px-3 sm:px-4 bg-slate-950/95 border-b border-slate-800 text-slate-400 select-none backdrop-blur-md">
        {/* Left: Window Controls + Title */}
        <div className="flex items-center space-x-2 shrink-0 min-w-0">
          <div className="flex space-x-1.5 mr-0.5 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
          </div>
          <TerminalIcon className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-bold text-slate-100 text-xs font-display tracking-wide whitespace-nowrap">
            Docker Terminal
          </span>
          <span className="hidden sm:inline-block text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 shrink-0">
            v27.1
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => setShowBeginnerMode(!showBeginnerMode)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] transition-colors ${
              showBeginnerMode
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/50'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
            title="Toggle Beginner Explanations"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xl:inline text-[10.5px]">Explanations</span>
          </button>

          <button
            onClick={copyAllOutput}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-[11px]"
            title="Copy Terminal Output"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setHistory([])}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors text-[11px]"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors text-[11px]"
            title={isMaximized ? 'Exit Fullscreen (Esc)' : 'Maximize Terminal'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Quick Launch Command Bar */}
      <div className="shrink-0 bg-slate-900/90 border-b border-slate-800/80 px-3.5 py-1.5 flex items-center space-x-2 overflow-x-auto text-[11px] select-none scrollbar-none">
        <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider flex items-center shrink-0">
          <Zap className="w-3 h-3 mr-1 text-amber-400" /> Quick:
        </span>
        {quickCommands.map((qc, idx) => (
          <button
            key={idx}
            onClick={() => runCommandString(qc.cmd)}
            className="shrink-0 px-2 py-0.5 rounded bg-slate-800/90 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-700/50 border border-slate-700/60 text-slate-300 transition-all font-mono text-[10.5px]"
          >
            {qc.label}
          </button>
        ))}
      </div>

      {/* Output Console Buffer */}
      <div
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 font-mono-code leading-relaxed text-slate-300 bg-[#070c18]"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((entry) => (
          <div key={entry.id} className="space-y-1.5 group animate-in fade-in duration-100">
            {/* Command Header */}
            <div className="flex items-center space-x-2">
              <span className="text-cyan-400 font-bold">$</span>
              <span className="font-bold text-slate-100 text-xs">{entry.command}</span>
              <span className="text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                {entry.timestamp}
              </span>
            </div>

            {/* Beginner Breakdown Chips */}
            {showBeginnerMode && entry.result.beginnerBreakdown && entry.result.beginnerBreakdown.length > 0 && (
              <div className="flex flex-wrap gap-1.5 my-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                {entry.result.beginnerBreakdown.map((b, bIdx) => (
                  <div key={bIdx} className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-800/80 text-[10px] border border-slate-700/50">
                    <span className="font-mono text-cyan-300 font-semibold">{b.token}</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-slate-300">{b.description}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Standard Output */}
            {entry.result.stdout && (
              <pre className="text-slate-300 whitespace-pre-wrap pl-3.5 border-l-2 border-cyan-500/30 overflow-x-auto text-[11.5px] leading-relaxed">
                {entry.result.stdout}
              </pre>
            )}

            {/* Error Output */}
            {entry.result.stderr && (
              <pre className="text-rose-400 whitespace-pre-wrap pl-3.5 border-l-2 border-rose-500/40 overflow-x-auto text-[11.5px] leading-relaxed bg-rose-950/20 p-2 rounded-r-lg">
                {entry.result.stderr}
              </pre>
            )}

            {/* Educational "What Just Happened?" Explainer Box */}
            {showBeginnerMode && entry.result.explanation && (
              <div className={`mt-2.5 p-3.5 rounded-xl border text-xs shadow-lg space-y-2 ${
                entry.result.exitCode !== 0
                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                  : 'bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-cyan-500/30 text-cyan-300'
              }`}>
                <div className="flex items-center space-x-2 font-bold font-display">
                  {entry.result.exitCode !== 0 ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  )}
                  <span>{entry.result.explanation.title}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {entry.result.explanation.summary}
                </p>
                <div className="space-y-1 pl-2 border-l border-slate-800 text-[11px] text-slate-400">
                  {entry.result.explanation.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5">
                      <ChevronRight className={`w-3 h-3 mt-0.5 shrink-0 ${entry.result.exitCode !== 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[10.5px] text-slate-400 italic">
                  💡 <strong className="text-slate-300">Why this matters:</strong> {entry.result.explanation.why}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Autocomplete Suggestions Bar */}
      {matchingSuggestions.length > 0 && (
        <div className="shrink-0 bg-slate-950 border-t border-slate-800 px-3 py-2 flex flex-wrap gap-1.5 text-[11px]">
          <span className="text-slate-500 font-semibold uppercase text-[10px] self-center mr-1">Suggestions:</span>
          {matchingSuggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => runCommandString(s.example)}
              className="px-2 py-0.5 rounded-md bg-slate-900 text-cyan-300 border border-slate-700 hover:border-cyan-400 font-mono text-[10.5px] transition-colors"
            >
              {s.example}
            </button>
          ))}
        </div>
      )}

      {/* Terminal Input Line */}
      <div className="shrink-0 flex items-center px-4 py-2.5 bg-slate-950 border-t border-slate-800">
        <span className="text-cyan-400 font-bold mr-2 text-sm">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type 'docker run -d --name web -p 8080:80 nginx:alpine' or 'docker ps'"
          className="flex-1 bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none font-mono text-xs"
          spellCheck={false}
          autoComplete="off"
        />
        <button
          onClick={() => runCommandString(input)}
          className="ml-2 px-3.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
        >
          Execute
        </button>
      </div>
    </div>
  );

  if (isMaximized) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col bg-[#080d1a]">
          {terminalBody}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full min-h-0 w-full rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden ${className}`}>
      {terminalBody}
    </div>
  );
}
