import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Docker Compose Studio — Visual Multi-Container YAML Editor & Graph',
  description:
    'Design and validate docker-compose.yml files interactively with real-time dependency topology diagrams, port collision detection, and instant startup simulation.',
  alternates: {
    canonical: 'https://dockerplay.org/tools/compose-studio/',
  },
  openGraph: {
    title: 'Docker Compose Studio — Multi-Container Visual Editor | DockerPlay',
    description: 'Visual YAML editor and service dependency graph for Docker Compose.',
    url: 'https://dockerplay.org/tools/compose-studio/',
  },
};

export default function ComposeStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
