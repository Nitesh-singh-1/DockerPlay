import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Box,
  FileCode,
  Network,
  HelpCircle,
  ArrowRight,
  Wrench,
  Sparkles,
  Zap,
  Terminal,
} from 'lucide-react';
import { AdBanner } from '@/components/ads/AdBanner';

export const metadata: Metadata = {
  title: 'Free Interactive Docker Developer Tools & Visualizers',
  description:
    'Free in-browser Docker developer tools: Compose Studio YAML visualizer, Multi-stage Dockerfile layer builder, Network topology & DNS tracer, and interactive CLI cheat sheet.',
  alternates: {
    canonical: 'https://dockerplay.org/tools/',
  },
  openGraph: {
    title: 'Free Interactive Docker Developer Tools & Visualizers | DockerPlay',
    description:
      'Explore Docker visual tools: Dockerfile builder, Compose editor, network tracer, and cheat sheet.',
    url: 'https://dockerplay.org/tools/',
  },
};

const TOOLS = [
  {
    id: 'compose-studio',
    title: 'Docker Compose Studio',
    href: '/tools/compose-studio/',
    icon: Box,
    badge: 'Multi-Service',
    color: 'sky',
    description:
      'Interactive multi-container YAML editor with real-time service dependency graphs, port mapping matrix, and volume links.',
    features: [
      'Visual service relationship graphs',
      'Port collisions & binding inspector',
      'Auto-complete Docker Compose syntax',
      'Instant service startup simulation',
    ],
  },
  {
    id: 'dockerfile-studio',
    title: 'Dockerfile Studio',
    href: '/tools/dockerfile-studio/',
    icon: FileCode,
    badge: 'Layer Inspector',
    color: 'emerald',
    description:
      'Live multi-stage build emulator with layer size breakdown, build cache hit/miss simulator, and best-practice linting.',
    features: [
      'Multi-stage build flow visualization',
      'Layer cache invalidation tracer',
      'Image size optimization hints',
      'Syntax validator for RUN, COPY, CMD',
    ],
  },
  {
    id: 'network-visualizer',
    title: 'Docker Network & DNS Tracer',
    href: '/tools/network-visualizer/',
    icon: Network,
    badge: 'Packet Tracer',
    color: 'indigo',
    description:
      'Interactive bridge, host, and overlay network topology explorer with embedded 127.0.0.11 DNS resolution animations.',
    features: [
      'Container-to-container ping tracer',
      'Docker embedded DNS packet flow',
      'Bridge gateway & subnet inspection',
      'Port forwarding & iptables visualization',
    ],
  },
  {
    id: 'cheat-sheet',
    title: 'Docker Commands Cheat Sheet',
    href: '/tools/cheat-sheet/',
    icon: HelpCircle,
    badge: 'CLI Reference',
    color: 'amber',
    description:
      'Fast, searchable reference guide of essential Docker CLI commands with real examples, flags breakdown, and one-click copy.',
    features: [
      'Search across 50+ Docker CLI commands',
      'Categorized by container, image, network, compose',
      'Copy-ready command syntax with flags',
      'Interactive terminal sandbox integrations',
    ],
  },
];

export default function ToolsIndexPage() {
  return (
    <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col bg-[var(--bg-page)] relative">
      {/* Header Banner */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono font-semibold">
            <Wrench className="w-4 h-4" />
            <span>Developer Tool Suite</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
            Docker Visual Developer Tools
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Free browser-based visualizers and emulators to master Dockerfiles, Compose orchestrations, network topologies, and CLI commands.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 w-full">
        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="group relative p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-sky-500/40 hover:shadow-xl hover:shadow-sky-500/5 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs font-mono font-semibold">
                      {tool.badge}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-sky-400 transition-colors">
                      {tool.title}
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] font-mono pt-2 border-t border-[var(--border-subtle)]">
                    {tool.features.map((feat, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-end text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition-transform">
                  <span className="flex items-center space-x-1.5">
                    <span>Open Tool</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <AdBanner />
      </div>
    </div>
  );
}
