'use client';

import Script from 'next/script';

interface GoogleAdSenseProps {
  publisherId?: string;
}

export function GoogleAdSense({ publisherId }: GoogleAdSenseProps) {
  // Use passed publisher ID, or environment variable, or placeholder
  const pubId =
    publisherId ||
    process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ||
    'ca-pub-0000000000000000';

  // Only load the external script if a valid publisher ID is provided (not placeholder in dev)
  if (!pubId || pubId === 'ca-pub-0000000000000000') {
    return null;
  }

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
