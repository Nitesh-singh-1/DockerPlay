import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Dockerfile Studio — Build Images & Layers Visually',
  description:
    'Build Dockerfiles step by step and watch the image layer stack and build cache update live. Learn multi-stage builds interactively, with zero installation.',
  alternates: { canonical: 'https://dockerplay.org/tools/dockerfile-studio/' },
};

export default function DockerfileStudioLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
