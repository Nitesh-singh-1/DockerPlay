import type { Metadata } from 'next';
import { LegalLayout, H2, P, UL } from '@/components/layout/LegalLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How DockerPlay handles data, cookies, local storage, and Google AdSense advertising. DockerPlay collects no personal account data and runs entirely in your browser.',
  alternates: { canonical: 'https://dockerplay.org/privacy/' },
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Your privacy matters. This page explains exactly what data DockerPlay uses, and how advertising works on this site."
      updated="October 31, 2026"
    >
      <H2>Overview</H2>
      <P>
        DockerPlay (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;the site&rdquo;) is a free, in-browser
        Docker learning playground available at dockerplay.org. We do not require you to create an
        account, and we do not ask for your name, email, or any personal identifying information to
        use the site.
      </P>

      <H2>Information we store</H2>
      <P>
        DockerPlay runs entirely in your browser. The Docker commands you type, the simulated
        containers you create, and your learning progress (XP, streaks, completed chapters) are kept
        in your browser&rsquo;s <strong>local storage</strong> on your own device. This data never
        leaves your device and is never sent to our servers &mdash; because DockerPlay is a static
        site with no backend database.
      </P>
      <P>You can clear this data at any time by clearing your browser&rsquo;s site data for dockerplay.org.</P>

      <H2>Cookies and advertising</H2>
      <P>
        DockerPlay uses <strong>Google AdSense</strong> to display advertisements, which keeps the
        site free for everyone. In connection with this:
      </P>
      <UL>
        <li>
          Third-party vendors, including Google, use cookies to serve ads based on a user&rsquo;s prior
          visits to this website and other websites.
        </li>
        <li>
          Google&rsquo;s use of advertising cookies enables it and its partners to serve ads to you
          based on your visit to DockerPlay and/or other sites on the Internet.
        </li>
        <li>
          You may opt out of personalized advertising by visiting{' '}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--brand-primary)] underline hover:brightness-110"
          >
            Google Ads Settings
          </a>
          .
        </li>
        <li>
          You can also opt out of a third-party vendor&rsquo;s use of cookies for personalized
          advertising by visiting{' '}
          <a
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--brand-primary)] underline hover:brightness-110"
          >
            aboutads.info
          </a>
          .
        </li>
      </UL>
      <P>
        For more information on how Google uses data when you use our partners&rsquo; sites or apps,
        see{' '}
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--brand-primary)] underline hover:brightness-110"
        >
          Google&rsquo;s Privacy &amp; Terms
        </a>
        .
      </P>

      <H2>Analytics</H2>
      <P>
        We may use privacy-respecting analytics to understand aggregate, anonymous traffic (for
        example, how many people visit a lesson). This never identifies you personally.
      </P>

      <H2>Children&rsquo;s privacy</H2>
      <P>
        DockerPlay is an educational tool intended for a general audience. We do not knowingly
        collect personal information from children under 13.
      </P>

      <H2>Changes to this policy</H2>
      <P>
        We may update this Privacy Policy from time to time. Any changes will be posted on this page
        with an updated revision date.
      </P>

      <H2>Contact</H2>
      <P>
        If you have any questions about this Privacy Policy, please reach us through our{' '}
        <a href="/contact/" className="text-[var(--brand-primary)] underline hover:brightness-110">
          Contact page
        </a>
        .
      </P>
    </LegalLayout>
  );
}
