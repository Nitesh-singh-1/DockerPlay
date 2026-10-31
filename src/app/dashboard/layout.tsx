import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Your Docker Learning Dashboard',
  description:
    'Track your Docker learning progress — XP, daily streaks, earned badges, and completed curriculum chapters.',
  alternates: { canonical: 'https://dockerplay.org/dashboard/' },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
