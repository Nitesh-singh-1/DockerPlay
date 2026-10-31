import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Docker Compose Studio — Visual YAML Editor',
  description:
    'Write, edit, and visualize multi-service docker-compose.yml files online. See service dependencies, networks, and volumes come alive as you type — no setup required.',
  alternates: { canonical: 'https://dockerplay.org/tools/compose-studio/' },
};

export default function ComposeStudioLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
