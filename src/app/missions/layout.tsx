import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Docker Missions — Hands-On Practice Challenges',
  description:
    'Learn Docker by doing. Complete guided, automatically-checked missions covering containers, images, networking, volumes, and Compose — all in your browser.',
  alternates: { canonical: 'https://dockerplay.org/missions/' },
};

export default function MissionsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
