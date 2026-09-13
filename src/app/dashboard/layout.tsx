import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Docker Learning Dashboard & Skill Mastery Progress',
  description:
    'Track your Docker curriculum completion, missions solved, XP points, and streak status in your personal DockerPlay learning dashboard.',
  alternates: {
    canonical: 'https://dockerplay.org/dashboard/',
  },
  openGraph: {
    title: 'Docker Learning Dashboard | DockerPlay',
    description: 'Track your Docker curriculum completion and progress in DockerPlay.',
    url: 'https://dockerplay.org/dashboard/',
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
