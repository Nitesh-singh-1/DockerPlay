import type { Metadata } from 'next';
import { LegalLayout, H2, P, UL } from '@/components/layout/LegalLayout';

export const metadata: Metadata = {
  title: 'About DockerPlay',
  description:
    'DockerPlay is a free, in-browser Docker learning playground that lets you practice real Docker commands and visualize containers, networks, images, and compose stacks — with zero setup.',
  alternates: { canonical: 'https://dockerplay.org/about/' },
};

export default function AboutPage() {
  return (
    <LegalLayout
      title="About DockerPlay"
      subtitle="Learn Docker by doing — visually, interactively, and with zero installation."
      updated="October 31, 2026"
    >
      <H2>Why DockerPlay exists</H2>
      <P>
        Docker is one of the most valuable skills in modern software development, but getting started
        is hard. Beginners have to install Docker Desktop, fight with system requirements, and type
        commands blindly without ever <em>seeing</em> what a container, network, or image layer
        actually is. DockerPlay removes all of that friction.
      </P>
      <P>
        DockerPlay is a free, in-browser simulator inspired by the tactile clarity of
        LearnGitBranching. You type real Docker commands and instantly watch containers spin up,
        networks bridge, DNS resolve, image layers stack, and compose stacks come alive &mdash;
        entirely in your browser, with nothing to install.
      </P>

      <H2>What you can do here</H2>
      <UL>
        <li><strong>Playground</strong> &mdash; a live terminal paired with a visual topology of your containers.</li>
        <li><strong>Curriculum</strong> &mdash; 11 step-by-step chapters from your first container to production patterns.</li>
        <li><strong>Missions</strong> &mdash; hands-on challenges that check your work as you go.</li>
        <li><strong>Break/Fix</strong> &mdash; realistic incident labs where you diagnose and repair broken setups.</li>
        <li><strong>Tools</strong> &mdash; a Compose Studio, Dockerfile Studio, network tracer, and a searchable command cheat sheet.</li>
      </UL>

      <H2>Who built it</H2>
      <P>
        DockerPlay is an independent, open-source project created by Nitesh Singh. It is built with
        Next.js and React and runs as a fully static site. You can explore the source code on{' '}
        <a
          href="https://github.com/Nitesh-singh-1/DockerPlay"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--brand-primary)] underline hover:brightness-110"
        >
          GitHub
        </a>
        .
      </P>

      <H2>How it stays free</H2>
      <P>
        DockerPlay is free for everyone and is supported by unobtrusive advertising through Google
        AdSense. This lets learners anywhere in the world use the full playground without a paywall.
        See our{' '}
        <a href="/privacy/" className="text-[var(--brand-primary)] underline hover:brightness-110">
          Privacy Policy
        </a>{' '}
        for how advertising works.
      </P>

      <H2>A note on accuracy</H2>
      <P>
        DockerPlay simulates Docker&rsquo;s behavior for learning. It is not affiliated with Docker,
        Inc., and the simulated output may differ from a real Docker installation. Once you&rsquo;re
        comfortable here, you&rsquo;ll be ready to use the real thing with confidence.
      </P>
    </LegalLayout>
  );
}
