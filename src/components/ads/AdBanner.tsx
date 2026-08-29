'use client';

import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

interface AdBannerProps {
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
  label?: string;
}

export function AdBanner({
  slotId,
  format = 'auto',
  responsive = true,
  className = '',
  label = 'Advertisement',
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isLoaded = useRef(false);

  const publisherId =
    process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-0000000000000000';
  const isLiveConfigured =
    publisherId && publisherId !== 'ca-pub-0000000000000000' && slotId;

  useEffect(() => {
    if (isLiveConfigured && !isLoaded.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isLoaded.current = true;
      } catch (err) {
        console.warn('AdSense push error:', err);
      }
    }
  }, [isLiveConfigured]);

  // If AdSense is not configured with real ID yet, show clean educational placeholder in development
  if (!isLiveConfigured) {
    return (
      <div
        className={`w-full my-4 p-4 rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-subtle)]/60 text-center transition-all ${className}`}
      >
        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] font-semibold block mb-1">
          {label} (Google AdSense Slot)
        </span>
        <p className="text-xs text-[var(--text-secondary)]">
          Ad placement area. Add your <code className="font-mono text-[var(--brand-primary)] bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">NEXT_PUBLIC_ADSENSE_PUBLISHER_ID</code> to enable live ads.
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full my-4 text-center overflow-hidden ${className}`}>
      <span className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] font-mono block mb-1">
        {label}
      </span>
      <ins
        ref={adRef}
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
