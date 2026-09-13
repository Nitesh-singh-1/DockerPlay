import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Docker Hands-On Missions — Real-World Scenario Challenges',
  description:
    '10 progressive real-world Docker missions. Practice multi-tier architecture, database persistence, volume mounts, bridge networking, and microservice orchestration.',
  alternates: {
    canonical: 'https://dockerplay.org/missions/',
  },
  openGraph: {
    title: 'Docker Hands-On Missions | DockerPlay',
    description: 'Solve real-world Docker scenario challenges in an interactive in-browser simulator.',
    url: 'https://dockerplay.org/missions/',
  },
};

export default function MissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
