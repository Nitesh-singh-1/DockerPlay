import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Docker Playground — Run Commands in Your Browser',
  description:
    'A free, in-browser Docker playground: a live terminal paired with a visual container topology. Run real docker run, ps, exec, network, and volume commands with zero installation.',
  alternates: { canonical: 'https://dockerplay.org/playground/' },
};

export default function PlaygroundLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
