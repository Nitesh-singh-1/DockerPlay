import type { Metadata, Viewport } from 'next';
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { ThemeProvider } from '@/context/ThemeContext';
import { GoogleAdSense } from '@/components/ads/GoogleAdSense';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#090d16',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://dockerplay.org'),
  title: {
    default: 'Learn Docker Interactively in Your Browser — Free Docker Playground & Tutorial',
    template: '%s | DockerPlay',
  },
  description:
    'Master Docker from scratch with interactive CLI practice, visual container networks, image layer cake inspector, and 11 step-by-step beginner lessons. Zero Docker Desktop installation required.',
  keywords: [
    'learn docker',
    'docker tutorial',
    'docker for beginners',
    'docker playground',
    'docker simulator',
    'interactive docker practice',
    'docker commands online',
    'docker container networking',
    'docker compose tutorial',
    'devops learning playground',
  ],
  authors: [{ name: 'Nitesh Singh', url: 'https://github.com/Nitesh-singh-1' }],
  creator: 'Nitesh Singh',
  publisher: 'DockerPlay',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dockerplay.org',
    siteName: 'DockerPlay',
    title: 'Learn Docker Interactively — Free In-Browser Docker Simulator & Tutorial',
    description:
      'Practice real Docker CLI commands, inspect container topologies, visualize layer caches, and troubleshoot production incidents in your browser.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DockerPlay — Interactive Docker Learning Playground',
    description:
      'Learn Docker interactively in your browser with zero setup. Real CLI parsing, visual networks, and hands-on exercises.',
  },
  alternates: {
    canonical: 'https://dockerplay.org',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`light ${outfit.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} h-full overflow-hidden`}
      data-brand="sky"
      data-mode="light"
    >
      <head>
        <GoogleAdSense />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  '@id': 'https://dockerplay.org/#website',
                  url: 'https://dockerplay.org',
                  name: 'DockerPlay',
                  description: 'Interactive In-Browser Docker Simulator & Learning Playground',
                  inLanguage: 'en-US',
                },
                {
                  '@type': 'Course',
                  '@id': 'https://dockerplay.org/#course',
                  name: 'Learn Docker Interactively — Complete Beginner to Production Guide',
                  description: 'Master Docker commands, container lifecycle, networking, volumes, compose, and troubleshooting interactively in your browser.',
                  provider: {
                    '@type': 'Person',
                    name: 'Nitesh Singh',
                    url: 'https://github.com/Nitesh-singh-1',
                  },
                  isAccessibleForFree: true,
                  educationalLevel: 'Beginner to Advanced',
                  hasCourseInstance: {
                    '@type': 'CourseInstance',
                    courseMode: 'online',
                    courseWorkload: 'PT4H',
                  },
                },
                {
                  '@type': 'WebApplication',
                  '@id': 'https://dockerplay.org/#app',
                  name: 'DockerPlay Simulator',
                  applicationCategory: 'EducationalApplication',
                  operatingSystem: 'Any (Browser)',
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="h-screen w-full overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)] antialiased flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-800">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 min-h-0 h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
