import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Docker Break/Fix Troubleshooting Sandbox & Production Incident Labs',
  description:
    'Debug broken containers, solve port collision errors, fix DNS failures, recover crashed exit code 137 processes, and master production Docker diagnostics.',
  alternates: {
    canonical: 'https://dockerplay.org/break-fix/',
  },
  openGraph: {
    title: 'Docker Break/Fix Troubleshooting Sandbox | DockerPlay',
    description: 'Diagnose and fix real-world Docker production failures in a safe simulator.',
    url: 'https://dockerplay.org/break-fix/',
  },
};

export default function BreakFixLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
