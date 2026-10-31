import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface LegalLayoutProps {
  title: string;
  subtitle?: string;
  updated?: string;
  children: React.ReactNode;
}

/**
 * Shared shell for static content pages (Privacy, Terms, About, Contact).
 * Follows the scrollable-page invariant: flex-1 min-h-0 overflow-y-auto.
 */
export function LegalLayout({ title, subtitle, updated, children }: LegalLayoutProps) {
  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-page)] text-[var(--text-primary)]">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors mb-7"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to DockerPlay
        </Link>

        <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            {subtitle}
          </p>
        )}
        {updated && (
          <p className="mt-2 text-xs font-mono text-[var(--text-muted)]">Last updated: {updated}</p>
        )}

        <div className="mt-9 space-y-5 text-sm leading-relaxed text-[var(--text-secondary)]">
          {children}
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)]">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/" className="hover:text-[var(--brand-primary)] transition-colors">Home</Link>
            <Link href="/about/" className="hover:text-[var(--brand-primary)] transition-colors">About</Link>
            <Link href="/privacy/" className="hover:text-[var(--brand-primary)] transition-colors">Privacy Policy</Link>
            <Link href="/terms/" className="hover:text-[var(--brand-primary)] transition-colors">Terms of Use</Link>
            <Link href="/contact/" className="hover:text-[var(--brand-primary)] transition-colors">Contact</Link>
          </div>
        </div>
      </article>
    </div>
  );
}

/** Section heading inside a legal/content page. */
export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg sm:text-xl font-bold font-display text-[var(--text-primary)] pt-4">
      {children}
    </h2>
  );
}

/** Body paragraph. */
export function P({ children }: { children: React.ReactNode }) {
  return <p className="leading-relaxed">{children}</p>;
}

/** Bulleted list. */
export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-5 space-y-1.5 marker:text-[var(--brand-primary)]">{children}</ul>;
}
