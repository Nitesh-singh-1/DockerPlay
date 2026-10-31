import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Docker Network Visualizer — Bridge & DNS Tracer',
  description:
    'Visualize Docker networking: trace packets across bridge networks, watch embedded DNS (127.0.0.11) resolve container names, and understand port publishing interactively.',
  alternates: { canonical: 'https://dockerplay.org/tools/network-visualizer/' },
};

export default function NetworkVisualizerLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
