import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DockerPlay — Interactive Docker Simulator & Playground',
    short_name: 'DockerPlay',
    description: 'Learn Docker interactively in your browser with real CLI, visual container topologies, and hands-on exercises.',
    start_url: '/',
    display: 'standalone',
    background_color: '#090d16',
    theme_color: '#0ea5e9',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
