import Link from 'next/link';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[var(--bg-page)] text-[var(--text-primary)] space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-[var(--brand-light)] text-[var(--brand-primary)] flex items-center justify-center shadow-lg">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-extrabold font-display">Page Not Found</h2>
      <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md">
        The requested chapter, mission, or tool route does not exist in the Docker Playground.
      </p>
      <Link
        href="/playground"
        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white font-bold text-xs shadow-md hover:brightness-110 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Playground</span>
      </Link>
    </div>
  );
}
