import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Docker Commands Cheat Sheet — Searchable Reference',
  description:
    'A categorized, searchable Docker CLI cheat sheet. Find the right docker run, build, compose, network, and volume commands with real examples and explanations.',
  alternates: { canonical: 'https://dockerplay.org/tools/cheat-sheet/' },
};

export default function CheatSheetLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
