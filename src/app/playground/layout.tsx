import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interactive Docker Playground & Terminal Simulator',
  description:
    'Run real Docker CLI commands, inspect live container topologies, bridge virtual networks, and visualize layer stacks in your browser with zero installation.',
  alternates: {
    canonical: 'https://dockerplay.org/playground/',
  },
  openGraph: {
    title: 'Interactive Docker Playground & Terminal Simulator | DockerPlay',
    description:
      'Run real Docker commands, inspect live container topologies, bridge virtual networks, and visualize layer stacks in your browser.',
    url: 'https://dockerplay.org/playground/',
  },
};

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
