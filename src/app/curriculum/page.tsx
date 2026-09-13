import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Terminal,
  Zap,
  GraduationCap,
  Shield,
  Code2,
} from 'lucide-react';
import { CURRICULUM_CHAPTERS } from '@/data/curriculum';
import { AdBanner } from '@/components/ads/AdBanner';

export const metadata: Metadata = {
  title: 'Interactive Docker Curriculum — 11 Step-by-Step Lessons & Labs',
  description:
    'Complete free Docker curriculum with hands-on browser terminal practice. Learn containers, images, Dockerfiles, networking, volumes, Docker Compose, and production debugging.',
  alternates: {
    canonical: 'https://dockerplay.org/curriculum/',
  },
  openGraph: {
    title: 'Interactive Docker Curriculum — 11 Step-by-Step Lessons | DockerPlay',
    description:
      'Learn Docker from scratch to production with interactive in-browser CLI practice and instant visual feedback.',
    url: 'https://dockerplay.org/curriculum/',
  },
};

export default function CurriculumIndexPage() {
  const beginnerChapters = CURRICULUM_CHAPTERS.filter((c) => c.difficulty === 'beginner');
  const intermediateChapters = CURRICULUM_CHAPTERS.filter((c) => c.difficulty === 'intermediate');
  const advancedChapters = CURRICULUM_CHAPTERS.filter((c) => c.difficulty === 'advanced');

  return (
    <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col bg-[var(--bg-page)] relative">
      {/* Header Banner */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono font-semibold">
            <GraduationCap className="w-4 h-4" />
            <span>11 Comprehensive Hands-On Lessons</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
            Interactive Docker Curriculum
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Step-by-step interactive lessons with live in-browser terminal exercises, visual container topologies, and self-testing quizzes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-[var(--text-secondary)] font-mono">
            <span className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>~2.5 Hours Total</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>30+ CLI Exercises</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Zero Setup Required</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 w-full">
        {/* Chapters Section */}
        <div className="space-y-10">
          {/* Beginner Section */}
          <section className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider font-mono">
                Phase 1: Foundations
              </span>
              <h2 className="text-xl font-bold text-[var(--text-primary)] font-display">
                Beginner Core Concepts
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {beginnerChapters.map((ch) => (
                <ChapterCard key={ch.id} chapter={ch} />
              ))}
            </div>
          </section>

          {/* Intermediate Section */}
          <section className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider font-mono">
                Phase 2: Building & Networking
              </span>
              <h2 className="text-xl font-bold text-[var(--text-primary)] font-display">
                Intermediate Developer Workflow
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {intermediateChapters.map((ch) => (
                <ChapterCard key={ch.id} chapter={ch} />
              ))}
            </div>
          </section>

          {/* Advanced Section */}
          {advancedChapters.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider font-mono">
                  Phase 3: Production & Orchestration
                </span>
                <h2 className="text-xl font-bold text-[var(--text-primary)] font-display">
                  Advanced Compose & Diagnostics
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {advancedChapters.map((ch) => (
                  <ChapterCard key={ch.id} chapter={ch} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Ad Banner */}
        <AdBanner />
      </div>
    </div>
  );
}

function ChapterCard({ chapter }: { chapter: (typeof CURRICULUM_CHAPTERS)[0] }) {
  return (
    <Link
      href={`/curriculum/${chapter.slug}/`}
      className="group relative p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/5 transition-all flex flex-col justify-between"
    >
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs font-mono font-semibold">
            Chapter {chapter.order}
          </span>
          <span className="text-xs text-[var(--text-secondary)] font-mono flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>{chapter.estimatedMinutes} min</span>
          </span>
        </div>

        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-sky-400 transition-colors">
            {chapter.title}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
            {chapter.tagline}
          </p>
        </div>

        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
          {chapter.summary}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
        <span className="text-[var(--text-secondary)] font-mono">
          {chapter.learningObjectives.length} key concepts
        </span>
        <span className="inline-flex items-center space-x-1 text-sky-400 font-semibold group-hover:translate-x-0.5 transition-transform">
          <span>Start Lesson</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
