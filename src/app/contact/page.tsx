import type { Metadata } from 'next';
import { LegalLayout, H2, P } from '@/components/layout/LegalLayout';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the team behind DockerPlay — feedback, bug reports, and questions.',
  alternates: { canonical: 'https://dockerplay.org/contact/' },
};

export default function ContactPage() {
  return (
    <LegalLayout
      title="Contact"
      subtitle="Found a bug, have an idea, or a question? We'd love to hear from you."
      updated="October 31, 2026"
    >
      <H2>Email</H2>
      <P>
        For general questions, feedback, or privacy requests, email us at{' '}
        <a
          href="mailto:niteshsingh.ns26@gmail.com"
          className="text-[var(--brand-primary)] underline hover:brightness-110"
        >
          niteshsingh.ns26@gmail.com
        </a>
        . We read every message and try to reply within a few days.
      </P>

      <H2>Report a bug or request a feature</H2>
      <P>
        DockerPlay is open source. The fastest way to report a bug or suggest a feature is to open an
        issue on our{' '}
        <a
          href="https://github.com/Nitesh-singh-1/DockerPlay/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--brand-primary)] underline hover:brightness-110"
        >
          GitHub repository
        </a>
        .
      </P>

      <H2>About the project</H2>
      <P>
        Want to know more about what DockerPlay is and who builds it? Read our{' '}
        <a href="/about/" className="text-[var(--brand-primary)] underline hover:brightness-110">
          About page
        </a>
        .
      </P>
    </LegalLayout>
  );
}
