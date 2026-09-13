import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Docker Network Visualizer — Bridge, Host & Embedded DNS Tracer',
  description:
    'Simulate Docker container networking topologies. Trace bridge packet flows, inspect iptables port mappings, and test embedded 127.0.0.11 DNS resolution.',
  alternates: {
    canonical: 'https://dockerplay.org/tools/network-visualizer/',
  },
  openGraph: {
    title: 'Docker Network Visualizer & DNS Tracer | DockerPlay',
    description: 'Visual container networking simulator and embedded DNS packet tracer.',
    url: 'https://dockerplay.org/tools/network-visualizer/',
  },
};

export default function NetworkVisualizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
