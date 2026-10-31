import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Docker Break/Fix Labs — Debug Real Container Incidents',
  description:
    'Sharpen your troubleshooting skills with realistic Docker incident labs. Diagnose broken containers, networks, ports, and volumes, then fix them — hands-on in your browser.',
  alternates: { canonical: 'https://dockerplay.org/break-fix/' },
};

export default function BreakFixLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
