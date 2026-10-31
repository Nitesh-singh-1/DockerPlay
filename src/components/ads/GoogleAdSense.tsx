interface GoogleAdSenseProps {
  publisherId?: string;
}

// DockerPlay's live AdSense publisher ID. This is a public value (it also ships
// in /ads.txt), so it is safe to keep as the production default. An env var can
// still override it for staging/testing.
const DEFAULT_PUBLISHER_ID = 'ca-pub-3059241515168098';

export function GoogleAdSense({ publisherId }: GoogleAdSenseProps) {
  // Use passed publisher ID, or environment variable, or the live default.
  const pubId =
    publisherId ||
    process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ||
    DEFAULT_PUBLISHER_ID;

  // Guard against the old placeholder ever being used.
  if (!pubId || pubId === 'ca-pub-0000000000000000') {
    return null;
  }

  // Render a LITERAL <script> tag (not next/script) so it appears verbatim in
  // the static HTML <head>. AdSense's verification crawler scans raw HTML and
  // requires the real script tag — next/script only emits a preload hint and
  // injects the real script via JS after hydration, which the crawler misses.
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`}
      crossOrigin="anonymous"
    />
  );
}
