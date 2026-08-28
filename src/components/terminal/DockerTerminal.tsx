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
  Play,
  Zap,
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
    { label: 'docker ps', cmd: 'docker ps -a' },
    { label: 'run nginx', cmd: 'docker run -d --name web -p 8080:80 nginx:alpine' },
    { label: 'images', cmd: 'docker images' },
    { label: 'networks', cmd: 'docker network ls' },
    { label: 'compose up', cmd: 'docker compose up -d' },
  ];

  return (
    <div
      className={`flex flex-col rounded-2xl border border-white/10 bg-[#080d1a] shadow-2xl overflow-hidden font-mono text-xs ${
        isMaximized ? 'fixed inset-4 z-50' : className
      }`}
    >
      {/* Sleek Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/90 border-b border-slate-800/80 text-slate-400 select-none backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <div className="flex space-x-1.5 mr-1">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/90 shadow-sm shadow-rose-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/90 shadow-sm shadow-amber-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 shadow-sm shadow-emerald-500/40" />
          </div>
          <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200 text-[11px] font-display tracking-wide">
            Docker CLI Terminal
          </span>
          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
            Live
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={copyAllOutput}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy Terminal Logs"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setHistory([])}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={isMaximized ? 'Restore View' : 'Maximize'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Output Console Buffer */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3.5 font-mono-code leading-relaxed text-slate-300 bg-[#070c18]"
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
            {entry.result.explanation && (
              <div className="mt-2.5 p-3.5 rounded-xl bg-gradient-to-r from-slate-900/90 via-slate-950 to-slate-900/90 border border-cyan-500/30 text-xs shadow-lg space-y-2">
                <div className="flex items-center space-x-2 text-cyan-300 font-bold font-display">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>{entry.result.explanation.title}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {entry.result.explanation.summary}
                </p>
                <div className="space-y-1 pl-2 border-l border-slate-800 text-[11px] text-slate-400">
                  {entry.result.explanation.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5">
                      <ChevronRight className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
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
        <div className="bg-slate-950 border-t border-slate-800/80 px-3 py-2 flex flex-wrap gap-1.5 text-[11px]">
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
      <div className="flex items-center px-4 py-2.5 bg-slate-950 border-t border-slate-800/80">
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
          className="ml-2 px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
        >
          Execute
        </button>
      </div>

      {/* 1-Click Quick Run Bar */}
      <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950/80 border-t border-slate-900 overflow-x-auto text-[10.5px]">
        <span className="text-slate-500 shrink-0 font-display flex items-center space-x-1">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Quick Run:</span>
        </span>
        {quickCommands.map((qc, i) => (
          <button
            key={i}
            onClick={() => runCommandString(qc.cmd)}
            className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 border border-slate-800 shrink-0 font-mono text-[10px] transition-colors"
          >
            {qc.label}
          </button>
        ))}
      </div>
    </div>
  );
}
