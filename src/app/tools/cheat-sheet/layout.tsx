import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Docker Commands Cheat Sheet & Comprehensive CLI Reference',
  description:
    'Complete, searchable Docker CLI command cheat sheet. Copy-ready examples for containers, images, volumes, bridge networks, and Docker Compose.',
  alternates: {
    canonical: 'https://dockerplay.org/tools/cheat-sheet/',
  },
  openGraph: {
    title: 'Docker Commands Cheat Sheet & CLI Reference | DockerPlay',
    description: 'Fast, searchable reference guide for all essential Docker CLI commands.',
    url: 'https://dockerplay.org/tools/cheat-sheet/',
  },
};

export default function CheatSheetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
