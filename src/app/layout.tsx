import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { ThemeProvider } from '@/context/ThemeContext';

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

export const metadata: Metadata = {
  title: 'DockerPlay — Interactive Docker Learning Playground',
  description:
    'A visual, hands-on Docker learning playground where you can build images, run containers, bridge networks, mount volumes, and master Docker interactively in your browser.',
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
      <body className="h-full w-full overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)] antialiased flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-800">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col min-h-0">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
