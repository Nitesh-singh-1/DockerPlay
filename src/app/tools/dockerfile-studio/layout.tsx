import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dockerfile Studio — Multi-Stage Build Simulator & Layer Cache Inspector',
  description:
    'Build and optimize Dockerfiles with visual multi-stage pipeline flow, layer cache invalidation tracking, image size breakdown, and best practice linting.',
  alternates: {
    canonical: 'https://dockerplay.org/tools/dockerfile-studio/',
  },
  openGraph: {
    title: 'Dockerfile Studio — Multi-Stage Layer Inspector | DockerPlay',
    description: 'Visual multi-stage Dockerfile simulator and build cache inspector.',
    url: 'https://dockerplay.org/tools/dockerfile-studio/',
  },
};

export default function DockerfileStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
